"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AddCompanyForm from "./AddCompanyForm";
import { Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status.toLowerCase() === "active";
  return (
    <span
      className={`inline-block px-4 py-1 rounded-full text-sm font-semibold shadow transition-all duration-300
        ${isActive
          ? "bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100"
          : "bg-red-200 text-red-900 dark:bg-red-500 dark:text-red-100"}
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

// Visually distinct BusinessType badge
const BusinessTypeBadge = ({ type }: { type: string }) => {
  // Split the type string by commas
  const types = type.split(/,\s*/);

  return (
    <div className="flex flex-wrap gap-1">
      {types.map((t, idx) => (
        <span
          key={idx}
          className="inline-block px-3 py-1 mb-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 dark:bg-blue-500/30 dark:text-blue-100 border border-blue-400"
          style={{
            minWidth: 70,
            textAlign: "center",
          }}
        >
          {t.trim()}
        </span>
      ))}
    </div>
  );
};

const AddressBook = () => {
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filterBusinessType, setFilterBusinessType] = useState<string>("");
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterPort, setFilterPort] = useState<string>("");
  // Unique options for filter dropdowns
  const businessTypeOptions = Array.from(new Set(companies.flatMap((c: any) => c.businessType?.split(/,\s*/) || []))).filter(Boolean);
  const countryOptions = Array.from(new Set(companies.map((c: any) => c.country?.countryName).filter(Boolean)));
  const portOptions = Array.from(new Set(companies.flatMap((c: any) => (c.businessPorts || []).map((bp: any) => bp.port?.portName)).filter(Boolean)));

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:8000/addressbook");
      setCompanies(res.data);
    } catch (err) {
      setError("Error loading address book data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompanyClick = () => setShowAddCompanyModal(true);
  const handleCloseModal = () => setShowAddCompanyModal(false);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/addressbook/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      alert("Deleted successfully");
      fetchCompanies(); // Refresh after delete
    } catch (err) {
      console.error("Error deleting company:", err);
      alert("Failed to delete company");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const res = await axios.get(`http://localhost:8000/addressbook/${id}`);
      setCompanyToEdit(res.data);
      setShowEditModal(true);
    } catch (err) {
      console.error("Failed to fetch company", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company: any) =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterBusinessType ? company.businessType?.split(/,\s*/).includes(filterBusinessType) : true) &&
    (filterCountry ? company.country?.countryName === filterCountry : true) &&
    (filterPort ? (company.businessPorts?.some((bp: any) => bp.port?.portName === filterPort)) : true)
  );

  return (
    <div className="px-4 py-6">
      {/* Top Bar with Search, Filter & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="flex items-center gap-2 bg-background rounded px-2 py-1 shadow-sm border border-border">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search companies..."
              className="outline-none text-sm w-60 bg-transparent text-foreground placeholder-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ml-8">
          <Button
            type="button"
            className="bg-white text-black dark:bg-neutral-900 dark:text-white px-4 py-2 rounded-lg shadow border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            onClick={() => setShowFilter(true)}
          >
            <span className="mr-2">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block">
                <path d="M4 6h10M6 10h6M8 14h2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Filter
          </Button>
          </div>
        </div>
        <Button
          onClick={handleAddCompanyClick}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-all duration-200 shadow cursor-pointer"
        >
          Add Company
        </Button>
      </div>
      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-lg">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[400px] p-6 border border-neutral-200 dark:border-neutral-800 relative">
            <button
              className="absolute top-3 right-3 text-neutral-400 hover:text-gray-900 dark:hover:text-white text-xl"
              onClick={() => setShowFilter(false)}
            >
              &times;
            </button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Filter Companies</h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-900 dark:text-white mb-1">Business Type</label>
              <select
                value={filterBusinessType}
                onChange={e => setFilterBusinessType(e.target.value)}
                className="w-full p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
              >
                <option value="">All Business Types</option>
                {businessTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-900 dark:text-white mb-1">Country</label>
              <select
                value={filterCountry}
                onChange={e => setFilterCountry(e.target.value)}
                className="w-full p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
              >
                <option value="">All Countries</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-900 dark:text-white mb-1">Ports</label>
              <select
                value={filterPort}
                onChange={e => setFilterPort(e.target.value)}
                className="w-full p-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
              >
                <option value="">All Ports</option>
                {portOptions.map((port) => (
                  <option key={port} value={port}>{port}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                className="px-3 py-1 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => {
                  setFilterBusinessType("");
                  setFilterCountry("");
                  setFilterPort("");
                }}
              >
                Reset
              </Button>
              <Button
                type="button"
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={() => setShowFilter(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg shadow border border-border bg-background overflow-x-auto">
        <Table>
          <TableHeader className="bg-background">
            <TableRow>
              <TableHead className="text-foreground">Company Name</TableHead>
              <TableHead className="text-foreground">Business Type</TableHead>
              <TableHead className="text-foreground">Country</TableHead>
              <TableHead className="text-foreground">Ports</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-center text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground bg-background">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-red-500 py-8 bg-background">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground bg-background">
                  No matching companies found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company: any) => (
                <TableRow
                  key={company.id}
                  className="transition-colors bg-background hover:bg-muted border-b border-border"
                >
                  <TableCell className="text-foreground">{company.companyName}</TableCell>
                  <TableCell>
                    <BusinessTypeBadge type={company.businessType} />
                  </TableCell>
                  <TableCell className="text-foreground">{company.country?.countryName || "N/A"}</TableCell>
                  <TableCell className="text-foreground">
                    {company.businessPorts && company.businessPorts.length > 0 ? (
                      company.businessPorts.map((bp: any, idx: number) =>
                        bp.port?.portName ? (
                          <span
                            key={bp.port?.portName + idx}
                            className="inline-block px-3 py-1 mx-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 dark:bg-purple-400/30 dark:text-purple-100 border border-purple-400 shadow transition-all duration-300 hover:scale-105"
                            style={{
                              minWidth: 70,
                              textAlign: "center",
                              letterSpacing: 1,
                            }}
                          >
                            {bp.port?.portName}
                          </span>
                        ) : null
                      )
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={company.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(company.id)}
                      className={cn(
                        "h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 cursor-pointer"
                      )}
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(company.id)}
                      className={cn(
                        "h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/40 cursor-pointer"
                      )}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      {showEditModal && (
        <AddCompanyForm
          editData={companyToEdit}
          onClose={() => {
            setShowEditModal(false);
            fetchCompanies(); // refresh after edit
          }}
        />
      )}
      {showAddCompanyModal && (
        <AddCompanyForm
          onClose={() => {
            setShowAddCompanyModal(false);
            fetchCompanies(); // refresh after add
          }}
        />
      )}
    </div>
  );
};

export default AddressBook;