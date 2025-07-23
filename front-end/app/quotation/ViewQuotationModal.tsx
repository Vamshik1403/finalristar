import React from "react";
import { Download, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewQuotationModalProps {
  quotation: any;
  onClose?: () => void;
  onDownload?: () => void;
  onEdit?: () => void;
}

const ViewQuotationModal: React.FC<ViewQuotationModalProps> = ({
  quotation,
  onClose,
  onDownload,
  onEdit,
}) => {
  const handleClose = () => {
    if (onClose) onClose();
  };

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString() : "";

  // Helper to render a section with filtered fields
  const renderSection = (title: string, fields: [string, any][]) => {
    const visibleFields = fields.filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    );
    if (visibleFields.length === 0) return null;

    return (
      <div>
        <h3 className="text-lg font-medium text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-4">
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {visibleFields.map(([label, value], idx) => (
            <div key={idx}>
              <label className="block text-sm text-neutral-700 dark:text-neutral-400 mb-1">
                {label}
              </label>
              <div className="text-black dark:text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[1000px] max-h-[90vh] overflow-y-auto border border-neutral-800 relative">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 z-10 flex justify-between items-center px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">Quotation Details</h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-400">
              Reference: {quotation?.quotationRefNumber || "-"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex items-center gap-1 text-blue-400 border-blue-800 hover:border-blue-700"
              >
                <Pencil size={16} />
                Edit Quotation
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="flex items-center gap-1 text-green-400 border-green-800 hover:border-green-700"
            >
              <Download size={16} />
              Download PDF
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-neutral-400 hover:text-black dark:hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Status + Created */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="font-medium text-black dark:text-white">
                Status:
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  quotation.status === "ACTIVE"
                    ? "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/80 dark:text-green-200 dark:border-green-700"
                    : "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/80 dark:text-red-200 dark:border-red-700"
                }`}
              >
                {quotation.status}
              </span>
            </div>
            <div className="text-sm text-black dark:text-neutral-400">
              <span className="mr-2">Created:</span>
              {quotation.createdAt
                ? new Date(quotation.createdAt).toLocaleString()
                : "-"}
            </div>
          </div>

          {/* Section Blocks */}
          {renderSection("General Information", [
            ["Effective Date", formatDate(quotation.effectiveDate)],
            ["Valid Till", formatDate(quotation.validTillDate)],
            ["Shipping Term", quotation.shippingTerm],
            ["Customer Name", quotation.custAddressBook?.companyName],
            ["Billing Party", quotation.billingParty],
            ["Rate Type", quotation.rateType],
            ["Billing Type", quotation.billingType],
            ["Product Name", quotation.product?.productName],
          ])}

          {renderSection("Port Information", [
            ["Port Of Loading", quotation.polPort?.portName],
            ["Port Of Discharge", quotation.podPort?.portName],
            ["Free Days (POL)", quotation.polFreeDays],
            ["Free Days (POD)", quotation.podFreeDays],
            ["Detention Rate (POL)", quotation.polDetentionRate],
            ["Detention Rate (POD)", quotation.podDetentionRate],
            ["Transit Days", quotation.transitDays],
          ])}

          {renderSection("Agents and Depots", [
            ["Exp. Depot", quotation.expDepotAddressBook?.companyName],
            [
              "Empty Return Depot",
              quotation.emptyReturnAddressBook?.companyName,
            ],
            [
              "Exp. Handling Agent",
              quotation.expHandlingAgentAddressBook?.companyName,
            ],
            [
              "Imp. Handling Agent",
              quotation.impHandlingAgentAddressBook?.companyName,
            ],
            ...(quotation.transhipmentPort
              ? ([
                  ["Transhipment Port", quotation.transhipmentPort?.portName],
                  [
                    "Transhipment Agent",
                    quotation.transhipmentHandlingAgentAddressBook?.companyName,
                  ],
                ] as [string, any][])
              : ([] as [string, any][])),
          ])}

          {renderSection("Financial Details", [
            ["Slot Rate", quotation.slotRate],
            ["Depot Avg Cost", quotation.depotAvgCost],
            ["Leasing Cost", quotation.leasingCost],
            ["Depot Cleaning Cost", quotation.depotCleaningCost],
            ["Terminal Handling Fee", quotation.terminalHandlingFee],
            ["Container Preparation", quotation.containerPreparationCost],
            ["Exp. Agency Commission", quotation.expAgencyCommission],
            ["Imp. Agency Commission", quotation.impAgencyCommission],
            ["Exp. Collection", quotation.expCollectionCharges],
            ["Imp. Collection", quotation.impCollectionCharges],
          ])}

          {renderSection("Totals and P&L", [
            ["Total Cost", quotation.totalCost],
            ["Selling Amount", quotation.sellingAmount],
            ["Total Revenue", quotation.totalRevenueAmount],
            ["Total P&L", quotation.totalPLAmount],
            [
              "P/L Margin %",
              quotation.plMargin ? `${quotation.plMargin}%` : "",
            ],
          ])}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            className="text-black dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewQuotationModal;
