import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consumerService, bankLoanService, documentService } from '../../services/api';
import api from '../../services/api';

const ConsumerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [consumer, setConsumer] = useState(null);
  const [bankLoan, setBankLoan] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bank Loan form modal state
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanForm, setLoanForm] = useState({
    bank_name: '',
    loan_amount: '',
    is_ghanbani_land: false,
    remarks: '',
  });
  const [savingLoan, setSavingLoan] = useState(false);

  useEffect(() => {
    fetchConsumerDetails();
  }, [id]);

  const fetchConsumerDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const consRes = await consumerService.getById(id);
      const consData = consRes.data?.data || consRes.data;
      setConsumer(consData);

      // Fetch Bank Loan
      try {
        const loanRes = await bankLoanService.getByConsumer(id);
        const loanData = loanRes.data?.data || loanRes.data;
        setBankLoan(loanData);
        if (loanData) {
          setLoanForm({
            bank_name: loanData.bank_name || '',
            loan_amount: loanData.loan_amount || '',
            is_ghanbani_land: loanData.is_ghanbani_land || false,
            remarks: loanData.remarks || '',
          });
        }
      } catch (e) {
        setBankLoan(null);
      }

      // Fetch Documents
      try {
        const docRes = await documentService.getByConsumer(id);
        setDocuments(docRes.data?.data || docRes.data || []);
      } catch (e) {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching consumer details:', err);
      setError(err.response?.data?.error || 'Failed to load consumer details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankLoan = async (e) => {
    e.preventDefault();
    try {
      setSavingLoan(true);
      await bankLoanService.createOrUpdate({
        consumer_id: id,
        ...loanForm,
      });
      setShowLoanModal(false);
      await fetchConsumerDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save bank loan information');
    } finally {
      setSavingLoan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !consumer) {
    return (
      <div className="bg-rose-50 text-rose-800 p-6 rounded-2xl border border-rose-200 text-center space-y-4">
        <p className="font-semibold">{error || 'Consumer not found'}</p>
        <button onClick={() => navigate('/consumers')} className="px-4 py-2 bg-rose-600 text-white text-sm rounded-lg">
          ← Back to Consumers
        </button>
      </div>
    );
  }

  // Check age for MAC eligibility
  const age = consumer.age || 0;
  const isSurpassedMAC = age > 64;

  return (
    <div className="space-y-6 pb-12">
      {/* Consumer Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{consumer.full_name}</h1>
            <span className={`px-3 py-0.5 text-xs font-semibold rounded-full capitalize ${
              consumer.payment_mode === 'cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              Payment Mode: {consumer.payment_mode || 'Cash'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Electric Consumer No: <span className="font-mono font-semibold text-gray-900">{consumer.electric_consumer_no}</span> | Phone: <span className="font-semibold text-gray-900">{consumer.phone_primary}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={() => navigate('/consumers')}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            ← Back to List
          </button>
        </div>
      </div>

      {/* MAC Eligibility & Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details Card */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Consumer Personal Details</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-semibold block">Full Name</span>
              <span className="text-gray-900 font-medium">{consumer.full_name}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Primary Phone</span>
              <span className="text-gray-900 font-medium">{consumer.phone_primary}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Secondary Phone</span>
              <span className="text-gray-900 font-medium">{consumer.phone_secondary || '-'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Email Address</span>
              <span className="text-gray-900 font-medium">{consumer.email || '-'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 font-semibold block">Full Installation Address</span>
              <span className="text-gray-900 font-medium">{consumer.address}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Aadhaar Card No.</span>
              <span className="font-mono text-gray-900 font-semibold">{consumer.aadhaar_no || '-'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">PAN Card No.</span>
              <span className="font-mono text-gray-900 font-semibold">{consumer.pan_no || '-'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Occupation</span>
              <span className="capitalize text-gray-900 font-medium">{(consumer.occupation || 'N/A').replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Land Owned by Consumer</span>
              <span className="text-gray-900 font-medium">{consumer.land_owned_by_consumer ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* MAC & Bank Loan Card */}
        <div className="space-y-6">
          {/* Surpassed MAC Warning Card */}
          <div className={`p-6 rounded-2xl border ${isSurpassedMAC ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <h3 className={`text-sm font-bold flex items-center space-x-2 ${isSurpassedMAC ? 'text-rose-900' : 'text-emerald-900'}`}>
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.78-1.34-.25-2.864 1.018-3.836 1.306-1.016 2.888-.918 4.071-.345" />
              </svg>
              <span>MAC Age Rule Status</span>
            </h3>
            <div className="mt-2 text-xs space-y-1">
              <p className={isSurpassedMAC ? 'text-rose-800' : 'text-emerald-800'}>
                Consumer Age: <span className="font-bold">{age || 'N/A'} years</span>
              </p>
              {isSurpassedMAC ? (
                <p className="text-rose-700 font-semibold">
                  ⚠️ Age &gt; 64 years: Surpassed MAC limit! Co-applicant or Legal Heir NOC required.
                </p>
              ) : (
                <p className="text-emerald-700 font-medium">
                  ✓ Eligible under standard MAC age rules (&le; 64 years).
                </p>
              )}
            </div>
          </div>

          {/* Bank Loan Details Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Bank Loan Information</h3>
              <button
                onClick={() => setShowLoanModal(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {bankLoan ? 'Edit Loan' : '+ Add Loan'}
              </button>
            </div>

            {bankLoan ? (
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank Name:</span>
                  <span className="font-semibold text-gray-900">{bankLoan.bank_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Loan Amount:</span>
                  <span className="font-bold text-emerald-600">₹{parseFloat(bankLoan.loan_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ghanbani Land:</span>
                  <span>{bankLoan.is_ghanbani_land ? 'Yes' : 'No'}</span>
                </div>
                {bankLoan.remarks && (
                  <p className="text-gray-500 pt-1 border-t italic">{bankLoan.remarks}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No bank loan details registered for this consumer.</p>
            )}
          </div>
        </div>
      </div>

      {/* Consumer Uploaded Documents Grid */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Uploaded Consumer Documents ({documents.length})</span>
        </h2>

        {documents.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No uploaded documents recorded for this consumer yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 capitalize font-mono text-[11px]">
                    {(doc.doc_type || '').replace(/_/g, ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    doc.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <p className="text-gray-500 font-mono text-[10px] truncate">{doc.file_url || doc.file_name || 'Document File'}</p>
                <p className="text-gray-400 text-[10px]">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Bank Loan */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Bank Loan Information</h3>
            <form onSubmit={handleSaveBankLoan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={loanForm.bank_name}
                  onChange={(e) => setLoanForm({ ...loanForm, bank_name: e.target.value })}
                  placeholder="e.g. State Bank of India"
                  required
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sanctioned Loan Amount (₹)</label>
                <input
                  type="number"
                  value={loanForm.loan_amount}
                  onChange={(e) => setLoanForm({ ...loanForm, loan_amount: e.target.value })}
                  placeholder="e.g. 75000"
                  required
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>

              <label className="flex items-center space-x-2 text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={loanForm.is_ghanbani_land}
                  onChange={(e) => setLoanForm({ ...loanForm, is_ghanbani_land: e.target.checked })}
                />
                <span>Is Ghanbani Land property?</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={loanForm.remarks}
                  onChange={(e) => setLoanForm({ ...loanForm, remarks: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                  placeholder="Additional bank remarks..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLoan}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingLoan ? 'Saving...' : 'Save Loan Info'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerDetailsPage;
