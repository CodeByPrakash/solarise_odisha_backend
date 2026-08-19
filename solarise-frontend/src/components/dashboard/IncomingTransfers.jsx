import React, { useEffect, useState } from 'react';
import { transferService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const IncomingTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await transferService.getPending();
      setTransfers(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await transferService.accept(id);
      showSuccess('Transfer accepted. Consumer is now assigned to you.');
      setTransfers(transfers.filter((t) => t.id !== id));
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to accept transfer');
    }
  };

  const handleReject = async (id) => {
    try {
      await transferService.reject(id);
      showSuccess('Transfer rejected.');
      setTransfers(transfers.filter((t) => t.id !== id));
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to reject transfer');
    }
  };

  if (loading || transfers.length === 0) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-[24px] p-5 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-indigo-100 pb-2">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 className="text-sm font-extrabold text-indigo-900">Incoming Consumer Transfers ({transfers.length})</h3>
      </div>
      <div className="space-y-3">
        {transfers.map((transfer) => (
          <div key={transfer.id} className="bg-white p-4 rounded-2xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-900">
                {transfer.consumer_name} (Consumer No: {transfer.electric_consumer_no})
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Requested by: <span className="font-semibold text-slate-700">{transfer.from_agent_first} {transfer.from_agent_last}</span>
              </p>
              {transfer.remarks && (
                <p className="text-xs text-indigo-700 italic mt-1 bg-indigo-50 p-1.5 rounded-lg border border-indigo-100">
                  "{transfer.remarks}"
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleReject(transfer.id)}
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-full border border-rose-200 transition"
              >
                Reject
              </button>
              <button
                onClick={() => handleAccept(transfer.id)}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-full shadow-2xs transition"
              >
                Accept Transfer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomingTransfers;
