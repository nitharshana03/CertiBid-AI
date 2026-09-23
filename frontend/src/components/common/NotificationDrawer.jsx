// CertiBid AI - Notification Drawer
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Bell, X, Check, ShieldAlert, Gavel, FileCheck2, Award, Send } from 'lucide-react';

export function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      apiService.getNotifications().then(r => setNotifications(r?.data || []));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id) => {
    await apiService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (n) => {
    handleMarkAsRead(n.id);
    onClose();
    if (n.tenderId) {
      navigate('/decision');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#0B3442] border-l border-[#1B5968] h-full shadow-2xl flex flex-col text-[#F0FDFA]">
        {/* Header */}
        <div className="p-4 border-b border-[#1B5968] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#14D9D5]" />
            <h3 className="font-bold text-sm text-white">Notifications</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#14D9D5]/20 text-[#14D9D5]">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-[#A7C9CE] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-xs text-[#A7C9CE] text-center pt-8">No unread notifications</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 rounded-xl border transition-all text-xs cursor-pointer ${
                  n.read ? 'bg-[#103D4A]/50 border-[#1B5968]/50 text-[#A7C9CE]' : 'bg-[#103D4A] border-[#14D9D5]/40 text-white shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {n.type === 'Selection' ? (
                      <span className="p-1 rounded-md bg-[#14D9D5]/20 text-[#14D9D5]">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : n.type === 'Escalation' ? (
                      <span className="p-1 rounded-md bg-[#FFB020]/20 text-[#FFB020]">
                        <Send className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded-md bg-[#20C997]/20 text-[#20C997]">
                        <Award className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <p className="font-extrabold text-xs text-white">{n.title}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                      className="text-[10px] text-[#14D9D5] hover:underline shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-[#A7C9CE] mt-2 whitespace-pre-line leading-relaxed">
                  {n.message || n.description}
                </div>
                <div className="flex items-center justify-between text-[9px] text-[#6F9BA3] mt-2.5 pt-2 border-t border-[#1B5968]/50">
                  <span>{n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (n.time || 'Recently')}</span>
                  {n.tenderId && (
                    <span className="font-mono text-[#14D9D5] font-bold">View Tender →</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

