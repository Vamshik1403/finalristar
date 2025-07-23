"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AddTariffModal = ({
  onClose,
  formTitle,
  form,
  setForm,
  fetchTariffs,
}: any) => {
  const [addressBookList, setAddressBookList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [portOptions, setPortOptions] = useState([]);

  const tariffFields = [
    { key: "manlidPTFE", label: "MANLID PTFE" },
    { key: "leakTest", label: "Leak Test" },
    { key: "loadOnLoadOff", label: "Load On Load Off" },
    { key: "cleaningSurvey", label: "Cleaning Survey" },
    { key: "maintenanceAndRepair", label: "Maintenance and Repair" },
  ];

  // Initialize status to Active by default when component loads
  useEffect(() => {
    // Only set status if not already set
    if (!form.status) {
      setForm((prev: any) => ({
        ...prev,
        status: "Active" // Set status to Active by default
      }));
    }
  }, []);

  // Always fetch dropdown data
  useEffect(() => {
    axios.get("http://localhost:8000/addressbook").then((res) => {
      // Change from exact match to includes match
      const terminals = res.data.filter(
       (a: any) =>
        a.businessType &&
        (a.businessType.includes("Deport Terminal") ||
         a.businessType.includes("CY Terminal"))
    );
      setAddressBookList(terminals);
    });

    axios.get("http://localhost:8000/currency").then((res) => {
      setCurrencyList(res.data);
    });
  }, []);

  // Initialize form with default values for new form
  useEffect(() => {
    if (!form?.tariffCode) {
      axios
        .get("http://localhost:8000/depot-avg-tariff/next-tariff-code")
        .then((res) => {
          setForm({
            ...form,
            status: "Active", // Set to Active by default
            tariffCode: res.data.nextTariffCode,
          });
        })
        .catch(() => {
          setForm({
            ...form,
            status: "Active", // Set to Active by default
            tariffCode: "PENDING-CODE",
          });
        });
    }
  }, [form?.tariffCode]);

  // Update port options when depot changes
  useEffect(() => {
    if (form?.depotTerminalId) {
      const selectedDepot: any = addressBookList.find(
        (a: any) => a.id === parseInt(form.depotTerminalId)
      );
      const ports = selectedDepot?.businessPorts?.map((bp: any) => bp.port) || [];
      setPortOptions(ports);
    } else {
      setPortOptions([]);
    }
  }, [form?.depotTerminalId, addressBookList]);

  // Auto calculate total when tariff fields change
  useEffect(() => {
    const total = tariffFields.reduce((sum, field) => {
      const value = Number(form[field.key]) || 0;
      return sum + value;
    }, 0);
    setForm((prev: any) => ({ ...prev, total }));
  }, [
    form.manlidPTFE,
    form.leakTest,
    form.loadOnLoadOff,
    form.cleaningSurvey,
    form.maintenanceAndRepair,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!form.depotTerminalId) {
      alert("Please select a Depot Terminal");
      return;
    }

    if (!form.servicePort) {
      alert("Please select a Service Port");
      return;
    }

    if (!form.currency) {
      alert("Please select a Currency");
      return;
    }

    try {
      const payload = {
        status: form.status || "Active", // Default to "Active" if status is not set
        tariffCode: form.tariffCode || "PENDING-CODE",
        addressBookId: parseInt(form.depotTerminalId),
        portId: parseInt(form.servicePort),
        currencyId: parseInt(form.currency),
        manlidPTFE: form.manlidPTFE || "0",
        leakTest: form.leakTest || "0",
        loadOnLoadOff: form.loadOnLoadOff || "0",
        cleaningSurvey: form.cleaningSurvey || "0",
        maintenanceAndRepair: form.maintenanceAndRepair || "0",
        total: form.total || "0",
      };

      if (form?.id) {
        await axios.patch(
          `http://localhost:8000/depot-avg-tariff/${form.id}`,
          payload
        );
      } else {
        await axios.post(
          "http://localhost:8000/depot-avg-tariff",
          payload
        );
      }

      if (typeof fetchTariffs === "function") fetchTariffs();
      onClose();
    } catch (error) {
      alert("Error submitting form");
    }
  };

  return (
    <Dialog open onOpenChange={onClose} modal={true}>
    <DialogContent className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800 p-0" onInteractOutside={e => e.preventDefault()}>
        <DialogTitle className="sr-only">{formTitle}</DialogTitle>
        <form className="px-6 pb-6 pt-2" onSubmit={handleSubmit}>
          <div className="flex justify-between items-center pt-6 pb-2 border-b border-neutral-800">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{formTitle}</h2>
            {/* Removed duplicate X close button here */}
          </div>
          <div className="flex items-center gap-2 mb-4 mt-4">
            <Label className="text-neutral-900 dark:text-white text-sm">Status</Label>
            <Input
              type="checkbox"
              checked={form.status === "Active" || form.status === true || form.status === "true"}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.checked ? "Active" : "Inactive",
                })
              }
              className="accent-blue-500 w-4 h-4 ml-2"
              id="status"
            />
            <Label htmlFor="status" className="text-neutral-900 dark:text-white text-sm">
              Active
            </Label>
            <p className="text-xs text-neutral-500 dark:text-neutral-300 mt-1">
              Current status: <span className="font-medium">{form.status}</span>
            </p>
          </div>

          <div className="mb-4">
            <Label className="block text-xs text-neutral-900 dark:text-white mb-1">Tariff Code</Label>
            <Input
              type="text"
              value={form.tariffCode || ""}
              readOnly
              className="w-full bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-700"
            />
            <p className="text-neutral-500 dark:text-white text-xs mt-1">
              <b>Note:</b> A tariff code in format RST-DAT-00001 will be auto-generated.
            </p>
          </div>

         <div className="grid grid-cols-1 gap-y-4">
  <div>
    <Label className="block text-xs text-neutral-900 dark:text-white mb-1">Depot Terminal Name</Label>
    <select
      value={form.depotTerminalId || ""}
      onChange={(e) =>
        setForm({
          ...form,
          depotTerminalId: e.target.value,
          servicePort: "",
        })
      }
      className="w-full p-2 bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-700 text-sm"
    >
      <option value="">Select</option>
      {addressBookList.map((d: any) => (
        <option key={d.id} value={d.id}>
          {d.companyName} - {d.businessType}
        </option>
      ))}
    </select>
  </div>


            <div>
              <Label className="block text-xs text-neutral-900 dark:text-white mb-1">Service Port</Label>
              <select
                value={form.servicePort || ""}
                onChange={(e) =>
                  setForm({ ...form, servicePort: e.target.value })
                }
                className="w-full p-2 bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-700 text-sm"
              >
                <option value="">Select a Depot Terminal first</option>
                {portOptions.map((port: any) => (
                  <option key={port.id} value={port.id}>
                    {port.portName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="block text-xs text-neutral-900 dark:text-white mb-1">Currency</Label>
              <select
                value={form.currency || ""}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value })
                }
                className="w-full p-2 bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-700 text-sm"
              >
                <option value="">Select</option>
                {currencyList.map((cur: any) => (
                  <option key={cur.id} value={cur.id}>
                    {cur.currencyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <Label className="block text-xs text-neutral-900 dark:text-white mb-2">Tariff Rates</Label>
            <div className="grid grid-cols-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold text-sm px-4 py-2 rounded-t">
              <div>Tariff Type</div>
              <div>Charge Amount</div>
            </div>
            <div className="space-y-2 bg-neutral-100 dark:bg-neutral-900 p-4 rounded-b">
              {tariffFields.map(({ key, label }) => (
                <div key={key} className="grid grid-cols-2 items-center gap-4">
                  <Label className="text-neutral-900 dark:text-white text-xs">{label}</Label>
                  <Input
                    type="text"
                    value={form[key] || ""}
                    onChange={(e) =>
                      setForm({ ...form, [key]: Number(e.target.value) })
                    }
                    className="w-full bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-700"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4">
              <Label className="text-neutral-900 dark:text-white w-[200px] ml-5 text-xs">Total</Label>
              <Input
                type="text"
                value={form.total || 0}
                readOnly
                className="w-full bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-neutral-800 text-white rounded hover:bg-neutral-700 border border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-700 text-white rounded hover:bg-blue-800 font-semibold"
            >
              {form?.id ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTariffModal;