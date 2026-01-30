// components/invoice/InvoicePDF.js
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import dayjs from "dayjs";

const tw = createTw({
  theme: {
    extend: {
      colors: {
        primary: "#018549",
        secondary: "#3f37c9",
        accent: "#4895ef",
        "indigo-50": "#eef2ff",
        "emerald-50": "#ecfdf5",
        "gray-50": "#f9fafb",
        "gray-100": "#f3f4f6",
        "gray-200": "#e5e7eb",
        "gray-500": "#6b7280",
        "gray-600": "#4b5563",
        "gray-700": "#374151",
        "red-500": "#ef4444",
        "orange-500": "#f97316",
        "indigo-500": "#6366f1",
      },
      fontSize: {
        xs: "10px",
        sm: "11px",
        base: "12px",
        lg: "14px",
        xl: "18px",
        "2xl": "22px",
      },
    },
  },
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    paddingBottom: 40,
    backgroundColor: "#ffffff",
    fontSize: 12,
  },
  header: {
    backgroundColor: "#eef2ff", // indigo-50
    padding: 30,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  footer: {
    backgroundColor: "#ecfdf5", // emerald-50
    padding: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  tableHeader: {
    backgroundColor: "#f9fafb", // gray-50
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  colSr: { width: "8%" },
  colProduct: { width: "45%" },
  colQty: { width: "15%", textAlign: "center" },
  colPrice: { width: "16%", textAlign: "center" },
  colAmount: { width: "16%", textAlign: "right" },
});

const InvoicePDF = ({ data, globalSetting }) => {
  // Use "Rs." instead of "₹" for better PDF compatibility
  const currencySymbol = globalSetting?.default_currency || "₹";
  const currency = currencySymbol === "₹" ? "Rs." : currencySymbol;
  const getNumberTwo = (num) => (!num ? "0.00" : Number(num).toFixed(2));

  // Calculate GST breakdown (same logic as checkout pricingBreakdown)
  const pricingBreakdown = React.useMemo(() => {
    let totalGst = 0;
    let taxableSubtotal = 0;

    (data?.cart || []).forEach(item => {
      const quantity = item.quantity || 1;
      const taxPercent = parseFloat(item.taxPercent) || 0;
      const itemCurrentPriceGross = parseFloat(item.price) || 0;
      const itemGrossTotal = itemCurrentPriceGross * quantity;

      let itemTaxableAmount, itemGstAmount;
      if (item.taxableRate && item.taxableRate > 0) {
        // Use stored taxableRate
        itemTaxableAmount = item.taxableRate * quantity;
        itemGstAmount = itemGrossTotal - itemTaxableAmount;
      } else {
        // Fallback: Taxable = Gross / (1 + Tax/100)
        itemTaxableAmount = itemGrossTotal / (1 + taxPercent / 100);
        itemGstAmount = itemGrossTotal - itemTaxableAmount;
      }
      taxableSubtotal += itemTaxableAmount;
      totalGst += itemGstAmount;
    });

    // If order already has these values stored, prefer those for consistency
    return {
      taxableSubtotal: data?.taxableSubtotal !== undefined ? data.taxableSubtotal : taxableSubtotal,
      totalGst: data?.totalGst !== undefined ? data.totalGst : totalGst,
    };
  }, [data]);

  // Status Color Logic
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
      case "POS-Completed":
        return "#018549";
      case "Pending":
        return "#f97316";
      case "Cancel":
        return "#ef4444";
      case "Processing":
        return "#6366f1";
      case "Deleted":
        return "#b91c1c";
      default:
        return "#374151";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={tw("p-8 bg-indigo-50")}>
          <View style={tw("flex flex-row justify-between items-start pb-4 border-b border-gray-200")}>
            <View>
              <Text style={tw("font-bold text-2xl uppercase text-gray-800")}>
                Invoice
              </Text>
              <View style={tw("flex flex-row mt-1")}>
                <Text style={tw("text-gray-700 text-sm")}>Status : </Text>
                <Text style={{ ...tw("text-sm"), color: getStatusColor(data?.status) }}>
                  {data?.status}
                </Text>
              </View>
            </View>
            <View style={tw("items-end")}>
              <Image
                src="https://res.cloudinary.com/dezs8ma9n/image/upload/v1766484997/horecaLogo_hirtnv.png"
                style={{ width: 100, height: 35, marginBottom: 5 }}
              />
              <Text style={tw("text-xs text-gray-600 font-bold text-right")}>
                {globalSetting?.company_name || "HCX Global Pvt. Ltd."}
              </Text>
              <Text style={tw("text-xs text-gray-500 text-right w-48")}>
                {globalSetting?.address || "C-003, Station Complex, Sanpada, Navi Mumbai - 400705"}
              </Text>
              {(globalSetting?.vat_number) && (
                <Text style={tw("text-xs text-gray-500 text-right mt-1")}>
                  GSTIN: {globalSetting.vat_number}
                </Text>
              )}
            </View>
          </View>

          <View style={tw("flex flex-row justify-between pt-4")}>
            <View style={tw("flex flex-col w-1/3")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1")}>
                Date
              </Text>
              <Text style={tw("text-xs text-gray-500")}>
                {data?.createdAt && dayjs(data?.createdAt).format("MMMM D, YYYY")}
              </Text>
            </View>
            <View style={tw("flex flex-col w-1/3")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1")}>
                Invoice No.
              </Text>
              <Text style={tw("text-xs text-gray-500")}>#{data?.invoice}</Text>
            </View>
            <View style={tw("flex flex-col w-1/3 items-end")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1 text-right")}>
                Invoice To.
              </Text>
              <Text style={tw("text-xs text-gray-500 text-right")}>
                {data?.user_info?.name}
              </Text>
              <Text style={tw("text-xs text-gray-500 text-right")}>
                {data?.user_info?.email}
              </Text>
              <Text style={tw("text-xs text-gray-500 text-right")}>
                {data?.user_info?.contact}
              </Text>
              <Text style={tw("text-xs text-gray-500 text-right w-40")}>
                {data?.user_info?.address}
              </Text>
              {data?.user_info?.city && (
                <Text style={tw("text-xs text-gray-500 text-right")}>
                  {data?.user_info?.city}, {data?.user_info?.country} {data?.user_info?.zipCode}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Table Section */}
        <View style={tw("px-8 my-6")}>
          <View style={[styles.tableHeader, tw("bg-gray-50")]}>
            <Text style={[styles.colSr, tw("text-xs font-bold text-gray-700 uppercase")]}>Sr.</Text>
            <Text style={[styles.colProduct, tw("text-xs font-bold text-gray-700 uppercase pl-2")]}>Product Name</Text>
            <Text style={[styles.colQty, tw("text-xs font-bold text-gray-700 uppercase")]}>Qty</Text>
            <Text style={[styles.colPrice, tw("text-xs font-bold text-gray-700 uppercase")]}>Price</Text>
            <Text style={[styles.colAmount, tw("text-xs font-bold text-gray-700 uppercase")]}>Amount</Text>
          </View>

          {data?.cart?.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.colSr, tw("text-xs text-gray-500")]}>{i + 1}</Text>
              <View style={[styles.colProduct, tw("flex flex-row items-center")]}>
                {item.image && (
                  <Image
                    src={item.image}
                    style={{ width: 25, height: 25, marginRight: 6, borderRadius: 3 }}
                  />
                )}
                <Text style={tw("text-xs font-medium text-gray-700")}>{item.title}</Text>
              </View>
              <Text style={[styles.colQty, tw("text-xs text-gray-500")]}>{item.quantity}</Text>
              <Text style={[styles.colPrice, tw("text-xs text-gray-500")]}>
                {currency}{getNumberTwo(item.price)}
              </Text>
              <Text style={[styles.colAmount, tw("text-xs font-bold text-gray-500")]}>
                {currency}{getNumberTwo(item.itemTotal || item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer Totals Section */}
        <View style={tw("border-t border-b border-gray-100 p-8 bg-emerald-50 mt-4")}>
          <View style={tw("flex flex-row justify-between")}>
            {/* Left Column - Payment Info */}
            <View style={tw("w-1/2")}>
              <View style={tw("flex flex-row justify-between mb-2")}>
                <Text style={tw("text-xs text-gray-600")}>Payment Method:</Text>
                <Text style={tw("text-xs font-bold text-gray-700")}>{data?.paymentMethod || "RazorPay"}</Text>
              </View>
              <View style={tw("flex flex-row justify-between mb-2")}>
                <Text style={tw("text-xs text-gray-600")}>Shipping:</Text>
                <Text style={tw("text-xs font-bold text-green-600")}>FREE</Text>
              </View>
              {data?.discount > 0 && (
                <View style={tw("flex flex-row justify-between mb-2")}>
                  <Text style={tw("text-xs text-gray-600")}>Discount:</Text>
                  <Text style={tw("text-xs font-bold text-red-500")}>-{currency}{getNumberTwo(data?.discount)}</Text>
                </View>
              )}
            </View>

            {/* Right Column - Totals */}
            <View style={tw("w-1/2 pl-8")}>
              <View style={tw("flex flex-row justify-between mb-2")}>
                <Text style={tw("text-xs text-gray-600")}>Item Total:</Text>
                <Text style={tw("text-xs font-bold text-gray-700")}>{currency}{getNumberTwo(pricingBreakdown.taxableSubtotal)}</Text>
              </View>
              <View style={tw("flex flex-row justify-between mb-2")}>
                <Text style={tw("text-xs text-gray-600")}>+ GST:</Text>
                <Text style={tw("text-xs font-bold text-gray-700")}>{currency}{getNumberTwo(pricingBreakdown.totalGst)}</Text>
              </View>
              <View style={tw("flex flex-row justify-between pt-2 border-t border-gray-300")}>
                <Text style={tw("text-sm font-bold text-gray-700")}>Total:</Text>
                <Text style={tw("text-lg font-bold text-red-500")}>{currency}{getNumberTwo(data?.total)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom copyright/address in Footer style usually goes here, but Invoice.jsx doesn't have it explicitly separate */}
      </Page>
    </Document>
  );
};

export default InvoicePDF;
