import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Play, Pause, Zap, Clock, Cpu, HardDrive, RotateCcw } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface ProcessControlBlock {
  pid: number;
  name: string;
  state: 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';
  priority: number;
  programCounter: number;
  cpuTime: number;
  memorySize: number;
  ioOperations: number;
  parentPid?: number;
  arrivalTime: number;
  lastStateChange: number;
  color: string;
}

const ProcessTable: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessControlBlock[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedProcess, setSelectedProcess] = useState<ProcessControlBlock | null>(null);

  const processStates = ['NEW', 'READY', 'RUNNING', 'WAITING', 'TERMINATED'] as const;
  const stateColors = {
    'NEW': '#00ff41',
    'READY': '#00ffff',
    'RUNNING': '#ffff00',
    'WAITING': '#ff6600',
    'TERMINATED': '#ff0080'
  };

  useEffect(() => {
    initializeProcesses();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
        simulateProcessExecution();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  const initializeProcesses = () => {
    const initialProcesses: ProcessControlBlock[] = [
      {
        pid: 1001,
        name: 'init',
        state: 'RUNNING',
        priority: 1,
        programCounter: 0x1000,
        cpuTime: 45,
        memorySize: 128,
        ioOperations: 0,
        arrivalTime: 0,
        lastStateChange: 0,
        color: stateColors.RUNNING
      },
      {
        pid: 1002,
        name: 'shell',
        state: 'READY',
        priority: 3,
        programCounter: 0x2000,
        cpuTime: 12,
        memorySize: 64,
        ioOperations: 2,
        parentPid: 1001,
        arrivalTime: 1,
        lastStateChange: 1,
        color: stateColors.READY
      },
      {
        pid: 1003,
        name: 'scheduler',
        state: 'RUNNING',
        priority: 1,
        programCounter: 0x3000,
        cpuTime: 8,
        memorySize: 32,
        ioOperations: 0,
        arrivalTime: 2,
        lastStateChange: 2,
        color: stateColors.RUNNING
      },
      {
        pid: 1004,
        name: 'file_mgr',
        state: 'WAITING',
        priority: 4,
        programCounter: 0x4000,
        cpuTime: 23,
        memorySize: 96,
        ioOperations: 15,
        arrivalTime: 3,
        lastStateChange: 5,
        color: stateColors.WAITING
      },
      {
        pid: 1005,
        name: 'memory_mgr',
        state: 'READY',
        priority: 2,
        programCounter: 0x5000,
        cpuTime: 34,
        memorySize: 48,
        ioOperations: 1,
        arrivalTime: 4,
        lastStateChange: 6,
        color: stateColors.READY
      },
      {
        pid: 1006,
        name: 'network_svc',
        state: 'WAITING',
        priority: 5,
        programCounter: 0x6000,
        cpuTime: 67,
        memorySize: 156,
        ioOperations: 28,
        arrivalTime: 5,
        lastStateChange: 8,
        color: stateColors.WAITING
      }
    ];

    setProcesses(initialProcesses);
    setCurrentTime(0);
  };

  const simulateProcessExecution = () => {
    setProcesses(prevProcesses => {
      return prevProcesses.map(process => {
        const newProcess = { ...process };
        
        // Simulate state transitions
        const random = Math.random();
        const timeSinceLastChange = currentTime - process.lastStateChange;
        
        switch (process.state) {
          case 'NEW':
            if (timeSinceLastChange > 2) {
              newProcess.state = 'READY';
              newProcess.lastStateChange = currentTime;
              newProcess.color = stateColors.READY;
            }
            break;
            
          case 'READY':
            if (random < 0.3 && timeSinceLastChange > 1) {
              newProcess.state = 'RUNNING';
              newProcess.lastStateChange = currentTime;
              newProcess.color = stateColors.RUNNING;
            }
            break;
            
          case 'RUNNING':
            newProcess.cpuTime += 1;
            newProcess.programCounter += Math.floor(Math.random() * 16) + 1;
            
            if (random < 0.2 && timeSinceLastChange > 3) {
              newProcess.state = 'WAITING';
              newProcess.lastStateChange = currentTime;
              newProcess.ioOperations += 1;
              newProcess.color = stateColors.WAITING;
            } else if (random < 0.1 && timeSinceLastChange > 5) {
              newProcess.state = 'READY';
              newProcess.lastStateChange = currentTime;
              newProcess.color = stateColors.READY;
            }
            break;
            
          case 'WAITING':
            if (random < 0.4 && timeSinceLastChange > 2) {
              newProcess.state = 'READY';
              newProcess.lastStateChange = currentTime;
              newProcess.color = stateColors.READY;
            } else if (random < 0.05 && process.name !== 'init' && process.name !== 'scheduler') {
              newProcess.state = 'TERMINATED';
              newProcess.lastStateChange = currentTime;
              newProcess.color = stateColors.TERMINATED;
            }
            break;
            
          case 'TERMINATED':
            // Process remains terminated
            break;
        }

        return newProcess;
      });
    });
  };

  const createNewProcess = () => {
    const newPid = Math.max(...processes.map(p => p.pid)) + 1;
    const processNames = ['editor', 'compiler', 'debugger', 'browser', 'terminal', 'calculator', 'monitor'];
    const randomName = processNames[Math.floor(Math.random() * processNames.length)];
    
    soundEffects.playSuccess();
    
    const newProcess: ProcessControlBlock = {
      pid: newPid,
      name: randomName,
      state: 'NEW',
      priority: Math.floor(Math.random() * 5) + 1,
      programCounter: 0x7000 + (newPid * 0x1000),
      cpuTime: 0,
      memorySize: Math.floor(Math.random() * 128) + 32,
      ioOperations: 0,
      parentPid: 1001,
      arrivalTime: currentTime,
      lastStateChange: currentTime,
      color: stateColors.NEW
    };

    setProcesses(prev => [...prev, newProcess]);
  };

  const killProcess = (pid: number) => {
    if (pid === 1001 || pid === 1003) return; // Protect system processes
    
    setProcesses(prev => 
      prev.map(process => 
        process.pid === pid
          ? { ...process, state: 'TERMINATED' as const, lastStateChange: currentTime, color: stateColors.TERMINATED }
          : process
      )
    );
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'NEW': return '🆕';
      case 'READY': return '⏳';
      case 'RUNNING': return '⚡';
      case 'WAITING': return '⏸️';
      case 'TERMINATED': return '💀';
      default: return '❓';
    }
  };

  const getProcessStats = () => {
    const stats = processes.reduce((acc, process) => {
      acc[process.state] = (acc[process.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  const stats = getProcessStats();

  return (
    <motion.div
      className="process-table min-h-screen bg-black text-green-400 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="header mb-8">
        <h1 className="text-4xl font-retro text-green-400 mb-4">
          PROCESS CONTROL BLOCKS
        </h1>
        <div className="text-cyan-400 font-mono">
          Real-time process monitoring and state management
        </div>
      </div>

      {/* System Controls */}
      <div className="controls mb-8 flex flex-wrap gap-4 items-center">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`retro-btn flex items-center gap-2 ${
            isRunning ? 'bg-red-400 text-black' : 'bg-green-400 text-black'
          }`}
          onMouseEnter={() => soundEffects.playButtonClick()}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'PAUSE_SYSTEM' : 'START_SYSTEM'}
        </button>
        
        <button
          onClick={createNewProcess}
          className="retro-btn flex items-center gap-2 bg-cyan-400 text-black"
          onMouseEnter={() => soundEffects.playButtonClick()}
        >
          <Zap className="w-4 h-4" />
          SPAWN_PROCESS
        </button>

        <button
          onClick={initializeProcesses}
          className="retro-btn flex items-center gap-2"
          onMouseEnter={() => soundEffects.playButtonClick()}
        >
          <RotateCcw className="w-4 h-4" />
          RESET_SYSTEM
        </button>

        <div className="flex items-center gap-4 text-sm font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">System Time: {currentTime}s</span>
          </div>
          <div className={`px-2 py-1 border ${
            isRunning ? 'border-green-400 text-green-400' : 'border-red-400 text-red-400'
          }`}>
            {isRunning ? 'SYSTEM_ACTIVE' : 'SYSTEM_HALTED'}
          </div>
        </div>
      </div>

      {/* Process Statistics */}
      <div className="stats-panel mb-8">
        <h3 className="text-lg font-retro text-cyan-400 mb-4">SYSTEM_STATISTICS:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {processStates.map(state => (
            <div key={state} className="retro-card text-center">
              <div className="text-2xl mb-2">{getStateIcon(state)}</div>
              <div className="font-retro text-sm" style={{ color: stateColors[state] }}>
                {state}
              </div>
              <div className="font-mono text-xl text-green-400">
                {stats[state] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Process Table */}
      <div className="process-table-container mb-8">
        <h3 className="text-lg font-retro text-cyan-400 mb-4">PROCESS_CONTROL_BLOCKS:</h3>
        <div className="terminal-window">
          <div className="terminal-header">
            <List className="w-4 h-4" />
            Active Process Table - {processes.length} processes
          </div>
          <div className="terminal-body overflow-x-auto">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="border-b border-green-400">
                  <th className="text-left p-3">PID</th>
                  <th className="text-left p-3">NAME</th>
                  <th className="text-left p-3">STATE</th>
                  <th className="text-left p-3">PRIORITY</th>
                  <th className="text-left p-3">PC</th>
                  <th className="text-left p-3">CPU_TIME</th>
                  <th className="text-left p-3">MEMORY</th>
                  <th className="text-left p-3">I/O</th>
                  <th className="text-left p-3">PPID</th>
                  <th className="text-left p-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {processes.map((process) => (
                    <motion.tr
                      key={process.pid}
                      className="border-b border-gray-700 cursor-pointer hover:bg-gray-900"
                      onClick={() => setSelectedProcess(process)}
                      animate={{
                        backgroundColor: process.state === 'RUNNING' ? 'rgba(255, 255, 0, 0.1)' :
                                       process.state === 'TERMINATED' ? 'rgba(255, 0, 128, 0.1)' :
                                       'transparent'
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="p-3 text-cyan-400 font-bold">{process.pid}</td>
                      <td className="p-3">{process.name}</td>
                      <td className="p-3">
                        <motion.span
                          className={`px-2 py-1 rounded border font-bold`}
                          style={{ 
                            borderColor: process.color,
                            color: process.color,
                            backgroundColor: `${process.color}20`
                          }}
                          animate={{
                            boxShadow: process.state === 'RUNNING' ? `0 0 10px ${process.color}` : 'none'
                          }}
                        >
                          {getStateIcon(process.state)} {process.state}
                        </motion.span>
                      </td>
                      <td className="p-3">{process.priority}</td>
                      <td className="p-3 text-yellow-400">0x{process.programCounter.toString(16).toUpperCase()}</td>
                      <td className="p-3">{process.cpuTime}s</td>
                      <td className="p-3">{process.memorySize}KB</td>
                      <td className="p-3">{process.ioOperations}</td>
                      <td className="p-3 text-gray-400">{process.parentPid || '-'}</td>
                      <td className="p-3">
                        {process.name !== 'init' && process.name !== 'scheduler' && process.state !== 'TERMINATED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              killProcess(process.pid);
                            }}
                            className="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400 hover:bg-red-400 hover:text-black transition-all"
                          >
                            KILL
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CPU Utilization */}
        <div className="cpu-monitor">
          <h3 className="text-lg font-retro text-cyan-400 mb-4">CPU_UTILIZATION:</h3>
          <div className="retro-card">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-green-400" />
              <span className="font-mono">Real-time CPU Usage</span>
            </div>
            
            {/* CPU Cores */}
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => {
                const runningProcesses = processes.filter(p => p.state === 'RUNNING');
                const coreUsage = runningProcesses.length > i ? 
                  Math.min(100, (runningProcesses[i]?.cpuTime || 0) * 2) : 0;
                
                return (
                  <div key={i} className="core-monitor">
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Core {i}</span>
                      <span>{coreUsage.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar bg-gray-800 h-3 border border-green-400">
                      <motion.div
                        className="bg-green-400 h-full"
                        style={{ 
                          backgroundColor: coreUsage > 80 ? '#ff0080' : coreUsage > 60 ? '#ffff00' : '#00ff41'
                        }}
                        animate={{ width: `${coreUsage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="memory-monitor">
          <h3 className="text-lg font-retro text-cyan-400 mb-4">MEMORY_USAGE:</h3>
          <div className="retro-card">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              <span className="font-mono">System Memory</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span>Total Memory Usage</span>
                  <span>{processes.reduce((sum, p) => sum + p.memorySize, 0)} KB</span>
                </div>
                <div className="progress-bar bg-gray-800 h-4 border border-cyan-400">
                  <motion.div
                    className="bg-cyan-400 h-full"
                    animate={{ 
                      width: `${Math.min(100, (processes.reduce((sum, p) => sum + p.memorySize, 0) / 2048) * 100)}%` 
                    }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="text-cyan-400">Available:</div>
                  <div className="text-green-400">
                    {2048 - processes.reduce((sum, p) => sum + p.memorySize, 0)} KB
                  </div>
                </div>
                <div>
                  <div className="text-cyan-400">Used:</div>
                  <div className="text-green-400">
                    {processes.reduce((sum, p) => sum + p.memorySize, 0)} KB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Details Modal */}
      <AnimatePresence>
        {selectedProcess && (
          <motion.div
            className="process-details-modal fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProcess(null)}
          >
            <motion.div
              className="retro-card w-full max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: selectedProcess.color }}
                />
                <h3 className="font-retro text-lg text-green-400">
                  PROCESS_DETAILS
                </h3>
              </div>
              
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-cyan-400">Process ID:</span>
                  <span className="text-green-400">{selectedProcess.pid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Name:</span>
                  <span className="text-green-400">{selectedProcess.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Current State:</span>
                  <span style={{ color: selectedProcess.color }}>
                    {selectedProcess.state}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Priority:</span>
                  <span className="text-green-400">{selectedProcess.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Program Counter:</span>
                  <span className="text-yellow-400">0x{selectedProcess.programCounter.toString(16).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">CPU Time:</span>
                  <span className="text-green-400">{selectedProcess.cpuTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Memory Size:</span>
                  <span className="text-green-400">{selectedProcess.memorySize} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">I/O Operations:</span>
                  <span className="text-green-400">{selectedProcess.ioOperations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Parent PID:</span>
                  <span className="text-gray-400">{selectedProcess.parentPid || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Arrival Time:</span>
                  <span className="text-green-400">{selectedProcess.arrivalTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-400">Last State Change:</span>
                  <span className="text-green-400">{selectedProcess.lastStateChange}s</span>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setSelectedProcess(null)}
                  className="retro-btn bg-green-400 text-black"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProcessTable;