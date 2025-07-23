"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import AddTariffModal from "./LandTransportform";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StatusBadge = ({ approvalStatus }: { approvalStatus: string }) => {
  const isActive = approvalStatus === 'Approved';
  return (
    <span
      className={`inline-block px-4 py-1 rounded-full text-sm font-semibold shadow transition-all duration-300
        ${isActive ? "bg-green-700 text-green-200" : "bg-red-700 text-red-200"}
        hover:scale-105`}
      style={{ minWidth: 70, textAlign: "center", letterSpacing: 1 }}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

type Tariff = {
  id: number;
  landTransportTariffCode: string;
  addressBookId: string;
  transportType: string;
  from: string;
  to: string;
  distance: string;
  currencyId: string;
  amount: string;
  approvalStatus: string;
  addressBook?: { companyName?: string };
  currency?: { currencyName?: string };
};

const LandTransportTariff = () => {
  const [showModal, setShowModal] = useState(false);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [form, setForm] = useState({
    id: undefined,
    landTransportTariffCode: "",
    addressBookId: "",
    transportType: "",
    from: "",
    to: "",
    distance: "",
    currencyId: "",
    amount: "",
    approvalStatus: "Pending",
  });

  const fetchTariffs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/land-transport-tariff");
      setTariffs(res.data);
    } catch (err) {
      console.error("Error fetching tariffs:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tariff?")) return;
    try {
      await axios.delete(`http://localhost:8000/land-transport-tariff/${id}`);
      fetchTariffs();
    } catch (err) {
      console.error("Error deleting tariff:", err);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  // Filtered tariffs based on searchTerm
  const filteredTariffs = tariffs.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      row.landTransportTariffCode?.toLowerCase().includes(term) ||
      row.transportType?.toLowerCase().includes(term) ||
      row.from?.toLowerCase().includes(term) ||
      row.to?.toLowerCase().includes(term) ||
      row.currency?.currencyName?.toLowerCase().includes(term) ||
      row.approvalStatus?.toLowerCase().includes(term)
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
              landTransportTariffCode: "",
              addressBookId: "",
              transportType: "",
              from: "",
              to: "",
              distance: "",
              currencyId: "",
              amount: "",
              approvalStatus: "Pending",
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
          formTitle={form.id ? "Edit Land Transport Tariff" : "Add Land Transport Tariff"}
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
              <TableHead className="text-black dark:text-neutral-200">Company</TableHead>
              <TableHead className="text-black dark:text-neutral-200">From</TableHead>
              <TableHead className="text-black dark:text-neutral-200">To</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Distance</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Transport Type</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Amount</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Currency</TableHead>
              <TableHead className="text-black dark:text-neutral-200">Status</TableHead>
              <TableHead className="text-center text-black dark:text-neutral-200">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTariffs.length > 0 ? (
              filteredTariffs.map((row: any, idx) => (
                <TableRow key={row.id} className={`border-b border-neutral-800 text-black dark:text-white ${idx % 2 === 1 ? "bg-gray-50 dark:bg-neutral-800" : "bg-white dark:bg-neutral-900"}`}>
                  <TableCell>{row.landTransportTariffCode}</TableCell>
                  <TableCell>{row.addressBook?.companyName || "N/A"}</TableCell>
                  <TableCell>{row.from}</TableCell>
                  <TableCell>{row.to}</TableCell>
                  <TableCell>{row.distance}</TableCell>
                  <TableCell>{row.transportType}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.currency?.currencyName || "N/A"}</TableCell>
                  <TableCell>
                    <StatusBadge approvalStatus={row.approvalStatus || "Pending"} />
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm({
                          id: row.id,
                          landTransportTariffCode: row.landTransportTariffCode || "",
                          addressBookId: row.addressBookId || "",
                          transportType: row.transportType || "",
                          from: row.from || "",
                          to: row.to || "",
                          distance: row.distance || "",
                          currencyId: row.currencyId || "",
                          amount: row.amount || "",
                          approvalStatus: row.approvalStatus || "Pending",
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
                <TableCell colSpan={10} className="text-center py-6 text-gray-400 bg-white dark:bg-neutral-900">
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

export default LandTransportTariff;
