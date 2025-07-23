"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const AddQuotationModal = ({
  onClose,
  formTitle,
  form,
  setForm,
  fetchQuotations,
}: any) => {
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [portSuggestions, setPortSuggestions] = useState<any[]>([]);
  const [showPortDropdown, setShowPortDropdown] = useState(false);
  const [showDischargeDropdown, setShowDischargeDropdown] = useState(false);
  const [expDepots, setExpDepots] = useState<
    { id: number; companyName: string }[]
  >([]);
  const [emptyReturnDepots, setEmptyReturnDepots] = useState<
    { id: number; companyName: string }[]
  >([]);
  const [expAgents, setExpAgents] = useState<
    { id: number; companyName: string }[]
  >([]);
  const [impHandlingAgents, setImpHandlingAgents] = useState<
    { id: number; companyName: string }[]
  >([]);
  const [transhipmentPortSuggestions, setTranshipmentPortSuggestions] =
    useState<any[]>([]);
  const [showTranshipmentDropdown, setShowTranshipmentDropdown] =
    useState(false);
  const [trsHandlingAgents, setTrsHandlingAgents] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Required field validations
    const requiredFields = [
      { field: "productId", message: "Please select a product" },
      { field: "customerId", message: "Please select a customer" },
      { field: "portOfLoadingId", message: "Please select a port of loading" },
      {
        field: "portOfDischargeId",
        message: "Please select a port of discharge",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!form[field]) {
        alert(message);
        return;
      }
    }

    // Ensure none of the string fields are null
    const ensureString = (value: any) =>
      value === null || value === undefined ? "" : value;

    // Use existing dates for edit mode or set new dates for new records
    let effectiveDate, validTillDate;

    if (form.isEditing && form.effectiveDate && form.validTillDate) {
      effectiveDate = new Date(form.effectiveDate).toISOString();
      validTillDate = new Date(form.validTillDate).toISOString();
    } else {
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      effectiveDate = today.toISOString();
      validTillDate = sevenDaysLater.toISOString();
    }

    const payload = {
      quotationRefNumber: form.quotationRef,
      status: form.status ? "ACTIVE" : "INACTIVE",
      effectiveDate: effectiveDate,
      validTillDate: validTillDate,
      shippingTerm: form.shippingTerm || "",
      custAddressBookId: Number(form.customerId),
      billingParty: form.billingParty || "",
      rateType: form.rateType || "",
      billingType: form.billingType || "",
      productId: Number(form.productId),
      polPortId: Number(form.portOfLoadingId),
      podPortId: Number(form.portOfDischargeId),
      polFreeDays: form.expFreeDays || "",
      podFreeDays: form.impFreeDays || "",
      polDetentionRate: form.expDetentionRate || "",
      podDetentionRate: form.impDetentionRate || "",
      expDepotAddressBookId: Number(form.expDepotId),
      emptyReturnAddressBookId: Number(form.emptyReturnDepot),
      expHandlingAgentAddressBookId: Number(form.expHAgentId),
      impHandlingAgentAddressBookId: Number(form.impHAgentId),
      transitDays: form.transitDays || "",
      transhipmentPortId: form.enableTranshipmentPort
        ? Number(form.transhipmentPortId)
        : null,
      transhipmentHandlingAgentAddressBookId: form.enableTranshipmentPort
        ? Number(form.transhipmentAgentId)
        : null,
      slotRate: ensureString(form.slotRate),
      depotAvgCost: ensureString(form.depotAvgCost),
      leasingCost: form.leasingCost,
      depotCleaningCost: ensureString(form.depotCleaningCost),
      terminalHandlingFee: ensureString(form.terminalHandlingFee),
      containerPreparationCost: form.containerPreparationCost,
      expAgencyCommission: ensureString(form.expAgencyCommission),
      impAgencyCommission: ensureString(form.impAgencyCommission),
      expCollectionCharges: ensureString(form.expCollection),
      impCollectionCharges: ensureString(form.impCollection),
      totalCost: ensureString(form.totalCost),
      sellingAmount: ensureString(form.sellingAmount),
      totalRevenueAmount: form.totalRevenueAmount,
      totalPLAmount: form.totalPLAmount,
      plMargin: ensureString(form.plMargin),
    };

    try {
      const method = form.id ? "PATCH" : "POST";
      const url = form.id
        ? `http://localhost:8000/quotations/${form.id}`
        : "http://localhost:8000/quotations";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save quotation");

      const result = await res.json();
      fetchQuotations?.(); // Optional: Refresh parent data
      onClose();
    } catch (err) {
      console.error("Error submitting quotation:", err);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const customers = data.filter(
          (entry: any) =>
            entry.businessType && entry.businessType.includes("Customer")
        );
        setCustomerSuggestions(customers);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    // Set default form values if creating a new quote
    if (!form.id) {
      setForm((prev: any) => ({
        ...prev,
        effectiveDate: prev.effectiveDate || formatDate(today),
        validTillDate: prev.validTillDate || formatDate(sevenDaysLater),
      }));
    }

    const fetchNextRef = async () => {
      try {
        if (!form.quotationRef) {
          const res = await fetch("http://localhost:8000/quotations/next-ref");
          const data = await res.json();
          setForm((prev: any) => ({
            ...prev,
            quotationRef: data.quotationRefNumber,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch quotation ref:", error);
      }
    };

    fetchNextRef();
  }, []);

  const fetchProducts = async (searchTerm: string) => {
    try {
      const res = await fetch("http://localhost:8000/products");
      const data = await res.json();

      const filtered = data.filter((product: any) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProductSuggestions(filtered);
    } catch (error) {
      console.error("Error fetching products:", error);
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

  const fetchExpDepotsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://localhost:8000/addressbook");
      const data = await res.json();
      console.log("Fetched AddressBook:", data);

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

      console.log("Filtered Exp Depots:", filtered);
      setExpDepots(filtered);
    } catch (err) {
      console.error("Failed to fetch Exp. Depots:", err);
    }
  };

  useEffect(() => {
    if (form.portOfLoadingId) {
      fetchExpDepotsByPort(form.portOfLoadingId);
    } else {
      setExpDepots([]);
    }
  }, [form.portOfLoadingId]);

  const fetchEmptyReturnDepotsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://localhost:8000/addressbook");
      const data = await res.json();
      console.log("Fetched address book data:", data); // ✅ check actual data

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

      console.log("Filtered Depots:", filtered); // ✅ check final result
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
  const fetchTrsHandlingAgents = async (portId: number) => {
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

      setTrsHandlingAgents(filtered);
    } catch (err) {
      console.error("Failed to fetch TRS H. Agents:", err);
    }
  };
  useEffect(() => {
    if (form.enableTranshipmentPort && form.transhipmentPortId) {
      fetchTrsHandlingAgents(form.transhipmentPortId);
    } else {
      setTrsHandlingAgents([]);
    }
  }, [form.transhipmentPortId, form.enableTranshipmentPort]);

  const calculateLeasingCost = async (product: any) => {
    try {
      const res = await fetch("http://localhost:8000/container-lease-tariff");
      const data = await res.json();

      const matchedTariff = data.find(
        (t: any) =>
          t.containerCategory === product.containerCategory &&
          t.containerType === product.containerType &&
          t.containerClass === product.classType
      );

      if (!matchedTariff) {
        console.warn("No lease tariff matched.");
        return;
      }

      const leasePerDay = parseFloat(matchedTariff.leaseRentPerDay || "0");

      const exp = parseInt(form.expFreeDays || "0");
      const imp = parseInt(form.impFreeDays || "0");
      const transit = parseInt(form.transitDays || "0");

      const totalDays = exp + imp + transit;
      const leasingCost = leasePerDay * totalDays;

      setForm((prev: any) => ({
        ...prev,
        leasingCost: leasingCost.toFixed(2),
      }));
    } catch (err) {
      console.error("Error fetching lease tariff:", err);
    }
  };

  useEffect(() => {
    const parse = (val: string) => parseFloat(val) || 0;

    const totalCost =
      parse(form.slotRate) +
      parse(form.depotAvgCost) +
      parse(form.leasingCost) +
      parse(form.depotCleaningCost) +
      parse(form.terminalHandlingFee) +
      parse(form.containerPreparationCost) +
      parse(form.expAgencyCommission) +
      parse(form.impAgencyCommission);

    const selling = parse(form.sellingAmount);
    const expCollection = parse(form.expCollection);
    const impCollection = parse(form.impCollection);

    const totalRevenue = selling + expCollection + impCollection;
    const totalPL = selling - totalCost;
    const plMargin = selling ? ((totalPL / selling) * 100).toFixed(2) : "0";

    setForm((prev: any) => ({
      ...prev,
      totalCost: totalCost.toFixed(2),
      totalRevenueAmount: totalRevenue.toFixed(2),
      totalPLAmount: totalPL.toFixed(2),
      plMargin,
    }));
  }, [
    form.slotRate,
    form.depotAvgCost,
    form.leasingCost,
    form.depotCleaningCost,
    form.terminalHandlingFee,
    form.containerPreparationCost,
    form.expAgencyCommission,
    form.impAgencyCommission,
    form.sellingAmount,
    form.expCollection,
    form.impCollection,
  ]);

  useEffect(() => {
    const recalcIfApplicable = async () => {
      if (
        form.productCategory === "Tank" &&
        form.productType === "ISO Tank" &&
        form.productClass === "T11"
      ) {
        const product = {
          containerCategory: form.productCategory,
          containerType: form.productType,
          classType: form.productClass,
        };
        calculateLeasingCost(product);
      }
    };

    recalcIfApplicable();
  }, [form.expFreeDays, form.impFreeDays, form.transitDays]);

  useEffect(() => {
    setForm((prev: any) => ({ ...prev, leasingCost: "" }));
  }, [form.productId]);

  useEffect(() => {
    const { productId, portOfDischargeId, emptyReturnDepot } = form;

    // If any of the required values are missing, reset depotCleaningCost
    if (!productId || !portOfDischargeId || !emptyReturnDepot) {
      setForm((prev: any) => ({
        ...prev,
        depotCleaningCost: "",
      }));
      return;
    }

    const calculateDepotCleaningCost = async () => {
      const { productId, portOfDischargeId, emptyReturnDepot } = form;

      if (!productId || !portOfDischargeId || !emptyReturnDepot) return;

      try {
        const [res, exchangeRes] = await Promise.all([
          fetch("http://localhost:8000/depot-cleaning-tariff-cost"),
          fetch("http://localhost:8000/exchange-rates"),
        ]);

        const [data, exchangeRateData] = await Promise.all([
          res.json(),
          exchangeRes.json(),
        ]);

        const matched = data.find(
          (item: any) =>
            Number(item.productId) === Number(productId) &&
            Number(item.portId) === Number(portOfDischargeId) &&
            Number(item.addressBookId) === Number(emptyReturnDepot)
        );

        if (matched) {
          const total = parseFloat(matched.cleaningCharges || "0");
          const currencyId = matched.currencyId;

          const exchange = exchangeRateData.find(
            (rate: any) => Number(rate.fromCurrencyId) === Number(currencyId)
          );

          const rate = exchange ? parseFloat(exchange.exchangeRate || "1") : 1;
          const variance = exchange ? parseFloat(exchange.variance || "0") : 0;
          const adjustedRate = rate + (rate * variance) / 100;

          const finalCleaningCost = total * adjustedRate;

          setForm((prev: any) => ({
            ...prev,
            depotCleaningCost: finalCleaningCost.toFixed(2),
          }));
        } else {
          setForm((prev: any) => ({
            ...prev,
            depotCleaningCost: "",
          }));
          console.warn("No depot cleaning cost matched.");
        }
      } catch (err) {
        console.error("Error fetching depot cleaning cost:", err);
        setForm((prev: any) => ({
          ...prev,
          depotCleaningCost: "",
        }));
      }
    };

    calculateDepotCleaningCost();
  }, [form.productId, form.portOfDischargeId, form.emptyReturnDepot]);

  useEffect(() => {
    const fetchDepotAvgTariff = async () => {
      try {
        const [tariffRes, currencyRes, exchangeRateRes] = await Promise.all([
          fetch("http://localhost:8000/depot-avg-tariff"),
          fetch("http://localhost:8000/currency"),
          fetch("http://localhost:8000/exchange-rates"),
        ]);

        const [tariffData, currencyData, exchangeRateData] = await Promise.all([
          tariffRes.json(),
          currencyRes.json(),
          exchangeRateRes.json(),
        ]);

        const getAdjustedTotal = (portId: number, depotId: number) => {
          const match = tariffData.find(
            (item: any) =>
              Number(item.portId) === Number(portId) &&
              Number(item.addressBookId) === Number(depotId)
          );

          if (!match) return 0;

          const total = parseFloat(match.total || "0");
          const currencyId = match.currencyId;

          const exchange = exchangeRateData.find(
            (rate: any) => Number(rate.fromCurrencyId) === Number(currencyId)
          );

          if (!exchange) return total;

          const rate = parseFloat(exchange.exchangeRate || "1");
          const variance = parseFloat(exchange.variance || "0");
          const adjustedRate = rate + (rate * variance) / 100;

          return total * adjustedRate;
        };

        // Guard clause to prevent running with incomplete data
        if (!form.portOfDischargeId || !form.emptyReturnDepot) return;

        // Only use POD (port of discharge) and its depot
        const total2 = getAdjustedTotal(
          form.portOfDischargeId,
          form.emptyReturnDepot
        );

        setForm((prev: any) => ({
          ...prev,
          depotAvgCost: total2.toFixed(2),
        }));
      } catch (err) {
        console.error("Failed to fetch depot avg tariff:", err);
        setForm((prev: any) => ({
          ...prev,
          depotAvgCost: "",
        }));
      }
    };

    fetchDepotAvgTariff(); // ✅ Now it's inside useEffect
  }, [form.portOfDischargeId, form.emptyReturnDepot]);

  useEffect(() => {
    // Special handling for edit mode to load all dependent data
    if (form.isEditing) {
      // Load customer suggestions
      if (form.customerId) {
        fetch("http://localhost:8000/addressbook")
          .then((res) => res.json())
          .then((data) => {
            const customers = data.filter(
              (entry: any) =>
                entry.businessType && entry.businessType.includes("Customer")
            );
            setCustomerSuggestions(customers);
          });
      }

      // Load product data
      if (form.productId) {
        fetchProducts(form.productName || "");
      }

      // Load port data and related entities
      if (form.portOfLoadingId) {
        fetchPorts(form.portOfLoading || "");
        fetchExpDepotsByPort(Number(form.portOfLoadingId));
        fetchExpHandlingAgentsByPort(Number(form.portOfLoadingId));
      }

      if (form.portOfDischargeId) {
        fetchPorts(form.portOfDischarge || "");
        fetchEmptyReturnDepotsByPort(Number(form.portOfDischargeId));
        fetchImpHandlingAgentsByPort(Number(form.portOfDischargeId));
      }

      // Load transhipment data if applicable
      if (form.enableTranshipmentPort && form.transhipmentPortId) {
        fetchTranshipmentPorts(form.transhipmentPortName || "");
        fetchTrsHandlingAgents(Number(form.transhipmentPortId));
      }

      if (form.product) {
        calculateLeasingCost(form.product);
      }
    }
  }, [form.isEditing]); // Only run when isEditing changes

  useEffect(() => {
    const fetchExpAgencyCommission = async () => {
      const portId = form.portOfLoadingId;
      const addressBookId = form.expHAgentId;

      if (!portId || !addressBookId) {
        setForm((prev: any) => ({
          ...prev,
          expAgencyCommission: "",
        }));
        return;
      }

      try {
        const [res, exchangeRes] = await Promise.all([
          fetch("http://localhost:8000/handling-agent-tariff-cost"),
          fetch("http://localhost:8000/exchange-rates"),
        ]);

        const [data, exchangeRateData] = await Promise.all([
          res.json(),
          exchangeRes.json(),
        ]);

        const matched = data.find(
          (item: any) =>
            Number(item.portId) === Number(portId) &&
            Number(item.addressBookId) === Number(addressBookId)
        );

        if (matched && matched.expCommission) {
          const total = parseFloat(matched.expCommission || "0");
          const currencyId = matched.currencyId;

          const exchange = exchangeRateData.find(
            (rate: any) => Number(rate.fromCurrencyId) === Number(currencyId)
          );

          const rate = exchange ? parseFloat(exchange.exchangeRate || "1") : 1;
          const variance = exchange ? parseFloat(exchange.variance || "0") : 0;
          const adjustedRate = rate + (rate * variance) / 100;

          const finalCommission = total * adjustedRate;

          setForm((prev: any) => ({
            ...prev,
            expAgencyCommission: finalCommission.toFixed(2),
          }));
        } else {
          setForm((prev: any) => ({
            ...prev,
            expAgencyCommission: "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch exp commission:", error);
        setForm((prev: any) => ({
          ...prev,
          expAgencyCommission: "",
        }));
      }
    };

    fetchExpAgencyCommission();
  }, [form.portOfLoadingId, form.expHAgentId]);

  useEffect(() => {
    const fetchImpAgencyCommission = async () => {
      const portId = form.portOfDischargeId;
      const addressBookId = form.impHAgentId;

      if (!portId || !addressBookId) {
        setForm((prev: any) => ({
          ...prev,
          impAgencyCommission: "",
        }));
        return;
      }

      try {
        const [res, exchangeRes] = await Promise.all([
          fetch("http://localhost:8000/handling-agent-tariff-cost"),
          fetch("http://localhost:8000/exchange-rates"),
        ]);

        const [data, exchangeRateData] = await Promise.all([
          res.json(),
          exchangeRes.json(),
        ]);

        const matched = data.find(
          (item: any) =>
            Number(item.portId) === Number(portId) &&
            Number(item.addressBookId) === Number(addressBookId)
        );

        if (matched && matched.impCommission) {
          const total = parseFloat(matched.impCommission || "0");
          const currencyId = matched.currencyId;

          const exchange = exchangeRateData.find(
            (rate: any) => Number(rate.fromCurrencyId) === Number(currencyId)
          );

          const rate = exchange ? parseFloat(exchange.exchangeRate || "1") : 1;
          const variance = exchange ? parseFloat(exchange.variance || "0") : 0;
          const adjustedRate = rate + (rate * variance) / 100;

          const finalCommission = total * adjustedRate;

          setForm((prev: any) => ({
            ...prev,
            impAgencyCommission: finalCommission.toFixed(2),
          }));
        } else {
          setForm((prev: any) => ({
            ...prev,
            impAgencyCommission: "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch imp commission:", error);
        setForm((prev: any) => ({
          ...prev,
          impAgencyCommission: "",
        }));
      }
    };

    fetchImpAgencyCommission();
  }, [form.portOfDischargeId, form.impHAgentId]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[1200px] max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800">
        <div className="flex justify-between items-center px-6 pt-6 pb-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{formTitle}</h2>
          <button
            onClick={onClose}
          className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        <form
          className="px-6 pb-6 pt-2 [&_label]:text-gray-900 [&_input]:bg-white [&_input]:text-gray-900 [&_select]:bg-white [&_select]:text-gray-900 dark:[&_label]:text-white dark:[&_input]:bg-neutral-900 dark:[&_input]:text-white dark:[&_select]:bg-neutral-900 dark:[&_select]:text-white"
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Status */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-900 dark:text-white">Status</span>
              <Checkbox
                id="status"
                checked={form.status}
                onCheckedChange={(checked) =>
                  setForm({ ...form, status: checked })
                }
              />
              <Label htmlFor="status" className="text-gray-900 dark:text-white text-sm">
                Active
              </Label>
            </div>
            <div></div>

            {/* Quotation Ref No. */}
            <div className="col-span-2">
              <Label htmlFor="quotationRef" className="block text-sm text-gray-900 dark:text-white mb-1">
                Quotation Ref No.
              </Label>
              <Input
                type="text"
                value={form.quotationRef || ""}
                readOnly
                id="quotationRef"
                className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800"
              />
            </div>

            {/* Effective Date */}
            <div>
              <Label htmlFor="effectiveDate" className="block text-sm text-gray-900 dark:text-white mb-1">
                Effective Date
              </Label>
              <Input
                type="date"
                value={form.effectiveDate || ""}
                onChange={(e) =>
                  setForm({ ...form, effectiveDate: e.target.value })
                }
                id="effectiveDate"
                className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800"
              />
            </div>

            {/* Valid Till */}
            <div>
              <Label htmlFor="validTillDate" className="block text-sm text-gray-900 dark:text-white mb-1">
                Valid Till
              </Label>
              <Input
                type="date"
                value={form.validTillDate || ""}
                onChange={(e) =>
                  setForm({ ...form, validTillDate: e.target.value })
                }
                id="validTillDate"
                className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800"
              />
            </div>

            {/* Shipping Term */}
            <div>
              <Label htmlFor="shippingTerm" className="block text-sm text-gray-900 dark:text-white mb-1">
                Shipping Term
              </Label>
              <Select onValueChange={(value) => setForm({ ...form, shippingTerm: value })} value={form.shippingTerm}>
              <SelectTrigger className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CY-CY">CY-CY</SelectItem>
                  <SelectItem value="CY-Door">CY-Door</SelectItem>
                  <SelectItem value="Door-CY">Door-CY</SelectItem>
                  <SelectItem value="Door-Door">Door-Door</SelectItem>
                  <SelectItem value="EX-WORK-CY">EX-WORK-CY</SelectItem>
                  <SelectItem value="EX-WORK-DOOR">EX-WORK-DOOR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer Name */}
            <div className="relative">
              <Label htmlFor="customerName" className="block text-sm text-gray-900 dark:text-white mb-1">
                Customer Name
              </Label>
              <Input
                type="text"
                value={form.customerName || ""}
                onChange={(e) => {
                  setForm((prev: any) => ({
                    ...prev,
                    customerName: e.target.value,
                    customerId: null,
                  }));
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                id="customerName"
                className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800"
                placeholder="Start typing customer name..."
              />
              {showSuggestions && form.customerName && (
                <ul className="absolute z-10 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded mt-1 max-h-40 overflow-y-auto">
                  {customerSuggestions
                    .filter((c) =>
                      c.companyName
                        .toLowerCase()
                        .includes(form.customerName.toLowerCase())
                    )
                    .map((company) => (
                      <li
                        key={company.id}
                        onMouseDown={() => {
                          setForm((prev: any) => ({
                            ...prev,
                            customerName: company.companyName,
                            customerId: company.id,
                          }));
                          setShowSuggestions(false);
                        }}
                        className="px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-sm text-gray-900 dark:text-white"
                      >
                        {company.companyName}
                      </li>
                    ))}
                  {customerSuggestions.filter((c) =>
                    c.companyName
                      .toLowerCase()
                      .includes(form.customerName?.toLowerCase())
                  ).length === 0 && (
                    <li className="px-3 py-1 text-gray-400 text-sm">
                      No match found
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Billing Party */}
            <div>
              <Label htmlFor="billingParty" className="block text-sm text-gray-900 dark:text-white mb-1">
                Billing Party
              </Label>
              <Select onValueChange={(value) => setForm({ ...form, billingParty: value })} value={form.billingParty}>
              <SelectTrigger className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Freight Forwarder">Freight Forwarder</SelectItem>
                  <SelectItem value="Shipper">Shipper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rate Type */}
            <div>
              <Label htmlFor="rateType" className="block text-sm text-gray-900 dark:text-white mb-1">
                Rate Type
              </Label>
              <Select onValueChange={(value) => setForm({ ...form, rateType: value })} value={form.rateType}>
              <SelectTrigger className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tender">Tender</SelectItem>
                  <SelectItem value="Spot">Spot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Billing Type */}
            <div>
              <Label htmlFor="billingType" className="block text-sm text-gray-900 dark:text-white mb-1">
                Billing Type
              </Label>
              <Select onValueChange={(value) => setForm({ ...form, billingType: value })} value={form.billingType}>
                <SelectTrigger className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ocean Freight">Ocean Freight</SelectItem>
                  <SelectItem value="Rental">Rental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Name */}
            <div className="relative">
              <Label htmlFor="productName" className="block text-sm text-gray-900 dark:text-white mb-1">
                Product Name
              </Label>
              <Input
                type="text"
                value={form.productName || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev: any) => ({
                    ...prev,
                    productName: value,
                    productId: undefined,
                  }));

                  if (value.length > 1) {
                    fetchProducts(value);
                    setShowProductDropdown(true);
                  } else {
                    setShowProductDropdown(false);
                    setProductSuggestions([]);
                  }
                }}
                onFocus={() => {
                  if (form.productName?.length > 1) {
                    fetchProducts(form.productName);
                    setShowProductDropdown(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowProductDropdown(false), 100);
                }}
                id="productName"
                className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
                placeholder="Start typing product name..."
              />

              {showProductDropdown && productSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-neutral-900 border border-neutral-800 rounded mt-1 max-h-40 overflow-y-auto">
                  {productSuggestions.map((product) => (
                    <li
                      key={product.id}
                      onMouseDown={async () => {
                        const updatedForm = {
                          ...form,
                          productName: `${product.productId} - ${product.productName} - ${product.productType}`,
                          productId: product.id,
                          productCategory: product.containerCategory,
                          productType: product.containerType,
                          productClass: product.classType,
                        };

                        setForm(updatedForm);
                        setShowProductDropdown(false);

                        try {
                          const res = await fetch(
                            "http://localhost:8000/container-lease-tariff"
                          );
                          const leaseTariffs = await res.json();

                          const matchedLease = leaseTariffs.find(
                            (lease: any) =>
                              lease.containerCategory ===
                                product.containerCategory &&
                              lease.containerType === product.containerType &&
                              lease.containerClass === product.classType
                          );

                          if (matchedLease) {
                            const exp = parseInt(form.expFreeDays || "0", 10);
                            const imp = parseInt(form.impFreeDays || "0", 10);
                            const transit = parseInt(
                              form.transitDays || "0",
                              10
                            );
                            const rent = parseFloat(
                              matchedLease.leaseRentPerDay || "0"
                            );

                            const leasingCost = (exp + imp + transit) * rent;

                            setForm((prev: any) => ({
                              ...prev,
                              leasingCost: leasingCost.toFixed(2),
                            }));
                          } else {
                            setForm((prev: any) => ({
                              ...prev,
                              leasingCost: "",
                            }));
                          }
                        } catch (error) {
                          console.error(
                            "Failed to fetch container lease tariff:",
                            error
                          );
                        }
                      }}
                      className="px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-sm text-gray-900 dark:text-white"
                    >
                      {`${product.productId} - ${product.productName} - ${product.productType}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <hr className="border-t border-gray-600 my-4 col-span-2" />

            {/* Port Of Loading */}
            <div className="relative">
              <Label htmlFor="portOfLoading" className="block text-sm text-gray-900 dark:text-white mb-1">
                Port Of Loading
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
                id="portOfLoading"
                className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
                placeholder="Start typing port of loading..."
              />

              {showPortDropdown && portSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-neutral-900 border border-neutral-800 rounded mt-1 max-h-40 overflow-y-auto">
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
                      className="px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-sm text-gray-900 dark:text-white"
                    >
                      {port.portName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Port Of Discharge */}
            <div className="relative">
              <Label htmlFor="portOfDischarge" className="block text-sm text-gray-900 dark:text-white mb-1">
                Port Of Discharge
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
                id="portOfDischarge"
                className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
                placeholder="Start typing port of discharge..."
              />

              {showDischargeDropdown && portSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-neutral-900 border border-neutral-800 rounded mt-1 max-h-40 overflow-y-auto">
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
                      className="px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-sm text-gray-900 dark:text-white"
                    >
                      {port.portName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Free Days and Detention Rate */}
            <div className="flex w-full gap-4 col-span-2">
              <div className="flex-5">
                <Label htmlFor="expFreeDays" className="block text-sm text-gray-900 dark:text-white mb-1">
                  Free Days
                </Label>
                <Input
                  type="text"
                  value={form.expFreeDays}
                  onChange={(e) =>
                    setForm({ ...form, expFreeDays: e.target.value })
                  }
                  id="expFreeDays"
                  className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
                />
              </div>

              <div className="flex-5 gap-1">
                <Label htmlFor="expDetentionRate" className="block text-sm text-gray-900 dark:text-white mb-1">
                  Detention Rate
                </Label>
                <Input
                  type="text"
                  value={form.expDetentionRate}
                  onChange={(e) =>
                    setForm({ ...form, expDetentionRate: e.target.value })
                  }
                  id="expDetentionRate"
                  className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
                />
              </div>

              <div className="flex-5">
                <Label htmlFor="impFreeDays" className="block text-sm text-gray-900 dark:text-white mb-1">
                  Free Days
                </Label>
                <Input
                  type="text"
                  value={form.impFreeDays}
                  onChange={(e) =>
                    setForm({ ...form, impFreeDays: e.target.value })
                  }
                  id="impFreeDays"
                  className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
                />
              </div>

              <div className="flex-5">
                <Label htmlFor="impDetentionRate" className="block text-sm text-gray-900 dark:text-white mb-1">
                  Detention Rate
                </Label>
                <Input
                  type="text"
                  value={form.impDetentionRate}
                  onChange={(e) =>
                    setForm({ ...form, impDetentionRate: e.target.value })
                  }
                  id="impDetentionRate"
                  className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
                />
              </div>
            </div>

            {/* Exp. Depot Name */}
            <div>
              <Label htmlFor="expDepotId" className="block text-sm text-gray-900 dark:text-white mb-1">
                Exp. Depot Name
              </Label>
              <Select onValueChange={(value) => {
                const selectedId = Number(value);
                const selectedDepot = expDepots.find(
                  (d: any) => d.id === selectedId
                );
                setForm({
                  ...form,
                  expDepotId: selectedId,
                  expDepotName: selectedDepot?.companyName || "",
                });
              }} value={form.expDepotId || ""}>
                <SelectTrigger className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800">
                  <SelectValue placeholder="First Select Port of Loading" />
                </SelectTrigger>
                <SelectContent>
                  {expDepots.map((depot: any) => (
                    <SelectItem key={depot.id} value={depot.id}>
                      {depot.companyName} - {depot.businessType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Empty Return Depot */}
            <div>
              <Label htmlFor="emptyReturnDepot" className="block text-sm text-gray-900 dark:text-white mb-1">
                Empty Return Depot
              </Label>

              <Select onValueChange={(value) => {
                const selectedId = Number(value);
                const selectedDepot = emptyReturnDepots.find(
                  (d) => d.id === selectedId
                );
                setForm({
                  ...form,
                  emptyReturnDepot: selectedId,
                  emptyReturnDepotName: selectedDepot?.companyName || "",
                });
              }} value={form.emptyReturnDepot || ""}>
                <SelectTrigger className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800">
                  <SelectValue placeholder="First Select Port of Discharge" />
                </SelectTrigger>
                <SelectContent>
                  {emptyReturnDepots.map((depot: any) => (
                    <SelectItem key={depot.id} value={depot.id}>
                      {depot.companyName} - {depot.businessType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exp. H. Agent Name */}
            <div>
              <Label htmlFor="expHAgentId" className="block text-sm text-gray-900 dark:text-white mb-1">
                Exp. H. Agent Name
              </Label>
              <Select onValueChange={(value) => {
                const selectedId = Number(value);
                const selected = expAgents.find(
                  (a: any) => a.id === selectedId
                );
                setForm({
                  ...form,
                  expHAgentId: selectedId,
                  expHAgentName: selected?.companyName || "",
                });
              }} value={form.expHAgentId || ""}>
                <SelectTrigger className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {expAgents.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Imp. H. Agent Name */}
            <div>
              <Label htmlFor="impHAgentId" className="block text-sm text-gray-900 dark:text-white mb-1">
                Imp. H. Agent Name
              </Label>
              <Select onValueChange={(value) => {
                const selectedId = Number(value);
                const selected = impHandlingAgents.find(
                  (a: any) => a.id === selectedId
                );
                setForm({
                  ...form,
                  impHAgentId: selectedId,
                  impHAgentName: selected?.companyName || "",
                });
              }} value={form.impHAgentId || ""}>
                <SelectTrigger className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {impHandlingAgents.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <hr className="border-t border-gray-600 my-4 col-span-2" />

            {/* Transit Days */}
            <div className="col-span-2">
              <Label htmlFor="transitDays" className="block text-sm text-white mb-1">
                Transit Days
              </Label>
              <Input
                type="text"
                value={form.transitDays}
                onChange={(e) =>
                  setForm({ ...form, transitDays: e.target.value })
                }
                id="transitDays"
                className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
              />
            </div>

            {/* Enable Transhipment Port */}
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox
                id="enableTranshipmentPort"
                checked={form.enableTranshipmentPort ?? false}
                onCheckedChange={(checked) =>
                  setForm({ ...form, enableTranshipmentPort: checked })
                }
              />

              <Label
                htmlFor="enableTranshipmentPort"
                className="text-white text-sm"
              >
                Enable Transhipment Port
              </Label>
            </div>

            {form.enableTranshipmentPort && (
              <>
                {/* Transhipment Port */}
                <div className="col-span-2">
                  <Label htmlFor="transhipmentPortName" className="block text-sm text-white mb-1">
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
                          transhipmentPortId: undefined,
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
                          fetchTranshipmentPorts(
                            form.transhipmentPortName || ""
                          );
                          setShowTranshipmentDropdown(true);
                        }
                      }}
                      onBlur={() =>
                        setTimeout(
                          () => setShowTranshipmentDropdown(false),
                          150
                        )
                      }
                      id="transhipmentPortName"
                      className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-800"
                      placeholder="Start typing transhipment port..."
                    />
                    {showTranshipmentDropdown &&
                      transhipmentPortSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white dark:bg-neutral-900 border border-neutral-800 rounded mt-1 max-h-40 overflow-y-auto">
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
                              className="px-3 py-1 hover:bg-blue-600 hover:text-white cursor-pointer text-sm text-gray-900 dark:text-white"
                            >
                              {port.portName}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>

                {/* TRS. H. Agent Name */}
                <div className="col-span-2">
                  <Label htmlFor="transhipmentAgentId" className="block text-sm text-white mb-1">
                    TRS. H. Agent Name
                  </Label>
                  <div className="w-1/2">
                    <Select
                      onValueChange={(value) => {
                        const selectedId = Number(value);
                        const selected = trsHandlingAgents.find((a) => a.id === selectedId);
                        setForm({
                          ...form,
                          transhipmentAgentId: selectedId,
                          transhipmentAgentName: selected?.companyName || "",
                        });
                      }}
                      value={form.transhipmentAgentId || ""}
                    >
                      <SelectTrigger className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {trsHandlingAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <hr className="border-t border-gray-600 my-4 col-span-2" />

            {/* Financial Details */}
            <div>
              <Label htmlFor="slotRate" className="block text-sm text-white mb-1">
                Slot Rate
              </Label>
              <Input
                type="text"
                value={form.slotRate ?? ""}
                onChange={(e) => setForm({ ...form, slotRate: e.target.value })}
                id="slotRate"
                className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
              />
            </div>

            <div>
              <Label htmlFor="depotAvgCost" className="block text-sm text-white mb-1">
                Depot Avg Cost
              </Label>
              <Input
                type="text"
                value={form.depotAvgCost ?? ""}
                readOnly
                id="depotAvgCost"
                className="w-full p-2 bg-white dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
                placeholder={form.isEditing ? "" : "Auto-calculated"}
              />
            </div>

            <div>
              <Label htmlFor="leasingCost" className="block text-sm text-white mb-1">
                Leasing Cost
              </Label>
              <Input
                type="text"
                value={form.leasingCost ?? ""}
                readOnly
                id="leasingCost"
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800 bg-opacity-70 cursor-not-allowed"
                placeholder={form.isEditing ? "" : "Auto-calculated"}
              />
            </div>

            <div>
              <Label htmlFor="depotCleaningCost" className="block text-sm text-white mb-1">
                Depot Cleaning Cost
              </Label>
              <Input
                type="text"
                value={form.depotCleaningCost ?? ""}
                onChange={(e) =>
                  setForm({ ...form, depotCleaningCost: e.target.value })
                }
                id="depotCleaningCost"
                className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
                placeholder={form.isEditing ? "" : "Auto-calculated"}
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="terminalHandlingFee" className="block text-sm text-white mb-1">
                Terminal Handling Fee
              </Label>
              <Input
                type="text"
                value={form.terminalHandlingFee ?? ""}
                onChange={(e) =>
                  setForm({ ...form, terminalHandlingFee: e.target.value })
                }
                id="terminalHandlingFee"
                className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
              />
            </div>
            <div>
              <Label htmlFor="containerPreparationCost" className="block text-sm text-white mb-1">
                Container Preparation
              </Label>
              <Input
                type="text"
                value={form.containerPreparationCost ?? ""}
                onChange={(e) =>
                  setForm({ ...form, containerPreparationCost: e.target.value })
                }
                id="containerPreparationCost"
                className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
              />
            </div>

            <hr className="border-t border-gray-600 my-4 col-span-2" />

            <div>
              <Label htmlFor="expAgencyCommission" className="block text-sm text-white mb-1">
                Exp. Agency Commission
              </Label>
              <Input
                type="text"
                value={form.expAgencyCommission ?? ""}
                onChange={(e) =>
                  setForm({ ...form, expAgencyCommission: e.target.value })
                }
                id="expAgencyCommission"
                className="w-full p-2 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-800"
                readOnly
                placeholder={form.isEditing ? "" : "Auto-calculated"}
              />
            </div>

            <div>
              <Label htmlFor="impAgencyCommission" className="block text-sm text-white mb-1">
                Imp. Agency Commission
              </Label>
              <Input
                type="text"
                value={form.impAgencyCommission ?? ""}
                onChange={(e) =>
                  setForm({ ...form, impAgencyCommission: e.target.value })
                }
                id="impAgencyCommission"
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                readOnly
                placeholder={form.isEditing ? "" : "Auto-calculated"}
              />
            </div>

            <div>
              <Label htmlFor="expCollection" className="block text-sm text-white mb-1">
                Exp. Collection
              </Label>
              <Input
                type="text"
                value={form.expCollection ?? ""}
                onChange={(e) =>
                  setForm({ ...form, expCollection: e.target.value })
                }
                id="expCollection"
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              />
            </div>

            <div>
              <Label htmlFor="impCollection" className="block text-sm text-white mb-1">
                Imp. Collection
              </Label>
              <Input
                type="text"
                value={form.impCollection ?? ""}
                onChange={(e) =>
                  setForm({ ...form, impCollection: e.target.value })
                }
                id="impCollection"
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              />
            </div>

            <hr className="border-t border-gray-600 my-4 col-span-2" />

            <div className="space-y-4">
              {" "}
              {/* Ensures vertical stacking with spacing */}
              <div>
                <Label htmlFor="totalCost" className="block text-sm text-white mb-1">
                  Total Cost
                </Label>
                <Input
                  type="text"
                  value={form.totalCost ?? ""}
                  readOnly
                  id="totalCost"
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="sellingAmount" className="block text-sm text-white mb-1">
                  Selling Amount (Ocean Freight)
                </Label>
                <Input
                  type="text"
                  value={form.sellingAmount ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, sellingAmount: e.target.value })
                  }
                  id="sellingAmount"
                  className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                />
              </div>
              <div>
                <Label htmlFor="totalRevenueAmount" className="block text-sm text-white mb-1">
                  Total Revenue Amount
                </Label>
                <Input
                  type="text"
                  value={form.totalRevenueAmount ?? ""}
                  readOnly
                  id="totalRevenueAmount"
                  className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                />
              </div>
              <div>
                <Label htmlFor="totalPLAmount" className="block text-sm text-white mb-1">
                  Total P & L
                </Label>
                <Input
                  type="text"
                  value={form.totalPLAmount ?? ""}
                  readOnly
                  id="totalPLAmount"
                  className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                />
              </div>
              <div>
                <Label htmlFor="plMargin" className="block text-sm text-white mb-1">
                  P/L Margin %
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={form.plMargin ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, plMargin: e.target.value })
                    }
                    id="plMargin"
                    className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800 pr-6"
                  />
                  <span className="absolute right-2 top-2 text-white">%</span>
                </div>
              </div>
            </div>

            <hr className="border-t border-gray-600 my-4 col-span-2" />

            {/* Continue mapping remaining fields similarly based on your form design */}
          </div>

          <div className="flex justify-center gap-3 mt-8">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 cursor-pointer text-white rounded hover:bg-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-500"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuotationModal;
