import React, { useEffect, useState } from 'react';
import {
  FileCheck2,
  FileText,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Upload,
  ExternalLink,
  Loader2,
  Package,
} from 'lucide-react';
import { productService } from '../api/productService';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DocumentBadge from '../components/common/DocumentBadge';
import { useToast } from '../context/ToastContext';

export const DocumentsHub = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'missing-msds', 'missing-draft-coa', 'missing-coa', 'complete'

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Error fetching products for documents hub:', err);
      toast.error('Failed to load catalog documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUploadDoc = async (productId, docType, file) => {
    try {
      const res = await productService.uploadProductDocument(productId, docType, file);
      if (res.success) {
        toast.success(`${docType.toUpperCase()} document uploaded successfully.`);
        fetchProducts();
      }
    } catch (err) {
      toast.error('Failed to upload document.');
    }
  };

  const handleDeleteDoc = async (productId, docType) => {
    try {
      const res = await productService.deleteProductDocument(productId, docType);
      if (res.success) {
        toast.success(`${docType.toUpperCase()} document removed.`);
        fetchProducts();
      }
    } catch (err) {
      toast.error('Failed to remove document.');
    }
  };

  const filteredProducts = products.filter((prod) => {
    const q = search.toLowerCase();
    const matchesSearch =
      prod.name?.toLowerCase().includes(q) ||
      prod.specifications?.casNumber?.toLowerCase().includes(q) ||
      prod.specifications?.catalogueNumber?.toLowerCase().includes(q) ||
      prod.mainProduct?.heading?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    const hasMsds = Boolean(prod.hasMsds || prod.documents?.msds?.url);
    const hasDraftCoa = Boolean(prod.hasDraftCoa || prod.documents?.draftCoa?.url);
    const hasCoa = Boolean(prod.hasCoa || prod.documents?.coa?.url);

    if (filterType === 'missing-msds') return !hasMsds;
    if (filterType === 'missing-draft-coa') return !hasDraftCoa;
    if (filterType === 'missing-coa') return !hasCoa;
    if (filterType === 'complete') return hasMsds && hasCoa;

    return true;
  });

  // Calculate summary counts
  const totalItems = products.length;
  const countWithMsds = products.filter((p) => p.hasMsds || p.documents?.msds?.url).length;
  const countWithDraftCoa = products.filter((p) => p.hasDraftCoa || p.documents?.draftCoa?.url).length;
  const countWithCoa = products.filter((p) => p.hasCoa || p.documents?.coa?.url).length;
  const countComplete = products.filter(
    (p) => (p.hasMsds || p.documents?.msds?.url) && (p.hasCoa || p.documents?.coa?.url)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Compliance & Analytical Documents Hub
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Centralized management for Material Safety Data Sheets (MSDS), Draft COAs, and Released Batch COAs.
        </p>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterType('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterType === 'all'
              ? 'bg-emerald-50 border-emerald-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Products</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalItems}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Click to view all</div>
        </div>

        <div
          onClick={() => setFilterType('missing-msds')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterType === 'missing-msds'
              ? 'bg-orange-50 border-orange-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase">MSDS Coverage</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {countWithMsds} <span className="text-xs text-slate-400">/ {totalItems}</span>
          </div>
          <div className="text-[11px] text-orange-700 font-medium mt-1">
            {totalItems - countWithMsds} missing MSDS
          </div>
        </div>

        <div
          onClick={() => setFilterType('missing-coa')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterType === 'missing-coa'
              ? 'bg-orange-50 border-orange-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase">Final COA Coverage</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {countWithCoa} <span className="text-xs text-slate-400">/ {totalItems}</span>
          </div>
          <div className="text-[11px] text-orange-700 font-medium mt-1">
            {totalItems - countWithCoa} missing COA
          </div>
        </div>

        <div
          onClick={() => setFilterType('complete')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterType === 'complete'
              ? 'bg-emerald-50 border-emerald-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 uppercase">Fully Documented</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {countComplete}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Both MSDS & COA ready</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, CAS, or catalogue number..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Documents Status</option>
              <option value="missing-msds">Missing MSDS Only</option>
              <option value="missing-coa">Missing Final COA Only</option>
              <option value="missing-draft-coa">Missing Draft COA</option>
              <option value="complete">Complete (MSDS & COA)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Documents Grid / Table */}
      <Card>
        {loading ? (
          <div className="text-center py-20 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading documents registry...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <FileCheck2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">No Matching Products</h4>
            <p className="text-xs text-slate-500 mt-1">
              Adjust your search or filter options to review product compliance certificates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod._id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Product Chemical Header */}
                <div className="lg:w-1/3 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                      {prod.name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <span className="text-emerald-700 font-semibold">
                      {prod.mainProduct?.heading || 'Parent API'}
                    </span>
                    <span>•</span>
                    <span className="font-mono-code">
                      CAS: {prod.specifications?.casNumber || 'N/A'}
                    </span>
                  </div>
                  {prod.specifications?.catalogueNumber && (
                    <div className="text-[11px] text-slate-400 font-mono-code mt-0.5">
                      Cat: {prod.specifications.catalogueNumber}
                    </div>
                  )}
                </div>

                {/* 3 Document Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  {/* MSDS Slot */}
                  <DocumentBadge
                    docType="msds"
                    label="MSDS"
                    docData={prod.documents?.msds}
                    onUpload={(f) => handleUploadDoc(prod._id, 'msds', f)}
                    onDelete={() => handleDeleteDoc(prod._id, 'msds')}
                  />

                  {/* Draft COA Slot */}
                  <DocumentBadge
                    docType="draftCoa"
                    label="Draft COA"
                    docData={prod.documents?.draftCoa}
                    onUpload={(f) => handleUploadDoc(prod._id, 'draftCoa', f)}
                    onDelete={() => handleDeleteDoc(prod._id, 'draftCoa')}
                  />

                  {/* COA Slot */}
                  <DocumentBadge
                    docType="coa"
                    label="Batch COA"
                    docData={prod.documents?.coa}
                    onUpload={(f) => handleUploadDoc(prod._id, 'coa', f)}
                    onDelete={() => handleDeleteDoc(prod._id, 'coa')}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DocumentsHub;
