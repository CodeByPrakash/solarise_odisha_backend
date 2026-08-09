import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService, consumerService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ALL_DOCUMENT_TYPES } from '../../constants/documentTypes';

const DocumentUploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    consumer_id: '',
    doc_type: 'electric_bill',
    file_name: '',
    file_url: '',
    mime_type: 'image/jpeg',
    geo_lat: '',
    geo_lng: '',
  });

  useEffect(() => {
    fetchConsumers();
  }, []);

  const fetchConsumers = async () => {
    try {
      const res = await consumerService.getAll();
      const list = res.data?.data || res.data || [];
      setConsumers(list);
      if (list.length > 0) {
        setForm((prev) => ({ ...prev, consumer_id: list[0].id }));
      }
    } catch (err) {
      console.warn('Error fetching consumers:', err);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            geo_lat: pos.coords.latitude.toFixed(6),
            geo_lng: pos.coords.longitude.toFixed(6),
          }));
        },
        (err) => alert('Could not capture GPS coordinates: ' + err.message)
      );
    } else {
      alert('Geolocation is not supported by your browser.');
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
      const dummyUrl = form.file_url || `https://storage.solarise.odisha.gov.in/docs/${form.doc_type}_${Date.now()}.jpg`;
      const res = await documentService.create({
        consumer_id: form.consumer_id,
        doc_type: form.doc_type,
        file_url: dummyUrl,
        file_name: form.file_name || `${form.doc_type}_document.jpg`,
        mime_type: form.mime_type,
        geo_lat: form.geo_lat ? parseFloat(form.geo_lat) : null,
        geo_lng: form.geo_lng ? parseFloat(form.geo_lng) : null,
        uploaded_by: user?.id || 1,
      });

      const newId = res.data?.data?.id || res.data?.id;
      navigate(newId ? `/documents/${newId}` : '/documents');
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err.response?.data?.error || 'Failed to record document upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Consumer Document</h1>
          <p className="text-sm text-gray-500 mt-1">Record geotagged site photo or identity verification document</p>
        </div>
        <button
          onClick={() => navigate('/documents')}
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
          <label className="block text-xs font-semibold text-gray-700 mb-1">Select Consumer *</label>
          <select
            name="consumer_id"
            value={form.consumer_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-emerald-500"
          >
            {consumers.length === 0 ? (
              <option value="">No registered consumers found</option>
            ) : (
              consumers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} — Elec No: {c.electric_consumer_no || 'N/A'}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Document Category *</label>
            <select
              name="doc_type"
              value={form.doc_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {ALL_DOCUMENT_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label} ({dt.value})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Document File Title</label>
            <input
              type="text"
              name="file_name"
              value={form.file_name}
              onChange={handleChange}
              placeholder="e.g. Geotag_Roof_Site.jpg"
              className="w-full px-3 py-2 rounded-xl border text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">File URL / Cloud Storage Path</label>
          <input
            type="text"
            name="file_url"
            value={form.file_url}
            onChange={handleChange}
            placeholder="https://storage.solarise.odisha.gov.in/docs/sample.jpg"
            className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
          />
        </div>

        {/* GPS Geotagging Card */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-amber-900 flex items-center space-x-1">
              <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Geotag Coordinates (Optional)</span>
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              className="px-3 py-1 bg-amber-600 text-white text-[11px] font-semibold rounded-lg hover:bg-amber-700 transition"
            >
              🎯 Auto-Detect My Location
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-amber-800 font-semibold mb-1">Latitude (deg)</label>
              <input
                type="number"
                step="any"
                name="geo_lat"
                value={form.geo_lat}
                onChange={handleChange}
                placeholder="20.296059"
                className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-amber-800 font-semibold mb-1">Longitude (deg)</label>
              <input
                type="number"
                step="any"
                name="geo_lng"
                value={form.geo_lng}
                onChange={handleChange}
                placeholder="85.824539"
                className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono bg-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || consumers.length === 0}
            className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? 'Uploading...' : 'Save & Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploadPage;
