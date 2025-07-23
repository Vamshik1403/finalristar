"use client";

import React, { useState } from "react";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Label } from "@/components/ui/label";
  import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface PermissionFormProps {
  activeTab: "permissions" | "roles";
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({ activeTab, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    module: "",
    permissions: "",
    status: "active",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[500px] border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex justify-between items-center mb-4 gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {activeTab === "permissions" ? "Add Permission" : "Add Role"}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-gray-900 dark:hover:text-white text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Label htmlFor="name" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">{activeTab === "permissions" ? "Permission Name" : "Role Name"}</Label>
          <Input
            name="name"
            type="text"
            placeholder={activeTab === "permissions" ? "Permission Name" : "Role Name"}
            className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 mb-2"
            onChange={handleChange}
            required
          />
          <Label htmlFor="description" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">Description</Label>
          <Input
            name="description"
            type="text"
            placeholder="Description"
            className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 mb-2"
            onChange={handleChange}
            required
          />
          {activeTab === "permissions" ? (
            <>
              <Label htmlFor="module" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">Module</Label>
              <Select value={formData.module} onValueChange={value => setFormData({ ...formData, module: value })}>
                <SelectTrigger className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 mb-2">
                  <SelectValue placeholder="Select Module" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-white border border-neutral-700">
                  <SelectItem value="admin">Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Label htmlFor="permissions" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">Permissions (comma-separated)</Label>
              <Input
                name="permissions"
                type="text"
                placeholder="Permissions (comma-separated)"
                className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 mb-2"
                onChange={handleChange}
              />
            </>
          )}
          <div className="mb-2">
            <Label className="flex items-center gap-2 text-gray-900 dark:text-neutral-200 text-sm">
              <input
                type="checkbox"
                checked={formData.status === "active"}
                onChange={e => setFormData({ ...formData, status: e.target.checked ? "active" : "inactive" })}
                className="accent-blue-500 w-4 h-4"
              />
              Active
            </Label>
          </div>
          <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">Submit</Button>
        </form>
      </div>
    </div>
  );
};

export default PermissionForm;



