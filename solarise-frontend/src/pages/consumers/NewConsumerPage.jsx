import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { consumerService, areaBlockService } from '../../services/api';

const NewConsumerPage = () => {
  const navigate = useNavigate();
  const [areaBlocks, setAreaBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    address: '',
    area_block_id: '',
    email: '',
    phone_primary: '',
    phone_secondary: '',
    electric_consumer_no: '',
    name_on_electric_bill: '',
    phone_on_electric_bill: '',
    age: '35',
    aadhaar_no: '',
    pan_no: '',
    bank_account_no: '',
    payment_mode: 'cash',
    land_owned_by_consumer: true,
    occupation: 'self_employed',
  });

  useEffect(() => {
    fetchAreaBlocks();
  }, []);

  const fetchAreaBlocks = async () => {
    try {
      const res = await areaBlockService.getAll();
      const blocks = res.data?.data || res.data || [];
      setAreaBlocks(blocks);
      if (blocks.length > 0) {
        setForm((prev) => ({ ...prev, area_block_id: blocks[0].id }));
      }
    } catch (e) {
      console.warn('Could not fetch area blocks');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await consumerService.create(form);
      const newId = res.data?.data?.id || res.data?.id;
      navigate(newId ? `/consumers/${newId}` : '/consumers');
    } catch (err) {
      console.error('Error registering consumer:', err);
      setError(err.response?.data?.error || 'Failed to register consumer');
    } finally {
      setLoading(false);
    }
  };

  const ageNum = parseInt(form.age || '0', 10);
  const isSurpassedMAC = ageNum > 64;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register New Consumer</h1>
          <p className="text-sm text-gray-500 mt-1">Add consumer credentials, electric bill no, and MAC age check</p>
        </div>
        <button
          onClick={() => navigate('/consumers')}
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

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        {/* Basic Personal Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            1. Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                placeholder="e.g. Ramesh Chandra Das"
                className="w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Phone Number *</label>
              <input
                type="text"
                name="phone_primary"
                value={form.phone_primary}
                onChange={handleChange}
                required
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Secondary Phone</label>
              <input
                type="text"
                name="phone_secondary"
                value={form.phone_secondary}
                onChange={handleChange}
                placeholder="e.g. 9437012345"
                className="w-full px-3 py-2 rounded-xl border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. consumer@example.com"
                className="w-full px-3 py-2 rounded-xl border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Age (18 - 120) *</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min="18"
                max="120"
                required
                className="w-full px-3 py-2 rounded-xl border text-xs"
              />
              {isSurpassedMAC && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  ⚠️ Age &gt; 64 years: Surpassed MAC threshold!
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Area Block *</label>
              <select
                name="area_block_id"
                value={form.area_block_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
              >
                {areaBlocks.length === 0 ? (
                  <option value="1">Default Block (Bhubaneswar)</option>
                ) : (
                  areaBlocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Residential Address *</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              rows={2}
              placeholder="House No, Village/Locality, District, Odisha"
              className="w-full px-3 py-2 rounded-xl border text-xs"
            />
          </div>
        </div>

        {/* Electric Connection & KYC */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            2. DISCOM Connection & KYC Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Electric Consumer No. *</label>
              <input
                type="text"
                name="electric_consumer_no"
                value={form.electric_consumer_no}
                onChange={handleChange}
                required
                placeholder="e.g. ELE-2026-9090"
                className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Name on Electric Bill *</label>
              <input
                type="text"
                name="name_on_electric_bill"
                value={form.name_on_electric_bill}
                onChange={handleChange}
                required
                placeholder="Name as printed on bill"
                className="w-full px-3 py-2 rounded-xl border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Aadhaar No. (12 Digits)</label>
              <input
                type="text"
                name="aadhaar_no"
                value={form.aadhaar_no}
                onChange={handleChange}
                maxLength={12}
                placeholder="123456789012"
                className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">PAN Card No. (10 Chars)</label>
              <input
                type="text"
                name="pan_no"
                value={form.pan_no}
                onChange={handleChange}
                maxLength={10}
                placeholder="ABCDE1234F"
                className="w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Payment & Ownership */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
            3. Payment Mode & Occupation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Mode *</label>
              <select
                name="payment_mode"
                value={form.payment_mode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
              >
                <option value="cash">Cash Payment</option>
                <option value="bank_loan">Bank Loan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Occupation</label>
              <select
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
              >
                <option value="self_employed">Self Employed</option>
                <option value="farmer">Farmer</option>
                <option value="housewife">Housewife</option>
                <option value="government_service">Government Service</option>
                <option value="private_job">Private Job</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              name="land_owned_by_consumer"
              checked={form.land_owned_by_consumer}
              onChange={handleChange}
              className="h-4 w-4 text-emerald-600 rounded"
            />
            <span>Roof / Land is directly owned by consumer</span>
          </label>
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t">
          <button
            type="button"
            onClick={() => navigate('/consumers')}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? 'Registering Consumer...' : 'Save & Register Consumer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewConsumerPage;
