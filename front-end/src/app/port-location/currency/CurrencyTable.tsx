"use client";

import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import AddCurrencyForm from "./AddCurrencyForm";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Currency {
  id: number;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  format: string;
  status: string;
}

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={cn(
      "inline-block px-4 py-1 rounded-full text-xs font-semibold shadow transition-all duration-300 hover:scale-105",
      status === "Active"
        ? "bg-green-900/80 text-green-300"
        : "bg-red-900/80 text-red-300"
    )}
    style={{
      minWidth: 70,
      textAlign: "center",
      letterSpacing: 1,
    }}
  >
    {status}
  </span>
);

const CurrencyPage = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCurrency, setEditCurrency] = useState<Currency | null>(null);

  const fetchCurrency = async () => {
    try {
      const res = await axios.get("http://localhost:8000/currency");
      setCurrencies(res.data);
    } catch (err) {
      console.error("Error fetching currencies:", err);
    }
  };

  useEffect(() => {
    fetchCurrency();
  }, []);

  const handleAddCurrencyClick = () => {
    setEditCurrency(null);
    setShowModal(true);
  };

  const handleEditClick = async (id: number) => {
    try {
      const res = await axios.get(`http://localhost:8000/currency/${id}`);
      setEditCurrency(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch currency", err);
      alert("Failed to load currency for editing");
    }
  };

  const handleFormSubmit = () => {
    fetchCurrency();
    setShowModal(false);
    setEditCurrency(null);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this currency?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/currency/${id}`);
      alert("Currency deleted successfully.");
      fetchCurrency();
    } catch (err: any) {
      console.error("Error deleting currency:", err);
      alert("Failed to delete currency: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredCurrencies = currencies.filter((currency) =>
    (currency.currencyName?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
    (currency.currencyCode?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 pt-0 pb-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between mt-0 mb-4">
        <div className="relative mr-4 w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Search currencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg bg-neutral-900 text-white placeholder-neutral-400 border border-neutral-800 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
        <Button
          onClick={handleAddCurrencyClick}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2 px-6 shadow rounded-md whitespace-nowrap cursor-pointer"
        >
          <Plus size={16} className="mr-2" />
          Add Currency
        </Button>
      </div>

      {/* Currency Table */}
      <div className="rounded-lg shadow border border-border bg-background overflow-x-auto">
        <Table>
          <TableHeader className="bg-background">
            <TableRow>
              <TableHead className="text-center text-foreground">Code</TableHead>
              <TableHead className="text-center text-foreground">Name</TableHead>
              <TableHead className="text-center text-foreground">Symbol</TableHead>
              <TableHead className="text-center text-foreground">Status</TableHead>
              <TableHead className="text-center text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCurrencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground bg-background">
                  No currencies found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCurrencies.map((currency) => (
                <TableRow key={currency.id} className="hover:bg-muted transition border-b border-border bg-background text-foreground">
                  <TableCell className="text-center">{currency.currencyCode}</TableCell>
                  <TableCell className="text-center">{currency.currencyName}</TableCell>
                  <TableCell className="text-center">{currency.currencySymbol}</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={currency.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        onClick={() => handleEditClick(currency.id)}
                        className="hover:bg-blue-100 hover:text-blue-900 dark:hover:bg-blue-900 dark:hover:text-blue-400 text-muted-foreground transition-all duration-200 cursor-pointer"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => handleDelete(currency.id)}
                        className="hover:bg-red-100 hover:text-red-900 dark:hover:bg-red-900 dark:hover:text-red-400 text-muted-foreground transition-all duration-200 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <AddCurrencyForm
          onClose={() => {
            setShowModal(false);
            setEditCurrency(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editCurrency}
        />
      )}
    </div>
  );
};

export default CurrencyPage;