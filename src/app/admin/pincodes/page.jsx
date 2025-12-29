"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Navi Mumbai PIN codes - initial data
const NAVI_MUMBAI_PINCODES = [
    { pincode: "400614", area: "CBD Belapur", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "400703", area: "Vashi", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "400705", area: "Kopar Khairane", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "400706", area: "Airoli", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "400707", area: "Ghansoli", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "400708", area: "Thane", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "400709", area: "Nerul", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "400710", area: "Sanpada", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "400701", area: "Turbhe", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "410206", area: "Kharghar", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "410208", area: "Kamothe", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "410209", area: "Taloja", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "410210", area: "Panvel", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "410218", area: "Ulwe", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "410221", area: "Dronagiri", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "400702", area: "Juinagar", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "400704", area: "Turbhe MIDC", city: "Navi Mumbai", state: "Maharashtra" },
    { pincode: "410207", area: "CBD Belapur Sector", city: "Navi Mumbai", state: "Maharashtra" },
];

export default function PincodesPage() {
    const [pincodes, setPincodes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPincode, setNewPincode] = useState({
        pincode: "",
        area: "",
        city: "",
        state: "Maharashtra",
    });
    const [loading, setLoading] = useState(false);

    // Load pincodes from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("deliveryPincodes");
        if (stored) {
            setPincodes(JSON.parse(stored));
        } else {
            // Initialize with Navi Mumbai pincodes
            setPincodes(NAVI_MUMBAI_PINCODES);
            localStorage.setItem("deliveryPincodes", JSON.stringify(NAVI_MUMBAI_PINCODES));
        }
    }, []);

    // Save to localStorage whenever pincodes change
    useEffect(() => {
        if (pincodes.length > 0) {
            localStorage.setItem("deliveryPincodes", JSON.stringify(pincodes));
        }
    }, [pincodes]);

    const handleAddPincode = () => {
        if (!newPincode.pincode || newPincode.pincode.length !== 6) {
            alert("Please enter a valid 6-digit PIN code");
            return;
        }

        // Check if already exists
        if (pincodes.some(p => p.pincode === newPincode.pincode)) {
            alert("This PIN code already exists");
            return;
        }

        const updated = [...pincodes, { ...newPincode, id: Date.now() }];
        setPincodes(updated);
        setNewPincode({ pincode: "", area: "", city: "", state: "Maharashtra" });
        setShowAddModal(false);
    };

    const handleDeletePincode = (pincode) => {
        if (confirm(`Delete PIN code ${pincode}?`)) {
            const updated = pincodes.filter(p => p.pincode !== pincode);
            setPincodes(updated);
        }
    };

    const filteredPincodes = pincodes.filter(p =>
        p.pincode.includes(searchTerm) ||
        p.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">PIN Codes</h1>
                        <p className="text-gray-600 mt-1">Manage delivery PIN codes for your service area</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add PIN Code
                    </button>
                </div>
            </div>

            {/* Search and Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by PIN code, area, or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-emerald-600">{pincodes.length}</span> PIN codes active
                    </div>
                </div>
            </div>

            {/* PIN Codes Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    PIN Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Area
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    City
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    State
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPincodes.map((item, index) => (
                                <tr key={item.pincode + index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                            {item.pincode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {item.area}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {item.city}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.state}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleDeletePincode(item.pincode)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Delete"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPincodes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        {searchTerm ? "No PIN codes match your search" : "No PIN codes added yet"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Add New PIN Code</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    PIN Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={newPincode.pincode}
                                    onChange={(e) => setNewPincode(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, "") }))}
                                    placeholder="Enter 6-digit PIN"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Area Name
                                </label>
                                <input
                                    type="text"
                                    value={newPincode.area}
                                    onChange={(e) => setNewPincode(prev => ({ ...prev, area: e.target.value }))}
                                    placeholder="e.g., Vashi, Kharghar"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={newPincode.city}
                                        onChange={(e) => setNewPincode(prev => ({ ...prev, city: e.target.value }))}
                                        placeholder="City name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={newPincode.state}
                                        onChange={(e) => setNewPincode(prev => ({ ...prev, state: e.target.value }))}
                                        placeholder="State"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddPincode}
                                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium"
                            >
                                Add PIN Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
