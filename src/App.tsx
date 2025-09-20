import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BootScreen from './components/BootScreen';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CPUScheduling from './pages/CPUScheduling';
import MemoryManagement from './pages/MemoryManagement';
import ProcessTable from './pages/ProcessTable';
import DeadlockSimulation from './pages/DeadlockSimulation';
import About from './pages/About';
import './styles/retro.css';

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [systemReady, setSystemReady] = useState(false);

  useEffect(() => {
    // Boot sequence timing
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
      setSystemReady(true);
    }, 8000);

    return () => clearTimeout(bootTimer);
  }, []);

  if (isBooting) {
    return <BootScreen onComplete={() => setIsBooting(false)} />;
  }

  return (
    <Router>
      <div className="retro-container">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="cpu-scheduling" element={<CPUScheduling />} />
              <Route path="memory-management" element={<MemoryManagement />} />
              <Route path="process-table" element={<ProcessTable />} />
              <Route path="deadlock" element={<DeadlockSimulation />} />
              <Route path="about" element={<About />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;