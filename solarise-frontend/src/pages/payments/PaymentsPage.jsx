import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { paymentService } from '../../services/api';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentService.getAll();
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setPayments(data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error('API error fetching payments:', err);
      setError(err.response?.data?.error || 'Could not fetch payments list from backend API');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((pay) =>
    (pay.registration_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pay.consumer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pay.payment_type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Subsidies</h1>
          <p className="text-sm text-gray-500 mt-1">Track processing fees, security deposits, loans, and CFA/SFA subsidies</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search payments..."
            className="w-64 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            variant="primary"
            onClick={() => navigate('/payments/new')}
            className="px-4 py-2 text-sm"
          >
            + Record Payment
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchPayments} className="underline text-amber-900 font-semibold ml-4">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">No Payment Records Found</h3>
            <p className="text-sm text-gray-500 mt-1">Record consumer payments, security deposits, or subsidy disbursals.</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => navigate('/payments/new')}>
                + Record First Payment
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
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Paid At</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {filteredPayments.map((pay) => (
                <Table.Row key={pay.id}>
                  <Table.Cell className="font-mono text-xs font-semibold text-gray-900">{pay.registration_no || `PROJ-${pay.project_id}`}</Table.Cell>
                  <Table.Cell>{pay.consumer_name || 'Consumer Record'}</Table.Cell>
                  <Table.Cell className="capitalize font-medium text-gray-700">{(pay.payment_type || '').replace(/_/g, ' ')}</Table.Cell>
                  <Table.Cell className="font-semibold text-gray-900">₹{parseFloat(pay.amount || 0).toLocaleString('en-IN')}</Table.Cell>
                  <Table.Cell>
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                      pay.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                      pay.status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {pay.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{pay.paid_at ? new Date(pay.paid_at).toLocaleDateString() : '-'}</Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/payments/${pay.id}`)}
                    >
                      View Record
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;