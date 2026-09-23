// CertiBid AI - Enterprise Top Navigation Bar
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDrawer } from './NotificationDrawer';
import {
  Menu,
  Search,
  Bell,
  ShieldCheck,
  ChevronDown,
  LogOut
} from 'lucide-react';

export function Navbar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const rawRole = String(user?.role || '').toUpperCase().trim();
  const normalizedRole = rawRole === 'VENDOR' ? 'BIDDER' : rawRole;
  const isAdmin = normalizedRole === 'ADMIN';
  const isOfficer = normalizedRole === 'OFFICER';
  const isBidder = normalizedRole === 'BIDDER';

  const roleBadgeText = isAdmin
    ? 'Role: Admin'
    : isOfficer
    ? 'Role: Procurement Officer'
    : 'Role: Bidder';

  const formattedRoleName = isAdmin
    ? 'Admin'
    : isOfficer
    ? 'Procurement Officer'
    : 'Bidder';

  const fetchUnreadCount = async () => {
    try {
      const res = await apiService.getNotifications();
      const list = res?.data || [];
      const unread = list.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <>
      <header className="h-16 sticky top-0 z-20 px-6 flex items-center justify-between transition-colors glass-header bg-[#0B3442]/90 border-b border-[#1B5968] text-[#F0FDFA]">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl text-[#A7C9CE] hover:text-white hover:bg-[#103D4A] transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Spotlight Search Input Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-lg text-xs focus:outline-none transition-all w-64 md:w-80 bg-[#103D4A] border border-[#1B5968] text-[#A7C9CE] hover:border-[#06B6B4] cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 shrink-0 text-[#6F9BA3]" />
            <span className="flex-1 text-left truncate">Search entities, bids, risk scores...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] border border-[#1B5968] rounded font-mono bg-[#071F2A] text-[#A7C9CE]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls Section */}
        <div className="flex items-center gap-3">
          {/* Active Persona Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#06B6B4]/10 border border-[#06B6B4]/30 text-[#14D9D5]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#06B6B4]" />
            <span>{roleBadgeText}</span>
          </div>

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => {
              setIsNotificationsOpen(true);
              fetchUnreadCount();
            }}
            className="p-2 rounded-xl relative text-[#A7C9CE] hover:text-white hover:bg-[#103D4A] transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B7A] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-[#0B3442]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl transition-colors hover:bg-[#103D4A] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#06B6B4] text-[#071F2A] font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.avatar || 'AV'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-[#F0FDFA]">{user?.name}</p>
                <p className="text-[10px] leading-none text-[#A7C9CE]">{formattedRoleName}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#6F9BA3]" />
            </button>

            {/* Dropdown Menu - User Profile Info */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl p-4 z-50 text-xs border bg-[#103D4A] text-[#F0FDFA] border-[#1B5968]">
                <div className="pb-3 border-b border-[#1B5968] space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#06B6B4] text-[#071F2A] font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {user?.avatar || 'AV'}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-white">{user?.name}</p>
                      <span className="px-2 py-0.5 rounded-full bg-[#06B6B4]/20 text-[#14D9D5] text-[10px] font-bold border border-[#06B6B4]/30">
                        {formattedRoleName}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#A7C9CE] pt-1 truncate">{user?.email}</p>
                </div>

                <div className="py-2.5 border-b border-[#1B5968] space-y-1.5 text-[11px] text-[#A7C9CE]">
                  <div className="flex justify-between">
                    <span className="text-[#6F9BA3]">User ID:</span>
                    <span className="font-bold text-[#F0FDFA]">{user?.bidderId || user?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F9BA3]">Org / Dept:</span>
                    <span className="font-bold truncate max-w-[140px] text-right text-[#F0FDFA]">
                      {user?.organization || user?.department || 'Central Authority'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 rounded-xl text-[#FF6B7A] font-bold hover:bg-[#FF6B7A]/10 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
}


