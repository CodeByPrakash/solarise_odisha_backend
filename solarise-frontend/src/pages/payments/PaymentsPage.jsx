import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { paymentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TYPE_LABELS = {
  processing_fee: 'DISCOM Processing Fee',
  security_deposit: 'DISCOM Security Deposit',
  consumer_payment: 'Consumer Direct Payment',
  loan_disbursal: 'Bank Loan Disbursal',
  subsidy_cfa: 'Central Subsidy (CFA)',
  subsidy_sfa: 'State Subsidy (SFA)',
};

const PaymentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status Update Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 'paid', reference_no: '', remarks: '' });
  const [updating, setUpdating] = useState(false);

  const canManageStatus = ['admin', 'accounts'].includes(user?.role);

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, summaryRes] = await Promise.allSettled([
        paymentService.getAll(),
        paymentService.getSummary(),
      ]);

      if (listRes.status === 'fulfilled') {
        const data = listRes.value.data?.data || listRes.value.data;
        setPayments(Array.isArray(data) ? data : []);
      }

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value.data);
      }
    } catch (err) {
      console.error('API error fetching payments:', err);
      setError('Could not fetch payments data from server');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (pay) => {
    setSelectedPayment(pay);
    setStatusForm({
      status: 'paid',
      reference_no: pay.reference_no || '',
      remarks: pay.remarks || '',
    });
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;
    try {
      setUpdating(true);
      await paymentService.updateStatus(selectedPayment.id, statusForm);
      setSelectedPayment(null);
      await fetchPaymentsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      (pay.registration_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pay.consumer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pay.reference_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pay.payment_type || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return pay.status === 'pending';
    if (activeTab === 'paid') return pay.status === 'paid';
    if (activeTab === 'failed') return pay.status === 'failed' || pay.status === 'refunded';
    return true;
  });

  const grandSummary = summary?.summary || {};
  const totalVal = parseFloat(grandSummary.grand_total || 0);
  const paidVal = parseFloat(grandSummary.total_paid || 0);
  const pendingVal = parseFloat(grandSummary.total_pending || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Subsidies</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track DISCOM fees, security deposits, loan disbursals & CFA/SFA subsidies
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => navigate('/payments/new')}
            className="px-4 py-2 text-xs font-semibold shadow-sm"
          >
            + Record Payment / Subsidy
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Recorded</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">₹{totalVal.toLocaleString('en-IN')}</p>
          <span className="text-xs text-gray-400 mt-1 block">{grandSummary.total_payments || payments.length} transactions logged</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-white shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Confirmed Paid</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">₹{paidVal.toLocaleString('en-IN')}</p>
          <span className="text-xs text-emerald-600 mt-1 block">Cleared by Accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/30 to-white shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending Clearance</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">₹{pendingVal.toLocaleString('en-IN')}</p>
          <span className="text-xs text-amber-600 mt-1 block">Awaiting bank verification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/30 to-white shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Subsidy Claims</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">
            ₹{(
              payments
                .filter(p => ['subsidy_cfa', 'subsidy_sfa'].includes(p.payment_type))
                .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0)
            ).toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-blue-600 mt-1 block">CFA & SFA government subsidies</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {[
            { key: 'all', label: 'All Payments' },
            { key: 'pending', label: `Pending Clearance (${payments.filter(p => p.status === 'pending').length})` },
            { key: 'paid', label: 'Paid' },
            { key: 'failed', label: 'Failed / Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by reg #, consumer, or UTR..."
          className="w-full sm:w-64 px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {error && (
        <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchPaymentsData} className="underline font-semibold ml-4">Retry</button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">No matching payment records found</h3>
            <p className="text-xs text-gray-500 mt-1">Record a new payment or change your active filters.</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => navigate('/payments/new')}>
                + Record Payment
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.HeaderCell>Project ID</Table.HeaderCell>
              <Table.HeaderCell>Consumer</Table.HeaderCell>
              <Table.HeaderCell>Payment Type</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Reference / UTR</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Recorded By</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {filteredPayments.map((pay) => (
                <Table.Row key={pay.id}>
                  <Table.Cell className="font-mono text-xs font-bold text-gray-900">
                    {pay.registration_no || `PROJ-${pay.project_id}`}
                  </Table.Cell>
                  <Table.Cell className="font-medium text-gray-900">
                    {pay.consumer_name || 'Consumer Record'}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-800 border">
                      {TYPE_LABELS[pay.payment_type] || (pay.payment_type || '').replace(/_/g, ' ')}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="font-extrabold text-gray-900 font-mono">
                    ₹{parseFloat(pay.amount || 0).toLocaleString('en-IN')}
                  </Table.Cell>
                  <Table.Cell className="font-mono text-xs text-gray-600">
                    {pay.reference_no || 'N/A'}
                  </Table.Cell>
                  <Table.Cell>
                    <span className={`px-2.5 py-1 text-[11px] rounded-full font-bold capitalize ${
                      pay.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      pay.status === 'failed' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {pay.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-xs text-gray-500">
                    {pay.recorded_by_name || `User #${pay.recorded_by}`}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/payments/${pay.id}`)}
                      >
                        Voucher
                      </Button>
                      {canManageStatus && pay.status === 'pending' && (
                        <button
                          onClick={() => handleOpenStatusModal(pay)}
                          className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-semibold rounded-lg hover:bg-emerald-700 transition"
                        >
                          Clear Payment
                        </button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Quick Status Update Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base">Update Payment Clearance</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs bg-gray-50 p-3 rounded-xl space-y-1">
              <p><span className="font-semibold text-gray-700">Project:</span> PROJ-{selectedPayment.project_id} ({selectedPayment.consumer_name})</p>
              <p><span className="font-semibold text-gray-700">Category:</span> {TYPE_LABELS[selectedPayment.payment_type] || selectedPayment.payment_type}</p>
              <p><span className="font-semibold text-gray-700">Amount:</span> ₹{parseFloat(selectedPayment.amount || 0).toLocaleString('en-IN')}</p>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Set Status *</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Reference / UTR Number</label>
                <input
                  type="text"
                  value={statusForm.reference_no}
                  onChange={(e) => setStatusForm({ ...statusForm, reference_no: e.target.value })}
                  placeholder="e.g. UTR-99887766"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={statusForm.remarks}
                  onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                  placeholder="e.g. Verified by Accounts Desk"
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {updating ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;