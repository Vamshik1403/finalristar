'use client';

import React, { useEffect, useState } from 'react';
import SidebarWithHeader from '../components/Sidebar';
import axios from 'axios';
import {
  Box,
  CheckCircle,
  Loader,
  Truck,
  PackageCheck,
  ClipboardList,
  Archive,
  Warehouse,
  FileCheck,
  Clock,
} from 'lucide-react';

const DashboardPage = () => {
  const [inventoryCount, setInventoryCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    AVAILABLE: 0,
    ALLOTED: 0,
    UNAVAILABLE: 0,
    IN_TRANSIT: 0,
  });

  const [shipmentStats, setShipmentStats] = useState({
    total: 0,
    booked: 0,
    inTransit: 0,
    completed: 0,
  });

  const [emptyRepoStats, setEmptyRepoStats] = useState({
    total: 0,
    alloted: 0,
    booked: 0,
    inTransit: 0,
    completed: 0,
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('http://localhost:8000/inventory');
        setInventoryCount(response.data.length);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      }
    };

    const fetchMovementHistory = async () => {
  try {
    const res = await axios.get('http://localhost:8000/movement-history');
    const data = res.data;

    const latestByContainer = new Map<string, any>();

    data.forEach((entry: any) => {
      const containerNumber = entry?.inventory?.containerNumber;
      if (!containerNumber) return;

      const existing = latestByContainer.get(containerNumber);
      const entryDate = new Date(entry.date);

      if (!existing || entryDate > new Date(existing.date)) {
        latestByContainer.set(containerNumber, entry);
      }
    });

    const counts = {
      AVAILABLE: 0,
      ALLOTED: 0,
      UNAVAILABLE: 0,
      IN_TRANSIT: 0,
    };

    latestByContainer.forEach((entry) => {
      const status = entry.status?.toUpperCase();
      if (status === 'AVAILABLE') counts.AVAILABLE++;
      else if (status === 'ALLOTTED') counts.ALLOTED++;
      else if (status === 'UNAVAILABLE') counts.UNAVAILABLE++;
      else counts.IN_TRANSIT++;
    });

    setStatusCounts(counts);

    return { latestByContainer, allMovements: data };
  } catch (error) {
    console.error('Failed to fetch movement history:', error);
    return { latestByContainer: new Map(), allMovements: [] };
  }
};


const fetchShipmentStats = async (
  latestByContainer: Map<string, any>,
  allMovements: any[]
) => {
  try {
    const res = await axios.get('http://localhost:8000/shipment');
    const shipments: any[] = res.data;

    // Map of shipmentId to list of container statuses
    const shipmentMap = new Map<number, string[]>();

    // Use containerNumber to get all matching entries from original history
    const movementHistoryRes = await axios.get('http://localhost:8000/movement-history');
    const allMovements: any[] = movementHistoryRes.data;

    latestByContainer.forEach((latestEntry, containerNumber) => {
      // Get all entries for this container
      const entriesForContainer = allMovements
        .filter((e) => e.inventory?.containerNumber === containerNumber)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Find latest entry (by date) that has a valid shipmentId
      const withShipment = entriesForContainer.find((e) => e.shipmentId !== null);

      const shipmentId: number | undefined = withShipment?.shipmentId;
      const status: string | undefined = latestEntry?.status?.toUpperCase();

      if (!shipmentId || !status) return;

      if (!shipmentMap.has(shipmentId)) {
        shipmentMap.set(shipmentId, []);
      }

      shipmentMap.get(shipmentId)?.push(status);
    });

    let booked = 0;
    let completed = 0;
    let inTransit = 0;

    shipmentMap.forEach((statuses) => {
      const normalized = statuses.map((s) => s.toUpperCase());

      if (normalized.includes('ALLOTTED')) booked++;
      else if (normalized.every((s) => s === 'EMPTY RETURNED')) completed++;
      else inTransit++;
    });

    setShipmentStats({
      total: shipments.length,
      booked,
      inTransit,
      completed,
    });
  } catch (error) {
    console.error('Failed to fetch shipment stats:', error);
  }
};

