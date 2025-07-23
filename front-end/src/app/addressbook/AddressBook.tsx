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
          ? "bg-green-700 text-green-100"
          : "bg-red-500 text-red-100"}
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
          className="inline-block px-3 py-1 mb-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-100 border border-blue-400"
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
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (

    <div className="px-4 py-6">
      {/* Top Bar with Search & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 bg-background rounded px-2 py-1 shadow-sm border">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search companies..."
            className="outline-none text-sm w-60 bg-transparent text-foreground placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={handleAddCompanyClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 shadow cursor-pointer"
        >
          Add Company
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg shadow border bg-background overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted">
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
                <TableCell colSpan={6} className="text-center text-destructive py-8 bg-background">
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
                  className="transition-colors bg-background hover:bg-muted border-b"
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
                            className="inline-block px-3 py-1 mx-1 rounded-full text-xs font-semibold bg-purple-400/30 text-purple-900 border border-purple-400 shadow transition-all duration-300 hover:scale-105"
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
                        "hover:bg-blue-100 hover:text-blue-700 text-muted-foreground transition-all duration-200 cursor-pointer"
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
                        "hover:bg-red-100 hover:text-red-700 text-muted-foreground transition-all duration-200 cursor-pointer"
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