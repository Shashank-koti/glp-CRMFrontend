import React, { useEffect, useState } from 'react';
import {
  Inbox,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  Calendar,
  Globe,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Package,
  Layers,
  FileText,
} from 'lucide-react';
import { inquiryService } from '../api/inquiryService';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

// Helper to determine badge styling for form source differentiation
const getSourceMeta = (sourceForm = '', inquiryType = '') => {
  const s = (sourceForm || '').toLowerCase();
  const t = (inquiryType || '').toLowerCase();

  if (s.includes('contact') || t.includes('contact')) {
    return { variant: 'info', label: 'Contact Us Form' };
  }
  if (s.includes('quick') || t.includes('quick')) {
    return { variant: 'primary', label: 'Quick Enquiry' };
  }
  if (s.includes('checkout') || t.includes('pricing') || s.includes('pricing')) {
    return { variant: 'orange', label: 'Checkout / PO' };
  }
  if (s.includes('cart') || t.includes('cart')) {
    return { variant: 'purple', label: 'Cart Quote' };
  }
  if (s.includes('product') || t.includes('quote')) {
    return { variant: 'success', label: 'Product Quote' };
  }
  return { variant: 'default', label: sourceForm || inquiryType || 'Website Form' };
};

export const Inquiries = () => {
  const toast = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.sourceForm = sourceFilter;

      const res = await inquiryService.getInquiries(params);
      if (res.success && Array.isArray(res.data)) {
        setInquiries(res.data);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      toast.error('Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, sourceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInquiries();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await inquiryService.updateInquiryStatus(id, newStatus);
      if (res.success) {
        toast.success(`Inquiry status updated to ${newStatus}.`);
        setInquiries((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update inquiry status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Quote Requests & Inquiries</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review purchase requests, analytical inquiry leads, quick enquiries, and contact messages submitted through the website.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, company, email, product, or PO number..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Form Source Filter */}
          <div className="w-full sm:w-56">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="">All Form Sources</option>
              <option value="Contact Us Page">Contact Us Page</option>
              <option value="Quick Enquiry Page">Quick Enquiry Page</option>
              <option value="Product Details - Quote Request Modal">Product Quote Modal</option>
              <option value="Product Details - Checkout Request Modal">Checkout / PO Modal</option>
              <option value="Cart Page - Multi-Product Quote Request">Cart Quote Request</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <Button type="submit" variant="secondary" icon={Search}>
            Filter
          </Button>
        </form>
      </Card>

      {/* Inquiries Table */}
      <Card>
        {loading ? (
          <div className="text-center py-20 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading customer inquiries...</span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">No Inquiries Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Customer inquiries submitted via Contact Us, Quick Enquiry, Cart, or Product pages will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-3 font-semibold">Customer / Company</th>
                  <th className="py-3 px-3 font-semibold">Form Source</th>
                  <th className="py-3 px-3 font-semibold">Product / Requirements</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inq) => {
                  const sourceMeta = getSourceMeta(inq.sourceForm, inq.inquiryType);
                  return (
                    <tr key={inq._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-3">
                        <div className="font-bold text-slate-900 text-sm">{inq.customerName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{inq.companyName || inq.email}</span>
                          {inq.country && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400">{inq.country}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Form Source Differentiation Badge */}
                      <td className="py-4 px-3">
                        <Badge variant={sourceMeta.variant} size="xs">
                          {sourceMeta.label}
                        </Badge>
                        {inq.poNumber && (
                          <div className="text-[10px] text-amber-700 font-semibold font-mono mt-1">
                            PO: {inq.poNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-3 text-xs text-slate-700 max-w-xs">
                        {inq.items && inq.items.length > 0 ? (
                          <div className="text-emerald-700 font-semibold">
                            {inq.items.length} Item{inq.items.length > 1 ? 's' : ''}:{' '}
                            <span className="text-slate-500 font-normal">
                              {inq.items.map((i) => i.name).slice(0, 2).join(', ')}
                              {inq.items.length > 2 ? '...' : ''}
                            </span>
                          </div>
                        ) : (
                          <div className="text-slate-800 truncate font-medium">
                            {inq.productInterested || inq.chemicalName || inq.subject || 'General Inquiry'}
                          </div>
                        )}
                        {(inq.chemicalName || inq.casNo) && (
                          <div className="text-[11px] text-slate-500 font-mono-code mt-0.5">
                            {inq.chemicalName} {inq.casNo ? `(CAS: ${inq.casNo})` : ''}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-3">
                        <select
                          disabled={updatingId === inq._id}
                          value={inq.status || 'New'}
                          onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-hidden cursor-pointer ${inq.status === 'New'
                            ? 'bg-orange-50 text-orange-800 border-orange-200'
                            : inq.status === 'Contacted'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      <td className="py-4 px-3 text-xs text-slate-500">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-3 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedInquiry(inq)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Inquiry Detail Modal */}
      <Modal
        isOpen={Boolean(selectedInquiry)}
        onClose={() => setSelectedInquiry(null)}
        title="Inquiry & Quote Details"
        subtitle={`Submitted by ${selectedInquiry?.customerName || ''}`}
      >
        {selectedInquiry && (() => {
          const modalSource = getSourceMeta(selectedInquiry.sourceForm, selectedInquiry.inquiryType);
          return (
            <div className="space-y-6">
              {/* Form Origin Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Form Origin:</span>
                  <Badge variant={modalSource.variant} size="sm">
                    {modalSource.label}
                  </Badge>
                  {selectedInquiry.sourceForm && selectedInquiry.sourceForm !== modalSource.label && (
                    <span className="text-slate-400 font-mono text-[11px]">({selectedInquiry.sourceForm})</span>
                  )}
                </div>
                <div className="text-slate-400 text-[11px]">
                  Submitted: {new Date(selectedInquiry.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Customer Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px]">
                    Customer Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{selectedInquiry.customerName}</span>
                </div>

                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px]">
                    Company Name
                  </span>
                  <span className="font-semibold text-slate-800">{selectedInquiry.companyName || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px]">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>

                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px]">
                    Phone / Contact
                  </span>
                  <span className="font-medium text-slate-800">{selectedInquiry.phone || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px]">
                    Country
                  </span>
                  <span className="font-medium text-slate-800">{selectedInquiry.country || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px]">
                    Inquiry Status
                  </span>
                  <Badge
                    variant={
                      selectedInquiry.status === 'New'
                        ? 'warning'
                        : selectedInquiry.status === 'Contacted'
                          ? 'info'
                          : 'success'
                    }
                    size="xs"
                  >
                    {selectedInquiry.status || 'New'}
                  </Badge>
                </div>

                {selectedInquiry.role && (
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider block text-[10px]">
                      Designation / Role
                    </span>
                    <span className="font-medium text-slate-800">{selectedInquiry.role}</span>
                  </div>
                )}

                {selectedInquiry.poNumber && (
                  <div>
                    <span className="text-amber-700 uppercase tracking-wider block text-[10px] font-bold">
                      PO / Reference Number
                    </span>
                    <span className="font-bold text-amber-800 font-mono text-sm">{selectedInquiry.poNumber}</span>
                  </div>
                )}
              </div>

              {/* Single Product / Chemical Specifics (for Quick Enquiry) */}
              {(selectedInquiry.chemicalName || selectedInquiry.casNo || selectedInquiry.productInterested) && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Inquiry Product Specifics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    {selectedInquiry.productInterested && (
                      <div>
                        <span className="text-slate-400 font-medium">Product Interested:</span>{' '}
                        <span className="font-semibold text-slate-900">{selectedInquiry.productInterested}</span>
                      </div>
                    )}
                    {selectedInquiry.chemicalName && (
                      <div>
                        <span className="text-slate-400 font-medium">Chemical Name:</span>{' '}
                        <span className="font-semibold text-slate-900">{selectedInquiry.chemicalName}</span>
                      </div>
                    )}
                    {selectedInquiry.casNo && (
                      <div>
                        <span className="text-slate-400 font-medium">CAS Number:</span>{' '}
                        <span className="font-mono text-slate-900">{selectedInquiry.casNo}</span>
                      </div>
                    )}
                    {selectedInquiry.quantity && (
                      <div>
                        <span className="text-slate-400 font-medium">Quantity:</span>{' '}
                        <span className="font-semibold text-slate-900">{selectedInquiry.quantity}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requested Items (Cart items if applicable) */}
              {selectedInquiry.items && selectedInquiry.items.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                    Requested Items ({selectedInquiry.items.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedInquiry.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between shadow-2xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          {item.cas && (
                            <div className="text-slate-500 text-[11px] font-mono-code">CAS: {item.cas}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700">
                            {item.quantity} {item.unit || 'units'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Customer Message / Notes
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message || 'No additional message was provided.'}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default Inquiries;
