"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AddTariffModal = ({ onClose, formTitle, form, setForm, fetchTariffs }: any) => {
  const [addressBookList, setAddressBookList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);

  useEffect(() => {
    if (!form?.id) {
      axios
        .get("http://localhost:8000/land-transport-tariff/next-tariff-code")
        .then((res) =>
          setForm((prev: any) => ({ ...prev, landTransportTariffCode: res.data.nextTariffCode }))
        )
        .catch(() =>
          setForm((prev: any) => ({ ...prev, landTransportTariffCode: "RST-LT-DRAFT" }))
        );
    }

    // Update this filter to use includes() instead of exact match
    axios.get("http://localhost:8000/addressbook").then((res) => {
      // Get companies that have "Land Transport" in their businessType field
      const filtered = res.data.filter(
        (c: any) => c.businessType && c.businessType.includes("Land Transport")
      );
      setAddressBookList(filtered);
    });

    axios.get("http://localhost:8000/currency").then((res) => setCurrencyList(res.data));
  }, [form?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      { key: "landTransportTariffCode", name: "Tariff Code" },
      { key: "addressBookId", name: "Transport Company" },
      { key: "transportType", name: "Transport Type" },
      { key: "from", name: "From Location" },
      { key: "to", name: "To Location" },
      { key: "distance", name: "Distance" },
      { key: "currencyId", name: "Currency" },
      { key: "amount", name: "Amount" },
    ];

    for (const field of requiredFields) {
      if (!form[field.key] || form[field.key] === "") {
        alert(`${field.name} is required`);
        return;
      }
    }

    try {
      const payload = {
        landTransportTariffCode: form.landTransportTariffCode,
        transportType: form.transportType,
        from: form.from,
        to: form.to,
        distance: form.distance,
        amount: form.amount,
        approvalStatus: form.approvalStatus,
        addressBookId: Number(form.addressBookId),
        currencyId: Number(form.currencyId),
      };

      if (form?.id) {
        await axios.patch(`http://localhost:8000/land-transport-tariff/${form.id}`, payload);
      } else {
        await axios.post("http://localhost:8000/land-transport-tariff", payload);
      }

      fetchTariffs();
      onClose();
    } catch (error: any) {
      alert("Submission failed. Check console.");
      console.error("Submission Error:", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose} modal={true}>
    <DialogContent className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800 p-0" onInteractOutside={e => e.preventDefault()}>
        <DialogTitle className="sr-only">{formTitle}</DialogTitle>
        <form className="px-6 pb-6 pt-2" onSubmit={handleSubmit}>
          <div className="flex justify-between items-center pt-6 pb-2 border-b border-neutral-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{formTitle}</h2>
            {/* Removed duplicate X close button here */}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2">
              <Label className="text-xs text-gray-900 dark:text-white">Land Transport Tariff Code</Label>
              <Input readOnly value={form.landTransportTariffCode || ""} className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700" />
            </div>

            <div className="col-span-2">
              <Label className="text-xs text-gray-900 dark:text-white">Transport Company</Label>
              <select
                value={form.addressBookId || ""}
                onChange={(e) => setForm({ ...form, addressBookId: e.target.value })}
                className="w-full p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 text-sm"
              >
                <option value="">Select Company</option>
                {addressBookList.map((company: any) => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <Label className="text-xs text-gray-900 dark:text-white">Transport Type</Label>
              <select
                value={form.transportType}
                onChange={(e) => setForm({ ...form, transportType: e.target.value })}
                className="w-full p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 text-sm"
              >
                <option value="">Select</option>
                <option value="Road">Road</option>
                <option value="Rail">Rail</option>
              </select>
            </div>

            <div>
              <Label className="text-xs text-gray-900 dark:text-white">From</Label>
              <Input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700" />
            </div>

            <div>
              <Label className="text-xs text-gray-900 dark:text-white">To</Label>
              <Input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700" />
            </div>

            <div>
              <Label className="text-xs text-gray-900 dark:text-white">Distance</Label>
              <Input value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700" />
            </div>

            <div>
              <Label className="text-xs text-gray-900 dark:text-white">Currency</Label>
              <select
                value={form.currencyId || ""}
                onChange={(e) => setForm({ ...form, currencyId: e.target.value })}
                className="w-full p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 text-sm"
              >
                <option value="">Select Currency</option>
                {currencyList.map((currency: any) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.currencyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <Label className="text-xs text-gray-900 dark:text-white">Amount</Label>
              <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-neutral-200 dark:border-neutral-700" />
            </div>

            <div className="col-span-2">
              <Label className="text-xs text-gray-900 dark:text-white">Approval Status</Label>
              <select
                value={form.approvalStatus}
                onChange={(e) => setForm({ ...form, approvalStatus: e.target.value })}
                className="w-full p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button type="button" variant="outline" onClick={onClose} className="bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-700 text-white hover:bg-blue-800 font-semibold">
              {form?.id ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTariffModal;
