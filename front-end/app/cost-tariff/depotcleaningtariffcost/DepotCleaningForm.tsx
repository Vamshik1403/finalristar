"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const AddTariffModal = ({ onClose, formTitle, form, setForm }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [depots, setDepots] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loadingCode, setLoadingCode] = useState(false);

  // 🟡 Fetch tariff code only if we're creating a new record
  useEffect(() => {
    if (!form.id && !form.tariffCode) {
      setLoadingCode(true);
      
      axios
        .get("http://localhost:8000/depot-cleaning-tariff-cost/next-tariff-code")
        .then((res) => {
          setForm((prevForm: any) => ({
            ...prevForm,
            tariffCode: res.data.nextTariffCode || "RST-DC-DRAFT",
          }));
        })
        .catch((err) => {
          console.error("Failed to fetch tariff code", err);
          // Fallback to a draft code if API fails
          setForm((prevForm: any) => ({
            ...prevForm,
            tariffCode: "RST-DC-DRAFT",
          }));
        })
        .finally(() => setLoadingCode(false));
    } else {
    }
  }, [form.id, form.tariffCode, setForm]);

  // 🟡 Fetch products
  useEffect(() => {
    axios.get("http://localhost:8000/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  // 🟡 Fetch depot terminals
 useEffect(() => {
  axios.get("http://localhost:8000/addressbook").then((res) => {
    const filtered = res.data.filter(
      (a: any) =>
        a.businessType &&
        (a.businessType.includes("Deport Terminal") ||
         a.businessType.includes("CY Terminal"))
    );
    setDepots(filtered);
  });
}, []);


  // 🟡 Fetch currencies
  useEffect(() => {
    axios.get("http://localhost:8000/currency").then((res) => {
      setCurrencies(res.data);
    });
  }, []);

  // 🟡 Set service ports based on selected depot
  useEffect(() => {
    if (!depots.length || !form.addressBookId) return;

    const selectedDepot = depots.find((d) => d.id === form.addressBookId);

    if (selectedDepot) {
      const portList = selectedDepot.businessPorts || [];
      setPorts(portList);

      const hasValidPort = portList.some((bp: any) => bp.port.id === form.portId);

      // ✅ Only reset if current portId is NOT in the list
      if (!hasValidPort && form.portId !== 0) {
        setForm((prev: typeof form) => ({ ...prev, portId: 0 }));
      }
    } else {
      setPorts([]);

      // ❗ Only reset if it's not already 0
      if (form.portId !== 0) {
        setForm((prev: typeof form) => ({ ...prev, portId: 0 }));
      }
    }
  }, [form.addressBookId, depots]);

  // When depotTerminalId changes, update portOptions
  useEffect(() => {
    if (form?.depotTerminalId) {
      const selectedDepot = depots.find(
        (a: any) => a.id === parseInt(form.depotTerminalId)
      );
      // If businessPorts is [{ port: { id, portName } }, ...]
      const ports = selectedDepot?.businessPorts?.map((bp: any) => bp.port) || [];
      setPorts(ports);
    } else {
      setPorts([]);
    }
  }, [form?.depotTerminalId, depots]);

  // When editing, ensure ports are set for the selected depot and portId is set
  useEffect(() => {
    // When editing, ensure ports are set for the selected depot and portId is set
    if (form.id && form.addressBookId) {
      const selectedDepot = depots.find((d) => d.id === form.addressBookId);
      if (selectedDepot) {
        const portList = selectedDepot.businessPorts || [];
        setPorts(portList);
        // If the current portId is not in the list, reset it
        const hasValidPort = portList.some((bp: any) => bp.port.id === form.portId);
        if (!hasValidPort && form.portId !== 0) {
          setForm((prev: typeof form) => ({ ...prev, portId: 0 }));
        }
      }
    }
  }, [form.id, form.addressBookId, depots]);

  // ✅ Handle form submit (create or patch based on `form.id`)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Better validation - check for undefined/null or zero
    if (
      form.productId === undefined || form.productId === null || form.productId <= 0 ||
      form.addressBookId === undefined || form.addressBookId === null || form.addressBookId <= 0 ||
      form.portId === undefined || form.portId === null || form.portId <= 0 ||
      form.currencyId === undefined || form.currencyId === null || form.currencyId <= 0
    ) {
      // Log the form values to see what's actually failing
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      status: form.status,
      tariffCode: form.tariffCode,
      productId: Number(form.productId),
      addressBookId: Number(form.addressBookId),
      portId: Number(form.portId),
      currencyId: Number(form.currencyId),
      cleaningCharges: String(form.cleaningCharges || "0"),
    };

    try {
      const url = "http://localhost:8000/depot-cleaning-tariff-cost";
      let response;
      
      if (form.id) {
        response = await axios.patch(`${url}/${form.id}`, payload);
      } else {
        response = await axios.post(url, payload);
      }

      alert("Form submitted successfully");
      onClose(); // This will trigger the table refresh through the callback
    } catch (err: any) {
      console.error("❌ Error submitting form:", err);
      console.error("Error details:", err.response?.data);
      
      // Show more helpful error message
      const errorMessage = err.response?.data?.message || "Failed to submit form";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <Dialog open onOpenChange={onClose} modal={true}>
      <DialogContent className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800 p-0" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-white">{formTitle}</DialogTitle>
        </DialogHeader>

        <form className="px-6 pb-6 pt-2" onSubmit={handleSubmit}>
          {/* Status */}
          <div className="mb-4 flex items-center">
            <Label htmlFor="status" className="block text-neutral-900 dark:text-white mb-1 mr-2">Status</Label>
            <Checkbox
              id="status"
              checked={form.status === "active"}
              onCheckedChange={(checked) =>
                setForm({ ...form, status: checked ? "active" : "inactive" })
              }
              className="data-[state=checked]:bg-blue-600"
            />
            <Label htmlFor="status" className="ml-2 text-neutral-900 dark:text-white">
              {form.status === "active" ? "Active" : "Inactive"}
            </Label>
          </div>

          {/* Tariff Code */}
          <div className="mb-4">
            <Label htmlFor="tariffCode" className="block text-neutral-900 dark:text-white mb-1">Tariff Code</Label>
            <Input
              id="tariffCode"
              type="text"
              value={loadingCode ? "Loading..." : form.tariffCode || ""}
              readOnly
              className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white border border-neutral-700"
            />
          </div>

          {/* Product */}
          <div className="mb-4">
            <Label htmlFor="product" className="block text-neutral-900 dark:text-white mb-1">Product</Label>
            <Select
              value={form.productId?.toString() || "0"}
              onValueChange={(value) => setForm({ ...form, productId: Number(value) })}
            >
              <SelectTrigger className="w-full bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white border border-neutral-700">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white border border-neutral-700">
                <SelectItem value="0">Select Product</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.productName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Depot Terminal */}
         <div className="mb-4">
  <Label htmlFor="depot" className="block text-neutral-900 dark:text-white mb-1">Depot Terminal</Label>
  <Select
    value={form.addressBookId?.toString() || "0"}
    onValueChange={(value) => setForm({ ...form, addressBookId: Number(value) })}
  >
    <SelectTrigger className="w-full bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white border border-neutral-700">
      <SelectValue placeholder="Select Depot Terminal" />
    </SelectTrigger>
    <SelectContent className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white border border-neutral-700">
      <SelectItem value="0">Select Depot Terminal</SelectItem>
      {depots.map((d) => (
        <SelectItem key={d.id} value={d.id.toString()}>
          {d.companyName} - {d.businessType}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


          {/* Service Port */}
          <div className="mb-4">
            <Label htmlFor="port" className="block text-neutral-900 dark:text-white mb-1">Service Port</Label>
            <Select
              value={form.portId?.toString() || "0"} 
              onValueChange={(value) => setForm({ ...form, portId: Number(value) })}
            >
              <SelectTrigger className="w-full bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white border border-neutral-700">
                <SelectValue placeholder="Select Port" />
              </SelectTrigger>
              <SelectContent className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white border border-neutral-700">
                <SelectItem value="0">Select Port</SelectItem>
                {ports.map((bp) => (
                  <SelectItem key={bp.port?.id} value={bp.port?.id?.toString() || "0"}>
                    {bp.portName || bp.port?.portName} {bp.portLongName ? `(${bp.portLongName})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div className="mb-4">
            <Label htmlFor="currency" className="block text-neutral-900 dark:text-white mb-1">Currency</Label>
            <Select
              value={form.currencyId?.toString() || "0"}
              onValueChange={(value) => setForm({ ...form, currencyId: Number(value) })}
            >
              <SelectTrigger className="w-full bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white border border-neutral-700">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white border border-neutral-700">
                <SelectItem value="0">Select Currency</SelectItem>
                {currencies.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.currencyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cleaning Charges */}
          <div className="mb-6">
            <Label htmlFor="cleaningCharges" className="block text-neutral-900 dark:text-white mb-1">Cleaning Charges</Label>
            <Input
              id="cleaningCharges"
              type="text"
              value={form.cleaningCharges}
              onChange={(e) =>
                setForm({ ...form, cleaningCharges: (e.target.value) })
              }
              className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white border border-neutral-700"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-700 text-white hover:bg-blue-600"
            >
              {form.id ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTariffModal;
