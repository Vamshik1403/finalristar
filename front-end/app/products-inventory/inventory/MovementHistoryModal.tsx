import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, RefreshCcw } from 'lucide-react';

interface HistoryEntry {
  id: number;
  date: string;
  status: string;
  inventory?: { containerNumber: string };
  shipmentId: number | null;
  emptyRepoJobId: number | null;
  port?: { portName?: string };
  addressBook?: { addressName?: string };
}

interface Props {
  containerNumber: string;
  onClose: () => void;
}

const MovementHistoryModal: React.FC<Props> = ({ containerNumber, onClose }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/movement-history`);
      const all = res.data || [];

      const filtered = all.filter(
        (entry: HistoryEntry) =>
          entry.inventory?.containerNumber?.toLowerCase() === containerNumber.toLowerCase()
      );

      setHistory(filtered);
    } catch (err) {
      console.error('Error fetching movement history:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (containerNumber) fetchHistory();
  }, [containerNumber]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 text-white w-[800px] rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Container {containerNumber} - Status History
            <span className="ml-2 text-gray-400 text-sm">({history.length} entries)</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400">
            <X size={20} />
          </button>
        </div>

        {/* Refresh Button */}
        <div className="px-4 py-2 flex justify-between items-center">
          <button onClick={fetchHistory} className="text-blue-400 hover:text-blue-500 flex items-center text-sm">
            <RefreshCcw size={16} className="mr-1" />
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[400px] px-4">
          <table className="w-full text-sm">
            <thead className="bg-white dark:bg-neutral-800">
              <tr>
                <th className="text-left py-2 px-3 text-black dark:text-white">Date</th>
                <th className="text-left py-2 px-3 text-black dark:text-white">Job No.</th>
                <th className="text-left py-2 px-3 text-black dark:text-white">Location</th>
                <th className="text-left py-2 px-3 text-black dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-4 text-black dark:text-white">Loading...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4 text-gray-400">No history found.</td></tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id} className="border-t border-neutral-800">
                    <td className="py-2 px-3 text-black dark:text-white">{new Date(entry.date).toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-black dark:text-white">
                      {entry.shipmentId
                        ? `25/${String(entry.shipmentId).padStart(5, '0')}`
                        : entry.emptyRepoJobId
                        ? `25/${String(entry.emptyRepoJobId).padStart(5, '0')}`
                        : 'NA'}
                    </td>
                    <td className="py-2 px-3 text-black dark:text-white">{entry.port?.portName || 'Unknown'}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.status === 'Allotted'
                            ? 'bg-blue-600 text-white'
                            : entry.status === 'Available'
                            ? 'bg-green-600 text-white'
                            : entry.status?.toLowerCase().includes('empty')
                            ? 'bg-yellow-600 text-black'
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-right border-t border-neutral-800">
          <button
            onClick={onClose}
            className="bg-neutral-700 hover:bg-neutral-600 text-sm text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovementHistoryModal;
