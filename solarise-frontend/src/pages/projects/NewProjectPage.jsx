import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, consumerService, userService } from '../../services/api';

const NewProjectPage = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState([]);
  const [siteManagers, setSiteManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    consumer_id: '',
    registration_no: '',
    capacity_kw: '3.00',
    assigned_site_manager: '',
    current_status: 'new_registration',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [consRes, smRes] = await Promise.allSettled([
        consumerService.getAll(),
        userService.getByRole('site_manager'),
      ]);

      if (consRes.status === 'fulfilled') {
        const cList = consRes.value.data?.data || consRes.value.data || [];
        setConsumers(cList);
        if (cList.length > 0) {
          setForm((prev) => ({ ...prev, consumer_id: cList[0].id }));
        }
      }

      if (smRes.status === 'fulfilled') {
        const smList = smRes.value.data?.data || smRes.value.data || [];
        if (Array.isArray(smList) && smList.length > 0) {
          setSiteManagers(smList);
        } else {
          // Fallback: fetch all and filter for site_manager
          const allRes = await userService.getAll();
          const allList = allRes.data?.data || allRes.data || [];
          setSiteManagers(allList.filter((u) => u.role === 'site_manager'));
        }
      }
    } catch (err) {
      console.warn('Initial data load error:', err);
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
      const res = await projectService.create({
        consumer_id: form.consumer_id,
        registration_no: form.registration_no || `SOL-${Date.now().toString().slice(-6)}`,
        capacity_kw: parseFloat(form.capacity_kw || 3.0),
        assigned_site_manager: form.assigned_site_manager || null,
        current_status: form.current_status,
      });

      const newId = res.data?.data?.id || res.data?.id;
      navigate(newId ? `/projects/${newId}` : '/projects');
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.error || 'Failed to create new solar project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Solar Project</h1>
          <p className="text-sm text-gray-500 mt-1">Register new solar rooftop installation and assign site manager</p>
        </div>
        <button
          onClick={() => navigate('/projects')}
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
          <label className="block text-xs font-semibold text-gray-700 mb-1">Select Consumer Record *</label>
          <select
            name="consumer_id"
            value={form.consumer_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 rounded-xl border text-xs bg-white focus:ring-2 focus:ring-emerald-500"
          >
            {consumers.length === 0 ? (
              <option value="">No registered consumers found (Create consumer first)</option>
            ) : (
              consumers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} — Elec No: {c.electric_consumer_no || 'N/A'} (Phone: {c.phone_primary})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Application / Registration No.</label>
            <input
              type="text"
              name="registration_no"
              value={form.registration_no}
              onChange={handleChange}
              placeholder="Auto-generated if left blank"
              className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">System Capacity (kW) *</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="100"
              name="capacity_kw"
              value={form.capacity_kw}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Site Manager</label>
            <select
              name="assigned_site_manager"
              value={form.assigned_site_manager}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
            >
              <option value="">-- Select Site Manager --</option>
              {siteManagers.map((sm) => (
                <option key={sm.id} value={sm.id}>
                  Site Manager: {sm.full_name} ({sm.email || sm.phone || `ID: ${sm.id}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Status Tag</label>
            <select
              name="current_status"
              value={form.current_status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
            >
              <option value="new_registration">NEW REGISTRATION</option>
              <option value="doc_requested">DOC REQUESTED</option>
              <option value="work_in_progress">WORK IN PROGRESS</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || consumers.length === 0}
            className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? 'Creating Project...' : 'Create Solar Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectPage;
