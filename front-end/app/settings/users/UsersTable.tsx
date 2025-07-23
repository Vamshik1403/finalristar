'use client'

import { useState } from "react";
import AddUserModal from "./AddUsers";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";



const UsersTable = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="px-4 pt-4 pb-4 bg-white dark:bg-black min-h-screen">
      <div className="flex items-center justify-between mt-0 mb-4">
        <div className="relative w-full mr-4">
          <p className="font-bold text-lg text-black dark:text-white">Users</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Users
        </Button>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-x-auto mt-4">
        <Table className="min-w-full border-separate border-spacing-0">
          <TableHeader className="bg-neutral-100 dark:bg-neutral-900">
            <TableRow>
              <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left">Name</TableHead>
              <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left">Email</TableHead>
              <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left">Role</TableHead>
              <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left">Status</TableHead>
              <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left">Actions</TableHead>
              <TableHead className="text-black dark:text-neutral-200 text-sm font-semibold tracking-normal border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 text-left"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Table rows go here */}
            <TableRow className="border-b border-neutral-200 dark:border-neutral-800">
              <TableCell colSpan={6} className="text-center text-neutral-400 py-6 bg-white dark:bg-black">No users found</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <AddUserModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default UsersTable;
