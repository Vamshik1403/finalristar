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
  handleSuccess,
}: any) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [handlingAgents, setHandlingAgents] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://localhost:8000/addressbook").then((res) => {
      // Change from exact match to includes match
      const filtered = res.data.filter(
        (agent: any) => agent.businessType && agent.businessType.includes("Handling Agent")
      );
      setHandlingAgents(filtered);
    });

    axios.get("http://localhost:8000/currency").then((res) => {
      setCurrencies(res.data);
    });

    if (form?.id) {
      setIsEditMode(true);
    } else {
      // Set status to true (Active) by default if not in edit mode
      setForm((prev: any) => ({ ...prev, status: true }));
      axios
        .get("http://localhost:8000/handling-agent-tariff-cost/next-tariff-code")
        .then((res) =>
          setForm((prev: any) => ({
            ...prev,
            tariffCode: res.data.nextTariffCode || "RST-HA-DRAFT",
          }))
        )
        .catch(() => {
          setForm((prev: any) => ({
            ...prev,
            tariffCode: "RST-HA-DRAFT",
          }));
        });
    }
  }, []);

  useEffect(() => {
    const agent = handlingAgents.find(
      (a) => a.id === parseInt(form.handlingAgentName)
    );
    if (agent) {
      const extractedPorts = agent.businessPorts.map((bp: any) => ({
        portId: bp.port.id,
        portName: bp.port.portName,
      }));
      setPorts(extractedPorts);
    } else {
      setPorts([]);
    }
  }, [form.handlingAgentName, handlingAgents]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      status: form.status ? "Active" : "Inactive",
      tariffCode: form.tariffCode,
      addressBookId: Number(form.handlingAgentName),
      portId: Number(form.servicePort),
      currencyId: Number(form.currency),
      impCommission: String(form["IMP Commission"] || "0"),
      expCommission: String(form["EXP Commission"] || "0"),
      transhipmentCommission: String(form["Transhipment Commission"] || "0"),
      emptyRepoCommission: String(form["Empty Repo Commission"] || "0"),
      detentionCommission: String(form["Detention Commission"] || "0"),
    };

    try {
      if (isEditMode) {
        await axios.patch(
          `http://localhost:8000/handling-agent-tariff-cost/${form.id}`,
          payload
        );
      } else {
        await axios.post("http://localhost:8000/handling-agent-tariff-cost", payload);
      }
      handleSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  const tariffFields = [
    "IMP Commission",
    "EXP Commission",
    "Transhipment Commission",
    "Empty Repo Commission",
    "Detention Commission",
  ];

  return (
    <Dialog open onOpenChange={onClose} modal={true}>
      <DialogContent className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800 p-0" onInteractOutside={e => e.preventDefault()}>
        <DialogTitle className="sr-only">{formTitle}</DialogTitle>
        <form className="px-6 pb-6 pt-2 [&_label]:text-neutral-900 [&_input]:bg-white [&_input]:text-neutral-900 [&_select]:bg-white [&_select]:text-neutral-900 dark:[&_label]:text-white dark:[&_input]:bg-neutral-800 dark:[&_input]:text-white dark:[&_select]:bg-neutral-800 dark:[&_select]:text-white" onSubmit={handleSubmit}>
          <div className="flex justify-between items-center pt-6 pb-2 border-b border-neutral-800">
               <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{formTitle}</h2>
               {/* Removed duplicate X close button here */}
          </div>

          <div className="flex items-center gap-2 mb-4 mt-4">
            <Label className="text-neutral-900 dark:text-white text-sm">Status</Label>
            <Input
              type="checkbox"
              checked={form.status === true || form.status === 'Active'}
              onChange={(e) => setForm({ ...form, status: e.target.checked })}
              className="accent-blue-500 w-4 h-4 ml-2"
              id="status"
            />
            <Label htmlFor="status" className="text-neutral-900 dark:text-white text-sm">
              Active
            </Label>
            <p className="text-xs text-neutral-500 dark:text-neutral-300 mt-1">
              Current status: <span className="font-medium">{form.status ? "Active" : "Inactive"}</span>
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
          </div>

          <div className="grid grid-cols-1 gap-y-4">
            <div>
              <Label className="block text-xs text-neutral-900 dark:text-white mb-1">Handling Agent</Label>
              <select
                value={form.handlingAgentName || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    handlingAgentName: e.target.value,
                    servicePort: "",
                  })
                }
                className="w-full p-2 bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-700 text-sm"
              >
                <option value="">Select</option>
                {handlingAgents.map((agent: any) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.companyName}
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
                <option value="">Select a Handling Agent first</option>
                {ports.map((port: any) => (
                  <option key={port.portId} value={port.portId}>
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
                {currencies.map((currency: any) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.currencyName}
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
              {tariffFields.map((label) => (
                <div key={label} className="grid grid-cols-2 items-center gap-4">
                  <Label className="text-neutral-900 dark:text-white text-xs">{label}</Label>
                  <Input
                    type="text"
                    value={form[label] || ""}
                    onChange={(e) =>
                      setForm({ ...form, [label]: e.target.value })
                    }
                    className="w-full bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-700"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-white rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-700 text-white rounded hover:bg-blue-800 font-semibold"
            >
              {isEditMode ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTariffModal;
