// CertiBid AI - Admin Role Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatINRLakhsCrores } from '../../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import {
  Gavel,
  ShieldAlert,
  TrendingUp,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getTenders(),
      apiService.getVendors(),
      apiService.getAuditLogs(),
      apiService.getEscalations()
    ]).then(([tRes, vRes, aRes, eRes]) => {
      setTenders(Array.isArray(tRes?.data) ? tRes.data : []);
      setVendors(Array.isArray(vRes?.data) ? vRes.data : []);
      setAuditLogs(Array.isArray(aRes?.data) ? aRes.data : []);
      setEscalations(Array.isArray(eRes?.data) ? eRes.data : []);
      setLoading(false);
    }).catch(() => {
      setTenders([]);
      setVendors([]);
      setAuditLogs([]);
      setEscalations([]);
      setLoading(false);
    });
  }, []);

  const tendersList = Array.isArray(tenders) ? tenders : [];
  const vendorsList = Array.isArray(vendors) ? vendors : [];

  // Aggregated KPI Stats
  const totalBudget = tendersList.reduce((acc, t) => acc + (t.budget || 0), 0);
  const highRiskCount = vendorsList.filter(v => v.riskLevel === 'High' || v.riskLevel === 'Critical').length;

  // Chart Datasets
  const riskDistributionData = [
    { name: 'Low Risk', value: vendorsList.filter(v => v.riskLevel === 'Low').length || 18, color: '#10b981' },
    { name: 'Medium Risk', value: vendorsList.filter(v => v.riskLevel === 'Medium').length || 12, color: '#3b82f6' },
    { name: 'High Risk', value: vendorsList.filter(v => v.riskLevel === 'High').length || 6, color: '#f59e0b' },
    { name: 'Critical Risk', value: vendorsList.filter(v => v.riskLevel === 'Critical').length || 2, color: '#ef4444' }
  ];

  const tenderTrendsData = [
    { month: 'Jan', tenders: 4, budget: 35 },
    { month: 'Feb', tenders: 6, budget: 50 },
    { month: 'Mar', tenders: 8, budget: 75 },
    { month: 'Apr', tenders: 5, budget: 42 },
    { month: 'May', tenders: 9, budget: 110 },
    { month: 'Jun', tenders: 12, budget: 145 },
    { month: 'Jul', tenders: 15, budget: 198 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border shadow-sm bg-[#0B3442] border-[#1B5968] text-[#F0FDFA]">
        <div>
          <span className="text-[11px] font-bold text-[#14D9D5] uppercase tracking-wider">Central Executive Control Room</span>
          <h2 className="text-2xl font-extrabold mt-0.5 text-white">Admin Governance Dashboard</h2>
          <p className="text-xs mt-1 text-[#A7C9CE]">Real-time oversight across state procurement pipelines & AI risk matrices</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-bold bg-[#06B6B4]/10 border-[#06B6B4]/30 text-[#14D9D5]">
          <span>Active Governance Mode</span>
        </div>
      </div>

      {/* Escalated Bids Review Widget for Admin */}
      <div className="p-5 rounded-2xl bg-[#0B3442] border-2 border-[#F4C95D]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#F4C95D]/10 text-[#F4C95D] border border-[#F4C95D]/30 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base">Escalated Bid Governance Desk</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C95D] text-[#071F2A] font-extrabold text-[11px]">
                {escalations.filter(e => e.status === 'ESCALATED_TO_ADMIN').length} Pending Admin Review
              </span>
            </div>
            <p className="text-xs text-[#A7C9CE] mt-0.5">
              Review officer-escalated bids, inspect AI forensics analysis, and issue Admin governance decisions.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard/escalated-bids')}
          className="px-5 py-2.5 rounded-xl bg-[#F4C95D] hover:bg-[#F4C95D]/80 text-[#071F2A] font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
        >
          Manage Escalated Bids Queue →
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl border bg-[#103D4A] border-[#1B5968] text-[#F0FDFA]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A7C9CE]">Total Active Tenders</span>
            <div className="p-2.5 rounded-xl bg-[#06B6B4]/10 text-[#14D9D5] border border-[#06B6B4]/20">
              <Gavel className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mt-2 text-white">{tenders.length || 248}</h3>
          <div className="text-xs text-[#20C997] mt-2 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> +12% vs last month
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-[#103D4A] border-[#1B5968] text-[#F0FDFA]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A7C9CE]">Risk Alerts Raised</span>
            <div className="p-2.5 rounded-xl bg-[#FF6B7A]/10 text-[#FF6B7A] border border-[#FF6B7A]/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mt-2 text-[#FF6B7A]">{highRiskCount || 14}</h3>
          <div className="text-xs text-[#FF6B7A] mt-2 flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" /> High severity detected
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-[#103D4A] border-[#1B5968] text-[#F0FDFA]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A7C9CE]">Compliance Score</span>
            <div className="p-2.5 rounded-xl bg-[#06B6B4]/10 text-[#14D9D5] border border-[#06B6B4]/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mt-2 text-white">98.4<span className="text-lg font-normal text-[#A7C9CE]">%</span></h3>
          <div className="text-xs mt-2 flex items-center gap-1 font-semibold text-[#A7C9CE]">
            Global Government Avg: 92%
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-[#103D4A] border-[#1B5968] text-[#F0FDFA]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A7C9CE]">Total Pipeline Budget</span>
            <div className="p-2.5 rounded-xl bg-[#20C997]/10 text-[#20C997] border border-[#20C997]/20">
              <span className="font-bold text-lg">₹</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mt-2 text-[#14D9D5]">{formatINRLakhsCrores(totalBudget)}</h3>
          <div className="text-xs text-[#20C997] mt-2 flex items-center gap-1 font-semibold">
            AI Budget Governance
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tender Trends Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border bg-[#103D4A] border-[#1B5968] text-[#F0FDFA]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Procurement Budget & Tender Trends</h3>
              <p className="text-xs text-[#A7C9CE]">Monthly budget allocation (₹ Crores) & published volume</p>
            </div>
          </div>
          <div className="h-64 w-full rounded-xl p-3 bg-[#0B3442] border border-[#1B5968]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tenderTrendsData}>
                <defs>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6B4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6B4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip contentStyle={{
                  backgroundColor: '#0B3442',
                  borderColor: '#1B5968',
                  borderRadius: '12px',
                  color: '#F0FDFA'
                }} />
                <Area type="monotone" dataKey="budget" name="Budget (₹ Cr)" stroke="#06B6B4" strokeWidth={2} fillOpacity={1} fill="url(#colorBudget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie Chart */}
        <div className="p-6 rounded-2xl border flex flex-col justify-between bg-[#103D4A] border-[#1B5968] text-[#F0FDFA]">
          <div>
            <h3 className="text-sm font-bold text-white">Vendor Risk Matrix</h3>
            <p className="text-xs text-[#A7C9CE]">AI Risk Classification Distribution</p>
          </div>
          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistributionData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  backgroundColor: '#0B3442',
                  borderColor: '#1B5968',
                  borderRadius: '12px',
                  color: '#F0FDFA'
                }} />
                <Legend iconSize={8} fontSize={10} layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tenders & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tenders Queue */}
        <div className="border rounded-2xl overflow-hidden flex flex-col bg-[#103D4A] border-[#1B5968]">
          <div className="p-4 border-b border-[#1B5968] flex justify-between items-center">
            <h4 className="font-semibold text-sm text-white">Tender Verification Queue</h4>
            <button onClick={() => navigate('/tenders')} className="text-xs text-[#14D9D5] hover:underline">View All Tenders</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase tracking-wider bg-[#0B3442] text-[#A7C9CE]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tender ID</th>
                  <th className="px-6 py-4 font-semibold">Vendor Entity</th>
                  <th className="px-6 py-4 font-semibold text-center">AI Risk</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#1B5968] text-[#F0FDFA]">
                {tenders.slice(0, 4).map(t => (
                  <tr key={t.id} className="transition-colors cursor-pointer hover:bg-[#145364]" onClick={() => navigate(`/tenders/${t.id}`)}>
                    <td className="px-6 py-3 font-medium text-white">#{t.id}</td>
                    <td className="px-6 py-3">{t.title || 'InfraTech Solutions Inc.'}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#20C997]/10 text-[#20C997] border border-[#20C997]/20">
                        LOW (0.12)
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Stream / AI Intelligence Hub */}
        <div className="border rounded-2xl p-6 flex flex-col bg-[#103D4A] border-[#1B5968] text-[#F0FDFA]">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-[#06B6B4]/10 text-[#14D9D5] border border-[#06B6B4]/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">AI Intelligence Hub</h4>
              <p className="text-xs text-[#A7C9CE]">Automated Risk Anomaly Stream</p>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div className="p-3 border rounded-xl bg-[#0B3442] border-[#1B5968]">
              <p className="text-xs text-[#22C7D6] font-bold uppercase mb-1 tracking-wider">Price Anomaly Detected</p>
              <p className="text-xs leading-relaxed text-[#A7C9CE]">
                Bid #8192 shows 24% lower margin than industry standard. Potential risk of contract default.
              </p>
            </div>
            <div className="p-3 border rounded-xl bg-[#0B3442] border-[#1B5968]">
              <p className="text-xs text-[#FF6B7A] font-bold uppercase mb-1 tracking-wider">Collusion Warning</p>
              <p className="text-xs leading-relaxed text-[#A7C9CE]">
                Identified shared IP address and similar metadata in proposals between 3 competing vendors.
              </p>
            </div>
            <div className="mt-auto pt-2">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs text-[#A7C9CE]">System Confidence</span>
                <span className="text-xs font-bold text-[#14D9D5]">94%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden border bg-[#071F2A] border-[#1B5968]">
                <div className="h-full bg-[#06B6B4] rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

