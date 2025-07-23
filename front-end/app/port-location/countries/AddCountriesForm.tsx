"use client";

import React, { useState, useEffect } from "react";
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

interface AddCountryFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
}

interface Currency {
  id: number;
  currencyName: string;
  currencyCode: string;
}

const AddCountryForm: React.FC<AddCountryFormProps> = ({
  onClose,
  onSuccess,
  editData,
}) => {
  const [formData, setFormData] = useState({
    countryCode: "",
    countryName: "",
    regions: "",
    currencyId: 1,
    status: true,
  });

  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Pre-fill form if editing
  useEffect(() => {
    if (editData) {
      setFormData({
        countryCode: editData.countryCode || "",
        countryName: editData.countryName || "",
        regions: editData.regions || "",
        currencyId: editData.currencyId || 1,
        status: JSON.parse(
          localStorage.getItem(`country-status-${editData.countryCode}`) ?? "true"
        ),
      });
    }
  }, [editData]);

  // Load currencies
  useEffect(() => {
    axios
      .get("http://localhost:8000/currency")
      .then((res) => setCurrencies(res.data))
      .catch((err) => console.error("Failed to fetch currencies", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (target as HTMLInputElement).checked
          : name === "currencyId"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save status to localStorage for UI display
    localStorage.setItem(
      `country-status-${formData.countryCode}`,
      JSON.stringify(formData.status)
    );

    // Prepare data without status for backend
    const { status, ...dataWithoutStatus } = formData;

    try {
      if (editData) {
        await axios.patch(
          `http://localhost:8000/country/${editData.id}`,
          dataWithoutStatus
        );
      } else {
        await axios.post("http://localhost:8000/country", dataWithoutStatus);
      }
      onClose();
      onSuccess?.();
    } catch (error: any) {
      alert(
        "Error: " +
          (error.response?.data?.message ||
            error.message ||
            "Unknown error occurred")
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg">
      <Dialog open onOpenChange={onClose} modal={true}>
        <DialogContent className="max-w-xl w-full bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-0 border border-neutral-200 dark:border-neutral-800" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {editData ? "Edit Country" : "Add Country"}
            </DialogTitle>
            {/* Removed duplicate X close button here */}
          </DialogHeader>
          <form className="px-6 pb-6 pt-2" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="countryCode"
                className="block text-gray-700 dark:text-neutral-200 mb-1"
              >
                Country Code
              </label>
              <Input
                id="countryCode"
                type="text"
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                placeholder="Country Code"
                required
                className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-gray-400 dark:placeholder-neutral-400"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="countryName"
                className="block text-gray-700 dark:text-neutral-200 mb-1"
              >
                Country Name
              </label>
              <Input
                id="countryName"
                type="text"
                name="countryName"
                value={formData.countryName}
                onChange={handleChange}
                placeholder="Country Name"
                required
                className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-gray-400 dark:placeholder-neutral-400"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="regions" className="block text-gray-700 dark:text-neutral-200 mb-1">
                Region
              </label>
              <select
                id="regions"
                name="regions"
                value={formData.regions}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 text-sm transition-all focus:ring-2 focus:ring-blue-400 cursor-pointer"
              >
                <option value="">Select Region</option>
                <option value="AFRICA">AFRICA</option>
                <option value="EUROPE">EUROPE</option>
                <option value="ISC/ME">ISC/ME</option>
                <option value="NORTH AMERICA">NORTH AMERICA</option>
                <option value="NORTH ASIA">NORTH ASIA</option>
                <option value="OCEANIA">OCEANIA</option>
                <option value="SEA">SEA</option>
                <option value="SOUTH AMERICA">SOUTH AMERICA</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="currencyId" className="block text-gray-700 dark:text-neutral-200 mb-1">
                Currency
              </label>
              <select
                id="currencyId"
                name="currencyId"
                value={formData.currencyId}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 text-sm transition-all focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value={0}>Select Currency</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.currencyName} ({currency.currencyCode})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="accent-blue-600 w-4 h-4"
              />
              <label htmlFor="status" className="text-gray-700 dark:text-neutral-200 text-sm">
                Active
              </label>
            </div>
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
                {editData ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCountryForm;
