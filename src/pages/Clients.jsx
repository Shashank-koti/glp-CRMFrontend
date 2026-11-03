import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  Search,
  Filter,
  ExternalLink,
  Trash2,
  Edit3,
  Eye,
  RefreshCw,
  Download,
  MessageSquareQuote,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clientService from '../api/clientService';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const Clients = () => {
  const toast = useToast();

  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    newClientsLast30Days: 0,
    clientsWithInquiriesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters and Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all'); // 'all', 'has_inquiries', 'no_inquiries'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    status: 'active',
    role: 'user',
    password: '',
    notes: '',
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState(null);

  // Notes quick update in details modal
  const [clientNotes, setClientNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Fetch client list
  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await clientService.getClients(params);
      if (res.success && Array.isArray(res.data)) {
        let list = res.data;

        // In-memory filter for inquiry activity if requested
        if (activityFilter === 'has_inquiries') {
          list = list.filter((c) => (c.inquiryCount || 0) > 0);
        } else if (activityFilter === 'no_inquiries') {
          list = list.filter((c) => (c.inquiryCount || 0) === 0);
        }

        setClients(list);
        setTotalPages(res.pagination?.pages || 1);
        setTotalCount(res.pagination?.total || list.length);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      toast.error('Failed to load registered clients.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch overview stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await clientService.getClientStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching client stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, statusFilter, activityFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchClients();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setActivityFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  // Open Details Modal & fetch complete inquiry history
  const handleViewDetails = async (client) => {
    try {
      setSelectedClient(client);
      setClientNotes(client.notes || '');
      setIsDetailsOpen(true);
      setDetailsLoading(true);

      const res = await clientService.getClientById(client._id);
      if (res.success && res.data) {
        setSelectedClient(res.data);
        setClientNotes(res.data.notes || '');
      }
    } catch (err) {
      console.error('Error fetching client details:', err);
      toast.error('Failed to load full client profile.');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Quick save notes from details modal
  const handleSaveNotes = async () => {
    if (!selectedClient) return;
    try {
      setSavingNotes(true);
      const res = await clientService.updateClient(selectedClient._id, { notes: clientNotes });
      if (res.success) {
        toast.success('Client notes updated successfully.');
        setSelectedClient((prev) => ({ ...prev, notes: clientNotes }));
        setClients((prev) =>
          prev.map((c) => (c._id === selectedClient._id ? { ...c, notes: clientNotes } : c))
        );
      }
    } catch (err) {
      console.error('Error saving notes:', err);
      toast.error('Failed to update notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({
      clientName: '',
      company: '',
      email: '',
      phone: '',
      country: '',
      status: 'active',
      role: 'user',
      password: '',
      notes: '',
    });
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setFormData({
      clientName: client.clientName || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      country: client.country || '',
      status: client.status || 'active',
      role: client.role || 'user',
      password: '', // Leave blank unless resetting
      notes: client.notes || '',
    });
    setIsFormOpen(true);
  };

  // Handle Form Submit (Create or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clientName.trim() || !formData.email.trim()) {
      return toast.error('Client name and email are required.');
    }

    if (!editingClient && (!formData.password || formData.password.length < 6)) {
      return toast.error('Password must be at least 6 characters for new clients.');
    }

    try {
      setFormSubmitting(true);
      if (editingClient) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        const res = await clientService.updateClient(editingClient._id, payload);
        if (res.success) {
          toast.success('Client details updated successfully.');
          setIsFormOpen(false);
          fetchClients();
          fetchStats();
        }
      } else {
        const res = await clientService.createClient(formData);
        if (res.success) {
          toast.success('New client account created successfully.');
          setIsFormOpen(false);
          fetchClients();
          fetchStats();
        }
      }
    } catch (err) {
      console.error('Error saving client:', err);
      const errMsg = err.response?.data?.message || 'Failed to save client.';
      toast.error(errMsg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Dialog
  const handleOpenDelete = (client) => {
    setClientToDelete(client);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await clientService.deleteClient(clientToDelete._id);
      if (res.success) {
        toast.success(`Client ${clientToDelete.clientName} was deleted.`);
        setIsDeleteOpen(false);
        setClientToDelete(null);
        fetchClients();
        fetchStats();
      }
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error('Failed to delete client account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = (email, id) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (clients.length === 0) {
      return toast.warning('No clients available to export.');
    }

    const headers = ['Client Name', 'Company', 'Email', 'Phone', 'Country', 'Status', 'Role', 'Inquiries Count', 'Registered At'];
    const rows = clients.map((c) => [
      `"${c.clientName || ''}"`,
      `"${c.company || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.country || ''}"`,
      `"${c.status || 'active'}"`,
      `"${c.role || 'user'}"`,
      c.inquiryCount || 0,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GLP_Clients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported clients to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Registered Clients & Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered pharmaceutical clients, procurement leads, and track customer inquiries
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            icon={RefreshCw}
            onClick={() => {
              fetchClients();
              fetchStats();
              toast.info('Refreshed client data');
            }}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={UserPlus}
            onClick={handleOpenCreate}
          >
            Add Client
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Clients */}
        <Card className="p-5 relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Clients
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {statsLoading ? '...' : stats.totalClients}
            </span>
            <span className="text-xs text-emerald-700 font-medium">Registered Accounts</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Registered via storefront & CRM onboarding
          </div>
        </Card>

        {/* Active Accounts */}
        <Card className="p-5 relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Accounts
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-700">
              {statsLoading ? '...' : stats.activeClients}
            </span>
            <span className="text-xs text-slate-500 font-normal">Active Clients</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {stats.inactiveClients > 0 ? `${stats.inactiveClients} inactive/suspended` : 'All accounts in good standing'}
          </div>
        </Card>

        {/* Clients with Inquiries / Quote Requests */}
        <Card className="p-5 relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Clients With Quotes
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-orange-600">
              {statsLoading ? '...' : stats.clientsWithInquiriesCount}
            </span>
            <span className="text-xs text-orange-700 font-medium">Active Buyers</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Clients who submitted quote requests or RFQs
          </div>
        </Card>

        {/* New Registrations (Last 30 Days) */}
        <Card className="p-5 relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recent (30 Days)
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700">
              {statsLoading ? '...' : stats.newClientsLast30Days}
            </span>
            <span className="text-xs text-purple-700 font-medium">New Clients</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Onboarded in the last 30 days
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, company, email, phone, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-44 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Inactive Accounts</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>

          {/* Activity Filter */}
          <div className="w-full sm:w-48 shrink-0">
            <select
              value={activityFilter}
              onChange={(e) => {
                setActivityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
            >
              <option value="all">All Buyer Activity</option>
              <option value="has_inquiries">Has Quote Requests</option>
              <option value="no_inquiries">No Quote Requests</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full sm:w-44 shrink-0">
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
            >
              <option value="createdAt:desc">Newest Registered</option>
              <option value="createdAt:asc">Oldest Registered</option>
              <option value="clientName:asc">Name (A-Z)</option>
              <option value="clientName:desc">Name (Z-A)</option>
              <option value="company:asc">Company (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button type="submit" size="sm" variant="primary">
              Filter
            </Button>
            {(search || statusFilter !== 'all' || activityFilter !== 'all') && (
              <Button type="button" size="sm" variant="ghost" onClick={handleClearFilters}>
                Reset
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Main Clients Table */}
      <Card>
        <CardHeader
          title={`Registered Clients (${totalCount})`}
          subtitle="Real-time list of all users and organizations registered in GLP Pharma database"
          action={
            <div className="text-xs text-slate-500 font-medium">
              Showing page {page} of {totalPages}
            </div>
          }
        />

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading client records...</span>
            </div>
          </div>
        ) : clients.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No client accounts found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {search || statusFilter !== 'all'
                ? 'Try clearing your search query or filters to see more results.'
                : 'Clients who register on your website storefront or via CRM will automatically appear here.'}
            </p>
            <div className="mt-5">
              <Button size="sm" variant="primary" icon={UserPlus} onClick={handleOpenCreate}>
                Add First Client
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/60">
                  <th className="py-3 px-4 font-semibold">Client / Company</th>
                  <th className="py-3 px-4 font-semibold">Contact Details</th>
                  <th className="py-3 px-4 font-semibold">Country</th>
                  <th className="py-3 px-4 font-semibold">Quote Inquiries</th>
                  <th className="py-3 px-4 font-semibold">Account Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => {
                  const initial = (client.clientName || 'C').charAt(0).toUpperCase();
                  return (
                    <tr
                      key={client._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Client Name & Company */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <span className="truncate">{client.clientName}</span>
                              {client.role === 'admin' && (
                                <Badge variant="purple" size="xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{client.company || 'Individual / Research'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Email, Phone) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${client.email}`}
                              className="hover:text-emerald-700 hover:underline truncate max-w-[200px]"
                              title={client.email}
                            >
                              {client.email}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(client.email, client._id)}
                              className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
                              title="Copy Email"
                            >
                              {copiedId === client._id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <a
                                href={`tel:${client.phone}`}
                                className="hover:text-emerald-700 hover:underline truncate"
                              >
                                {client.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Country */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{client.country || 'Not specified'}</span>
                        </div>
                      </td>

                      {/* Inquiries / Quote Activity */}
                      <td className="py-3.5 px-4">
                        {client.inquiryCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleViewDetails(client)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{client.inquiryCount} {client.inquiryCount === 1 ? 'Quote' : 'Quotes'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No inquiries yet</span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            client.status === 'inactive'
                              ? 'danger'
                              : client.status === 'pending'
                                ? 'warning'
                                : 'success'
                          }
                          size="sm"
                        >
                          <span className="capitalize">{client.status || 'Active'}</span>
                        </Badge>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(client)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="View Profile & Inquiries"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(client)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                            title="Edit Client"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(client)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4">
            <div className="text-xs text-slate-500">
              Showing page {page} of {totalPages} ({totalCount} total clients)
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="text-xs font-semibold px-2 text-slate-700">
                {page} / {totalPages}
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================= */}
      {/* 1. Client Full Profile & Inquiries Modal */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedClient?.clientName || 'Client Profile'}
        subtitle={`Registered Client Profile & Storefront Activity`}
        maxWidth="max-w-3xl"
      >
        {detailsLoading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
            Loading complete client profile...
          </div>
        ) : selectedClient ? (
          <div className="space-y-6">
            {/* Top Overview Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                  {(selectedClient.clientName || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{selectedClient.clientName}</span>
                    <Badge
                      variant={selectedClient.status === 'inactive' ? 'danger' : 'success'}
                      size="xs"
                    >
                      {selectedClient.status || 'Active'}
                    </Badge>
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{selectedClient.company || 'Individual / Non-affiliated'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit3}
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenEdit(selectedClient);
                  }}
                >
                  Edit Account
                </Button>
              </div>
            </div>

            {/* Profile Grid Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Address</span>
                </div>
                <div className="text-sm font-semibold text-slate-800 break-all">
                  <a
                    href={`mailto:${selectedClient.email}`}
                    className="hover:text-emerald-700 hover:underline"
                  >
                    {selectedClient.email}
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Number</span>
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {selectedClient.phone || 'Not provided'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Country / Region</span>
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {selectedClient.country || 'Not specified'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Registered Date</span>
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {new Date(selectedClient.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Account Role</span>
                </div>
                <div className="text-sm font-semibold text-slate-800 capitalize">
                  {selectedClient.role || 'user'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <MessageSquareQuote className="w-3.5 h-3.5" />
                  <span>Total Quotes / RFQs</span>
                </div>
                <div className="text-sm font-bold text-emerald-700">
                  {selectedClient.inquiries?.length || selectedClient.inquiryCount || 0} Inquiries
                </div>
              </div>
            </div>

            {/* Admin Internal Notes Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Internal CRM Notes
                </label>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={savingNotes}
                  onClick={handleSaveNotes}
                >
                  Save Notes
                </Button>
              </div>
              <textarea
                rows={2}
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Add internal notes about this client (e.g. preferred delivery terms, commercial discount tier, VIP account)..."
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Quote Inquiries Submitted by this Client */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
                  <span>Inquiries & Quote Requests</span>
                  <Badge variant="primary" size="xs">
                    {selectedClient.inquiries?.length || 0}
                  </Badge>
                </h4>
                <Link
                  to="/inquiries"
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Open Inquiries Hub</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {!selectedClient.inquiries || selectedClient.inquiries.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  This client has not submitted any quote requests or inquiries yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {selectedClient.inquiries.map((inq) => (
                    <div
                      key={inq._id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>{inq.subject || inq.productInterested || inq.inquiryType || 'Quote Inquiry'}</span>
                            <Badge
                              variant={
                                inq.status === 'New'
                                  ? 'warning'
                                  : inq.status === 'Contacted'
                                    ? 'info'
                                    : 'success'
                              }
                              size="xs"
                            >
                              {inq.status || 'New'}
                            </Badge>
                          </div>
                          {inq.productInterested && (
                            <div className="text-xs text-emerald-700 font-medium mt-0.5">
                              Target Product: {inq.productInterested}
                            </div>
                          )}
                          {inq.items && inq.items.length > 0 && (
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                              <Package className="w-3 h-3 text-slate-400" />
                              <span>{inq.items.length} items requested</span>
                              <span>•</span>
                              <span>{inq.items.map((i) => i.name).filter(Boolean).slice(0, 2).join(', ')}</span>
                            </div>
                          )}
                          <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                            "{inq.message}"
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] text-slate-400 block">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {inq.sourceForm || 'Website'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ========================================================= */}
      {/* 2. Add / Edit Client Modal */}
      {/* ========================================================= */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingClient ? 'Edit Client Account' : 'Register New Client'}
        subtitle={
          editingClient
            ? `Update profile information for ${editingClient.clientName}`
            : 'Add a new client or pharmaceutical partner account to the CRM'
        }
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Client Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Arthur Miller"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Company / Organization */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Novartis Lab Services"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="client@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 555-0199"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Country
              </label>
              <input
                type="text"
                placeholder="e.g. Germany, United States, India"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {editingClient ? 'Reset Password (optional)' : 'Password'} {!editingClient && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="password"
              required={!editingClient}
              placeholder={editingClient ? 'Leave empty to keep existing password' : 'At least 6 characters'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
            />
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Internal Admin Notes
            </label>
            <textarea
              rows={2}
              placeholder="Commercial terms, special notes, preferred shipping partner..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={formSubmitting}
            >
              {editingClient ? 'Update Client' : 'Create Client Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* 3. Delete Confirmation Modal */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Client Account"
        subtitle="This action cannot be undone"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              Are you sure you want to delete the account for{' '}
              <strong className="font-bold">{clientToDelete?.clientName}</strong> (
              {clientToDelete?.email})? They will no longer be able to log in to the website storefront.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleteLoading}
              onClick={handleConfirmDelete}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Clients;
