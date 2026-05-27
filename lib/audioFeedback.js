/**
 * Real-time audio feedback for gesture detection.
 * Plays immediate drum sounds and provides audio cues for practice.
 */

class AudioFeedbackManager {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.enabled = true;
    this.volume = 0.7;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Preload drum sounds
      await this.loadDrumSounds();
      
      this.initialized = true;
    } catch (error) {
      console.warn('[AudioFeedback] Failed to initialize:', error);
    }
  }

  async loadDrumSounds() {
    const sounds = {
      ku: '/audio/ku.wav',
      tha: '/audio/tha.wav',
      theem: '/audio/theem.wav',
      ka: '/audio/ka.wav',
      thi: '/audio/thi.wav',
    };

    const loadPromises = Object.entries(sounds).map(async ([name, url]) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          this.sounds.set(name, audioBuffer);
        }
      } catch (error) {
        console.warn(`[AudioFeedback] Failed to load ${name}:`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Play drum sound for gesture
   * @param {string} gesture - ku, tha, theem, etc.
   * @param {number} [gainMultiplier=1] - Volume multiplier (0-2)
   */
  playGesture(gesture, gainMultiplier = 1) {
    if (!this.enabled || !this.audioContext || !this.initialized) return;

    const normalizedGesture = gesture?.toLowerCase()?.trim();
    let buffer = this.sounds.get(normalizedGesture);
    
    // Fallback mappings
    if (!buffer && (normalizedGesture === 'thi' || normalizedGesture === 'thee')) {
      buffer = this.sounds.get('ku');
    }
    if (!buffer && normalizedGesture === 'ka') {
      buffer = this.sounds.get('tha');
    }

    if (!buffer) {
      // Fallback to click sound if no audio file
      this.playClickSound();
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      gainNode.gain.value = this.volume * gainMultiplier;
      source.start(0);
    } catch (error) {
      console.warn('[AudioFeedback] Playback error:', error);
    }
  }

  /**
   * Play a simple click/beep sound using oscillator
   */
  playClickSound(frequency = 800, duration = 0.05) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('[AudioFeedback] Click sound error:', error);
    }
  }

  /**
   * Play metronome tick
   * @param {boolean} isDownbeat - True for first beat of measure
   */
  playMetronomeTick(isDownbeat = false) {
    const frequency = isDownbeat ? 1200 : 800;
    const duration = isDownbeat ? 0.08 : 0.05;
    this.playClickSound(frequency, duration);
  }

  /**
   * Play count-in beep
   * @param {number} count - Beat number (1-4)
   */
  playCountIn(count) {
    const frequencies = [1000, 1000, 1000, 1200];
    this.playClickSound(frequencies[count - 1] || 1000, 0.1);
  }

  /**
   * Play success/correct sound
   */
  playSuccess() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const now = this.audioContext.currentTime;
      
      // Play ascending notes
      oscillator.frequency.setValueAtTime(523, now); // C5
      oscillator.frequency.setValueAtTime(659, now + 0.1); // E5
      oscillator.frequency.setValueAtTime(784, now + 0.2); // G5

      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(this.volume * 0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      oscillator.start(now);
      oscillator.stop(now + 0.4);
    } catch (error) {
      console.warn('[AudioFeedback] Success sound error:', error);
    }
  }

  /**
   * Play error/incorrect sound
   */
  playError() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const now = this.audioContext.currentTime;
      
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.setValueAtTime(300, now + 0.1);

      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(this.volume * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      oscillator.start(now);
      oscillator.stop(now + 0.25);
    } catch (error) {
      console.warn('[AudioFeedback] Error sound error:', error);
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Singleton instance
let audioManager = null;

export function getAudioFeedback() {
  if (!audioManager) {
    audioManager = new AudioFeedbackManager();
  }
  return audioManager;
}

export async function initializeAudioFeedback() {
  const manager = getAudioFeedback();
  await manager.initialize();
  return manager;
}
