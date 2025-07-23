"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

type Option = { id: string | number; name: string };
type SelectOptions = {
  customer: Option[];
  product: Option[];
  port: Option[];
  agent: Option[];
  depot: Option[];
  shippingTerm: Option[];
};

type ContainerItem = {
  containerNumber: string;
  capacity: string;
  tare: string;
  inventoryId: number | null;
  portId: number | null;
  port: { portName: string } | null;
  depotName: string;
  inventory?: {
    containerNumber: string;
    capacity: string;
    capacityUnit: string;
    tare: string;
  };
};

const AddShipmentModal = ({ 
  onClose, 
  formTitle, 
  form, 
  setForm, 
  selectedContainers, 
  setSelectedContainers, 
  refreshShipments 
}: any) => {
  const [carrierSuggestions, setCarrierSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allMovements, setAllMovements] = useState<any[]>([]);
  const [portSuggestions, setPortSuggestions] = useState<any[]>([]);
  const [showPortDropdown, setShowPortDropdown] = useState(false);
  const [showDischargeDropdown, setShowDischargeDropdown] = useState(false);
  const [transhipmentPortSuggestions, setTranshipmentPortSuggestions] = useState<any[]>([]);
  const [showTranshipmentDropdown, setShowTranshipmentDropdown] = useState(false);
  const [impHandlingAgents, setImpHandlingAgents] = useState<{ id: number; companyName: string }[]>([]);
  const [expAgents, setExpAgents] = useState<{ id: number; companyName: string }[]>([]);
  const [emptyReturnDepots, setEmptyReturnDepots] = useState<{ id: number; companyName: string; businessType?: string }[]>([]);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await axios.get("http://localhost:8000/movement-history");

        // Group by containerNumber inside inventory
        const grouped: { [key: string]: any[] } = {};
        for (const m of res.data) {
          const containerNo = m.inventory?.containerNumber;
          if (!containerNo) continue;

          if (!grouped[containerNo]) grouped[containerNo] = [];
          grouped[containerNo].push(m);
        }

        // Get latest entry per container, filter AVAILABLE ones
        const latestAvailableOnly = Object.values(grouped)
          .map((group: any[]) =>
            group.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0]
          )
          .filter((m) => m.status === "AVAILABLE");

        setAllMovements(latestAvailableOnly);
      } catch (err) {
        console.error("Failed to fetch movements", err);
      }
    };

    fetchMovements();
  }, []);

 const handleContainerSearch = (value: string) => {
  setForm({ ...form, containerNumber: value });

  if (value.length >= 2) {
    const matched = allMovements
      .filter(
        (m) =>
          m.inventory?.containerNumber &&
          m.inventory.containerNumber.toLowerCase().includes(value.toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(a.inventory?.createdAt || a.createdAt).getTime() -
          new Date(b.inventory?.createdAt || b.createdAt).getTime()
      ); // FIFO: oldest first

    setSuggestions(matched);
  } else {
    setSuggestions([]);
  }
};


  const handleSuggestionSelect = (item: any) => {
    const containerNo = item.inventory?.containerNumber;
    if (
      selectedContainers.some(
        (c: ContainerItem) => c.containerNumber === containerNo
      )
    )
      return;

    const newContainer = {
      containerNumber: containerNo,
      capacity: item.inventory?.containerCapacity,
      tare: item.inventory?.tareWeight,
      inventoryId: item.inventory?.id,
      portId: item.port?.id || null,
       port: item.port || null,
      depotName: item.addressBook?.companyName || "",
    };

    const updatedContainers = [...selectedContainers, newContainer];
    setSelectedContainers(updatedContainers);

    setForm({
      ...form,
      containers: updatedContainers.map((c) => ({
        containerNumber: c.containerNumber,
        capacity: c.capacity,
        tare: c.tare,
        inventoryId: c.inventoryId,
        portId: c.portId,
        depotName: c.depotName,
      })),
      containerNumber: "",
      capacity: "",
      tare: "",
      portName: "",
      depotName: "",
    });

    setSuggestions([]);
  };

  const [selectOptions, setSelectOptions] = useState<SelectOptions>({
    customer: [],
    product: [],
    port: [],
    agent: [],
    depot: [],
    shippingTerm: []
  });

  // Update the handleSubmit function to properly handle transhipment port
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        date: form.date || new Date().toISOString(),
        jobNumber: form.jobNumber,
        houseBL: form.houseBL,
        shippingTerm: form.shippingTerm || "CY-CY",
        polPortId: form.portOfLoadingId,
        podPortId: form.portOfDischargeId,
        polFreeDays: form.polFreeDays,
        podFreeDays: form.podFreeDays,
        polDetentionRate: form.polDetentionRate,
        podDetentionRate: form.podDetentionRate,
        expHandlingAgentAddressBookId: form.expHandlingAgentAddressBookId,
        impHandlingAgentAddressBookId: form.impHandlingAgentAddressBookId,
        quantity: form.quantity || selectedContainers.length.toString(),
        carrierAddressBookId: parseInt(form.carrierId),
        vesselName: form.vesselName || "Default Vessel",
        gsDate: form.gateClosingDate || new Date().toISOString(),
        sob: form.sobDate || new Date().toISOString(),
        etaTopod: form.etaToPod || new Date().toISOString(),
        emptyReturnDepotAddressBookId: parseInt(form.emptyReturnDepot),
        estimateDate: form.estimatedEmptyReturnDate || new Date().toISOString(),

        // Include containers array
        containers: selectedContainers.map((c: any) => ({
          containerNumber: c.containerNumber || "",
          capacity: c.capacity || "",
          tare: c.tare || "",
          inventoryId: c.inventoryId || null,
          portId: c.portId || null,
          depotName: c.depotName || "",
        })),
      };

      // FIX: Properly handle transhipment port
      if (form.enableTranshipmentPort && form.transhipmentPortId) {
        payload.transhipmentPortId = form.transhipmentPortId;
      }

      console.log('Payload being sent:', payload); // Debug log

      if (form.id) {
        // For PATCH (Edit)
        await axios.patch(`http://localhost:8000/empty-repo-job/${form.id}`, payload);
        alert("Empty repo job updated successfully!");
      } else {
        // For POST (New)
        await axios.post("http://localhost:8000/empty-repo-job", payload);
        alert("Empty repo job created successfully!");
      }

      if (refreshShipments) refreshShipments(); // Refresh parent
      onClose(); // Close modal
    } catch (error: any) {
      console.error("Error submitting empty repo job", error);
      alert(`Failed to submit empty repo job: ${error.response?.data?.message || error.message}`);
    }
  };

  

  const fetchPorts = async (searchTerm: string) => {
    try {
      const res = await fetch("http://localhost:8000/ports");
      const data = await res.json();

      const filtered = data.filter((port: any) =>
        port.portName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPortSuggestions(filtered);
    } catch (error) {
      console.error("Error fetching ports:", error);
    }
  };

  const fetchExpHandlingAgentsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://localhost:8000/addressbook");
      const data = await res.json();

      const filtered = data.filter((entry: any) => {
        const isHandlingAgent = entry.businessType
          ?.toLowerCase()
          .includes("handling agent");

        const linkedToPort = entry.businessPorts?.some(
          (bp: any) => bp.portId === portId
        );

        return isHandlingAgent && linkedToPort;
      });

      setExpAgents(filtered);
    } catch (err) {
      console.error("Failed to fetch export handling agents:", err);
    }
  };

  useEffect(() => {
    if (form.portOfLoadingId) {
      fetchExpHandlingAgentsByPort(form.portOfLoadingId);
    } else {
      setExpAgents([]);
    }
  }, [form.portOfLoadingId]);

  const fetchImpHandlingAgentsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://localhost:8000/addressbook");
      const data = await res.json();

      const filtered = data.filter((entry: any) => {
        const isHandlingAgent = entry.businessType
          ?.toLowerCase()
          .includes("handling agent");

        const linkedToPort = entry.businessPorts?.some(
          (bp: any) => bp.portId === portId
        );

        return isHandlingAgent && linkedToPort;
      });

      setImpHandlingAgents(filtered);
    } catch (err) {
      console.error("Failed to fetch import handling agents:", err);
    }
  };

  useEffect(() => {
    if (form.portOfDischargeId) {
      fetchImpHandlingAgentsByPort(form.portOfDischargeId);
    } else {
      setImpHandlingAgents([]);
    }
  }, [form.portOfDischargeId]);

  const fetchTranshipmentPorts = async (search: string) => {
    try {
      const res = await fetch(`http://localhost:8000/ports`);
      const data = await res.json();
      const filtered = data.filter((p: any) =>
        p.portName.toLowerCase().includes(search.toLowerCase())
      );
      setTranshipmentPortSuggestions(filtered);
    } catch (err) {
      console.error("Failed to fetch transhipment ports:", err);
    }
  };

  useEffect(() => {
    const fetchCarrier = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const carrier = data.filter(
          (entry: any) =>
            entry.businessType &&
            entry.businessType.includes("Carrier")
        );
        setCarrierSuggestions(carrier);
      } catch (err) {
        console.error("Error fetching carrier:", err);
      }
    };

    fetchCarrier();
  }, []);

  const fetchEmptyReturnDepotsByPort = async (portId: number) => {
  try {
    const res = await fetch("http://localhost:8000/addressbook");
    const data = await res.json();

    const filtered = data.filter((entry: any) => {
      const businessType = (entry.businessType || "").toLowerCase();

      const isDepotOrCY =
        businessType.includes("deport terminal") ||
        businessType.includes("cy terminal");

      const linkedToPort =
        Array.isArray(entry.businessPorts) &&
        entry.businessPorts.some((bp: any) => bp.portId === portId);

      return isDepotOrCY && linkedToPort;
    });

    setEmptyReturnDepots(filtered);
  } catch (err) {
    console.error("Failed to fetch empty return depots:", err);
  }
};


  useEffect(() => {
    if (form.portOfDischargeId) {
      fetchEmptyReturnDepotsByPort(form.portOfDischargeId);
    } else {
      setEmptyReturnDepots([]);
    }
  }, [form.portOfDischargeId]);

  useEffect(() => {
    const fetchNextJobNumber = async () => {
      try {
        const res = await axios.get("http://localhost:8000/empty-repo-job/job/next");
        const jobNumber = res.data.jobNumber || "";
        setForm((prev: any) => ({
          ...prev,
          jobNumber: jobNumber,
          houseBL: jobNumber, // House BL is same as job number based on backend logic
        }));
      } catch (err) {
        console.error("Failed to fetch job number", err);
      }
    };

    if (!form.id) {
      fetchNextJobNumber();
    }
  }, [form.id]);

  const handleRemoveContainer = (index: number) => {
    const updated = [...selectedContainers];
    updated.splice(index, 1);
    setSelectedContainers(updated);
  };

  useEffect(() => {
    if (form.etaToPod && form.podFreeDays) {
      const etaDate = new Date(form.etaToPod);
      const freeDays = parseInt(form.podFreeDays, 10);

      if (!isNaN(freeDays)) {
        const returnDate = new Date(etaDate);
        returnDate.setDate(etaDate.getDate() + freeDays);

        const formatted = returnDate.toISOString().split("T")[0];
        setForm((prev: any) => ({
          ...prev,
          estimatedEmptyReturnDate: formatted,
        }));
      }
    }
  }, [form.etaToPod, form.podFreeDays]);

  // Add useEffect to initialize selectedContainers from form.containers when editing
  useEffect(() => {
    if (form.id && form.containers && form.containers.length > 0) {
      // Initialize selectedContainers from form.containers when editing
      const containers = form.containers.map((container: any) => ({
        containerNumber: container.containerNumber || "",
        capacity: container.capacity || "",
        tare: container.tare || "",
        inventoryId: container.inventoryId || null,
        portId: container.portId || null,
        depotName: container.depotName || "",
        port: container.port || null,
      }));
      setSelectedContainers(containers);
    }
  }, [form.id, form.containers]);

  // Add this useEffect to handle transhipment port display in edit mode
  useEffect(() => {
    if (form.id && form.enableTranshipmentPort && form.transhipmentPortId && !form.transhipmentPortName) {
      // If we have a transhipment port ID but no name, fetch the port name
      const fetchTranshipmentPortName = async () => {
        try {
          const res = await fetch(`http://localhost:8000/ports/${form.transhipmentPortId}`);
          const port = await res.json();
          setForm((prev: any) => ({
            ...prev,
            transhipmentPortName: port.portName,
          }));
        } catch (err) {
          console.error("Failed to fetch transhipment port name:", err);
        }
      };

      fetchTranshipmentPortName();
    }
  }, [form.id, form.enableTranshipmentPort, form.transhipmentPortId]);

  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-lg">
      <Dialog open onOpenChange={onClose} modal={true}>
        <DialogContent
          className="!w-[90vw] !max-w-[1200px] min-w-0 bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-0 border border-neutral-200 dark:border-neutral-800"
          onInteractOutside={e => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {formTitle}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">Basic Information</h3>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-4 rounded space-y-4 border border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <Label htmlFor="date" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Date (DD/MM/YY) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={form.date || ""}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobNumber" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Job Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={form.jobNumber || ""}
                      readOnly
                      className="w-full p-2.5 bg-neutral-100 dark:bg-neutral-700 text-gray-900 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-600 cursor-not-allowed"
                      placeholder="Auto-generated..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="houseBL" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      House BL <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={form.houseBL || ""}
                      readOnly
                      className="w-full p-2.5 bg-neutral-100 dark:bg-neutral-700 text-gray-900 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-600 cursor-not-allowed"
                      placeholder="Auto-generated..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="shippingTerm" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Shipping Term <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={form.shippingTerm || "CY-CY"}
                      onChange={(e) => setForm({ ...form, shippingTerm: e.target.value })}
                      placeholder="CY-CY"
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Port Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">Port Information</h3>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-4 rounded space-y-4 border border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="relative">
                    <Label htmlFor="portOfLoading" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Port Of Loading <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={form.portOfLoading || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((prev: any) => ({
                          ...prev,
                          portOfLoading: value,
                          portOfLoadingId: undefined, // reset on change
                        }));

                        if (value.length > 1) {
                          fetchPorts(value);
                          setShowPortDropdown(true);
                        } else {
                          setShowPortDropdown(false);
                          setPortSuggestions([]);
                        }
                      }}
                      onFocus={() => {
                        if (form.portOfLoading?.length > 1) {
                          fetchPorts(form.portOfLoading);
                          setShowPortDropdown(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowPortDropdown(false), 100);
                      }}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      placeholder="Start typing port of loading..."
                    />
                    {showPortDropdown && portSuggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto">
                        {portSuggestions.map((port) => (
                          <li
                            key={port.id}
                            onMouseDown={() => {
                              setForm((prev: any) => ({
                                ...prev,
                                portOfLoading: port.portName,
                                portOfLoadingId: port.id,
                              }));
                              setShowPortDropdown(false);
                            }}
                            className="px-3 py-1 hover:bg-neutral-700 cursor-pointer text-sm text-white"
                          >
                            {port.portName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="relative">
                    <Label htmlFor="portOfDischarge" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Port Of Discharge <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={form.portOfDischarge || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((prev: any) => ({
                          ...prev,
                          portOfDischarge: value,
                          portOfDischargeId: undefined,
                        }));

                        if (value.length > 1) {
                          fetchPorts(value);
                          setShowDischargeDropdown(true);
                        } else {
                          setShowDischargeDropdown(false);
                        }
                      }}
                      onFocus={() => {
                        if (form.portOfDischarge?.length > 1) {
                          fetchPorts(form.portOfDischarge);
                          setShowDischargeDropdown(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowDischargeDropdown(false), 100);
                      }}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      placeholder="Start typing port of discharge..."
                    />
                    {showDischargeDropdown && portSuggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto">
                        {portSuggestions.map((port) => (
                          <li
                            key={port.id}
                            onMouseDown={() => {
                              setForm((prev: any) => ({
                                ...prev,
                                portOfDischarge: port.portName,
                                portOfDischargeId: port.id,
                              }));
                              setShowDischargeDropdown(false);
                            }}
                            className="px-3 py-1 hover:bg-neutral-700 cursor-pointer text-sm text-white"
                          >
                            {port.portName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex w-full gap-4 col-span-2">
                    <div className="flex-1">
                      <Label htmlFor="polFreeDays" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                        Free Days
                      </Label>
                      <Input
                        type="text"
                        value={form.polFreeDays || ""}
                        onChange={(e) => setForm({ ...form, polFreeDays: e.target.value })}
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="polDetentionRate" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                        Detention Rate
                      </Label>
                      <Input
                        type="text"
                        value={form.polDetentionRate || ""}
                        onChange={(e) => setForm({ ...form, polDetentionRate: e.target.value })}
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="podFreeDays" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                        Free Days
                      </Label>
                      <Input
                        type="text"
                        value={form.podFreeDays || ""}
                        onChange={(e) => setForm({ ...form, podFreeDays: e.target.value })}
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="podDetentionRate" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                        Detention Rate
                      </Label>
                      <Input
                        type="text"
                        value={form.podDetentionRate || ""}
                        onChange={(e) => setForm({ ...form, podDetentionRate: e.target.value })}
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <Checkbox
                      id="enableTranshipmentPort"
                      checked={!!form.enableTranshipmentPort}
                      onCheckedChange={(checked) =>
                        setForm({
                          ...form,
                          enableTranshipmentPort: checked,
                        })
                      }
                    />
                    <Label htmlFor="enableTranshipmentPort" className="text-gray-900 dark:text-neutral-200 text-sm">
                      Enable Transhipment Port
                    </Label>
                  </div>

                  {form.enableTranshipmentPort && (
                    <div className="col-span-2">
                      <Label htmlFor="transhipmentPortName" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                        Transhipment Port
                      </Label>
                      <div className="relative w-1/2">
                        <Input
                          type="text"
                          value={form.transhipmentPortName || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setForm((prev: any) => ({
                              ...prev,
                              transhipmentPortName: value,
                              transhipmentPortId: undefined, // Reset ID when typing
                            }));

                            if (value.length > 1) {
                              fetchTranshipmentPorts(value);
                              setShowTranshipmentDropdown(true);
                            } else {
                              setShowTranshipmentDropdown(false);
                            }
                          }}
                          onFocus={() => {
                            if ((form.transhipmentPortName || "").length > 1) {
                              fetchTranshipmentPorts(form.transhipmentPortName || "");
                              setShowTranshipmentDropdown(true);
                            }
                          }}
                          onBlur={() => setTimeout(() => setShowTranshipmentDropdown(false), 150)}
                          className="w-full p-2.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-700"
                          placeholder="Start typing transhipment port..."
                        />
                        {showTranshipmentDropdown && transhipmentPortSuggestions.length > 0 && (
                          <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto">
                            {transhipmentPortSuggestions.map((port) => (
                              <li
                                key={port.id}
                                onMouseDown={() => {
                                  setForm((prev: any) => ({
                                    ...prev,
                                    transhipmentPortName: port.portName,
                                    transhipmentPortId: port.id,
                                  }));
                                  setShowTranshipmentDropdown(false);
                                }}
                                className="px-3 py-1 hover:bg-neutral-700 cursor-pointer text-sm text-white"
                              >
                                {port.portName}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Container Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">Add Inventory</h3>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-4 rounded space-y-4 border border-neutral-200 dark:border-neutral-700">
                <div className="mb-4">
                  <Label htmlFor="quantity" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={form.quantity || ""}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                  />
                </div>
                <div className="relative mb-4">
                  <Label htmlFor="containerNumber" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                    Container No.
                  </Label>
                  <div className="flex">
                    <Input
                      type="text"
                      value={form.containerNumber || ""}
                      onChange={(e) => handleContainerSearch(e.target.value)}
                      placeholder="Type at least 2 characters"
                      className="rounded-l w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
                    />
                    <Button
                      type="button"
                      className="rounded-r bg-blue-600 hover:bg-blue-700"
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="inline-block"
                      >
                        <circle cx="8" cy="8" r="7" />
                        <path d="M14 14l-2-2" />
                      </svg>
                    </Button>
                  </div>
                  {suggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-neutral-800 text-white rounded border border-neutral-700 shadow max-h-60 overflow-y-auto">
                      {suggestions.map((sug) => (
                        <li
                          key={sug.id}
                          onClick={() => handleSuggestionSelect(sug)}
                          className="px-4 py-2 hover:bg-neutral-700 cursor-pointer text-sm"
                        >
                          <div className="font-semibold">
                            {sug.inventory.containerNumber}
                          </div>
                          <div className="text-xs text-neutral-300 flex justify-between">
                            <span>
                              Capacity: {sug.inventory.capacity}{" "}
                              {sug.inventory.capacityUnit}
                            </span>
                            <span>Tare: {sug.inventory.tare} kg</span>
                          </div>
                          <div className="text-xs text-neutral-400 mt-1">
                            Location: {sug.addressBook?.companyName} -{" "}
                            {sug.port?.portName}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    Search by container number (min. 2 characters)
                  </p>
                </div>
                  {selectedContainers.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-white text-sm font-semibold mb-2">
                        Selected Containers
                      </h5>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-neutral-900 border-b border-neutral-700">
                            <TableHead className="text-neutral-200 text-xs">Container No</TableHead>
                            <TableHead className="text-neutral-200 text-xs">Capacity</TableHead>
                            <TableHead className="text-neutral-200 text-xs">Tare</TableHead>
                            <TableHead className="text-neutral-200 text-xs">Last Location</TableHead>
                            <TableHead className="text-neutral-200 text-xs text-center">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedContainers.map((item: ContainerItem, index: number) => (
                          <TableRow key={index} className="border-t border-neutral-700">
                            <TableCell className="text-white">
                              {item.inventory?.containerNumber ||
                                item.containerNumber ||
                                "N/A"}
                            </TableCell>
                            <TableCell className="text-white">
                              {(item.inventory?.capacity || item.capacity || "N/A") +
                                " " +
                                (item.inventory?.capacityUnit || "")}
                            </TableCell>
                            <TableCell className="text-white">
                              {item.tare || item.inventory?.tare || "N/A"}
                            </TableCell>
<TableCell className="text-white">
  {(item.depotName || "N/A") + " - " + (item.port?.portName || "N/A")}
</TableCell>
                            <TableCell className="text-center">
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveContainer(index)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2"
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            {/* Handling Agents */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">Handling Agents</h3>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-4 rounded space-y-4 border border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <Label htmlFor="expHandlingAgentAddressBookId" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                      Exp. H. Agent Name <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.expHandlingAgentAddressBookId?.toString() || ""}
                      onValueChange={(value) => {
                        const selectedId = Number(value);
                        const selected = expAgents.find((a) => a.id === selectedId);
                        setForm({
                          ...form,
                          expHandlingAgentAddressBookId: selectedId,
                          expHAgentName: selected?.companyName || "",
                        });
                      }}
                    >
                      <SelectTrigger className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                        <SelectValue placeholder="Select Agent" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 text-white border border-neutral-700">
                        {expAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()} className="text-white">
                            {agent.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="impHandlingAgentAddressBookId" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                      Imp. H. Agent Name <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.impHandlingAgentAddressBookId?.toString() || ""}
                      onValueChange={(value) => {
                        const selectedId = Number(value);
                        const selected = impHandlingAgents.find((a) => a.id === selectedId);
                        setForm({
                          ...form,
                          impHandlingAgentAddressBookId: selectedId,
                          impHAgentName: selected?.companyName || "",
                        });
                      }}
                    >
                      <SelectTrigger className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                        <SelectValue placeholder="Select Agent" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 text-white border border-neutral-700">
                        {impHandlingAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()} className="text-white">
                            {agent.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Vessel Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">Vessel Details</h3>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-4 rounded space-y-4 border border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="relative">
                    <Label htmlFor="carrierName" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                      Carrier Name
                    </Label>
                    <Input
                      type="text"
                      value={form.carrierName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          carrierName: e.target.value,
                          carrierId: null,
                        }));
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Start typing carrier name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions && form.carrierName && (
                      <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto">
                        {carrierSuggestions
                          .filter((c) =>
                            c.companyName
                              .toLowerCase()
                              .includes(form.carrierName.toLowerCase())
                          )
                          .map((company) => (
                            <li
                              key={company.id}
                              onMouseDown={() => {
                                setForm((prev: any) => ({
                                  ...prev,
                                  carrierName: company.companyName,
                                  carrierId: company.id,
                                }));
                                setShowSuggestions(false);
                              }}
                              className="px-3 py-1 hover:bg-neutral-700 cursor-pointer text-sm text-white"
                            >
                              {company.companyName}
                            </li>
                          ))}
                        {carrierSuggestions.filter((c) =>
                          c.companyName.toLowerCase().includes(form.carrierName?.toLowerCase())
                        ).length === 0 && (
                          <li className="px-3 py-1 text-neutral-400 text-sm">
                            No match found
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="vesselName" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                      Vessel Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={form.vesselName || ""}
                      onChange={(e) => setForm({ ...form, vesselName: e.target.value })}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gateClosingDate" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                      Gate Closing Date
                    </Label>
                    <Input
                      type="date"
                      value={form.gateClosingDate || ""}
                      onChange={(e) => setForm({ ...form, gateClosingDate: e.target.value })}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sobDate" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                      SOB Date
                    </Label>
                    <Input
                      type="date"
                      value={form.sobDate || ""}
                      onChange={(e) => setForm({ ...form, sobDate: e.target.value })}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="etaToPod" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                      ETA to PoD
                    </Label>
                    <Input
                      type="date"
                      value={form.etaToPod || ""}
                      onChange={(e) => setForm({ ...form, etaToPod: e.target.value })}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Return Depot Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">Return Depot Information</h3>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-4 rounded space-y-4 border border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <Label htmlFor="emptyReturnDepot" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                      Empty Return Depot <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.emptyReturnDepot?.toString() || ""}
                      onValueChange={(value) => setForm({ ...form, emptyReturnDepot: value })}
                    >
                      <SelectTrigger className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                        <SelectValue placeholder="Select Return Depot" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 text-white border border-neutral-700">
                        {emptyReturnDepots.map((depot) => (
                         <SelectItem
  key={depot.id}
  value={depot.id.toString()}
  className="text-white"
>
  {depot.companyName} - {depot.businessType}
</SelectItem>

                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedEmptyReturnDate" className="text-gray-900 dark:text-neutral-200 text-sm mb-1">
                      Estimated Empty Return Date
                    </Label>
                    <Input
                      type="date"
                      value={form.estimatedEmptyReturnDate || ""}
                      onChange={(e) => setForm({ ...form, estimatedEmptyReturnDate: e.target.value })}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit and Cancel buttons */}
            <DialogFooter className="flex justify-center gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer"
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddShipmentModal;