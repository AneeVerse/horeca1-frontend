"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAllProducts,
  deleteProduct,
  updateProductStatus,
} from "@services/AdminProductService";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { getGlobalSetting } from "@services/SettingServices";
import Cookies from "js-cookie";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("₹");

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
        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </Link>
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
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
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
    </div>
  );
}
