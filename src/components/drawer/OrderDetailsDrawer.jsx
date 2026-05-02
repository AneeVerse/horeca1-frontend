import React, { useContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReactToPrint } from "react-to-print";
import { CreditCard, Download, Printer, Truck, X, Share2 } from "lucide-react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";

//internal import
import MainDrawer from "./MainDrawer";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { SidebarContext } from "@context/SidebarContext";
import { useSetting } from "@context/SettingContext";
import OrderItems from "@components/order/OrderItems";
import { Button } from "@components/ui/button";
import Invoice from "@components/invoice/Invoice";
import InvoicePDF from "@components/invoice/InvoiceForDownload";
import { getOrderById } from "@services/OrderServices";

const OrderDetailsDrawer = ({ data }) => {
  const printRef = useRef();
  const invoiceRef = useRef();
  const { drawerOpen, closeDrawer } = useContext(SidebarContext);
  const { globalSetting, storeCustomization } = useSetting();
  const { showingTranslateValue, getNumberTwo, currency } = useUtilsFunction();
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [orderDetails, setOrderDetails] = useState(data);

  const dashboard = storeCustomization?.dashboard;

  // Check if client-side and detect mobile
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch full order details to ensure all fields for PDF are present
  useEffect(() => {
    if (data?._id) {
      const fetchOrderDetails = async () => {
        try {
          const res = await getOrderById({ id: data._id });
          if (res?.data) {
            setOrderDetails(res.data);
          }
        } catch (err) {
          console.error("Error fetching order details:", err);
        }
      };
      fetchOrderDetails();
    }
  }, [data?._id]);

  const handlePrintInvoice = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${orderDetails?.invoice}`,
  });

  // Mobile-friendly download handler
  const handleMobileDownload = async (e) => {
if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();
    }
    // Prevent drawer from closing
    if (!orderDetails?._id) {
return;
    }
    setDownloadLoading(true);
    try {
      // Generate PDF blob
      const pdfBlob = await pdf(
        <InvoicePDF data={orderDetails} globalSetting={globalSetting} />
      ).toBlob();

      const fileName = `Invoice-${orderDetails?.invoice}.pdf`;

      // Check if Web Share API is available (preferred for mobile)
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Invoice #${orderDetails?.invoice}`,
              text: 'Your order invoice',
            });
            setDownloadLoading(false);
            return;
          }
        } catch (shareError) {
          console.log("Web Share API not available, falling back to download");
        }
      }

      // Fallback: Create download link and trigger click
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      a.style.position = 'fixed';
      a.style.top = '-9999px';
      document.body.appendChild(a);
