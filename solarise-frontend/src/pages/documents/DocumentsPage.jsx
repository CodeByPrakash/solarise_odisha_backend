import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { documentService } from '../../services/api';

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await documentService.getAll();
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('API error fetching documents:', err);
      setError(err.response?.data?.error || 'Could not fetch document list from backend API');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    (doc.consumer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.doc_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.status || '').toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Documents Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Review geotagged photos, Aadhaar, ROR, and DISCOM paperwork</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
            className="w-64 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            variant="primary"
            onClick={() => navigate('/documents/upload')}
            className="px-4 py-2 text-sm"
          >
            + Upload Document
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDocuments} className="underline text-amber-900 font-semibold ml-4">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 px-4">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">No Documents Uploaded</h3>
            <p className="text-sm text-gray-500 mt-1">Upload required consumer identity or geotagged site verification files.</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => navigate('/documents/upload')}>
                + Upload First Document
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.HeaderCell>Consumer</Table.HeaderCell>
              <Table.HeaderCell>Document Type</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Uploaded By</Table.HeaderCell>
              <Table.HeaderCell>Uploaded At</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {filteredDocs.map((doc) => (
                <Table.Row key={doc.id}>
                  <Table.Cell className="font-medium text-gray-900">{doc.consumer_name || `Consumer #${doc.consumer_id}`}</Table.Cell>
                  <Table.Cell className="capitalize font-mono text-xs text-gray-700">{(doc.doc_type || '').replace(/_/g, ' ')}</Table.Cell>
                  <Table.Cell>
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                      doc.status === 'verified' ? 'bg-emerald-50 text-emerald-700' :
                      doc.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {doc.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{doc.uploaded_by_name || `User #${doc.uploaded_by}`}</Table.Cell>
                  <Table.Cell>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}</Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      View Document
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

export default DocumentsPage;