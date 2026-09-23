// CertiBid AI - Auditor Role Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskScoreBadge } from '../../components/common/RiskScoreBadge';
import {
  ShieldAlert,
  FileSearch,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Search,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export function AuditorDashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getDocuments(),
      apiService.getAuditLogs(),
      apiService.getVendors()
    ]).then(([dRes, aRes, vRes]) => {
      setDocuments(Array.isArray(dRes?.data) ? dRes.data : []);
      setAuditLogs(Array.isArray(aRes?.data) ? aRes.data : []);
      setVendors(Array.isArray(vRes?.data) ? vRes.data : []);
      setLoading(false);
    }).catch(() => {
      setDocuments([]);
      setAuditLogs([]);
      setVendors([]);
      setLoading(false);
    });
  }, []);

  const pendingDocs = (Array.isArray(documents) ? documents : []).filter(d => d.status === 'Under Review' || d.status === 'Flagged');

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      {/* Auditor Header */}
      <div className="p-6 rounded-3xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#14D9D5] text-xs font-bold uppercase tracking-wider mb-1">
            <FileSearch className="w-4 h-4 text-[#06B6B4]" /> National Anti-Corruption & Audit Station
          </div>
          <h2 className="text-2xl font-extrabold text-white">Compliance & Risk Audit Command</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">Audit verification queue, AI price anomaly flags, and corporate integrity heatmaps.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#103D4A] px-4 py-2 rounded-2xl border border-[#1B5968] text-[#F4C95D] text-xs font-bold">
          <AlertOctagon className="w-4 h-4 text-[#F4C95D]" />
          <span>{pendingDocs.length} Verification Requests Queued</span>
        </div>
      </div>

      {/* Auditor Heatmap / Risk Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
          <span className="text-xs font-bold text-[#A7C9CE]">Compliance Pass Rate</span>
          <p className="text-2xl font-extrabold text-[#20C997] mt-2">91.4%</p>
          <span className="text-[10px] text-[#A7C9CE]">+2.1% across FY26 tenders</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
          <span className="text-xs font-bold text-[#A7C9CE]">Document AI OCR Accuracy</span>
          <p className="text-2xl font-extrabold text-[#14D9D5] mt-2">98.8%</p>
          <span className="text-[10px] text-[#A7C9CE]">Automated forgery scan rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
          <span className="text-xs font-bold text-[#A7C9CE]">Price Anomaly Flag Rate</span>
          <p className="text-2xl font-extrabold text-[#F4C95D] mt-2">4.2%</p>
          <span className="text-[10px] text-[#A7C9CE]">Predatory pricing triggers</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
          <span className="text-xs font-bold text-[#A7C9CE]">Blacklisted Entities</span>
          <p className="text-2xl font-extrabold text-[#FF6B7A] mt-2">1 Entity</p>
          <span className="text-[10px] text-[#A7C9CE]">OmniRoad Group (Litigation)</span>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Document Verification Queue</h3>
            <p className="text-xs text-[#A7C9CE]">Vendor tax certificates, ISO audits, and financial statements pending audit</p>
          </div>
          <button onClick={() => navigate('/documents')} className="text-xs font-bold text-[#14D9D5] hover:underline cursor-pointer">Full Document Hub →</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1B5968] text-[#A7C9CE] bg-[#0B3442]">
                <th className="py-2.5 px-3 font-semibold">Document Title</th>
                <th className="py-2.5 px-3 font-semibold">Vendor Name</th>
                <th className="py-2.5 px-3 font-semibold">Document Type</th>
                <th className="py-2.5 px-3 font-semibold">AI Scan Confidence</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B5968]">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-[#145364]/50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-white">{doc.title}</p>
                    <p className="text-[10px] text-[#A7C9CE]">{doc.id} • Uploaded: {doc.uploadedAt}</p>
                  </td>
                  <td className="py-3 px-3 font-medium text-white">{doc.vendorName}</td>
                  <td className="py-3 px-3 text-[#A7C9CE]">{doc.documentType}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      doc.aiConfidence > 80 ? 'bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/30' : 'bg-[#F4C95D]/20 text-[#F4C95D] border border-[#F4C95D]/30'
                    }`}>
                      {doc.aiConfidence}% Match
                    </span>
                  </td>
                  <td className="py-3 px-3"><StatusBadge status={doc.status} /></td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => navigate('/documents')}
                      className="px-3 py-1 bg-[#06B6B4] hover:bg-[#14D9D5] text-white rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
        <h3 className="text-sm font-bold text-white mb-3">Compliance Audit Trail Stream</h3>
        <div className="space-y-2 text-xs">
          {auditLogs.map(log => (
            <div key={log.id} className="p-3 rounded-xl bg-[#0B3442] border border-[#1B5968] flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{log.action}</p>
                <p className="text-[10px] text-[#A7C9CE]">By {log.user} ({log.userRole}) • IP: {log.ipAddress}</p>
              </div>
              <span className="text-[10px] text-[#A7C9CE]">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
