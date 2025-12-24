"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { baseURL } from "@services/CommonService";

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
    fetchOrders();
  }, [page, statusFilter]);

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
    if (!order) return null;

    const StatusIcon = statusIcons[order.status] || ClockIcon;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Order #{order.invoice}
                </h2>
                <p className="text-emerald-100 text-sm">
                  {format(new Date(order.createdAt), "PPP 'at' p")}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Order Status</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    statusColors[order.status]
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
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        order.status === status
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
                      fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/orders/page.jsx:268',message:'Rendering order cart items',data:{orderId:order._id,cartLength:order.cart?.length,cartItems:order.cart?.map(i=>({id:i.id,title:i.title,sku:i.sku,hsn:i.hsn,unit:i.unit,brand:i.brand}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
                  <span className="text-emerald-600">₹{order.total?.toFixed(2)}</span>
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
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancel">Cancelled</option>
          </select>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
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
                        <span className="text-sm font-medium text-emerald-600">
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
                        {format(new Date(order.createdAt), "dd MMM yyyy")}
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
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[order.status]
                          }`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            disabled={updating}
                            className="text-xs border rounded-lg px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancel">Cancel</option>
                          </select>
                        </div>
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
