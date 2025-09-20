import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, HardDrive, Zap, Monitor } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

const About: React.FC = () => {
  const [scrollingCredits, setScrollingCredits] = useState(false);

  const credits = [
    '════════════════════════════════════',
    'OS SCHEDULER v2.1 - RETRO EDITION',
    '════════════════════════════════════',
    '',
    'DEVELOPED BY:',
    '• Mr Robot',
  
    '',
    'SPECIAL THANKS:',
    '• THE OPEN SOURCE COMMUNITY',
    '• CLASSIC TERMINAL DESIGNERS',
    '• 8-BIT COMPUTING PIONEERS',
    '• MS-DOS COMMAND LINE HERITAGE',
    '',
    'ALGORITHMS IMPLEMENTED:',
    '• FIRST COME FIRST SERVE (FCFS)',
    '• SHORTEST JOB FIRST (SJF)',
    '• SHORTEST REMAINING TIME FIRST (SRTF)',
    '• ROUND ROBIN SCHEDULING',
    '• PRIORITY BASED SCHEDULING',
    '• MULTILEVEL QUEUE SCHEDULING',
    '• MULTILEVEL FEEDBACK QUEUE',
    '',
    'MEMORY MANAGEMENT:',
    '• PAGING SYSTEM',
    '• SEGMENTATION',
    '• VIRTUAL MEMORY',
    '• SWAPPING MECHANISMS',
    '• DYNAMIC ALLOCATION',
    '',
    'PROCESS MANAGEMENT:',
    '• PROCESS CONTROL BLOCKS',
    '• STATE TRANSITIONS',
    '• REAL-TIME MONITORING',
    '• DYNAMIC PROCESS CREATION',
    '',
    'DEADLOCK HANDLING:',
    '• DETECTION ALGORITHMS',
    '• PREVENTION STRATEGIES',
    '• RECOVERY MECHANISMS',
    '• RESOURCE ALLOCATION GRAPHS',
    '',
    'TECHNOLOGIES USED:',
    '• REACT 18 WITH TYPESCRIPT',
    '• FRAMER MOTION ANIMATIONS',
    '• TAILWIND CSS STYLING',
    '• LUCIDE REACT ICONS',
    '• MODERN WEB STANDARDS',
    '',
    'VISUAL EFFECTS:',
    '• CRT MONITOR SIMULATION',
    '• SCANLINE RENDERING',
    '• PHOSPHOR GLOW EFFECTS',
    '• MATRIX RAIN ANIMATION',
    '• RETRO GLITCH EFFECTS',
    '',
    'AUDIO FEATURES:',
    '• 8-BIT SOUND EFFECTS',
    '• RETRO SYSTEM BEEPS',
    '• VOICE ALERTS',
    '• SYNTHWAVE BACKGROUND',
    '',
    'EDUCATIONAL FEATURES:',
    '• INTERACTIVE SIMULATIONS',
    '• REAL-TIME VISUALIZATIONS',
    '• STEP-BY-STEP EXECUTION',
    '• PERFORMANCE METRICS',
    '• ALGORITHM COMPARISONS',
    '',
    'SYSTEM REQUIREMENTS:',
    '• MODERN WEB BROWSER',
    '• JAVASCRIPT ENABLED',
    '• MINIMUM 1024x768 DISPLAY',
    '• RETRO APPRECIATION',
    '',
    'VERSION HISTORY:',
    '• v1.0 - BASIC SCHEDULING',
    '• v1.5 - MEMORY MANAGEMENT',
    '• v2.0 - DEADLOCK SIMULATION',
    '• v2.1 - RETRO INTERFACE',
    '',
    'COPYRIGHT NOTICE:',
    '© 2025 BOLT AI SYSTEMS',
    'ALL RIGHTS RESERVED',
    '',
    'LICENSE:',
    'EDUCATIONAL USE ONLY',
    'RETRO COMPUTING ENTHUSIASTS',
    'LEARNING AND RESEARCH',
    '',
    'CONTACT:',
    'EMAIL: at16690624@gmail.com',
    'GITHUB: ',
    '',
    'DEDICATED TO:',
    'ALL THE COMPUTER SCIENCE',
    'STUDENTS AND EDUCATORS',
    'WHO KEEP THE RETRO SPIRIT ALIVE',
    '',
    '════════════════════════════════════',
    'THANK YOU FOR USING OS SCHEDULER!',
    '════════════════════════════════════',
    '',
    'PRESS ESC TO EXIT CREDITS...',
    '',
    '',
    '● END OF TRANSMISSION ●',
  ];

  const systemInfo = [
    { label: 'SYSTEM_NAME', value: 'OS_SCHEDULER_v2.1' },
    { label: 'BUILD_DATE', value: '2025-01-XX' },
    { label: 'PLATFORM', value: 'WEB_BROWSER' },
    { label: 'ARCHITECTURE', value: 'RETRO_TERMINAL' },
    { label: 'DISPLAY_MODE', value: 'CRT_SIMULATION' },
    { label: 'COLOR_DEPTH', value: 'NEON_ENHANCED' },
    { label: 'SOUND_SYSTEM', value: '8BIT_SYNTHWAVE' },
    { label: 'INPUT_METHOD', value: 'KEYBOARD_TERMINAL' }
  ];

  const features = [
    {
      icon: Cpu,
      title: 'CPU SCHEDULING',
      description: 'Advanced process scheduling algorithms with real-time visualization',
      details: ['FCFS, SJF, SRTF', 'Round Robin', 'Priority Scheduling', 'Multilevel Queues']
    },
    {
      icon: HardDrive,
      title: 'MEMORY MANAGEMENT',
      description: 'Comprehensive memory allocation and management systems',
      details: ['Paging System', 'Segmentation', 'Virtual Memory', 'Swapping']
    },
    {
      icon: Terminal,
      title: 'PROCESS CONTROL',
      description: 'Real-time process monitoring and state management',
      details: ['PCB Monitoring', 'State Transitions', 'Process Creation', 'Resource Tracking']
    },
    {
      icon: Zap,
      title: 'DEADLOCK HANDLING',
      description: 'Advanced deadlock detection and emergency protocols',
      details: ['Detection Algorithms', 'Prevention', 'Recovery', 'Alert Systems']
    }
  ];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && scrollingCredits) {
        setScrollingCredits(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [scrollingCredits]);

  return (
    <motion.div
      className="about-page min-h-screen bg-black text-green-400 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => soundEffects.playButtonClick()}
    >
      {/* Scrolling Credits Overlay */}
      {scrollingCredits && (
        <motion.div
          className="credits-overlay fixed inset-0 bg-black z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="credits-container w-full max-w-4xl">
            <motion.div
              className="credits-text font-mono text-lg text-center"
              initial={{ y: '100vh' }}
              animate={{ y: '-100vh' }}
              transition={{ 
                duration: 60,
                ease: 'linear'
              }}
            >
              {credits.map((line, index) => (
                <div 
                  key={index}
                  className={`credits-line mb-4 ${
                    line.includes('═') ? 'text-cyan-400 text-xl' :
                    line.includes('•') ? 'text-green-400' :
                    line.includes(':') && !line.includes('EMAIL') ? 'text-yellow-400' :
                    line.includes('v') && line.includes('.') ? 'text-magenta-400' :
                    'text-green-400'
                  }`}
                  style={{
                    textShadow: line.includes('═') ? '0 0 10px currentColor' : 'none'
                  }}
                >
                  {line}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="header mb-8">
        <h1 className="text-4xl font-retro text-green-400 mb-4">
          SYSTEM INFORMATION
        </h1>
        <div className="text-cyan-400 font-mono">
          About OS Scheduler Terminal Interface v2.1
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* System Info */}
        <div className="system-info">
          <h3 className="text-lg font-retro text-cyan-400 mb-4">SYSTEM_SPECIFICATIONS:</h3>
          <div className="terminal-window">
            <div className="terminal-header">
              <Monitor className="w-4 h-4" />
              System Configuration
            </div>
            <div className="terminal-body">
              <div className="space-y-2 font-mono text-sm">
                {systemInfo.map((info, index) => (
                  <motion.div
                    key={info.label}
                    className="flex justify-between items-center py-1 border-b border-gray-800"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-cyan-400">{info.label}:</span>
                    <span className="text-green-400">{info.value}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 border border-green-400 bg-green-400 bg-opacity-10">
                <div className="font-retro text-sm text-green-400 mb-2">STATUS: OPERATIONAL</div>
                <div className="font-mono text-xs text-gray-300">
                  All subsystems functioning within normal parameters. Retro mode enabled.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="features-overview">
          <h3 className="text-lg font-retro text-cyan-400 mb-4">FEATURE_MODULES:</h3>
          <div className="space-y-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="retro-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="flex items-start gap-4">
                    <IconComponent className="w-8 h-8 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-retro text-sm text-green-400 mb-2">{feature.title}</h4>
                      <p className="font-mono text-xs text-gray-300 mb-3">{feature.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {feature.details.map((detail, idx) => (
                          <div key={idx} className="font-mono text-xs text-cyan-400 border border-cyan-400 px-2 py-1 text-center">
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="tech-specs mb-8">
        <h3 className="text-lg font-retro text-cyan-400 mb-4">TECHNICAL_SPECIFICATIONS:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="retro-card">
            <h4 className="font-retro text-sm text-yellow-400 mb-3">PERFORMANCE</h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-cyan-400">Processes:</span>
                <span className="text-green-400">Unlimited*</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">Memory:</span>
                <span className="text-green-400">Virtual</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">Response Time:</span>
                <span className="text-green-400">&lt;10ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">Algorithms:</span>
                <span className="text-green-400">8+</span>
              </div>
            </div>
          </div>

          <div className="retro-card">
            <h4 className="font-retro text-sm text-yellow-400 mb-3">COMPATIBILITY</h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-cyan-400">Chrome:</span>
                <span className="text-green-400">v80+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">Firefox:</span>
                <span className="text-green-400">v75+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">Safari:</span>
                <span className="text-green-400">v13+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">Edge:</span>
                <span className="text-green-400">v80+</span>
              </div>
            </div>
          </div>

          <div className="retro-card">
            <h4 className="font-retro text-sm text-yellow-400 mb-3">FEATURES</h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-cyan-400">Real-time:</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">Interactive:</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">Educational:</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400">Retro Style:</span>
                <span className="text-green-400">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions text-center">
        <button
          onClick={() => setScrollingCredits(true)}
          className="retro-btn bg-green-400 text-black mr-4"
         onMouseEnter={() => soundEffects.playButtonClick()}
        >
          <Code className="w-4 h-4 mr-2" />
          VIEW_CREDITS
        </button>
        
      
      </div>

      {/* ASCII Art Logo */}
      <div className="ascii-logo mt-12 text-center">
        <div className="font-mono text-xs text-green-400 leading-3">
          <div>  ╔═══════════════════════════════════════╗</div>
          <div>  ║    ___  ____    ____  _____ _   _     ║</div>
          <div>  ║   / _ \\/ ___|  / ___||  ___| | | |    ║</div>
          <div>  ║  | | | \\___ \\  \\___ \\| |__ | | | |    ║</div>
          <div>  ║  | |_| |___) |  ___) |  __|| |_| |    ║</div>
          <div>  ║   \\___/|____/  |____/|_|    \\___/     ║</div>
          <div>  ║                                       ║</div>
          <div>  ║        SCHEDULER v2.1 - RETRO         ║</div>
          <div>  ╚═══════════════════════════════════════╝</div>
        </div>
        
        <div className="font-mono text-xs text-cyan-400 mt-4">
          * Browser memory limitations apply
        </div>
      </div>
    </motion.div>
  );
};

export default About;