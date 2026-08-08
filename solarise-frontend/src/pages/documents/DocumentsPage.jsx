import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { documentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DOC_TYPE_LABELS = {
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  ror: 'Land ROR (Patta)',
  electricity_bill: 'DISCOM Electricity Bill',
  geotag_photo: 'Geotagged Roof Site Photo',
  discom_noc: 'DISCOM Feasibility NOC',
  net_metering_agreement: 'Net Metering Agreement',
  installation_photo: 'Installation Verification Photo',
  bank_passbook: 'Bank Passbook / Cancelled Cheque',
};

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Quick Reject Modal
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const canVerify = ['admin', 'doc_team'].includes(user?.role);

  useEffect(() => {
    fetchDocumentsData();
  }, []);

  const fetchDocumentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, summaryRes] = await Promise.allSettled([
        documentService.getAll(),
        documentService.getStatusSummary(),
      ]);

      if (listRes.status === 'fulfilled') {
        const data = listRes.value.data?.data || listRes.value.data;
        setDocuments(Array.isArray(data) ? data : []);
      }

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value.data);
      }
    } catch (err) {
      console.error('API error fetching documents:', err);
      setError('Could not fetch document list from server');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVerify = async (docId) => {
    try {
      setActionLoading(true);
      await documentService.verify(docId, { verified_by: user?.id || 1 });
      await fetchDocumentsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingDoc || !rejectReason) return;
    try {
      setActionLoading(true);
      await documentService.reject(rejectingDoc.id, {
        verified_by: user?.id || 1,
        reject_reason: rejectReason,
      });
      setRejectingDoc(null);
      setRejectReason('');
      await fetchDocumentsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      (doc.consumer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.doc_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.file_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.status || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'uploaded') return doc.status === 'uploaded';
    if (activeTab === 'verified') return doc.status === 'verified';
    if (activeTab === 'rejected') return doc.status === 'rejected';
    return true;
  });

  const totalCount = summary?.total_documents || documents.length;
  const uploadedCount = documents.filter(d => d.status === 'uploaded').length;
  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents & Geotag Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Review geotagged photos, Aadhaar, ROR, NOC, and DISCOM paperwork</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => navigate('/documents/upload')}
            className="px-4 py-2 text-xs font-semibold shadow-sm"
          >
            + Upload Document
          </Button>
        </div>
      </div>

      {/* Status KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Uploads</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalCount}</p>
          <span className="text-xs text-gray-400 mt-1 block">Indexed consumer documents</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/30 to-white shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending Review</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{uploadedCount}</p>
          <span className="text-xs text-amber-600 mt-1 block">Awaiting doc team approval</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-white shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Verified Docs</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{verifiedCount}</p>
          <span className="text-xs text-emerald-600 mt-1 block">Passed compliance check</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/30 to-white shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Rejected / Resubmit</span>
          <p className="text-2xl font-extrabold text-rose-700 mt-1">{rejectedCount}</p>
          <span className="text-xs text-rose-600 mt-1 block">Requires new upload version</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {[
            { key: 'all', label: 'All Documents' },
            { key: 'uploaded', label: `Pending Review (${uploadedCount})` },
            { key: 'verified', label: `Verified (${verifiedCount})` },
            { key: 'rejected', label: `Rejected (${rejectedCount})` },
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
          placeholder="Search by consumer, doc type, or filename..."
          className="w-full sm:w-64 px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {error && (
        <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDocumentsData} className="underline font-semibold ml-4">Retry</button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 px-4">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">No matching document records found</h3>
            <p className="text-xs text-gray-500 mt-1">Upload consumer paperwork or adjust search filters.</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => navigate('/documents/upload')}>
                + Upload Document
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.HeaderCell>Consumer</Table.HeaderCell>
              <Table.HeaderCell>Document Type</Table.HeaderCell>
              <Table.HeaderCell>Version</Table.HeaderCell>
              <Table.HeaderCell>Geotag GPS</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Uploaded At</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {filteredDocs.map((doc) => (
                <Table.Row key={doc.id}>
                  <Table.Cell className="font-medium text-gray-900">
                    {doc.consumer_name || `Consumer #${doc.consumer_id}`}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-800 border">
                      {DOC_TYPE_LABELS[doc.doc_type] || (doc.doc_type || '').replace(/_/g, ' ')}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="font-mono text-xs font-semibold text-purple-700">
                    v{doc.version || 1}
                  </Table.Cell>
                  <Table.Cell className="text-xs font-mono">
                    {doc.geo_lat && doc.geo_lng ? (
                      <span className="text-amber-700 font-bold flex items-center space-x-1">
                        <span>🎯 {parseFloat(doc.geo_lat).toFixed(3)}, {parseFloat(doc.geo_lng).toFixed(3)}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">No Geotag</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span className={`px-2.5 py-1 text-[11px] rounded-full font-bold capitalize ${
                      doc.status === 'verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      doc.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {doc.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-xs text-gray-500">
                    {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/documents/${doc.id}`)}
                      >
                        View
                      </Button>
                      {canVerify && doc.status === 'uploaded' && (
                        <>
                          <button
                            onClick={() => handleQuickVerify(doc.id)}
                            disabled={actionLoading}
                            className="px-2 py-1 bg-emerald-600 text-white text-[11px] font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                          >
                            ✓ Verify
                          </button>
                          <button
                            onClick={() => setRejectingDoc(doc)}
                            disabled={actionLoading}
                            className="px-2 py-1 bg-rose-600 text-white text-[11px] font-semibold rounded-lg hover:bg-rose-700 disabled:opacity-50 transition"
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Quick Reject Modal */}
      {rejectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-rose-900 text-base">Reject Document Upload</h3>
              <button
                onClick={() => setRejectingDoc(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs bg-gray-50 p-3 rounded-xl space-y-1">
              <p><span className="font-semibold text-gray-700">Consumer:</span> {rejectingDoc.consumer_name}</p>
              <p><span className="font-semibold text-gray-700">Document:</span> {DOC_TYPE_LABELS[rejectingDoc.doc_type] || rejectingDoc.doc_type} (v{rejectingDoc.version || 1})</p>
            </div>

            <form onSubmit={handleQuickRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Rejection *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Explain rejection reason (e.g. illegible text, invalid GPS geotag, mismatch)..."
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setRejectingDoc(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;