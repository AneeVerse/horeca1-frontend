"use client";

import { useEffect, useState } from "react";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "@services/AdminProductService";
import { getAllCategories } from "@services/AdminCategoryService";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CubeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";
import CloudinaryUploader from "@components/admin/CloudinaryUploader";
import { getGlobalSetting } from "@services/SettingServices";

// Helper function to extract language value from multi-language object
const getLanguageValue = (data, fallback = "Untitled") => {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const lang = Cookies.get("_lang") || "en";
    return data[lang] || data.en || Object.values(data)[0] || fallback;
  }
  return fallback;
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState("₹");
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

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllProducts();
      if (result.error) {
        setError(result.error);
        setProducts([]);
        setFilteredProducts([]);
      } else {
        // Backend returns { products, totalDoc, limits, pages }
        // Service returns { products: data, error: null } where data is the backend response
        const backendResponse = result.products;
        const productsList = backendResponse?.products || backendResponse || [];
        setProducts(Array.isArray(productsList) ? productsList : []);
        setFilteredProducts(Array.isArray(productsList) ? productsList : []);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch products");
      setProducts([]);
      setFilteredProducts([]);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { categories: data } = await getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchCurrency = async () => {
    try {
      const { globalSetting } = await getGlobalSetting();
      if (globalSetting?.default_currency) {
        setCurrency(globalSetting.default_currency);
      }
    } catch (err) {
      console.error("Failed to fetch currency:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCurrency();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter((product) => {
        const title = getLanguageValue(product.title, "").toLowerCase();
        return title.includes(searchQuery.toLowerCase());
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
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
    } else {
      setEditingProduct(null);
      setFormData({
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
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setSubmitting(true);
    
    console.log("Form submitted with data:", formData);
    
    try {
      // Validate required fields
      if (!formData.title?.en || formData.title.en.trim() === "") {
        console.log("Validation failed: Product name is required");
        setError("Product name is required");
        setSubmitting(false);
        return;
      }
      if (!formData.category) {
        setError("Category is required");
        setSubmitting(false);
        return;
      }
      if (!formData.image || formData.image.length === 0) {
        setError("At least one product image is required");
        setSubmitting(false);
        return;
      }
      if (!formData.prices?.originalPrice || formData.prices.originalPrice <= 0) {
        setError("Original price is required and must be greater than 0");
        setSubmitting(false);
        return;
      }
      if (!formData.prices?.price || formData.prices.price <= 0) {
        setError("Selling price is required and must be greater than 0");
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

      // Ensure categories array includes the main category and is not empty
      if (submitData.category) {
        if (!submitData.categories || !Array.isArray(submitData.categories)) {
          submitData.categories = [];
        }
        if (!submitData.categories.includes(submitData.category)) {
          submitData.categories = [submitData.category, ...submitData.categories];
        }
      }

      // Ensure isCombination is set (default to false)
      if (submitData.isCombination === undefined || submitData.isCombination === null) {
        submitData.isCombination = false;
      }

      // Ensure image is an array
      if (!Array.isArray(submitData.image)) {
        submitData.image = submitData.image ? [submitData.image] : [];
      }

      console.log("Submitting product data:", submitData);

      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct._id, submitData);
        if (result.error) {
          setError(result.error);
          setSubmitting(false);
          return;
        }
      } else {
        console.log("Calling addProduct API...");
        result = await addProduct(submitData);
        console.log("addProduct result:", result);
        if (result.error) {
          setError(result.error);
          setSubmitting(false);
          return;
        }
      }
      
      console.log("Product saved successfully!");
      setSubmitting(false);
      handleCloseModal();
      // Small delay to ensure backend has processed the request
      setTimeout(async () => {
        await fetchProducts();
      }, 500);
    } catch (err) {
      setError(err.message || "Failed to save product");
      setSubmitting(false);
      console.error("Error saving product:", err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        setError(err.message || "Failed to delete product");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "show" ? "hide" : "show";
      await updateProductStatus(id, newStatus);
      fetchProducts();
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            {searchQuery ? "No products found" : "No products"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try adjusting your search query"
              : "Get started by creating a new product."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Product
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Stock
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0">
                          {product.image && product.image[0] ? (
                            <img
                              src={product.image[0]}
                              alt={getLanguageValue(product.title, "Product")}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={getLanguageValue(product.title, "Product")}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <CubeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {getLanguageValue(product.title, "Untitled Product")}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {product.category?.title
                        ? getLanguageValue(product.category.title)
                        : product.category?.name
                        ? getLanguageValue(product.category.name)
                        : typeof product.category === "string"
                        ? product.category
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {currency}{product.prices?.price || product.price || "0.00"}
                        </span>
                        {product.prices?.discount > 0 && (
                          <span className="text-xs text-gray-400 line-through">
                            {currency}{product.prices?.originalPrice || product.originalPrice || product.prices?.price || product.price}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          (product.stock || 0) > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <button
                        onClick={() =>
                          handleToggleStatus(product._id, product.status)
                        }
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          product.status === "show"
                            ? "bg-emerald-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            product.status === "show"
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseModal}
            ></div>

            <div 
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold leading-6 text-gray-900">
                        {editingProduct ? "Edit Product" : "Add Product"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {editingProduct
                          ? "Update your product information from here"
                          : "Add your product and necessary information from here"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
                      <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
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
                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Product Information</h4>
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
                          if (typeof urlsOrFn === 'function') {
                            // Handle function callback (for multiple images)
                            setFormData((prev) => ({
                              ...prev,
                              image: urlsOrFn(prev.image || []),
                            }));
                          } else {
                            // Handle direct value
                            setFormData((prev) => ({
                              ...prev,
                              image: Array.isArray(urlsOrFn) ? urlsOrFn : [urlsOrFn].filter(Boolean),
                            }));
                          }
                        }}
                        multiple={true}
                        maxFiles={4}
                      />
                    </div>

                    {/* Pricing & Tax */}
                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Pricing & Tax</h4>
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

                    {/* Bulk Pricing Section */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">Bulk Pricing</h4>
                          <p className="text-xs text-gray-500 mt-1">Set bulk pricing tiers for customers buying in larger quantities</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bulk Rate 1 */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2">1</span>
                            Bulk Rate 1
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Minimum Quantity *
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formData.bulkPricing.bulkRate1.quantity}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    bulkPricing: {
                                      ...formData.bulkPricing,
                                      bulkRate1: {
                                        ...formData.bulkPricing.bulkRate1,
                                        quantity: parseInt(e.target.value) || 0,
                                      },
                                    },
                                  })
                                }
                                placeholder="12"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Price per Unit *
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.bulkPricing.bulkRate1.pricePerUnit}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    bulkPricing: {
                                      ...formData.bulkPricing,
                                      bulkRate1: {
                                        ...formData.bulkPricing.bulkRate1,
                                        pricePerUnit: parseFloat(e.target.value) || 0,
                                      },
                                    },
                                  })
                                }
                                placeholder="370.00"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border bg-white"
                              />
                            </div>
                          </div>
                          {formData.bulkPricing.bulkRate1.quantity > 0 && formData.bulkPricing.bulkRate1.pricePerUnit > 0 && (
                            <p className="text-xs text-blue-700 mt-2">
                              {formData.unit ? `${formData.unit}s` : "units"} will be sold at ₹{formData.bulkPricing.bulkRate1.pricePerUnit} per {formData.unit || "unit"} for orders of {formData.bulkPricing.bulkRate1.quantity}+
                            </p>
                          )}
                        </div>

                        {/* Bulk Rate 2 */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center mr-2">2</span>
                            Bulk Rate 2
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Minimum Quantity *
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formData.bulkPricing.bulkRate2.quantity}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    bulkPricing: {
                                      ...formData.bulkPricing,
                                      bulkRate2: {
                                        ...formData.bulkPricing.bulkRate2,
                                        quantity: parseInt(e.target.value) || 0,
                                      },
                                    },
                                  })
                                }
                                placeholder="48"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-3 py-2 border bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Price per Unit *
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.bulkPricing.bulkRate2.pricePerUnit}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    bulkPricing: {
                                      ...formData.bulkPricing,
                                      bulkRate2: {
                                        ...formData.bulkPricing.bulkRate2,
                                        pricePerUnit: parseFloat(e.target.value) || 0,
                                      },
                                    },
                                  })
                                }
                                placeholder="358.00"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-3 py-2 border bg-white"
                              />
                            </div>
                          </div>
                          {formData.bulkPricing.bulkRate2.quantity > 0 && formData.bulkPricing.bulkRate2.pricePerUnit > 0 && (
                            <p className="text-xs text-purple-700 mt-2">
                              {formData.unit ? `${formData.unit}s` : "units"} will be sold at ₹{formData.bulkPricing.bulkRate2.pricePerUnit} per {formData.unit || "unit"} for orders of {formData.bulkPricing.bulkRate2.quantity}+
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Promo Pricing Section (6pm-9am) */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-base font-semibold text-emerald-900">6pm to 9am Promo Pricing</h4>
                          <p className="text-xs text-gray-500 mt-1">Special promotional rates available from 6pm to 9am</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Time-based</span>
                      </div>
                      <div className="space-y-4">
                        {/* Promo Single Unit */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-emerald-900 mb-3">Promo Single Unit Price</h5>
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
                              placeholder="370.00"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm px-3 py-2 border bg-white"
                            />
                            {formData.promoPricing.singleUnit > 0 && (
                              <p className="text-xs text-emerald-700 mt-2">
                                Single unit promo price: ₹{formData.promoPricing.singleUnit} per {formData.unit || "unit"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Promo Bulk Rates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Promo Bulk Rate 1 */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center">
                              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center mr-2">1</span>
                              Promo Bulk Rate 1
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={formData.promoPricing.bulkRate1.quantity}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      promoPricing: {
                                        ...formData.promoPricing,
                                        bulkRate1: {
                                          ...formData.promoPricing.bulkRate1,
                                          quantity: parseInt(e.target.value) || 0,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="12"
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm px-3 py-2 border bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Price per Unit
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={formData.promoPricing.bulkRate1.pricePerUnit}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      promoPricing: {
                                        ...formData.promoPricing,
                                        bulkRate1: {
                                          ...formData.promoPricing.bulkRate1,
                                          pricePerUnit: parseFloat(e.target.value) || 0,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="365.00"
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm px-3 py-2 border bg-white"
                                />
                              </div>
                            </div>
                            {formData.promoPricing.bulkRate1.quantity > 0 && formData.promoPricing.bulkRate1.pricePerUnit > 0 && (
                              <p className="text-xs text-emerald-700 mt-2">
                                Promo: ₹{formData.promoPricing.bulkRate1.pricePerUnit} per {formData.unit || "unit"} for {formData.promoPricing.bulkRate1.quantity}+ {formData.unit ? `${formData.unit}s` : "units"}
                              </p>
                            )}
                          </div>

                          {/* Promo Bulk Rate 2 */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center">
                              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center mr-2">2</span>
                              Promo Bulk Rate 2
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={formData.promoPricing.bulkRate2.quantity}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      promoPricing: {
                                        ...formData.promoPricing,
                                        bulkRate2: {
                                          ...formData.promoPricing.bulkRate2,
                                          quantity: parseInt(e.target.value) || 0,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="48"
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm px-3 py-2 border bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Price per Unit
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={formData.promoPricing.bulkRate2.pricePerUnit}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      promoPricing: {
                                        ...formData.promoPricing,
                                        bulkRate2: {
                                          ...formData.promoPricing.bulkRate2,
                                          pricePerUnit: parseFloat(e.target.value) || 0,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="355.00"
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm px-3 py-2 border bg-white"
                                />
                              </div>
                            </div>
                            {formData.promoPricing.bulkRate2.quantity > 0 && formData.promoPricing.bulkRate2.pricePerUnit > 0 && (
                              <p className="text-xs text-emerald-700 mt-2">
                                Promo: ₹{formData.promoPricing.bulkRate2.pricePerUnit} per {formData.unit || "unit"} for {formData.promoPricing.bulkRate2.quantity}+ {formData.unit ? `${formData.unit}s` : "units"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock and Status */}
                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Inventory & Status</h4>
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
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                      submitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingProduct ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      editingProduct ? "Update Product" : "Add Product"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
