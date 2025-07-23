"use client";

import React, { useState } from "react";
import PermissionForm from "./PermissionForm";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const PermissionTable = () => {
  const [activeTab, setActiveTab] = useState<"permissions" | "roles">("permissions");
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);

  const handleAddClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleFormSubmit = (data: any) => {
    setTableData([...tableData, data]);
  };

  return (
    <>
      {/* Tabs and Add Button */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-md mt-4 px-4 py-2 flex justify-between items-center">
        <div className="flex">
          <Button
            variant={activeTab === "permissions" ? "secondary" : "ghost"}
            className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 ${activeTab === "permissions" ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-neutral-100 dark:bg-neutral-900" : "border-transparent text-black dark:text-gray-400 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}
            onClick={() => setActiveTab("permissions")}
          >
            Permissions
          </Button>
          <Button
            variant={activeTab === "roles" ? "secondary" : "ghost"}
            className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 ml-2 ${activeTab === "roles" ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-neutral-100 dark:bg-neutral-900" : "border-transparent text-black dark:text-gray-400 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}
            onClick={() => setActiveTab("roles")}
          >
            Roles
          </Button>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium"
        >
          + {activeTab === "permissions" ? "Add Permissions" : "Add Roles"}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-x-auto mt-4">
        <Table className="min-w-full border-separate border-spacing-0">
          <TableHeader className="bg-neutral-100 dark:bg-black">
            <TableRow>
              <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left">Name</TableHead>
              <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left">Description</TableHead>
              <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left">{activeTab === "permissions" ? "Module" : "Permissions"}</TableHead>
              <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left">Status</TableHead>
              {activeTab === "roles" && (
                <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.length > 0 ? (
              tableData.map((item, index) => (
                <TableRow key={index} className="border-b border-neutral-200 dark:border-neutral-800">
                  <TableCell className="px-6 py-3">{item.name}</TableCell>
                  <TableCell className="px-6 py-3">{item.description}</TableCell>
                  <TableCell className="px-6 py-3">{activeTab === "permissions" ? item.module : item.permissions}</TableCell>
                  <TableCell className="capitalize px-6 py-3">{item.status}</TableCell>
                  {activeTab === "roles" && (
                    <TableCell className="px-6 py-3">
                      <Button variant="link" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 cursor-pointer">Edit</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={activeTab === "permissions" ? 4 : 5} className="text-center text-gray-400 py-6 bg-white dark:bg-black">
                  No {activeTab === "permissions" ? "permissions" : "roles"} found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {showModal && (
        <PermissionForm
          activeTab={activeTab}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
        />
      )}
    </>
  );
};

export default PermissionTable;
