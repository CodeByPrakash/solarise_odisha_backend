import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { consumerService } from '../../services/api';

const ConsumersPage = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConsumers();
  }, []);

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await consumerService.getAll();
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setConsumers(data);
      } else {
        setConsumers([]);
      }
    } catch (err) {
      console.error('API error fetching consumers:', err);
      setError(err.response?.data?.error || 'Could not connect to backend server');
      setConsumers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsumers = consumers.filter((c) =>
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone_primary || '').includes(searchTerm) ||
    (c.electric_consumer_no || '').toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Consumers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage consumer profiles, MAC eligibility, and contact details</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search consumers..."
            className="w-64 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            variant="primary"
            onClick={() => navigate('/consumers/new')}
            className="px-4 py-2 text-sm"
          >
            + Add Consumer
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchConsumers} className="underline text-amber-900 font-semibold ml-4">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredConsumers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">No Consumers Found</h3>
            <p className="text-sm text-gray-500 mt-1">Get started by registering a new consumer into the system.</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => navigate('/consumers/new')}>
                + Register First Consumer
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.HeaderCell>Full Name</Table.HeaderCell>
              <Table.HeaderCell>Primary Phone</Table.HeaderCell>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Electric Consumer No.</Table.HeaderCell>
              <Table.HeaderCell>Payment Mode</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {filteredConsumers.map((consumer) => (
                <Table.Row key={consumer.id}>
                  <Table.Cell className="font-medium text-gray-900">{consumer.full_name}</Table.Cell>
                  <Table.Cell>{consumer.phone_primary}</Table.Cell>
                  <Table.Cell>{consumer.address}</Table.Cell>
                  <Table.Cell>{consumer.electric_consumer_no || 'N/A'}</Table.Cell>
                  <Table.Cell>
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                      consumer.payment_mode === 'cash' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {consumer.payment_mode || 'Cash'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/consumers/${consumer.id}`)}
                    >
                      View
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

export default ConsumersPage;