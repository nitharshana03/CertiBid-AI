// CertiBid AI - Procurement Officer Role Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskScoreBadge } from '../../components/common/RiskScoreBadge';
import {
  Gavel,
  Clock,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  FileText,
  Plus,
  ArrowRight,
  ShieldAlert,
  Calendar
} from 'lucide-react';

export function OfficerDashboard() {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [bids, setBids] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getTenders(),
      apiService.getBids(),
      apiService.getEscalations()
    ]).then(([tRes, bRes, eRes]) => {
      setTenders(Array.isArray(tRes?.data) ? tRes.data : []);
      setBids(Array.isArray(bRes?.data) ? bRes.data : []);
      setEscalations(Array.isArray(eRes?.data) ? eRes.data : []);
      setLoading(false);
    }).catch(() => {
      setTenders([]);
      setBids([]);
      setEscalations([]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      {/* Officer Welcome Header */}
      <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#14D9D5] text-xs font-bold uppercase tracking-wider mb-1">
            <Gavel className="w-4 h-4 text-[#06B6B4]" /> Officer Operations Control
          </div>
          <h2 className="text-2xl font-extrabold text-white">Procurement Officer Workstation</h2>
          <p className="text-xs text-[#A7C9CE] mt-1">Review active tenders, evaluate incoming bids, and process evaluation queues.</p>
        </div>
        <button
          onClick={() => navigate('/tenders/create')}
          className="px-5 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-bold text-xs shadow-lg border border-[#06B6B4] flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New RFP / Tender
        </button>
      </div>

      {/* Escalated Bids Workflow Desk for Officer */}
      <div className="p-5 rounded-2xl bg-[#0B3442] border-2 border-[#06B6B4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#06B6B4]/10 text-[#14D9D5] border border-[#06B6B4]/30 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base">Escalated Bids Governance Tracker</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#06B6B4] text-white font-extrabold text-[11px]">
                {escalations.length} Active Escalations
              </span>
            </div>
            <p className="text-xs text-[#A7C9CE] mt-0.5">
              Track officer-escalated bids, view Admin governance recommendations, and record final procurement award decisions.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard/escalated-bids')}
          className="px-5 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
        >
          Open Escalated Bids Desk →
        </button>
      </div>

      {/* Task & Deadlines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Priority Tasks */}
        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#14D9D5]" /> Today's Action Queue
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#0B3442] border border-[#1B5968] flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Evaluate 5 Smart City Bids</p>
                <p className="text-[10px] text-[#A7C9CE]">Deadline: Today 17:00</p>
              </div>
              <button onClick={() => navigate('/tenders')} className="px-2.5 py-1 bg-[#06B6B4] hover:bg-[#14D9D5] text-white font-bold rounded-lg text-[10px] cursor-pointer">Review</button>
            </div>

            <div className="p-3 rounded-xl bg-[#0B3442] border border-[#1B5968] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#F4C95D]">Sign Off Winner Award Letter</p>
                <p className="text-[10px] text-[#A7C9CE]">TND-2026-8904</p>
              </div>
              <button onClick={() => navigate('/decision')} className="px-2.5 py-1 bg-[#F4C95D] hover:bg-[#F4C95D]/80 text-[#071F2A] font-bold rounded-lg text-[10px] cursor-pointer">Approve</button>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-[#20C997]" /> Upcoming Tender Deadlines
          </h3>
          <div className="space-y-2.5 text-xs">
            {tenders.filter(t => t.status === 'Active').map(t => (
              <div key={t.id} className="p-3 rounded-xl border border-[#1B5968] bg-[#0B3442] flex items-center justify-between">
                <div>
                  <p className="font-bold text-white truncate max-w-[180px]">{t.title}</p>
                  <p className="text-[10px] text-[#A7C9CE]">Submission Closes: {t.submissionDeadline}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#103D4A] text-[#14D9D5] border border-[#1B5968]">
                  {t.bidsCount} Bids
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="p-6 rounded-2xl bg-[#103D4A] text-white border border-[#1B5968] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#22C7D6] text-xs font-bold mb-2">
              <Sparkles className="w-4 h-4 text-[#22C7D6]" /> AI Officer Copilot Suggestion
            </div>
            <p className="text-xs font-medium text-[#A7C9CE] leading-relaxed">
              "Bid <span className="font-bold text-[#F4C95D]">BID-9013</span> from BuildCorp Heavy Industries exhibits a -29.2% price anomaly. Recommend referring to the Auditor Queue before technical scoring."
            </p>
          </div>
          <button
            onClick={() => navigate('/risk-analysis?bid=BID-9013')}
            className="mt-4 px-4 py-2 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] border border-[#06B6B4] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Inspect AI Risk Report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tender Progress & Evaluation Queue */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Tender Lifecycle Progress Tracker</h3>
            <p className="text-xs text-[#A7C9CE]">Active RFP stages and incoming bid evaluation status</p>
          </div>
          <button onClick={() => navigate('/tenders')} className="text-xs font-bold text-[#14D9D5] hover:underline cursor-pointer">Manage All Tenders →</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1B5968] text-[#A7C9CE] uppercase tracking-wider text-[10px] font-semibold bg-[#0B3442]">
                <th className="py-3 px-3">Tender ID & Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Budget ($)</th>
                <th className="py-3 px-3">Bids Received</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B5968]">
              {tenders.map(t => (
                <tr key={t.id} className="hover:bg-[#145364]/40 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-white">{t.title}</p>
                    <p className="text-[10px] text-[#A7C9CE]">{t.id} • {t.department}</p>
                  </td>
                  <td className="py-3 px-3 text-[#A7C9CE]">{t.category}</td>
                  <td className="py-3 px-3 font-bold text-[#20C997]">${t.budget.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#06B6B4]/10 text-[#14D9D5] border border-[#06B6B4]/30 font-bold text-[11px]">
                      {t.bidsCount} Bids
                    </span>
                  </td>
                  <td className="py-3 px-3"><StatusBadge status={t.status} /></td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => navigate(`/tenders/${t.id}`)}
                      className="px-3 py-1 bg-[#06B6B4] hover:bg-[#14D9D5] text-white border border-[#06B6B4] rounded-lg font-semibold transition-all text-xs cursor-pointer"
                    >
                      View RFP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
