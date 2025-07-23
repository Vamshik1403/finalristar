"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AddTariffModal from "./DepotAvgForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status.toLowerCase() === "active";
  return (
    <span
      className={`inline-block px-4 py-1 rounded-full text-sm font-semibold shadow transition-all duration-300
        ${isActive ? "bg-green-700 text-green-200" : "bg-red-700 text-red-200"}
        hover:scale-105`}
      style={{
        minWidth: 70,
        textAlign: "center",
        letterSpacing: 1,
      }}
    >
      {status}
    </span>
  );
};

type Tariff = {
  id: number;
  status: string;
  tariffCode: string;
  addressBook?: {
    companyName?: string;
  };
  addressBookId?: number;
  port?: {
    portName?: string;
  };
  portId?: number;
  currency?: {
    currencyCode?: string;
  };
  currencyId?: number;
  manlidPTFE?: string | number;
  leakTest?: string | number;
  loadOnLoadOff?: string | number;
  cleaningSurvey?: string | number;
  maintenanceAndRepair?: string | number;
  total?: string | number;
};

const DepotAvgCost = () => {
  const [showModal, setShowModal] = useState(false);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [form, setForm] = useState({
    id: undefined,
    status: "Inactive",
    tariffCode: "",
    depotTerminalId: "",
    servicePort: "",
    currency: "",
    manlidPTFE: "0",
    leakTest: "0",
    loadOnLoadOff: "0",
    cleaningSurvey: "0",
    maintenanceAndRepair: "0",
    total: "0",
  });

  const fetchTariffs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/depot-avg-tariff");
      setTariffs(res.data);
    } catch (err) {
      console.error("Failed to fetch tariffs:", err);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:8000/depot-avg-tariff/${id}`);
        fetchTariffs();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  // Filtered tariffs based on searchTerm
  const filteredTariffs = tariffs.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      row.tariffCode?.toLowerCase().includes(term) ||
      row.addressBook?.companyName?.toLowerCase().includes(term) ||
      row.port?.portName?.toLowerCase().includes(term) ||
      row.currency?.currencyCode?.toLowerCase().includes(term) ||
      row.status?.toLowerCase().includes(term)
    );
  });
  return (
    <div className="px-4 pt-4 pb-4 dark:bg-black">
      <div className="flex items-center justify-between mt-0 mb-4">
        <div className="relative w-full mr-4">
          <input
            type="text"
            placeholder="Search tariffs..."
            className="p-2 pl-10 rounded-lg bg-white dark:bg-neutral-900 text-black dark:text-white placeholder-neutral-400 border border-neutral-800 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </span>
        </div>
        <Button
          onClick={() => {
            setForm({
              id: undefined,
              status: "Inactive",
              tariffCode: "",
              depotTerminalId: "",
              servicePort: "",
              currency: "",
              manlidPTFE: "0",
              leakTest: "0",
              loadOnLoadOff: "0",
              cleaningSurvey: "0",
              maintenanceAndRepair: "0",
              total: "0",
            });
            setShowModal(true);
          }}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2 px-6 shadow rounded-md whitespace-nowrap"
        >
          <Plus className="mr-2" size={16} /> Add Tariff
        </Button>
      </div>

      {showModal && (
        <AddTariffModal
          onClose={() => setShowModal(false)}
          formTitle={form.id ? "Edit Depot Avg Tariff" : "Add Depot Avg Tariff"}
          form={form}
          setForm={setForm}
          fetchTariffs={fetchTariffs}
        />
      )}

      <div className="rounded-lg shadow border border-neutral-800 bg-white dark:bg-neutral-900 overflow-x-auto mt-4">
        <Table>
          <TableHeader className="bg-white dark:bg-neutral-900">
            <TableRow>
              <TableHead className="text-black dark:text-neutral-200">Tariff Code</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Depot Terminal</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Service Port</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Currency</TableHead>
              <TableHead className="text-black dark:text-neutral-200">MANLID PTFE</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Leak Test</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Load On Load Off</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Cleaning Survey</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Maintenance and Repair</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Total</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Status</TableHead>
              <TableHead className="text-center text-black dark:text-neutral-200">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTariffs.length > 0 ? (
              filteredTariffs.map((row: any, idx) => (
                <TableRow key={row.id} className={`border-b border-neutral-800 text-black dark:text-white ${idx % 2 === 1 ? "bg-gray-50 dark:bg-neutral-800" : "bg-white dark:bg-neutral-900"}`}>
                  <TableCell>{row.tariffCode}</TableCell>
                  <TableCell>{row.addressBook?.companyName || "N/A"}</TableCell>
                  <TableCell>{row.port?.portName || "N/A"}</TableCell>
                  <TableCell>{row.currency?.currencyCode || "N/A"}</TableCell>
                  <TableCell>{row.manlidPTFE}</TableCell>
                  <TableCell>{row.leakTest}</TableCell>
                  <TableCell>{row.loadOnLoadOff}</TableCell>
                  <TableCell>{row.cleaningSurvey}</TableCell>
                  <TableCell>{row.maintenanceAndRepair}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm({
                          id: row.id,
                          status: row.status,
                          tariffCode: row.tariffCode,
                          depotTerminalId: row.addressBookId?.toString() || "",
                          servicePort: row.portId?.toString() || "",
                          currency: row.currencyId?.toString() || "",
                          manlidPTFE: row.manlidPTFE?.toString() || "0",
                          leakTest: row.leakTest?.toString() || "0",
                          loadOnLoadOff: row.loadOnLoadOff?.toString() || "0",
                          cleaningSurvey: row.cleaningSurvey?.toString() || "0",
                          maintenanceAndRepair: row.maintenanceAndRepair?.toString() || "0",
                          total: row.total?.toString() || "0",
                        });
                        setShowModal(true);
                      }}
                      className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 cursor-pointer"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(row.id)}
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/40 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-6 text-gray-400 bg-white dark:bg-neutral-900">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DepotAvgCost;
