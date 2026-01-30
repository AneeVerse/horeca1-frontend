"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  TicketIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { getAllCategories } from "@services/AdminCategoryService";
import { getAllProducts } from "@services/AdminProductService";
import { getAllCustomers } from "@services/CustomerServices";
import { isTokenExpired } from "@services/AdminAuthService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    orders: 0,
    customers: 0,
    loading: true,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

        // Check if token is expired
        if (!token || isTokenExpired(token)) {
          console.warn("[Admin Dashboard] Token expired, redirecting to login...");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminInfo");
          router.push("/admin/login");
          return;
        }

        const { baseURL } = await import("@services/CommonService");

        const [categoriesRes, productsRes, ordersRes, customersRes] = await Promise.all([
          getAllCategories(),
          getAllProducts(),
          fetch(`${baseURL}/orders/dashboard-count`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }).then(async (res) => {
            if (res.status === 401) {
              console.warn("[Admin Dashboard] Order count request failed (401), token may be expired");
              throw new Error("Unauthorized");
            }
            return res.ok ? res.json() : { totalOrder: 0 };
          }).catch((err) => {
            if (err.message === "Unauthorized") {
              throw err; // Re-throw to be caught by outer catch
            }
            return { totalOrder: 0 };
          }),
          getAllCustomers(),
        ]);

        // Helper to get count from different customer response structures
        const customerList = customersRes.customers ? (
          Array.isArray(customersRes.customers) ? customersRes.customers :
            customersRes.customers.users ? customersRes.customers.users :
              customersRes.customers.data ? customersRes.customers.data : []
        ) : [];

        setStats({
          categories: categoriesRes.categories?.length || 0,
          products: productsRes.products?.products?.length || productsRes.products?.length || 0,
          orders: ordersRes.totalOrder || 0,
          customers: customerList.length || 0,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);

        // Handle Unauthorized errors - redirect to login
        if (error.message === "Unauthorized") {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminInfo");
          router.push("/admin/login");
          return;
        }

        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [router]);

  const statCards = [
    {
      name: "Categories",
      value: stats.categories,
      icon: FolderIcon,
      href: "/admin/categories",
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      name: "Products",
      value: stats.products,
      icon: CubeIcon,
      href: "/admin/products",
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      name: "Orders",
      value: stats.orders,
      icon: ShoppingCartIcon,
      href: "/admin/orders",
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
    {
      name: "Customers",
      value: stats.customers,
      icon: UsersIcon,
      href: "/admin/customers",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="relative overflow-hidden rounded-lg bg-white px-6 py-5 shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className={`text-2xl font-semibold ${stat.textColor}`}>
                  {stats.loading ? (
                    <span className="inline-block h-8 w-12 animate-pulse bg-gray-200 rounded"></span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
              <div
                className={`h-full ${stat.color} transition-all`}
                style={{ width: "100%" }}
              ></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <FolderIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Manage Categories</p>
              <p className="text-sm text-gray-500">Add or edit categories</p>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-green-500 hover:shadow-sm transition-all"
          >
            <CubeIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Manage Products</p>
              <p className="text-sm text-gray-500">Add or edit products</p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-purple-500 hover:shadow-sm transition-all"
          >
            <ShoppingCartIcon className="h-8 w-8 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-500">Manage customer orders</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

