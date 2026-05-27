/**
 * Optimized gesture recognition utilities
 * Reduce latency and improve accuracy
 */

/**
 * Worker pool for parallel processing
 */
class GestureWorkerPool {
  constructor(size = 2) {
    this.workers = [];
    this.size = size;
    this.taskQueue = [];
    this.activeWorkers = new Set();
  }

  async initialize() {
    // Initialize worker pool if needed
    // For now, use main thread with optimized algorithms
  }

  process(data) {
    // Process gesture data with optimized algorithms
    return this.optimizedGestureDetection(data);
  }

  optimizedGestureDetection(landmarks) {
    // Use spatial hashing for faster neighbor queries
    // Implement early rejection for impossible gestures
    return landmarks;
  }
}

/**
 * Confidence scoring for gestures
 */
export class GestureConfidenceCalculator {
  constructor() {
    this.history = [];
    this.maxHistory = 10;
  }

  /**
   * Calculate confidence score for a detected gesture
   * @param {Object} gesture
   * @param {Object} metrics - Detection metrics (rate, dist, etc.)
   * @returns {number} Confidence 0-1
   */
  calculateConfidence(gesture, metrics) {
    let confidence = 0.5; // Base confidence

    // Factor 1: Gesture strength (rate of approach)
    const { rate = 0, dist = 1, strong = false } = metrics || {};
    
    if (strong) {
      confidence += 0.3;
    } else if (rate > 0.0003) {
      confidence += 0.2;
    } else if (rate > 0.0002) {
      confidence += 0.1;
    }

    // Factor 2: Distance proximity (closer = more confident)
    if (dist < 0.15) {
      confidence += 0.15;
    } else if (dist < 0.25) {
      confidence += 0.05;
    }

    // Factor 3: Consistency with recent history
    const recentSimilar = this.history.filter(h => 
      h.gesture === gesture && Date.now() - h.timestamp < 2000
    ).length;
    
    if (recentSimilar > 2) {
      confidence += 0.05;
    }

    // Cap confidence
    confidence = Math.min(1.0, Math.max(0, confidence));

    // Add to history
    this.history.push({
      gesture,
      confidence,
      timestamp: Date.now(),
    });

    // Trim history
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    return confidence;
  }

  /**
   * Get average confidence for gesture type
   */
  getAverageConfidence(gesture) {
    const relevant = this.history.filter(h => h.gesture === gesture);
    if (relevant.length === 0) return 0;
    
    const sum = relevant.reduce((acc, h) => acc + h.confidence, 0);
    return sum / relevant.length;
  }

  reset() {
    this.history = [];
  }
}

/**
 * Adaptive thresholds based on user performance
 */
export class AdaptiveThresholds {
  constructor() {
    this.baselineEstablished = false;
    this.userProfile = {
      avgStrikeStrength: 0.0003,
      avgStrikeDistance: 0.2,
      preferredSpeed: 1.0,
    };
    this.samples = [];
    this.maxSamples = 50;
  }

  /**
   * Record a successful gesture
   */
  recordGesture(metrics) {
    this.samples.push({
      ...metrics,
      timestamp: Date.now(),
    });

    if (this.samples.length > this.maxSamples) {
      this.samples = this.samples.slice(-this.maxSamples);
    }

    // Update profile after enough samples
    if (this.samples.length >= 20 && !this.baselineEstablished) {
      this.updateProfile();
      this.baselineEstablished = true;
    } else if (this.samples.length % 10 === 0) {
      this.updateProfile();
    }
  }

  updateProfile() {
    const recent = this.samples.slice(-20);
    
    const avgRate = recent.reduce((sum, s) => sum + (s.rate || 0), 0) / recent.length;
    const avgDist = recent.reduce((sum, s) => sum + (s.dist || 0), 0) / recent.length;
    
    this.userProfile.avgStrikeStrength = avgRate;
    this.userProfile.avgStrikeDistance = avgDist;
  }

  /**
   * Get adjusted thresholds for this user
   */
  getAdjustedThresholds() {
    if (!this.baselineEstablished) {
      return {
        rateRight: 0.00018,
        rateLeft: 0.00026,
        minDist: 0.0011,
      };
    }

    // Adjust based on user's typical performance
    const strengthMultiplier = this.userProfile.avgStrikeStrength / 0.0003;
    
    return {
      rateRight: 0.00018 * Math.max(0.7, Math.min(1.3, strengthMultiplier)),
      rateLeft: 0.00026 * Math.max(0.7, Math.min(1.3, strengthMultiplier)),
      minDist: 0.0011 * Math.max(0.8, Math.min(1.2, 1 / strengthMultiplier)),
    };
  }

  reset() {
    this.samples = [];
    this.baselineEstablished = false;
  }
}

/**
 * Frame skipping for performance
 * Skip frames intelligently to reduce processing load
 */
export class SmartFrameSkipper {
  constructor() {
    this.frameCount = 0;
    this.lastProcessedTime = 0;
    this.targetFPS = 30; // Process 30 FPS max
    this.dynamicSkip = false;
  }

  shouldProcess(currentTime) {
    const minInterval = 1000 / this.targetFPS;
    
    if (currentTime - this.lastProcessedTime < minInterval) {
      return false;
    }

    this.lastProcessedTime = currentTime;
    return true;
  }

  /**
   * Adjust target FPS based on performance
   */
  adjustTargetFPS(avgProcessingTime) {
    if (avgProcessingTime > 40) {
      // Slow device, reduce to 20 FPS
      this.targetFPS = 20;
    } else if (avgProcessingTime > 25) {
      this.targetFPS = 25;
    } else {
      this.targetFPS = 30;
    }
  }
}

/**
 * Gesture prediction (predict next likely gesture)
 */
export class GesturePredictor {
  constructor() {
    this.patterns = new Map();
  }

  /**
   * Record gesture sequence
   */
  recordSequence(gestures) {
    for (let i = 0; i < gestures.length - 1; i++) {
      const current = gestures[i];
      const next = gestures[i + 1];
      
      const key = current;
      if (!this.patterns.has(key)) {
        this.patterns.set(key, {});
      }
      
      const transitions = this.patterns.get(key);
      transitions[next] = (transitions[next] || 0) + 1;
    }
  }

  /**
   * Predict next gesture
   */
  predictNext(currentGesture) {
    const transitions = this.patterns.get(currentGesture);
    if (!transitions) return null;

    let maxCount = 0;
    let predicted = null;

    for (const [gesture, count] of Object.entries(transitions)) {
      if (count > maxCount) {
        maxCount = count;
        predicted = gesture;
      }
    }

    return predicted;
  }
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      avgProcessingTime: 0,
      droppedFrames: 0,
      totalFrames: 0,
    };
    this.samples = [];
    this.lastUpdate = Date.now();
  }

  recordFrame(processingTime, dropped = false) {
    this.metrics.totalFrames++;
    
    if (dropped) {
      this.metrics.droppedFrames++;
      return;
    }

    this.samples.push({
      time: processingTime,
      timestamp: Date.now(),
    });

    if (this.samples.length > 60) {
      this.samples = this.samples.slice(-60);
    }

    // Update metrics every second
    const now = Date.now();
    if (now - this.lastUpdate > 1000) {
      this.updateMetrics();
      this.lastUpdate = now;
    }
  }

  updateMetrics() {
    if (this.samples.length === 0) return;

    const recent = this.samples.slice(-30);
    this.metrics.avgProcessingTime = 
      recent.reduce((sum, s) => sum + s.time, 0) / recent.length;
    
    this.metrics.fps = recent.length;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
