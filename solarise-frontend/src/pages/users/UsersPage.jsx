import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';

const ROLE_COLOR_MAP = {
  admin: 'bg-rose-50 text-rose-700 border-rose-200',
  agent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  site_manager: 'bg-blue-50 text-blue-700 border-blue-200',
  doc_team: 'bg-purple-50 text-purple-700 border-purple-200',
  accounts: 'bg-amber-50 text-amber-700 border-amber-200',
};

const ROLE_DESCRIPTIONS = {
  admin: 'Full System Control • User Management & Master Configurations',
  doc_team: 'Document Desk • DISCOM Approvals, Subsidies & Compliance',
  site_manager: 'Field Operations • Installation Progress & Site Inspection',
  accounts: 'Finance • Bank Loan Processing & Subsidy Ledger Management',
  agent: 'Field Onboarding • Consumer Registration & Lead Generation',
};

const ALLOWED_ROLE_CREATION = {
  admin: ['admin', 'agent', 'site_manager', 'doc_team', 'accounts'],
  doc_team: ['agent', 'site_manager', 'doc_team'],
  site_manager: ['agent'],
  accounts: ['agent'],
  agent: ['agent'],
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const creatorRole = currentUser?.role || 'agent';
  const currentUserId = String(currentUser?.id || currentUser?.userId || '');
  const allowedRolesToAssign = ALLOWED_ROLE_CREATION[creatorRole] || ['agent'];
  const isAdmin = creatorRole === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [newUserForm, setNewUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: allowedRolesToAssign[0] || 'agent',
  });

  // Edit User state
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'agent',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userService.getAll();
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Failed to load system users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      setSubmitting(true);
      await userService.create(newUserForm);
      setShowCreateModal(false);
      setNewUserForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        role: allowedRolesToAssign[0] || 'agent',
      });
      await fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to register new user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'agent',
      is_active: user.is_active ?? true,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const isSelf = String(editingUser.id) === currentUserId;
    if (isSelf && editForm.is_active === false) {
      alert('Security Protection: You cannot deactivate your own active session account.');
      return;
    }

    try {
      setUpdating(true);
      await userService.update(editingUser.id, editForm);
      setShowEditModal(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user details');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActiveStatus = async (u) => {
    const isSelf = String(u.id) === currentUserId;
    if (isSelf) {
      alert('Security Protection: You cannot deactivate your own active session account.');
      return;
    }

    const action = u.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} user account "${u.first_name} ${u.last_name}"?`)) return;
    try {
      await userService.update(u.id, {
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        is_active: !u.is_active,
      });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} user account`);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim().toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      fullName.includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower) ||
      (u.phone || '').includes(searchTerm);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate Stat Counts
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const docTeamCount = users.filter((u) => u.role === 'doc_team' || u.role === 'site_manager').length;
  const agentCount = users.filter((u) => u.role === 'agent').length;

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Accounts & Roles</h1>
          <p className="text-xs text-slate-500 mt-1">Manage system operators, field agents, and role-based operational permissions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 text-xs font-bold rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs self-start md:self-auto"
        >
          + Register New User
        </Button>
      </div>

      {/* Role Distribution Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">Total Portal Users</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{totalCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Active account credentials</span>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">System Admins</span>
          <p className="text-2xl font-extrabold text-rose-700 mt-1 font-mono">{adminCount}</p>
          <span className="text-[10px] text-rose-600 font-bold mt-0.5 block">Master level access</span>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">Doc & Site Operations</span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1 font-mono">{docTeamCount}</p>
          <span className="text-[10px] text-purple-600 font-bold mt-0.5 block">Verification & installation team</span>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">Field Agents</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">{agentCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Consumer registration leads</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email address, or phone number..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700"
          >
            <option value="all">All System Roles</option>
            <option value="admin">Admin</option>
            <option value="doc_team">Document Team</option>
            <option value="site_manager">Site Manager</option>
            <option value="accounts">Accounts</option>
            <option value="agent">Field Agent</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl border border-rose-200 text-xs flex items-center justify-between font-semibold shadow-2xs">
          <span>{error}</span>
          <button onClick={fetchUsers} className="underline text-rose-900 font-bold ml-4">Retry</button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-[28px] shadow-sm border border-slate-200/80 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="h-12 w-12 rounded-[20px] bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No Users Found</h3>
            <p className="text-xs text-slate-500 mt-1">No user accounts match your search or filter criteria.</p>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.HeaderCell>User Details</Table.HeaderCell>
              <Table.HeaderCell>Phone Number</Table.HeaderCell>
              <Table.HeaderCell>Assigned Role</Table.HeaderCell>
              <Table.HeaderCell>Account Status</Table.HeaderCell>
              <Table.HeaderCell>Created Date</Table.HeaderCell>
              {isAdmin && <Table.HeaderCell>Actions</Table.HeaderCell>}
            </Table.Header>
            <Table.Body>
              {filteredUsers.map((u) => {
                const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.full_name || 'User Account';
                const roleBadgeClass = ROLE_COLOR_MAP[u.role] || 'bg-slate-100 text-slate-700 border-slate-200';
                const isSelf = String(u.id) === currentUserId;

                return (
                  <Table.Row key={u.id} className={isSelf ? 'bg-emerald-50/20' : ''}>
                    <Table.Cell>
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center font-mono shrink-0 shadow-2xs">
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-extrabold text-slate-900 text-xs">{fullName}</p>
                            {isSelf && (
                              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 font-mono">
                                (You - Active Session)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="font-mono font-bold text-slate-900 text-xs">{u.phone}</span>
                    </Table.Cell>

                    <Table.Cell>
                      <span className={`px-3 py-1 text-[10px] font-extrabold rounded-full border uppercase tracking-wider ${roleBadgeClass}`}>
                        {(u.role || 'agent').replace(/_/g, ' ')}
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                        u.is_active !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {u.is_active !== false ? 'Active' : 'Deactivated'}
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="text-xs text-slate-500 font-mono">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </Table.Cell>

                    {isAdmin && (
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full border border-slate-200/80 transition"
                          >
                            Edit
                          </button>

                          {isSelf ? (
                            <span
                              title="You cannot deactivate your own active session account"
                              className="px-3 py-1 bg-slate-100 text-slate-400 text-xs font-bold rounded-full border border-slate-200 cursor-not-allowed select-none"
                            >
                              Current Session
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleActiveStatus(u)}
                              className={`px-3 py-1 text-xs font-bold rounded-full transition border ${
                                u.is_active !== false
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {u.is_active !== false ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </Table.Cell>
                    )}
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* REGISTER NEW USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Register New System User</h3>
                <p className="text-xs text-slate-500 mt-0.5">Assign operator credentials and role hierarchy permissions</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            {modalError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-2xl border border-rose-200 text-xs font-bold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newUserForm.first_name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, first_name: e.target.value })}
                    placeholder="e.g. Chinu"
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={newUserForm.last_name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, last_name: e.target.value })}
                    placeholder="e.g. Mohapatra"
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="e.g. chinu@solarise.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Account Password *</label>
                  <div className="relative">
                    <input
                      type={showNewUserPassword ? 'text' : 'password'}
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="Set secure password"
                      required
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition focus:outline-none"
                      title={showNewUserPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewUserPassword ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 012.122-.063c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.276-4.276a3 3 0 10-4.243-4.243m4.243 4.243L3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ROLE ASSIGNMENT SELECTOR */}
              <div className="pt-2">
                <label className="block font-extrabold text-slate-700 mb-1">Assign User Role *</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {allowedRolesToAssign.map((r) => (
                    <option key={r} value={r}>
                      {r.toUpperCase().replace(/_/g, ' ')} — {ROLE_DESCRIPTIONS[r] || 'System Operator'}
                    </option>
                  ))}
                </select>
                <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600">
                  <span className="font-extrabold text-slate-900">Role Capability: </span>
                  {ROLE_DESCRIPTIONS[newUserForm.role]}
                </div>
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
                  {submitting ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit User Account</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">User Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold"
                >
                  {allowedRolesToAssign.map((r) => (
                    <option key={r} value={r}>
                      {r.toUpperCase().replace(/_/g, ' ')}
                    </option>
                  ))}
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
                  {updating ? 'Saving...' : 'Update Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
