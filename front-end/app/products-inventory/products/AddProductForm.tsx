import axios from "axios";
import React, { useEffect, useState } from "react";

import { uuidv4 } from "@/lib/uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AddProductFormProps {
  onClose: () => void;
  onSubmit?: (data: any) => void;
  editData?: any | null;
}

interface MSDS {
  id: string;
  issueDate: string;
  certificate: File | null;
  certificateName?: string; // Add this to store existing file name
  remark: string;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  onClose,
  onSubmit,
  editData,
}) => {
  const [formData, setFormData] = useState(() => ({
  status: editData?.status || "Active",
  productId: editData?.productId || "",
  productName: editData?.productName || "",
  tradeName: editData?.tradeName || "",
  grade: editData?.grade || "Industrial",
  productType: editData?.productType || "Chemical",
  derivative: editData?.derivative || "",
  cleanType: editData?.cleanType || "Type A",
  unCode: editData?.unCode || "",
  packaging: editData?.packaging || "Drum",
  shippingName: editData?.shippingName || "",
  containerCategory: editData?.containerCategory || "Tank",
  containerType: editData?.containerType || "ISO Tank",
  classType: editData?.classType || "T11",
}));


  const [msdsRecords, setMsdsRecords] = useState<MSDS[]>(() => {
    if (editData?.msds?.length) {
      return editData.msds.map((m: any) => ({
        id: m.id || uuidv4(),
        issueDate: m.msdcIssueDate ? new Date(m.msdcIssueDate).toISOString().split('T')[0] : "",
        certificate: null, // We can't load the file object
        certificateName: m.msdsCertificate || "", // Store the filename
        remark: m.remark || "",
      }));
    } else {
      // Start with an empty array instead of a default record
      return [];
    }
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (onSubmit) {
        // For edit operations, send the structured data directly
        onSubmit({ 
          formData, // Send actual formData object, not FormData
          msdsRecords,
          editData 
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };

  const handleAddMsds = () => {
    setMsdsRecords((prev) => [
      ...prev,
      {
        id: uuidv4(),
        issueDate: "",
        certificate: null,
        remark: "",
      },
    ]);
  };

  const handleDeleteMsds = async (idToDelete: string) => {
    // If the record has a numeric backend ID, call the backend delete API
    const record = msdsRecords.find((r) => r.id === idToDelete);
    if (record && !isNaN(Number(record.id))) {
      try {
        await axios.delete(`http://localhost:8000/product-msds/${record.id}`);
      } catch (error) {
        alert("Failed to delete MSDS record from server.");
        return;
      }
    }
    // Remove from local state
    setMsdsRecords((prev) => prev.filter((record) => record.id !== idToDelete));
  };

  const handleMsdsChange = (
    id: string,
    field: keyof Omit<MSDS, "id">,
    value: any
  ) => {
    setMsdsRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, [field]: value } : record
      )
    );
  };

  useEffect(() => {
    if (!editData) {
      // Only fetch next productId if NOT editing
      axios
        .get("http://localhost:8000/products/next-id")
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            productId: res.data.productId || "",
          }));
        })
        .catch((err) => {
          console.error("Failed to fetch product ID", err);
        });
    }
  }, [editData]);

  useEffect(() => {
    if (editData) {
      // Check for specific data issues
      if (editData.msds) {
        editData.msds.forEach((item: any, idx: number) => {
        });
      }
    }
  }, [editData]);

  // Log changes to msdsRecords for debugging
  useEffect(() => {
  }, [msdsRecords]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg">
      <Dialog open onOpenChange={onClose} modal={true}>
        <DialogContent
          className="!w-[90vw] !max-w-[1200px] min-w-0 bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-0 border border-neutral-200 dark:border-neutral-800"
          onInteractOutside={e => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {editData ? "Edit Product" : "Add Product"}
            </DialogTitle>
            {/* Removed duplicate X close button here */}
          </DialogHeader>
          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
            {/* Status & Product ID row */}
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                >
                  <option value="Approved">Active</option>
                  <option value="Pending">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  Product ID
                </label>
                <input
                  type="text"
                  name="productId"
                  value={formData.productId || ""}
                  onChange={handleChange}
                  readOnly
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                />
              </div>
            </div>
            {/* Product Name & Trade Name row */}
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  Trade Name
                </label>
                <input
                  type="text"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                />
              </div>
            </div>
            {/* Product Type & Derivative row */}
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  Product Type
                </label>
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                >
                  <option value="Select">Select an option</option>
                  <option value="Hazardous">Hazardous</option>
                  <option value="Non Hazardous">Non Hazardous</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1" htmlFor="derivative">
                  Derivative
                </label>
                <input
                  type="text"
                  name="derivative"
                  id="derivative"
                  value={formData.derivative}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                />
              </div>
            </div>
            {/* Grade */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">Grade</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
              >
                <option value="Select">Select an Option</option>
                <option value="Chemical">Chemical</option>
                <option value="Food">Food</option>
                <option value="FOSFA">FOSFA</option>
              </select>
            </div>
            {/* Clean Type & UN Code row */}
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  Clean Type
                </label>
                <select
                  name="cleanType"
                  value={formData.cleanType}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                >
                  <option value="Select">Select</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Difficult">Difficult</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  UN Code
                </label>
                <input
                  type="text"
                  name="unCode"
                  value={formData.unCode}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                />
              </div>
            </div>
            {/* Packaging & Shipper Name row */}
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  Packaging
                </label>
                <select
                  name="packaging"
                  value={formData.packaging}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                >
                  <option value="Select">Select</option>
                  <option value="|">|</option>
                  <option value="||">||</option>
                  <option value="|||">|||</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  Shipper Name
                </label>
                <input
                  type="text"
                  name="shippingName"
                  placeholder="Enter shipper name"
                  value={formData.shippingName}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                />
              </div>
            </div>
            {/* Container Category & Container Type row */}
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  Container Category
                </label>
                <select
                  name="containerCategory"
                  value={formData.containerCategory}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                >
                  <option value="Select">Select Container</option>
                  <option value="Tank">Tank</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  Container Type
                </label>
                <select
                  name="containerType"
                  value={formData.containerType}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
                >
                  <option value="Select">Select Type</option>
                  <option value="ISO Tank">ISO Tank</option>
                </select>
              </div>
            </div>
            {/* Class Type */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                Class Type
              </label>
              <select
                name="classType"
                value={formData.classType}
                onChange={handleChange}
                className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 focus:border-blue-500"
              >
                <option value="Select">Select Type</option>
                <option value="T11">T11</option>
              </select>
            </div>
            {/* Product MSDS Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900 dark:text-white text-sm font-medium">
                    Product MSDS ({msdsRecords.length})
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-neutral-400">(Optional)</span>
                </div>
                <Button
                  type="button"
                  onClick={handleAddMsds}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-md w-6 h-6 flex items-center justify-center text-lg p-0 cursor-pointer"
                >
                  +
                </Button>
              </div>
              <div className="space-y-4">
                {msdsRecords.length === 0 ? (
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded text-center text-gray-500 dark:text-neutral-400 text-sm">
                    No MSDS records added. Click the + button to add one (optional).
                  </div>
                ) : (
                  msdsRecords.map((record) => (
                    <div key={record.id} className="bg-white dark:bg-neutral-800 p-4 rounded">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-gray-700 dark:text-neutral-200 text-xs">MSDS Issue Date</TableHead>
                            <TableHead className="text-gray-700 dark:text-neutral-200 text-xs">MSDS Certificate</TableHead>
                            <TableHead className="text-gray-700 dark:text-neutral-200 text-xs">MSDS Remark</TableHead>
                            <TableHead className="text-gray-700 dark:text-neutral-200 text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <input
                                type="date"
                                value={record.issueDate}
                                onChange={(e) =>
                                  handleMsdsChange(record.id, "issueDate", e.target.value)
                                }
                                className="w-full p-2 bg-white dark:bg-neutral-900 rounded text-gray-900 dark:text-white text-sm border border-neutral-200 dark:border-neutral-700"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <label className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white px-3 py-2 rounded cursor-pointer text-sm border border-neutral-200 dark:border-neutral-700">
                                    Choose File
                                    <input
                                      type="file"
                                      className="hidden cursor-pointer"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        handleMsdsChange(record.id, "certificate", file);
                                      }}
                                    />
                                  </label>
                                  <span className="text-gray-500 dark:text-neutral-400 text-sm">
                                    {record.certificate?.name || "No file chosen"}
                                  </span>
                                </div>
                                
                                {/* Show PDF link if certificate exists and no new file is selected */}
                                {record.certificateName && !record.certificate && (
                                  <a 
                                    href={`http://localhost:8000/uploads/${record.certificateName}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 mt-1 flex items-center"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"></path>
                                      <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path>
                                    </svg>
                                    View PDF: {record.certificateName.split('-').pop()}
                                  </a>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <input
                                type="text"
                                placeholder="Add remarks"
                                value={record.remark}
                                onChange={(e) =>
                                  handleMsdsChange(record.id, "remark", e.target.value)
                                }
                                className="w-full p-2 bg-white dark:bg-neutral-900 rounded text-gray-900 dark:text-white text-sm border border-neutral-200 dark:border-neutral-700"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleDeleteMsds(record.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 cursor-pointer"
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Submit and Cancel buttons */}
            <DialogFooter className="flex justify-center gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-900 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProductForm;