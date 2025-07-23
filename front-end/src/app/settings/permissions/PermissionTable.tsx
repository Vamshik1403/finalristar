"use client";

import React, { useState } from "react";
import PermissionForm from "./PermissionForm";

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
      <div className="bg-gray-800 rounded-lg shadow-md mt-4 px-4 py-2 flex justify-between items-center border-b border-gray-700 text-white">
        <div className="flex">
          <button
            onClick={() => setActiveTab("permissions")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "permissions"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 text-sm font-medium ml-4 ${
              activeTab === "roles"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            Roles
          </button>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium"
        >
          + {activeTab === "permissions" ? "Add Permission" : "Add Role"}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg shadow border border-border bg-background overflow-hidden mt-4">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 bg-background border-b-2 border-border text-left text-xs font-semibold text-foreground uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 bg-background border-b-2 border-border text-left text-xs font-semibold text-foreground uppercase tracking-wider">Description</th>
              <th className="px-5 py-3 bg-background border-b-2 border-border text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                {activeTab === "permissions" ? "Module" : "Permissions"}
              </th>
              <th className="px-5 py-3 bg-background border-b-2 border-border text-left text-xs font-semibold text-foreground uppercase tracking-wider">Status</th>
              {activeTab === "roles" && (
                <th className="px-5 py-3 bg-background border-b-2 border-border text-left text-xs font-semibold text-foreground uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((item, index) => (
                <tr key={index} className="border-b border-border bg-background text-foreground">
                  <td className="px-5 py-3">{item.name}</td>
                  <td className="px-5 py-3">{item.description}</td>
                  <td className="px-5 py-3">
                    {activeTab === "permissions" ? item.module : item.permissions}
                  </td>
                  <td className="px-5 py-3 capitalize">{item.status}</td>
                  {activeTab === "roles" && (
                    <td className="px-5 py-3">
                      <button className="text-blue-600 hover:underline text-sm">Edit</button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeTab === "permissions" ? 4 : 5} className="text-center text-muted-foreground py-6">
                  No {activeTab === "permissions" ? "permissions" : "roles"} found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
