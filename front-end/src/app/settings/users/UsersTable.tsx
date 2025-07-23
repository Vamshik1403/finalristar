'use client'

import { useState } from "react";
import AddUserModal from "./AddUsers";



const UsersTable = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="px-4 pt-0 pb-4">
      <div className="flex items-center justify-between mt-0 mb-4">
        <div className="relative w-full mr-4">
          <p className="font-bold text-lg">Users</p>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-4 px-6 shadow-sm rounded-md whitespace-nowrap"
          onClick={() => setShowModal(true)}
        >
          Add Users
        </button>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden mt-4 border border-border bg-background">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-border bg-background text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-border bg-background text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-border bg-background text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="px-5 py-3 border-b-2 border-border bg-background text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-border bg-background text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Actions
              </th>
              <th className="px-5 py-3 border-b-2 border-border bg-background text-left text-xs font-semibold text-foreground uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
      <AddUserModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default UsersTable;
