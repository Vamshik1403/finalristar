'use client'

import React, { useState } from 'react'
 import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Label } from "@/components/ui/label";
  import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


// Modal component for Add User
const AddUserModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;

  // Dummy form state for demonstration
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    password: '',
    confirmPassword: '',
    active: true,
    administrator: false,
  });

 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[500px] border border-neutral-200 dark:border-neutral-800">
        <div className="flex justify-between items-center px-6 pt-6 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add User</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-gray-900 dark:hover:text-white text-2xl">&times;</button>
        </div>
        <form className="px-6 pb-6 pt-2 space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                required
              />
            </div>
            {/* First Name & Last Name */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="firstName" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">First Name</Label>
                <Input
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="lastName" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">Last Name</Label>
                <Input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                />
              </div>
            </div>
            {/* Role */}
            <div>
              <Label htmlFor="role" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">Role</Label>
              <Select value={form.role} onValueChange={value => setForm({ ...form, role: value })}>
                <SelectTrigger className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-white border border-neutral-700">
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Password */}
            <div>
              <Label htmlFor="password" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                required
              />
            </div>
            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">Confirm Password</Label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                required
              />
            </div>
            {/* Checkboxes */}
            <div className="flex items-center gap-6 mt-2">
              <Label className="flex items-center gap-2 text-gray-900 dark:text-neutral-200 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="accent-blue-500 w-4 h-4"
                />
                Active
              </Label>
              <Label className="flex items-center gap-2 text-gray-900 dark:text-neutral-200 text-sm">
                <input
                  type="checkbox"
                  checked={form.administrator}
                  onChange={e => setForm({ ...form, administrator: e.target.checked })}
                  className="accent-blue-500 w-4 h-4"
                />
                Administrator
              </Label>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;