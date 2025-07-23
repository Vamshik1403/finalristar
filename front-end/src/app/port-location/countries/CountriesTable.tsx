"use client";

import React, { useEffect, useState } from "react";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import axios from "axios";
import AddCountryForm from "./AddCountriesForm";
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

const StatusBadge = ({ status }: { status: boolean }) => (
  <span
    className={cn(
      "inline-block px-4 py-1 rounded-full text-sm font-semibold shadow transition-all duration-300 hover:scale-105",
      status
        ? "bg-green-900/80 text-green-300"
        : "bg-red-900/80 text-red-300"
    )}
    style={{
      minWidth: 70,
      textAlign: "center",
      letterSpacing: 1,
    }}
  >
    {status ? "Active" : "Inactive"}
  </span>
);

const CountryPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<any>(null);
  const [search, setSearch] = useState("");

  const fetchCountries = async () => {
    try {
      const response = await axios.get("http://localhost:8000/country");
      setCountries(
        response.data.map((item: any) => ({
          ...item,
          status: JSON.parse(
            localStorage.getItem(`country-status-${item.countryCode}`) ?? "true"
          ),
        }))
      );
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this country?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/country/${id}`);
      fetchCountries();
    } catch (err: any) {
      alert(
        "Error: " +
          (err.response?.data?.message ||
            err.message ||
            "Failed to delete country.")
      );
    }
  };

  const handleEditClick = (country: any) => {
    setEditData(country);
    setShowForm(true);
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const filteredCountries = countries.filter((country) =>
    country.countryName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save status to localStorage using countryCode as key
    localStorage.setItem(
      `country-status-${editData?.countryCode}`,
      JSON.stringify(editData?.status)
    );
    // ...rest of your submit logic (API call)...
    setShowForm(false);
    fetchCountries();
    setEditData(null);
  };

  return (
    <div className="px-4 pt-0 pb-4">
      <div className="flex items-center justify-between mt-0 mb-4">
        <div className="relative w-full mr-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Search countries..."
            className="p-2 pl-10 rounded-lg bg-neutral-900 text-white placeholder-neutral-400 border border-neutral-800 focus:outline-none focus:border-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setEditData(null);
            setShowForm(true);
          }}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2 px-6 shadow rounded-md whitespace-nowrap transition-all cursor-pointer"
        >
          <Plus size={16} className="mr-2" />
          Add Country
        </Button>
      </div>

      <div className="rounded-lg shadow border border-border bg-background overflow-x-auto">
        <Table>
          <TableHeader className="bg-background">
            <TableRow>
              <TableHead className="text-foreground">Code</TableHead>
              <TableHead className="text-foreground">Name</TableHead>
              <TableHead className="text-foreground">Region</TableHead>
              <TableHead className="text-foreground">Currency</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground bg-background">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredCountries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground bg-background">
                  No countries found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCountries.map((country: any) => (
                <TableRow key={country.id} className="transition-colors bg-background hover:bg-muted border-b border-border">
                  <TableCell className="text-foreground">{country.countryCode}</TableCell>
                  <TableCell className="text-foreground">{country.countryName}</TableCell>
                  <TableCell className="text-foreground">{country.regions}</TableCell>
                  <TableCell className="text-foreground">{country.currency?.currencyName || "-"}</TableCell>
                  <TableCell>
                    <StatusBadge status={country.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        onClick={() => handleEditClick(country)}
                        className="hover:bg-blue-900 hover:text-blue-400 text-neutral-300 transition-all duration-200 cursor-pointer"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => handleDelete(country.id)}
                        className="hover:bg-red-900 hover:text-red-400 text-neutral-300 transition-all duration-200 cursor-pointer"
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

      {showForm && (
        <AddCountryForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchCountries();
            setEditData(null);
          }}
          editData={editData}
        />
      )}
    </div>
  );
};

export default CountryPage;
