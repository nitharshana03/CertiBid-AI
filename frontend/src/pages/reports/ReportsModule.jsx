// CertiBid AI - Executive Reports & Compliance Analytics Module
import React, { useState } from 'react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useToast } from '../../context/ToastContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  ShieldCheck,
  Building2,
  PieChart as PieIcon,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const departmentData = [
  { department: 'Urban Transport', allocation: 480, tenders: 4, fill: '#06B6B4' },
  { department: 'Renewable Energy', allocation: 340, tenders: 3, fill: '#14D9D5' },
  { department: 'Highway Authority', allocation: 290, tenders: 2, fill: '#20C997' },
  { department: 'IT & Digital Infra', allocation: 210, tenders: 2, fill: '#38BDF8' },
  { department: 'Public Health', allocation: 160.5, tenders: 1, fill: '#F4C95D' }
];

export function ReportsModule() {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(null);

  // Helper to trigger browser CSV file download
  const triggerCsvDownload = (filename, rows) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAll = (format) => {
    setDownloading(format);
    setTimeout(() => {
      if (format === 'CSV') {
        const rows = [
          ['CertiBid AI - Complete Executive Procurement Report', 'Export Date: ' + new Date().toLocaleDateString()],
          ['Department', 'Budget Allocation (INR Cr)', 'Active Tenders', 'AI Anomaly Check'],
          ['Urban Transportation', '480.00', '4', 'Passed (Clean)'],
          ['Renewable Energy', '340.00', '3', 'Escalated / Reviewed'],
          ['Highway Authority', '290.00', '2', 'Passed (Clean)'],
          ['IT & Digital Infrastructure', '210.00', '2', 'Passed (Clean)'],
          ['Public Health & Medical', '160.50', '1', 'Passed (Clean)'],
          ['Total State Allocation', '1480.50', '12', '99.8% Anomaly Free']
        ];
        triggerCsvDownload('CertiBid_Full_Procurement_Audit_Report.csv', rows);
        showToast('Successfully generated and downloaded Full Procurement Audit Report (CSV).', 'success');
      } else {
        showToast('Executive PDF Audit Dossier compiled and queued for print.', 'success');
        window.print?.();
      }
      setDownloading(null);
    }, 600);
  };

  const handleDownloadReport = (reportType) => {
    setDownloading(reportType);
    setTimeout(() => {
      if (reportType === 'annual') {
        const rows = [
          ['Tender ID', 'Title', 'Department', 'Budget (INR)', 'Awarded Bidder', 'Status'],
          ['TND-2024-001', 'Smart City EV Charging Grid', 'Renewable Energy', '35000000', 'Helios Renewable Energy Solutions', 'Evaluated'],
          ['TND-2024-002', 'High-Speed Metro Rail Expansion', 'Urban Transport', '480000000', 'Acme Infrastructure Inc.', 'Active'],
          ['TND-2024-003', 'Automated Highway Tolling System', 'Highway Authority', '290000000', 'Apex Tollways Consortium', 'Under Review'],
          ['TND-2024-004', 'State Medical Center Equipment', 'Public Health', '160500000', 'Apex Healthcare Equipments', 'Awarded']
        ];
        triggerCsvDownload('Annual_Procurement_Audit_Summary_2024.csv', rows);
        showToast('Downloaded Annual Procurement Audit Summary (CSV).', 'success');
      } else if (reportType === 'risk') {
        const rows = [
          ['Vendor Name', 'Bid ID', 'AI Risk Score', 'Cartel Overlap Flag', 'Price Deviation', 'Compliance Status'],
          ['Apex Heavy Engineering Consortium', 'BID-9032', '84 (Critical)', 'Collusive Sub-contractor Ring Detected', '+44.1% vs Benchmark', 'Escalated to Admin'],
          ['Helios Renewable Energy Solutions', 'BID-9031', '12 (Low)', 'Independent Bidder', '-2.8% vs Benchmark', 'Approved'],
          ['Zenith Infrastructure Ltd', 'BID-9033', '28 (Low)', 'Independent Bidder', '+5.6% vs Benchmark', 'Approved']
        ];
        triggerCsvDownload('Vendor_Risk_Collusion_Log.csv', rows);
        showToast('Downloaded Vendor Risk & Collusion Log (CSV).', 'success');
      } else if (reportType === 'emd') {
        const rows = [
          ['Transaction ID', 'Vendor ID', 'Tender ID', 'EMD Escrow Amount (INR)', 'Payment Gateway Ref', 'Escrow Custody Status'],
          ['EMD-TX-9901', 'VND-10031', 'TND-2024-001', '1700000', 'RAZOR_EMD_991823', 'Secured in Treasury Escrow'],
          ['EMD-TX-9902', 'VND-10032', 'TND-2024-001', '1700000', 'RAZOR_EMD_991824', 'Secured in Treasury Escrow'],
          ['EMD-TX-9903', 'VND-10033', 'TND-2024-001', '1700000', 'RAZOR_EMD_991825', 'Secured in Treasury Escrow']
        ];
        triggerCsvDownload('Treasury_EMD_Ledger_Export.csv', rows);
        showToast('Downloaded Treasury EMD Ledger Export (CSV).', 'success');
      }
      setDownloading(null);
    }, 600);
  };

  return (
    <div className="space-y-6 text-[#F0FDFA] max-w-6xl mx-auto pb-12">
      {/* Universal Breadcrumb: Procurement > Reports */}
      <Breadcrumb items={[{ label: 'Reports' }]} />

      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#14D9D5] uppercase tracking-wider">
              Statutory Intelligence & Audit Logs
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/30">
              Verified Compliance
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            Executive Procurement Reports & Analytics
          </h1>
          <p className="text-xs md:text-sm text-[#A7C9CE] mt-1 max-w-2xl">
            Export compliant audit logs, vendor risk metrics, and budget spending analytics.
          </p>
        </div>

        {/* Action Buttons: Export PDF and Export CSV */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleExportAll('PDF')}
            disabled={downloading !== null}
            className="px-4 py-2.5 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 border border-[#1B5968] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-[#14D9D5]" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportAll('CSV')}
            disabled={downloading !== null}
            className="px-4 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-1.5 shadow-lg">
          <span className="text-[11px] font-bold text-[#A7C9CE] uppercase tracking-wider">Total Procurement Value</span>
          <h3 className="text-2xl font-black text-white">₹1,480.50 Cr</h3>
          <p className="text-[10px] text-[#20C997] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% vs previous fiscal year
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-1.5 shadow-lg">
          <span className="text-[11px] font-bold text-[#A7C9CE] uppercase tracking-wider">Active State Tenders</span>
          <h3 className="text-2xl font-black text-[#14D9D5]">12 Tenders</h3>
          <p className="text-[10px] text-[#A7C9CE]">Under forensic evaluation</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-1.5 shadow-lg">
          <span className="text-[11px] font-bold text-[#A7C9CE] uppercase tracking-wider">AI Cartel Prevention Rate</span>
          <h3 className="text-2xl font-black text-[#20C997]">99.8%</h3>
          <p className="text-[10px] text-[#20C997]">18 Collusion Anomalies Neutralized</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#103D4A] border border-[#1B5968] space-y-1.5 shadow-lg">
          <span className="text-[11px] font-bold text-[#A7C9CE] uppercase tracking-wider">Treasury EMD Escrow Custody</span>
          <h3 className="text-2xl font-black text-[#F4C95D]">₹44.50 Cr</h3>
          <p className="text-[10px] text-[#A7C9CE]">100% bank guarantee backed</p>
        </div>
      </div>

      {/* Chart Section: Department Procurement Allocation */}
      <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1B5968] pb-3">
          <div>
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#14D9D5]" />
              <span>Department Procurement Allocation (₹ Crores)</span>
            </h2>
            <p className="text-xs text-[#A7C9CE]">Statutory budget distribution across government infrastructure ministries.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#A7C9CE]">
            <span className="inline-block w-3 h-3 rounded bg-[#06B6B4]"></span>
            <span>Allocated Capital Budget</span>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B5968" vertical={false} />
              <XAxis
                dataKey="department"
                stroke="#A7C9CE"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1B5968' }}
              />
              <YAxis
                stroke="#A7C9CE"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1B5968' }}
                tickFormatter={(val) => `₹${val}Cr`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#071F2A',
                  borderColor: '#1B5968',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}
                formatter={(value) => [`₹${value} Crores`, 'Budget Allocation']}
                labelStyle={{ color: '#14D9D5', fontWeight: 'bold' }}
              />
              <Bar dataKey="allocation" radius={[6, 6, 0, 0]}>
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div>
        <div className="mb-4">
          <h2 className="font-bold text-base text-white">Statutory Report Downloads</h2>
          <p className="text-xs text-[#A7C9CE]">Generate certified government audit filings and forensic ledger statements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Annual Procurement Audit Summary */}
          <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] shadow-lg flex flex-col justify-between space-y-4 hover:border-[#14D9D5]/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#06B6B4]/10 border border-[#06B6B4]/30 flex items-center justify-center text-[#14D9D5]">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Annual Procurement Audit Summary</h3>
              <p className="text-xs text-[#A7C9CE] leading-relaxed">
                Full breakdown of published tenders, awarded vendors, and total treasury spend across all state departments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadReport('annual')}
              disabled={downloading !== null}
              className="w-full py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>

          {/* Card 2: Vendor Risk & Collusion Log */}
          <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] shadow-lg flex flex-col justify-between space-y-4 hover:border-[#14D9D5]/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Vendor Risk & Collusion Log</h3>
              <p className="text-xs text-[#A7C9CE] leading-relaxed">
                AI flagged price anomalies, collusive bidding alerts, and vendor risk scores with explainable neural telemetry.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadReport('risk')}
              disabled={downloading !== null}
              className="w-full py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>

          {/* Card 3: Treasury EMD Ledger Export */}
          <div className="p-6 rounded-2xl bg-[#0B3442] border border-[#1B5968] shadow-lg flex flex-col justify-between space-y-4 hover:border-[#14D9D5]/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4C95D]/10 border border-[#F4C95D]/30 flex items-center justify-center text-[#F4C95D]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Treasury EMD Ledger Export</h3>
              <p className="text-xs text-[#A7C9CE] leading-relaxed">
                Complete statement of EMD escrow deposits, performance bonds, and refunds with automated cryptographic verification.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadReport('emd')}
              disabled={downloading !== null}
              className="w-full py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
