// CertiBid AI - Unified Role-Adaptive Settings & Governance Module
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import {
  Settings,
  Shield,
  Bell,
  User,
  Globe,
  Sliders,
  Save,
  CheckCircle2,
  Lock,
  Building,
  Mail,
  Phone,
  Briefcase,
  Layers,
  AlertTriangle,
  FileCheck2,
  Cpu,
  RotateCcw
} from 'lucide-react';

export function SettingsModule() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const rawRole = String(user?.role || '').toUpperCase().trim();
  const role = rawRole === 'VENDOR' ? 'BIDDER' : rawRole;
  const isAdmin = role === 'ADMIN';
  const isOfficer = role === 'OFFICER';
  const isBidder = role === 'BIDDER';

  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Section 1: Profile & Identity
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    department: '',
    roleTitle: '',
    bidderId: '',
    taxId: ''
  });

  // Section 2: Notification Controls
  const [notifications, setNotifications] = useState({
    newBidSubmissions: true,
    highRiskEscalations: true,
    documentVerification: true,
    awardApprovals: true,
    tenderUpdates: true,
    bidStatusUpdates: true,
    bidderSelection: true,
    awardNotifications: true,
    emailDigest: true
  });

  // Section 3: Application Preferences
  const [preferences, setPreferences] = useState({
    language: 'English (India)',
    currency: 'INR (₹)',
    dateFormat: 'DD/MM/YYYY',
    theme: 'Dark Navy (Default)'
  });

  // Section 4: Governance / Role Controls
  const [governance, setGovernance] = useState({
    autoEscalateHighRisk: true,
    riskThreshold: 70,
    enforceTwoFactor: true,
    auditLoggingLevel: 'Verbose Compliance',
    maintenanceMode: false,
    anomalySensitivity: 'High Sensitivity',
    fastTrackVerification: true,
    eSignPreference: 'DSC Class 3 (Digital Certificate)',
    autoInvoiceGeneration: true
  });

  // Load Settings from API / Cache on Mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const res = await apiService.getSettings();
        const data = res?.data || {};

        setProfile({
          name: data.profile?.name || user?.name || '',
          email: data.profile?.email || user?.email || '',
          phone: data.profile?.phone || user?.phone || '+91 98112 34567',
          organization: data.profile?.organization || user?.organization || user?.companyName || 'CertiBid Entity',
          department: data.profile?.department || user?.department || 'Operations',
          roleTitle: data.profile?.roleTitle || user?.roleTitle || (isAdmin ? 'Chief Technology Officer' : isOfficer ? 'Senior Procurement Officer' : 'Managing Director'),
          bidderId: data.profile?.bidderId || user?.bidderId || (isBidder ? 'VND-10029' : ''),
          taxId: data.profile?.taxId || user?.taxId || (isBidder ? 'TAX-2024-8891' : '')
        });

        if (data.notifications) {
          setNotifications(prev => ({ ...prev, ...data.notifications }));
        }
        if (data.preferences) {
          setPreferences(prev => ({ ...prev, ...data.preferences }));
        }
        if (data.governance) {
          setGovernance(prev => ({ ...prev, ...data.governance }));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Handle Save
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        profile,
        notifications,
        preferences,
        governance
      };

      await apiService.saveSettings(payload);

      // Update AuthContext user with any modified profile fields
      if (updateUser) {
        updateUser({
          name: profile.name,
          phone: profile.phone,
          department: profile.department,
          organization: profile.organization,
          companyName: profile.organization
        });
      }

      showToast('Settings saved and applied successfully.', 'success');
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Failed to save settings. Please retry.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic Header Titles & Subtitles based on Role
  let pageTitle = 'Account & Profile Settings';
  let pageSubtitle = 'Manage enterprise bidder credentials, tender notification preferences, and portal configurations.';
  let badgeLabel = 'Bidder Persona';

  if (isAdmin) {
    pageTitle = 'Admin System Settings & Governance';
    pageSubtitle = 'Configure platform governance, AI risk auto-escalation thresholds, notification triggers, and admin credentials.';
    badgeLabel = 'System Administrator';
  } else if (isOfficer) {
    pageTitle = 'Procurement Officer Settings';
    pageSubtitle = 'Manage department procurement parameters, forensic risk notifications, and officer account preferences.';
    badgeLabel = 'Procurement Officer';
  }

  return (
    <div className="space-y-6 text-[#F0FDFA] max-w-5xl mx-auto pb-12">
      {/* Universal Breadcrumb: Procurement > Settings */}
      <Breadcrumb items={[{ label: 'Settings' }]} />

      {/* Dynamic Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#0B3442] border border-[#1B5968] text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#14D9D5] uppercase tracking-wider">
              {isAdmin ? 'System Governance & Administration' : isOfficer ? 'Officer Portal Controls' : 'Bidder Enterprise Workspace'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#06B6B4]/20 text-[#14D9D5] border border-[#06B6B4]/30">
              {badgeLabel}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {pageTitle}
          </h1>
          <p className="text-xs md:text-sm text-[#A7C9CE] mt-1 max-w-2xl">
            {pageSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] font-extrabold text-xs md:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-[#071F2A] border-t-transparent rounded-full animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Apply Settings</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Account & Profile Settings */}
        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] shadow-lg space-y-5">
          <div className="flex items-center gap-3 border-b border-[#1B5968] pb-3">
            <div className="w-8 h-8 rounded-lg bg-[#06B6B4]/10 border border-[#06B6B4]/30 flex items-center justify-center text-[#14D9D5]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Account & Profile Settings</h2>
              <p className="text-[11px] text-[#A7C9CE]">Verify your authenticated identity and contact credentials.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-[#A7C9CE] font-bold mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#14D9D5]" />
                <span>Full Name / Representative Name</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] transition-colors"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email Address (Governed / Read-only) */}
            <div>
              <label className="block text-[#A7C9CE] font-bold mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#14D9D5]" />
                <span>Official Email Address</span>
                <span className="text-[10px] text-[#6F9BA3] font-normal">(System Governed)</span>
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968]/60 text-[#A7C9CE] cursor-not-allowed opacity-90 font-mono"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[#A7C9CE] font-bold mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#14D9D5]" />
                <span>Contact Phone Number</span>
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] transition-colors"
                placeholder="+91 98XXX XXXXX"
              />
            </div>

            {/* Organization / Company */}
            <div>
              <label className="block text-[#A7C9CE] font-bold mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#14D9D5]" />
                <span>{isBidder ? 'Enterprise Legal Entity' : 'Department / Authority'}</span>
              </label>
              <input
                type="text"
                value={profile.organization}
                onChange={e => setProfile({ ...profile, organization: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] transition-colors"
                placeholder="Organization name"
              />
            </div>

            {/* Department / Division */}
            <div>
              <label className="block text-[#A7C9CE] font-bold mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#14D9D5]" />
                <span>Department / Operational Division</span>
              </label>
              <input
                type="text"
                value={profile.department}
                onChange={e => setProfile({ ...profile, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] transition-colors"
                placeholder="Department name"
              />
            </div>

            {/* Role Title */}
            <div>
              <label className="block text-[#A7C9CE] font-bold mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#14D9D5]" />
                <span>Designation / Role Title</span>
              </label>
              <input
                type="text"
                value={profile.roleTitle}
                onChange={e => setProfile({ ...profile, roleTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] transition-colors"
                placeholder="Role designation"
              />
            </div>

            {/* Bidder Specific IDs */}
            {isBidder && (
              <>
                <div>
                  <label className="block text-[#A7C9CE] font-bold mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#14D9D5]" />
                    <span>Vendor Identification Number (VID)</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile.bidderId || 'VND-10029'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968]/60 text-[#14D9D5] cursor-not-allowed opacity-90 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#A7C9CE] font-bold mb-1.5 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#14D9D5]" />
                    <span>Registered GSTIN / Tax ID</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile.taxId || 'TAX-2024-8891'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#071F2A] border border-[#1B5968]/60 text-[#A7C9CE] cursor-not-allowed opacity-90 font-mono"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 2: System Notification Controls */}
        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] shadow-lg space-y-5">
          <div className="flex items-center gap-3 border-b border-[#1B5968] pb-3">
            <div className="w-8 h-8 rounded-lg bg-[#06B6B4]/10 border border-[#06B6B4]/30 flex items-center justify-center text-[#14D9D5]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">System Notification Preferences</h2>
              <p className="text-[11px] text-[#A7C9CE]">Configure multi-channel alerts for tenders, risk flags, and award approvals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ADMIN Notifications */}
            {isAdmin && (
              <>
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">New Bid Submission Notifications</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Receive real-time alerts whenever a new bidder registers proposal on active tenders.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.newBidSubmissions}
                    onChange={e => setNotifications({ ...notifications, newBidSubmissions: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">High Risk Escalation Notifications</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Immediate notifications when AI risk forensics detects price anomalies or cartel flags.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.highRiskEscalations}
                    onChange={e => setNotifications({ ...notifications, highRiskEscalations: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">Document Verification Notifications</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Alerts when audit officers flag expired certificates or require statutory resubmissions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.documentVerification}
                    onChange={e => setNotifications({ ...notifications, documentVerification: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">Winner / Award Approval Notifications</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Receive high-priority escalation requests when Procurement Officers submit winner sanctions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.awardApprovals}
                    onChange={e => setNotifications({ ...notifications, awardApprovals: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* PROCUREMENT OFFICER Notifications */}
            {isOfficer && (
              <>
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">New Bid Submission Notifications</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Alerts whenever vendors submit technical & financial proposals on department tenders.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.newBidSubmissions}
                    onChange={e => setNotifications({ ...notifications, newBidSubmissions: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">High Risk Escalation Notifications</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Real-time alerts on collusive bidding patterns and mathematical price deviation warnings.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.highRiskEscalations}
                    onChange={e => setNotifications({ ...notifications, highRiskEscalations: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">Document Verification Notifications</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Alerts when audit officers complete KYC, ISO compliance, and tax clearance validation.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.documentVerification}
                    onChange={e => setNotifications({ ...notifications, documentVerification: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">Winner / Award Sanction Decisions</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Immediate notifications when Senior Admin approves or returns award proposals.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.awardApprovals}
                    onChange={e => setNotifications({ ...notifications, awardApprovals: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* BIDDER / VENDOR Notifications */}
            {isBidder && (
              <>
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">Tender Notices & Published Addenda</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Receive immediate notifications when new tenders matching your sector are published.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.tenderUpdates}
                    onChange={e => setNotifications({ ...notifications, tenderUpdates: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">Bid Status Updates & EMD Milestones</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Real-time status updates on technical evaluation and EMD escrow verification.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.bidStatusUpdates}
                    onChange={e => setNotifications({ ...notifications, bidStatusUpdates: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">Bidder Selection & Shortlist Alerts</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Alerts when your submitted proposal is selected for final award governance review.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.bidderSelection}
                    onChange={e => setNotifications({ ...notifications, bidderSelection: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] hover:border-[#14D9D5]/40 transition-colors">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs">Statutory Award & Document Audit Status</p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Instant alerts on final contract award determinations and certificate verifications.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.awardNotifications}
                    onChange={e => setNotifications({ ...notifications, awardNotifications: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 3: Application Preferences */}
        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] shadow-lg space-y-5">
          <div className="flex items-center gap-3 border-b border-[#1B5968] pb-3">
            <div className="w-8 h-8 rounded-lg bg-[#06B6B4]/10 border border-[#06B6B4]/30 flex items-center justify-center text-[#14D9D5]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Application Preferences</h2>
              <p className="text-[11px] text-[#A7C9CE]">Localization, currency formatting, and display standards.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* System Language */}
            <div>
              <label className="block text-[#A7C9CE] font-bold mb-1.5">System Language</label>
              <select
                value={preferences.language}
                onChange={e => setPreferences({ ...preferences, language: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] cursor-pointer"
              >
                <option value="English (India)">English (India)</option>
                <option value="English (United Kingdom)">English (United Kingdom)</option>
                <option value="English (United States)">English (United States)</option>
                <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
              </select>
            </div>

            {/* Default Currency */}
            <div>
              <label className="block text-[#A7C9CE] font-bold mb-1.5">Default Currency</label>
              <select
                value={preferences.currency}
                onChange={e => setPreferences({ ...preferences, currency: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] cursor-pointer"
              >
                <option value="INR (₹)">INR (₹ - Indian Rupee)</option>
                <option value="USD ($)">USD ($ - US Dollar)</option>
                <option value="EUR (€)">EUR (€ - Euro)</option>
                <option value="GBP (£)">GBP (£ - British Pound)</option>
              </select>
            </div>

            {/* Date Format */}
            <div>
              <label className="block text-[#A7C9CE] font-bold mb-1.5">Date Format</label>
              <select
                value={preferences.dateFormat}
                onChange={e => setPreferences({ ...preferences, dateFormat: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] cursor-pointer font-mono"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>

            {/* System Theme */}
            <div>
              <label className="block text-[#A7C9CE] font-bold mb-1.5">System Theme</label>
              <select
                value={preferences.theme}
                onChange={e => setPreferences({ ...preferences, theme: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B3442] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] cursor-pointer"
              >
                <option value="Dark Navy (Default)">Dark Navy (Default)</option>
                <option value="High Contrast Navy">High Contrast Navy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Role-Specific Governance & Controls */}
        <div className="p-6 rounded-2xl bg-[#103D4A] border border-[#1B5968] shadow-lg space-y-5">
          <div className="flex items-center gap-3 border-b border-[#1B5968] pb-3">
            <div className="w-8 h-8 rounded-lg bg-[#06B6B4]/10 border border-[#06B6B4]/30 flex items-center justify-center text-[#14D9D5]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">
                {isAdmin ? 'System Governance & Risk Policy Engine' : isOfficer ? 'Forensic AI Parameters & Verification' : 'Enterprise Signing & Compliance Preferences'}
              </h2>
              <p className="text-[11px] text-[#A7C9CE]">
                {isAdmin
                  ? 'Autonomous AI escalation triggers, security enforcement, and statutory audit logging.'
                  : isOfficer
                  ? 'AI sensitivity thresholds and accelerated contractor verification rules.'
                  : 'Digital certificate authentication and automated treasury invoice dispatch.'}
              </p>
            </div>
          </div>

          {/* ADMIN Controls */}
          {isAdmin && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] gap-4">
                <div className="max-w-xl">
                  <p className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#14D9D5]" />
                    <span>Auto-Escalate High-Risk Bids Threshold</span>
                  </p>
                  <p className="text-[10px] text-[#A7C9CE] mt-0.5">
                    Automatically route tenders with AI risk scores equal to or exceeding the threshold to Senior Admin Escalated Review.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#14D9D5] text-sm bg-[#071F2A] px-3 py-1 rounded-lg border border-[#1B5968]">
                    Score &gt; {governance.riskThreshold}
                  </span>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="5"
                    value={governance.riskThreshold}
                    onChange={e => setGovernance({ ...governance, riskThreshold: Number(e.target.value) })}
                    className="w-28 accent-[#06B6B4] cursor-pointer"
                  />
                  <input
                    type="checkbox"
                    checked={governance.autoEscalateHighRisk}
                    onChange={e => setGovernance({ ...governance, autoEscalateHighRisk: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                    title="Enable/Disable Auto-Escalation"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B3442] border border-[#1B5968]">
                <div className="pr-4">
                  <p className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#20C997]" />
                    <span>Two-Factor Authentication (2FA) for High-Value Approvals</span>
                  </p>
                  <p className="text-[10px] text-[#A7C9CE] mt-0.5">
                    Enforce hardware token / OTP step-up verification for final contract award approvals exceeding ₹5 Crores.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={governance.enforceTwoFactor}
                  onChange={e => setGovernance({ ...governance, enforceTwoFactor: e.target.checked })}
                  className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0B3442] border border-[#1B5968]">
                  <label className="block text-white font-bold text-xs mb-1">Statutory Audit Logging Level</label>
                  <p className="text-[10px] text-[#A7C9CE] mb-2">Configure forensic telemetry depth for anti-corruption compliance records.</p>
                  <select
                    value={governance.auditLoggingLevel}
                    onChange={e => setGovernance({ ...governance, auditLoggingLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] cursor-pointer"
                  >
                    <option value="Verbose Compliance">Verbose Compliance (Complete forensic AI hash audit trail)</option>
                    <option value="Standard Audit">Standard Audit (Administrative actions & status changes)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#F4C95D]" />
                      <span>System Maintenance Lockout</span>
                    </p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Temporarily suspend external tender submissions for scheduled upgrades.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={governance.maintenanceMode}
                    onChange={e => setGovernance({ ...governance, maintenanceMode: e.target.checked })}
                    className="w-4 h-4 accent-[#FF6B7A] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OFFICER Controls */}
          {isOfficer && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold text-xs mb-1">AI Risk Anomaly Sensitivity</label>
                  <p className="text-[10px] text-[#A7C9CE] mb-2">Adjust threshold for detecting bidding rings, IP collusions, and pricing deviations.</p>
                  <select
                    value={governance.anomalySensitivity}
                    onChange={e => setGovernance({ ...governance, anomalySensitivity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] cursor-pointer"
                  >
                    <option value="High Sensitivity">High Sensitivity (Flags &gt;8% baseline variance &amp; graph overlaps)</option>
                    <option value="Standard Sensitivity">Standard Sensitivity (Flags &gt;20% deviation &amp; verified collusions)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#071F2A] border border-[#1B5968]">
                  <div className="pr-2">
                    <p className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#20C997]" />
                      <span>Fast-Track Pre-qualification</span>
                    </p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Automate eligibility verification for vendors with valid Class-1 licenses.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={governance.fastTrackVerification}
                    onChange={e => setGovernance({ ...governance, fastTrackVerification: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BIDDER Controls */}
          {isBidder && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0B3442] border border-[#1B5968]">
                  <label className="block text-white font-bold text-xs mb-1">Digital Signing Preference</label>
                  <p className="text-[10px] text-[#A7C9CE] mb-2">Preferred authentication certificate used for binding tender proposals.</p>
                  <select
                    value={governance.eSignPreference}
                    onChange={e => setGovernance({ ...governance, eSignPreference: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#071F2A] border border-[#1B5968] text-white focus:outline-none focus:border-[#14D9D5] cursor-pointer"
                  >
                    <option value="DSC Class 3 (Digital Certificate)">DSC Class 3 (USB Crypto Token / Digital Certificate)</option>
                    <option value="Aadhaar eSign">Aadhaar eSign (OTP Verification)</option>
                    <option value="Corporate Token Key">Enterprise HSM Token Key</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] flex items-center justify-between">
                  <div className="pr-3">
                    <p className="font-bold text-white text-xs flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#14D9D5]" />
                      <span>Automated EMD Receipts &amp; Invoicing</span>
                    </p>
                    <p className="text-[10px] text-[#A7C9CE] mt-0.5">Automatically dispatch signed PDF escrow deposit receipts and invoice statements to registered email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={governance.autoInvoiceGeneration}
                    onChange={e => setGovernance({ ...governance, autoInvoiceGeneration: e.target.checked })}
                    className="w-4 h-4 accent-[#06B6B4] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Save Bar */}
        <div className="p-4 rounded-2xl bg-[#0B3442] border border-[#1B5968] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-[#A7C9CE]">
            <CheckCircle2 className="w-4 h-4 text-[#20C997]" />
            <span>Changes will apply across all active sessions upon saving.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-[#071F2A] font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#071F2A] border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Apply Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
