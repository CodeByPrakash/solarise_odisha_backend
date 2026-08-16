import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { areaBlockService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';

const ODISHA_DISTRICTS = [
  'Khurda', 'Cuttack', 'Puri', 'Ganjam', 'Sambalpur',
  'Sundargarh', 'Balasore', 'Bhadrak', 'Jajpur', 'Kendrapara',
  'Jagatsinghpur', 'Mayurbhanj', 'Keonjhar', 'Dhenkanal', 'Angul',
  'Nayagarh', 'Bargarh', 'Jharsuguda', 'Bolangir', 'Kalahandi',
  'Koraput', 'Rayagada', 'Nabarangpur', 'Malkangiri', 'Kandhamal',
  'Gajapati', 'Boudh', 'Subarnapur', 'Deogarh', 'Nuapada'
];

const AreaBlocksPage = () => {
  const { user: currentUser } = useAuth();
  const creatorRole = currentUser?.role || 'agent';
  const isAdmin = creatorRole === 'admin';
  const canEdit = ['admin', 'agent', 'doc_team'].includes(creatorRole);

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [createForm, setCreateForm] = useState({
    block_name: '',
    district: 'Khurda',
    is_active: true,
  });

  // Edit Modal state
  const [editingBlock, setEditingBlock] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    district: 'Khurda',
    is_active: true,
  });

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await areaBlockService.getAll();
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setBlocks(data);
      } else {
        setBlocks([]);
      }
    } catch (err) {
      console.error('Error fetching area blocks:', err);
      setError(err.response?.data?.error || 'Failed to load area blocks');
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      setSubmitting(true);
      await areaBlockService.create(createForm);
      setShowCreateModal(false);
      setCreateForm({
        block_name: '',
        district: 'Khurda',
        is_active: true,
      });
      await fetchBlocks();
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to create area block');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (block) => {
    setEditingBlock(block);
    setEditForm({
      name: block.name || '',
      district: block.district || 'Khurda',
      is_active: block.is_active ?? true,
    });
    setShowEditModal(true);
  };

  const handleUpdateBlock = async (e) => {
    e.preventDefault();
    if (!editingBlock) return;
    try {
      setUpdating(true);
      await areaBlockService.update(editingBlock.id, editForm);
      setShowEditModal(false);
      setEditingBlock(null);
      await fetchBlocks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update area block');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (block) => {
    const action = block.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} block "${block.name}"?`)) return;
    try {
      await areaBlockService.update(block.id, {
        name: block.name,
        district: block.district,
        is_active: !block.is_active,
      });
      await fetchBlocks();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} block`);
    }
  };

  const handleDeleteBlock = async (block) => {
    if (!window.confirm(`Are you sure you want to permanently delete area block "${block.name}"?`)) return;
    try {
      await areaBlockService.delete(block.id);
      await fetchBlocks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete area block');
    }
  };

  // Filtered List
  const filteredBlocks = blocks.filter((b) => {
    const blockName = (b.name || '').toLowerCase();
    const districtName = (b.district || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = blockName.includes(searchLower) || districtName.includes(searchLower);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && b.is_active !== false) ||
      (statusFilter === 'inactive' && b.is_active === false);

    const matchesDistrict =
      districtFilter === 'all' || (b.district || '').toLowerCase() === districtFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const totalCount = blocks.length;
  const activeCount = blocks.filter((b) => b.is_active !== false).length;
  const inactiveCount = blocks.filter((b) => b.is_active === false).length;

  // Extract unique districts present in current blocks
  const availableDistricts = Array.from(new Set(blocks.map((b) => b.district).filter(Boolean))).sort();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Main Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Geographic Area & Blocks</h1>
          <p className="text-xs text-slate-500 mt-1">Manage operational coverage blocks, DISCOM regions, and district agent zones across Odisha</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 text-xs font-bold rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs self-start md:self-auto"
        >
          + Create New Area Block
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">Total Area Blocks</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{totalCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Configured operational zones</span>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">Active Coverage Zones</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">{activeCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Ready for consumer registration</span>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">Inactive / Archived</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1 font-mono">{inactiveCount}</p>
          <span className="text-[10px] text-amber-600 font-bold mt-0.5 block">Temporarily paused regions</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blocks by name or district..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            🔍
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {availableDistricts.length > 0 && (
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700"
            >
              <option value="all">All Districts ({availableDistricts.length})</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl border border-rose-200 text-xs flex items-center justify-between font-semibold shadow-2xs">
          <span>⚠️ {error}</span>
          <button onClick={fetchBlocks} className="underline text-rose-900 font-bold ml-4">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[28px] shadow-sm border border-slate-200/80 overflow-hidden">
        {filteredBlocks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="h-12 w-12 rounded-[20px] bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              🗺️
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No Area Blocks Found</h3>
            <p className="text-xs text-slate-500 mt-1">No geographic blocks match your search or filter parameters.</p>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.HeaderCell>Block ID</Table.HeaderCell>
              <Table.HeaderCell>Area Block Name</Table.HeaderCell>
              <Table.HeaderCell>District</Table.HeaderCell>
              <Table.HeaderCell>Coverage Status</Table.HeaderCell>
              {canEdit && <Table.HeaderCell>Actions</Table.HeaderCell>}
            </Table.Header>
            <Table.Body>
              {filteredBlocks.map((b) => (
                <Table.Row key={b.id}>
                  <Table.Cell>
                    <span className="font-mono font-bold text-xs text-slate-900">
                      #{b.id}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-xs flex items-center justify-center font-mono shrink-0 shadow-2xs border border-emerald-200">
                        📍
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">{b.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Odisha Block Region</p>
                      </div>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                      🏢 {b.district || 'Khurda'}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                      b.is_active !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {b.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </Table.Cell>

                  {canEdit && (
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full border border-slate-200/80 transition"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => handleToggleStatus(b)}
                          className={`px-3 py-1 text-xs font-bold rounded-full transition border ${
                            b.is_active !== false
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {b.is_active !== false ? 'Deactivate' : 'Activate'}
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteBlock(b)}
                            className="cursor-pointer px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-full border border-rose-200 transition"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* CREATE BLOCK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Create New Area Block</h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure operational coverage zone for consumer registration</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            {modalError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-2xl border border-rose-200 text-xs font-bold">
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Block / Area Name *</label>
                <input
                  type="text"
                  value={createForm.block_name}
                  onChange={(e) => setCreateForm({ ...createForm, block_name: e.target.value })}
                  placeholder="e.g. Bhubaneswar Block A or Cuttack Sadar"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">District *</label>
                <select
                  value={createForm.district}
                  onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {ODISHA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={createForm.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.value === 'active' })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold"
                >
                  <option value="active">Active (Open for consumers)</option>
                  <option value="inactive">Inactive (Paused)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-2xs transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Area Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BLOCK MODAL */}
      {showEditModal && editingBlock && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Area Block</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleUpdateBlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Area Block Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District</label>
                <select
                  value={editForm.district}
                  onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold"
                >
                  {ODISHA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editForm.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Update Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaBlocksPage;
