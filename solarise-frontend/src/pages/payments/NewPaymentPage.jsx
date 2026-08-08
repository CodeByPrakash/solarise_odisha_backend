import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService, projectService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PAYMENT_TYPES = [
  { value: 'processing_fee', label: 'DISCOM Processing Fee' },
  { value: 'security_deposit', label: 'DISCOM Security Deposit' },
  { value: 'consumer_payment', label: 'Consumer Direct Payment' },
  { value: 'loan_disbursal', label: 'Bank Loan Disbursal' },
  { value: 'subsidy_cfa', label: 'Central Financial Assistance (CFA Subsidy)' },
  { value: 'subsidy_sfa', label: 'State Financial Assistance (SFA Subsidy)' },
];

const NewPaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    project_id: '',
    payment_type: 'processing_fee',
    amount: '1000',
    reference_no: '',
    remarks: '',
    status: 'paid',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getAll();
      const list = res.data?.data || res.data || [];
      setProjects(list);
      if (list.length > 0) {
        setForm((prev) => ({ ...prev, project_id: list[0].id }));
      }
    } catch (err) {
      console.warn('Error fetching projects:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await paymentService.create({
        project_id: form.project_id,
        payment_type: form.payment_type,
        amount: parseFloat(form.amount || 0),
        recorded_by: user?.id || 1,
        reference_no: form.reference_no || `PAY-${Date.now().toString().slice(-8)}`,
        remarks: form.remarks || null,
        paid_at: form.status === 'paid' ? new Date().toISOString() : null,
      });

      const newId = res.data?.data?.id || res.data?.id;
      navigate(newId ? `/payments/${newId}` : '/payments');
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(err.response?.data?.error || 'Failed to record payment transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Payment / Subsidy</h1>
          <p className="text-sm text-gray-500 mt-1">Log processing fees, security deposit, bank loan, or CFA/SFA subsidies</p>
        </div>
        <button
          onClick={() => navigate('/payments')}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Select Solar Project *</label>
          <select
            name="project_id"
            value={form.project_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-emerald-500"
          >
            {projects.length === 0 ? (
              <option value="">No active projects found</option>
            ) : (
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  PROJ-{p.id} — {p.consumer_name || `Consumer #${p.consumer_id}`} (Reg: {p.registration_no || 'N/A'})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Category *</label>
            <select
              name="payment_type"
              value={form.payment_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl border text-xs bg-white"
            >
              {PAYMENT_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Transaction Amount (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              placeholder="e.g. 1000"
              className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold text-emerald-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Reference / UTR Number</label>
            <input
              type="text"
              name="reference_no"
              value={form.reference_no}
              onChange={handleChange}
              placeholder="e.g. UTR-9988776655"
              className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Payment Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
            >
              <option value="paid">PAID (Confirmed)</option>
              <option value="pending">PENDING (Awaiting clearance)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Remarks</label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={2}
            placeholder="Enter payment reference, bank details, or discom receipt serial..."
            className="w-full px-3 py-2 rounded-xl border text-xs"
          />
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || projects.length === 0}
            className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPaymentPage;
