// CertiBid AI - Public Landing Page & Government Procurement Risk Analyzer
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Gavel,
  Cpu,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  Building2,
  TrendingUp,
  BarChart3,
  CreditCard,
  Layers,
  ChevronRight
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const lifecycleSteps = [
    {
      step: '01',
      title: 'Notice Inviting Tender (NIT)',
      desc: 'Transparent digital publication of government infrastructure tenders with cryptographic specification locking.'
    },
    {
      step: '02',
      title: 'Bid Submission & EMD Escrow',
      desc: 'Role-isolated contractor portal with automated Earnest Money Deposit (EMD) escrow ledger validation.'
    },
    {
      step: '03',
      title: 'Forensic AI Risk & Cartel Analysis',
      desc: 'Autonomous neural detection of collusive bidding rings, sub-contractor ties, and statistical pricing anomalies.'
    },
    {
      step: '04',
      title: 'Officer Selection & Admin Review',
      desc: 'Dual-action procurement governance: officer bidder selection and seamless senior admin escalation workflow.'
    },
    {
      step: '05',
      title: 'Statutory Award & Contract Execution',
      desc: 'Cryptographic tender award sanctioning with immutable audit logging and instant milestone tracking.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#071F2A] text-[#F0FDFA] flex flex-col selection:bg-[#06B6B4] selection:text-[#071F2A]">
      {/* Top Navbar */}
      <header className="h-20 border-b border-[#1B5968] bg-[#071F2A]/90 sticky top-0 z-30 backdrop-blur-md px-6 md:px-12 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#06B6B4] flex items-center justify-center text-[#071F2A] font-black shadow-lg shadow-[#06B6B4]/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl text-white tracking-tight">CertiBid</span>
              <span className="font-black text-xl text-[#14D9D5]">AI</span>
            </div>
            <p className="text-[11px] text-[#A7C9CE] font-medium tracking-wide">
              Government Procurement Risk Analyzer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold text-[#14D9D5] hover:bg-[#103D4A] border border-transparent hover:border-[#1B5968] transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] text-xs md:text-sm font-extrabold shadow-md shadow-[#06B6B4]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Vendor Registration
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center space-y-16 md:space-y-24">
        {/* Hero Section */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#06B6B4]/10 border border-[#06B6B4]/30 text-xs font-bold text-[#14D9D5] shadow-sm">
            <Sparkles className="w-4 h-4 text-[#14D9D5]" />
            <span>Autonomous Risk Intelligence &amp; Procurement Governance</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
            Fraud-Proof Public Procurement Powered by <span className="text-[#14D9D5]">Forensic AI</span>
          </h1>

          <p className="text-sm md:text-base text-[#A7C9CE] max-w-2xl mx-auto leading-relaxed">
            Eliminate cartel collusion, bid rigging, and contract anomalies with real-time neural risk scoring, automated EMD escrow verification, and strict role-governed award workflows.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] font-black text-sm shadow-xl shadow-[#06B6B4]/20 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Launch Portal Sign-In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 rounded-xl bg-[#103D4A] hover:bg-[#103D4A]/80 border border-[#1B5968] text-white font-bold text-sm transition-all hover:border-[#14D9D5]/40 cursor-pointer"
            >
              Vendor Registration
            </button>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="w-full text-left space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#14D9D5] uppercase tracking-wider">Enterprise Architecture</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Engineered for Sovereign Compliance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-7 rounded-2xl bg-[#0B3442] border border-[#1B5968] space-y-4 shadow-xl hover:border-[#14D9D5]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#06B6B4]/10 border border-[#06B6B4]/30 flex items-center justify-center text-[#14D9D5]">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white">AI Neural Risk Forensics</h3>
              <p className="text-xs md:text-sm text-[#A7C9CE] leading-relaxed">
                Automated collusion, cartel, and mathematical price anomaly detection scoring proposals against historical infrastructure baselines.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#0B3442] border border-[#1B5968] space-y-4 shadow-xl hover:border-[#14D9D5]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997]">
                <Gavel className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Tender-Scoped Escalated Bids</h3>
              <p className="text-xs md:text-sm text-[#A7C9CE] leading-relaxed">
                Senior executive governance scoping reviews strictly to registered organisations of the selected tender with full audit trails.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#0B3442] border border-[#1B5968] space-y-4 shadow-xl hover:border-[#14D9D5]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#F4C95D]/10 border border-[#F4C95D]/30 flex items-center justify-center text-[#F4C95D]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Strict Bidder Isolation</h3>
              <p className="text-xs md:text-sm text-[#A7C9CE] leading-relaxed">
                Role-based backend authorization preventing cross-bidder document or proposal leakage throughout active evaluation phases.
              </p>
            </div>
          </div>
        </section>

        {/* Procurement Lifecycle Section */}
        <section className="w-full text-left space-y-8 bg-[#103D4A]/50 border border-[#1B5968] p-8 md:p-12 rounded-3xl shadow-xl">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#14D9D5] uppercase tracking-wider">End-to-End Governance</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">The Public Procurement Lifecycle</h2>
            <p className="text-xs text-[#A7C9CE]">Standardized statutory workflow from initial tender notice to contract execution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
            {lifecycleSteps.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#0B3442] border border-[#1B5968] flex flex-col justify-between space-y-3 relative group hover:border-[#14D9D5]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-black text-[#14D9D5] opacity-80">{item.step}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#20C997]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-white mb-1">{item.title}</h4>
                  <p className="text-[11px] text-[#A7C9CE] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1B5968] bg-[#0B3442]/60 mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#A7C9CE]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#06B6B4] flex items-center justify-center text-[#071F2A] font-black">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">CertiBid AI</p>
              <p className="text-[10px] text-[#6F9BA3]">Government Procurement Risk Analyzer &amp; Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-[#14D9D5] transition-colors font-medium">Sign In</Link>
            <Link to="/register" className="hover:text-[#14D9D5] transition-colors font-medium">Vendor Onboarding</Link>
            <span className="text-[#1B5968]">|</span>
            <span>Statutory Anti-Corruption Framework</span>
          </div>

          <div className="text-[11px] text-[#6F9BA3]">
            © {new Date().getFullYear()} CertiBid AI Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
