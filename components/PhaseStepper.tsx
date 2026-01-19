import React from 'react';
import { SEOPhase } from '../types';

interface PhaseStepperProps {
  currentPhase: SEOPhase;
  onPhaseClick: (phase: SEOPhase) => void;
  canNavigateTo: (phase: SEOPhase) => boolean;
}

const steps = [
  { id: SEOPhase.CONFIG, label: '1. Config' },
  { id: SEOPhase.BLUEPRINT, label: '2. Blueprint' },
  { id: SEOPhase.GENERATION, label: '3. Generate' },
];

const PhaseStepper: React.FC<PhaseStepperProps> = ({ currentPhase, onPhaseClick, canNavigateTo }) => {
  // Helper to determine active index
  const activeIndex = steps.findIndex(s => s.id === currentPhase);
  // Handle 'DONE' state which implies completion of all steps
  const effectiveIndex = currentPhase === SEOPhase.DONE ? steps.length : activeIndex;

  return (
    <div className="hidden md:block">
      <div className="flex items-center gap-4 relative">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-900 -z-10"></div>
        
        {steps.map((step, index) => {
          const isActive = step.id === currentPhase || (step.id === SEOPhase.GENERATION && currentPhase === SEOPhase.DONE);
          const isCompleted = index < effectiveIndex || currentPhase === SEOPhase.DONE;
          const clickable = canNavigateTo(step.id);

          return (
            <button 
              key={step.id} 
              disabled={!clickable}
              onClick={() => onPhaseClick(step.id)}
              className={`flex flex-col items-center relative group min-w-[90px] transition-all focus:outline-none ${clickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
            >
              <div 
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center border-2 border-slate-900 transition-all duration-300 z-10
                  ${isActive ? 'bg-[#EBC9EE] scale-110 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 
                    isCompleted ? 'bg-[#C7F0C9] text-slate-900 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-slate-400'}
                  ${clickable && !isActive ? 'hover:-translate-y-1' : ''}
                `}
              >
                {isCompleted && !isActive ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <span className={`text-sm font-black ${isActive ? 'text-slate-900' : ''}`}>{index + 1}</span>
                )}
              </div>
              <div className={`
                 absolute -bottom-7 text-[10px] font-black uppercase tracking-wider bg-white px-2 py-0.5 border-2 border-slate-900 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                 ${isActive ? 'opacity-100 translate-y-0 bg-[#EBC9EE]' : 'opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}
                 transition-all
              `}>
                {step.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(PhaseStepper);