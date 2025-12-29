"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { IoClose, IoAdd, IoCheckmarkCircle } from "react-icons/io5";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { lookupPincode } from "@utils/pincode";
import { notifySuccess, notifyError } from "@utils/toast";

const AddressManager = ({
    shippingAddress,
    onAddressSelect,
    register,
    setValue,
    errors
}) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [pincodeError, setPincodeError] = useState("");

    // Form state for new/edit address
    const [addressForm, setAddressForm] = useState({
        name: "",
        contact: "",
        email: "",
        address: "",
        city: "",
        country: "", // State
        zipCode: "",
        isDefault: false,
    });

    // Initialize addresses from shippingAddress prop
    useEffect(() => {
        if (shippingAddress && Object.keys(shippingAddress).length > 0) {
            // Convert single address to array format
            const addressWithId = {
                ...shippingAddress,
                id: shippingAddress._id || 'default',
                isDefault: true,
            };
            setAddresses([addressWithId]);
            setSelectedAddress(addressWithId);

            // Auto-fill form fields with the selected address
            fillFormWithAddress(addressWithId);
        }
    }, [shippingAddress]);

    // Fill the checkout form with selected address
    const fillFormWithAddress = (address) => {
        if (!address) return;

        const nameParts = address.name?.split(" ") || [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setValue("firstName", firstName, { shouldValidate: true });
        setValue("lastName", lastName, { shouldValidate: true });
        setValue("contact", address.contact || "", { shouldValidate: true });
        setValue("email", address.email || "", { shouldValidate: true });
        setValue("address", address.address || "", { shouldValidate: true });
        setValue("city", address.city || "", { shouldValidate: true });
        setValue("country", address.country || "", { shouldValidate: true });
        setValue("zipCode", address.zipCode || "", { shouldValidate: true });

        if (onAddressSelect) {
            onAddressSelect(address);
        }
    };

    // Handle address selection
    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
        fillFormWithAddress(address);
    };

    // Handle PIN code lookup
    const handlePincodeChange = async (e) => {
        const pincode = e.target.value.replace(/\D/g, "");
        setAddressForm(prev => ({ ...prev, zipCode: pincode }));

        if (pincode.length === 6) {
            setPincodeLoading(true);
            setPincodeError("");

            // Check if PIN code is serviceable
            const storedPincodes = localStorage.getItem("deliveryPincodes");
            if (storedPincodes) {
                const allowedPincodes = JSON.parse(storedPincodes);
                const isServiceable = allowedPincodes.some(p => p.pincode === pincode);

                if (!isServiceable) {
                    setPincodeError("Sorry, we don't deliver to this PIN code yet.");
                    setPincodeLoading(false);
                    // Clear city/state if invalid
                    setAddressForm(prev => ({
                        ...prev,
                        city: "",
                        country: "",
                    }));
                    return;
                }
            }

            const result = await lookupPincode(pincode);

            if (result.success) {
                setAddressForm(prev => ({
                    ...prev,
                    city: result.district || result.city,
                    country: result.state,
                }));
                setPincodeError("");
            } else {
                setPincodeError(result.error || "Invalid PIN code");
            }
            setPincodeLoading(false);
        }
    };

    // Open modal for new address
    const openAddModal = () => {
        setIsEditing(false);
        setEditingAddress(null);
        setAddressForm({
            name: "",
            contact: "",
            email: "",
            address: "",
            city: "",
            country: "",
            zipCode: "",
            isDefault: addresses.length === 0, // First address is default
        });
        setIsModalOpen(true);
    };

    // Open modal for editing
    const openEditModal = (address) => {
        setIsEditing(true);
        setEditingAddress(address);
        setAddressForm({
            name: address.name || "",
            contact: address.contact || "",
            email: address.email || "",
            address: address.address || "",
            city: address.city || "",
            country: address.country || "",
            zipCode: address.zipCode || "",
            isDefault: address.isDefault || false,
        });
        setIsModalOpen(true);
    };

    // Save address (add or update)
    const handleSaveAddress = () => {
        // Validate required fields
        if (!addressForm.name || !addressForm.contact || !addressForm.address || !addressForm.zipCode || !addressForm.city) {
            notifyError("Please fill all required fields");
            return;
        }

        if (isEditing && editingAddress) {
            // Update existing address
            const updatedAddresses = addresses.map(addr => {
                if (addr.id === editingAddress.id) {
                    return { ...addr, ...addressForm };
                }
                // If this address is being set as default, remove default from others
                if (addressForm.isDefault && addr.id !== editingAddress.id) {
                    return { ...addr, isDefault: false };
                }
                return addr;
            });
            setAddresses(updatedAddresses);

            // If edited address was selected, update selection
            if (selectedAddress?.id === editingAddress.id) {
                const updatedAddr = { ...editingAddress, ...addressForm };
                setSelectedAddress(updatedAddr);
                fillFormWithAddress(updatedAddr);
            }

            notifySuccess("Address updated successfully");
        } else {
            // Add new address
            const newAddress = {
                ...addressForm,
                id: `addr_${Date.now()}`,
            };

            let updatedAddresses = [...addresses];

            // If new address is default, remove default from others
            if (addressForm.isDefault) {
                updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
            }

            updatedAddresses.push(newAddress);
            setAddresses(updatedAddresses);

            // Auto-select if it's the first or default address
            if (updatedAddresses.length === 1 || addressForm.isDefault) {
                setSelectedAddress(newAddress);
                fillFormWithAddress(newAddress);
            }

            notifySuccess("Address added successfully");
        }

        setIsModalOpen(false);
    };

    // Delete address
    const handleDeleteAddress = (addressId) => {
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        setAddresses(updatedAddresses);

        // If deleted address was selected, select the default or first one
        if (selectedAddress?.id === addressId) {
            const defaultAddr = updatedAddresses.find(a => a.isDefault) || updatedAddresses[0];
            setSelectedAddress(defaultAddr || null);
            if (defaultAddr) {
                fillFormWithAddress(defaultAddr);
            }
        }

        notifySuccess("Address deleted");
    };

    // Set address as default
    const handleSetDefault = (addressId) => {
        const updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId,
        }));
        setAddresses(updatedAddresses);
        notifySuccess("Default address updated");
    };

    return (
        <div className="form-group">
            <div className="flex items-center justify-between pb-3">
                <h2 className="font-semibold text-base text-gray-700">
                    Delivery Address
                </h2>
                {addresses.length > 0 && (
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                        <IoAdd className="w-4 h-4" />
                        Add New
                    </button>
                )}
            </div>

            {/* Address Cards */}
            {addresses.length > 0 ? (
                <div className="space-y-3 mb-6">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            onClick={() => handleSelectAddress(address)}
                            className={`relative p-4 rounded-lg border cursor-pointer transition-all ${selectedAddress?.id === address.id
                                ? "border-emerald-500 bg-emerald-50/50"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                {/* Address Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium text-gray-900 text-sm">{address.name}</p>
                                        {address.isDefault && (
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {address.address}, {address.city}, {address.country} - {address.zipCode}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        +91 {address.contact}
                                    </p>
                                </div>

                                {/* Selection Indicator */}
                                {selectedAddress?.id === address.id && (
                                    <IoCheckmarkCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                )}
                            </div>

                            {/* Inline Action Buttons */}
                            <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(address);
                                    }}
                                    className="text-xs text-gray-600 hover:text-emerald-600 font-medium"
                                >
                                    Edit
                                </button>
                                {!address.isDefault && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetDefault(address.id);
                                            }}
                                            className="text-xs text-gray-600 hover:text-emerald-600 font-medium"
                                        >
                                            Set as Default
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAddress(address.id);
                                            }}
                                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* No Address - Add Button */
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                            <IoAdd className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="text-gray-700 font-medium">Add Delivery Address</span>
                        <span className="text-gray-500 text-sm">Click to add your first address</span>
                    </button>
                </div>
            )}

            {/* Hidden form fields for the actual form submission */}
            <input type="hidden" {...register("firstName")} />
            <input type="hidden" {...register("lastName")} />
            <input type="hidden" {...register("contact")} />
            <input type="hidden" {...register("email")} />
            <input type="hidden" {...register("address")} />
            <input type="hidden" {...register("city")} />
            <input type="hidden" {...register("country")} />
            <input type="hidden" {...register("zipCode")} />

            {/* Address Modal */}
            <Transition show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {isEditing ? "Edit Address" : "Add New Address"}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            <IoClose className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Modal Form */}
                                    <div className="space-y-4">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={addressForm.name}
                                                onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Enter full name"
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Contact & Email */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Mobile <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
                                                    <Input
                                                        type="tel"
                                                        inputMode="numeric"
                                                        maxLength={10}
                                                        value={addressForm.contact}
                                                        onChange={(e) => setAddressForm(prev => ({ ...prev, contact: e.target.value.replace(/\D/g, "") }))}
                                                        placeholder="10-digit"
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email (Optional)
                                                </label>
                                                <Input
                                                    type="email"
                                                    value={addressForm.email}
                                                    onChange={(e) => setAddressForm(prev => ({ ...prev, email: e.target.value }))}
                                                    placeholder="Email address"
                                                />
                                            </div>
                                        </div>

                                        {/* PIN Code & City & State */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    PIN Code <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={6}
                                                        value={addressForm.zipCode}
                                                        onChange={handlePincodeChange}
                                                        placeholder="6-digit"
                                                    />
                                                    {pincodeLoading && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                {pincodeError && <p className="text-red-500 text-xs mt-1">{pincodeError}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    City <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={addressForm.city}
                                                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                                    placeholder="City/District"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    State
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={addressForm.country}
                                                    onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                                                    placeholder="State"
                                                />
                                            </div>
                                        </div>

                                        {/* Complete Address */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Complete Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={addressForm.address}
                                                onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                                                placeholder="House/Flat No., Building, Street, Landmark"
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                            />
                                        </div>

                                        {/* Set as Default */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="isDefault"
                                                checked={addressForm.isDefault}
                                                onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <label htmlFor="isDefault" className="text-sm text-gray-700">
                                                Set as default address
                                            </label>
                                        </div>
                                    </div>

                                    {/* Modal Actions */}
                                    <div className="flex gap-3 mt-6">
                                        <Button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleSaveAddress}
                                            className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white"
                                        >
                                            {isEditing ? "Update Address" : "Save Address"}
                                        </Button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default AddressManager;
