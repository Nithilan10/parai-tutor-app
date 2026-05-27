"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check, Camera, Hand, Volume2 } from "lucide-react";

/**
 * Interactive onboarding tutorial for first-time users
 */
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Parai Tutor',
    icon: Hand,
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-200">
          Parai Tutor helps you learn the Tamil frame drum using <strong>computer vision</strong> and <strong>AI feedback</strong>.
        </p>
        <div className="glass-panel p-4 rounded-xl border-red-500/20">
          <h4 className="text-sm font-bold text-red-400 mb-2">What you'll learn:</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>Three basic strokes: <strong>Ku</strong> (right), <strong>Tha</strong> (left), <strong>Theem</strong> (both)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>Rhythm patterns called <strong>Nilai</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>Real-time gesture recognition and feedback</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'camera-setup',
    title: 'Camera Setup',
    icon: Camera,
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-200">
          Position yourself in front of the camera for best results:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl border-emerald-500/20">
            <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Check size={16} />
              DO
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Sit 3-4 feet from camera</li>
              <li>• Keep hands visible</li>
              <li>• Good lighting (face camera)</li>
              <li>• Plain background helps</li>
            </ul>
          </div>
          <div className="glass-panel p-4 rounded-xl border-red-500/20">
            <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
              <X size={16} />
              DON'T
            </h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>• Too close or too far</li>
              <li>• Hands out of frame</li>
              <li>• Backlit (dark face)</li>
              <li>• Cluttered background</li>
            </ul>
          </div>
        </div>
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
          <p className="text-sm text-cyan-200">
            <strong>Pro tip:</strong> You don't need an actual parai drum! Just mimic the hand movements.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'strokes',
    title: 'The Three Strokes',
    icon: Hand,
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-200">Master these three basic strokes:</p>
        
        <div className="space-y-3">
          <div className="glass-panel p-4 rounded-xl border-red-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center text-red-400 font-black">
                கு
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-400">Ku / Thi (கு / தி)</h4>
                <p className="text-xs text-slate-400">Right hand strike</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              Strike with your <strong>right hand</strong> toward the imaginary drum head. 
              Move hand inward toward your body in a quick motion.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-xl border-amber-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-600/20 rounded-lg flex items-center justify-center text-amber-400 font-black">
                த
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-400">Tha (த)</h4>
                <p className="text-xs text-slate-400">Left hand strike</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              Strike with your <strong>left hand</strong> toward the drum. 
              Same inward motion, but use your non-dominant hand.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-xl border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 font-black">
                தீம்
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-400">Theem (தீம்)</h4>
                <p className="text-xs text-slate-400">Both hands together</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              Strike with <strong>both hands simultaneously</strong> in a strong, synchronized motion. 
              This is the loudest, most powerful stroke.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'practice',
    title: 'Practice Mode',
    icon: Volume2,
    content: (
      <div className="space-y-4">
        <p className="text-lg text-slate-200">
          Try your first practice session:
        </p>
        
        <div className="glass-panel p-4 rounded-xl border-indigo-500/20">
          <h4 className="text-sm font-bold text-indigo-400 mb-3">Quick Practice Steps:</h4>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <div className="text-sm text-slate-300">
                <strong className="text-white">Choose a Nilai</strong> from the tutorials hub
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <div className="text-sm text-slate-300">
                <strong className="text-white">Enable camera</strong> and position yourself
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <div className="text-sm text-slate-300">
                <strong className="text-white">Play the pattern</strong> and listen carefully
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <div className="text-sm text-slate-300">
                <strong className="text-white">Mimic the strokes</strong> - the AI will detect them!
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">5</span>
              <div className="text-sm text-slate-300">
                <strong className="text-white">Get AI feedback</strong> on accuracy and timing
              </div>
            </li>
          </ol>
        </div>

        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <p className="text-sm text-emerald-200">
            <strong>Remember:</strong> Practice makes perfect! Start slow, focus on accuracy first, then speed up.
          </p>
        </div>
      </div>
    ),
  },
];

export default function OnboardingTutorial({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('parai_tutorial_completed');
    if (hasSeenTutorial) {
      setShow(false);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('parai_tutorial_completed', 'true');
    setShow(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem('parai_tutorial_completed', 'true');
    setShow(false);
    onSkip?.();
  };

  if (!show) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border-2 border-red-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
              <StepIcon className="text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{step.title}</h2>
              <p className="text-sm text-slate-400">
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Skip tutorial"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[400px]">
          {step.content}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-colors font-bold flex items-center gap-2"
            >
              {isLastStep ? (
                <>
                  Start Learning
                  <Check size={16} />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-4">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-red-500 w-6'
                  : idx < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-700'
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
