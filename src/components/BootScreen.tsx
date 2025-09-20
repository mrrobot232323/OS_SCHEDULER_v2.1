import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BootScreenProps {
  onComplete: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [currentChar, setCurrentChar] = useState(0);
  const [showEnterPrompt, setShowEnterPrompt] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const bootMessages = [
    'INITIALIZING CPU SCHEDULING MODULES...',
    'LOADING MEMORY MANAGEMENT...',
    'PREPARING PROCESS TABLE...',
    'CONFIGURING DEADLOCK DETECTION...',
    'STARTING RETRO TERMINAL INTERFACE...',
    'SYSTEM DIAGNOSTICS COMPLETE.',
    'WELCOME TO OS SCHEDULER v2.1',
    'ENVIRONMENT READY.'
  ];

  useEffect(() => {
    if (currentLine >= bootMessages.length) {
      setTimeout(() => setShowEnterPrompt(true), 1000);
      return;
    }

    const message = bootMessages[currentLine];
    
    if (currentChar < message.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + message[currentChar]);
        setCurrentChar(currentChar + 1);
      }, 30 + Math.random() * 20);

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentLine(currentLine + 1);
        setDisplayText(prev => prev + '\n> ');
        setCurrentChar(0);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentLine, currentChar]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showEnterPrompt && !isTransitioning) {
        setIsTransitioning(true);
        // Play boot sound effect
        playSound('boot');
        setTimeout(onComplete, 800);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showEnterPrompt, isTransitioning, onComplete]);

  const playSound = (type: string) => {
    // Create audio context for sound effects
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'boot') {
        // Boot sound: ascending beep
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      }
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const handleEnterClick = () => {
    if (showEnterPrompt && !isTransitioning) {
      setIsTransitioning(true);
      playSound('boot');
      setTimeout(onComplete, 800);
    }
  };

  return (
    <motion.div 
      className="boot-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 0.95,
        filter: 'blur(2px)'
      }}
      transition={{ 
        exit: { duration: 0.8, ease: "easeInOut" }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
        color: '#00ff41',
        fontFamily: 'VT323, monospace',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        zIndex: 10000
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '800px',
          textAlign: 'left',
          fontSize: '1.2rem',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap'
        }}
      >
        <div className="terminal-header" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <motion.span 
            className="font-retro"
            style={{
              color: '#00ff41',
              textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
              fontSize: '1.5rem'
            }}
            animate={{
              textShadow: [
                '0 0 10px rgba(0, 255, 65, 0.5)',
                '0 0 15px rgba(0, 255, 65, 0.7)',
                '0 0 10px rgba(0, 255, 65, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            OS SCHEDULER BIOS v2.1
          </motion.span>
        </div>
        
        <div style={{ 
          border: '2px solid #00ff41', 
          padding: '20px', 
          minHeight: '300px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(1px)'
        }}>
          <span>{'> '}</span>
          <span className="typing-effect">
            {displayText}
            <motion.span 
              className="cursor"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              █
            </motion.span>
          </span>
        </div>
      </div>
      
      <motion.div
        className="progress-container"
        style={{
          width: '400px',
          marginTop: '30px'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(0, 255, 65, 0.2)',
            border: '1px solid #00ff41',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00ff41, #00ffff)',
              boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)'
            }}
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentLine + currentChar / (bootMessages[currentLine]?.length || 1)) / bootMessages.length) * 100}%` 
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '10px', 
          fontSize: '0.9rem',
          color: '#00ffff'
        }}>
          {Math.round(((currentLine + currentChar / (bootMessages[currentLine]?.length || 1)) / bootMessages.length) * 100)}% COMPLETE
        </div>
      </motion.div>

      {showEnterPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '40px',
            textAlign: 'center'
          }}
        >
          <motion.button
            onClick={handleEnterClick}
            className="retro-btn"
            style={{
              background: 'transparent',
              border: '2px solid #00ff41',
              color: '#00ff41',
              padding: '12px 30px',
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: '#00ff41',
              color: '#000000',
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)'
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 10px rgba(0, 255, 65, 0.3)',
                '0 0 20px rgba(0, 255, 65, 0.6)',
                '0 0 10px rgba(0, 255, 65, 0.3)'
              ]
            }}
            transition={{ 
              boxShadow: { duration: 2, repeat: Infinity },
              scale: { duration: 0.1 }
            }}
          >
            PRESS ENTER TO CONTINUE
          </motion.button>
          
          <div style={{ 
            marginTop: '15px', 
            fontSize: '0.8rem',
            color: '#00ffff',
            opacity: 0.7
          }}>
            Or click the button above
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BootScreen;