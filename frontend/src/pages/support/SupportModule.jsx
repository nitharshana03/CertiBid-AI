// CertiBid AI - Support, Helpdesk & Grievance Module
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';
import {
  LifeBuoy,
  HelpCircle,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building2,
  Mail,
  User,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Tag,
  AlertTriangle,
  FileText,
  CornerDownRight,
  Shield
} from 'lucide-react';

export function SupportModule() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const rawRole = String(user?.role || '').toUpperCase().trim();
  const isBidder = rawRole === 'BIDDER' || rawRole === 'VENDOR';
  const isAdminOrOfficer = rawRole === 'ADMIN' || rawRole === 'OFFICER';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, OPEN, IN_PROGRESS, RESOLVED, CLOSED
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Expanded Ticket Details
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  // New Ticket Form State (For Bidders)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [category, setCategory] = useState('Tender Clarification');
  const [priority, setPriority] = useState('Medium');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin / Officer Reply & Status Update State
  const [replyText, setReplyText] = useState({});
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const bidderCompany = user?.organization || user?.companyName || user?.name || 'Registered Bidder Entity';
  const bidderId = user?.bidderId || user?.vendorId || 'VND-10029';
  const userEmail = user?.email || 'vendor@certibid.com';
  const userName = user?.name || 'Authorized Representative';

  const loadTickets = async () => {
    try {
      const res = await apiService.getSupportRequests();
      if (res?.data && Array.isArray(res.data)) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Failed to load support requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user?.email]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  // Submit New Support Ticket (Bidder)
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast('Please fill in both Subject and Message.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category,
        priority,
        subject: subject.trim(),
        message: message.trim(),
        vendorName: bidderCompany,
        vendorId: bidderId,
        userName: userName,
        userEmail: userEmail
      };

      const res = await apiService.createSupportRequest(payload);
      if (res?.data) {
        setTickets(prev => [res.data, ...prev.filter(t => t.id !== res.data.id)]);
        showToast('Support request submitted successfully. Support team notified.', 'success');
        setShowNewTicketModal(false);
        setSubject('');
        setMessage('');
        setCategory('Tender Clarification');
        setPriority('Medium');
        setExpandedTicketId(res.data.id);
      }
    } catch (err) {
      console.error('Error submitting support request:', err);
      showToast(err.message || 'Failed to submit support request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Status (Admin / Officer)
  const handleUpdateStatus = async (ticketId, newStatus) => {
    setUpdatingStatusId(ticketId);
    try {
      await apiService.updateSupportRequest(ticketId, { status: newStatus });
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
      showToast(`Ticket #${ticketId} status updated to ${newStatus}.`, 'success');
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast(err.message || 'Failed to update ticket status.', 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Post Reply / Response (Admin, Officer, or Bidder)
  const handlePostReply = async (ticketId) => {
    const text = (replyText[ticketId] || '').trim();
    if (!text) {
      showToast('Please enter a response message.', 'error');
      return;
    }

    try {
      const targetTicket = tickets.find(t => t.id === ticketId);
      const existingResponses = targetTicket?.responses || [];
      const newResponse = {
        id: `RSP-${Math.floor(1000 + Math.random() * 9000)}`,
        authorName: user?.name || (isBidder ? 'Bidder' : 'Support Desk'),
        authorEmail: user?.email || '',
        authorRole: user?.role || (isBidder ? 'BIDDER' : 'OFFICER'),
        message: text,
        createdAt: new Date().toISOString()
      };

      const updatedResponses = [...existingResponses, newResponse];
      
      // Auto transition to IN_PROGRESS if OPEN and responded by officer/admin
      let newStatus = targetTicket?.status;
      if (isAdminOrOfficer && targetTicket?.status === 'OPEN') {
        newStatus = 'IN_PROGRESS';
      }

      await apiService.updateSupportRequest(ticketId, {
        responses: updatedResponses,
        status: newStatus
      });

      setTickets(prev => prev.map(t => t.id === ticketId ? {
        ...t,
        responses: updatedResponses,
        status: newStatus,
        updatedAt: new Date().toISOString()
      } : t));

      setReplyText(prev => ({ ...prev, [ticketId]: '' }));
      showToast('Response posted successfully.', 'success');
    } catch (err) {
      console.error('Failed to post reply:', err);
      showToast(err.message || 'Failed to post reply.', 'error');
    }
  };

  // Stats Counters
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => (t.status || '').toUpperCase() === 'OPEN').length;
  const inProgressCount = tickets.filter(t => (t.status || '').toUpperCase() === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => (t.status || '').toUpperCase() === 'RESOLVED').length;
  const closedCount = tickets.filter(t => (t.status || '').toUpperCase() === 'CLOSED').length;

  // Filtered Tickets List
  const filteredTickets = tickets.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (t.id || '').toLowerCase().includes(q) ||
      (t.subject || '').toLowerCase().includes(q) ||
      (t.message || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q) ||
      (t.vendorName || '').toLowerCase().includes(q) ||
      (t.vendorId || '').toLowerCase().includes(q) ||
      (t.userName || '').toLowerCase().includes(q) ||
      (t.userEmail || '').toLowerCase().includes(q);

    const normStatus = (t.status || 'OPEN').toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || normStatus === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || (t.category || '') === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || (t.priority || '').toUpperCase() === priorityFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const getStatusBadge = (st) => {
    const norm = (st || 'OPEN').toUpperCase();
    if (norm === 'OPEN') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" /> Open
        </span>
      );
    }
    if (norm === 'IN_PROGRESS') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          <RefreshCw className="w-3.5 h-3.5" /> In Progress
        </span>
      );
    }
    if (norm === 'RESOLVED') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
        </span>
      );
    }
    if (norm === 'CLOSED') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-slate-700 text-slate-300 border border-slate-600">
          <ShieldCheck className="w-3.5 h-3.5" /> Closed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <Clock className="w-3.5 h-3.5" /> {st}
      </span>
    );
  };

  const getPriorityBadge = (p) => {
    const norm = (p || 'Medium').toUpperCase();
    if (norm === 'CRITICAL' || norm === 'HIGH') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
          {p}
        </span>
      );
    }
    if (norm === 'MEDIUM') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {p}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        {p}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-[#F0FDFA]">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#0B3442] border border-[#1B5968] shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 text-[#14D9D5] text-xs font-bold uppercase tracking-wider mb-1">
            <LifeBuoy className="w-4 h-4 text-[#06B6B4]" /> Helpdesk & Grievance Resolution Portal
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isBidder ? 'Contact & Support Center' : 'Procurement Helpdesk & Ticket Management'}
          </h2>
          <p className="text-xs text-[#A7C9CE] mt-1">
            {isBidder
              ? 'Submit official inquiries, tender clarifications, grievance appeals, or technical assistance tickets.'
              : 'Audit, respond to, and manage bidder support tickets, tender clarifications, and compliance queries.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-[#071F2A] hover:bg-[#145364] text-[#A7C9CE] hover:text-white border border-[#1B5968] transition-colors cursor-pointer"
            title="Refresh Support Tickets"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#14D9D5]' : ''}`} />
          </button>

          {isBidder && (
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Support Request</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-[#0B3442] border border-[#1B5968] space-y-1">
          <span className="text-[10px] font-bold text-[#A7C9CE] uppercase">Total Tickets</span>
          <p className="text-2xl font-black text-white">{totalCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B3442] border border-amber-500/30 space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Open
          </span>
          <p className="text-2xl font-black text-amber-400">{openCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B3442] border border-cyan-500/30 space-y-1">
          <span className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> In Progress
          </span>
          <p className="text-2xl font-black text-cyan-400">{inProgressCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B3442] border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
          <p className="text-2xl font-black text-emerald-400">{resolvedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B3442] border border-slate-600/40 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Closed
          </span>
          <p className="text-2xl font-black text-slate-300">{closedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-[#0B3442] border border-[#1B5968] space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-[#A7C9CE] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, bidder, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#071F2A] border border-[#1B5968] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#A7C9CE]/60 focus:outline-none focus:border-[#06B6B4] transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#071F2A] border border-[#1B5968] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-[#06B6B4] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Tender Clarification">Tender Clarification</option>
              <option value="Document Verification Issue">Document Verification Issue</option>
              <option value="Payment & EMD Inquiry">Payment & EMD Inquiry</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Appeal / Grievance">Appeal / Grievance</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-[#071F2A] border border-[#1B5968] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-[#06B6B4] cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Quick Status Filter Tabs */}
        <div className="pt-3 border-t border-[#1B5968] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold mr-2 flex items-center gap-1 text-[#A7C9CE]">
            <Filter className="w-3.5 h-3.5 text-[#14D9D5]" /> Status:
          </span>
          {[
            { id: 'ALL', label: `All (${totalCount})` },
            { id: 'OPEN', label: `Open (${openCount})` },
            { id: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
            { id: 'RESOLVED', label: `Resolved (${resolvedCount})` },
            { id: 'CLOSED', label: `Closed (${closedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#06B6B4] text-white shadow-xs'
                  : 'bg-[#071F2A] text-[#A7C9CE] hover:bg-[#145364]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0B3442] border border-[#1B5968] space-y-3">
            <HelpCircle className="w-12 h-12 text-[#A7C9CE]/40 mx-auto" />
            <h3 className="text-base font-extrabold text-white">No Support Requests Found</h3>
            <p className="text-xs text-[#A7C9CE] max-w-md mx-auto">
              {searchQuery
                ? `No support requests match "${searchQuery}".`
                : isBidder
                ? 'You have not submitted any support tickets yet. Click "Create New Support Request" above to get assistance.'
                : 'There are currently no support requests matching the filter criteria.'}
            </p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const isExpanded = expandedTicketId === ticket.id;
            const normStatus = (ticket.status || 'OPEN').toUpperCase();

            return (
              <div
                key={ticket.id}
                className="rounded-2xl bg-[#0B3442] border border-[#1B5968] overflow-hidden shadow-sm transition-all"
              >
                {/* Ticket Header Row */}
                <div
                  onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-[#103D4A]/60 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#14D9D5]">{ticket.id}</span>
                      <span className="px-2 py-0.5 rounded bg-[#103D4A] border border-[#1B5968] text-[10px] font-semibold text-[#A7C9CE]">
                        {ticket.category || 'General Inquiry'}
                      </span>
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>

                    <h4 className="text-sm font-extrabold text-white truncate" title={ticket.subject}>
                      {ticket.subject}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#A7C9CE]">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#14D9D5]" />
                        <strong>{ticket.vendorName}</strong> ({ticket.vendorId || 'VND'})
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#A7C9CE]" />
                        {ticket.userName}
                      </span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      {ticket.responses && ticket.responses.length > 0 && (
                        <span className="text-[#14D9D5] font-bold">
                          • {ticket.responses.length} {ticket.responses.length === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="p-2 rounded-xl bg-[#071F2A] border border-[#1B5968] text-[#A7C9CE]">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details & Thread */}
                {isExpanded && (
                  <div className="p-5 border-t border-[#1B5968] bg-[#071F2A]/60 space-y-5 animate-in fade-in duration-150">
                    {/* Original Message Box */}
                    <div className="p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#14D9D5] flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" /> Initial Ticket Description
                        </span>
                        <span className="text-[11px] text-[#A7C9CE]">
                          {new Date(ticket.createdAt || Date.now()).toLocaleString('en-GB')}
                        </span>
                      </div>
                      <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                        {ticket.message}
                      </p>
                    </div>

                    {/* Admin Status Controls (For Admin / Officer) */}
                    {isAdminOrOfficer && (
                      <div className="p-4 rounded-xl bg-[#103D4A] border border-[#1B5968] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <Shield className="w-4 h-4 text-[#14D9D5]" />
                          <span>Admin Ticket Workflow Action:</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'OPEN')}
                            disabled={updatingStatusId === ticket.id || normStatus === 'OPEN'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              normStatus === 'OPEN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                                : 'bg-[#071F2A] hover:bg-[#145364] text-[#A7C9CE] border border-[#1B5968]'
                            }`}
                          >
                            Set OPEN
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                            disabled={updatingStatusId === ticket.id || normStatus === 'IN_PROGRESS'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              normStatus === 'IN_PROGRESS'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                                : 'bg-[#071F2A] hover:bg-[#145364] text-[#A7C9CE] border border-[#1B5968]'
                            }`}
                          >
                            Set IN PROGRESS
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                            disabled={updatingStatusId === ticket.id || normStatus === 'RESOLVED'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              normStatus === 'RESOLVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            Set RESOLVED
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}
                            disabled={updatingStatusId === ticket.id || normStatus === 'CLOSED'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              normStatus === 'CLOSED'
                                ? 'bg-slate-700 text-slate-300 border border-slate-600 cursor-default'
                                : 'bg-[#071F2A] hover:bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            Close Ticket
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Responses / Conversation History */}
                    {ticket.responses && ticket.responses.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-[#A7C9CE] uppercase tracking-wider flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5 text-[#14D9D5]" /> Conversation History ({ticket.responses.length})
                        </h5>

                        <div className="space-y-2.5">
                          {ticket.responses.map((resp, idx) => {
                            const isDesk = String(resp.authorRole || '').toUpperCase() === 'OFFICER' || String(resp.authorRole || '').toUpperCase() === 'ADMIN';

                            return (
                              <div
                                key={resp.id || idx}
                                className={`p-4 rounded-xl text-xs space-y-1.5 border ${
                                  isDesk
                                    ? 'bg-[#103D4A] border-[#06B6B4]/40'
                                    : 'bg-[#0B3442] border-[#1B5968]'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{resp.authorName}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      isDesk
                                        ? 'bg-[#06B6B4]/20 text-[#14D9D5] border border-[#06B6B4]/30'
                                        : 'bg-[#071F2A] text-[#A7C9CE] border border-[#1B5968]'
                                    }`}>
                                      {resp.authorRole || 'User'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#A7C9CE]">
                                    {new Date(resp.createdAt || Date.now()).toLocaleString('en-GB')}
                                  </span>
                                </div>
                                <p className="text-xs text-[#F0FDFA] leading-relaxed whitespace-pre-wrap">
                                  {resp.message}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Reply Input Box */}
                    <div className="p-4 rounded-xl bg-[#0B3442] border border-[#1B5968] space-y-3">
                      <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-[#14D9D5]" />
                        {isAdminOrOfficer ? 'Post Helpdesk Response / Resolution Message' : 'Add Follow-up Message'}
                      </label>
                      <textarea
                        value={replyText[ticket.id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        placeholder="Type your official reply or clarification here..."
                        rows={3}
                        className="w-full bg-[#071F2A] border border-[#1B5968] focus:border-[#06B6B4] rounded-xl p-3 text-xs text-white placeholder-[#A7C9CE]/50 focus:outline-none transition-colors"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => handlePostReply(ticket.id)}
                          className="px-4 py-2 rounded-xl bg-[#06B6B4] hover:bg-[#14D9D5] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create New Support Request (Bidder) */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-[#071F2A]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl max-w-lg w-full border border-[#1B5968] shadow-2xl p-6 space-y-5 bg-[#0B3442] text-white animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-[#1B5968] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#06B6B4]/20 text-[#14D9D5] border border-[#06B6B4]/30 text-[10px] font-extrabold uppercase tracking-wider">
                  New Ticket
                </span>
                <h3 className="text-lg font-extrabold mt-1 text-white">
                  Create Support & Clarification Request
                </h3>
              </div>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="p-1.5 rounded-lg text-[#A7C9CE] hover:text-white hover:bg-[#103D4A] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Auto-populated details card */}
            <div className="p-3.5 rounded-xl bg-[#071F2A] border border-[#1B5968] space-y-1 text-xs text-[#A7C9CE]">
              <div className="flex justify-between items-center">
                <span>Bidder Enterprise:</span>
                <strong className="text-white">{bidderCompany}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Bidder Org ID:</span>
                <span className="font-mono text-[#14D9D5] font-bold">{bidderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Authorized Contact:</span>
                <span className="text-white">{userName} ({userEmail})</span>
              </div>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#A7C9CE]">Inquiry Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#071F2A] border border-[#1B5968] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-[#06B6B4] cursor-pointer"
                  >
                    <option value="Tender Clarification">Tender Clarification</option>
                    <option value="Document Verification Issue">Document Verification Issue</option>
                    <option value="Payment & EMD Inquiry">Payment & EMD Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Appeal / Grievance">Appeal / Grievance</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#A7C9CE]">Priority Level *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#071F2A] border border-[#1B5968] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-[#06B6B4] cursor-pointer"
                  >
                    <option value="Low">Low (General Query)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="High">High (Impending Tender Deadline)</option>
                    <option value="Critical">Critical (Technical Blockage)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-white">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Query regarding Clause 4.2 technical qualification criteria"
                  required
                  className="w-full bg-[#071F2A] border border-[#1B5968] focus:border-[#06B6B4] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A7C9CE]/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-white">Detailed Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide comprehensive details about your inquiry, tender reference ID, or the issue experienced..."
                  rows={4}
                  required
                  className="w-full bg-[#071F2A] border border-[#1B5968] focus:border-[#06B6B4] rounded-xl p-3 text-xs text-white placeholder-[#A7C9CE]/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#071F2A] hover:bg-[#145364] text-[#A7C9CE] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !subject.trim() || !message.trim()}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
                    submitting || !subject.trim() || !message.trim()
                      ? 'bg-[#06B6B4]/50 cursor-not-allowed'
                      : 'bg-[#06B6B4] hover:bg-[#14D9D5]'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Support Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
