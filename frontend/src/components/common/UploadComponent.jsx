// CertiBid AI - File Upload Component
import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, X, AlertCircle } from 'lucide-react';

export function UploadComponent({ 
  onFileUpload, 
  onUploadSuccess, 
  label = "Upload Verification Document", 
  accept = ".pdf,.jpg,.jpeg,.png",
  disabled = false,
  error = null 
}) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    if (onFileUpload) {
      onFileUpload(selectedFile);
    }
    if (onUploadSuccess) {
      onUploadSuccess({
        file: selectedFile,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile)
      });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-[#A7C9CE]">{label}</label>}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
          disabled 
            ? 'opacity-60 cursor-not-allowed border-[#1B5968] bg-[#0B3442]/30'
            : dragOver 
              ? 'border-[#14D9D5] bg-[#14D9D5]/10 scale-[1.005]' 
              : error
                ? 'border-rose-500/50 bg-rose-950/10 hover:border-rose-400'
                : 'border-[#1B5968] bg-[#0B3442]/60 hover:bg-[#0B3442] hover:border-[#06B6B4]'
        }`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          id="upload-input"
          type="file"
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center justify-between w-full max-w-md px-3 py-2 rounded-xl bg-[#103D4A]/80 border border-[#1B5968] text-xs text-white">
            <div className="flex items-center gap-3 overflow-hidden">
              <File className="w-5 h-5 text-[#14D9D5] shrink-0" />
              <div className="overflow-hidden">
                <p className="font-bold truncate text-white">{file.name}</p>
                <p className="text-[10px] text-[#A7C9CE]">
                  {(file.size / 1024 > 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB')} • Ready for upload
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#20C997]" />
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-[#A7C9CE] hover:text-rose-300 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <UploadCloud className="w-8 h-8 text-[#14D9D5] mb-2" />
            <p className="text-xs font-bold text-white">
              Drag & drop your files or <span className="text-[#14D9D5] underline hover:text-[#06B6B4]">Browse</span>
            </p>
            <p className="text-[10px] text-[#A7C9CE] mt-1">Supports PDF, PNG, JPG/JPEG up to 25MB</p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5 mt-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
