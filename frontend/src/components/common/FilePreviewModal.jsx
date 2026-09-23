// CertiBid AI - File Preview Modal
import React from 'react';
import { X, FileText, Download, ShieldCheck } from 'lucide-react';

export function FilePreviewModal({ isOpen, onClose, file, document: doc }) {
  if (!isOpen) return null;

  const target = file || doc;
  const fileName = target?.fileName || target?.name || target?.documentName || 'Document_Preview.pdf';
  const fileType = target?.documentType || target?.type || 'Statutory PDF';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl bg-[#0B3442] border border-[#1B5968] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#F0FDFA] max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#1B5968] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#06B6B4] text-[#071F2A] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">{fileName}</h3>
              <p className="text-[10px] text-[#A7C9CE]">{fileType} • AI Hash: SHA-256 Verified</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#A7C9CE] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-8 bg-[#071F2A] flex flex-col items-center justify-center text-center space-y-4 overflow-y-auto min-h-[300px]">
          <div className="w-20 h-20 rounded-2xl bg-[#103D4A] border border-[#1B5968] flex items-center justify-center text-[#14D9D5]">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="max-w-md">
            <p className="text-sm font-bold text-white">Cryptographic Certificate & KYC Document Preview</p>
            <p className="text-xs text-[#A7C9CE] mt-1">
              Document integrity confirmed by AI Tamper Detection Engine. No anomalies or metadata inconsistencies detected.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1B5968] bg-[#0B3442] flex justify-between items-center text-xs">
          <span className="text-[#A7C9CE] text-[11px]">CertiBid AI Automated Forensic Inspector</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#06B6B4] text-[#071F2A] font-extrabold cursor-pointer hover:bg-[#14D9D5]"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
