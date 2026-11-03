import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { mainProductService } from '../api/mainProductService';
import { productService } from '../api/productService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import DocumentBadge from '../components/common/DocumentBadge';
import { useToast } from '../context/ToastContext';

export const MainProductImpurities = () => {
  const { id } = useParams();
  const toast = useToast();

  const [mainProduct, setMainProduct] = useState(null);
  const [impurities, setImpurities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [docFilter, setDocFilter] = useState('');

  // Delete State
  const [deleteImpurity, setDeleteImpurity] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mainRes, subRes] = await Promise.allSettled([
        mainProductService.getMainProductById(id),
        productService.getProducts({ mainProduct: id, limit: 100 }),
      ]);

      if (mainRes.status === 'fulfilled' && mainRes.value?.success) {
        setMainProduct(mainRes.value.data);
      } else {
        toast.error('Parent main product not found.');
      }

      if (subRes.status === 'fulfilled' && subRes.value?.success) {
        setImpurities(subRes.value.data || []);
      }
    } catch (err) {
      console.error('Error fetching main product impurities:', err);
      toast.error('Failed to load impurities data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // Handle Delete Impurity
  const handleDeleteImpurity = async () => {
    if (!deleteImpurity) return;
    try {
      setDeleting(true);
      const res = await productService.deleteProduct(deleteImpurity._id);
      if (res.success) {
        toast.success(`Impurity '${deleteImpurity.name}' deleted.`);
        setDeleteImpurity(null);
        fetchData();
      } else {
        toast.error(res.message || 'Failed to delete impurity.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Error deleting impurity.');
    } finally {
      setDeleting(false);
    }
  };

  // Quick document handlers
  const handleUploadDoc = async (productId, docType, file) => {
    try {
      const res = await productService.uploadProductDocument(productId, docType, file);
      if (res.success) {
        toast.success(`${docType.toUpperCase()} uploaded.`);
        fetchData();
      } else {
        toast.error(res.message || 'Upload failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading document.');
    }
  };

  // Filtered impurities
  const filteredImpurities = impurities.filter((imp) => {
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchName = imp.name?.toLowerCase().includes(term);
      const matchCas = imp.specifications?.casNumber?.toLowerCase().includes(term);
      const matchCat = imp.specifications?.catalogueNumber?.toLowerCase().includes(term);
      const matchIupac = imp.specifications?.iupacName?.toLowerCase().includes(term);
      if (!matchName && !matchCas && !matchCat && !matchIupac) return false;
    }
    if (availabilityFilter && imp.availability !== availabilityFilter) {
      return false;
    }
    if (docFilter === 'missing-coa' && (imp.hasCoa || imp.documents?.coa?.url)) {
      return false;
    }
    if (docFilter === 'missing-msds' && (imp.hasMsds || imp.documents?.msds?.url)) {
      return false;
    }
    if (
      docFilter === 'has-all' &&
      ((!imp.hasCoa && !imp.documents?.coa?.url) || (!imp.hasMsds && !imp.documents?.msds?.url))
    ) {
      return false;
    }
    return true;
  });

  if (loading && !mainProduct) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span>Loading parent API and its impurities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/main-products"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
            title="Back to Main Products"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{mainProduct?.heading || 'Parent API'}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={`/main-products/${id}/impurities/new`}>
            <Button variant="orange" icon={Plus}>
              Add Impurity
            </Button>
          </Link>
        </div>
      </div>

      {/* Parent API Summary Card */}
      <Card className="p-5 bg-gradient-to-r from-emerald-50/40 via-white to-slate-50/40 border-emerald-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-lg font-bold text-slate-900">{mainProduct?.heading}</div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Category : <strong>{mainProduct?.category?.categoryName}</strong>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Total Impurities: <strong>{impurities.length}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`http://localhost:5173/products/${mainProduct?.p_link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <span>View On Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${mainProduct?.heading || 'parent API'} impurities by name, CAS, Cat #...`}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="">All Availability</option>
              <option value="In Stock">In Stock</option>
              <option value="Custom Synthesis">Custom Synthesis</option>
              <option value="Under Synthesis">Under Synthesis</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <select
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="">All Documents</option>
              <option value="missing-coa">Missing COA</option>
              <option value="missing-msds">Missing MSDS</option>
              <option value="has-all">Complete (COA + MSDS)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 mt-3 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-900">{filteredImpurities.length}</strong> of{' '}
            <strong className="text-slate-900">{impurities.length}</strong> impurities for {mainProduct?.heading}
          </div>
          {(search || availabilityFilter || docFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setAvailabilityFilter('');
                setDocFilter('');
              }}
              className="text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      </Card>

      {/* Impurities Table */}
      <Card>
        {filteredImpurities.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">No Impurities Found</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {impurities.length === 0
                ? `No impurities are currently linked to ${mainProduct?.heading}. Click 'Add Impurity' to create the first standard.`
                : 'No impurities match your search filters.'}
            </p>
            <Link to={`/main-products/${id}/impurities/new`}>
              <Button variant="orange" icon={Plus} size="sm">
                Add Impurity to {mainProduct?.heading}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-3 font-semibold">Impurity / Compound</th>
                  <th className="py-3 px-3 font-semibold">Specifications</th>
                  <th className="py-3 px-3 font-semibold">Compliance Documents</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredImpurities.map((imp) => (
                  <tr key={imp._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Impurity details */}
                    <td className="py-4 px-3">
                      <div className="font-bold text-slate-900 text-sm">{imp.name}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${imp.availability === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                        >
                          {imp.availability || 'In Stock'}
                        </span>
                        {imp.category && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${imp.category?.slug === 'nitroso-impurities' || imp.category_id === '2'
                              ? 'bg-purple-100 text-purple-800 border-purple-200 shadow-2xs'
                              : imp.category?.slug === 'isotope-labelled-compounds' || imp.category_id === '4'
                                ? 'bg-cyan-100 text-cyan-800 border-cyan-200 shadow-2xs'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                          >
                            {imp.category?.categoryName || imp.category?.category_name || (typeof imp.category === 'string' ? imp.category : 'Category')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Specs */}
                    <td className="py-4 px-3 text-xs text-slate-600">
                      <div className="font-mono">
                        <span className="text-slate-400">CAS:</span>{' '}
                        <strong>{imp.specifications?.casNumber || 'N/A'}</strong>
                      </div>
                      <div className="font-mono mt-0.5">
                        <span className="text-slate-400">Cat #:</span>{' '}
                        <strong>{imp.specifications?.catalogueNumber || 'N/A'}</strong>
                      </div>
                    </td>

                    {/* Documents */}
                    <td className="py-4 px-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <DocumentBadge
                          docType="msds"
                          docData={imp.documents?.msds}
                          onUpload={(f) => handleUploadDoc(imp._id, 'msds', f)}
                          compact
                        />
                        <DocumentBadge
                          docType="draftCoa"
                          docData={imp.documents?.draftCoa}
                          onUpload={(f) => handleUploadDoc(imp._id, 'draft-coa', f)}
                          compact
                        />
                        <DocumentBadge
                          docType="coa"
                          docData={imp.documents?.coa}
                          onUpload={(f) => handleUploadDoc(imp._id, 'coa', f)}
                          compact
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/main-products/${id}/impurities/edit/${imp._id}`}
                          title="Edit Impurity"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteImpurity(imp)}
                          title="Delete Impurity"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteImpurity)}
        onClose={() => setDeleteImpurity(null)}
        title="Confirm Impurity Deletion"
        subtitle="This action cannot be undone and will remove attached compliance certificates."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              Are you sure you want to delete <strong>{deleteImpurity?.name}</strong> from{' '}
              <strong>{mainProduct?.heading}</strong>? All pricing tiers, specifications, and
              certificates will be permanently removed.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteImpurity(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleting}
              onClick={handleDeleteImpurity}
            >
              Delete Impurity
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MainProductImpurities;
