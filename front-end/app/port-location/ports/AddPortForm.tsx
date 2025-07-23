"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PortFormProps {
  onClose: () => void;
  editData?: any;
  isEditMode?: boolean;
}

interface Currency {
  id: number;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  status: string;
}

interface Country {
  id: number;
  countryCode: string;
  countryName: string;
  regions: string;
  currencyId: number;
  currency: Currency;
}

const AddPortForm: React.FC<PortFormProps> = ({ onClose, editData, isEditMode }) => {
  const [formData, setFormData] = useState({
    portType: "Main",
    portCode: "",
    portName: "",
    portLongName: "",
    status: "Active",
    countryId: 0,
    currencyId: 0,
    parentPortId: undefined as number | undefined,
  });
  
  const [parentPorts, setParentPorts] = useState<any[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    axios.get("http://localhost:8000/country")
      .then((res) => setCountries(res.data))
      .catch((err) => console.error("Failed to fetch countries:", err));
  }, []);

  useEffect(() => {
    if (formData.portType === "ICD") {
      axios.get("http://localhost:8000/ports")
        .then((res) => {
          const mainPorts = res.data.filter((port: any) => port.portType === "Main");
          setParentPorts(mainPorts);
        })
        .catch((err) => console.error("Error fetching ports:", err));
    }
  }, [formData.portType]);

  useEffect(() => {
    if (editData) {
      setFormData({
        portType: editData.portType,
        portCode: editData.portCode,
        portName: editData.portName,
        portLongName: editData.portLongName,
        status: editData.status,
        countryId: editData.countryId,
        currencyId: editData.currencyId,
        parentPortId: editData.parentPortId || undefined,
      });
      
      // Set the currency when edit data is loaded
      if (editData.currencyId && countries.length > 0) {
        const selectedCountry = countries.find((c: any) => c.id === editData.countryId);
        if (selectedCountry?.currency) {
          setSelectedCurrency(selectedCountry.currency);
        }
      }
    }
  }, [editData, countries]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let updatedFormData = {
      ...formData,
      [name]:
        name === "countryId" || name === "currencyId" || name === "parentPortId"
          ? Number(value)
          : value,
    };

    if (name === "countryId") {
      const selected = countries.find((c: any) => c.id === parseInt(value));
      if (selected?.currency) {
        updatedFormData.currencyId = selected.currency.id;
        setSelectedCurrency(selected.currency);
      } else {
        updatedFormData.currencyId = 0;
        setSelectedCurrency(null);
      }
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.countryId || !formData.currencyId || (formData.portType === "ICD" && !formData.parentPortId)) {
      alert("Please fill required fields.");
      return;
    }

    const portData = {
      portType: formData.portType,
      portCode: formData.portCode,
      portName: formData.portName,
      portLongName: formData.portLongName,
      status: formData.status,
      countryId: formData.countryId,
      currencyId: formData.currencyId,
      parentPortId: formData.portType === "ICD" ? formData.parentPortId : null,
    };

    try {
      if (isEditMode && editData?.id) {
        await axios.patch(`http://localhost:8000/ports/${editData.id}`, portData);
      } else {
        await axios.post("http://localhost:8000/ports", portData);
      }
      onClose();
    } catch (error: any) {
      if (error.response?.status === 409 || (error.response?.data?.message && error.response.data.message.includes('already exists'))) {
        alert('Port with this name already exists!');
        onClose(); // Close the form/modal after alert
      } else {
        alert("Server error: " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg">
      <Dialog open onOpenChange={onClose} modal={true}>
        <DialogContent className="max-w-xl w-full bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-0 border border-neutral-200 dark:border-neutral-800" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Port" : "Add Port"}
            </DialogTitle>
            {/* Removed duplicate X close button here */}
          </DialogHeader>
          <form className="px-6 pb-6 pt-2" onSubmit={handleSubmit}>
            {/* Port Type */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">Port Type</label>
              <select
                name="portType"
                value={formData.portType}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
              >
                <option value="Main">Main</option>
                <option value="ICD">ICD</option>
              </select>
            </div>
            {/* Port Code */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">Port Code</label>
              <Input
                type="text"
                name="portCode"
                value={formData.portCode}
                onChange={handleChange}
                placeholder="Enter Port Code"
                required
                className="w-full bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-gray-400 dark:placeholder-neutral-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Port Name */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">Port Name</label>
              <Input
                type="text"
                name="portName"
                value={formData.portName}
                onChange={handleChange}
                placeholder="Enter Port Name"
                required
                className="w-full bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-gray-400 dark:placeholder-neutral-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Port Long Name */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">Port Long Name</label>
              <Input
                type="text"
                name="portLongName"
                value={formData.portLongName}
                onChange={handleChange}
                placeholder="Enter Port Long Name"
                className="w-full bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-gray-400 dark:placeholder-neutral-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Country */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">Country</label>
              <select
                name="countryId"
                value={formData.countryId || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
                required
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.countryName}
                  </option>
                ))}
              </select>
            </div>
            {/* Currency (auto-filled) */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">Currency</label>
              <select
                name="currencyId"
                value={formData.currencyId || ""}
                onChange={handleChange}
                disabled
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 opacity-70 cursor-not-allowed"
                required
              >
                <option value="">
                  {selectedCurrency ? selectedCurrency.currencyName : "Select Country First"}
                </option>
                {selectedCurrency && (
                  <option value={selectedCurrency.id}>
                    {selectedCurrency.currencyName}
                  </option>
                )}
              </select>
            </div>
            {/* Parent Port (Only for ICD) */}
            {formData.portType === "ICD" && (
              <div className="mb-4">
                <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">
                  Parent Port (Only for ICD)
                </label>
                <select
                  name="parentPortId"
                  value={formData.parentPortId || 0}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-700"
                >
                  <option value={0}>Select Parent Port</option>
                  {parentPorts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.portName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 dark:text-neutral-200 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            {/* Buttons */}
            <DialogFooter className="flex justify-end gap-3 mt-8">
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
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

export default AddPortForm;

