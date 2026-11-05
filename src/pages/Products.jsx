import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  FileCheck2,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  DollarSign,
  Tag,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { productService } from '../api/productService';
import { mainProductService } from '../api/mainProductService';
import { categoryService } from '../api/categoryService';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import DocumentBadge from '../components/common/DocumentBadge';
import { useToast } from '../context/ToastContext';

export const Products = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [mainProducts, setMainProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedMain, setSelectedMain] = useState(searchParams.get('mainProduct') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [docFilter, setDocFilter] = useState(''); // 'missing-coa', 'missing-msds', 'has-all'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete State
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Document Manager Modal State
  const [docModalProduct, setDocModalProduct] = useState(null);

  const fetchDropdownData = async () => {
    try {
      const [catsRes, mainsRes] = await Promise.allSettled([
        categoryService.getCategories(),
        mainProductService.getMainProducts({ limit: 100 }),
      ]);
      if (catsRes.status === 'fulfilled' && catsRes.value?.success) {
        setCategories(catsRes.value.data || []);
      }
      if (mainsRes.status === 'fulfilled' && mainsRes.value?.success) {
        setMainProducts(mainsRes.value.data || []);
      }
    } catch (err) {
      console.error('Error fetching dropdowns:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedMain) params.mainProduct = selectedMain;
      if (selectedCategory) params.category = selectedCategory;
      if (availabilityFilter) params.availability = availabilityFilter;

      const res = await productService.getProducts(params);
      if (res.success && Array.isArray(res.data)) {
        let items = res.data;

        // In-memory document filter if requested
        if (docFilter === 'missing-coa') {
          items = items.filter((p) => !p.hasCoa && !p.documents?.coa?.url);
        } else if (docFilter === 'missing-msds') {
          items = items.filter((p) => !p.hasMsds && !p.documents?.msds?.url);
        } else if (docFilter === 'has-all') {
          items = items.filter(
            (p) =>
              (p.hasCoa || p.documents?.coa?.url) &&
              (p.hasMsds || p.documents?.msds?.url)
          );
        }

        const total = res.pagination?.total ?? (res.pagination?.count ?? items.length);
        const pages = res.pagination?.pages || Math.ceil(total / (limit || 15)) || 1;

        setProducts(items);
        setTotalPages(pages);
        setTotalCount(total);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Synchronize filter states whenever URL searchParams change
  useEffect(() => {
    const catFromUrl = searchParams.get('category') || '';
    const mainFromUrl = searchParams.get('mainProduct') || '';
    if (catFromUrl !== selectedCategory) setSelectedCategory(catFromUrl);
    if (mainFromUrl !== selectedMain) setSelectedMain(mainFromUrl);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [page, limit, selectedMain, selectedCategory, availabilityFilter, docFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      setDeleting(true);
      const res = await productService.deleteProduct(deleteProduct._id);
      if (res.success) {
        toast.success(`Product '${deleteProduct.name}' deleted.`);
        setDeleteProduct(null);
        fetchProducts();
      } else {
        toast.error(res.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Error deleting product.');
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadDoc = async (productId, docType, file) => {
    try {
      const res = await productService.uploadDocument(productId, docType, file);
      if (res.success) {
        toast.success(`${docType.toUpperCase()} document uploaded.`);
        fetchProducts();
        if (docModalProduct && docModalProduct._id === productId) {
          setDocModalProduct(res.data);
        }
      }
    } catch (err) {
      toast.error('Failed to upload document.');
    }
  };

  const handleDeleteDoc = async (productId, docType) => {
    try {
      const res = await productService.deleteDocument(productId, docType);
      if (res.success) {
        toast.success(`${docType.toUpperCase()} document removed.`);
        fetchProducts();
        if (docModalProduct && docModalProduct._id === productId) {
          setDocModalProduct({
            ...docModalProduct,
            documents: { ...docModalProduct.documents, [docType]: null },
          });
        }
      }
    } catch (err) {
      toast.error('Failed to remove document.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            SubProducts / Analytical Impurities
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse and manage reference standards, chemical specifications, pricing tiers, and COA/MSDS documents.
          </p>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by impurity name, CAS number, catalogue #..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="w-full lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCategory(val);
                setPage(1);
                const current = Object.fromEntries(searchParams.entries());
                if (val) current.category = val;
                else delete current.category;
                setSearchParams(current);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug || c._id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full lg:w-44">
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="">All Availability</option>
              <option value="In Stock">In Stock</option>
              <option value="Custom Synthesis">Custom Synthesis</option>
              <option value="Under Synthesis">Under Synthesis</option>
            </select>
          </div>

          <div className="w-full lg:w-44">
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

          <Button type="submit" variant="secondary" icon={Search}>
            Filter
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {totalCount === 0 ? 0 : (page - 1) * limit + 1}
            </span>
            {' - '}
            <span className="font-semibold text-slate-900">
              {Math.min((page - 1) * limit + products.length, totalCount)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{totalCount}</span> items
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value={15}>15 items</option>
                <option value={25}>25 items</option>
                <option value={50}>50 items</option>
                <option value={100}>100 items</option>
              </select>
            </div>
            {(search || selectedMain || selectedCategory || availabilityFilter || docFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedMain('');
                  setSelectedCategory('');
                  setAvailabilityFilter('');
                  setDocFilter('');
                  setSearchParams({});
                  setPage(1);
                }}
                className="text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer font-medium"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        {loading ? (
          <div className="text-center py-20 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading products catalog...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">No Impurities / Standards Found</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try adjusting your search criteria or register a new impurity standard.
            </p>
            <Link to="/main-products">
              <Button variant="secondary" size="sm">
                Browse Main Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm table-fixed">
              <colgroup>
                <col className="w-[40%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50">
                  <th className="w-[40%] py-3 px-3 font-semibold">Impurity / Compound</th>
                  <th className="w-[20%] py-3 px-3 font-semibold">Parent API</th>
                  <th className="w-[20%] py-3 px-3 font-semibold">Specifications</th>
                  <th className="w-[20%] py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Impurity Name & Badges */}
                    <td className="w-[40%] py-4 px-3 align-top">
                      <div className="font-bold text-slate-900 text-sm leading-snug break-words">
                        {prod.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <Badge
                          variant={prod.availability === 'In Stock' ? 'success' : 'warning'}
                          size="xs">
                          {prod.availability || 'In Stock'}
                        </Badge>
                        {prod.category && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              prod.category?.slug === 'nitroso-impurities' || prod.category_id === '2'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : prod.category?.slug === 'isotope-labelled-compounds' || prod.category_id === '4'
                                ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {prod.category?.categoryName || prod.category?.category_name || (typeof prod.category === 'string' ? prod.category : 'Category')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Parent API */}
                    <td className="w-[20%] py-4 px-3 text-xs text-slate-700 align-top">
                      <div className="font-semibold text-slate-900 break-words">
                        {prod.mainProduct?.heading || '—'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        API Family: {prod.mainProduct?.category?.categoryName || 'API'}
                      </div>
                    </td>

                    {/* Technical Specifications */}
                    <td className="w-[20%] py-4 px-3 text-xs font-mono-code text-slate-600 align-top">
                      <div className="truncate" title={prod.specifications?.casNumber || 'N/A'}>
                        CAS: <span className="text-slate-800 font-semibold">{prod.specifications?.casNumber || 'N/A'}</span>
                      </div>
                      <div className="truncate" title={prod.specifications?.catalogueNumber || 'N/A'}>
                        Cat #: <span className="text-slate-700">{prod.specifications?.catalogueNumber || 'N/A'}</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium truncate">
                        Purity: {prod.specifications?.purity || '>98%'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="w-[20%] py-4 px-3 text-right align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDocModalProduct(prod)}
                          title="Manage Documents"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <FileCheck2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={prod.mainProduct?._id ? `/main-products/${prod.mainProduct._id}/impurities/edit/${prod._id}` : `/products/edit/${prod._id}`}
                          title="Edit Impurity"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteProduct(prod)}
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

        {/* Pagination Bar */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium">
              Page <span className="font-bold text-slate-800">{page}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages}</span> ({totalCount} total items)
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={ChevronLeft}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {getPaginationItems().map((item, idx) =>
                  item === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-400 select-none"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        item === page
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1 inline shrink-0" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteProduct)}
        onClose={() => setDeleteProduct(null)}
        title="Confirm Impurity Deletion"
        subtitle="This action cannot be undone and will remove attached documents."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              Are you sure you want to delete <strong>{deleteProduct?.name}</strong>? All pricing tiers, specifications, and compliance certificates linked to this item will be deleted.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteProduct(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleting}
              onClick={handleDelete}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dedicated Document Modal */}
      <Modal
        isOpen={Boolean(docModalProduct)}
        onClose={() => setDocModalProduct(null)}
        title={`Documents for ${docModalProduct?.name || ''}`}
        subtitle="Manage customer download documents (MSDS, Draft COA, Batch COA)"
      >
        {docModalProduct && (
          <div className="space-y-4">
            <DocumentBadge
              docType="msds"
              docData={docModalProduct.documents?.msds}
              onUpload={(f) => handleUploadDoc(docModalProduct._id, 'msds', f)}
              onDelete={() => handleDeleteDoc(docModalProduct._id, 'msds')}
            />
            <DocumentBadge
              docType="draftCoa"
              docData={docModalProduct.documents?.draftCoa}
              onUpload={(f) => handleUploadDoc(docModalProduct._id, 'draftCoa', f)}
              onDelete={() => handleDeleteDoc(docModalProduct._id, 'draftCoa')}
            />
            <DocumentBadge
              docType="coa"
              docData={docModalProduct.documents?.coa}
              onUpload={(f) => handleUploadDoc(docModalProduct._id, 'coa', f)}
              onDelete={() => handleDeleteDoc(docModalProduct._id, 'coa')}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Products;
