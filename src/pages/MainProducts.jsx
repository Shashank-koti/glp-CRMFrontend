import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Package,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { mainProductService } from '../api/mainProductService';
import { categoryService } from '../api/categoryService';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const MainProducts = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mainProducts, setMainProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    heading: '',
    category: '',
    status: true,
  });

  // Delete Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories({ limit: 100, sort: 'createdAt' });
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchMainProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sort: 'heading',
      };
      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await mainProductService.getMainProducts(params);
      if (res.success && Array.isArray(res.data)) {
        setMainProducts(res.data);
        const total = res.pagination?.total ?? res.data.length;
        setTotalCount(total);
        setTotalPages(res.pagination?.pages || Math.ceil(total / limit) || 1);
      }
    } catch (err) {
      console.error('Error fetching main products:', err);
      toast.error('Failed to load main products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMainProducts();
  }, [page, limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMainProducts();
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

  const openCreateModal = () => {
    setEditingProduct(null);
    const apiCat = categories.find(
      (c) => c.slug === 'api-impurities-and-reference-standards' || c.categoryName?.toLowerCase().includes('api impurities')
    ) || categories[0];
    setForm({
      heading: '',
      category: apiCat?._id || '',
      status: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setForm({
      heading: prod.heading || '',
      category: prod.category?._id || prod.category || '',
      status: prod.status !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!form.heading.trim()) {
      toast.error('Product heading is required.');
      return;
    }
    if (!form.category) {
      toast.error('Category is required.');
      return;
    }

    try {
      setSubmitting(true);
      let res;
      if (editingProduct) {
        res = await mainProductService.updateMainProduct(editingProduct._id, form);
      } else {
        res = await mainProductService.createMainProduct(form);
      }

      if (res.success) {
        toast.success(
          editingProduct
            ? `Updated '${res.data?.heading || form.heading}'`
            : `Created '${res.data?.heading || form.heading}'`
        );
        setIsModalOpen(false);
        fetchMainProducts();
      } else {
        toast.error(res.message || 'Operation failed.');
      }
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(err.response?.data?.message || 'Error occurred while saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await mainProductService.deleteMainProduct(deleteId);
      if (res.success) {
        toast.success('Main product and associated subproducts removed.');
        setDeleteId(null);
        fetchMainProducts();
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

  return (
    <div className="space-y-6">
      {/* Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Main Products (Parent APIs)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Core active pharmaceutical ingredients that group related analytical impurities & reference standards.
          </p>
        </div>
        <Button variant="orange" icon={Plus} onClick={openCreateModal}>
          New Main API
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search main API drugs by name, slug, or content..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <Button type="submit" variant="secondary" icon={Search}>
            Search
          </Button>

          {search && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </Card>

      {/* Stats & Items Per Page Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium px-1">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {totalCount === 0 ? 0 : (page - 1) * limit + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-900">
            {Math.min((page - 1) * limit + mainProducts.length, totalCount)}
          </span>{' '}
          of <span className="font-semibold text-slate-900">{totalCount}</span> main APIs
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Show:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value={25}>25 items</option>
            <option value={50}>50 items</option>
            <option value={100}>100 items</option>
            <option value={250}>250 items</option>
            <option value={500}>500 items</option>
            <option value={1000}>All items (1000)</option>
          </select>
        </div>
      </div>

      {/* Main Products Table */}
      <Card>
        {loading ? (
          <div className="text-center py-16 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading main products...</span>
          </div>
        ) : mainProducts.length === 0 ? (
          <div className="text-center py-16">
            <Boxes className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">No Main Products Found</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add a parent API molecule (e.g., Apixaban or Semaglutide) to start adding child impurities.
            </p>
            <Button variant="orange" icon={Plus} size="sm" onClick={openCreateModal}>
              Create Parent API
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-3 font-semibold">Main Drug / API</th>
                  <th className="py-3 px-3 font-semibold">Category</th>
                  <th className="py-3 px-3 font-semibold">SubProducts</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mainProducts.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-3">
                      <Link
                        to={`/main-products/${prod._id}/impurities`}
                        className="font-bold text-slate-900 text-base hover:text-emerald-700 transition-colors inline-block group"
                      >
                        <span className="group-hover:underline">{prod.heading}</span>
                      </Link>
                    </td>

                    <td className="py-4 px-3">
                      <Badge variant="primary" size="sm">
                        {prod.category?.categoryName || 'General'}
                      </Badge>
                    </td>

                    <td className="py-4 px-3">
                      <Link
                        to={`/main-products/${prod._id}/impurities`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 transition-colors shadow-2xs"
                      >
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Impurities ({prod.subProducts?.length ?? 0})</span>
                      </Link>
                    </td>

                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(prod)}
                          title="Edit Main Product"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(prod._id)}
                          title="Delete Main Product"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Main Product' : 'Add Main Product (Parent API)'}
        subtitle="Configure parent active pharmaceutical ingredient for catalog grouping"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Product Heading / Molecule Name *
            </label>
            <input
              type="text"
              required
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
              placeholder="e.g. Apixaban or Semaglutide"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Category
            </label>
            <div className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-emerald-800 flex items-center justify-between">
              <span>API Impurities & Reference Standards</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="orange" type="submit" loading={submitting}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Confirm Product Deletion"
        subtitle="This action will delete the parent drug and cascade remove child impurities"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Warning:</strong> Deleting this Main Product will also permanently remove all associated SubProducts.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleting}
              onClick={handleDeleteProduct}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MainProducts;
