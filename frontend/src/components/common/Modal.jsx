// CertiBid AI - Generic Modal Component
import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className={`w-full ${maxWidth} bg-[#0B3442] border border-[#1B5968] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#F0FDFA] max-h-[90vh]`}>
        {/* Header */}
        <div className="p-4 border-b border-[#1B5968] flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-white">{title}</h3>
          <button onClick={onClose} className="p-1 text-[#A7C9CE] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
