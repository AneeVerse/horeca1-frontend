"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import { baseURL } from "@services/CommonService";
import { isTokenExpired } from "@services/AdminAuthService";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { useReactToPrint } from "react-to-print";
import Invoice from "@components/invoice/Invoice";
import { useSetting } from "@context/SettingContext";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancel: "bg-red-100 text-red-800",
};

const statusIcons = {
  pending: ClockIcon,
  processing: TruckIcon,
  delivered: CheckCircleIcon,
  cancel: XCircleIcon,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);
  const router = useRouter();

  // Check for token availability and validity on mount
  useEffect(() => {
    const checkToken = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

      // Check if token exists and is valid JWT format
      if (token && token.startsWith('eyJ')) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.warn("[Admin Orders] Token is expired, redirecting to login...");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminInfo");
          router.push("/admin/login");
          return false;
        }
        setTokenReady(true);
        return true;
      }
      return false;
    };

    // Initial check
    if (!checkToken()) {
      // Retry a few times with delay in case token is being set by auth
      let retryCount = 0;
      const maxRetries = 5;
      const retryInterval = setInterval(() => {
        retryCount++;
        if (checkToken() || retryCount >= maxRetries) {
          clearInterval(retryInterval);
          if (retryCount >= maxRetries) {
            console.warn("[Admin Orders] Token not found after retries, redirecting to login...");
            router.push("/admin/login");
          }
        }
      }, 200);

      return () => clearInterval(retryInterval);
    }
  }, [router]);

  // Track if we should refetch on visibility change
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Handle page visibility change to trigger refetch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && tokenReady) {
        console.log("[Admin Orders] Page became visible, will refetch orders...");
        setShouldRefetch(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [tokenReady]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (statusFilter) params.append("status", statusFilter);

      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

      // Verify admin token format
      if (!token) {
        console.warn("[Admin Orders] No admin token found in localStorage. Please log in as admin.");
        setLoading(false);
        return;
      }

      // Verify token is a valid JWT format (should start with eyJ)
      if (!token.startsWith('eyJ')) {
        console.error("[Admin Orders] Invalid token format. Token should be a JWT starting with 'eyJ'");
        console.error("[Admin Orders] Token value:", token);
        setLoading(false);
        return;
      }

      // Use same pattern as products and categories: ${baseURL}/orders/
      // Products use: ${baseURL}/products/
      // Categories use: ${baseURL}/category/all
      // Orders should use: ${baseURL}/orders/
      const url = `${baseURL}/orders/?${params.toString()}`;

      console.log("[Admin Orders] ========== Fetch Start ==========");
      console.log("[Admin Orders] baseURL from CommonService:", baseURL);
      console.log("[Admin Orders] Final URL:", url);
      console.log("[Admin Orders] Token present:", !!token);
      console.log("[Admin Orders] Token format valid:", token.startsWith('eyJ'));
      console.log("[Admin Orders] Token preview:", token ? `${token.substring(0, 20)}...` : "N/A");
      console.log("[Admin Orders] Token length:", token?.length);
      console.log("[Admin Orders] Query params:", params.toString());

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      console.log("[Admin Orders] Response status:", res.status);
      console.log("[Admin Orders] Response ok:", res.ok);
      console.log("[Admin Orders] Response headers:", Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[Admin Orders] Error response text:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || res.statusText };
        }
        console.error("[Admin Orders] API Error:", res.status, errorData);

        // Handle 401 Unauthorized - token expired or invalid
        if (res.status === 401) {
          console.warn("[Admin Orders] Authentication failed (401), redirecting to login...");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminInfo");
          router.push("/admin/login");
          return;
        }

        throw new Error(errorData.message || `Failed to fetch orders: ${res.status}`);
      }

      const data = await res.json();
      console.log("[Admin Orders] Response data:", data);
      console.log("[Admin Orders] Orders array:", data.orders);
      console.log("[Admin Orders] Orders count:", data.orders?.length || 0);
      console.log("[Admin Orders] Total docs:", data.totalDoc);
      console.log("[Admin Orders] ========== Fetch End ==========");

      setOrders(data.orders || []);
      setTotalPages(Math.ceil((data.totalDoc || 0) / 10));
    } catch (error) {
      console.error("[Admin Orders] ========== Error ==========");
      console.error("[Admin Orders] Error fetching orders:", error);
      console.error("[Admin Orders] Error message:", error.message);
      console.error("[Admin Orders] Error stack:", error.stack);
      setOrders([]); // Clear orders on error
    }
    setLoading(false);
  };

  useEffect(() => {
    if (tokenReady) {
      fetchOrders();
      // Reset the refetch flag after fetching
      if (shouldRefetch) {
        setShouldRefetch(false);
      }
    }
  }, [page, statusFilter, tokenReady, shouldRefetch]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

      if (!token) {
        console.error("[Admin Orders] No token available for update");
        setUpdating(false);
        return;
      }

      // Use same pattern as fetchOrders: ${baseURL}/orders/
      const url = `${baseURL}/orders/${orderId}`;

      console.log("[Admin Orders] Updating order:", orderId, "to status:", newStatus);
      console.log("[Admin Orders] Update URL:", url);

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        console.error("[Admin Orders] Update error:", res.status, errorData);
        throw new Error(errorData.message || `Failed to update order: ${res.status}`);
      }

      const updatedOrder = await res.json();
      console.log("[Admin Orders] Order updated successfully:", updatedOrder);

      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("[Admin Orders] Error updating order:", error);
    }
    setUpdating(false);
  };

  const OrderDetailModal = ({ order, onClose }) => {
    const invoiceRef = useRef(null);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const { globalSetting } = useSetting();

    const handlePrint = useReactToPrint({
      contentRef: invoiceRef,
      documentTitle: `Invoice-${order?.invoice}`,
    });

    const handleDownloadPDF = async () => {
      if (!invoiceRef.current) return;

      setDownloadLoading(true);
      try {
        const dataUrl = await toPng(invoiceRef.current, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice-${order?.invoice}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setDownloadLoading(false);
      }
    };

    if (!order) return null;

    const StatusIcon = statusIcons[order.status] || ClockIcon;

    return (
      <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          {/* Hidden Invoice Component for Print/Download */}
          <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
            <div ref={invoiceRef}>
              <Invoice data={order} globalSetting={globalSetting} />
            </div>
          </div>

          {/* Header - Sticky by default as it's outside scroll container */}
          <div className="bg-gradient-to-r from-[#018549] to-[#025155] px-6 py-4 flex-none">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Order #{order.invoice}
                </h2>
                <p className="text-[#e6f5ef] text-sm">
                  {dayjs(order.createdAt).format("MMMM Do, YYYY [at] h:mm A")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadLoading}
                  className="text-white hover:bg-white/20 rounded-lg px-3 py-2 flex items-center gap-1.5 text-sm"
                  title="Download Invoice PDF"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  {downloadLoading ? "..." : "PDF"}
                </button>
                <button
                  onClick={handlePrint}
                  className="text-white hover:bg-white/20 rounded-lg px-3 py-2 flex items-center gap-1.5 text-sm"
                  title="Print Invoice"
                >
                  <PrinterIcon className="h-4 w-4" />
                  Print
                </button>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            <div className="space-y-6">
              {/* Status Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Order Status</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status]
                      }`}
                  >
                    <StatusIcon className="h-5 w-5" />
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>
                  <div className="flex gap-2">
                    {["pending", "processing", "delivered", "cancel"].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order._id, status)}
                        disabled={updating || order.status === status}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${order.status === status
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                          }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> <span className="font-medium">{order.user_info?.name}</span></p>
                    <p><span className="text-gray-500">Email:</span> <span className="font-medium">{order.user_info?.email || "N/A"}</span></p>
                    <p><span className="text-gray-500">Phone:</span> <span className="font-medium">+91 {order.user_info?.contact}</span></p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Delivery Address</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{order.user_info?.address}</p>
                    <p>{order.user_info?.city}, {order.user_info?.country}</p>
                    <p>PIN: {order.user_info?.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
                <div className="border rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        // #region agent log
                        fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'admin/orders/page.jsx:268', message: 'Rendering order cart items', data: { orderId: order._id, cartLength: order.cart?.length, cartItems: order.cart?.map(i => ({ id: i.id, title: i.title, sku: i.sku, hsn: i.hsn, unit: i.unit, brand: i.brand })) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
                        // #endregion
                        return order.cart?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <span className="text-sm font-medium text-gray-900">{item.title}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.sku || "N/A"}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.hsn || "N/A"}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.unit || "N/A"}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.brand || "N/A"}</td>
                            <td className="px-4 py-3 text-center text-sm">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-sm">₹{item.price?.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>₹{order.subTotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span>₹{order.shippingCost?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-orange-500">-₹{order.discount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-base">
                    <span>Total</span>
                    <span className="text-[#018549]">₹{order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Payment Method</h3>
                <p className="text-sm font-medium">{order.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track customer orders
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#018549] focus:border-[#018549]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancel">Cancelled</option>
          </select>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-[#016d3b] text-white rounded-lg text-sm font-medium hover:bg-[#018549]"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#018549] mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const StatusIcon = statusIcons[order.status] || ClockIcon;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-[#018549]">
                          #{order.invoice}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.user_info?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.user_info?.contact}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dayjs(order.createdAt).format("DD MMM YYYY")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{order.total?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={updating}
                          className={`text-xs font-medium rounded-lg px-3 py-1.5 border focus:ring-2 focus:ring-[#018549] focus:border-[#018549] ${statusColors[order.status]
                            } border-transparent`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancel">Cancel</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#018549] hover:text-[#016d3b] hover:bg-[#d4f5e5] rounded-lg transition-colors"
                          title="View Order Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

