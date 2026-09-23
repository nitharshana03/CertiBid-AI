// CertiBid AI - StatusBadge Component
import React from 'react';

export function StatusBadge({ status, text }) {
  const label = text || status || 'Pending';
  const norm = String(status || '').toLowerCase().trim();

  let bgClass = 'bg-slate-700/50 text-slate-300 border-slate-600/50';

  if (norm.includes('award') || norm.includes('active') || norm.includes('verified') || norm.includes('completed') || norm.includes('selected') || norm.includes('eligible') || norm.includes('low')) {
    bgClass = 'bg-[#20C997]/15 text-[#20C997] border-[#20C997]/30';
  } else if (norm.includes('reject') || norm.includes('critical') || norm.includes('high') || norm.includes('failed') || norm.includes('blacklisted')) {
    bgClass = 'bg-[#FF6B7A]/15 text-[#FF6B7A] border-[#FF6B7A]/30';
  } else if (norm.includes('escalat') || norm.includes('medium') || norm.includes('pending') || norm.includes('review')) {
    bgClass = 'bg-[#F4C95D]/15 text-[#F4C95D] border-[#F4C95D]/30';
  } else if (norm.includes('submit') || norm.includes('registered')) {
    bgClass = 'bg-[#06B6B4]/15 text-[#14D9D5] border-[#06B6B4]/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${bgClass}`}>
      {label}
    </span>
  );
}
