import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/api';
import { RoleGuard } from '../../components/auth/RoleGuard';

const PaymentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update state
  const [updating, setUpdating] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: 'paid',
    reference_no: '',
    remarks: '',
  });

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await paymentService.getById(id);
      const data = res.data?.data || res.data;
      setPayment(data);
      if (data) {
        setStatusForm({
          status: data.status || 'paid',
          reference_no: data.reference_no || '',
          remarks: data.remarks || '',
        });
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError(err.response?.data?.error || 'Failed to load payment record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await paymentService.updateStatus(id, statusForm);
      await fetchPaymentDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="bg-rose-50 text-rose-800 p-6 rounded-2xl border border-rose-200 text-center space-y-4">
        <p className="font-semibold">{error || 'Payment record not found'}</p>
        <button onClick={() => navigate('/payments')} className="px-4 py-2 bg-rose-600 text-white text-sm rounded-lg">
          ← Back to Payments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono uppercase px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold">
              {(payment.payment_type || 'payment').replace(/_/g, ' ')}
            </span>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
              payment.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              payment.status === 'failed' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              Status: {payment.status}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1 font-mono">
            ₹{parseFloat(payment.amount || 0).toLocaleString('en-IN')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Project ID: <span className="font-mono font-semibold text-gray-900">PROJ-{payment.project_id}</span> | Ref: <span className="font-mono font-semibold text-gray-900">{payment.reference_no || 'N/A'}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={() => navigate('/payments')}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            ← Back to List
          </button>
        </div>
      </div>

      {/* Payment Receipt Voucher Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <div className="border-b pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Payment Receipt Voucher</h2>
            <p className="text-xs text-gray-400">PM Surya Ghar Muft Bijli Yojana — Odisha</p>
          </div>
          <span className="text-xs font-mono font-semibold text-gray-400">Receipt #{payment.id}</span>
        </div>

        <div className="grid grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-gray-400 font-semibold uppercase block text-[10px]">Project ID</span>
            <span className="text-gray-900 font-bold font-mono">PROJ-{payment.project_id}</span>
          </div>
          <div>
            <span className="text-gray-400 font-semibold uppercase block text-[10px]">Payment Type</span>
            <span className="text-gray-900 font-bold capitalize font-mono">{(payment.payment_type || '').replace(/_/g, ' ')}</span>
          </div>
          <div>
            <span className="text-gray-400 font-semibold uppercase block text-[10px]">Total Amount Paid</span>
            <span className="text-emerald-600 font-extrabold text-base">₹{parseFloat(payment.amount || 0).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-gray-400 font-semibold uppercase block text-[10px]">Transaction Reference / UTR</span>
            <span className="text-gray-900 font-mono font-bold">{payment.reference_no || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-400 font-semibold uppercase block text-[10px]">Recorded By User</span>
            <span className="text-gray-900 font-medium">{payment.recorded_by_name || `User #${payment.recorded_by}`}</span>
          </div>
          <div>
            <span className="text-gray-400 font-semibold uppercase block text-[10px]">Payment Date</span>
            <span className="text-gray-900 font-mono">{payment.paid_at ? new Date(payment.paid_at).toLocaleString() : 'Pending Clearance'}</span>
          </div>
        </div>

        {payment.remarks && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
            <span className="font-bold text-gray-700 block">Voucher Remarks:</span>
            <p className="text-gray-600 italic">{payment.remarks}</p>
          </div>
        )}
      </div>

      {/* Payment Clearance / Status Update Form */}
      <RoleGuard allowedRoles={['accounts', 'admin']}>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Clearance & Status Update (Accounts Desk)</span>
          </h2>

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
                >
                  <option value="paid">PAID (Clearance Confirmed)</option>
                  <option value="pending">PENDING</option>
                  <option value="failed">FAILED / REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reference / UTR No.</label>
                <input
                  type="text"
                  value={statusForm.reference_no}
                  onChange={(e) => setStatusForm({ ...statusForm, reference_no: e.target.value })}
                  placeholder="UTR-12345678"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Update Remarks</label>
              <input
                type="text"
                value={statusForm.remarks}
                onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                placeholder="e.g. Cleared by accounts desk..."
                className="w-full px-3 py-2 rounded-xl border text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
            >
              {updating ? 'Updating...' : 'Update Payment Status'}
            </button>
          </form>
        </div>
      </RoleGuard>
    </div>
  );
};

export default PaymentDetailsPage;
