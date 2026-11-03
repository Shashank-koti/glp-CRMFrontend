import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderTree, Search, Boxes, Package, ArrowRight, Loader2 } from 'lucide-react';
import { categoryService } from '../api/categoryService';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const Categories = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories({ limit: 100, sort: 'createdAt' });
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    const q = search.toLowerCase();
    return (
      cat.categoryName?.toLowerCase().includes(q) ||
      cat.categoryId?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Product Categories</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse pharmaceutical divisions and reference standard catalogs.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading categories...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card className="text-center py-16">
          <FolderTree className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900">No Categories Found</h4>
          <p className="text-xs text-slate-500 mt-1">
            {search ? 'No categories matched your search term.' : 'No product categories available.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const isApiImpurities =
              cat.slug === 'api-impurities-and-reference-standards' ||
              cat.categoryId === '1' ||
              cat.categoryName?.toUpperCase().includes('API IMPURITIES & REFERENCE STANDARDS') ||
              cat.categoryName?.toUpperCase().includes('API IMPURITIES AND REFERENCE STANDARDS') ||
              cat.categoryName?.toUpperCase().trim() === 'API IMPURITIES';

            return (
              <Card key={cat._id} hover className="flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                      <FolderTree className="w-5 h-5" />
                    </div>
                    <Badge variant={cat.status !== false ? 'success' : 'default'} size="xs">
                      {cat.status !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {cat.categoryName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2.5 line-clamp-2">
                      {cat.description || 'High-quality pharmaceutical standards catalog category.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {isApiImpurities && (
                      <>
                        <Link
                          to={`/main-products?category=${cat.slug || cat.categoryId || cat._id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span>Main APIs</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        <span className="text-slate-200">|</span>
                      </>
                    )}

                    <Link
                      to={`/products?category=${cat.slug || cat.categoryId || cat._id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Impurities</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories;
