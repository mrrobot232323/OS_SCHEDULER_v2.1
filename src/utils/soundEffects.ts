// Sound Effects Utility
export class SoundEffects {
  private audioContext: AudioContext | null = null;
  private backgroundMusic: OscillatorNode | null = null;
  private isBackgroundPlaying = false;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Web Audio API not supported');
    }
  }

  private createOscillator(frequency: number, type: OscillatorType = 'square'): OscillatorNode | null {
    if (!this.audioContext) return null;
    
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    return oscillator;
  }

  private createGainNode(volume: number = 0.1): GainNode | null {
    if (!this.audioContext) return null;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    return gainNode;
  }

  // Button click sound
  playButtonClick() {
    if (!this.audioContext) return;

    const oscillator = this.createOscillator(800, 'square');
    const gainNode = this.createGainNode(0.05);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Quick beep
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Navigation sound
  playNavigation() {
    if (!this.audioContext) return;

    const oscillator = this.createOscillator(600, 'sine');
    const gainNode = this.createGainNode(0.03);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // Success sound
  playSuccess() {
    if (!this.audioContext) return;

    const oscillator = this.createOscillator(523, 'sine'); // C5
    const gainNode = this.createGainNode(0.08);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Play C-E-G chord progression
    setTimeout(() => {
      const osc2 = this.createOscillator(659, 'sine'); // E5
      const gain2 = this.createGainNode(0.06);
      if (osc2 && gain2) {
        osc2.connect(gain2);
        gain2.connect(this.audioContext!.destination);
        gain2.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.3);
        osc2.start();
        osc2.stop(this.audioContext!.currentTime + 0.3);
      }
    }, 100);
    
    setTimeout(() => {
      const osc3 = this.createOscillator(784, 'sine'); // G5
      const gain3 = this.createGainNode(0.06);
      if (osc3 && gain3) {
        osc3.connect(gain3);
        gain3.connect(this.audioContext!.destination);
        gain3.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.4);
        osc3.start();
        osc3.stop(this.audioContext!.currentTime + 0.4);
      }
    }, 200);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Error/Alert sound
  playError() {
    if (!this.audioContext) return;

    const oscillator = this.createOscillator(200, 'sawtooth');
    const gainNode = this.createGainNode(0.1);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Harsh descending sound
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Deadlock alert sound - dramatic and urgent
  playDeadlockAlert() {
    if (!this.audioContext) return;

    // Create multiple oscillators for a complex alert sound
    const frequencies = [220, 330, 440, 550];
    const duration = 2;
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.createOscillator(freq, 'sawtooth');
        const gainNode = this.createGainNode(0.08);
        
        if (!oscillator || !gainNode) return;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        // Pulsing effect
        const pulseRate = 8; // Hz
        const pulseGain = this.audioContext!.createGain();
        const pulseLFO = this.audioContext!.createOscillator();
        
        pulseLFO.frequency.setValueAtTime(pulseRate, this.audioContext!.currentTime);
        pulseLFO.connect(pulseGain.gain);
        pulseGain.gain.setValueAtTime(0.5, this.audioContext!.currentTime);
        
        oscillator.connect(pulseGain);
        pulseGain.connect(gainNode);
        
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + duration);
        
        oscillator.start();
        pulseLFO.start();
        oscillator.stop(this.audioContext!.currentTime + duration);
        pulseLFO.stop(this.audioContext!.currentTime + duration);
      }, index * 100);
    });
  }

  // Background ambient music

  // Process completion sound
  playProcessComplete() {
    if (!this.audioContext) return;

    const oscillator = this.createOscillator(880, 'sine');
    const gainNode = this.createGainNode(0.05);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.exponentialRampToValueAtTime(1760, this.audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // System startup sound
  playSystemStartup() {
    if (!this.audioContext) return;

    const notes = [220, 277, 330, 440]; // A3, C#4, E4, A4
    
    notes.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.createOscillator(freq, 'sine');
        const gainNode = this.createGainNode(0.06);
        
        if (!oscillator || !gainNode) return;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.3);
      }, index * 150);
    });
  }
}

// Global sound effects instance
export const soundEffects = new SoundEffects();