import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  HardDrive, 
  List, 
  AlertTriangle, 
  Terminal,
  Zap,
  Monitor,
  ChevronRight
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [glitchText, setGlitchText] = useState('OS SCHEDULER');

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const originalText = 'OS SCHEDULER';
      
      // Randomly glitch some characters
      const glitched = originalText.split('').map(char => 
        Math.random() > 0.8 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
      ).join('');
      
      setGlitchText(glitched);
      
      // Restore original text after a short delay
      setTimeout(() => setGlitchText(originalText), 100);
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  const features = [
    {
      icon: Cpu,
      title: 'CPU SCHEDULING',
      description: 'Interactive simulations of FCFS, SJF, SRTF, Round Robin, Priority, and Multilevel scheduling algorithms',
      path: '/cpu-scheduling',
      color: 'text-green-400 border-green-400'
    },
    {
      icon: HardDrive,
      title: 'MEMORY MANAGEMENT',
      description: 'Visual demonstrations of Paging, Segmentation, Swapping, and Virtual Memory systems',
      path: '/memory-management',
      color: 'text-cyan-400 border-cyan-400'
    },
    {
      icon: List,
      title: 'PROCESS TABLE',
      description: 'Real-time Process Control Block (PCB) monitoring with state transition visualization',
      path: '/process-table',
      color: 'text-yellow-400 border-yellow-400'
    },
    {
      icon: AlertTriangle,
      title: 'DEADLOCK SIMULATION',
      description: 'Advanced deadlock detection with emergency alert systems and recovery mechanisms',
      path: '/deadlock',
      color: 'text-red-400 border-red-400'
    }
  ];

  return (
    <motion.div
      className="home-page min-h-screen bg-black text-green-400 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Hero Section */}
      <div className="hero-section text-center mb-16">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="terminal-logo mb-8">
            <Terminal className="w-20 h-20 mx-auto text-green-400 mb-4" />
            <h1 
              className="text-6xl font-retro text-green-400 mb-4 glitch"
              data-text={glitchText}
            >
              {glitchText}
            </h1>
            <div className="text-cyan-400 font-mono text-xl mb-8">
              <span className="typing-text">RETRO TERMINAL OPERATING SYSTEM</span>
            </div>
          </div>
          
          <div className="system-specs bg-gray-900 border-2 border-green-400 p-6 max-w-2xl mx-auto mb-8">
            <div className="grid grid-cols-2 gap-4 font-mono text-sm">
              <div>
                <span className="text-cyan-400">CPU:</span>
                <span className="text-green-400 ml-2">RETRO-8086</span>
              </div>
              <div>
                <span className="text-cyan-400">RAM:</span>
                <span className="text-green-400 ml-2">640KB</span>
              </div>
              <div>
                <span className="text-cyan-400">OS:</span>
                <span className="text-green-400 ml-2">SCHEDULER v2.1</span>
              </div>
              <div>
                <span className="text-cyan-400">MODE:</span>
                <span className="text-yellow-400 ml-2 animate-pulse">INTERACTIVE</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="features-grid grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
            >
              <Link to={feature.path} className="block">
                <div className={`retro-card ${feature.color} hover:scale-105 transition-all duration-300 cursor-pointer h-full`}>
                  <div className="flex items-start gap-4 mb-4">
                    <IconComponent className="w-8 h-8 flex-shrink-0" />
                    <div>
                      <h3 className="font-retro text-lg mb-2">{feature.title}</h3>
                      <p className="font-mono text-sm text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <span className="font-mono text-xs">CLICK_TO_ACCESS</span>
                    <ChevronRight className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* System Status */}
      <motion.div
        className="system-status border-2 border-green-400 bg-gray-900 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <h2 className="font-retro text-xl text-green-400 mb-6">SYSTEM STATUS</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CPU Status */}
          <div className="status-panel">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-5 h-5 text-green-400" />
              <span className="font-mono text-green-400">CPU USAGE</span>
            </div>
            <div className="progress-bar bg-gray-800 h-4 border border-green-400">
              <motion.div
                className="bg-green-400 h-full"
                initial={{ width: 0 }}
                animate={{ width: '23%' }}
                transition={{ duration: 2, delay: 1.2 }}
              />
            </div>
            <span className="font-mono text-xs text-gray-400 mt-1 block">23% UTILIZED</span>
          </div>

          {/* Memory Status */}
          <div className="status-panel">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              <span className="font-mono text-cyan-400">MEMORY</span>
            </div>
            <div className="progress-bar bg-gray-800 h-4 border border-cyan-400">
              <motion.div
                className="bg-cyan-400 h-full"
                initial={{ width: 0 }}
                animate={{ width: '67%' }}
                transition={{ duration: 2, delay: 1.4 }}
              />
            </div>
            <span className="font-mono text-xs text-gray-400 mt-1 block">429KB/640KB</span>
          </div>

          {/* Process Count */}
          <div className="status-panel">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="font-mono text-yellow-400">PROCESSES</span>
            </div>
            <div className="text-3xl font-retro text-yellow-400">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                12
              </motion.span>
            </div>
            <span className="font-mono text-xs text-gray-400">ACTIVE_TASKS</span>
          </div>
        </div>
      </motion.div>

      {/* Command Prompt */}
      <motion.div
        className="command-prompt mt-8 bg-black border-2 border-green-400 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <div className="font-mono text-sm">
          <span className="text-green-400">$</span>
          <span className="text-gray-400 ml-2">Welcome to OS Scheduler Terminal Interface</span>
        </div>
        <div className="font-mono text-sm">
          <span className="text-green-400">$</span>
          <span className="text-gray-400 ml-2">Navigate using the menu above or use keyboard shortcuts</span>
        </div>
        <div className="font-mono text-sm">
          <span className="text-green-400">$</span>
          <span className="text-yellow-400 ml-2">Type 'help' for available commands...</span>
          <span className="animate-pulse text-green-400">█</span>
        </div>
      </motion.div>

      <style jsx>{`
        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch::before {
          animation: glitch-anim-1 2s infinite linear alternate-reverse;
          color: #00ffff;
          z-index: -1;
        }

        .glitch::after {
          animation: glitch-anim-2 2s infinite linear alternate-reverse;
          color: #ff0080;
          z-index: -2;
        }
      `}</style>
    </motion.div>
  );
};

export default HomePage;