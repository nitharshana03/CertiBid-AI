// CertiBid AI - Timeline Component
import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

export function Timeline({ steps = [] }) {
  return (
    <div className="space-y-4">
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'completed' || step.completed;
        const isCurrent = step.status === 'current' || step.current;

        return (
          <div key={idx} className="flex items-start gap-3 relative">
            {idx < steps.length - 1 && (
              <div
                className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 ${
                  isCompleted ? 'bg-[#20C997]' : 'bg-[#1B5968]'
                }`}
              />
            )}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                isCompleted
                  ? 'bg-[#20C997] text-[#071F2A]'
                  : isCurrent
                  ? 'bg-[#14D9D5] text-[#071F2A] animate-pulse'
                  : 'bg-[#103D4A] text-[#6F9BA3] border border-[#1B5968]'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : isCurrent ? (
                <Clock className="w-4 h-4" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <p className={`font-bold ${isCurrent ? 'text-[#14D9D5]' : isCompleted ? 'text-white' : 'text-[#A7C9CE]'}`}>
                {step.title || step.label}
              </p>
              {step.date && <p className="text-[10px] text-[#6F9BA3] mt-0.5">{step.date}</p>}
              {step.description && <p className="text-[11px] text-[#A7C9CE] mt-0.5">{step.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
