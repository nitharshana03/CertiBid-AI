// CertiBid AI - Enterprise Sidebar Component
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Gavel,
  Building2,
  FileCheck2,
  ShieldAlert,
  Award,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  Shield,
  LogOut
} from 'lucide-react';

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/', { replace: true });
  };

  const rawRole = String(user?.role || '').toUpperCase().trim();
  const normalizedRole = rawRole === 'VENDOR' ? 'BIDDER' : rawRole;
  const isAdmin = normalizedRole === 'ADMIN';
  const isOfficer = normalizedRole === 'OFFICER';
  const isBidder = normalizedRole === 'BIDDER';

  // Role-Specific Subtitle for Sidebar Brand
  let portalSubtitle = 'Government Governance Portal';
  if (isAdmin) portalSubtitle = 'Admin Governance Portal';
  else if (isOfficer) portalSubtitle = 'Procurement Officer Portal';
  else if (isBidder) portalSubtitle = 'Bidder Corporate Portal';

  // Role-Specific Navigation Arrays
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { name: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Escalated Bids', path: '/dashboard/escalated-bids', icon: ShieldAlert },
        { name: 'Bid Evaluation & Award', path: '/decision', icon: Award },
        { name: 'User Management', path: '/users', icon: Users },
        { name: 'Organization Verification', path: '/vendors', icon: Building2 },
        { name: 'Tender Management', path: '/tenders', icon: Gavel },
        { name: 'Document Audit', path: '/documents', icon: FileCheck2 },
        { name: 'AI Risk Analyzer', path: '/risk-analysis', icon: ShieldAlert },
        { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    }

    if (isBidder) {
      return [
        { name: 'Bidder Portal', path: '/dashboard/vendor', icon: LayoutDashboard },
        { name: 'Available Tenders', path: '/tenders', icon: Gavel },
        { name: 'Company Certificates', path: '/documents', icon: FileCheck2 },
        { name: 'EMD & Receipts', path: '/payments', icon: CreditCard },
        { name: 'My Bids', path: '/bids/compare', icon: Award },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    }

    // OFFICER
    return [
      { name: 'Dashboard', path: '/dashboard/officer', icon: LayoutDashboard },
      { name: 'Escalated Bids', path: '/dashboard/escalated-bids', icon: ShieldAlert },
      { name: 'Tender Management', path: '/tenders', icon: Gavel },
      { name: 'Bidder Directory', path: '/vendors', icon: Building2 },
      { name: 'Document Audit', path: '/documents', icon: FileCheck2 },
      { name: 'AI Risk Analyzer', path: '/risk-analysis', icon: ShieldAlert },
      { name: 'Bid Evaluation & Award', path: '/decision', icon: Award },
      { name: 'Financial Audit', path: '/payments', icon: CreditCard },
      { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
      { name: 'Settings', path: '/settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();
  const formattedRoleText = isAdmin ? 'Admin' : isOfficer ? 'Procurement Officer' : 'Bidder';

  return (
    <aside className={`fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 flex flex-col glass-sidebar text-slate-100 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-[#06B6B4] flex items-center justify-center text-white font-black shadow-md shrink-0">
            <Shield className="w-5 h-5 text-[#071F2A]" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-extrabold text-sm tracking-tight leading-tight text-white">
                CertiBid <span className="text-[#14D9D5] font-bold">AI</span>
              </h1>
              <p className="text-[10px] font-medium text-[var(--text-muted)] truncate">
                {portalSubtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#06B6B4]/20 border-l-2 border-[#06B6B4] text-[#14D9D5] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--card-hover)]'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* System Health / AI Engine Pill (ONLY shown if Officer) */}
      {!collapsed && isOfficer && (
        <div className="p-3 mx-3 mb-3 bg-[#0B3442] rounded-xl border border-[var(--border)]">
          <p className="text-[10px] font-semibold text-[#14D9D5] uppercase tracking-wider mb-1.5">System Health</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--text-secondary)]">AI Engine</span>
            <span className="px-2 py-0.5 rounded-full bg-[#20C997]/10 text-[#20C997] text-[10px] font-bold uppercase tracking-widest border border-[#20C997]/30 animate-pulse-subtle">
              Active
            </span>
          </div>
        </div>
      )}

      {/* Sign Out Button */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-[var(--border)]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-[#FF6B7A]/10 text-[#FF6B7A] hover:bg-[#FF6B7A]/20 border border-[#FF6B7A]/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[var(--border)] shrink-0 bg-[#0B3442]/80">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-[#06B6B4] text-[#071F2A] font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
            {user?.avatar || 'AV'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-white">{user?.name}</p>
              <p className="text-[10px] text-[#14D9D5] font-semibold truncate">{formattedRoleText}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}


