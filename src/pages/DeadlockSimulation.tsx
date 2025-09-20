import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Skull, Zap, RotateCcw, Play, Pause, Info, Shield, Eye } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface Resource {
  id: number;
  name: string;
  type: 'CPU' | 'MEMORY' | 'DISK' | 'PRINTER';
  allocated: boolean;
  allocatedTo?: number;
  color: string;
  instances: number;
  availableInstances: number;
}

interface Process {
  id: number;
  name: string;
  resources: number[];
  waiting: number[];
  color: string;
  state: 'RUNNING' | 'WAITING' | 'BLOCKED';
  maxNeed: { [resourceId: number]: number };
  currentAllocation: { [resourceId: number]: number };
}

interface DeadlockStep {
  step: number;
  description: string;
  processId?: number;
  resourceId?: number;
  action: 'REQUEST' | 'ALLOCATE' | 'WAIT' | 'DEADLOCK_DETECTED';
}

const DeadlockSimulation: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [deadlockDetected, setDeadlockDetected] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [virusAlert, setVirusAlert] = useState(false);
  const [simulationSteps, setSimulationSteps] = useState<DeadlockStep[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<'DETECTION' | 'AVOIDANCE' | 'PREVENTION'>('DETECTION');
  const [bankerAlgorithm, setBankerAlgorithm] = useState(false);
  const [safeSequence, setSafeSequence] = useState<number[]>([]);

  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSimulation();
  }, []);

  const initializeSimulation = () => {
    const initialResources: Resource[] = [
      { id: 1, name: 'CPU_CORE_1', type: 'CPU', allocated: false, color: '#00ff41', instances: 2, availableInstances: 2 },
      { id: 2, name: 'MEMORY_BANK_A', type: 'MEMORY', allocated: false, color: '#00ffff', instances: 3, availableInstances: 3 },
      { id: 3, name: 'DISK_DRIVE_1', type: 'DISK', allocated: false, color: '#ff0080', instances: 1, availableInstances: 1 },
      { id: 4, name: 'PRINTER_LASER', type: 'PRINTER', allocated: false, color: '#ffff00', instances: 1, availableInstances: 1 }
    ];

    const initialProcesses: Process[] = [
      {
        id: 101,
        name: 'PROC_ALPHA',
        resources: [],
        waiting: [],
        color: '#00ff41',
        state: 'RUNNING',
        maxNeed: { 1: 2, 2: 1, 3: 1, 4: 0 },
        currentAllocation: { 1: 0, 2: 0, 3: 0, 4: 0 }
      },
      {
        id: 102,
        name: 'PROC_BETA',
        resources: [],
        waiting: [],
        color: '#00ffff',
        state: 'RUNNING',
        maxNeed: { 1: 1, 2: 2, 3: 0, 4: 1 },
        currentAllocation: { 1: 0, 2: 0, 3: 0, 4: 0 }
      },
      {
        id: 103,
        name: 'PROC_GAMMA',
        resources: [],
        waiting: [],
        color: '#ff0080',
        state: 'RUNNING',
        maxNeed: { 1: 1, 2: 1, 3: 1, 4: 0 },
        currentAllocation: { 1: 0, 2: 0, 3: 0, 4: 0 }
      },
      {
        id: 104,
        name: 'PROC_DELTA',
        resources: [],
        waiting: [],
        color: '#ffff00',
        state: 'RUNNING',
        maxNeed: { 1: 0, 2: 1, 3: 0, 4: 1 },
        currentAllocation: { 1: 0, 2: 0, 3: 0, 4: 0 }
      }
    ];

    setResources(initialResources);
    setProcesses(initialProcesses);
    setDeadlockDetected(false);
    setVirusAlert(false);
    setCurrentStep(0);
    setBankerAlgorithm(false);
    setSafeSequence([]);
    setSimulationSteps([]);
    setSimulationLog(['> SYSTEM INITIALIZED', '> DEADLOCK DETECTION MODULE ACTIVE']);
  };

  const addLogEntry = (message: string) => {
    setSimulationLog(prev => [...prev.slice(-10), `> ${message}`]);
  };

  const allocateResource = (processId: number, resourceId: number, instances: number = 1) => {
    setResources(prev => 
      prev.map(resource => 
        resource.id === resourceId
          ? { 
              ...resource, 
              allocated: resource.availableInstances <= instances,
              allocatedTo: processId,
              availableInstances: Math.max(0, resource.availableInstances - instances)
            }
          : resource
      )
    );

    setProcesses(prev => 
      prev.map(process => 
        process.id === processId
          ? { 
              ...process, 
              resources: [...process.resources, resourceId],
              currentAllocation: {
                ...process.currentAllocation,
                [resourceId]: (process.currentAllocation[resourceId] || 0) + instances
              }
            }
          : process
      )
    );

    const process = processes.find(p => p.id === processId);
    const resource = resources.find(r => r.id === resourceId);
    addLogEntry(`${process?.name} ACQUIRED ${instances} INSTANCE(S) OF ${resource?.name}`);
  };

  const requestResource = (processId: number, resourceId: number, instances: number = 1) => {
    const resource = resources.find(r => r.id === resourceId);
    
    if (!resource || resource.availableInstances < instances) {
      setProcesses(prev => 
        prev.map(process => 
          process.id === processId
            ? { 
                ...process, 
                waiting: [...process.waiting, resourceId],
                state: 'WAITING'
              }
            : process
        )
      );

      const process = processes.find(p => p.id === processId);
      addLogEntry(`${process?.name} WAITING FOR ${instances} INSTANCE(S) OF ${resource?.name}`);
    } else {
      allocateResource(processId, resourceId, instances);
    }
  };

  const detectDeadlock = (): boolean => {
    // Simplified deadlock detection using cycle detection in resource allocation graph
    const graph: { [key: number]: number[] } = {};
    
    // Build resource allocation graph
    processes.forEach(process => {
      graph[process.id] = [];
      process.waiting.forEach(resourceId => {
        const resource = resources.find(r => r.id === resourceId);
        if (resource?.allocatedTo && resource.allocatedTo !== process.id) {
          graph[process.id].push(resource.allocatedTo);
        }
      });
    });

    // Check for cycles using DFS
    const visited = new Set<number>();
    const recStack = new Set<number>();

    const hasCycle = (node: number): boolean => {
      visited.add(node);
      recStack.add(node);

      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const processId of Object.keys(graph).map(Number)) {
      if (!visited.has(processId)) {
        if (hasCycle(processId)) return true;
      }
    }

    return false;
  };

  const runBankerAlgorithm = (): { safe: boolean; sequence: number[] } => {
    const available = resources.map(r => r.availableInstances);
    const allocation = processes.map(p => resources.map(r => p.currentAllocation[r.id] || 0));
    const max = processes.map(p => resources.map(r => p.maxNeed[r.id] || 0));
    const need = max.map((maxRow, i) => maxRow.map((maxVal, j) => maxVal - allocation[i][j]));
    
    const work = [...available];
    const finish = new Array(processes.length).fill(false);
    const safeSeq: number[] = [];
    
    let found = true;
    while (found && safeSeq.length < processes.length) {
      found = false;
      
      for (let i = 0; i < processes.length; i++) {
        if (!finish[i]) {
          let canAllocate = true;
          for (let j = 0; j < resources.length; j++) {
            if (need[i][j] > work[j]) {
              canAllocate = false;
              break;
            }
          }
          
          if (canAllocate) {
            for (let j = 0; j < resources.length; j++) {
              work[j] += allocation[i][j];
            }
            finish[i] = true;
            safeSeq.push(processes[i].id);
            found = true;
            break;
          }
        }
      }
    }
    
    return { safe: safeSeq.length === processes.length, sequence: safeSeq };
  };

  const simulateDeadlockScenario = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    let step = 0;

    const scenarios: DeadlockStep[] = [
      { step: 1, description: 'ALPHA requests CPU_CORE_1', processId: 101, resourceId: 1, action: 'REQUEST' },
      { step: 2, description: 'BETA requests MEMORY_BANK_A', processId: 102, resourceId: 2, action: 'REQUEST' },
      { step: 3, description: 'GAMMA requests DISK_DRIVE_1', processId: 103, resourceId: 3, action: 'REQUEST' },
      { step: 4, description: 'DELTA requests PRINTER_LASER', processId: 104, resourceId: 4, action: 'REQUEST' },
      { step: 5, description: 'ALPHA requests MEMORY_BANK_A (held by BETA)', processId: 101, resourceId: 2, action: 'WAIT' },
      { step: 6, description: 'BETA requests DISK_DRIVE_1 (held by GAMMA)', processId: 102, resourceId: 3, action: 'WAIT' },
      { step: 7, description: 'GAMMA requests PRINTER_LASER (held by DELTA)', processId: 103, resourceId: 4, action: 'WAIT' },
      { step: 8, description: 'DELTA requests CPU_CORE_1 (held by ALPHA)', processId: 104, resourceId: 1, action: 'WAIT' },
      { step: 9, description: 'DEADLOCK DETECTED - CIRCULAR WAIT!', action: 'DEADLOCK_DETECTED' }
    ];

    setSimulationSteps(scenarios);

    const executeStep = () => {
      if (step < scenarios.length) {
        const currentScenario = scenarios[step];
        
        switch (currentScenario.action) {
          case 'REQUEST':
          case 'ALLOCATE':
            if (currentScenario.processId && currentScenario.resourceId) {
              allocateResource(currentScenario.processId, currentScenario.resourceId);
            }
            break;
          case 'WAIT':
            if (currentScenario.processId && currentScenario.resourceId) {
              requestResource(currentScenario.processId, currentScenario.resourceId);
            }
            break;
          case 'DEADLOCK_DETECTED':
            if (selectedStrategy === 'AVOIDANCE') {
              const bankerResult = runBankerAlgorithm();
              setBankerAlgorithm(true);
              setSafeSequence(bankerResult.sequence);
              
              if (!bankerResult.safe) {
                setDeadlockDetected(true);
                setVirusAlert(true);
                addLogEntry('🚨 BANKER\'S ALGORITHM: UNSAFE STATE DETECTED!');
              } else {
                addLogEntry(`✅ BANKER'S ALGORITHM: SAFE SEQUENCE FOUND: ${bankerResult.sequence.join(' → ')}`);
              }
            } else {
              setDeadlockDetected(true);
              setVirusAlert(true);
              soundEffects.playDeadlockAlert();
              addLogEntry('⚠️ DEADLOCK DETECTED! SYSTEM COMPROMISED!');
            }
            break;
        }
        
        addLogEntry(`STEP ${currentScenario.step}: ${currentScenario.description}`);
        setCurrentStep(step + 1);
        
        setTimeout(() => {
          if (currentScenario.action === 'DEADLOCK_DETECTED') {
            setIsSimulating(false);
          } else {
            step++;
            if (step < scenarios.length) {
              setTimeout(executeStep, 2000);
            } else {
              setIsSimulating(false);
            }
          }
        }, 1000);
      }
    };

    executeStep();
  };

  const resetSystem = () => {
    setIsSimulating(false);
    setDeadlockDetected(false);
    setVirusAlert(false);
    setBankerAlgorithm(false);
    setSafeSequence([]);
    initializeSimulation();
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'CPU': return '🖥️';
      case 'MEMORY': return '💾';
      case 'DISK': return '💿';
      case 'PRINTER': return '🖨️';
      default: return '📦';
    }
  };

  const strategies = [
    {
      name: 'DETECTION',
      title: 'Deadlock Detection',
      description: 'Allow deadlocks to occur, then detect and recover from them.',
      icon: Eye
    },
    {
      name: 'AVOIDANCE',
      title: 'Deadlock Avoidance',
      description: 'Use algorithms like Banker\'s Algorithm to avoid unsafe states.',
      icon: Shield
    },
    {
      name: 'PREVENTION',
      title: 'Deadlock Prevention',
      description: 'Prevent deadlocks by breaking one of the four necessary conditions.',
      icon: AlertTriangle
    }
  ];

  return (
    <motion.div
      className="deadlock-simulation min-h-screen bg-black text-green-400 p-8 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Virus Alert Overlay */}
      <AnimatePresence>
        {virusAlert && (
          <motion.div
            className="virus-alert fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'linear-gradient(45deg, #ff0080, #000, #ff0080, #000)',
              backgroundSize: '20px 20px',
              animation: 'error-flash 0.5s infinite alternate'
            }}
          >
            <motion.div
              className="virus-alert-content bg-black border-4 border-red-500 p-8 text-center max-w-2xl"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300,
                damping: 20
              }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <Skull className="w-24 h-24 mx-auto text-red-500 mb-4" />
              </motion.div>
              
              <h1 className="text-4xl font-retro text-red-500 mb-4 glitch" data-text="DEADLOCK ALERT">
                DEADLOCK ALERT
              </h1>
              
              <div className="text-xl font-mono text-red-400 mb-6">
                <div>⚠️ CIRCULAR WAIT DETECTED ⚠️</div>
                <div>SYSTEM RESOURCES LOCKED</div>
                <div>ALL PROCESSES HALTED</div>
              </div>

              {bankerAlgorithm && (
                <div className="text-lg font-mono text-yellow-400 mb-4">
                  <div>BANKER'S ALGORITHM ANALYSIS:</div>
                  {safeSequence.length > 0 ? (
                    <div>SAFE SEQUENCE: {safeSequence.join(' → ')}</div>
                  ) : (
                    <div>NO SAFE SEQUENCE FOUND</div>
                  )}
                </div>
              )}
              
              <div className="text-lg font-mono text-yellow-400 mb-6">
                Warning... Deadlock detected... System halted...
              </div>
              
              <button
                onClick={resetSystem}
                className="retro-btn bg-red-500 text-white border-red-500 hover:bg-white hover:text-red-500"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                EMERGENCY RESET
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="header mb-8">
        <h1 className="text-4xl font-retro text-green-400 mb-4">
          DEADLOCK DETECTION SYSTEM
        </h1>
        <div className="text-cyan-400 font-mono">
          Advanced resource allocation monitoring and emergency protocols
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="strategy-selector mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-retro text-cyan-400">DEADLOCK_STRATEGY:</h2>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="retro-btn flex items-center gap-2 text-xs sm:text-sm"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">{showExplanation ? 'HIDE_INFO' : 'SHOW_INFO'}</span>
            <span className="sm:hidden">{showExplanation ? 'HIDE' : 'INFO'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {strategies.map((strategy) => {
            const IconComponent = strategy.icon;
            return (
              <motion.button
                key={strategy.name}
                onClick={() => {
                  setSelectedStrategy(strategy.name as any);
                  resetSystem();
                }}
                className={`retro-btn ${selectedStrategy === strategy.name ? 'bg-green-400 text-black' : ''} p-3 sm:p-4`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  <IconComponent className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-retro text-xs sm:text-sm">{strategy.name}</div>
                  <div className="font-mono text-xs mt-1 hidden sm:block">{strategy.title}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Strategy Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              className="strategy-explanation retro-card mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-retro text-lg text-yellow-400 mb-3">
                {strategies.find(s => s.name === selectedStrategy)?.title}
              </h3>
              <p className="font-mono text-sm text-gray-300 mb-4">
                {strategies.find(s => s.name === selectedStrategy)?.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-retro text-sm text-green-400 mb-2">HOW IT WORKS:</h4>
                  <div className="font-mono text-xs space-y-1">
                    {selectedStrategy === 'DETECTION' && (
                      <>
                        <div>• Monitor resource allocation graph</div>
                        <div>• Check for cycles periodically</div>
                        <div>• Recover by process termination</div>
                      </>
                    )}
                    {selectedStrategy === 'AVOIDANCE' && (
                      <>
                        <div>• Use Banker's Algorithm</div>
                        <div>• Check safe states before allocation</div>
                        <div>• Only grant safe requests</div>
                      </>
                    )}
                    {selectedStrategy === 'PREVENTION' && (
                      <>
                        <div>• Break mutual exclusion</div>
                        <div>• Prevent hold and wait</div>
                        <div>• Allow preemption</div>
                        <div>• Order resources</div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-retro text-sm text-red-400 mb-2">TRADE-OFFS:</h4>
                  <div className="font-mono text-xs space-y-1">
                    {selectedStrategy === 'DETECTION' && (
                      <>
                        <div>• Low overhead during normal operation</div>
                        <div>• Recovery can be expensive</div>
                        <div>• May lose work when processes killed</div>
                      </>
                    )}
                    {selectedStrategy === 'AVOIDANCE' && (
                      <>
                        <div>• Requires advance knowledge</div>
                        <div>• Conservative resource allocation</div>
                        <div>• May underutilize resources</div>
                      </>
                    )}
                    {selectedStrategy === 'PREVENTION' && (
                      <>
                        <div>• Very conservative approach</div>
                        <div>• Low resource utilization</div>
                        <div>• May reduce system throughput</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* System Status */}
      <div className="system-status mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8">
        <div className={`status-indicator flex items-center gap-2 px-4 py-2 border-2 ${
          deadlockDetected ? 'border-red-500 text-red-500' : 'border-green-400 text-green-400'
        } justify-center sm:justify-start`}>
          {deadlockDetected ? (
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          ) : (
            <Zap className="w-5 h-5 animate-pulse" />
          )}
          <span className="font-retro text-xs sm:text-sm">
            {deadlockDetected ? 'DEADLOCK_DETECTED' : 'SYSTEM_NORMAL'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={simulateDeadlockScenario}
            disabled={isSimulating || deadlockDetected}
            className="retro-btn flex items-center gap-2 bg-red-400 text-black disabled:opacity-50 justify-center"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">SIMULATE_DEADLOCK</span>
            <span className="sm:hidden">SIMULATE</span>
          </button>
          
          <button
            onClick={resetSystem}
            className="retro-btn flex items-center gap-2 justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">RESET_SYSTEM</span>
            <span className="sm:hidden">RESET</span>
          </button>
        </div>

        <div className="font-mono text-xs sm:text-sm text-yellow-400 text-center sm:text-left">
          STEP: {currentStep}/{simulationSteps.length}
        </div>
      </div>

      {/* Simulation Steps */}
      {simulationSteps.length > 0 && (
        <div className="simulation-steps mb-8">
          <h3 className="text-lg font-retro text-cyan-400 mb-4">SIMULATION_STEPS:</h3>
          <div className="retro-card">
            <div className="space-y-2">
              {simulationSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  className={`step-item p-2 border-l-4 ${
                    index < currentStep ? 'border-green-400 text-green-400' :
                    index === currentStep ? 'border-yellow-400 text-yellow-400' :
                    'border-gray-600 text-gray-600'
                  }`}
                  animate={{
                    opacity: index <= currentStep ? 1 : 0.5
                  }}
                >
                  <div className="font-mono text-sm">
                    <span className="font-retro mr-2">STEP_{step.step}:</span>
                    {step.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Resource Status */}
        <div className="resource-panel">
          <h3 className="text-lg font-retro text-cyan-400 mb-4">SYSTEM_RESOURCES:</h3>
          <div className="terminal-window">
            <div className="terminal-header">
              <AlertTriangle className="w-4 h-4" />
              Resource Allocation Monitor
            </div>
            <div className="terminal-body">
              <div className="grid grid-cols-1 gap-3">
                {resources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    className={`resource-item border-2 p-4 flex items-center justify-between ${
                      resource.availableInstances === 0 ? 'border-red-400' : 'border-green-400'
                    }`}
                    animate={{
                      borderColor: resource.availableInstances === 0 ? '#ff0080' : '#00ff41',
                      backgroundColor: resource.availableInstances === 0 ? 'rgba(255, 0, 128, 0.1)' : 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getResourceIcon(resource.type)}</div>
                      <div>
                        <div className="font-retro text-sm" style={{ color: resource.color }}>
                          {resource.name}
                        </div>
                        <div className="font-mono text-xs text-gray-400">
                          Type: {resource.type}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-green-400">
                        Available: {resource.availableInstances}/{resource.instances}
                      </div>
                      {resource.allocatedTo && (
                        <div className="font-mono text-xs text-yellow-400">
                          ALLOCATED_TO: PROC_{resource.allocatedTo}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Process Status */}
        <div className="process-panel">
          <h3 className="text-lg font-retro text-cyan-400 mb-4">ACTIVE_PROCESSES:</h3>
          <div className="terminal-window">
            <div className="terminal-body">
              <div className="space-y-4">
                {processes.map((process) => (
                  <motion.div
                    key={process.id}
                    className={`process-item border-2 p-4 ${
                      process.state === 'WAITING' ? 'border-yellow-400' :
                      process.state === 'BLOCKED' ? 'border-red-400' : 'border-green-400'
                    }`}
                    animate={{
                      borderColor: process.state === 'WAITING' ? '#ffff00' :
                                  process.state === 'BLOCKED' ? '#ff0080' : '#00ff41'
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: process.color }}
                        />
                        <span className="font-retro text-sm" style={{ color: process.color }}>
                          {process.name}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-mono border ${
                        process.state === 'RUNNING' ? 'border-green-400 text-green-400' :
                        process.state === 'WAITING' ? 'border-yellow-400 text-yellow-400' :
                        'border-red-400 text-red-400'
                      }`}>
                        {process.state}
                      </span>
                    </div>

                    <div className="text-xs font-mono space-y-1">
                      <div>
                        <span className="text-cyan-400">ALLOCATED:</span>
                        <span className="ml-2 text-green-400">
                          {Object.entries(process.currentAllocation)
                            .filter(([_, count]) => count > 0)
                            .map(([resourceId, count]) => {
                              const resource = resources.find(r => r.id === parseInt(resourceId));
                              return `${resource?.name}(${count})`;
                            }).join(', ') || 'NONE'}
                        </span>
                      </div>
                      <div>
                        <span className="text-cyan-400">MAX_NEED:</span>
                        <span className="ml-2 text-blue-400">
                          {Object.entries(process.maxNeed)
                            .filter(([_, need]) => need > 0)
                            .map(([resourceId, need]) => {
                              const resource = resources.find(r => r.id === parseInt(resourceId));
                              return `${resource?.name}(${need})`;
                            }).join(', ') || 'NONE'}
                        </span>
                      </div>
                      {process.waiting.length > 0 && (
                        <div>
                          <span className="text-red-400">WAITING_FOR:</span>
                          <span className="ml-2 text-yellow-400">
                            {process.waiting.map(rid => resources.find(r => r.id === rid)?.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Allocation Graph */}
      <div className="allocation-graph mb-8">
        <h3 className="text-lg font-retro text-cyan-400 mb-4">RESOURCE_ALLOCATION_GRAPH:</h3>
        <div className="terminal-window">
          <div className="terminal-body">
            <div ref={graphRef} className="graph-visualization bg-gray-900 p-6 min-h-[300px] relative">
              <svg className="w-full h-full" viewBox="0 0 800 300">
                {/* Draw processes */}
                {processes.map((process, index) => {
                  const x = 150;
                  const y = 50 + index * 60;
                  return (
                    <g key={process.id}>
                      <motion.circle
                        cx={x}
                        cy={y}
                        r="25"
                        fill="none"
                        stroke={process.color}
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      />
                      <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fill={process.color}
                        fontSize="12"
                        fontFamily="monospace"
                      >
                        {process.name.split('_')[1]}
                      </text>
                    </g>
                  );
                })}

                {/* Draw resources */}
                {resources.slice(0, 4).map((resource, index) => {
                  const x = 650;
                  const y = 50 + index * 60;
                  return (
                    <g key={resource.id}>
                      <motion.rect
                        x={x - 25}
                        y={y - 15}
                        width="50"
                        height="30"
                        fill="none"
                        stroke={resource.color}
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      />
                      <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fill={resource.color}
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {resource.name.split('_')[0]}
                      </text>
                      <text
                        x={x}
                        y={y - 20}
                        textAnchor="middle"
                        fill={resource.color}
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {resource.availableInstances}/{resource.instances}
                      </text>
                    </g>
                  );
                })}

                {/* Draw allocation edges */}
                {resources.slice(0, 4).map((resource, rIndex) => {
                  if (resource.allocatedTo) {
                    const processIndex = processes.findIndex(p => p.id === resource.allocatedTo);
                    if (processIndex !== -1) {
                      const pX = 175;
                      const pY = 50 + processIndex * 60;
                      const rX = 625;
                      const rY = 50 + rIndex * 60;
                      
                      return (
                        <motion.line
                          key={`alloc-${resource.id}`}
                          x1={rX}
                          y1={rY}
                          x2={pX}
                          y2={pY}
                          stroke={resource.color}
                          strokeWidth="3"
                          markerEnd="url(#arrowhead)"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: 1 }}
                        />
                      );
                    }
                  }
                  return null;
                })}

                {/* Draw waiting edges */}
                {processes.map((process, pIndex) => {
                  return process.waiting.map((resourceId, wIndex) => {
                    const rIndex = resources.findIndex(r => r.id === resourceId);
                    if (rIndex < 4) {
                      const pX = 175;
                      const pY = 50 + pIndex * 60;
                      const rX = 625;
                      const rY = 50 + rIndex * 60;
                      
                      return (
                        <motion.line
                          key={`wait-${process.id}-${resourceId}`}
                          x1={pX}
                          y1={pY}
                          x2={rX}
                          y2={rY}
                          stroke="#ff0080"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          markerEnd="url(#arrowhead-wait)"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: wIndex * 0.2 + 1.5 }}
                        />
                      );
                    }
                    return null;
                  });
                })}

                {/* Arrow markers */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#00ff41"
                    />
                  </marker>
                  <marker
                    id="arrowhead-wait"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#ff0080"
                    />
                  </marker>
                </defs>

                {/* Legend */}
                <g>
                  <text x="400" y="30" textAnchor="middle" fill="#00ffff" fontSize="14" fontFamily="monospace">
                    RESOURCE ALLOCATION GRAPH
                  </text>
                  <line x1="350" y1="260" x2="380" y2="260" stroke="#00ff41" strokeWidth="3" markerEnd="url(#arrowhead)" />
                  <text x="385" y="265" fill="#00ff41" fontSize="10" fontFamily="monospace">ALLOCATED</text>
                  <line x1="350" y1="280" x2="380" y2="280" stroke="#ff0080" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-wait)" />
                  <text x="385" y="285" fill="#ff0080" fontSize="10" fontFamily="monospace">WAITING</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* System Log */}
      <div className="system-log">
        <h3 className="text-lg font-retro text-cyan-400 mb-4">SYSTEM_EVENT_LOG:</h3>
        <div className="terminal-window">
          <div className="terminal-header">
            <Zap className="w-4 h-4" />
            Real-time System Monitor
          </div>
          <div className="terminal-body">
            <div className="log-entries font-mono text-sm space-y-1 max-h-48 overflow-y-auto">
              {simulationLog.map((entry, index) => (
                <motion.div
                  key={index}
                  className={`log-entry ${
                    entry.includes('WARNING') || entry.includes('DEADLOCK') || entry.includes('UNSAFE') ? 'text-red-400' :
                    entry.includes('WAITING') ? 'text-yellow-400' :
                    entry.includes('SAFE') ? 'text-green-400' : 'text-green-400'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {entry}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes error-flash {
          0% {
            filter: hue-rotate(0deg);
            transform: scale(1);
          }
          50% {
            filter: hue-rotate(180deg);
            transform: scale(1.02);
          }
          100% {
            filter: hue-rotate(360deg);
            transform: scale(1);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default DeadlockSimulation;