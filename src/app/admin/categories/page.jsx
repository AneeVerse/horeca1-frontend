"use client";

import { useEffect, useState } from "react";
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
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
} from "@services/AdminCategoryService";
import { getProductCountByCategory, deleteProductsByCategory } from "@services/AdminProductService";
import { updateCategoryOrder } from "@services/ServerActionServices";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  FolderIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";
import CloudinaryUploader from "@components/admin/CloudinaryUploader";

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

// Sortable Row Component
function SortableRow({ category, onEdit, onDelete, onToggleStatus, getLanguageValue }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50"
    >
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            title="Drag to reorder"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          {category.icon && category.icon.startsWith("http") ? (
            <img
              src={category.icon}
              alt={getLanguageValue(category.title || category.name)}
              className="h-10 w-10 rounded object-cover"
            />
          ) : category.image && category.image.startsWith("http") ? (
            <img
              src={category.image}
              alt={getLanguageValue(category.title || category.name)}
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
        {getLanguageValue(category.title || category.name)}
      </td>
      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
        {getLanguageValue(category.description, "—")}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <button
          onClick={() => onToggleStatus(category._id, category.status)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#018549] focus:ring-offset-2 ${category.status === "show"
            ? "bg-[#016d3b]"
            : "bg-gray-200"
            }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${category.status === "show"
              ? "translate-x-5"
              : "translate-x-0"
              }`}
          />
        </button>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(category)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(category._id, category.title || category.name)}
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [deletingCategoryName, setDeletingCategoryName] = useState("");
  const [productCountInCategory, setProductCountInCategory] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: { en: "" },
    description: { en: "" },
    icon: "", // Backend uses 'icon' field for image URL
    status: "show",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { categories: data, error: err } = await getAllCategories();
      if (err) {
        setError(err);
      } else {
        // Backend now returns only parent categories
        setCategories(data || []);
        setFilteredCategories(data || []);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = categories.filter((cat) => {
        const name = getLanguageValue(cat.title || cat.name, "").toLowerCase();
        return name.includes(searchQuery.toLowerCase());
      });
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredCategories.findIndex((cat) => cat._id === active.id);
      const newIndex = filteredCategories.findIndex((cat) => cat._id === over.id);

      const newCategories = arrayMove(filteredCategories, oldIndex, newIndex);

      // Update order in backend first
      const categoriesWithOrder = newCategories.map((cat, index) => ({
        _id: cat._id,
        order: index,
      }));

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
        const result = await updateCategoryOrder(categoriesWithOrder, token);

        if (result.error) {
          throw new Error(result.error);
        }

        // Update the order field in local state to match backend
        const updatedCategories = newCategories.map((cat, index) => ({
          ...cat,
          order: index,
        }));

        // Update both states after successful API call
        setCategories(updatedCategories);
        setFilteredCategories(updatedCategories);
      } catch (err) {
        setError(err.message || "Failed to update category order");
        // Revert on error by refetching
        fetchCategories();
      }
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      // Backend uses 'icon' field for image URL
      const iconValue = category.icon || category.image || "";

      setFormData({
        name: category.name || { en: "" },
        description: category.description || { en: "" },
        icon: iconValue,
        status: category.status || "show",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: { en: "" },
        description: { en: "" },
        icon: "",
        status: "show",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: { en: "" },
      description: { en: "" },
      icon: "",
      status: "show",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure parentId is not set (all categories are main/parent categories)
      const submitData = {
        ...formData,
        parentId: null, // Explicitly set to null to ensure it's a parent category
      };

      if (editingCategory) {
        await updateCategory(editingCategory._id, submitData);
      } else {
        await addCategory(submitData);
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      setError(err.message || "Failed to save category");
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = async (id, name) => {
    try {
      setDeletingCategoryId(id);
      setDeletingCategoryName(getLanguageValue(name));

      // Check product count
      const { count } = await getProductCountByCategory(id);
      setProductCountInCategory(count);
      setDeleteModalOpen(true);
    } catch (err) {
      setError(err.message || "Failed to check category products");
    }
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!deletingCategoryId) return;

    setIsDeleting(true);
    try {
      // Delete products first if any
      if (productCountInCategory > 0) {
        await deleteProductsByCategory(deletingCategoryId);
      }
      // Then delete category
      await deleteCategory(deletingCategoryId);
      fetchCategories();
      setDeleteModalOpen(false);
      setDeletingCategoryId(null);
      setDeletingCategoryName("");
      setProductCountInCategory(0);
    } catch (err) {
      setError(err.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setDeletingCategoryId(null);
    setDeletingCategoryName("");
    setProductCountInCategory(0);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "show" ? "hide" : "show";
      await updateCategoryStatus(id, newStatus);
      fetchCategories();
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-md bg-[#016d3b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#018549]"
          >
            <PlusIcon className="h-5 w-5" />
            Add Category
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Category name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#018549] focus:border-[#018549]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-md bg-[#016d3b] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#018549]">
              <FunnelIcon className="h-5 w-5" />
              Filter
            </button>
            <button
              onClick={() => setSearchQuery("")}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Categories Table */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            {searchQuery ? "No categories found" : "No categories"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try adjusting your search query"
              : "Get started by creating a new category."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    ICON
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    NAME
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    DESCRIPTION
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    PUBLISHED
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredCategories.map((cat) => cat._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredCategories.map((category) => (
                      <SortableRow
                        key={category._id}
                        category={category}
                        onEdit={handleOpenModal}
                        onDelete={handleDeleteClick}
                        onToggleStatus={handleToggleStatus}
                        getLanguageValue={getLanguageValue}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseModal}
            ></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold leading-6 text-gray-900">
                        {editingCategory ? "Edit Category" : "Add Category"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {editingCategory
                          ? "Update your Product category and necessary information from here"
                          : "Add your Product category and necessary information from here"}
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

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name.en}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: { ...formData.name, en: e.target.value },
                          })
                        }
                        placeholder="Category title"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#018549] focus:ring-[#018549] sm:text-sm px-3 py-2 border"
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
                        placeholder="Category Description"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#018549] focus:ring-[#018549] sm:text-sm px-3 py-2 border"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Image *
                      </label>
                      <CloudinaryUploader
                        imageUrl={formData.icon}
                        setImageUrl={(url) =>
                          setFormData({ ...formData, icon: url })
                        }
                        multiple={false}
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Upload a category image. This will be displayed in the store.
                      </p>
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
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#018549] focus:ring-[#018549] sm:text-sm px-3 py-2 border"
                      >
                        <option value="show">Yes</option>
                        <option value="hide">No</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-[#016d3b] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#018549] sm:ml-3 sm:w-auto"
                  >
                    {editingCategory ? "Update Category" : "Add Category"}
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
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Delete Category
                    </h3>
                    <div className="mt-2">
                      {productCountInCategory > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <svg className="h-5 w-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-amber-800">
                              This category contains {productCountInCategory} product{productCountInCategory > 1 ? 's' : ''}!
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Deleting <strong>"{deletingCategoryName}"</strong> will permanently remove the category and <strong>all {productCountInCategory} product{productCountInCategory > 1 ? 's' : ''}</strong> in it.
                          </p>
                          <p className="text-sm text-red-600 font-medium">
                            This action cannot be undone.
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Are you sure you want to delete <strong>"{deletingCategoryName}"</strong>? This action cannot be undone.
                        </p>
                      )}
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
                  ) : productCountInCategory > 0 ? (
                    `Delete Category & ${productCountInCategory} Product${productCountInCategory > 1 ? 's' : ''}`
                  ) : (
                    'Delete Category'
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

