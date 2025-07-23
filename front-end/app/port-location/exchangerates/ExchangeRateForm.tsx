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

interface Currency {
  id: number;
  currencyName: string;
  currencyCode: string;
}

interface AddExchangeRateFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
}

const ExchangeRateForm: React.FC<AddExchangeRateFormProps> = ({
  onClose,
  onSuccess,
  editData,
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [dollarCurrencyId, setDollarCurrencyId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fromCurrencyId: 0,
    toCurrencyId: 0,
    exchangeRate: "",
    date: "",
    variance: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:8000/currency")
      .then((res) => {
        setCurrencies(res.data);
        // Find Dollar currency ID
        const dollarCurrency = res.data.find(
          (currency: Currency) => currency.currencyCode === "USD"
        );
        if (dollarCurrency) {
          setDollarCurrencyId(dollarCurrency.id);
          // Set toCurrencyId to Dollar by default
          setFormData(prev => ({
            ...prev,
            toCurrencyId: dollarCurrency.id
          }));
        }
      })
      .catch((err) => console.error("Failed to load currencies", err));
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        fromCurrencyId: editData.fromCurrencyId || 0,
        toCurrencyId: dollarCurrencyId || editData.toCurrencyId || 0, // Prefer dollarCurrencyId
        exchangeRate: editData.exchangeRate || "",
        date: editData.date ? editData.date.slice(0, 10) : "",
        variance: editData.variance || "",
      });
    }
  }, [editData, dollarCurrencyId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("CurrencyId") ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fromCurrencyId: Number(formData.fromCurrencyId),
      toCurrencyId: Number(formData.toCurrencyId),
      exchangeRate: String(formData.exchangeRate),
      date: new Date(formData.date).toISOString(),
      variance: formData.variance ? String(formData.variance) : undefined,
    };

    try {
      if (editData) {
        await axios.patch(
          `http://localhost:8000/exchange-rates/${editData.id}`,
          payload
        );
      } else {
        await axios.post("http://localhost:8000/exchange-rates", payload);
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
              {editData ? "Edit Exchange Rate" : "Add Exchange Rate"}
            </DialogTitle>
            {/* Removed duplicate X close button here */}
          </DialogHeader>
          <form className="px-6 pb-6 pt-2" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="fromCurrencyId" className="block text-gray-700 dark:text-neutral-200 mb-1">
                From Currency
              </label>
              <select
                id="fromCurrencyId"
                name="fromCurrencyId"
                value={formData.fromCurrencyId}
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
            <div className="mb-4">
              <label htmlFor="toCurrencyId" className="block text-gray-700 dark:text-neutral-200 mb-1">
                To Currency
              </label>
              <select
                id="toCurrencyId"
                name="toCurrencyId"
                value={formData.toCurrencyId}
                disabled
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 text-sm transition-all opacity-70 cursor-not-allowed"
                required
              >
                {dollarCurrencyId ? (
                  <option value={dollarCurrencyId}>
                    {currencies.find(c => c.id === dollarCurrencyId)?.currencyName || "DOLLAR"} 
                    ({currencies.find(c => c.id === dollarCurrencyId)?.currencyCode || "USD"})
                  </option>
                ) : (
                  <option value={0}>DOLLAR (USD)</option>
                )}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="exchangeRate" className="block text-gray-700 dark:text-neutral-200 mb-1">
                Exchange Rate
              </label>
              <Input
                id="exchangeRate"
                type="text"
                name="exchangeRate"
                value={formData.exchangeRate}
                onChange={handleChange}
                placeholder="Enter exchange rate"
                required
                className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-gray-400 dark:placeholder-neutral-400"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="date" className="block text-gray-700 dark:text-neutral-200 mb-1">
                Date
              </label>
              <Input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="variance" className="block text-gray-700 dark:text-neutral-200 mb-1">
                Variance (%)
              </label>
              <Input
                id="variance"
                type="text"
                name="variance"
                value={formData.variance}
                onChange={handleChange}
                placeholder="Enter variance percentage"
                required
                className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-gray-400 dark:placeholder-neutral-400"
              />
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

export default ExchangeRateForm;