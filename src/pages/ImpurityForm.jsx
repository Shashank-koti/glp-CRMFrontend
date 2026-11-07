import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  Loader2,
  Boxes,
  FileCheck2,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { productService } from '../api/productService';
import { mainProductService } from '../api/mainProductService';
import { categoryService } from '../api/categoryService';
import { API_BASE_URL } from '../api/apiClient';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const ImpurityForm = () => {
  const { mainProductId, id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mainProduct, setMainProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  // Form State
  const [form, setForm] = useState({
    name: '',
    category: '',
    productType: 'API Impurity',
    availability: 'In Stock',
    description: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [specifications, setSpecifications] = useState({
    casNumber: '',
    alternateCas: '',
    catalogueNumber: '',
    synonyms: '',
    iupacName: '',
    molecularFormula: '',
    molecularWeight: '',
    purity: '>98%',
    appearance: '',
    storage: 'Store at 2°C to 8°C in dark, dry place',
    shippingConditions: 'Ambient',
  });

  const [pricingTiers, setPricingTiers] = useState([
    { size: '50 mg', price: 250, description: 'Analytical testing scale', isBestValue: false },
    { size: '100 mg', price: 450, description: 'Standard research pack', isBestValue: true },
  ]);

  // Document Files to upload with multipart
  const [docFiles, setDocFiles] = useState({
    msds: null,
    draftCoa: null,
    coa: null,
  });

  // Existing documents on server (when editing)
  const [existingDocs, setExistingDocs] = useState({
    msds: null,
    draftCoa: null,
    coa: null,
  });

  // Load Main Product and, if editing, Impurity details
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Fetch all system categories
        let catList = [];
        try {
          const catsRes = await categoryService.getCategories({ limit: 100, sort: 'createdAt' });
          if (catsRes?.success && Array.isArray(catsRes.data)) {
            catList = catsRes.data;
            setCategories(catList);
          }
        } catch (catErr) {
          console.error('Error fetching categories:', catErr);
        }

        // 2. Fetch parent API details
        let parentId = mainProductId;

        // If editing without mainProductId in URL, fetch impurity first to get parentId
        if (isEditMode) {
          const prodRes = await productService.getProductById(id);
          if (prodRes.success && prodRes.data) {
            const p = prodRes.data;
            parentId = parentId || p.mainProduct?._id || p.mainProduct;

            const existingCatId = p.category?._id || p.category_id || p.category || '';

            setForm({
              name: p.name || '',
              category: existingCatId,
              productType: p.productType || 'API Impurity',
              availability: p.availability || 'In Stock',
              description: p.description || '',
              image: p.image || '',
            });

            if (p.image) {
              setImagePreview(p.image);
            }

            if (p.specifications) {
              let altCasVal = '';
              const rawAlt = p.specifications.alternateCas || p.alternateCas || p.similarProducts;
              if (Array.isArray(rawAlt)) {
                altCasVal = rawAlt.join(', ');
              } else if (typeof rawAlt === 'string') {
                altCasVal = rawAlt;
              }

              setSpecifications({
                casNumber: p.specifications.casNumber || '',
                alternateCas: altCasVal,
                catalogueNumber: p.specifications.catalogueNumber || '',
                synonyms: p.specifications.synonyms || p.synonyms || '',
                iupacName: p.specifications.iupacName || '',
                molecularFormula: p.specifications.molecularFormula || '',
                molecularWeight: p.specifications.molecularWeight || '',
                purity: p.specifications.purity || '>98%',
                appearance: p.specifications.appearance || '',
                storage: p.specifications.storage || 'Store at 2°C to 8°C in dark, dry place',
                shippingConditions: p.specifications.shippingConditions || p.shippingConditions || 'Ambient',
              });
            }

            if (Array.isArray(p.pricingTiers) && p.pricingTiers.length > 0) {
              setPricingTiers(p.pricingTiers);
            }

            if (p.documents) {
              setExistingDocs({
                msds: p.documents.msds || null,
                draftCoa: p.documents.draftCoa || null,
                coa: p.documents.coa || null,
              });
            }
          } else {
            toast.error('Impurity standard not found.');
          }
        }

        // Fetch parent API
        if (parentId) {
          const mainRes = await mainProductService.getMainProductById(parentId);
          if (mainRes.success && mainRes.data) {
            setMainProduct(mainRes.data);
            if (!isEditMode) {
              const defaultCatId = mainRes.data.category?._id || mainRes.data.category || '';
              setForm((prev) => ({
                ...prev,
                category: prev.category || defaultCatId,
              }));
            }
          }
        }
      } catch (err) {
        console.error('Error loading impurity form data:', err);
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mainProductId, id, isEditMode]);

  // Pricing Tier Helpers
  const addPricingTier = () => {
    setPricingTiers([
      ...pricingTiers,
      { size: '', price: '', description: '', isBestValue: false },
    ]);
  };

  const removePricingTier = (index) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  };

  const updatePricingTier = (index, field, value) => {
    const updated = [...pricingTiers];
    updated[index] = { ...updated[index], [field]: value };
    setPricingTiers(updated);
  };

  const getFullUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendRoot = API_BASE_URL.replace(/\/api\/?$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendRoot}${cleanPath}`;
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return getFullUrl(url);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setForm((prev) => ({ ...prev, image: '' }));
  };

  const backUrl = mainProductId
    ? `/main-products/${mainProductId}/impurities`
    : mainProduct?._id
      ? `/main-products/${mainProduct._id}/impurities`
      : '/main-products';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // SECTION 1 VALIDATION: Chemical & Impurity Identification
    if (!form.name.trim()) {
      toast.error('Impurity standard name is required (Section 1).');
      return;
    }

    const effectiveMainId = mainProductId || mainProduct?._id;
    if (!effectiveMainId) {
      toast.error('Parent API is missing.');
      return;
    }

    const selectedCategory = form.category || mainProduct?.category?._id || mainProduct?.category;
    if (!selectedCategory) {
      toast.error('Category destination is required (Section 1).');
      return;
    }

    if (!form.availability?.trim()) {
      toast.error('Commercial availability is required (Section 1).');
      return;
    }

    // SECTION 2 VALIDATION: Technical & Chemical Specifications
    if (!specifications.casNumber?.trim()) {
      toast.error('CAS Number is required in Technical Specifications (Section 2).');
      return;
    }
    if (!specifications.catalogueNumber?.trim()) {
      toast.error('Catalogue Number is required in Technical Specifications (Section 2).');
      return;
    }
    if (!specifications.purity?.trim()) {
      toast.error('Purity is required in Technical Specifications (Section 2).');
      return;
    }
    if (!specifications.molecularFormula?.trim()) {
      toast.error('Molecular Formula is required in Technical Specifications (Section 2).');
      return;
    }
    if (!specifications.molecularWeight?.trim()) {
      toast.error('Molecular Weight is required in Technical Specifications (Section 2).');
      return;
    }
    if (!specifications.appearance?.trim()) {
      toast.error('Physical Appearance is required in Technical Specifications (Section 2).');
      return;
    }
    if (!specifications.storage?.trim()) {
      toast.error('Storage Conditions are required in Technical Specifications (Section 2).');
      return;
    }
    if (!specifications.shippingConditions?.trim()) {
      toast.error('Shipping Conditions are required in Technical Specifications (Section 2).');
      return;
    }
    if (!specifications.iupacName?.trim()) {
      toast.error('IUPAC Chemical Name is required in Technical Specifications (Section 2).');
      return;
    }

    // SECTION 3 VALIDATION: Commercial Quantities & Pricing Tiers
    const cleanedPricing = pricingTiers
      .filter((t) => t.size && String(t.size).trim() && t.price !== '' && t.price !== null && !isNaN(Number(t.price)) && Number(t.price) >= 0)
      .map((t) => ({
        size: t.size.trim(),
        price: Number(t.price),
        description: t.description?.trim() || '',
        isBestValue: Boolean(t.isBestValue),
      }));

    if (cleanedPricing.length === 0) {
      toast.error('At least one commercial pricing tier (Unit Size & Price) is required (Section 3).');
      return;
    }

    try {
      setSubmitting(true);

      let finalImageUrl = form.image;

      // Upload chemical structure image to Cloudinary if a new image file was selected
      if (imageFile) {
        try {
          const imgUploadRes = await productService.uploadImage(imageFile, form.name || 'impurity');
          const uploadedUrl = imgUploadRes?.data?.url || imgUploadRes?.url;
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
          } else {
            toast.error('Failed to get uploaded structure image URL.');
            setSubmitting(false);
            return;
          }
        } catch (imgErr) {
          console.error('Error uploading chemical structure image to Cloudinary:', imgErr);
          toast.error(imgErr.response?.data?.message || 'Failed to upload structure image file.');
          setSubmitting(false);
          return;
        }
      }

      const parsedAltCas = typeof specifications.alternateCas === 'string'
        ? specifications.alternateCas
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
        : Array.isArray(specifications.alternateCas)
          ? specifications.alternateCas
          : [];

      const selectedCategory = form.category || mainProduct?.category?._id || mainProduct?.category;

      const payload = {
        name: form.name.trim(),
        mainProduct: effectiveMainId,
        category: selectedCategory,
        productType: form.productType || 'API Impurity',
        availability: form.availability,
        description: form.description,
        image: finalImageUrl,
        specifications: {
          ...specifications,
          alternateCas: parsedAltCas,
        },
        similarProducts: parsedAltCas,
        pricingTiers: cleanedPricing,
      };

      let targetId = id;

      if (isEditMode) {
        const res = await productService.updateProduct(id, payload);
        if (!res.success) {
          toast.error(res.message || 'Failed to update impurity.');
          return;
        }
        toast.success(`Updated impurity '${form.name}'.`);
      } else {
        const res = await productService.createProduct(payload);
        if (!res.success || !res.data?._id) {
          toast.error(res.message || 'Failed to create impurity.');
          return;
        }
        targetId = res.data._id;
        toast.success(`Created impurity '${form.name}'.`);
      }

      // Handle PDF uploads if selected (stores to Cloudinary)
      const uploadPromises = [];
      if (docFiles.msds) {
        uploadPromises.push(
          productService
            .uploadProductDocument(targetId, 'msds', docFiles.msds)
            .then(() => toast.success('MSDS document stored to Cloudinary.'))
            .catch(() => toast.error('Failed to upload MSDS.'))
        );
      }
      if (docFiles.draftCoa) {
        uploadPromises.push(
          productService
            .uploadProductDocument(targetId, 'draft-coa', docFiles.draftCoa)
            .then(() => toast.success('Draft COA stored to Cloudinary.'))
            .catch(() => toast.error('Failed to upload Draft COA.'))
        );
      }
      if (docFiles.coa) {
        uploadPromises.push(
          productService
            .uploadProductDocument(targetId, 'coa', docFiles.coa)
            .then(() => toast.success('Final COA stored to Cloudinary.'))
            .catch(() => toast.error('Failed to upload Final COA.'))
        );
      }

      if (uploadPromises.length > 0) {
        await Promise.allSettled(uploadPromises);
      }

      navigate(backUrl);
    } catch (err) {
      console.error('Save impurity error:', err);
      toast.error(err.response?.data?.message || err.message || 'Error occurred while saving impurity.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span>Loading impurity configuration...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={backUrl}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
            title="Back to Parent API Impurities"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wider flex items-center gap-2">
              <span>{mainProduct?.heading || 'Parent API'}</span>
              <span>•</span>
              <span>{isEditMode ? 'Edit Impurity Standard' : 'Add New Impurity Standard'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? `Edit: ${form.name}` : `New Impurity for ${mainProduct?.heading || 'Parent API'}`}
            </h2>
          </div>
        </div>
      </div>

      {/* Parent API Context Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-50/40 to-slate-50 border border-emerald-200 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Parent API Molecule
            </div>
            <div className="text-base font-bold text-slate-900">
              {mainProduct?.heading}
            </div>
          </div>
        </div>
        <div className="text-right">
          <Badge variant="primary" size="sm">
            {mainProduct?.category?.categoryName}
          </Badge>
        </div>
      </div>

      {/* SECTION 1: Core Impurity Identification */}
      <Card>
        <CardHeader
          title="1. Chemical & Impurity Identification"
          subtitle="Impurity standard name, commercial availability, and optional chemical structure image"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Impurity / Standard Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Atorvastatin Related Compound A, N-Nitroso Impurity"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-semibold"
            />
          </div>

          {/* Category Destination Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Category Destination *</span>
              <span className="text-[10px] text-emerald-700 font-semibold normal-case">
                Where impurity will appear
              </span>
            </label>
            <select
              required
              value={form.category}
              onChange={(e) => {
                const newCatId = e.target.value;
                const chosenCat = categories.find((c) => c._id === newCatId || c.categoryId === newCatId);
                let newType = form.productType;
                if (chosenCat?.slug === 'nitroso-impurities') {
                  newType = 'Nitrosamine Impurity';
                } else if (chosenCat?.slug === 'isotope-labelled-compounds') {
                  newType = 'Stable Isotope';
                } else if (chosenCat?.slug === 'peptides') {
                  newType = 'Peptide Impurity';
                } else if (chosenCat?.slug === 'metabolites') {
                  newType = 'Active Metabolite';
                }
                setForm({ ...form, category: newCatId, productType: newType });
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="">Select Category...</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryName} {cat.slug === 'nitroso-impurities' ? '🔥 (Nitroso)' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Select which category this impurity belongs to (e.g. <strong>NITROSO IMPURITIES</strong>). It will show on this API and in that Category on the website.
            </p>
          </div>

          {/* Commercial Availability */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Commercial Availability *
            </label>
            <select
              required
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="In Stock">In Stock</option>
              <option value="Custom Synthesis">Custom Synthesis</option>
              <option value="Under Synthesis">Under Synthesis</option>
            </select>
          </div>

          {/* Chemical Structure Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Chemical Structure Image (Optional)</span>
              <span className="text-[10px] text-slate-500 font-normal normal-case">
                Upload only if available
              </span>
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              {/* Preview Box */}
              <div
                className="w-32 h-32 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative group"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={getImageUrl(imagePreview)}
                      alt="Chemical Structure Preview"
                      className="w-full h-full object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-white/95 text-rose-600 hover:bg-rose-50 shadow-xs border border-slate-200 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <ImageIcon className="w-8 h-8 stroke-1 text-slate-300 mb-1" />
                    <span className="text-[10px] font-medium text-slate-400 leading-tight">
                      No Image
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{imagePreview ? 'Change Image File' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/60 text-xs font-semibold text-rose-600 hover:bg-rose-100/80 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {imageFile ? (
                  <div className="text-xs text-emerald-700 font-medium">
                    Ready to upload to Cloudinary: <strong className="font-semibold">{imageFile.name}</strong> ({(imageFile.size / 1024).toFixed(1)} KB)
                  </div>
                ) : imagePreview ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>Current chemical structure attached.</span>
                    {imagePreview.includes('cloudinary.com') && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        Cloudinary Hosted
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <span>No chemical structure attached. (Optional)</span>
                  </div>
                )}

                <p className="text-[11px] text-slate-500">
                  Supports PNG, JPG, WEBP, or SVG (max 25MB). Uploaded structures are automatically stored on Cloudinary.
                </p>
              </div>
            </div>
          </div>

          {/* <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Synthesis method, analytical profile, handling instructions..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div> */}
        </div>
      </Card>

      {/* SECTION 2: Technical & Chemical Specifications */}
      <Card>
        <CardHeader
          title="2. Technical & Chemical Specifications *"
          subtitle="CAS number, catalogue number, molecular formula, weight, purity, appearance, and IUPAC name (Compulsory)"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              CAS Number *
            </label>
            <input
              type="text"
              required
              value={specifications.casNumber}
              onChange={(e) => setSpecifications({ ...specifications, casNumber: e.target.value })}
              placeholder="e.g. 134523-03-8"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-mono-code focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Alternate CAS (Optional)
              </label>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Comma-separated
              </span>
            </div>
            <input
              type="text"
              value={specifications.alternateCas}
              onChange={(e) => setSpecifications({ ...specifications, alternateCas: e.target.value })}
              placeholder="e.g. 143201-11-0, 503612-47-3"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-mono-code focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Catalogue Number *
            </label>
            <input
              type="text"
              required
              value={specifications.catalogueNumber}
              onChange={(e) => setSpecifications({ ...specifications, catalogueNumber: e.target.value })}
              placeholder="e.g. GLP-ATO-001"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-mono-code focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Purity *
            </label>
            <input
              type="text"
              required
              value={specifications.purity}
              onChange={(e) => setSpecifications({ ...specifications, purity: e.target.value })}
              placeholder=">98.0% (HPLC)"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-emerald-700 font-semibold focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Molecular Formula *
            </label>
            <input
              type="text"
              required
              value={specifications.molecularFormula}
              onChange={(e) => setSpecifications({ ...specifications, molecularFormula: e.target.value })}
              placeholder="e.g. C33H35FN2O5"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-mono-code focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Molecular Weight (g/mol) *
            </label>
            <input
              type="text"
              required
              value={specifications.molecularWeight}
              onChange={(e) => setSpecifications({ ...specifications, molecularWeight: e.target.value })}
              placeholder="e.g. 558.64"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-mono-code focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Physical Appearance *
            </label>
            <input
              type="text"
              required
              value={specifications.appearance}
              onChange={(e) => setSpecifications({ ...specifications, appearance: e.target.value })}
              placeholder="White to Off-White Solid"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Storage Conditions *
            </label>
            <input
              type="text"
              required
              value={specifications.storage}
              onChange={(e) => setSpecifications({ ...specifications, storage: e.target.value })}
              placeholder="Store at 2°C to 8°C in dark, dry place"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Shipping Conditions *
            </label>
            <input
              type="text"
              required
              value={specifications.shippingConditions}
              onChange={(e) => setSpecifications({ ...specifications, shippingConditions: e.target.value })}
              placeholder="e.g. Ambient, with blue ice pack"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Synonyms / Alternative Names (Optional)
            </label>
            <input
              type="text"
              value={specifications.synonyms}
              onChange={(e) => setSpecifications({ ...specifications, synonyms: e.target.value })}
              placeholder="e.g. Atorvastatin related compound C, Atorvastatin lactone..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              IUPAC Chemical Name *
            </label>
            <input
              type="text"
              required
              value={specifications.iupacName}
              onChange={(e) => setSpecifications({ ...specifications, iupacName: e.target.value })}
              placeholder="Full systematic IUPAC chemical nomenclature..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-mono-code text-xs focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </Card>

      {/* SECTION 3: Pricing Tiers */}
      <Card>
        <CardHeader
          title="3. Commercial Quantities & Pricing Tiers *"
          subtitle="Configure unit sizes (mg, g) and commercial pricing for client quotes (At least 1 tier required)"
          action={
            <Button size="sm" variant="secondary" icon={Plus} onClick={addPricingTier}>
              Add Tier
            </Button>
          }
        />

        <div className="space-y-3">
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                  Unit Size *
                </label>
                <input
                  type="text"
                  required
                  value={tier.size}
                  onChange={(e) => updatePricingTier(idx, 'size', e.target.value)}
                  placeholder="e.g. 100 mg"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                  Price ($ USD) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={tier.price}
                  onChange={(e) => updatePricingTier(idx, 'price', e.target.value)}
                  placeholder="450"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-emerald-700 font-bold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                  Usage Note
                </label>
                <input
                  type="text"
                  value={tier.description}
                  onChange={(e) => updatePricingTier(idx, 'description', e.target.value)}
                  placeholder="e.g. Method validation standard"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 sm:pt-0 shrink-0">
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tier.isBestValue}
                    onChange={(e) => updatePricingTier(idx, 'isBestValue', e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Best Value</span>
                </label>

                <button
                  type="button"
                  onClick={() => removePricingTier(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove Tier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {pricingTiers.length === 0 && (
            <div className="text-center py-6 text-amber-800 text-xs border border-dashed border-amber-300 bg-amber-50/50 rounded-xl flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="font-semibold">At least one commercial pricing tier is compulsory.</span>
              <button
                type="button"
                onClick={addPricingTier}
                className="text-xs text-emerald-700 font-bold underline hover:text-emerald-800 cursor-pointer"
              >
                Click here to add a pricing tier
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* SECTION 4: Compliance & Quality Documents (MSDS, Draft COA, COA) */}
      <Card>
        <CardHeader
          title="4. Compliance & Analytical Documents"
          subtitle="Attach official PDF certificates enabling direct downloads on the storefront"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* MSDS Upload */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  MSDS (Safety Sheet)
                </span>
                {existingDocs.msds?.url ? (
                  <Badge variant="success" size="xs">Attached</Badge>
                ) : (
                  <Badge variant="orange" size="xs">Missing</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Material Safety Data Sheet for handling and safety precautions.
              </p>

              {existingDocs.msds?.url && (
                <div className="mb-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate text-slate-700 text-[11px]">
                      {existingDocs.msds.fileName || 'Attached MSDS'}
                    </span>
                    {existingDocs.msds.url.includes('cloudinary.com') && (
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                        Cloudinary
                      </span>
                    )}
                  </div>
                  <a
                    href={getFullUrl(existingDocs.msds.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold hover:underline shrink-0 ml-2"
                  >
                    View
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block w-full cursor-pointer">
                <span className="sr-only">Upload MSDS PDF</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setDocFiles({ ...docFiles, msds: e.target.files?.[0] || null })}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </label>
              {docFiles.msds && (
                <div className="text-[11px] text-emerald-700 font-medium mt-1 truncate">
                  Ready to upload: {docFiles.msds.name}
                </div>
              )}
            </div>
          </div>

          {/* Draft COA Upload */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Draft COA
                </span>
                {existingDocs.draftCoa?.url ? (
                  <Badge variant="success" size="xs">Attached</Badge>
                ) : (
                  <Badge variant="default" size="xs">Optional</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Provisional analytical certificate before batch release.
              </p>

              {existingDocs.draftCoa?.url && (
                <div className="mb-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate text-slate-700 text-[11px]">
                      {existingDocs.draftCoa.fileName || 'Attached Draft COA'}
                    </span>
                    {existingDocs.draftCoa.url.includes('cloudinary.com') && (
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                        Cloudinary
                      </span>
                    )}
                  </div>
                  <a
                    href={getFullUrl(existingDocs.draftCoa.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold hover:underline shrink-0 ml-2"
                  >
                    View
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block w-full cursor-pointer">
                <span className="sr-only">Upload Draft COA PDF</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setDocFiles({ ...docFiles, draftCoa: e.target.files?.[0] || null })}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </label>
              {docFiles.draftCoa && (
                <div className="text-[11px] text-orange-700 font-medium mt-1 truncate">
                  Ready to upload: {docFiles.draftCoa.name}
                </div>
              )}
            </div>
          </div>

          {/* Batch COA Upload */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Batch COA (Released)
                </span>
                {existingDocs.coa?.url ? (
                  <Badge variant="success" size="xs">Attached</Badge>
                ) : (
                  <Badge variant="orange" size="xs">Missing</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Final Certificate of Analysis with NMR, HPLC, and mass spec release tests.
              </p>

              {existingDocs.coa?.url && (
                <div className="mb-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate text-slate-700 text-[11px]">
                      {existingDocs.coa.fileName || 'Attached Batch COA'}
                    </span>
                    {existingDocs.coa.url.includes('cloudinary.com') && (
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                        Cloudinary
                      </span>
                    )}
                  </div>
                  <a
                    href={getFullUrl(existingDocs.coa.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold hover:underline shrink-0 ml-2"
                  >
                    View
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block w-full cursor-pointer">
                <span className="sr-only">Upload Batch COA PDF</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setDocFiles({ ...docFiles, coa: e.target.files?.[0] || null })}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </label>
              {docFiles.coa && (
                <div className="text-[11px] text-emerald-700 font-medium mt-1 truncate">
                  Ready to upload: {docFiles.coa.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between p-4 rounded-2xl bg-white/95 border border-slate-200/90 backdrop-blur-md shadow-xl">
        <div className="text-xs text-slate-600">
          Ready to save <strong>{form.name || 'new impurity'}</strong> under{' '}
          <strong>{mainProduct?.heading || 'Parent API'}</strong>
        </div>

        <div className="flex items-center gap-3">
          <Link to={backUrl}>
            <Button variant="secondary" size="md">
              Cancel
            </Button>
          </Link>
          <Button variant="orange" type="submit" loading={submitting} icon={Save} size="md">
            {isEditMode ? 'Update Impurity' : 'Save & Publish Impurity'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ImpurityForm;
