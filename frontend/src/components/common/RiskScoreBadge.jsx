// CertiBid AI - RiskScoreBadge Component
import React from 'react';

export function RiskScoreBadge({ score = 0, level, showLabel = true }) {
  const numScore = Number(score) || 0;
  let colorClass = 'bg-[#20C997]/20 text-[#20C997] border-[#20C997]/40';
  let riskText = level || (numScore > 70 ? 'High' : numScore > 30 ? 'Medium' : 'Low');

  if (numScore > 70 || riskText.toLowerCase() === 'high' || riskText.toLowerCase() === 'critical') {
    colorClass = 'bg-[#FF6B7A]/20 text-[#FF6B7A] border-[#FF6B7A]/40';
    riskText = 'High';
  } else if (numScore > 30 || riskText.toLowerCase() === 'medium') {
    colorClass = 'bg-[#F4C95D]/20 text-[#F4C95D] border-[#F4C95D]/40';
    riskText = 'Medium';
  } else {
    colorClass = 'bg-[#20C997]/20 text-[#20C997] border-[#20C997]/40';
    riskText = 'Low';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${colorClass}`}>
      <span>{numScore}</span>
      {showLabel && <span className="opacity-80 font-normal">({riskText})</span>}
    </span>
  );
}
