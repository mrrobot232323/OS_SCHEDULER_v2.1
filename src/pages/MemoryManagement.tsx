import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, Zap, Grid3X3, Layers, RotateCcw, Play } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface MemoryBlock {
  id: number;
  allocated: boolean;
  processId?: number;
  processName?: string;
  color?: string;
  size: number;
}

interface MemoryPage {
  pageNumber: number;
  frameNumber?: number;
  valid: boolean;
  referenced: boolean;
  modified: boolean;
  processId: number;
}

const MemoryManagement: React.FC = () => {
  const [selectedTechnique, setSelectedTechnique] = useState('Paging');
  const [isSimulating, setIsSimulating] = useState(false);
  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([]);
  const [pageTable, setPageTable] = useState<MemoryPage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [memorySize] = useState(256); // 256 blocks for visualization

  const techniques = [
    { name: 'Paging', description: 'Fixed-size memory pages', icon: Grid3X3 },
    { name: 'Segmentation', description: 'Variable-size memory segments', icon: Layers },
    { name: 'Virtual Memory', description: 'Page replacement algorithms', icon: HardDrive },
    { name: 'Swapping', description: 'Process swapping mechanism', icon: Zap }
  ];

  const processes = [
    { id: 1, name: 'P1', size: 32, color: '#00ff41' },
    { id: 2, name: 'P2', size: 64, color: '#00ffff' },
    { id: 3, name: 'P3', size: 48, color: '#ff0080' },
    { id: 4, name: 'P4', size: 24, color: '#ffff00' },
    { id: 5, name: 'P5', size: 40, color: '#ff6600' }
  ];

  useEffect(() => {
    initializeMemory();
  }, [selectedTechnique]);

  const initializeMemory = () => {
    const blocks: MemoryBlock[] = Array.from({ length: memorySize }, (_, i) => ({
      id: i,
      allocated: false,
      size: selectedTechnique === 'Paging' ? 4 : Math.random() > 0.8 ? 8 : 4
    }));

    setMemoryBlocks(blocks);
    
    // Initialize page table for paging
    if (selectedTechnique === 'Paging' || selectedTechnique === 'Virtual Memory') {
      const pages: MemoryPage[] = Array.from({ length: 64 }, (_, i) => ({
        pageNumber: i,
        valid: false,
        referenced: false,
        modified: false,
        processId: Math.floor(i / 16) + 1
      }));
      setPageTable(pages);
    }

    setCurrentStep(0);
  };

  const simulateAllocation = () => {
    if (isSimulating) return;
    
    soundEffects.playButtonClick();
    setIsSimulating(true);
    let step = 0;
    
    const allocateNext = () => {
      if (step >= processes.length) {
        setIsSimulating(false);
        return;
      }

      const process = processes[step];
      allocateMemory(process);
      setCurrentStep(step);
      step++;
      
      setTimeout(allocateNext, 1500);
    };

    allocateNext();
  };

  const allocateMemory = (process: { id: number; name: string; size: number; color: string }) => {
    setMemoryBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      
      switch (selectedTechnique) {
        case 'Paging':
          // Allocate pages (4 blocks per page)
          const pagesNeeded = Math.ceil(process.size / 4);
          let allocatedPages = 0;
          
          for (let i = 0; i < newBlocks.length && allocatedPages < pagesNeeded; i += 4) {
            const pageBlocks = newBlocks.slice(i, i + 4);
            if (pageBlocks.every(block => !block.allocated)) {
              pageBlocks.forEach(block => {
                block.allocated = true;
                block.processId = process.id;
                block.processName = process.name;
                block.color = process.color;
              });
              allocatedPages++;
            }
          }
          break;

        case 'Segmentation':
          // First fit allocation for variable-size segments
          let allocated = false;
          let consecutiveBlocks = 0;
          let startIndex = -1;
          
          for (let i = 0; i < newBlocks.length; i++) {
            if (!newBlocks[i].allocated) {
              if (startIndex === -1) startIndex = i;
              consecutiveBlocks++;
              
              if (consecutiveBlocks >= process.size) {
                for (let j = startIndex; j < startIndex + process.size; j++) {
                  newBlocks[j].allocated = true;
                  newBlocks[j].processId = process.id;
                  newBlocks[j].processName = process.name;
                  newBlocks[j].color = process.color;
                }
                allocated = true;
                break;
              }
            } else {
              consecutiveBlocks = 0;
              startIndex = -1;
            }
          }
          break;

        case 'Virtual Memory':
          // Simulate page replacement (LRU)
          const pagesToAllocate = Math.ceil(process.size / 4);
          let allocatedVirtualPages = 0;
          
          for (let i = 0; i < newBlocks.length && allocatedVirtualPages < pagesToAllocate; i += 4) {
            const pageBlocks = newBlocks.slice(i, i + 4);
            
            // Check if page is available or can be swapped out
            if (pageBlocks.every(block => !block.allocated) || Math.random() > 0.7) {
              pageBlocks.forEach(block => {
                block.allocated = true;
                block.processId = process.id;
                block.processName = process.name;
                block.color = process.color;
              });
              allocatedVirtualPages++;
            }
          }
          break;

        case 'Swapping':
          // Swap out old processes and allocate new ones
          if (Math.random() > 0.3) {
            // Swap out a random process
            const processesToSwap = newBlocks.filter(block => block.allocated && block.processId !== process.id);
            if (processesToSwap.length > 0) {
              const swapProcess = processesToSwap[Math.floor(Math.random() * processesToSwap.length)];
              newBlocks.forEach(block => {
                if (block.processId === swapProcess.processId) {
                  block.allocated = false;
                  delete block.processId;
                  delete block.processName;
                  delete block.color;
                }
              });
            }
          }
          
          // Allocate new process
          let swapAllocated = false;
          let swapConsecutive = 0;
          let swapStart = -1;
          
          for (let i = 0; i < newBlocks.length; i++) {
            if (!newBlocks[i].allocated) {
              if (swapStart === -1) swapStart = i;
              swapConsecutive++;
              
              if (swapConsecutive >= process.size) {
                for (let j = swapStart; j < swapStart + process.size; j++) {
                  newBlocks[j].allocated = true;
                  newBlocks[j].processId = process.id;
                  newBlocks[j].processName = process.name;
                  newBlocks[j].color = process.color;
                }
                swapAllocated = true;
                break;
              }
            } else {
              swapConsecutive = 0;
              swapStart = -1;
            }
          }
          break;
      }
      
      return newBlocks;
    });

    // Update page table if using paging techniques
    if (selectedTechnique === 'Paging' || selectedTechnique === 'Virtual Memory') {
      setPageTable(prevTable => 
        prevTable.map(page => 
          page.processId === process.id
            ? { ...page, valid: true, referenced: true }
            : page
        )
      );
    }
  };

  const resetMemory = () => {
    soundEffects.playButtonClick();
    setIsSimulating(false);
    initializeMemory();
  };

  const getMemoryUtilization = () => {
    const allocatedBlocks = memoryBlocks.filter(block => block.allocated).length;
    return (allocatedBlocks / memoryBlocks.length) * 100;
  };

  const getFragmentation = () => {
    let freeBlocks = 0;
    let largestFreeBlock = 0;
    let currentFreeBlock = 0;

    memoryBlocks.forEach(block => {
      if (!block.allocated) {
        freeBlocks++;
        currentFreeBlock++;
        largestFreeBlock = Math.max(largestFreeBlock, currentFreeBlock);
      } else {
        currentFreeBlock = 0;
      }
    });

    return freeBlocks > 0 ? ((freeBlocks - largestFreeBlock) / freeBlocks) * 100 : 0;
  };

  return (
    <motion.div
      className="memory-management min-h-screen bg-black text-green-400 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="header mb-8">
        <h1 className="text-4xl font-retro text-green-400 mb-4">
          MEMORY MANAGEMENT SYSTEM
        </h1>
        <div className="text-cyan-400 font-mono">
          Interactive visualization of memory allocation techniques
        </div>
      </div>

      {/* Technique Selection */}
      <div className="technique-selector mb-8">
        <h2 className="text-xl font-retro text-cyan-400 mb-4">SELECT_TECHNIQUE:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techniques.map((technique) => {
            const IconComponent = technique.icon;
            return (
              <button
                key={technique.name}
                onClick={() => setSelectedTechnique(technique.name)}
                className={`retro-btn ${selectedTechnique === technique.name ? 'bg-green-400 text-black' : ''} p-3 sm:p-4`}
              >
                <div className="flex flex-col items-center gap-2">
                  <IconComponent className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-retro text-xs sm:text-sm">{technique.name}</div>
                    <div className="font-mono text-xs mt-1 hidden sm:block">{technique.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="controls mb-8 flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
        <button
          onClick={simulateAllocation}
          disabled={isSimulating}
          className="retro-btn flex items-center gap-2 bg-green-400 text-black disabled:opacity-50 justify-center"
        >
          <Play className="w-4 h-4" />
          <span className="hidden sm:inline">SIMULATE_ALLOCATION</span>
          <span className="sm:hidden">SIMULATE</span>
        </button>
        
        <button
          onClick={resetMemory}
          className="retro-btn flex items-center gap-2 justify-center"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">CLEAR_MEMORY</span>
          <span className="sm:hidden">CLEAR</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm font-mono">
          <div>
            <span className="text-cyan-400">Utilization:</span>
            <span className="text-yellow-400 ml-2">{getMemoryUtilization().toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-cyan-400">Fragmentation:</span>
            <span className="text-red-400 ml-2">{getFragmentation().toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Main Memory Grid */}
      <div className="memory-visualization mb-8">
        <h3 className="text-lg font-retro text-cyan-400 mb-4">PHYSICAL_MEMORY_LAYOUT:</h3>
        <div className="terminal-window">
          <div className="terminal-header">
            <HardDrive className="w-4 h-4" />
            <span className="hidden sm:inline">Memory Blocks ({memorySize} blocks × 4KB)</span>
            <span className="sm:hidden">Memory ({memorySize} blocks)</span>
          </div>
          <div className="terminal-body">
            <div className="memory-grid grid grid-cols-12 sm:grid-cols-16 gap-1 p-2 sm:p-4">
              {memoryBlocks.map((block) => (
                <motion.div
                  key={block.id}
                  className={`memory-block aspect-square border transition-all duration-300 cursor-pointer min-w-[15px] min-h-[15px] sm:min-w-[20px] sm:min-h-[20px]`}
                  style={{
                    backgroundColor: block.allocated ? block.color : '#1a1a1a',
                    borderColor: block.allocated ? block.color : '#00ff41'
                  }}
                  animate={{
                    scale: block.allocated ? 1.05 : 1,
                    boxShadow: block.allocated ? `0 0 10px ${block.color}` : '0 0 2px #00ff41'
                  }}
                  whileHover={{ scale: 1.1 }}
                  title={block.allocated ? `${block.processName} - Block ${block.id}` : `Free Block ${block.id}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Process Queue */}
        <div className="process-queue">
          <h3 className="text-lg font-retro text-cyan-400 mb-4">PROCESS_QUEUE:</h3>
          <div className="terminal-window">
            <div className="terminal-body">
              {processes.map((process, index) => (
                <motion.div
                  key={process.id}
                  className={`process-item border-2 p-4 mb-2 flex items-center justify-between ${
                    index === currentStep ? 'border-yellow-400 bg-yellow-400 bg-opacity-20' :
                    index < currentStep ? 'border-green-400' : 'border-gray-600'
                  }`}
                  animate={{
                    borderColor: index === currentStep ? '#ffff00' :
                                index < currentStep ? '#00ff41' : '#666',
                    backgroundColor: index === currentStep ? 'rgba(255, 255, 0, 0.1)' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: process.color }}
                    />
                    <div>
                      <div className="font-retro text-sm">{process.name}</div>
                      <div className="font-mono text-xs text-gray-400">Size: {process.size} blocks</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs">
                    {index < currentStep ? 'ALLOCATED' :
                     index === currentStep ? 'ALLOCATING...' : 'WAITING'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Page Table (for Paging and Virtual Memory) */}
        {(selectedTechnique === 'Paging' || selectedTechnique === 'Virtual Memory') && (
          <div className="page-table">
            <h3 className="text-lg font-retro text-cyan-400 mb-4">PAGE_TABLE:</h3>
            <div className="terminal-window">
              <div className="terminal-body overflow-y-auto max-h-96">
                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="border-b border-green-400">
                      <th className="text-left p-1">Page#</th>
                      <th className="text-left p-1">Frame#</th>
                      <th className="text-left p-1">Valid</th>
                      <th className="text-left p-1">Ref</th>
                      <th className="text-left p-1">Mod</th>
                      <th className="text-left p-1">Process</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageTable.slice(0, 32).map((page) => (
                      <tr key={page.pageNumber} className="border-b border-gray-700">
                        <td className="p-1">{page.pageNumber.toString().padStart(2, '0')}</td>
                        <td className="p-1">{page.frameNumber || '-'}</td>
                        <td className="p-1">
                          <span className={`px-1 ${page.valid ? 'text-green-400' : 'text-red-400'}`}>
                            {page.valid ? '1' : '0'}
                          </span>
                        </td>
                        <td className="p-1">
                          <span className={page.referenced ? 'text-yellow-400' : 'text-gray-600'}>
                            {page.referenced ? '1' : '0'}
                          </span>
                        </td>
                        <td className="p-1">
                          <span className={page.modified ? 'text-cyan-400' : 'text-gray-600'}>
                            {page.modified ? '1' : '0'}
                          </span>
                        </td>
                        <td className="p-1">P{page.processId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Memory Statistics */}
        <div className="memory-stats">
          <h3 className="text-lg font-retro text-cyan-400 mb-4">MEMORY_STATISTICS:</h3>
          <div className="space-y-4">
            <div className="retro-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm">Memory Utilization</span>
                <span className="font-retro text-green-400">{getMemoryUtilization().toFixed(1)}%</span>
              </div>
              <div className="progress-bar bg-gray-800 h-4 border border-green-400">
                <motion.div
                  className="bg-green-400 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getMemoryUtilization()}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            <div className="retro-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm">External Fragmentation</span>
                <span className="font-retro text-red-400">{getFragmentation().toFixed(1)}%</span>
              </div>
              <div className="progress-bar bg-gray-800 h-4 border border-red-400">
                <motion.div
                  className="bg-red-400 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getFragmentation()}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <div className="text-cyan-400">Total Blocks:</div>
                <div className="text-green-400">{memorySize}</div>
              </div>
              <div>
                <div className="text-cyan-400">Free Blocks:</div>
                <div className="text-green-400">{memoryBlocks.filter(b => !b.allocated).length}</div>
              </div>
              <div>
                <div className="text-cyan-400">Allocated:</div>
                <div className="text-green-400">{memoryBlocks.filter(b => b.allocated).length}</div>
              </div>
              <div>
                <div className="text-cyan-400">Block Size:</div>
                <div className="text-green-400">4KB</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Allocation Animation */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div
            className="allocation-indicator fixed bottom-20 left-8 bg-gray-900 border-2 border-yellow-400 p-4"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <div className="font-retro text-yellow-400 mb-2">ALLOCATING_MEMORY:</div>
            <div className="font-mono text-sm">
              <div>Technique: {selectedTechnique}</div>
              <div>Process: {processes[currentStep]?.name}</div>
              <div>Size: {processes[currentStep]?.size} blocks</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MemoryManagement;