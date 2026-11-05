import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  FolderTree,
  Package,
  FileCheck2,
  FileText,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Inbox,
  CheckCircle,
  ExternalLink,
  Users,
} from 'lucide-react';
import { categoryService } from '../api/categoryService.js';
import { mainProductService } from '../api/mainProductService.js';
import { productService } from '../api/productService.js';
import { inquiryService } from '../api/inquiryService.js';
import { clientService } from '../api/clientService.js';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import DocumentBadge from '../components/common/DocumentBadge.jsx';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    categories: 0,
    mainProducts: 0,
    subProducts: 0,
    withMsds: 0,
    withDraftCoa: 0,
    withCoa: 0,
    inquiries: 0,
    clients: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [catsRes, mainRes, prodsRes, inqRes, clientsRes] = await Promise.allSettled([
          categoryService.getCategories(),
          mainProductService.getMainProducts({ limit: 100 }),
          productService.getProducts({ limit: 100 }),
          inquiryService.getInquiries({ limit: 5 }),
          clientService.getClientStats(),
        ]);

        const categoriesCount = catsRes.status === 'fulfilled' && catsRes.value?.success
          ? catsRes.value.data?.length || 0
          : 0;

        const mainProductsCount = mainRes.status === 'fulfilled' && mainRes.value?.success
          ? mainRes.value.pagination?.total || mainRes.value.data?.length || 0
          : 0;

        const products = prodsRes.status === 'fulfilled' && prodsRes.value?.success
          ? prodsRes.value.data || []
          : [];

        const totalProducts = prodsRes.status === 'fulfilled' && prodsRes.value?.pagination?.total
          ? prodsRes.value.pagination.total
          : products.length;

        // Calculate document metrics
        let withMsds = 0;
        let withDraftCoa = 0;
        let withCoa = 0;

        products.forEach((p) => {
          if (p.hasMsds || p.documents?.msds?.url) withMsds++;
          if (p.hasDraftCoa || p.documents?.draftCoa?.url) withDraftCoa++;
          if (p.hasCoa || p.documents?.coa?.url) withCoa++;
        });

        const inquiries = inqRes.status === 'fulfilled' && inqRes.value?.success
          ? inqRes.value.data || []
          : [];

        const inquiriesCount = inqRes.status === 'fulfilled' && inqRes.value?.pagination?.total
          ? inqRes.value.pagination.total
          : inquiries.length;

        const clientsCount = clientsRes.status === 'fulfilled' && clientsRes.value?.success
          ? clientsRes.value.data?.totalClients || 0
          : 0;

        setStats({
          categories: categoriesCount,
          mainProducts: mainProductsCount,
          subProducts: totalProducts,
          withMsds,
          withDraftCoa,
          withCoa,
          inquiries: inquiriesCount,
          clients: clientsCount,
        });

        setRecentProducts(products.slice(0, 6));
        setRecentInquiries(inquiries.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalPossibleDocs = (stats.subProducts || 1) * 3;
  const totalUploadedDocs = stats.withMsds + stats.withDraftCoa + stats.withCoa;
  const docCoveragePercent = Math.min(
    100,
    Math.round((totalUploadedDocs / totalPossibleDocs) * 100) || 0
  );

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 ">
        <div>
          <h2 className="text-xl font-bold text-emerald-700 tracking-tight mt-1.5">
            GLP Pharma Catalog Control Dashboard
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link to="/products/new">
            <Button variant="orange" size="sm" icon={Plus}>
              New Impurity
            </Button>
          </Link>
          <Link to="/main-products">
            <Button size="sm" variant="secondary">
              Main APIs
            </Button>
          </Link>
          <Link to="/documents">
            <Button size="sm" variant="outline" icon={FileCheck2}>
              Documents Hub
            </Button>
          </Link>
          <Link to="/clients">
            <Button size="sm" variant="outline" icon={Users}>
              Clients Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Categories */}
        <Card className="p-5 relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats.categories}
            </span>
            <span className="text-xs text-purple-700 font-medium">Product Groups</span>
          </div>
          <Link
            to="/categories"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-purple-700 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Main Products */}
        <Card className="p-5 relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Parent APIs
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats.mainProducts}
            </span>
            <span className="text-xs text-teal-700 font-medium">Main Molecules</span>
          </div>
          <Link
            to="/main-products"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-teal-700 transition-colors"
          >
            <span>Manage Main Products</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* SubProducts / Impurities */}
        <Card className="p-5 relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              SubProducts / Impurities
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats.subProducts}
            </span>
            <span className="text-xs text-emerald-700 font-medium">Catalog Items</span>
          </div>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        {/* Registered Clients */}
        <Card className="p-5 relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Clients
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats.clients}
            </span>
            <span className="text-xs text-blue-700 font-medium">Client Accounts</span>
          </div>
          <Link
            to="/clients"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-700 transition-colors"
          >
            <span>Manage Clients</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>
      </div>

      {/* Compliance Documents Health Indicator */}
      <Card>
        <CardHeader
          title="Analytical Compliance & Document Readiness"
          subtitle="MSDS, Draft COA, and Batch COA availability for client downloads"
          action={
            <Link to="/documents">
              <Button size="sm" variant="outline" icon={FileCheck2}>
                Open Documents Hub
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Progress Gauge */}
          <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-center">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Document Coverage
            </div>
            <div className="text-4xl font-extrabold text-emerald-700 mt-2">
              {docCoveragePercent}%
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${docCoveragePercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {totalUploadedDocs} of {totalPossibleDocs} documents uploaded
            </div>
          </div>

          {/* MSDS Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">MSDS Files</span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {stats.withMsds} <span className="text-xs font-normal text-slate-500">/ {stats.subProducts}</span>
            </div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">
              Material Safety Data Sheets
            </div>
          </div>

          {/* Draft COA Breakdown */}
          <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Draft COA Files</span>
              <FileCheck2 className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {stats.withDraftCoa} <span className="text-xs font-normal text-slate-500">/ {stats.subProducts}</span>
            </div>
            <div className="text-xs text-orange-700 mt-1 font-medium">
              Provisional Certificates
            </div>
          </div>

          {/* Batch COA Breakdown */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Final Release COA</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {stats.withCoa} <span className="text-xs font-normal text-slate-500">/ {stats.subProducts}</span>
            </div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">
              Released Batch Certificates
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Section: Recent Impurities & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent SubProducts */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent SubProducts & Impurities"
            subtitle="Recently updated catalog items and their compliance download status"
            action={
              <Link to="/products">
                <Button size="sm" variant="ghost">
                  View All
                </Button>
              </Link>
            }
          />

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading catalog items...</div>
          ) : recentProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No products found. Click "Add Impurity" to create your first standard.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm table-fixed">
                <colgroup>
                  <col className="w-1/4" />
                  <col className="w-1/4" />
                  <col className="w-1/4" />
                  <col className="w-1/4" />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50">
                    <th className="w-1/4 py-2.5 px-3 font-semibold">Impurity / Standard</th>
                    <th className="w-1/4 py-2.5 px-3 font-semibold">Parent API</th>
                    <th className="w-1/4 py-2.5 px-3 font-semibold">CAS / Cat #</th>
                    <th className="w-1/4 py-2.5 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="w-1/4 py-3.5 px-3">
                        <div className="font-semibold text-slate-900 truncate" title={prod.name}>{prod.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-700 font-medium truncate">{prod.productType || 'API Impurity'}</span>
                          <span>•</span>
                          <span className="text-slate-600 shrink-0">{prod.availability || 'In Stock'}</span>
                        </div>
                      </td>
                      <td className="w-1/4 py-3.5 px-3 text-slate-600 text-xs truncate" title={prod.mainProduct?.heading || '—'}>
                        {prod.mainProduct?.heading || '—'}
                      </td>
                      <td className="w-1/4 py-3.5 px-3 text-xs font-mono-code text-slate-600">
                        <div className="truncate">{prod.specifications?.casNumber || 'No CAS'}</div>
                        <div className="text-[11px] text-slate-400 truncate">{prod.specifications?.catalogueNumber || '—'}</div>
                      </td>
                      <td className="w-1/4 py-3.5 px-3 text-right">
                        <Link
                          to={`/products/edit/${prod._id}`}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Right 1 Col: Latest Inquiries */}
        <Card>
          <CardHeader
            title="Quote Requests"
            subtitle="Storefront client leads"
            action={
              <Link to="/inquiries">
                <Button size="sm" variant="ghost">
                  All
                </Button>
              </Link>
            }
          />

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading inquiries...</div>
          ) : recentInquiries.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No inquiries received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inq) => (
                <div
                  key={inq._id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-sm text-slate-900">{inq.customerName}</div>
                    <Badge
                      variant={
                        inq.status === 'New'
                          ? 'warning'
                          : inq.status === 'Contacted'
                            ? 'primary'
                            : 'success'
                      }
                      size="xs"
                    >
                      {inq.status || 'New'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {inq.companyName || inq.email}
                  </div>
                  {inq.productInterested && (
                    <div className="text-xs text-emerald-700 font-medium mt-1 truncate">
                      {inq.productInterested}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 mt-2">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
