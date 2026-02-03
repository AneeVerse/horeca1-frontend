"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    BanknotesIcon,
    ClockIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { baseURL } from "@services/CommonService";
import { isTokenExpired } from "@services/AdminAuthService";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    recovered: "bg-green-100 text-green-800 border-green-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    manual: "bg-blue-100 text-blue-800 border-blue-200",
};

const statusIcons = {
    pending: ClockIcon,
    recovered: CheckCircleIcon,
    failed: XCircleIcon,
    manual: DocumentTextIcon,
};

export default function PendingPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDoc, setTotalDoc] = useState(0);
    const [recovering, setRecovering] = useState(null);
    const [tokenReady, setTokenReady] = useState(false);
    const router = useRouter();

    // Check for token availability and validity on mount
    useEffect(() => {
        const checkToken = () => {
            const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
            if (token && token.startsWith('eyJ')) {
                if (isTokenExpired(token)) {
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

        if (!checkToken()) {
            let retryCount = 0;
            const maxRetries = 5;
            const retryInterval = setInterval(() => {
                retryCount++;
                if (checkToken() || retryCount >= maxRetries) {
                    clearInterval(retryInterval);
                    if (retryCount >= maxRetries) {
                        router.push("/admin/login");
                    }
                }
            }, 200);
            return () => clearInterval(retryInterval);
        }
    }, [router]);

    // Fetch pending payments
    const fetchPendingPayments = useCallback(async () => {
        if (!tokenReady) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                ...(statusFilter && { status: statusFilter }),
            });

            const response = await fetch(
                `${baseURL}/orders/pending-payments?${queryParams}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch pending payments");
            }

            const data = await response.json();
            setPayments(data.pendingPayments || []);
            setTotalDoc(data.totalDoc || 0);
            setTotalPages(Math.ceil((data.totalDoc || 0) / 10));
        } catch (error) {
            console.error("Error fetching pending payments:", error);
        } finally {
            setLoading(false);
        }
    }, [tokenReady, page, statusFilter]);

    useEffect(() => {
        fetchPendingPayments();
    }, [fetchPendingPayments]);

    // Recover a pending payment
    const handleRecover = async (paymentId) => {
        if (!confirm("Are you sure you want to recover this payment and create an order?")) {
            return;
        }

        setRecovering(paymentId);
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(
                `${baseURL}/orders/pending-payments/${paymentId}/recover`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to recover payment");
            }

            const data = await response.json();
            alert(`Order recovered successfully! Invoice: #${data.order.invoice}`);
            fetchPendingPayments();
        } catch (error) {
            console.error("Error recovering payment:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setRecovering(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount);
    };

    if (!tokenReady) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <BanknotesIcon className="h-7 w-7 text-emerald-600" />
                            Pending Payments Recovery
                        </h1>
                        <p className="text-gray-500 mt-1">
                            View and recover Razorpay payments that failed to create orders
                        </p>
                    </div>
                    <button
                        onClick={fetchPendingPayments}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-800">How Payment Recovery Works</h3>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                            <li>• <strong>Pending:</strong> Payment was captured but order creation is in progress</li>
                            <li>• <strong>Failed:</strong> Payment captured but order failed to create - needs recovery</li>
                            <li>• <strong>Successful:</strong> Order was successfully created from this payment</li>
                            <li>• <strong>Manual:</strong> Marked as manually handled</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4 items-center">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Status
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="recovered">Successful</option>
                        <option value="manual">Manual</option>
                    </select>
                </div>
                <div className="ml-auto text-sm text-gray-600">
                    Total: <span className="font-semibold">{totalDoc}</span> payments
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading pending payments...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto" />
                        <p className="mt-4 text-gray-600 font-medium">No pending payments found</p>
                        <p className="text-gray-400 text-sm">All payments have been processed successfully</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Payment ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.map((payment) => {
                                const StatusIcon = statusIcons[payment.status] || ClockIcon;
                                return (
                                    <tr
                                        key={payment._id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-mono text-sm font-medium text-gray-800">
                                                    {payment.razorpayPaymentId}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Order: {payment.razorpayOrderId}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-800">
                                                {formatCurrency(payment.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {payment.orderInfo?.user_info?.name || "N/A"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {payment.orderInfo?.user_info?.contact || payment.orderInfo?.user_info?.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {dayjs(payment.createdAt).format("DD MMM YYYY")}
                                            <br />
                                            <span className="text-xs text-gray-400">
                                                {dayjs(payment.createdAt).format("hh:mm A")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[payment.status]
                                                    }`}
                                            >
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {payment.status === 'recovered' ? 'Successful' : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                            </span>
                                            {payment.recoveredOrderId && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    Invoice: #{payment.recoveredOrderId.invoice}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedPayment(payment)}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    View Details
                                                </button>
                                                {(payment.status === "pending" || payment.status === "failed") && (
                                                    <button
                                                        onClick={() => handleRecover(payment._id)}
                                                        disabled={recovering === payment._id}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {recovering === payment._id ? (
                                                            <>
                                                                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                                                                Recovering...
                                                            </>
                                                        ) : (
                                                            "Recover Order"
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
                                <button
                                    onClick={() => setSelectedPayment(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Payment Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                                    Razorpay Details
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment ID:</span>
                                        <span className="font-mono text-sm">{selectedPayment.razorpayPaymentId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="font-mono text-sm">{selectedPayment.razorpayOrderId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount:</span>
                                        <span className="font-semibold">{formatCurrency(selectedPayment.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[selectedPayment.status]}`}>
                                            {selectedPayment.status === 'recovered' ? 'Successful' : selectedPayment.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            {selectedPayment.orderInfo?.user_info && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                                        Customer Info
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Name:</span>
                                            <span>{selectedPayment.orderInfo.user_info.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Contact:</span>
                                            <span>{selectedPayment.orderInfo.user_info.contact}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span>{selectedPayment.orderInfo.user_info.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Address:</span>
                                            <span className="text-right max-w-xs">
                                                {selectedPayment.orderInfo.user_info.address}, {selectedPayment.orderInfo.user_info.city}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cart Items */}
                            {selectedPayment.orderInfo?.cart && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                                        Cart Items ({selectedPayment.orderInfo.cart.length})
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                                        {selectedPayment.orderInfo.cart.map((item, index) => (
                                            <div key={index} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
                                                <span className="text-sm">
                                                    {item.title} x {item.quantity}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error Info */}
                            {selectedPayment.error && (
                                <div>
                                    <h3 className="text-sm font-semibold text-red-500 uppercase mb-3">
                                        Error Details
                                    </h3>
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                        <p className="text-sm text-red-700">{selectedPayment.error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedPayment.notes && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                                        Notes
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">{selectedPayment.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                            {(selectedPayment.status === "pending" || selectedPayment.status === "failed") && (
                                <button
                                    onClick={() => {
                                        handleRecover(selectedPayment._id);
                                        setSelectedPayment(null);
                                    }}
                                    className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Recover Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
