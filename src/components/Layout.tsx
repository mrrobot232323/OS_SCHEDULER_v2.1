import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  HardDrive, 
  List, 
  AlertTriangle, 
  Info, 
  Home,
  Terminal,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

const Layout: React.FC = () => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Smooth page transitions
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleNavClick = () => {
    if (soundEnabled) {
      soundEffects.playNavigation();
    }
  };

  useEffect(() => {
    // Keyboard navigation
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Reset system (go to home)
        window.location.href = '/';
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: 'HOME' },
    { path: '/cpu-scheduling', icon: Cpu, label: 'CPU_SCHEDULER' },
    { path: '/memory-management', icon: HardDrive, label: 'MEMORY_MGR' },
    { path: '/process-table', icon: List, label: 'PROC_TABLE' },
    { path: '/deadlock', icon: AlertTriangle, label: 'DEADLOCK_SIM' },
    { path: '/about', icon: Info, label: 'ABOUT_SYS' }
  ];

  return (
    <div className="layout-container min-h-screen bg-black text-green-400 relative">
      {/* Transition overlay */}
      {isTransitioning && (
        <motion.div
          className="transition-overlay fixed inset-0 bg-black z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Terminal Header */}
      <header className="terminal-header-bar bg-gray-900 border-b-2 border-green-400 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Terminal className="w-6 h-6 text-green-400" />
            <span className="font-retro text-green-400">OS_SCHEDULER_v2.1</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-mono text-cyan-400">
              {currentTime.toLocaleTimeString()}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-sm">SYSTEM_ACTIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="nav-menu bg-black border-b border-green-400 p-4">
        <div className="flex flex-wrap gap-6 md:gap-6 gap-3 overflow-x-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <motion.div key={item.path}>
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`nav-item flex items-center gap-2 px-4 py-2 border transition-all duration-300 whitespace-nowrap ${
                    location.pathname === item.path
                      ? 'border-green-400 bg-green-400 bg-opacity-10 text-green-400'
                      : 'border-gray-700 text-gray-400 hover:border-green-400 hover:text-green-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-retro text-xs hidden sm:inline">{item.label}</span>
                  <span className="font-retro text-xs sm:hidden">{item.label.split('_')[0]}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Command Line Indicator */}
      <div className="command-line bg-gray-900 border-b border-green-400 p-2">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-green-400">root@os-scheduler:</span>
          <span className="text-cyan-400">~{location.pathname}</span>
          <span className="text-green-400">$</span>
          <span className="animate-pulse">█</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Status Bar */}
      <footer className="status-bar bg-gray-900 border-t-2 border-green-400 p-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center font-mono text-xs gap-2 sm:gap-0">
          <div className="flex gap-3 sm:gap-6 flex-wrap">
            <span>CPU: <span className="text-green-400">IDLE</span></span>
            <span>MEM: <span className="text-cyan-400">4.2GB/8GB</span></span>
            <span>PROC: <span className="text-yellow-400">12</span></span>
          </div>
          <div className="flex gap-2 sm:gap-4 flex-wrap text-xs sm:text-xs">
            <span>ESC=RESET</span>
            <span className="hidden sm:inline">ENTER=EXECUTE</span>
            <span className="text-red-400 hidden sm:inline">F12=SHUTDOWN</span>
          </div>
        </div>
      </footer>

      {/* Matrix Rain Background */}
      <div className="matrix-background fixed inset-0 pointer-events-none z-[-1]">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="matrix-column absolute top-0 text-green-400 opacity-20 text-xs font-mono"
            style={{
              left: `${(i * 100) / 50}%`,
              animationDelay: `${Math.random() * 5}s`,
              animation: `matrix-fall ${5 + Math.random() * 10}s linear infinite`
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <div key={j} className="matrix-char">
                {String.fromCharCode(0x30A0 + Math.random() * 96)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes matrix-fall {
          0% {
            transform: translateY(-100vh);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        
        .matrix-char {
          line-height: 1.2;
          animation: char-flicker 0.5s infinite alternate;
        }
        
        @keyframes char-flicker {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Layout;