"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
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
type ProductOption = {
  id: number;
  productId: string;
  productName: string;
  productType: string;
};

type SelectOptions = {
  customer: Option[];
  product: ProductOption[];
  port: Option[];
  agent: Option[];
  depot: Option[];
  shippingTerm: Option[];
};


const AddShipmentModal = ({
  onClose,
  formTitle,
  form,
  setForm,
  selectedContainers,
  setSelectedContainers,
  refreshShipments,
}: any) => {
  const [consigneeSuggestions, setConsigneeSuggestions] = useState<any[]>([]);
  const [carrierSuggestions, setCarrierSuggestions] = useState<any[]>([]);
  const [shipperSuggestions, setShipperSuggestions] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allMovements, setAllMovements] = useState<any[]>([]);
  const [allInventories, setAllInventories] = useState<any[]>([]);

  // Add new suggestion states for the converted fields
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [portSuggestions, setPortSuggestions] = useState<any[]>([]);
  const [agentSuggestions, setAgentSuggestions] = useState<any[]>([]);
  const [depotSuggestions, setDepotSuggestions] = useState<any[]>([]);

  // FIX 1: Create separate state for each dropdown visibility
  const [showSuggestions, setShowSuggestions] = useState({
    customer: false,
    product: false,
    portLoading: false,
    portDischarge: false,
    expAgent: false,
    impAgent: false,
    depot: false,
    consignee: false,
    shipper: false,
    carrier: false,
  });

  // Add new state for filtered options
  const [expAgents, setExpAgents] = useState<{ id: number; companyName: string }[]>([]);
  const [impHandlingAgents, setImpHandlingAgents] = useState<{ id: number; companyName: string }[]>([]);
  const [emptyReturnDepots, setEmptyReturnDepots] = useState<{ id: number; companyName: string; businessType?: string }[]>([]);

  // Helper function to update specific dropdown visibility
  const toggleSuggestions = (field: string, visible: boolean) => {
    setShowSuggestions(prev => ({
      ...prev,
      [field]: visible
    }));
  };

  // Function to fetch EXP handling agents by port
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
      setExpAgents([]); // Set empty array on error
    }
  };

  // Function to fetch IMP handling agents by port
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
      setImpHandlingAgents([]); // Set empty array on error
    }
  };

  // Function to fetch empty return depots by port
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
      setEmptyReturnDepots([]); // Set empty array on error
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const customers = data.filter((entry: any) => 
          entry.businessType?.includes("Customer")
        );
        setCustomerSuggestions(customers);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8000/products");
        const data = await res.json();
        setProductSuggestions(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const res = await fetch("http://localhost:8000/ports");
        const data = await res.json();
        setPortSuggestions(data);
      } catch (err) {
        console.error("Error fetching ports:", err);
      }
    };

    fetchPorts();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const agents = data.filter((entry: any) =>
          entry.businessType?.includes("Handling Agent") ||
          entry.businessType?.includes("Agent")
        );
        setAgentSuggestions(agents);
      } catch (err) {
        console.error("Error fetching agents:", err);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchDepots = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const depots = data.filter((entry: any) =>
          entry.businessType?.includes("Depot") ||
          entry.businessType?.includes("Empty Return") ||
          entry.businessType?.includes("Deport Terminal")
        );
        setDepotSuggestions(depots);
      } catch (err) {
        console.error("Error fetching depots:", err);
      }
    };

    fetchDepots();
  }, []);

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
        (c: any) => c.containerNumber === containerNo
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


  const handleRemoveContainer = (index: number) => {
    const updated = [...selectedContainers];
    updated.splice(index, 1);
    setSelectedContainers(updated);
  };


  const [selectOptions, setSelectOptions] = useState<SelectOptions>({
    customer: [],
    product: [],
    port: [],
    agent: [],
    depot: [],
    shippingTerm: []
  });

  // Effect to populate select options and form data when editing
  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        // Fetch all options in parallel
        const [addressBookRes, productsRes, portsRes] = await Promise.all([
          fetch("http://localhost:8000/addressbook"),
          fetch("http://localhost:8000/products"),
          fetch("http://localhost:8000/ports")
        ]);

        const [addressBookData, productsData, portsData] = await Promise.all([
          addressBookRes.json(),
          productsRes.json(),
          portsRes.json()
        ]);

        // Process customer options
        const customers = addressBookData
          .filter((entry: any) => entry.businessType?.includes("Customer"))
          .map((entry: any) => ({ id: entry.id, name: entry.companyName }));

        // Process product options
        const products = productsData.map((product: any) => ({
          id: product.id,
          productId: product.productId,
          productName: product.productName,
          productType: product.productType || ""
        }));

        // Process port options
        const ports = portsData.map((port: any) => ({
          id: port.id,
          name: port.portName
        }));

        // Process agent options
        const agents = addressBookData
          .filter((entry: any) => 
            entry.businessType?.includes("Handling Agent") || 
            entry.businessType?.includes("Agent")
          )
          .map((entry: any) => ({ id: entry.id, name: entry.companyName }));

        // Process depot options
        const depots = addressBookData
          .filter((entry: any) => 
            entry.businessType?.includes("Depot") || 
            entry.businessType?.includes("Empty Return") ||
            entry.businessType?.includes("Deport Terminal")
          )
          .map((entry: any) => ({ id: entry.id, name: entry.companyName }));

        // Define shipping terms
        let shippingTerms = [
          { id: "CY-CY", name: "CY-CY" },
          { id: "CY-Door", name: "CY-Door" },
          { id: "Door-CY", name: "Door-CY" },
          { id: "Door-Door", name: "Door-Door" },
          { id: "CY-CFS", name: "CY-CFS" },
          { id: "CFS-CY", name: "CFS-CY" },
          { id: "CFS-CFS", name: "CFS-CFS" },
          { id: "Door-CFS", name: "Door-CFS" },
          { id: "CFS-Door", name: "CFS-Door" }
        ];

        if (form.id && form.shippingTerm && !shippingTerms.find(t => t.id === form.shippingTerm)) {
          shippingTerms.push({ id: form.shippingTerm, name: form.shippingTerm });
        }
          
        setSelectOptions({
          customer: customers,
          product: products,
          port: ports,
          agent: agents,
          depot: depots,
          shippingTerm: shippingTerms
        });

        // FIX: If this is an edit operation, populate display names for all searchable fields
        if (form.id) {
          // Find and set customer display name
          const selectedCustomer = customers.find(
            (c: any) => c.id.toString() === form.customerName?.toString()
          );
          if (selectedCustomer) {
            setForm((prev: any) => ({
              ...prev,
              customerDisplayName: selectedCustomer.name,
            }));
          }

          // Find and set product display name
          const selectedProduct = products.find(
            (p: any) => p.id.toString() === form.productId?.toString()
          );
          if (selectedProduct) {
            setForm((prev: any) => ({
              ...prev,
              productDisplayName: `${selectedProduct.productId} - ${selectedProduct.productName} - ${selectedProduct.productType}`,
            }));
          }

          // Find and set port display names
          const selectedPolPort = ports.find(
            (p: any) => p.id.toString() === form.portOfLoading?.toString()
          );
          if (selectedPolPort) {
            setForm((prev: any) => ({
              ...prev,
              portOfLoadingName: selectedPolPort.name,
            }));
          }

          const selectedPodPort = ports.find(
            (p: any) => p.id.toString() === form.portOfDischarge?.toString()
          );
          if (selectedPodPort) {
            setForm((prev: any) => ({
              ...prev,
              portOfDischargeName: selectedPodPort.name,
            }));
          }

          // FIX: Fetch filtered data immediately after setting port names
          const fetchPromises = [];
          
          if (form.portOfLoading) {
            fetchPromises.push(fetchExpHandlingAgentsByPort(Number(form.portOfLoading)));
          }
          
          if (form.portOfDischarge) {
            fetchPromises.push(fetchImpHandlingAgentsByPort(Number(form.portOfDischarge)));
            fetchPromises.push(fetchEmptyReturnDepotsByPort(Number(form.portOfDischarge)));
          }

          // Wait for all filtered data to be fetched
          await Promise.all(fetchPromises);

          // Fetch and set other display names (existing code)
          if (form.consigneeId || form.consigneeAddressBookId) {
            try {
              const consigneeId = form.consigneeAddressBookId || form.consigneeId;
              const consigneeRes = await fetch(`http://localhost:8000/addressbook/${consigneeId}`);
              const consigneeData = await consigneeRes.json();
              setForm((prev: any) => ({ ...prev, consigneeName: consigneeData.companyName }));
            } catch (err) {
              console.error("Failed to fetch consignee data", err);
            }
          }

          if (form.shipperId || form.shipperAddressBookId) {
            try {
              const shipperId = form.shipperAddressBookId || form.shipperId;
              const shipperRes = await fetch(`http://localhost:8000/addressbook/${shipperId}`);
              const shipperData = await shipperRes.json();
              setForm((prev: any) => ({ ...prev, shipperName: shipperData.companyName }));
            } catch (err) {
              console.error("Failed to fetch shipper data", err);
            }
          }

          if (form.carrierId || form.carrierAddressBookId) {
            try {
              const carrierId = form.carrierAddressBookId || form.carrierId;
              const carrierRes = await fetch(`http://localhost:8000/addressbook/${carrierId}`);
              const carrierData = await carrierRes.json();
              setForm((prev: any) => ({ ...prev, carrierName: carrierData.companyName }));
            } catch (err) {
              console.error("Failed to fetch carrier data", err);
            }
          }
        }

      } catch (error) {
        console.error("Error fetching select options:", error);
      }
    };

    fetchSelectOptions();
  }, [form.id]); // Re-run when form.id changes (edit vs new)

  // Effect to handle selectedContainers when in edit mode
  // Note: selectedContainers are managed by the parent ShipmentTable component
  // and passed down as props, so no additional handling needed here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields ONLY for new shipments (not for edits)
      if (!form.id) {
        const requiredFields = [
          'customerName', 'productName', 'portOfLoading',
          'portOfDischarge', 'expHandlingAgent', 'impHandlingAgent',
          'emptyReturnDepot'
        ];

        for (const field of requiredFields) {
          if (!form[field]) {
            alert(`Please fill in the required field: ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return;
          }
        }
      }

      // Build payload with only the fields that have values
      const payload: any = {};

      // Basic fields - FIX: Make quotation reference number optional
      if (form.quotationRefNo && form.quotationRefNo.trim() !== '') {
        payload.quotationRefNumber = form.quotationRefNo;
      }
      
      if (form.date) payload.date = new Date(form.date).toISOString();
      if (form.jobNumber) payload.jobNumber = form.jobNumber;
      if (form.referenceNumber) payload.refNumber = form.referenceNumber;
      if (form.masterBL) payload.masterBL = form.masterBL;
      if (form.shippingTerm) payload.shippingTerm = form.shippingTerm;

      // IDs - convert to numbers if they exist
      if (form.customerName) payload.custAddressBookId = parseInt(form.customerName);
      if (form.consigneeId) payload.consigneeAddressBookId = parseInt(form.consigneeId);
      if (form.shipperId) payload.shipperAddressBookId = parseInt(form.shipperId);
      
      // FIX: Convert productId to number properly
      if (form.productId) {
        const productId = typeof form.productId === 'string' ? parseInt(form.productId) : form.productId;
        if (!isNaN(productId)) {
          payload.productId = productId;
        }
      }
      
      if (form.portOfLoading) payload.polPortId = parseInt(form.portOfLoading);
      if (form.portOfDischarge) payload.podPortId = parseInt(form.portOfDischarge);
      if (form.expHandlingAgent) payload.expHandlingAgentAddressBookId = parseInt(form.expHandlingAgent);
      if (form.impHandlingAgent) payload.impHandlingAgentAddressBookId = parseInt(form.impHandlingAgent);
      if (form.carrierId) payload.carrierAddressBookId = parseInt(form.carrierId);
      if (form.emptyReturnDepot) payload.emptyReturnDepotAddressBookId = parseInt(form.emptyReturnDepot);

      // Transhipment port if enabled
      if (form.enableTranshipmentPort && form.transhipmentPortName) {
        payload.transhipmentPortId = parseInt(form.transhipmentPortName);
      }

      // Other numerical fields - use defaults if not provided
      payload.polFreeDays = form.freeDays1 || "0";
      payload.podFreeDays = form.freeDays2 || "0";
      payload.polDetentionRate = form.detentionRate1 || "0";
      payload.podDetentionRate = form.detentionRate2 || "0";
      payload.quantity = form.quantity || String(selectedContainers.length);
      payload.vesselName = form.vesselName || "Default Vessel";

      // Date fields - use current date as fallback
      if (form.gateClosingDate) payload.gsDate = new Date(form.gateClosingDate).toISOString();
      if (form.sobDate) payload.sob = new Date(form.sobDate).toISOString();
      if (form.etaToPod) payload.etaTopod = new Date(form.etaToPod).toISOString();
      if (form.estimatedEmptyReturnDate) payload.estimateDate = new Date(form.estimatedEmptyReturnDate).toISOString();

      // Always include containers
      if (selectedContainers.length > 0) {
        payload.containers = selectedContainers.map((c: any) => ({
          containerNumber: c.containerNumber || "",
          capacity: c.capacity || "",
          tare: c.tare || "",
          inventoryId: c.inventoryId || null,
          portId: c.portId || null,
          depotName: c.depotName || "",
        }));
      }
      
      console.log('Payload being sent:', payload); // Debug log
      
      if (form.id) {
        // For PATCH (Edit)
        await axios.patch(`http://localhost:8000/shipment/${form.id}`, payload);
        alert("Shipment updated successfully!");
      } else {
        // For POST (New)
        await axios.post("http://localhost:8000/shipment", payload);
        alert("Shipment created successfully!");
      }

      if (refreshShipments) refreshShipments(); // Refresh parent
      onClose(); // Close modal
    } catch (error: any) {
      console.error("Error submitting shipment", error);
      alert(`Failed to submit shipment: ${error.response?.data?.message || error.message}`);
    }
  };





  const handleImportData = async () => {
    if (!form.quotationRefNo) return;
    try {
      const res = await axios.get(
        `http://localhost:8000/shipment/quotation/${encodeURIComponent(
          form.quotationRefNo
        )}`
      );
      const data = res.data;

      const customer = data.custAddressBook
        ? [{ id: data.custAddressBook.id, name: data.custAddressBook.companyName }]
        : [];

      const productList = data.product
        ? [{
          id: data.product.id ?? 0,
          productId: data.product.productId,
          productName: data.product.productName,
          productType: data.product.productType || ""
        }]
        : [];

      const selectedProduct = productList.find(
        (p) => p.productId === data.product?.productId
      );
      const portMap = new Map<number, Option>();
      [data.polPort, data.podPort, data.transhipmentPort].forEach((p) => {
        if (p && !portMap.has(p.id)) {
          portMap.set(p.id, { id: p.id, name: p.portName });
        }
      });
      const port = Array.from(portMap.values());

      const agentMap = new Map<number, string>();

      const fetchAgentNameById = async (id: number) => {
        const res = await axios.get(`http://localhost:8000/addressbook/${id}`);
        return res.data.companyName;
      };

      if (data.expHandlingAgentAddressBook) {
        agentMap.set(
          data.expHandlingAgentAddressBook.id,
          data.expHandlingAgentAddressBook.companyName
        );
      } else if (data.expHandlingAgentAddressBookId) {
        const name = await fetchAgentNameById(data.expHandlingAgentAddressBookId);
        agentMap.set(data.expHandlingAgentAddressBookId, name);
      }

      if (data.impHandlingAgentAddressBook) {
        agentMap.set(
          data.impHandlingAgentAddressBook.id,
          data.impHandlingAgentAddressBook.companyName
        );
      } else if (
        data.impHandlingAgentAddressBookId &&
        !agentMap.has(data.impHandlingAgentAddressBookId)
      ) {
        const name = await fetchAgentNameById(data.impHandlingAgentAddressBookId);
        agentMap.set(data.impHandlingAgentAddressBookId, name);
      }

      const agent = Array.from(agentMap.entries()).map(([id, name]) => ({
        id,
        name
      }));

      const depot = [];
      if (data.emptyReturnAddressBook) {
        depot.push({
          id: data.emptyReturnAddressBook.id,
          name: data.emptyReturnAddressBook.companyName
        });
      } else if (data.emptyReturnAddressBookId) {
        const name = await fetchAgentNameById(data.emptyReturnAddressBookId);
        depot.push({
          id: data.emptyReturnAddressBookId,
          name
        });
      }

      const shippingTerm = data.shippingTerm
        ? [{ id: data.shippingTerm, name: data.shippingTerm }]
        : [];

      setSelectOptions({ customer, product: productList, port, agent, depot, shippingTerm });

      // FIX: First set the form with basic data - properly set customer display name
      const updatedForm = {
        ...form,
        shippingTerm: data.shippingTerm || "",
        customerName: data.custAddressBook?.id?.toString() || "",
        // FIX: Set the customer display name for the input field
        customerDisplayName: data.custAddressBook?.companyName || "",
        billingParty: data.billingParty || "",
        rateType: data.rateType || "",
        billingType: data.billingType || "",
        productId: selectedProduct?.id || "",
        productName: selectedProduct
          ? `${selectedProduct.productId} - ${selectedProduct.productName} - ${selectedProduct.productType}`
          : "",
        productDisplayName: selectedProduct
          ? `${selectedProduct.productId} - ${selectedProduct.productName} - ${selectedProduct.productType}`
          : "",
        portOfLoading: data.polPort?.id?.toString() || "",
        portOfLoadingName: data.polPort?.portName || "",
        portOfDischarge: data.podPort?.id?.toString() || "",
        portOfDischargeName: data.podPort?.portName || "",
        freeDays1: data.polFreeDays || "",
        detentionRate1: data.polDetentionRate || "",
        freeDays2: data.podFreeDays || "",
        detentionRate2: data.podDetentionRate || "",
        expHandlingAgent: (
          data.expHandlingAgentAddressBook?.id ||
          data.expHandlingAgentAddressBookId
        )?.toString() || "",
        expHandlingAgentName: data.expHandlingAgentAddressBook?.companyName || 
          (data.expHandlingAgentAddressBookId ? await fetchAgentNameById(data.expHandlingAgentAddressBookId) : ""),
        impHandlingAgent: (
          data.impHandlingAgentAddressBook?.id ||
          data.impHandlingAgentAddressBookId
        )?.toString() || "",
        impHandlingAgentName: data.impHandlingAgentAddressBook?.companyName || 
          (data.impHandlingAgentAddressBookId ? await fetchAgentNameById(data.impHandlingAgentAddressBookId) : ""),
        emptyReturnDepot: (
          data.emptyReturnAddressBook?.id || data.emptyReturnAddressBookId
        )?.toString() || "",
        emptyReturnDepotName: data.emptyReturnAddressBook?.companyName || 
          (data.emptyReturnAddressBookId ? await fetchAgentNameById(data.emptyReturnAddressBookId) : ""),
        enableTranshipmentPort: !!data.transhipmentPort,
        transhipmentPortName: data.transhipmentPort
          ? data.transhipmentPort.id.toString()
          : undefined,
      };

      // Set the form first
      setForm(updatedForm);

      // FIX: After setting the form, fetch the filtered agents and depots
      const fetchPromises = [];
      
      if (data.polPort?.id) {
        fetchPromises.push(fetchExpHandlingAgentsByPort(data.polPort.id));
      }
      
      if (data.podPort?.id) {
        fetchPromises.push(fetchImpHandlingAgentsByPort(data.podPort.id));
        fetchPromises.push(fetchEmptyReturnDepotsByPort(data.podPort.id));
      }

      // Wait for all filtered data to be fetched
      await Promise.all(fetchPromises);

    } catch (err) {
      console.error("Failed to import data from quotation", err);
      alert("Quotation not found or fetch error");
    }
  };


  useEffect(() => {
    const fetchNextJobNumber = async () => {
      try {
        const res = await axios.get("http://localhost:8000/shipment/next-job-number");
        setForm((prev: any) => ({
          ...prev,
          jobNumber: res.data.jobNumber || "",
        }));
      } catch (err) {
        console.error("Failed to fetch job number", err);
      }
    };

    if (!form.id) {
      fetchNextJobNumber();
    }
  }, []);


  useEffect(() => {
    const fetchConsignee: () => Promise<void> = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const consignee = data.filter(
          (entry: any) =>
            entry.businessType &&
            entry.businessType.includes("Consignee")
        );
        setConsigneeSuggestions(consignee);
      } catch (err) {
        console.error("Error fetching consignee:", err);
      }
    };

    fetchConsignee();
  }, []);


  useEffect(() => {
    const fetchShipper: () => Promise<void> = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const shipper = data.filter(
          (entry: any) =>
            entry.businessType &&
            entry.businessType.includes("Shipper")
        );
        setShipperSuggestions(shipper);
      } catch (err) {
        console.error("Error fetching shipper:", err);
      }
    };

    fetchShipper();
  }, []);



  useEffect(() => {
    const fetchCarrier: () => Promise<void> = async () => {
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

  useEffect(() => {
    if (form.etaToPod && form.freeDays2) {
      const etaDate = new Date(form.etaToPod);
      const freeDays = parseInt(form.freeDays2, 10);

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
  }, [form.etaToPod, form.freeDays2]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("http://localhost:8000/inventory");
        const data = await res.json();
        setAllInventories(data);
      } catch (error) {
        console.error("Error fetching inventories:", error);
      }
    };

    fetchInventory();
  }, []);
  const getContainerSize = (inventoryId: number) => {
    const inv = allInventories.find((i) => i.id === inventoryId);
    return inv?.containerSize || "N/A";
  };


  // --- UI Starts Here - Updated with AddProductForm styling ---
  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-lg">
      <Dialog open onOpenChange={onClose}>
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          className="!w-[90vw] !max-w-[1200px] min-w-0 bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-0 border border-neutral-800"
        >
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {formTitle}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
            {/* Import Data from Quotation */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">Import Data from Quotation</h3>
              </div>
              <div className="flex items-end gap-4 w-full p-2 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                <div className="flex-1">
                  <Label htmlFor="quotationRefNo" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                    Quotation Reference Number
                  </Label>
                  <Input
                    id="quotationRefNo"
                    type="text"
                    value={form.quotationRefNo || ""}
                    onChange={(e) => setForm({ ...form, quotationRefNo: e.target.value })}
                    placeholder="Enter quotation reference number"
                    className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    Import shipping details from an existing quotation to auto-fill similar fields.
                  </p>
                </div>
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded mb-5"
                  onClick={handleImportData}
                >
                  Import Data
                </Button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                  Basic Information
                </h3>
              </div>
              <div className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 bg-white dark:bg-neutral-900 rounded">
                  <div>
                    <Label htmlFor="date" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Date (DD/MM/YY) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date || ""}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobNumber" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Job Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="jobNumber"
                      type="text"
                      value={form.jobNumber || ""}
                      onChange={(e) => setForm({ ...form, jobNumber: e.target.value })}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="referenceNumber" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Reference Number
                    </Label>
                    <Input
                      id="referenceNumber"
                      type="text"
                      value={form.referenceNumber || ""}
                      onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="masterBL" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Master BL
                    </Label>
                    <Input
                      id="masterBL"
                      type="text"
                      value={form.masterBL || ""}
                      onChange={(e) => setForm({ ...form, masterBL: e.target.value })}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingTerm" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Shipment Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.shippingTerm || ""}
                      onValueChange={(value) => setForm({ ...form, shippingTerm: value })}
                      disabled={!!form.quotationRefNo}
                    >
                      <SelectTrigger
                        className={`w-full p-2 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 ${
                          form.quotationRefNo
                            ? "cursor-not-allowed opacity-75"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select Shipping Term" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 text-white border border-neutral-700">
                        {selectOptions.shippingTerm.map((term) => (
                          <SelectItem key={term.id} value={term.id.toString()}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <Label htmlFor="customerName" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Customer Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={form.customerDisplayName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          customerDisplayName: e.target.value,
                          customerName: null,
                        }));
                        toggleSuggestions('customer', true);
                      }}
                      onFocus={() => toggleSuggestions('customer', true)}
                      onBlur={() => setTimeout(() => toggleSuggestions('customer', false), 150)}
                      placeholder="Start typing customer name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.customer && form.customerDisplayName && (
                      <div className="absolute z-[9999] w-full mt-1 max-h-40 overflow-hidden">
                        <ul className="bg-neutral-800 border border-neutral-700 rounded shadow-lg max-h-40 overflow-y-auto">
                          {customerSuggestions
                            .filter((c) =>
                              c.companyName.toLowerCase().includes(form.customerDisplayName.toLowerCase())
                            )
                            .slice(0, 10) // Limit to 10 results to prevent overflow
                            .map((company) => (
                              <li
                                key={company.id}
                                onMouseDown={() => {
                                  setForm((prev: any) => ({
                                    ...prev,
                                    customerDisplayName: company.companyName,
                                    customerName: company.id,
                                  }));
                                  toggleSuggestions('customer', false);
                                }}
                                className="px-3 py-2 hover:bg-neutral-700 cursor-pointer text-sm text-white border-b border-neutral-600 last:border-b-0"
                              >
                                {company.companyName}
                              </li>
                            ))}
                          {customerSuggestions.filter((c) =>
                            c.companyName.toLowerCase().includes(form.customerDisplayName?.toLowerCase())
                          ).length === 0 && (
                            <li className="px-3 py-2 text-neutral-400 text-sm">
                              No match found
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Product Name - Fix dropdown positioning */}
                  <div className="relative">
                    <Label htmlFor="productName" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="productName"
                      type="text"
                      value={form.productDisplayName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          productDisplayName: e.target.value,
                          productId: null,
                          productName: null,
                        }));
                        toggleSuggestions('product', true);
                      }}
                      onFocus={() => toggleSuggestions('product', true)}
                      onBlur={() => setTimeout(() => toggleSuggestions('product', false), 150)}
                      placeholder="Start typing product name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.product && form.productDisplayName && (
                      <div className="absolute z-[9999] w-full mt-1 max-h-40 overflow-hidden">
                        <ul className="bg-neutral-800 border border-neutral-700 rounded shadow-lg max-h-40 overflow-y-auto">
                          {productSuggestions
                            .filter((p) =>
                              `${p.productId} - ${p.productName} - ${p.productType}`.toLowerCase().includes(form.productDisplayName.toLowerCase())
                            )
                            .slice(0, 10) // Limit to 10 results
                            .map((product) => (
                              <li
                                key={product.id}
                                onMouseDown={() => {
                                  const displayName = `${product.productId} - ${product.productName} - ${product.productType}`;
                                  setForm((prev: any) => ({
                                    ...prev,
                                    productDisplayName: displayName,
                                    productId: product.id,
                                    productName: displayName,
                                  }));
                                  toggleSuggestions('product', false);
                                }}
                                className="px-3 py-2 hover:bg-neutral-700 cursor-pointer text-sm text-white border-b border-neutral-600 last:border-b-0"
                              >
                                {`${product.productId} - ${product.productName} - ${product.productType}`}
                              </li>
                            ))}
                          {productSuggestions.filter((p) =>
                            `${p.productId} - ${p.productName} - ${p.productType}`.toLowerCase().includes(form.productDisplayName?.toLowerCase())
                          ).length === 0 && (
                            <li className="px-3 py-2 text-neutral-400 text-sm">
                              No match found
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Consignee Name - Fix dropdown visibility */}
                  <div className="relative">
                    <Label htmlFor="consigneeName" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Consignee Name
                    </Label>
                    <Input
                      id="consigneeName"
                      type="text"
                      value={form.consigneeName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          consigneeName: e.target.value,
                          consigneeId: null,
                        }));
                        toggleSuggestions('consignee', true);
                      }}
                      onFocus={() => toggleSuggestions('consignee', true)}
                      onBlur={() => setTimeout(() => toggleSuggestions('consignee', false), 150)}
                      placeholder="Start typing consignee name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.consignee && form.consigneeName && (
                      <ul className="absolute z-[9999] w-full bg-neutral-800 border border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {consigneeSuggestions
                          .filter((c) =>
                            c.companyName.toLowerCase().includes(form.consigneeName.toLowerCase())
                          )
                          .map((company) => (
                            <li
                              key={company.id}
                              onMouseDown={() => {
                                setForm((prev: any) => ({
                                  ...prev,
                                  consigneeName: company.companyName,
                                  consigneeId: company.id,
                                }));
                                toggleSuggestions('consignee', false);
                              }}
                              className="px-3 py-1 hover:bg-neutral-700 cursor-pointer text-sm text-white"
                            >
                              {company.companyName}
                            </li>
                          ))}
                        {consigneeSuggestions.filter((c) =>
                          c.companyName.toLowerCase().includes(form.consigneeName?.toLowerCase())
                        ).length === 0 && (
                          <li className="px-3 py-1 text-neutral-400 text-sm">
                            No match found
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Shipper Name - Fix dropdown visibility */}
                  <div className="relative">
                    <Label htmlFor="shipperName" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Shipper Name
                    </Label>
                    <Input
                      id="shipperName"
                      type="text"
                      value={form.shipperName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          shipperName: e.target.value,
                          shipperId: null,
                        }));
                        toggleSuggestions('shipper', true);
                      }}
                      onFocus={() => toggleSuggestions('shipper', true)}
                      onBlur={() => setTimeout(() => toggleSuggestions('shipper', false), 150)}
                      placeholder="Start typing shipper name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.shipper && form.shipperName && (
                      <ul className="absolute z-[9999] w-full bg-neutral-800 border border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {shipperSuggestions
                          .filter((c) =>
                            c.companyName.toLowerCase().includes(form.shipperName.toLowerCase())
                          )
                          .map((company) => (
                            <li
                              key={company.id}
                              onMouseDown={() => {
                                setForm((prev: any) => ({
                                  ...prev,
                                  shipperName: company.companyName,
                                  shipperId: company.id,
                                }));
                                toggleSuggestions('shipper', false);
                              }}
                              className="px-3 py-1 hover:bg-neutral-700 cursor-pointer text-sm text-white"
                            >
                              {company.companyName}
                            </li>
                          ))}
                        {shipperSuggestions.filter((c) =>
                          c.companyName.toLowerCase().includes(form.shipperName?.toLowerCase())
                        ).length === 0 && (
                          <li className="px-3 py-1 text-neutral-400 text-sm">
                            No match found
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Port Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                  Port Information
                </h3>
              </div>
              <div className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 bg-white dark:bg-neutral-900 rounded">
                  {/* Port of Loading - Fix dropdown visibility */}
                  <div className="relative">
                    <Label htmlFor="portOfLoading" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Port of Loading <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="portOfLoading"
                      type="text"
                      value={form.portOfLoadingName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          portOfLoadingName: e.target.value,
                          portOfLoading: null,
                        }));
                        toggleSuggestions('portLoading', true);
                      }}
                      onFocus={() => toggleSuggestions('portLoading', true)}
                      onBlur={() => setTimeout(() => toggleSuggestions('portLoading', false), 150)}
                      placeholder="Start typing port name..."
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.portLoading && form.portOfLoadingName && (
                      <ul className="absolute z-[9999] w-full bg-neutral-800 border border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {portSuggestions
                          .filter((p) =>
                            p.portName.toLowerCase().includes(form.portOfLoadingName.toLowerCase())
                          )
                          .map((port) => (
                            <li
                              key={port.id}
                              onMouseDown={() => {
                                setForm((prev: any) => ({
                                  ...prev,
                                  portOfLoadingName: port.portName,
                                  portOfLoading: port.id,
                                }));
                                toggleSuggestions('portLoading', false);
                                
                                // Trigger fetching of EXP handling agents when port is selected
                                fetchExpHandlingAgentsByPort(port.id);
                              }}
                              className="px-3 py-1 hover:bg-neutral-700 cursor-pointer text-sm text-white"
                            >
                              {port.portName}
                            </li>
                          ))}
                        {portSuggestions.filter((p) =>
                          p.portName.toLowerCase().includes(form.portOfLoadingName?.toLowerCase())
                        ).length === 0 && (
                          <li className="px-3 py-1 text-neutral-400 text-sm">
                            No match found
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Port of Discharge - Fix dropdown visibility */}
                  <div className="relative">
                    <Label htmlFor="portOfDischarge" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Port of Discharge <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="portOfDischarge"
                      type="text"
                      value={form.portOfDischargeName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          portOfDischargeName: e.target.value,
                          portOfDischarge: null,
                        }));
                        toggleSuggestions('portDischarge', true);
                      }}
                      onFocus={() => toggleSuggestions('portDischarge', true)}
                      onBlur={() => setTimeout(() => toggleSuggestions('portDischarge', false), 150)}
                      placeholder="Start typing port name..."
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.portDischarge && form.portOfDischargeName && (
                      <ul className="absolute z-[9999] w-full bg-neutral-800 border border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {portSuggestions
                          .filter((p) =>
                            p.portName.toLowerCase().includes(form.portOfDischargeName.toLowerCase())
                          )
                          .map((port) => (
                            <li
                              key={port.id}
                              onMouseDown={() => {
                                setForm((prev: any) => ({
                                  ...prev,
                                  portOfDischargeName: port.portName,
                                  portOfDischarge: port.id,
                                }));
                                toggleSuggestions('portDischarge', false);
                                
                                // Trigger fetching of IMP handling agents and depots when port is selected
                                fetchImpHandlingAgentsByPort(port.id);
                                fetchEmptyReturnDepotsByPort(port.id);
                              }}
                              className="px-3 py-1 hover:bg-neutral-700 cursor-pointer text-sm text-white"
                            >
                              {port.portName}
                            </li>
                          ))}
                        {portSuggestions.filter((p) =>
                          p.portName.toLowerCase().includes(form.portOfDischargeName?.toLowerCase())
                        ).length === 0 && (
                          <li className="px-3 py-1 text-neutral-400 text-sm">
                            No match found
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  <div className="flex w-full gap-4 col-span-2">
                    <div className="flex-1">
                      <Label htmlFor="freeDays1" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                        Free Days
                      </Label>
                      <Input
                        id="freeDays1"
                        type="text"
                        value={form.freeDays1 || ""}
                        onChange={(e) => setForm({ ...form, freeDays1: e.target.value })}
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="detentionRate1" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                        Detention Rate
                      </Label>
                      <Input
                        id="detentionRate1"
                        type="text"
                        value={form.detentionRate1 || ""}
                        onChange={(e) => setForm({ ...form, detentionRate1: e.target.value })}
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="freeDays2" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                        Free Days
                      </Label>
                      <Input
                        id="freeDays2"
                        type="text"
                        value={form.freeDays2 || ""}
                        onChange={(e) => setForm({ ...form, freeDays2: e.target.value })}
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="detentionRate2" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                        Detention Rate
                      </Label>
                      <Input
                        id="detentionRate2"
                        type="text"
                        value={form.detentionRate2 || ""}
                        onChange={(e) => setForm({ ...form, detentionRate2: e.target.value })}
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
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
                    <div>
                      <Label htmlFor="transhipmentPortName" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                        Transhipment Port
                      </Label>
                      <Select
                        value={form.transhipmentPortName || ""}
                        onValueChange={(value) => setForm({ ...form, transhipmentPortName: value })}
                      >
                        <SelectTrigger className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700">
                          <SelectValue placeholder="Select Transhipment Port" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 text-white border border-neutral-700">
                          {selectOptions.port.length > 0 ? (
                            selectOptions.port.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()} className="text-white">
                                {p.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-port" disabled>No ports available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Handling Agents */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white text-base font-semibold">
                  Handling Agents
                </h3>
              </div>
              <div className="w-full p-2 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {/* EXP Handling Agent - Change to select dropdown */}
                  <div>
                    <Label htmlFor="expHandlingAgent" className="block text-sm text-neutral-200 mb-1">
                      EXP Handling Agent <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="expHandlingAgent"
                      value={form.expHandlingAgent || ""}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selected = expAgents.find((a) => a.id === selectedId);
                        setForm((prev: any) => ({
                          ...prev,
                          expHandlingAgent: selectedId.toString(),
                          expHandlingAgentName: selected?.companyName || "",
                        }));
                      }}
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    >
                      <option value="">
                        {!form.portOfLoading ? "First Select Port of Loading" : "Select Handling Agent"}
                      </option>
                      {Array.isArray(expAgents) && expAgents.length > 0 ? (
                        expAgents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.companyName}
                          </option>
                        ))
                      ) : (
                        form.portOfLoading && expAgents.length === 0 && (
                          <option value="" disabled>
                            Loading agents...
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* IMP Handling Agent - Change to select dropdown */}
                  <div>
                    <Label htmlFor="impHandlingAgent" className="block text-sm text-neutral-200 mb-1">
                      IMP Handling Agent <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="impHandlingAgent"
                      value={form.impHandlingAgent || ""}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selected = impHandlingAgents.find((a) => a.id === selectedId);
                        setForm((prev: any) => ({
                          ...prev,
                          impHandlingAgent: selectedId.toString(),
                          impHandlingAgentName: selected?.companyName || "",
                        }));
                      }}
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    >
                      <option value="">
                        {!form.portOfDischarge ? "First Select Port of Discharge" : "Select Handling Agent"}
                      </option>
                      {Array.isArray(impHandlingAgents) && impHandlingAgents.length > 0 ? (
                        impHandlingAgents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.companyName}
                          </option>
                        ))
                      ) : (
                        form.portOfDischarge && impHandlingAgents.length === 0 && (
                          <option value="" disabled>
                            Loading agents...
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Container Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white text-base font-semibold">
                  Add Inventory
                </h3>
              </div>
              <div className="w-full p-2 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                <div className="mb-4 bg-white dark:bg-neutral-900 rounded">
                  <Label htmlFor="quantity" className="block text-sm text-neutral-200 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="text"
                    value={form.quantity || ""}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                  />
                </div>
                <div className="relative mb-4 bg-white dark:bg-neutral-900 rounded">
                  <Label htmlFor="containerNumber" className="block text-sm text-neutral-200 mb-1">
                    Container No.
                  </Label>
                  <div className="flex">
                    <Input
                      id="containerNumber"
                      type="text"
                      value={form.containerNumber || ""}
                      onChange={(e) => handleContainerSearch(e.target.value)}
                      placeholder="Type at least 2 characters"
                      className="rounded-l w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700"
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
                  <div className="mt-6 bg-white dark:bg-neutral-900 rounded">
                    <h5 className="text-gray-900 dark:text-white text-sm font-semibold mb-2">
                      Selected Containers
                    </h5>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white dark:bg-neutral-900 border-b border-neutral-700">
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs">Container No</TableHead>
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs">Capacity</TableHead>
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs">Tare</TableHead>
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs">Last Location</TableHead>
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs">Size</TableHead>
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedContainers.map((item: any, index: number) => (
                          <TableRow key={index} className="border-t border-neutral-700">
                            <TableCell className="text-gray-900 dark:text-white">
                              {item.inventory?.containerNumber ||
                                item.containerNumber ||
                                "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                              {(item.inventory?.capacity || item.capacity || "N/A") +
                                " " +
                                (item.inventory?.capacityUnit || "")}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                              {item.tare || item.inventory?.tare || "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                              {(item.depotName || "N/A") + " - " + (item.port?.portName || "N/A")}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                              {getContainerSize(item.inventoryId)}
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


            {/* Vessel Details - Fix carrier dropdown visibility */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white text-base font-semibold">
                  Vessel Details
                </h3>
              </div>
              <div className="w-full p-2 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="relative">
                    <Label htmlFor="carrierName" className="block text-sm text-neutral-200 mb-1">
                      Carrier Name
                    </Label>
                    <Input
                      id="carrierName"
                      type="text"
                      value={form.carrierName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          carrierName: e.target.value,
                          carrierId: null,
                        }));
                        toggleSuggestions('carrier', true);
                      }}
                      onFocus={() => toggleSuggestions('carrier', true)}
                      onBlur={() => setTimeout(() => toggleSuggestions('carrier', false), 150)}
                      placeholder="Start typing carrier name..."
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.carrier && form.carrierName && (
                      <ul className="absolute z-[9999] w-full bg-neutral-800 border border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {carrierSuggestions
                          .filter((c) =>
                            c.companyName.toLowerCase().includes(form.carrierName.toLowerCase())
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
                                toggleSuggestions('carrier', false);
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
                    <Label htmlFor="vesselName" className="block text-sm text-neutral-200 mb-1">
                      Vessel Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vesselName"
                      type="text"
                      value={form.vesselName || ""}
                      onChange={(e) => setForm({ ...form, vesselName: e.target.value })}
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gateClosingDate" className="block text-sm text-neutral-200 mb-1">
                      Gate Closing Date
                    </Label>
                    <Input
                      id="gateClosingDate"
                      type="date"
                      value={form.gateClosingDate || ""}
                      onChange={(e) => setForm({ ...form, gateClosingDate: e.target.value })}
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sobDate" className="block text-sm text-neutral-200 mb-1">
                      SOB Date
                    </Label>
                    <Input
                      id="sobDate"
                      type="date"
                      value={form.sobDate || ""}
                      onChange={(e) => setForm({ ...form, sobDate: e.target.value })}
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="etaToPod" className="block text-sm text-neutral-200 mb-1">
                      ETA to PoD
                    </Label>
                    <Input
                      id="etaToPod"
                      type="date"
                      value={form.etaToPod || ""}
                      onChange={(e) => setForm({ ...form, etaToPod: e.target.value })}
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Return Depot Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                  Return Depot Information
                </h3>
              </div>
                          
                           <div className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 bg-white dark:bg-neutral-900 rounded">
                  {/* Empty Return Depot - Replace with select dropdown */}
                  <div>
                    <Label htmlFor="emptyReturnDepot" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
                      Empty Return Depot <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="emptyReturnDepot"
                      value={form.emptyReturnDepot || ""}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selected = emptyReturnDepots.find((d) => d.id === selectedId);
                        setForm((prev: any) => ({
                          ...prev,
                          emptyReturnDepot: selectedId.toString(),
                          emptyReturnDepotName: selected?.companyName || "",
                        }));
                      }}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    >
                      <option value="">
                        {!form.portOfDischarge ? "First Select Port of Discharge" : "Select Depot"}
                      </option>
                      {Array.isArray(emptyReturnDepots) && emptyReturnDepots.length > 0 ? (
                        emptyReturnDepots.map((depot) => (
                          <option key={depot.id} value={depot.id}>
                            {depot.companyName} - {depot.businessType}
                          </option>
                        ))
                      ) : (
                        form.portOfDischarge && emptyReturnDepots.length === 0 && (
                          <option value="" disabled>
                            Loading depots...
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="estimatedEmptyReturnDate" className="block text-sm text-neutral-200 mb-1">
                      Estimated Empty Return Date
                    </Label>
                    <Input
                      id="estimatedEmptyReturnDate"
                      type="date"
                      value={form.estimatedEmptyReturnDate || ""}
                      onChange={(e) => setForm({ ...form, estimatedEmptyReturnDate: e.target.value })}
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <DialogFooter className="flex justify-end px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-gray-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 cursor-pointer"
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