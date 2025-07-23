'use client';

import React, { useEffect, useState } from 'react';
import { Pencil, Search, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import AddEmptyRepoModal from './EmptyRepoJobForm';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EmptyRepo = () => {
  const [showModal, setShowModal] = useState(false);
  const [emptyRepoJobs, setEmptyRepoJobs] = useState([]);
  const [searchText, setSearchText] = useState('');
  
  // ADD THIS: State for selected containers
  const [selectedContainers, setSelectedContainers] = useState<any[]>([]);

  // Initial empty form data
  const [formData, setFormData] = useState({
    id: undefined,
    date: '',
    jobNumber: '',
    houseBL: '',
    shippingTerm: 'CY-CY',
    portOfLoading: '',
    portOfDischarge: '',
    portOfLoadingId: undefined,
    portOfDischargeId: undefined,
    polFreeDays: '',
    polDetentionRate: '',
    podFreeDays: '',
    podDetentionRate: '',
    enableTranshipmentPort: false,
    transhipmentPortName: '',
    transhipmentPortId: undefined,
    expHandlingAgentAddressBookId: undefined,
    impHandlingAgentAddressBookId: undefined,
    quantity: '',
    carrierName: '',
    carrierId: undefined,
    vesselName: '',
    gateClosingDate: '',
    sobDate: '',
    etaToPod: '',
    emptyReturnDepot: '',
    estimatedEmptyReturnDate: '',
    containers: [],
  });

  // Fetch empty repo jobs
  const fetchEmptyRepoJobs = async () => {
    try {
      const res = await axios.get('http://localhost:8000/empty-repo-job');
      setEmptyRepoJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch empty repo jobs', err);
    }
  };

  useEffect(() => {
    fetchEmptyRepoJobs();
  }, []);

  // Handle delete
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this empty repo job?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/empty-repo-job/${id}`);
      await fetchEmptyRepoJobs();
    } catch (err) {
      console.error('Failed to delete empty repo job', err);
      alert('Error deleting empty repo job.');
    }
  };

  // Handle edit
  const handleEdit = async (job: any) => {
    // Initialize selectedContainers with the existing containers
    const existingContainers = (job.containers || []).map((container: any) => ({
      containerNumber: container.containerNumber || "",
      capacity: container.capacity || "",
      tare: container.tare || "",
      inventoryId: container.inventoryId || null,
      portId: container.portId || null,
      depotName: container.depotName || "",
      port: container.port || null,
    }));

    setSelectedContainers(existingContainers);

    // FIX: Fetch transhipment port name if transhipmentPortId exists
    let transhipmentPortName = "";
    if (job.transhipmentPortId) {
      try {
        const res = await fetch(`http://localhost:8000/ports/${job.transhipmentPortId}`);
        const port = await res.json();
        transhipmentPortName = port.portName || "";
      } catch (err) {
        console.error("Failed to fetch transhipment port:", err);
      }
    }

    setFormData({
      id: job.id,
      date: job.date ? new Date(job.date).toISOString().split('T')[0] : '',
      jobNumber: job.jobNumber || '',
      houseBL: job.houseBL || '', // ADD THIS LINE
      shippingTerm: job.shippingTerm || 'CY-CY',
      
      // Port info
      portOfLoading: job.polPort?.portName || '',
      portOfDischarge: job.podPort?.portName || '',
      portOfLoadingId: job.polPortId,
      portOfDischargeId: job.podPortId,
      
      // Free days and detention
      polFreeDays: job.polFreeDays || '',
      polDetentionRate: job.polDetentionRate || '',
      podFreeDays: job.podFreeDays || '',
      podDetentionRate: job.podDetentionRate || '',
      
      // FIX: Transhipment - properly set both the flag and the port name
      enableTranshipmentPort: !!job.transhipmentPortId,
      transhipmentPortName: transhipmentPortName, // Use the fetched port name
      transhipmentPortId: job.transhipmentPortId, // Keep the ID for submission
      
      // Agents
      expHandlingAgentAddressBookId: job.expHandlingAgentAddressBookId,
      impHandlingAgentAddressBookId: job.impHandlingAgentAddressBookId,
      
      // Container info
      quantity: job.quantity || '',
      containers: existingContainers,
      
      // Vessel details
      carrierName: job.carrierAddressBook?.companyName || '',
      carrierId: job.carrierAddressBookId,
      vesselName: job.vesselName || '',
      gateClosingDate: job.gsDate ? new Date(job.gsDate).toISOString().split('T')[0] : '',
      sobDate: job.sob ? new Date(job.sob).toISOString().split('T')[0] : '',
      etaToPod: job.etaTopod ? new Date(job.etaTopod).toISOString().split('T')[0] : '',
      
      // Return depot
      emptyReturnDepot: job.emptyReturnDepotAddressBookId?.toString() || '',
      estimatedEmptyReturnDate: job.estimateDate ? new Date(job.estimateDate).toISOString().split('T')[0] : '',
    });
    
    setShowModal(true);
  };

  // Filter jobs based on search
  const filteredJobs = emptyRepoJobs.filter((job: any) => {
    const searchLower = searchText.toLowerCase();
    return (
      job.jobNumber?.toLowerCase().includes(searchLower) ||
      job.houseBL?.toLowerCase().includes(searchLower) ||
      job.polPort?.portName?.toLowerCase().includes(searchLower) ||
      job.podPort?.portName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="px-4 pt-0 pb-4">
      <div className="flex items-center justify-between mt-0 mb-4">
        <div className="relative mr-4 w-full max-w-sm">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            />
            <Input
              type="text"
              placeholder="Search by job number, house BL, or ports..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-10 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-400 focus-visible:ring-neutral-700"
            />
          </div>
        </div>

        <Button
          onClick={() => {
            // FIX: Reset selectedContainers when creating new job
            setSelectedContainers([]);
            
            setFormData({
              id: undefined,
              date: '',
              jobNumber: '',
              houseBL: '',
              shippingTerm: 'CY-CY',
              portOfLoading: '',
              portOfDischarge: '',
              portOfLoadingId: undefined,
              portOfDischargeId: undefined,
              polFreeDays: '',
              polDetentionRate: '',
              podFreeDays: '',
              podDetentionRate: '',
              enableTranshipmentPort: false,
              transhipmentPortName: '',
              transhipmentPortId: undefined,
              expHandlingAgentAddressBookId: undefined,
              impHandlingAgentAddressBookId: undefined,
              quantity: '',
              carrierName: '',
              carrierId: undefined,
              vesselName: '',
              gateClosingDate: '',
              sobDate: '',
              etaToPod: '',
              emptyReturnDepot: '',
              estimatedEmptyReturnDate: '',
              containers: [],
            });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Empty Repo Job
        </Button>

        {showModal && (
          <AddEmptyRepoModal
            onClose={() => setShowModal(false)}
            formTitle={formData.id ? 'Edit Empty Repo Job' : 'New Empty Repo Job'}
            form={formData}
            setForm={setFormData}
            selectedContainers={selectedContainers} // ADD THIS
            setSelectedContainers={setSelectedContainers} // ADD THIS
            refreshShipments={fetchEmptyRepoJobs}
          />
        )}
      </div>

      <div className="rounded-lg border border-border bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-background">
            <TableRow className="border-border">
              <TableHead className="text-foreground font-medium">Job Number</TableHead>
              <TableHead className="text-foreground font-medium">House BL</TableHead>
              <TableHead className="text-foreground font-medium">Port of Loading</TableHead>
              <TableHead className="text-foreground font-medium">Port of Discharge</TableHead>
              <TableHead className="text-foreground font-medium">Vessel</TableHead>
              <TableHead className="text-foreground font-medium">ETD</TableHead>
              <TableHead className="text-foreground font-medium">Containers</TableHead>
              <TableHead className="text-foreground font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                  No empty repo jobs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job: any) => (
                <TableRow
                  key={job.id}
                  className="text-white border-b border-neutral-800 hover:bg-neutral-800/50"
                >
                  <TableCell className="font-medium">{job.jobNumber}</TableCell>
                  <TableCell>{job.houseBL || '-'}</TableCell>
                  <TableCell>{job.polPort?.portName || '-'}</TableCell>
                  <TableCell>{job.podPort?.portName || '-'}</TableCell>
                  <TableCell>{job.vesselName || '-'}</TableCell>
                  <TableCell>{job.sob ? new Date(job.sob).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    {(job.containers ?? [])
                      .map((c: any) => c.containerNumber)
                      .join(', ') || '-'}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      onClick={() => handleEdit(job)}
                      title="Edit"
                      variant="ghost"
                      size="icon"
                      className="text-blue-400 hover:text-blue-300 hover:bg-neutral-800"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(job.id)}
                      title="Delete"
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-neutral-800"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EmptyRepo;