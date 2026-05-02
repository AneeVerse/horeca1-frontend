"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Download } from "lucide-react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";

// internal imports
import Invoice from "@components/invoice/Invoice";
import { Button } from "@components/ui/button";
import { useSetting } from "@context/SettingContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import InvoicePDF from "@components/invoice/InvoiceForDownload";

const DownloadPrintButton = ({ data }) => {
  const { globalSetting, storeCustomization } = useSetting();
  const targetRef = useRef(null);
  const { showingTranslateValue } = useUtilsFunction();
  const dashboard = storeCustomization?.dashboard;

  // Flag to only render PDFDownloadLink after client mount
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-friendly download handler
  const handleMobileDownload = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDownloadLoading(true);
    try {
      // Generate PDF blob
      const pdfBlob = await pdf(
        <InvoicePDF data={data} globalSetting={globalSetting} />
      ).toBlob();

      const fileName = `Invoice-${data?.invoice}.pdf`;

      // Check if Web Share API is available (preferred for mobile)
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Invoice #${data?.invoice}`,
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
} finally {
      setDownloadLoading(false);
    }
  };
return (
    <>
      <div className="bg-emerald-100 rounded-md mb-5 px-4 py-3">
        <label>
          {showingTranslateValue(dashboard?.invoice_message_first)}{" "}
          <span className="font-bold text-[#018549]">
            {data?.user_info?.name},
          </span>{" "}
          {showingTranslateValue(dashboard?.invoice_message_last)}
        </label>
      </div>

      <Invoice data={data} printRef={targetRef} globalSetting={globalSetting} />

      <div className="bg-white rounded-lg shadow-sm">
        <div className="bg-white p-8 rounded-b-xl">
          <div className="flex flex-col sm:flex-row justify-center gap-4 invoice-btn">
            {/* Download Button */}
            {isClient && (
              <>
                {isMobile ? (
                  <Button 
                    variant="create" 
                    className="px-8 py-3 text-base font-semibold w-full sm:w-auto"
                    onClick={handleMobileDownload}
                    disabled={downloadLoading}
                  >
                    {downloadLoading ? "Generating..." : (showingTranslateValue(dashboard?.download_button) || "Download Invoice")}{" "}
                    <Download className="ml-2 w-5 h-5" />
                  </Button>
                ) : (
                  <PDFDownloadLink
                    document={
                      <InvoicePDF data={data} globalSetting={globalSetting} />
                    }
                    fileName={`Invoice-${data?.invoice}.pdf`}
                  >
                    {({ loading }) => (
                      <Button variant="create" className="px-8 py-3 text-base font-semibold">
                        {loading ? "Generating..." : (showingTranslateValue(dashboard?.download_button) || "Download Invoice")}{" "}
                        <Download className="ml-2 w-5 h-5" />
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(DownloadPrintButton), {
  ssr: false,
});

