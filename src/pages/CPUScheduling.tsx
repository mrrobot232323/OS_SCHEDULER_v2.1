import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, Cpu, BarChart3, List, Plus, X, AlertTriangle, Info } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface Process {
  id: number;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  remainingTime: number;
  waitingTime: number;
  turnaroundTime: number;
  completionTime: number;
  responseTime: number;
  color: string;
  startTime?: number;
}

interface GanttSegment {
  process: string;
  start: number;
  duration: number;
  color: string;
  processId: number;
}

const CPUScheduling: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('FCFS');
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, name: 'P1', arrivalTime: 0, burstTime: 8, remainingTime: 8, waitingTime: 0, turnaroundTime: 0, completionTime: 0, responseTime: -1, color: '#00ff41', priority: 3 },
    { id: 2, name: 'P2', arrivalTime: 1, burstTime: 4, remainingTime: 4, waitingTime: 0, turnaroundTime: 0, completionTime: 0, responseTime: -1, color: '#00ffff', priority: 1 },
    { id: 3, name: 'P3', arrivalTime: 2, burstTime: 9, remainingTime: 9, waitingTime: 0, turnaroundTime: 0, completionTime: 0, responseTime: -1, color: '#ff0080', priority: 2 },
    { id: 4, name: 'P4', arrivalTime: 3, burstTime: 5, remainingTime: 5, waitingTime: 0, turnaroundTime: 0, completionTime: 0, responseTime: -1, color: '#ffff00', priority: 4 }
  ]);
  
  const [ganttChart, setGanttChart] = useState<GanttSegment[]>([]);
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null);
  const [showAddProcess, setShowAddProcess] = useState(false);
  const [newProcess, setNewProcess] = useState({
    name: '',
    arrivalTime: 0,
    burstTime: 1,
    priority: 1
  });
  const [starvationWarning, setStarvationWarning] = useState<string[]>([]);
  const [simulationSpeed, setSimulationSpeed] = useState(500);
  const [showExplanation, setShowExplanation] = useState(false);

  const processTableRef = useRef<HTMLDivElement>(null);

  const algorithms = [
    { 
      name: 'FCFS', 
      title: 'First Come First Serve',
      description: 'Processes are executed in order of arrival. Simple but can cause convoy effect.',
      pros: ['Simple to implement', 'Fair ordering', 'No starvation'],
      cons: ['Poor average waiting time', 'Convoy effect with long processes']
    },
    { 
      name: 'SJF', 
      title: 'Shortest Job First',
      description: 'Shortest burst time process is selected first. Optimal for average waiting time.',
      pros: ['Optimal average waiting time', 'Good throughput'],
      cons: ['Starvation of long processes', 'Requires burst time prediction']
    },
    { 
      name: 'SRTF', 
      title: 'Shortest Remaining Time First',
      description: 'Preemptive version of SJF. Process with shortest remaining time runs first.',
      pros: ['Better response time than SJF', 'Optimal for average waiting time'],
      cons: ['High context switching overhead', 'Starvation possible']
    },
    { 
      name: 'RR', 
      title: 'Round Robin',
      description: 'Each process gets equal time slice. Good for interactive systems.',
      pros: ['Fair CPU allocation', 'Good response time', 'No starvation'],
      cons: ['Higher average turnaround time', 'Context switching overhead']
    },
    { 
      name: 'Priority', 
      title: 'Priority Scheduling',
      description: 'Processes with higher priority execute first. Can be preemptive or non-preemptive.',
      pros: ['Important processes get priority', 'Flexible scheduling'],
      cons: ['Starvation of low priority processes', 'Priority inversion']
    },
    { 
      name: 'MLFQ', 
      title: 'Multilevel Feedback Queue',
      description: 'Multiple queues with different priorities. Processes move between queues.',
      pros: ['Adaptive to process behavior', 'Good for mixed workloads'],
      cons: ['Complex implementation', 'Parameter tuning required']
    }
  ];

  const colors = ['#00ff41', '#00ffff', '#ff0080', '#ffff00', '#ff6600', '#9933ff', '#ff3366', '#33ff99'];

  useEffect(() => {
    // Check for starvation in Priority scheduling
    if (selectedAlgorithm === 'Priority' && processes.length > 0) {
      checkForStarvation();
    }
  }, [processes, selectedAlgorithm]);

  const checkForStarvation = () => {
    const sortedByPriority = [...processes].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const warnings: string[] = [];
    
    // Check if low priority processes might starve
    const highPriorityProcesses = sortedByPriority.filter(p => (p.priority || 0) <= 2);
    const lowPriorityProcesses = sortedByPriority.filter(p => (p.priority || 0) >= 4);
    
    if (highPriorityProcesses.length > 0 && lowPriorityProcesses.length > 0) {
      const totalHighPriorityBurst = highPriorityProcesses.reduce((sum, p) => sum + p.burstTime, 0);
      if (totalHighPriorityBurst > 20) {
        warnings.push(`⚠️ STARVATION RISK: Low priority processes (${lowPriorityProcesses.map(p => p.name).join(', ')}) may experience indefinite waiting!`);
      }
    }
    
    setStarvationWarning(warnings);
  };

  const addProcess = () => {
    if (!newProcess.name.trim()) return;
    
    const id = Math.max(...processes.map(p => p.id), 0) + 1;
    const color = colors[id % colors.length];
    
    const process: Process = {
      id,
      name: newProcess.name,
      arrivalTime: newProcess.arrivalTime,
      burstTime: newProcess.burstTime,
      priority: newProcess.priority,
      remainingTime: newProcess.burstTime,
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
      responseTime: -1,
      color
    };
    
    setProcesses(prev => [...prev, process]);
    setNewProcess({ name: '', arrivalTime: 0, burstTime: 1, priority: 1 });
    setShowAddProcess(false);
    
    // Play success sound
    soundEffects.playSuccess();
  };

  const removeProcess = (id: number) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setGanttChart([]);
    setCurrentProcess(null);
    setStarvationWarning([]);
    setProcesses(prev => prev.map(p => ({
      ...p,
      remainingTime: p.burstTime,
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
      responseTime: -1,
      startTime: undefined
    })));
  };

  const simulateAlgorithm = () => {
    if (isRunning || processes.length === 0) return;
    
    soundEffects.playButtonClick();
    setIsRunning(true);
    resetSimulation();
    
    let time = 0;
    let chart: GanttSegment[] = [];
    let processQueue = [...processes].map(p => ({ ...p, remainingTime: p.burstTime, responseTime: -1 }));
    let readyQueue: Process[] = [];
    let completedProcesses: Process[] = [];
    let rrQueue: Process[] = []; // For Round Robin
    let currentQuantum = 0;
    
    const interval = setInterval(() => {
      // Add processes that have arrived to ready queue
      processQueue.forEach(p => {
        if (p.arrivalTime <= time && !readyQueue.some(rp => rp.id === p.id) && !completedProcesses.some(cp => cp.id === p.id)) {
          const newProcess = { ...p };
          readyQueue.push(newProcess);
          
          if (selectedAlgorithm === 'RR') {
            rrQueue.push(newProcess);
          }
        }
      });

      if (readyQueue.length === 0 && completedProcesses.length >= processes.length) {
        setIsRunning(false);
        setCurrentProcess(null);
        clearInterval(interval);
        return;
      }

      let runningProcess: Process | null = null;

      // Algorithm-specific scheduling
      switch (selectedAlgorithm) {
        case 'FCFS':
          readyQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
          runningProcess = readyQueue[0];
          break;
          
        case 'SJF':
          readyQueue.sort((a, b) => a.burstTime - b.burstTime);
          runningProcess = readyQueue[0];
          break;
          
        case 'SRTF':
          readyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
          runningProcess = readyQueue[0];
          break;
          
        case 'Priority':
          readyQueue.sort((a, b) => (a.priority || 0) - (b.priority || 0));
          runningProcess = readyQueue[0];
          break;
          
        case 'RR':
          if (rrQueue.length > 0) {
            runningProcess = rrQueue[0];
          }
          break;
          
        case 'MLFQ':
          // Simplified MLFQ - use priority as queue level
          readyQueue.sort((a, b) => (a.priority || 0) - (b.priority || 0));
          runningProcess = readyQueue[0];
          break;
          
        default:
          runningProcess = readyQueue[0];
      }

      if (runningProcess) {
        // Set response time if first execution
        if (runningProcess.responseTime === -1) {
          runningProcess.responseTime = time - runningProcess.arrivalTime;
        }

        // Execute process
        runningProcess.remainingTime--;
        currentQuantum++;

        // Update processes state
        const updatedProcesses = processes.map(p => {
          if (p.id === runningProcess!.id) {
            const updated = { ...runningProcess! };
            if (updated.remainingTime === 0) {
              updated.completionTime = time + 1;
              updated.turnaroundTime = updated.completionTime - updated.arrivalTime;
              updated.waitingTime = updated.turnaroundTime - updated.burstTime;
              completedProcesses.push(updated);
              readyQueue = readyQueue.filter(proc => proc.id !== p.id);
              rrQueue = rrQueue.filter(proc => proc.id !== p.id);
            }
            return updated;
          }
          return p;
        });
        setProcesses(updatedProcesses);

        // Handle Round Robin time quantum
        if (selectedAlgorithm === 'RR' && (currentQuantum >= timeQuantum || runningProcess.remainingTime === 0)) {
          if (runningProcess.remainingTime > 0) {
            rrQueue.shift();
            rrQueue.push(runningProcess);
          } else {
            rrQueue.shift();
          }
          currentQuantum = 0;
        }

        // Add to Gantt chart
        const lastEntry = chart[chart.length - 1];
        if (lastEntry && lastEntry.processId === runningProcess.id) {
          lastEntry.duration++;
        } else {
          chart.push({
            process: runningProcess.name,
            processId: runningProcess.id,
            start: time,
            duration: 1,
            color: runningProcess.color
          });
        }

        setCurrentProcess(runningProcess);
        setGanttChart([...chart]);
      }

      time++;
      setCurrentTime(time);

      // Stop simulation when all processes are complete
      if (completedProcesses.length >= processes.length) {
        setIsRunning(false);
        setCurrentProcess(null);
        soundEffects.playProcessComplete();
        clearInterval(interval);
      }
    }, simulationSpeed);
  };

  const averageWaitingTime = processes.length > 0 ? processes.reduce((sum, p) => sum + p.waitingTime, 0) / processes.length : 0;
  const averageTurnaroundTime = processes.length > 0 ? processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / processes.length : 0;
  const averageResponseTime = processes.length > 0 ? processes.filter(p => p.responseTime >= 0).reduce((sum, p) => sum + p.responseTime, 0) / processes.filter(p => p.responseTime >= 0).length : 0;

  const currentAlgorithm = algorithms.find(algo => algo.name === selectedAlgorithm);

  return (
    <motion.div
      className="cpu-scheduling min-h-screen bg-black text-green-400 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="header mb-8">
        <h1 className="text-4xl font-retro text-green-400 mb-4">
          CPU SCHEDULING ALGORITHMS
        </h1>
        <div className="text-cyan-400 font-mono">
          Interactive visualization of process scheduling mechanisms
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="algorithm-selector mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-retro text-cyan-400">SELECT_ALGORITHM:</h2>
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
          {algorithms.map((algo) => (
            <motion.button
              key={algo.name}
              onClick={() => {
                setSelectedAlgorithm(algo.name);
                resetSimulation();
              }}
              className={`retro-btn ${selectedAlgorithm === algo.name ? 'bg-green-400 text-black' : ''} p-3 sm:p-4`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-center">
                <div className="font-retro text-xs sm:text-sm">{algo.name}</div>
                <div className="font-mono text-xs mt-1 hidden sm:block">{algo.title}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Algorithm Explanation */}
        <AnimatePresence>
          {showExplanation && currentAlgorithm && (
            <motion.div
              className="algorithm-explanation retro-card mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-retro text-lg text-yellow-400 mb-3">{currentAlgorithm.title}</h3>
              <p className="font-mono text-sm text-gray-300 mb-4">{currentAlgorithm.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-retro text-sm text-green-400 mb-2">ADVANTAGES:</h4>
                  <ul className="font-mono text-xs space-y-1">
                    {currentAlgorithm.pros.map((pro, index) => (
                      <li key={index} className="text-green-400">+ {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-retro text-sm text-red-400 mb-2">DISADVANTAGES:</h4>
                  <ul className="font-mono text-xs space-y-1">
                    {currentAlgorithm.cons.map((con, index) => (
                      <li key={index} className="text-red-400">- {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Starvation Warning */}
      <AnimatePresence>
        {starvationWarning.length > 0 && (
          <motion.div
            className="starvation-warning bg-red-900 border-2 border-red-400 p-4 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="font-retro text-red-400">STARVATION_ALERT</span>
            </div>
            {starvationWarning.map((warning, index) => (
              <div key={index} className="font-mono text-sm text-red-300">{warning}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="controls mb-8 flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
        <button
          onClick={simulateAlgorithm}
          disabled={isRunning || processes.length === 0}
          className="retro-btn flex items-center gap-2 bg-green-400 text-black disabled:opacity-50 flex-1 sm:flex-none justify-center"
          onMouseEnter={() => soundEffects.playButtonClick()}
        >
          <Play className="w-4 h-4" />
          <span className="hidden sm:inline">EXECUTE</span>
          <span className="sm:hidden">RUN</span>
        </button>
        
        <button
          onClick={resetSimulation}
          className="retro-btn flex items-center gap-2 flex-1 sm:flex-none justify-center"
          onMouseEnter={() => soundEffects.playButtonClick()}
        >
          <RotateCcw className="w-4 h-4" />
          RESET
        </button>

        <button
          onClick={() => setShowAddProcess(true)}
          className="retro-btn flex items-center gap-2 bg-cyan-400 text-black flex-1 sm:flex-none justify-center"
          onMouseEnter={() => soundEffects.playButtonClick()}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">ADD_PROCESS</span>
          <span className="sm:hidden">ADD</span>
        </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
        {selectedAlgorithm === 'RR' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="font-mono text-xs sm:text-sm whitespace-nowrap">Quantum:</label>
            <input
              type="number"
              value={timeQuantum}
              onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
              className="bg-gray-900 border border-green-400 text-green-400 px-2 py-1 w-16 font-mono text-sm"
              min="1"
              max="10"
            />
          </div>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="font-mono text-xs sm:text-sm whitespace-nowrap">Speed:</label>
          <input
            type="range"
            min="100"
            max="1000"
            step="100"
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
            className="w-20 flex-1 sm:flex-none"
          />
          <span className="font-mono text-xs whitespace-nowrap">{simulationSpeed}ms</span>
        </div>

        <div className="flex items-center gap-2 text-yellow-400 justify-center sm:justify-start">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-sm">Time: {currentTime}</span>
        </div>
        </div>
      </div>

      {/* Add Process Modal */}
      <AnimatePresence>
        {showAddProcess && (
          <motion.div
            className="add-process-modal fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddProcess(false)}
          >
            <motion.div
              className="retro-card w-full max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-retro text-lg text-green-400">ADD_NEW_PROCESS</h3>
                <button
                  onClick={() => setShowAddProcess(false)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-sm text-cyan-400 mb-1">Process Name:</label>
                  <input
                    type="text"
                    value={newProcess.name}
                    onChange={(e) => setNewProcess(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-900 border border-green-400 text-green-400 px-3 py-2 font-mono"
                    placeholder="P5"
                  />
                </div>
                
                <div>
                  <label className="block font-mono text-sm text-cyan-400 mb-1">Arrival Time:</label>
                  <input
                    type="number"
                    value={newProcess.arrivalTime}
                    onChange={(e) => setNewProcess(prev => ({ ...prev, arrivalTime: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-900 border border-green-400 text-green-400 px-3 py-2 font-mono"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block font-mono text-sm text-cyan-400 mb-1">Burst Time:</label>
                  <input
                    type="number"
                    value={newProcess.burstTime}
                    onChange={(e) => setNewProcess(prev => ({ ...prev, burstTime: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-gray-900 border border-green-400 text-green-400 px-3 py-2 font-mono"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block font-mono text-sm text-cyan-400 mb-1">Priority (1=highest):</label>
                  <input
                    type="number"
                    value={newProcess.priority}
                    onChange={(e) => setNewProcess(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-gray-900 border border-green-400 text-green-400 px-3 py-2 font-mono"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={addProcess}
                  disabled={!newProcess.name.trim()}
                  className="retro-btn bg-green-400 text-black flex-1 disabled:opacity-50"
                >
                  ADD_PROCESS
                </button>
                <button
                  onClick={() => setShowAddProcess(false)}
                  className="retro-btn flex-1"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Process Table */}
      <div className="process-table mb-8">
        <h3 className="text-lg font-retro text-cyan-400 mb-4">PROCESS_TABLE:</h3>
        <div className="terminal-window">
          <div className="terminal-header">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Process Control Block ({processes.length} processes)</span>
            <span className="sm:hidden">PCB ({processes.length})</span>
          </div>
          <div className="terminal-body overflow-x-auto -webkit-overflow-scrolling-touch">
            <div ref={processTableRef}>
              <table className="w-full font-mono text-xs sm:text-sm min-w-max">
                <thead>
                  <tr className="border-b border-green-400">
                    <th className="text-left p-1 sm:p-2 whitespace-nowrap">PID</th>
                    <th className="text-left p-1 sm:p-2 whitespace-nowrap">Arrival</th>
                    <th className="text-left p-1 sm:p-2 whitespace-nowrap">Burst</th>
                    <th className="text-left p-1 sm:p-2 whitespace-nowrap">Remaining</th>
                    <th className="text-left p-1 sm:p-2 whitespace-nowrap">Priority</th>
                    <th className="text-left p-1 sm:p-2 whitespace-nowrap">Waiting</th>
                    <th className="text-left p-1 sm:p-2 whitespace-nowrap">Turnaround</th>
                    <th className="text-left p-1 sm:p-2 whitespace-nowrap">Response</th>
                    <th className="text-left p-1 sm:p-2 whitespace-nowrap">Status</th>
                    <th className="text-left p-1 sm:p-2 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((process) => (
                    <motion.tr
                      key={process.id}
                      className={`border-b border-gray-700 ${
                        currentProcess?.id === process.id ? 'bg-green-400 bg-opacity-20' : ''
                      }`}
                      animate={{
                        backgroundColor: currentProcess?.id === process.id ? 'rgba(0, 255, 65, 0.2)' : 'transparent'
                      }}
                      layout
                    >
                      <td className="p-1 sm:p-2 whitespace-nowrap" style={{ color: process.color }}>{process.name}</td>
                      <td className="p-1 sm:p-2">{process.arrivalTime}</td>
                      <td className="p-1 sm:p-2">{process.burstTime}</td>
                      <td className="p-1 sm:p-2">{process.remainingTime}</td>
                      <td className="p-1 sm:p-2">{process.priority || 'N/A'}</td>
                      <td className="p-1 sm:p-2">{process.waitingTime}</td>
                      <td className="p-1 sm:p-2">{process.turnaroundTime}</td>
                      <td className="p-1 sm:p-2">{process.responseTime >= 0 ? process.responseTime : 'N/A'}</td>
                      <td className="p-1 sm:p-2">
                        <span className={`px-1 sm:px-2 py-1 rounded text-xs ${
                          currentProcess?.id === process.id ? 'bg-yellow-400 text-black' :
                          process.remainingTime === 0 ? 'bg-green-400 text-black' :
                          currentTime >= process.arrivalTime ? 'bg-cyan-400 text-black' :
                          'bg-gray-600 text-white'
                        }`}>
                          {currentProcess?.id === process.id ? 'RUNNING' :
                           process.remainingTime === 0 ? 'COMPLETE' :
                           currentTime >= process.arrivalTime ? 'READY' :
                           'WAITING'}
                        </span>
                      </td>
                      <td className="p-1 sm:p-2">
                        <button
                          onClick={() => removeProcess(process.id)}
                          disabled={isRunning}
                          className="text-red-400 hover:text-red-300 text-xs px-1 sm:px-2 py-1 border border-red-400 hover:bg-red-400 hover:text-black transition-all disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-chart mb-8">
        <h3 className="text-lg font-retro text-cyan-400 mb-4">GANTT_CHART:</h3>
        <div className="terminal-window">
          <div className="terminal-header">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Timeline Visualization</span>
            <span className="sm:hidden">Timeline</span>
          </div>
          <div className="terminal-body">
            <div className="gantt-timeline relative bg-gray-900 p-2 sm:p-4 min-h-[80px] sm:min-h-[100px] overflow-x-auto -webkit-overflow-scrolling-touch">
              {ganttChart.map((segment, index) => (
                <motion.div
                  key={index}
                  className="gantt-segment absolute top-2 sm:top-4 flex items-center justify-center text-black font-bold text-xs sm:text-sm cursor-pointer"
                  style={{
                    left: `${segment.start * 25}px`,
                    width: `${segment.duration * 25}px`,
                    height: '30px',
                    backgroundColor: segment.color,
                    border: '2px solid #000'
                  }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ 
                    width: `${segment.duration * 25}px`,
                    opacity: 1
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  title={`${segment.process}: ${segment.start}-${segment.start + segment.duration}`}
                >
                  {segment.process}
                </motion.div>
              ))}
              
              {/* Time markers */}
              <div className="time-markers">
                {Array.from({ length: Math.max(currentTime + 1, 20) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-xs text-gray-400 select-none"
                    style={{
                      left: `${i * 25}px`,
                      top: '40px'
                    }}
                  >
                    {i}
                  </div>
                ))}
              </div>
              
              {/* Current time indicator */}
              {isRunning && (
                <motion.div
                  className="current-time-indicator absolute top-0 bottom-0 w-0.5 bg-red-400"
                  style={{ left: `${currentTime * 25}px` }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="statistics">
        <h3 className="text-lg font-retro text-cyan-400 mb-4">PERFORMANCE_METRICS:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <motion.div 
            className="retro-card"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="font-retro text-yellow-400 text-xs sm:text-sm">Avg Waiting Time</span>
            </div>
            <div className="text-2xl sm:text-3xl font-retro text-green-400">
              {averageWaitingTime.toFixed(2)}
            </div>
            <div className="text-xs font-mono text-gray-400 mt-1">
              Lower is better
            </div>
          </motion.div>
          
          <motion.div 
            className="retro-card"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-magenta-400" />
              <span className="font-retro text-magenta-400 text-xs sm:text-sm">Avg Turnaround Time</span>
            </div>
            <div className="text-2xl sm:text-3xl font-retro text-green-400">
              {averageTurnaroundTime.toFixed(2)}
            </div>
            <div className="text-xs font-mono text-gray-400 mt-1">
              Total time in system
            </div>
          </motion.div>

          <motion.div 
            className="retro-card sm:col-span-2 lg:col-span-1"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span className="font-retro text-cyan-400 text-xs sm:text-sm">Avg Response Time</span>
            </div>
            <div className="text-2xl sm:text-3xl font-retro text-green-400">
              {averageResponseTime.toFixed(2)}
            </div>
            <div className="text-xs font-mono text-gray-400 mt-1">
              Time to first execution
            </div>
          </motion.div>
        </div>
      </div>

      {/* Current Process Display */}
      <AnimatePresence>
        {currentProcess && (
          <motion.div
            className="current-process fixed bottom-20 right-8 bg-gray-900 border-2 border-yellow-400 p-4"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="font-retro text-yellow-400 mb-2">CURRENTLY_EXECUTING:</div>
            <div className="font-mono">
              <div style={{ color: currentProcess.color }}>
                Process: {currentProcess.name}
              </div>
              <div>Remaining: {currentProcess.remainingTime}</div>
              <div>Priority: {currentProcess.priority || 'N/A'}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CPUScheduling;