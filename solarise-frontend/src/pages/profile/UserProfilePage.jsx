import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService, areaBlockService } from '../../services/api';
import { Button } from '../../components/ui/Button';

const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    area_block_id: '',
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Area Blocks for display
  const [areaBlocks, setAreaBlocks] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || (user.full_name ? user.full_name.split(' ')[0] : ''),
        last_name: user.last_name || (user.full_name ? user.full_name.split(' ').slice(1).join(' ') : ''),
        email: user.email || '',
        phone: user.phone || user.phone_primary || '',
        role: user.role || 'agent',
        area_block_id: user.area_block_id || '',
      });
    }
    fetchAreaBlocks();
  }, [user]);

  const fetchAreaBlocks = async () => {
    try {
      const res = await areaBlockService.getAll();
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setAreaBlocks(data);
      }
    } catch (err) {
      console.warn('Could not load area blocks:', err);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordSuccess('');
    setPasswordError('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!user?.id) {
      setErrorMsg('User profile ID not found');
      return;
    }

    try {
      setLoading(true);
      await userService.update(user.id, {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
        phone: profileForm.phone,
      });
      setSuccessMsg('Profile details updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to update profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (passwordForm.new_password.length < 4) {
      setPasswordError('New password must be at least 4 characters long');
      return;
    }

    try {
      setPasswordLoading(true);
      await userService.update(user.id, {
        password: passwordForm.new_password,
      });
      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      console.error('Update password error:', err);
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const assignedBlock = areaBlocks.find((b) => String(b.id) === String(user?.area_block_id));

  const getRoleDescription = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Full System Administrator with complete read/write access across all DISCOM records, user creation, block governance, and payment ledgers.';
      case 'doc_team':
        return 'Document Clearance Specialist responsible for verifying consumer Aadhaar, DISCOM electric bills, bank NOCs, and PMSGY geotagged proofs.';
      case 'agent':
        return 'Field Registration Agent responsible for onboarding new consumer accounts, site survey logs, and submission of initial PM Surya Ghar applications.';
      case 'site_manager':
        return 'Technical Site Installation Supervisor overseeing rooftop solar panel mounting, DCR inverter wiring, and net-metering readiness.';
      default:
        return 'Authorized Operational Personnel on the Solarise Odisha Platform.';
    }
  };

  const roleColorBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'doc_team':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'agent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'site_manager':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* User Avatar Big */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[24px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-1 shadow-md shrink-0">
              <div className="h-full w-full bg-white rounded-[20px] flex items-center justify-center font-black text-2xl sm:text-3xl text-emerald-700 font-mono shadow-inner">
                {(user?.first_name || user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.full_name || user?.name || 'Authorized User'}
                </h1>
                <span className={`px-3 py-1 text-[10px] font-mono font-extrabold uppercase rounded-full border ${roleColorBadge(user?.role)}`}>
                  {user?.role || 'Operator'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {user?.email || 'No email associated'} • {user?.phone || 'No phone recorded'}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[11px] font-bold text-emerald-700">Account Active & Synchronized</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to log out of Solarise Odisha?')) {
                  logout();
                }
              }}
              className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-full border border-rose-200 transition shadow-2xs flex items-center space-x-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Profile & Security) + Right Column (Role & System Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Profile Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Personal & Contact Details</h3>
                <p className="text-xs text-slate-500">Update your official profile information</p>
              </div>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs font-bold">
                ✓ {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl border border-rose-200 text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    required
                    placeholder="e.g. Ramesh"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    required
                    placeholder="e.g. Nayak"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    placeholder="user@solarise.gov.in"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">System Role (Assigned)</label>
                  <input
                    type="text"
                    value={user?.role?.toUpperCase() || 'AGENT'}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-mono font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-xs font-bold rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="h-9 w-9 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Security & Password</h3>
                <p className="text-xs text-slate-500">Update your login authentication password</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs font-bold">
                ✓ {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl border border-rose-200 text-xs font-bold">
                ⚠️ {passwordError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      required
                      minLength={4}
                      placeholder="Minimum 4 characters"
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={4}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Show Password</span>
                </label>

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2.5 text-xs font-bold rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Role & System Account Overview */}
        <div className="space-y-6">
          
          {/* Role Governance Box */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center font-bold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Role & Governance</h3>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">Assigned Role</span>
              <p className="text-sm font-black text-slate-900 capitalize">{user?.role || 'Operator'}</p>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {getRoleDescription(user?.role)}
              </p>
            </div>
          </div>

          {/* Regional Area Block Info */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Operational Region</h3>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">Assigned Area Block</span>
              <p className="text-sm font-extrabold text-slate-900">
                {assignedBlock ? `${assignedBlock.name} (${assignedBlock.district})` : 'All Odisha Operations'}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Block ID: {user?.area_block_id ? `#BLOCK-${user.area_block_id}` : 'Global State Scope'}
              </p>
            </div>
          </div>

          {/* System Account Metadata */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">System Record Metadata</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">User Record ID</span>
                <span className="font-mono font-bold text-slate-900">#{user?.id || 'N/A'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Authentication</span>
                <span className="font-mono font-bold text-emerald-600">Bearer JWT SSO</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Platform</span>
                <span className="font-mono font-bold text-slate-700">Solarise Odisha v1.0</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;
