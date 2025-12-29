"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { updateProduct, getProductById } from "@services/AdminProductService";
import { getAllCategories } from "@services/AdminCategoryService";
import CloudinaryUploader from "@components/admin/CloudinaryUploader";
import { notifySuccess, notifyError } from "@utils/toast";

// Helper function to extract language value from multi-language object
const getLanguageValue = (data, fallback = "Untitled") => {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const lang = typeof window !== "undefined" ? (localStorage.getItem("_lang") || "en") : "en";
    return data[lang] || data.en || Object.values(data)[0] || fallback;
  }
  return fallback;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: { en: "" },
    description: { en: "" },
    slug: "",
    category: "",
    categories: [],
    image: [],
    stock: 0,
    sku: "",
    hsn: "",
    unit: "",
    brand: "",
    taxableRate: 0,
    taxPercent: 0,
    prices: {
      originalPrice: 0,
      price: 0,
      discount: 0,
    },
    bulkPricing: {
      bulkRate1: { quantity: 0, pricePerUnit: 0 },
      bulkRate2: { quantity: 0, pricePerUnit: 0 },
    },
    promoPricing: {
      singleUnit: 0,
      bulkRate1: { quantity: 0, pricePerUnit: 0 },
      bulkRate2: { quantity: 0, pricePerUnit: 0 },
    },
    status: "show",
    isCombination: false,
  });

  // Dynamic bulk tiers state
  const [bulkTiers, setBulkTiers] = useState([
    { id: 1, quantity: 0, pricePerUnit: 0, promoQuantity: 0, promoPricePerUnit: 0 },
  ]);

  // Add new bulk tier
  const addBulkTier = () => {
    const newId = bulkTiers.length + 1;
    setBulkTiers([
      ...bulkTiers,
      { id: newId, quantity: 0, pricePerUnit: 0, promoQuantity: 0, promoPricePerUnit: 0 },
    ]);
  };

  // Remove bulk tier
  const removeBulkTier = (id) => {
    if (bulkTiers.length > 1) {
      setBulkTiers(bulkTiers.filter((tier) => tier.id !== id));
    }
  };

  // Update bulk tier
  const updateBulkTier = (id, field, value) => {
    setBulkTiers(
      bulkTiers.map((tier) =>
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    );
  };

  // Sync bulkTiers to formData before submission
  const syncBulkTiersToFormData = () => {
    const bulkPricing = {};
    const promoPricingBulk = {};

    bulkTiers.forEach((tier, index) => {
      const rateKey = `bulkRate${index + 1}`;
      bulkPricing[rateKey] = {
        quantity: tier.quantity,
        pricePerUnit: tier.pricePerUnit,
      };
      promoPricingBulk[rateKey] = {
        quantity: tier.promoQuantity,
        pricePerUnit: tier.promoPricePerUnit,
      };
    });

    return {
      bulkPricing,
      promoPricing: {
        singleUnit: formData.promoPricing.singleUnit,
        ...promoPricingBulk,
      },
    };
  };

  // Initialize bulk tiers from existing product data
  const initializeBulkTiersFromProduct = (product) => {
    const tiers = [];
    const bulkPricing = product.bulkPricing || {};
    const promoPricing = product.promoPricing || {};

    // Find all bulk rates from the product
    let rateIndex = 1;
    while (bulkPricing[`bulkRate${rateIndex}`] || promoPricing[`bulkRate${rateIndex}`]) {
      const bulk = bulkPricing[`bulkRate${rateIndex}`] || {};
      const promo = promoPricing[`bulkRate${rateIndex}`] || {};

      tiers.push({
        id: rateIndex,
        quantity: bulk.quantity || 0,
        pricePerUnit: bulk.pricePerUnit || 0,
        promoQuantity: promo.quantity || 0,
        promoPricePerUnit: promo.pricePerUnit || 0,
      });

      rateIndex++;
    }

    // If no tiers found, add a default one
    if (tiers.length === 0) {
      tiers.push({ id: 1, quantity: 0, pricePerUnit: 0, promoQuantity: 0, promoPricePerUnit: 0 });
    }

    setBulkTiers(tiers);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { categories: data } = await getAllCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        const { product, error: productError } = await getProductById(productId);
        if (productError) {
          setError(productError);
          notifyError(productError);
          setLoading(false);
          return;
        }

        if (product) {
          setFormData({
            title: product.title || { en: "" },
            description: product.description || { en: "" },
            slug: product.slug || "",
            category: product.category?._id || product.category || "",
            categories: product.categories?.map((c) => c._id || c) || [],
            image: Array.isArray(product.image)
              ? product.image
              : Array.isArray(product.images)
                ? product.images
                : product.image || product.images
                  ? [product.image || product.images].filter(Boolean)
                  : [],
            stock: product.stock || 0,
            sku: product.sku || "",
            hsn: product.hsn || "",
            unit: product.unit || "",
            brand: product.brand || "",
            taxableRate: product.taxableRate || 0,
            taxPercent: product.taxPercent || 0,
            prices: product.prices || {
              originalPrice: product.originalPrice || 0,
              price: product.price || 0,
              discount: product.prices?.discount || 0,
            },
            bulkPricing: product.bulkPricing || {
              bulkRate1: { quantity: 0, pricePerUnit: 0 },
              bulkRate2: { quantity: 0, pricePerUnit: 0 },
            },
            promoPricing: product.promoPricing || {
              singleUnit: 0,
              bulkRate1: { quantity: 0, pricePerUnit: 0 },
              bulkRate2: { quantity: 0, pricePerUnit: 0 },
            },
            status: product.status || "show",
            isCombination: product.isCombination || false,
          });
          // Initialize bulk tiers from product data
          initializeBulkTiersFromProduct(product);
        }
      } catch (err) {
        setError(err.message || "Failed to load product");
        notifyError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title?.en || formData.title.en.trim() === "") {
        setError("Product name is required");
        notifyError("Product name is required");
        setSubmitting(false);
        return;
      }
      if (!formData.category) {
        setError("Category is required");
        notifyError("Category is required");
        setSubmitting(false);
        return;
      }
      if (!formData.image || formData.image.length === 0) {
        setError("At least one product image is required");
        notifyError("At least one product image is required");
        setSubmitting(false);
        return;
      }
      if (!formData.prices?.price || formData.prices.price <= 0) {
        setError("Selling price is required and must be greater than 0");
        notifyError("Selling price is required and must be greater than 0");
        setSubmitting(false);
        return;
      }

      // Prepare data for submission
      const submitData = { ...formData };

      // Generate slug if not provided
      if (!submitData.slug && submitData.title.en) {
        submitData.slug = submitData.title.en
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      // Ensure categories array includes the main category
      if (submitData.category) {
        if (!submitData.categories || !Array.isArray(submitData.categories)) {
          submitData.categories = [];
        }
        if (!submitData.categories.includes(submitData.category)) {
          submitData.categories = [submitData.category, ...submitData.categories];
        }
      }

      // Ensure isCombination is set
      if (submitData.isCombination === undefined || submitData.isCombination === null) {
        submitData.isCombination = false;
      }

      // Ensure image is an array
      if (!Array.isArray(submitData.image)) {
        submitData.image = submitData.image ? [submitData.image] : [];
      }

      // Sync bulk tiers to submitData
      const syncedPricing = syncBulkTiersToFormData();
      submitData.bulkPricing = syncedPricing.bulkPricing;
      submitData.promoPricing = syncedPricing.promoPricing;

      const result = await updateProduct(productId, submitData);

      if (result.error) {
        setError(result.error);
        notifyError(result.error);
        setSubmitting(false);
        return;
      }

      notifySuccess("Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      const errorMessage = err.message || "Failed to save product";
      setError(errorMessage);
      notifyError(errorMessage);
      setSubmitting(false);
      console.error("Error saving product:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update your product information from here
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading product...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-base font-semibold text-gray-900 border-b pb-2">
                  Basic Information
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title.en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: { ...formData.title, en: e.target.value },
                      })
                    }
                    placeholder="Product title"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description.en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: {
                          ...formData.description,
                          en: e.target.value,
                        },
                      })
                    }
                    placeholder="Product description"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="product-slug"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-generated from name if empty
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {getLanguageValue(cat.title || cat.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="border-t pt-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  Product Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      placeholder="Z0008"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HSN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hsn}
                      onChange={(e) =>
                        setFormData({ ...formData, hsn: e.target.value })
                      }
                      placeholder="04061000"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="">Select Unit</option>
                      <option value="kg">kg</option>
                      <option value="ltr">ltr</option>
                      <option value="Pc">Pc</option>
                      <option value="pieces">pieces</option>
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="pack">pack</option>
                      <option value="box">box</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      placeholder="Qualita"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images *
                </label>
                <CloudinaryUploader
                  imageUrl={formData.image || []}
                  setImageUrl={(urlsOrFn) => {
                    if (typeof urlsOrFn === "function") {
                      setFormData((prev) => ({
                        ...prev,
                        image: urlsOrFn(prev.image || []),
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        image: Array.isArray(urlsOrFn)
                          ? urlsOrFn
                          : [urlsOrFn].filter(Boolean),
                      }));
                    }
                  }}
                  multiple={true}
                  maxFiles={4}
                />
              </div>

              {/* Pricing & Tax */}
              <div className="border-t pt-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  Pricing & Tax
                </h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taxable Rate (Amt) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.taxableRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          taxableRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="361.90"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax % *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.taxPercent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          taxPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="5"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gross Rate (Customer Price) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.prices.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prices: {
                            ...formData.prices,
                            price: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="380.00"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prices.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prices: {
                            ...formData.prices,
                            originalPrice: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.prices.discount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prices: {
                            ...formData.prices,
                            discount: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>
                </div>
              </div>

              {/* Combined Bulk & Promo Pricing Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Bulk Pricing Tiers
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure bulk pricing with regular and promotional rates side by side
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addBulkTier}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Bulk Tier
                  </button>
                </div>

                {/* Promo Single Unit Price - Always visible at top */}
                <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Promo Single Unit Price (6pm - 9am)
                    </h5>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      Time-based
                    </span>
                  </div>
                  <div className="max-w-xs">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.promoPricing.singleUnit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          promoPricing: {
                            ...formData.promoPricing,
                            singleUnit: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="Enter promo price"
                      className="w-full rounded-lg border-emerald-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm px-4 py-2.5 border bg-white"
                    />
                    {formData.promoPricing.singleUnit > 0 && (
                      <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Single unit promo: ₹{formData.promoPricing.singleUnit} per {formData.unit || "unit"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dynamic Bulk Tiers Container */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {bulkTiers.map((tier, index) => (
                    <div
                      key={tier.id}
                      className="bg-white border-2 border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                    >
                      {/* Tier Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h5 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                            {index + 1}
                          </span>
                          Bulk Tier {index + 1}
                        </h5>
                        {bulkTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBulkTier(tier.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove this tier"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Tier Content - Side by Side */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                        {/* Left - Regular Bulk Pricing */}
                        <div className="p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <h6 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                              Regular Bulk Pricing
                            </h6>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Min Quantity
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={tier.quantity}
                                onChange={(e) =>
                                  updateBulkTier(tier.id, "quantity", parseInt(e.target.value) || 0)
                                }
                                placeholder="0"
                                className="w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2.5 border bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Price per Unit
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={tier.pricePerUnit}
                                  onChange={(e) =>
                                    updateBulkTier(tier.id, "pricePerUnit", parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="0.00"
                                  className="w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm pl-7 pr-3 py-2.5 border bg-white"
                                />
                              </div>
                            </div>
                          </div>
                          {tier.quantity > 0 && tier.pricePerUnit > 0 && (
                            <p className="text-xs text-blue-700 mt-3 bg-blue-100/50 px-3 py-2 rounded-lg">
                              ₹{tier.pricePerUnit} per {formData.unit || "unit"} for {tier.quantity}+ {formData.unit ? `${formData.unit}s` : "units"}
                            </p>
                          )}
                        </div>

                        {/* Right - Promo Bulk Pricing (6pm-9am) */}
                        <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <h6 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                              6pm - 9am Promo Bulk
                            </h6>
                            <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-semibold rounded-full">
                              PROMO
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Min Quantity
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={tier.promoQuantity}
                                onChange={(e) =>
                                  updateBulkTier(tier.id, "promoQuantity", parseInt(e.target.value) || 0)
                                }
                                placeholder="0"
                                className="w-full rounded-lg border-emerald-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm px-3 py-2.5 border bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                Price per Unit
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={tier.promoPricePerUnit}
                                  onChange={(e) =>
                                    updateBulkTier(tier.id, "promoPricePerUnit", parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="0.00"
                                  className="w-full rounded-lg border-emerald-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm pl-7 pr-3 py-2.5 border bg-white"
                                />
                              </div>
                            </div>
                          </div>
                          {tier.promoQuantity > 0 && tier.promoPricePerUnit > 0 && (
                            <p className="text-xs text-emerald-700 mt-3 bg-emerald-100/50 px-3 py-2 rounded-lg">
                              ₹{tier.promoPricePerUnit} per {formData.unit || "unit"} for {tier.promoQuantity}+ {formData.unit ? `${formData.unit}s` : "units"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add More Button at Bottom (shown when tiers exist) */}
                {bulkTiers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <button
                      type="button"
                      onClick={addBulkTier}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Another Bulk Tier
                    </button>
                  </div>
                )}

                {/* Tier Count Info */}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {bulkTiers.length} tier{bulkTiers.length !== 1 ? 's' : ''} configured
                  </span>
                  {bulkTiers.length > 3 && (
                    <span className="text-amber-600 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Scroll to see all tiers
                    </span>
                  )}
                </div>
              </div>

              {/* Stock and Status */}
              <div className="border-t pt-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  Inventory & Status
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Published
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value="show">Yes</option>
                      <option value="hide">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex items-center justify-end gap-4 border-t pt-6">
              <Link
                href="/admin/products"
                className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm ${submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
              >
                {submitting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