const fetchEmptyRepoStats = async (
  latestByContainer: Map<string, any>,
  allMovements: any[]
) => {
  try {
    const res = await axios.get('http://localhost:8000/empty-repo-job');
    const jobs = res.data;

    const latestStatusByJobId = new Map<number, string>();

    // Step 1: Find latest entry per container
    const latestByContainerNumber = new Map<string, any>();

    for (const entry of allMovements) {
      const containerNumber = entry?.inventory?.containerNumber;
      if (!containerNumber) continue;

      const existing = latestByContainerNumber.get(containerNumber);
      const entryDate = new Date(entry.date);

      if (!existing || entryDate > new Date(existing.date)) {
        latestByContainerNumber.set(containerNumber, entry);
      }
    }

    // Step 2: For each container, record latest status per emptyRepoJobId
    for (const entry of latestByContainerNumber.values()) {
      const emptyRepoJobId = entry.emptyRepoJobId;
      const status = entry.status?.toUpperCase();

      if (!emptyRepoJobId || !status) continue;

      latestStatusByJobId.set(emptyRepoJobId, status);
    }

    // Step 3: Tally counts based on latest status
    let booked = 0;
    let inTransit = 0;
    let completed = 0;

    latestStatusByJobId.forEach((status, jobId) => {
      if (status === 'EMPTY RETURNED') {
        completed++;
      } else if (status === 'ALLOTTED') {
        booked++;
      } else {
        inTransit++;
      }
    });

    setEmptyRepoStats({
      total: jobs.length,
      alloted: 0, // or update this if needed
      booked,
      inTransit,
      completed,
    });

  } catch (error) {
    console.error('Failed to fetch empty repo stats:', error);
  }
};


const loadData = async () => {
  await fetchInventory();
  const { latestByContainer, allMovements } = await fetchMovementHistory();
  await fetchShipmentStats(latestByContainer, allMovements);
  await fetchEmptyRepoStats(latestByContainer, allMovements);
};





    loadData();
  }, []);

  return (
    <SidebarWithHeader>
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>

        {/* Inventory + Movement Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Card color="bg-blue-600" icon={<Box size={28} className="text-white" />} label="Total Inventory Items" count={inventoryCount} />
          <Card color="bg-green-600" icon={<CheckCircle size={28} className="text-white" />} label="Available" count={statusCounts.AVAILABLE} />
          <Card color="bg-yellow-500" icon={<Box size={28} className="text-white" />} label="Alloted" count={statusCounts.ALLOTED} />
          <Card color="bg-red-600" icon={<Loader size={28} className="text-white" />} label="Unavailable" count={statusCounts.UNAVAILABLE} />
          <Card color="bg-indigo-600" icon={<Truck size={28} className="text-white w-full" />} label="In Transit (Containers)" count={statusCounts.IN_TRANSIT} />
        </div>

        {/* Shipment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Card color="bg-purple-600" icon={<ClipboardList size={28} className="text-white" />} label="Total Shipments" count={shipmentStats.total} />
          <Card color="bg-green-700" icon={<Box size={28} className="text-white" />} label="Booked Shipments" count={shipmentStats.booked} />
          <Card color="bg-orange-600" icon={<Truck size={28} className="text-white" />} label="In Transit Shipments" count={shipmentStats.inTransit} />
          <Card color="bg-teal-600" icon={<PackageCheck size={28} className="text-white" />} label="Completed Shipments" count={shipmentStats.completed} />
        </div>

        {/* Empty Repo Job Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  <Card
    color="bg-pink-600"
    icon={<Archive size={28} className="text-white" />}
    label="Total Empty Repo Jobs"
    count={emptyRepoStats.total}
  />
  <Card
    color="bg-yellow-600"
    icon={<Clock size={28} className="text-white" />}
    label="Booked Repo Jobs"
    count={emptyRepoStats.booked}
  />
  <Card
    color="bg-orange-500"
    icon={<Truck size={28} className="text-white" />}
    label="In Transit Repo Jobs"
    count={emptyRepoStats.inTransit}
  />
  <Card
    color="bg-green-600"
    icon={<FileCheck size={28} className="text-white" />}
    label="Completed Repo Jobs"
    count={emptyRepoStats.completed}
  />
</div>

      </div>
    </SidebarWithHeader>
  );
};

type CardProps = {
  color: string;
  icon: React.ReactNode;
  label: string;
  count: number;
};

const Card: React.FC<CardProps> = ({ color, icon, label, count }) => (
  <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl p-5 shadow-md flex items-center space-x-4">
    <div className={`${color} p-3 rounded-full`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <h3 className="text-2xl font-semibold my-2">{count}</h3>
    </div>
  </div>
);

export default DashboardPage;