// Use both click and programmatic trigger for better mobile support
      a.click();
      // Also trigger programmatically after a small delay
      setTimeout(() => {
        if (document.body.contains(a)) {
          a.click();
        }
      }, 100);
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("Error with mobile download:", error);
// Don't close drawer on error - let user try again
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Mobile-friendly print using PDF blob and share API
  const handleMobilePrint = async (e) => {
if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();
    }
    // Prevent drawer from closing
    if (!orderDetails?._id) {
return;
    }
    setDownloadLoading(true);
    try {
      // Generate PDF blob
      const pdfBlob = await pdf(
        <InvoicePDF data={orderDetails} globalSetting={globalSetting} />
      ).toBlob();

      const fileName = `Invoice-${orderDetails?.invoice}.pdf`;

      // Check if Web Share API is available (preferred for mobile)
      if (navigator.share && navigator.canShare) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Invoice #${orderDetails?.invoice}`,
            text: 'Your order invoice',
          });
          setDownloadLoading(false);
          return;
        }
      }

      // Fallback: Open PDF in new tab for printing
      const url = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.addEventListener('load', () => {
          setTimeout(() => {
            newWindow.print();
          }, 500);
        });
      }
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Error with mobile print:", error);
// Final fallback: download the PDF
      try {
        await handleMobileDownload();
      } catch (fallbackError) {
        console.error("Fallback download also failed:", fallbackError);
        alert("Failed to print invoice. Please try downloading instead.");
      }
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <MainDrawer open={drawerOpen} onClose={closeDrawer}>
      <div className="flex flex-col w-full h-full justify-between items-middle bg-white rounded">
        {/* Sticky Header */}
        <div className="flex-none w-full flex justify-between items-center relative px-5 py-4 border-b bg-indigo-50 border-gray-100">
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg m-0 text-heading flex items-center">
              Invoice No #{orderDetails?.invoice}
            </h2>

            <div className="text-sm">
              {(orderDetails?.status === "Delivered" ||
                orderDetails?.status === "delivered") && (
                  <span className="flex items-center gap-x-2 justify-start">
                    <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
                      <div className="size-2.5 rounded-full bg-current"></div>
                    </div>
                    <span className="block">{orderDetails?.status}</span>
                  </span>
                )}
              {(orderDetails?.status === "Pending" || orderDetails?.status === "pending") && (
                <span className="flex items-center gap-x-2 justify-start">
                  <div className="flex-none rounded-full bg-orange-400/10 p-1 text-orange-400">
                    <div className="size-2.5 rounded-full bg-current"></div>
                  </div>
                  <span className="block">{orderDetails?.status}</span>
                </span>
              )}
              {(orderDetails?.status === "Cancel" || orderDetails?.status === "cancel") && (
                <span className="flex items-center gap-x-2 justify-start">
                  <div className="flex-none rounded-full bg-red-400/10 p-1 text-red-400">
                    <div className="size-2.5 rounded-full bg-current"></div>
                  </div>
                  <span className="block">{orderDetails?.status}</span>
                </span>
              )}
              {(orderDetails?.status === "Processing" ||
                orderDetails?.status === "processing") && (
                  <span className="flex items-center gap-x-2 justify-start">
                    <div className="flex-none rounded-full bg-emerald-400/10 p-1 text-emerald-400">
                      <div className="size-2.5 rounded-full bg-current"></div>
                    </div>
                    <span className="block">{orderDetails?.status}</span>
                  </span>
                )}
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="inline-flex print:hidden text-base items-center cursor-pointer justify-center text-gray-500 p-2 focus:outline-none transition-opacity hover:text-red-400"
          >
            <X />
            <span className="font-sens text-sm text-gray-500 hover:text-red-400 ml-1">
              Close
            </span>
          </button>
        </div>

        {/* Scrollable Invoice Content */}
        <div className="flex-1 w-full overflow-y-auto scrollbar-hide">
          <div ref={invoiceRef} className="bg-white">
            <Invoice data={orderDetails} globalSetting={globalSetting} />
          </div>
        </div>

        {/* Sticky Footer */}
        <div 
          className="flex-none bg-neutral-50 dark:bg-slate-900 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
          onClick={(e) => {
            // Prevent clicks in footer from closing the drawer
            e.stopPropagation();
          }}
        >
          <div className="flex space-x-3 flex-wrap justify-between gap-2">
            {/* Download PDF Button - Mobile-friendly handler */}
            {isClient && (
              <>
                {isMobile ? (
                  <Button 
                    variant="create" 
                    disabled={downloadLoading}
                    onClick={(e) => {
e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent?.stopImmediatePropagation?.();
                      // Use setTimeout to ensure handler runs after event propagation is stopped
                      setTimeout(() => {
                        handleMobileDownload(e);
                      }, 0);
                    }}
                    onTouchStart={(e) => {
e.stopPropagation();
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {downloadLoading ? "Generating..." : "Download PDF"}{" "}
                    <Download className="ml-2" />
                  </Button>
                ) : (
                  <PDFDownloadLink
                    document={<InvoicePDF data={orderDetails} globalSetting={globalSetting} />}
                    fileName={`Invoice-${orderDetails?.invoice}.pdf`}
                  >
                    {({ loading, error }) => (
                      <Button variant="create" disabled={loading}>
                        {loading ? "Generating..." : "Download PDF"}{" "}
                        <Download className="ml-2" />
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </>
            )}

            {/* Print Button - Different handling for mobile vs desktop */}
            <Button
              onClick={(e) => {
e.preventDefault();
                e.stopPropagation();
                e.nativeEvent?.stopImmediatePropagation?.();
                // Use setTimeout to ensure handler runs after event propagation is stopped
                setTimeout(() => {
                  if (isMobile) {
                    handleMobilePrint(e);
                  } else {
                    handlePrintInvoice();
                  }
                }, 0);
              }}
              variant="import"
              disabled={downloadLoading}
              onTouchStart={(e) => {
e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {downloadLoading ? "Preparing..." : (showingTranslateValue(dashboard?.print_button) || "Print")}{" "}
              <span className="ml-2">
                {isMobile ? <Share2 /> : <Printer />}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </MainDrawer>
  );
};

export default dynamic(() => Promise.resolve(OrderDetailsDrawer), {
  ssr: false,
});
