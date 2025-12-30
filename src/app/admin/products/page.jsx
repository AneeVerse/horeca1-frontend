"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getAllProducts,
  deleteProduct,
  updateProductStatus,
  getProductsByCategory,
  updateProductOrder,
} from "@services/AdminProductService";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  ListBulletIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
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

// Sortable Product Row Component
function SortableProductRow({ product, currency, onToggleStatus, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="whitespace-nowrap py-3 pl-4 pr-3 sm:pl-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            title="Drag to reorder"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
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
          <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
            {getLanguageValue(product.title, "Untitled Product")}
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
        <div className="flex flex-col">
          <span className="font-medium">
            {currency}{product.prices?.price || product.price || "0.00"}
          </span>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${(product.stock || 0) > 0
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {product.stock || 0}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
        <button
          onClick={() => onToggleStatus(product._id, product.status)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${product.status === "show" ? "bg-[#016d3b]" : "bg-gray-200"
            }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.status === "show" ? "translate-x-5" : "translate-x-0"
              }`}
          />
        </button>
      </td>
      <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/products/edit/${product._id}`}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={() => onDelete(product._id, product.title)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Category Section Component with drag-and-drop products
function CategorySection({
  categoryData,
  currency,
  onToggleStatus,
  onDelete,
  onDragEnd,
  sensors,
  isExpanded,
  onToggleExpand,
}) {
  const { category, products } = categoryData;
  const [localProducts, setLocalProducts] = useState(products);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localProducts.findIndex((p) => p._id === active.id);
      const newIndex = localProducts.findIndex((p) => p._id === over.id);

      const newProducts = arrayMove(localProducts, oldIndex, newIndex);
      setLocalProducts(newProducts);

      // Call parent to update order
      onDragEnd(category._id, newProducts);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 mb-4 overflow-hidden">
      {/* Category Header */}
      <button
        onClick={onToggleExpand}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
          )}
          {category.icon && (
            <img
              src={category.icon}
              alt={getLanguageValue(category.name)}
              className="h-8 w-8 rounded object-cover"
            />
          )}
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {getLanguageValue(category.name)}
            </h3>
            <p className="text-xs text-gray-500">
              {localProducts.length} product{localProducts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {isExpanded ? "Click to collapse" : "Click to expand"}
        </span>
      </button>

      {/* Products Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          {localProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CubeIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm">No products in this category</p>
              <Link
                href="/admin/products/add"
                className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="h-4 w-4" />
                Add Product
              </Link>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localProducts.map((p) => p._id)}
                strategy={verticalListSortingStrategy}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 sm:pl-4">
                        Product
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                        Price
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                        Stock
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                        Status
                      </th>
                      <th className="py-2 pl-3 pr-4 sm:pr-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {localProducts.map((product) => (
                      <SortableProductRow
                        key={product._id}
                        product={product}
                        currency={currency}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("₹");
  const [viewMode, setViewMode] = useState("universal"); // "universal" or "byCategory"
  const [expandedCategories, setExpandedCategories] = useState({});

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deletingProductName, setDeletingProductName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const fetchProductsByCategory = async () => {
    try {
      const result = await getProductsByCategory();
      if (!result.error) {
        setProductsByCategory(result.data || []);
        // Initialize all categories as expanded
        const expanded = {};
        (result.data || []).forEach((cat) => {
          expanded[cat.category._id] = true;
        });
        setExpandedCategories(expanded);
      }
    } catch (err) {
      console.error("Error fetching products by category:", err);
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
    fetchProductsByCategory();
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

  // Open delete confirmation modal
  const handleDeleteClick = (id, name) => {
    setDeletingProductId(id);
    setDeletingProductName(getLanguageValue(name));
    setDeleteModalOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;

    setIsDeleting(true);
    try {
      await deleteProduct(deletingProductId);
      fetchProducts();
      fetchProductsByCategory();
      setDeleteModalOpen(false);
      setDeletingProductId(null);
      setDeletingProductName("");
    } catch (err) {
      setError(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setDeletingProductId(null);
    setDeletingProductName("");
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "show" ? "hide" : "show";
      await updateProductStatus(id, newStatus);
      fetchProducts();
      fetchProductsByCategory();
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  const handleCategoryDragEnd = async (categoryId, newProducts) => {
    try {
      // Update product order in backend
      const productsWithOrder = newProducts.map((product, index) => ({
        _id: product._id,
        order: index,
      }));

      const result = await updateProductOrder(productsWithOrder);

      if (result.error) {
        throw new Error(result.error);
      }

      // Update local state
      setProductsByCategory((prev) =>
        prev.map((cat) =>
          cat.category._id === categoryId
            ? { ...cat, products: newProducts }
            : cat
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update product order");
      // Refetch to revert changes on error
      fetchProductsByCategory();
    }
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
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

      {/* View Toggle & Search */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("universal")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "universal"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <ListBulletIcon className="h-4 w-4" />
              All Products
            </button>
            <button
              onClick={() => setViewMode("byCategory")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "byCategory"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
              By Category
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
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
        </div>

        {viewMode === "byCategory" && (
          <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
            <Bars3Icon className="h-4 w-4" />
            Drag products to reorder within each category. Order will be reflected on the homepage.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Universal View */}
      {viewMode === "universal" && (
        <>
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
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${(product.stock || 0) > 0
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
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${product.status === "show"
                              ? "bg-[#016d3b]"
                              : "bg-gray-200"
                              }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.status === "show"
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
                              onClick={() => handleDeleteClick(product._id, product.title)}
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
        </>
      )}

      {/* By Category View */}
      {viewMode === "byCategory" && (
        <>
          {productsByCategory.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No categories found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create categories first to organize products.
              </p>
              <Link
                href="/admin/categories"
                className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Go to Categories
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {productsByCategory.map((categoryData) => (
                <CategorySection
                  key={categoryData.category._id}
                  categoryData={categoryData}
                  currency={currency}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDeleteClick}
                  onDragEnd={handleCategoryDragEnd}
                  sensors={sensors}
                  isExpanded={expandedCategories[categoryData.category._id] ?? true}
                  onToggleExpand={() => toggleCategoryExpand(categoryData.category._id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCancelDelete}
            ></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Are you sure you want to delete <strong>"{deletingProductName}"</strong>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Product'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
