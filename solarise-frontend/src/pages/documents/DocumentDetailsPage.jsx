import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { RoleGuard } from '../../components/auth/RoleGuard';

const DocumentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action states
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Reupload modal state
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [reuploadUrl, setReuploadUrl] = useState('');
  const [reuploading, setReuploading] = useState(false);

  // Flag document state
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagActionType, setFlagActionType] = useState('electric_bill_name_correction');
  const [flagReason, setFlagReason] = useState('');
  const [flagging, setFlagging] = useState(false);

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await documentService.getById(id);
      const data = res.data?.data || res.data;
      setDocument(data);
    } catch (err) {
      console.error('Error loading document details:', err);
      setError(err.response?.data?.error || 'Failed to load document details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      await documentService.verify(id, {
        verified_by: user?.id || 1,
      });
      await fetchDocumentDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason) return;
    try {
      setRejecting(true);
      await documentService.reject(id, {
        verified_by: user?.id || 1,
        reject_reason: rejectReason,
      });
      setShowRejectModal(false);
      setRejectReason('');
      await fetchDocumentDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Rejection failed');
    } finally {
      setRejecting(false);
    }
  };

  const handleReupload = async (e) => {
    e.preventDefault();
    try {
      setReuploading(true);
      await documentService.reupload(id, {
        file_url: reuploadUrl || `https://storage.solarise.odisha.gov.in/docs/reupload_v2_${Date.now()}.jpg`,
        uploaded_by: user?.id || 1,
      });
      setShowReuploadModal(false);
      setReuploadUrl('');
      await fetchDocumentDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Reupload failed');
    } finally {
      setReuploading(false);
    }
  };

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    if (!flagReason) return;
    try {
      setFlagging(true);
      await documentService.flag(id, {
        flagged_by: user?.id || 1,
        action_type: flagActionType,
        detail: flagReason,
      });
      setShowFlagModal(false);
      setFlagReason('');
      await fetchDocumentDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Flagging document failed');
    } finally {
      setFlagging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="bg-rose-50 text-rose-800 p-6 rounded-2xl border border-rose-200 text-center space-y-4">
        <p className="font-semibold">{error || 'Document not found'}</p>
        <button onClick={() => navigate('/documents')} className="px-4 py-2 bg-rose-600 text-white text-sm rounded-lg">
          ← Back to Documents
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md font-bold">
              {document.doc_type}
            </span>
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full capitalize ${
              document.status === 'verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              document.status === 'action_required' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
              document.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
              'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {document.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {document.file_name || `${document.doc_type}_file`}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Consumer ID: <span className="font-mono font-semibold text-gray-700">{document.consumer_id}</span> | Version: <span className="font-bold text-purple-600">v{document.version || 1}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {(document.status === 'uploaded' || document.status === 'action_required') && (
            <RoleGuard allowedRoles={['doc_team', 'admin']}>
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
              >
                {verifying ? 'Verifying...' : 'Verify Document'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition shadow-sm"
              >
                Reject Document
              </button>
            </RoleGuard>
          )}
          <RoleGuard allowedRoles={['doc_team', 'admin', 'site_manager']}>
            <button
              onClick={() => setShowFlagModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition shadow-sm"
            >
              Flag Document
            </button>
          </RoleGuard>
          {(document.status === 'action_required' || document.status === 'rejected') && (
            <button
              onClick={() => navigate(`/documents/${id}/resolve`)}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold rounded-xl hover:from-orange-700 hover:to-amber-700 transition shadow-sm flex items-center space-x-1"
            >
              <span>Stepped Resolution Workflow</span>
            </button>
          )}
          <button
            onClick={() => setShowReuploadModal(true)}
            className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold rounded-xl hover:bg-purple-100 transition"
          >
            + Upload New Version
          </button>
          <button
            onClick={() => navigate('/documents')}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Document Information & Metadata</h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-semibold block">Document Category</span>
              <span className="capitalize font-mono font-medium text-gray-900">{(document.doc_type || '').replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Uploaded By</span>
              <span className="text-gray-900 font-medium">{document.uploaded_by_name || `User #${document.uploaded_by}`}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Uploaded At</span>
              <span className="text-gray-900 font-mono">{document.uploaded_at ? new Date(document.uploaded_at).toLocaleString() : 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Verification Status</span>
              <span className="capitalize font-bold text-gray-900">{document.status}</span>
            </div>
            {document.verified_by_name && (
              <div>
                <span className="text-gray-400 font-semibold block">Verified By</span>
                <span className="text-gray-900 font-medium">{document.verified_by_name}</span>
              </div>
            )}
            {document.verified_at && (
              <div>
                <span className="text-gray-400 font-semibold block">Verified At</span>
                <span className="text-gray-900 font-mono">{new Date(document.verified_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          {document.reject_reason && (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
              <span className="font-bold block">Rejection Reason:</span>
              <p>{document.reject_reason}</p>
            </div>
          )}

          <div className="pt-2">
            <span className="text-xs font-semibold text-gray-500 block mb-1">File Storage URL</span>
            <a
              href={document.file_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-blue-600 hover:underline break-all"
            >
              {document.file_url}
            </a>
          </div>
        </div>

        {/* GPS Geotag Badge */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span>Geotag Verification</span>
          </h2>

          {document.geo_lat && document.geo_lng ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-amber-800 font-semibold">Latitude:</span>
                <span className="font-mono text-amber-900 font-bold">{document.geo_lat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-800 font-semibold">Longitude:</span>
                <span className="font-mono text-amber-900 font-bold">{document.geo_lng}</span>
              </div>
              <a
                href={`https://maps.google.com/?q=${document.geo_lat},${document.geo_lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-center py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
              >
                View Location on Google Maps
              </a>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No GPS coordinates recorded for this upload.</p>
          )}
        </div>
      </div>

      {/* Modal: Reject Reason */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-rose-900">Reject Document</h3>
            <form onSubmit={handleReject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Rejection *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Explain why this document is rejected (e.g. blurry geotag photo, mismatched name)..."
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 disabled:opacity-50"
                >
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reupload Version */}
      {showReuploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-purple-900">Upload New Version</h3>
            <form onSubmit={handleReupload} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">New File URL / Storage Path *</label>
                <input
                  type="text"
                  value={reuploadUrl}
                  onChange={(e) => setReuploadUrl(e.target.value)}
                  required
                  placeholder="https://storage.solarise.odisha.gov.in/docs/reupload_v2.jpg"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReuploadModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reuploading}
                  className="px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50"
                >
                  {reuploading ? 'Uploading...' : 'Re-upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Flag Document */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Flag Document for Correction</h3>
            <p className="text-xs text-gray-500">
              Flagging this document will set its status to <span className="font-bold text-orange-600">Action Required</span> and automatically create an open action item.
            </p>

            <form onSubmit={handleFlagSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Action Type / Correction Category *</label>
                <select
                  value={flagActionType}
                  onChange={(e) => setFlagActionType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800"
                >
                  <option value="electric_bill_name_correction">Electric Bill Name Correction</option>
                  <option value="bank_passbook_name_correction">Bank Passbook Name Correction</option>
                  <option value="bank_passbook_update">Bank Passbook Update</option>
                  <option value="ownership_transfer">Ownership Transfer (Land RoR)</option>
                  <option value="commercial_to_domestic">Commercial to Domestic Conversion</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Flag Details / Reason *</label>
                <textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Specify the issue (e.g., Name mismatch on electric bill, unclear scan)..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFlagModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={flagging}
                  className="px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition shadow-sm"
                >
                  {flagging ? 'Flagging...' : 'Confirm Flag Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailsPage;
