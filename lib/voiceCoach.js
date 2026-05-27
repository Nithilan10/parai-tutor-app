/**
 * Voice coaching system for Parai practice using Web Speech API
 */

class VoiceCoach {
  constructor() {
    this.synth = null;
    this.enabled = true;
    this.language = 'en-US';
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 0.8;
    
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  /**
   * Speak text with optional language override
   * @param {string} text 
   * @param {{lang?: string, rate?: number, pitch?: number, onEnd?: () => void}} options
   */
  speak(text, options = {}) {
    if (!this.synth || !this.enabled || !text) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || this.language;
    utterance.rate = options.rate || this.rate;
    utterance.pitch = options.pitch || this.pitch;
    utterance.volume = this.volume;

    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    this.synth.speak(utterance);
  }

  /**
   * Count in: "Three, two, one, go!"
   * @param {number} count - Number of beats to count
   * @param {number} intervalMs - Time between counts
   * @param {() => void} onComplete - Called after "go"
   */
  async countIn(count = 4, intervalMs = 1000, onComplete) {
    if (!this.synth || !this.enabled) {
      onComplete?.();
      return;
    }

    const numbers = ['one', 'two', 'three', 'four'];
    
    for (let i = count; i > 0; i--) {
      this.speak(numbers[i - 1]);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    this.speak('go', { 
      rate: 1.2, 
      onEnd: onComplete 
    });
  }

  /**
   * Provide feedback on practice performance
   * @param {Object} report - Feedback report from analysis
   */
  provideFeedback(report) {
    if (!report) return;

    const { comparison, timing } = report;
    
    if (!comparison) return;

    const accuracy = comparison.matched / comparison.targetLength;
    
    let message = '';
    
    if (accuracy === 1.0) {
      message = 'Perfect! All strokes correct. ';
      if (timing?.available && timing.issues?.length === 0) {
        message += 'And your timing is excellent!';
      }
    } else if (accuracy >= 0.8) {
      message = `Good job! ${comparison.matched} out of ${comparison.targetLength} correct. `;
      if (comparison.errors?.length > 0) {
        const firstError = comparison.errors[0];
        if (firstError.type === 'wrong') {
          message += `Watch beat ${firstError.index + 1}.`;
        }
      }
    } else if (accuracy >= 0.5) {
      message = `Keep practicing. You got ${comparison.matched} correct. `;
      message += 'Focus on the stroke order.';
    } else {
      message = `Let's try again. Focus on the pattern: ${report.targetNotation}.`;
    }

    this.speak(message);
  }

  /**
   * Encourage the user
   * @param {'start' | 'good' | 'keep_going' | 'perfect' | 'try_again'} type
   */
  encourage(type = 'good') {
    const phrases = {
      start: ['Let\'s begin', 'Ready to practice', 'Here we go'],
      good: ['Good job', 'Well done', 'Nice work', 'Excellent'],
      keep_going: ['Keep going', 'You can do it', 'Stay focused', 'Almost there'],
      perfect: ['Perfect!', 'Outstanding!', 'Fantastic!', 'Amazing work!'],
      try_again: ['Try again', 'Let\'s retry', 'One more time', 'Give it another shot'],
    };

    const messages = phrases[type] || phrases.good;
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.speak(message);
  }

  /**
   * Announce gesture detected (useful for blind practice)
   * @param {string} gesture
   */
  announceGesture(gesture) {
    if (!this.enabled) return;
    
    const gestureNames = {
      ku: 'ku',
      tha: 'tha',
      theem: 'theem',
      ka: 'ka',
      thi: 'thi',
      thee: 'thee',
    };

    const name = gestureNames[gesture?.toLowerCase()] || gesture;
    this.speak(name, { rate: 1.5, pitch: 1.2 });
  }

  /**
   * Read the target pattern aloud
   * @param {string} pattern - e.g., "ku ku tha"
   */
  readPattern(pattern) {
    if (!pattern) return;
    
    const strokes = pattern.split(/\s+/).filter(Boolean);
    const readable = strokes.join(', ');
    
    this.speak(`Pattern: ${readable}`, { rate: 0.9 });
  }

  /**
   * Tamil language coaching
   * @param {string} text 
   */
  speakTamil(text) {
    this.speak(text, { lang: 'ta-IN', rate: 0.9 });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  setLanguage(lang) {
    this.language = lang;
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  cancel() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

// Singleton instance
let voiceCoach = null;

export function getVoiceCoach() {
  if (!voiceCoach) {
    voiceCoach = new VoiceCoach();
  }
  return voiceCoach;
}

export function initializeVoiceCoach() {
  return getVoiceCoach();
}
