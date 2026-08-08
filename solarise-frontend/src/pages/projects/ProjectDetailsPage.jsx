import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleGuard } from '../../components/auth/RoleGuard';
import {
  projectService,
  installationService,
  actionService,
  paymentService,
  userService,
} from '../../services/api';
import api from '../../services/api';

// Helper status color badge mapping for all 44+ project status tags
export const getStatusTagBadge = (status) => {
  const s = status || 'new_registration';
  if (['project_commissioned', 'project_handed_over', 'subsidy_disbursed_cfa', 'subsidy_disbursed_sfa'].includes(s)) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }
  if (['action_required', 'action_required_bank', 'loan_rejected'].includes(s)) {
    return 'bg-rose-100 text-rose-800 border-rose-300';
  }
  if (['installation_in_progress', 'work_in_progress', 'materials_delivered'].includes(s)) {
    return 'bg-blue-100 text-blue-800 border-blue-300';
  }
  if (['loan_applied', 'loan_approved', 'psa_agreement_done', 'net_metering_applied'].includes(s)) {
    return 'bg-purple-100 text-purple-800 border-purple-300';
  }
  return 'bg-amber-100 text-amber-800 border-amber-300';
};

const ALL_PROJECT_STATUSES = [
  'new_registration',
  'doc_requested',
  'doc_uploaded',
  'doc_verified',
  'action_required',
  'action_required_bank',
  'work_in_progress',
  'processing_fee_paid',
  'registration_no_generated',
  'master_data_pending',
  'name_corrected',
  'ownership_changed',
  'type_converted',
  'pending_with_discom',
  'security_deposit_pending',
  'security_deposit_paid',
  'psa_agreement_done',
  'pmsgy_done',
  'loan_applied',
  'loan_approved',
  'loan_rejected',
  'line_up_given',
  'materials_delivered',
  'installation_in_progress',
  'installation_done',
  'installation_uploaded_pmsgy',
  'net_metering_applied',
  'net_metering_rts_pending',
  'net_metering_payment_pending',
  'net_metering_agreement_done',
  'inspection_report_submitted',
  'site_activity',
  'approval_desk',
  'service_release',
  'service_released',
  'meter_installed',
  'project_commissioned',
  'subsidy_redeemed',
  'subsidy_return',
  'subsidy_pending',
  'subsidy_disbursed_cfa',
  'subsidy_disbursed_sfa',
  'project_handover_pending',
  'project_handed_over',
];

const DEFAULT_INSTALLATION_ITEMS = [
  { item: 'structure', name: 'Structure Mounting', weight_pct: 15 },
  { item: 'panel', name: 'Solar Panels', weight_pct: 20 },
  { item: 'inverter_looping', name: 'Inverter Looping', weight_pct: 10 },
  { item: 'ac_wiring', name: 'AC Wiring', weight_pct: 10 },
  { item: 'dc_wiring', name: 'DC Wiring', weight_pct: 10 },
  { item: 'lightning_arrester', name: 'Lightning Arrester', weight_pct: 5 },
  { item: 'earthing', name: 'Earthing System', weight_pct: 10 },
  { item: 'earthing_pit', name: 'Earthing Pit Chemical Fill', weight_pct: 5 },
  { item: 'concreting', name: 'Civil Concreting', weight_pct: 10 },
  { item: 'output_service', name: 'Output Service Connection', weight_pct: 5 },
];

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Status transition state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Material Delivery state
  const [materialDelivery, setMaterialDelivery] = useState(null);
  const [dcrNumber, setDcrNumber] = useState('');
  const [recordingDelivery, setRecordingDelivery] = useState(false);

  // Installation Progress state
  const [installationItems, setInstallationItems] = useState([]);
  const [updatingItem, setUpdatingItem] = useState(null);

  // Action Required state
  const [actions, setActions] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('electric_bill_name_correction');
  const [actionDetail, setActionDetail] = useState('');
  const [allRorMembersAlive, setAllRorMembersAlive] = useState(true);
  const [beneficiaryName, setBeneficiaryName] = useState('');

  // Status History
  const [statusHistory, setStatusHistory] = useState([]);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const projRes = await projectService.getById(id);
      const projData = projRes.data?.data || projRes.data;
      setProject(projData);
      setSelectedStatus(projData.current_status || 'new_registration');

      // Fetch material delivery
      try {
        const matRes = await api.get(`/material-deliveries/project/${id}`);
        setMaterialDelivery(matRes.data?.data || matRes.data);
      } catch (e) {
        setMaterialDelivery(null);
      }

      // Fetch installation progress
      try {
        let instRes;
        try {
          instRes = await installationService.getByProject(id);
        } catch (e) {
          if (e.response && (e.response.status === 404 || e.response.status === 400)) {
            // Auto initialize checklist for project if missing
            await installationService.initChecklist(id);
            instRes = await installationService.getByProject(id);
          } else {
            throw e;
          }
        }
        const fetchedItems = instRes.data?.data || instRes.data || [];
        const merged = DEFAULT_INSTALLATION_ITEMS.map((def) => {
          const match = fetchedItems.find((i) => i.item === def.item);
          return {
            ...def,
            id: match ? match.id : null,
            is_done: match ? match.is_done : false,
            done_at: match ? match.done_at : null,
          };
        });
        setInstallationItems(merged);
      } catch (e) {
        setInstallationItems(DEFAULT_INSTALLATION_ITEMS.map((i) => ({ ...i, is_done: false })));
      }

      // Fetch actions required
      try {
        const actRes = await actionService.getAll();
        const projActions = (actRes.data?.data || actRes.data || []).filter(a => String(a.project_id) === String(id));
        setActions(projActions);
      } catch (e) {
        setActions([]);
      }

      // Fetch status history
      try {
        const histRes = await api.get(`/status-history/project/${id}`);
        setStatusHistory(histRes.data?.data || histRes.data || []);
      } catch (e) {
        setStatusHistory([]);
      }
    } catch (err) {
      console.error('Error loading project details:', err);
      setError(err.response?.data?.error || 'Failed to load project details from backend');
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;
    try {
      setUpdatingStatus(true);
      await projectService.updateStatus(id, {
        to_status: selectedStatus,
        remarks: statusRemarks,
      });
      setStatusRemarks('');
      await fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update project status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Site Manager: Record Material Delivery
  const handleRecordMaterialDelivery = async (e) => {
    e.preventDefault();
    try {
      setRecordingDelivery(true);
      await api.post('/material-deliveries', {
        project_id: id,
        dcr_number: dcrNumber,
      });
      setDcrNumber('');
      await fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record material delivery');
    } finally {
      setRecordingDelivery(false);
    }
  };

  // Site Manager: Toggle Installation Item locally & instantly
  const handleToggleInstallationItem = (itemObj) => {
    setInstallationItems((prev) =>
      prev.map((i) => (i.item === itemObj.item ? { ...i, is_done: !i.is_done } : i))
    );
  };

  // Site Manager: Final Save Button for Installation Progress
  const [savingChecklist, setSavingChecklist] = useState(false);
  const handleSaveInstallationProgress = async () => {
    try {
      setSavingChecklist(true);
      await installationService.saveBatch(id, {
        items: installationItems,
        done_by: user?.id || 1,
      });
      await fetchProjectDetails();
      alert('✓ Installation progress saved successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save installation progress');
    } finally {
      setSavingChecklist(false);
    }
  };

  // Raise Action Required / Ownership Transfer
  const handleRaiseAction = async (e) => {
    e.preventDefault();
    try {
      const actRes = await actionService.create({
        project_id: id,
        action_type: actionType,
        detail: actionDetail,
      });

      const actionId = actRes.data?.data?.id || actRes.data?.id;

      if (actionType === 'ownership_transfer' && actionId) {
        await api.post('/ownership-transfers', {
          action_id: actionId,
          all_ror_members_alive: allRorMembersAlive,
          beneficiary_name: beneficiaryName,
          remarks: actionDetail,
        });
      }

      setShowActionModal(false);
      setActionDetail('');
      setBeneficiaryName('');
      await fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to raise action');
    }
  };

  // Calculate weighted installation completion %
  const totalCompletionPct = installationItems.reduce(
    (sum, i) => sum + (i.is_done ? i.weight_pct : 0),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-rose-50 text-rose-800 p-6 rounded-2xl border border-rose-200 text-center space-y-4">
        <p className="font-semibold">{error || 'Project not found'}</p>
        <button onClick={() => navigate('/projects')} className="px-4 py-2 bg-rose-600 text-white text-sm rounded-lg">
          ← Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Tag Badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              PROJ-{project.id}
            </span>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusTagBadge(project.current_status)} uppercase tracking-wider`}>
              {(project.current_status || 'new_registration').replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {project.registration_no || `Solar Installation #${project.id}`}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Consumer ID: <span className="font-mono font-semibold text-gray-700">{project.consumer_id}</span> | Capacity: <span className="font-semibold text-emerald-600">{project.capacity_kw} kW</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setShowActionModal(true)}
            className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-xl hover:bg-amber-100 transition"
          >
            + Raise Action Required
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            ← Back to List
          </button>
        </div>
      </div>

      {/* Grid: Status Transition & Material Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Pipeline Update Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Project Status Transition Desk</span>
          </h2>
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Select Next Project Status Tag (40+ Enum States)
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {ALL_PROJECT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Status Change Remarks
              </label>
              <textarea
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                rows={2}
                placeholder="Enter validation remarks or approval details..."
                className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={updatingStatus}
              className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {updatingStatus ? 'Updating Tag...' : 'Update Status Tag'}
            </button>
          </form>
        </div>

        {/* Site Manager: Material Delivery Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Material Delivery (Site Manager)</span>
          </h2>

          {materialDelivery ? (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-emerald-800">DCR Number:</span>
                <span className="font-mono text-emerald-900">{materialDelivery.dcr_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-emerald-800">Delivered At:</span>
                <span>{new Date(materialDelivery.delivered_at).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRecordMaterialDelivery} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  DCR Serial Number
                </label>
                <input
                  type="text"
                  value={dcrNumber}
                  onChange={(e) => setDcrNumber(e.target.value)}
                  placeholder="e.g. DCR-2026-88910"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={recordingDelivery}
                className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {recordingDelivery ? 'Recording...' : 'Record Material Delivery'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Site Manager: Installation Progress Weighted Checklist (100% Total) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Installation Weighted Checklist (Site Manager)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              10 Installation Items summing to 100% total completion weight
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex items-center space-x-4">
            <div className="text-right">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Progress</span>
              <span className="text-xl font-extrabold text-emerald-600 font-mono">{totalCompletionPct}%</span>
            </div>
            <button
              onClick={handleSaveInstallationProgress}
              disabled={savingChecklist}
              className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm flex items-center space-x-1.5"
            >
              <span>{savingChecklist ? 'Saving Progress...' : '💾 Save Installation Progress'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${totalCompletionPct}%` }}
          ></div>
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {installationItems.map((item) => (
            <div
              key={item.item}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                item.is_done ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={item.is_done}
                  onChange={() => handleToggleInstallationItem(item)}
                  className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <p className={`text-xs font-semibold ${item.is_done ? 'text-emerald-900 line-through' : 'text-gray-900'}`}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono">Weight: {item.weight_pct}%</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.is_done ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {item.is_done ? 'DONE' : 'PENDING'}
              </span>
            </div>
          ))}
        </div>

        {/* Card Footer Save Action */}
        <div className="pt-3 border-t flex justify-end">
          <button
            onClick={handleSaveInstallationProgress}
            disabled={savingChecklist}
            className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
          >
            {savingChecklist ? 'Saving Progress...' : '💾 Save Installation Progress'}
          </button>
        </div>
      </div>

      {/* Actions Required & Ownership Transfers */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.78-1.34-.25-2.864 1.018-3.836 1.306-1.016 2.888-.918 4.071-.345" />
          </svg>
          <span>Actions Required & Ownership Transfers ({actions.length})</span>
        </h2>

        {actions.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-2">No open actions required for this project.</p>
        ) : (
          <div className="space-y-3">
            {actions.map((act) => (
              <div key={act.id} className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-amber-900">
                  <span className="capitalize">{(act.action_type || '').replace(/_/g, ' ')}</span>
                  <span className="uppercase px-2 py-0.5 bg-amber-200 rounded-full text-[10px]">{act.status}</span>
                </div>
                <p className="text-amber-800">{act.detail || 'No details specified'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status History Timeline */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
          </svg>
          <span>Status History Timeline</span>
        </h2>

        {statusHistory.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-2">No status history recorded yet.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-emerald-200 space-y-6">
            {statusHistory.map((hist) => (
              <div key={hist.id} className="relative">
                <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-gray-900 uppercase">
                    {(hist.to_status || '').replace(/_/g, ' ')}
                  </span>
                  <p className="text-gray-500">{hist.remarks || 'Status transition logged'}</p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {new Date(hist.changed_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Raise Action Required */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Raise Action Required</h3>
            <form onSubmit={handleRaiseAction} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Action Type</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
                >
                  <option value="electric_bill_name_correction">Electric Bill Name Correction</option>
                  <option value="ownership_transfer">Ownership Transfer</option>
                  <option value="commercial_to_domestic">Commercial to Domestic Conversion</option>
                  <option value="bank_passbook_name_correction">Bank Passbook Name Correction</option>
                  <option value="bank_passbook_update">Bank Passbook Update</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Action Detail</label>
                <textarea
                  value={actionDetail}
                  onChange={(e) => setActionDetail(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                  placeholder="Explain why this action is required..."
                />
              </div>

              {actionType === 'ownership_transfer' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs">
                  <p className="font-bold text-amber-900">Ownership Transfer Details</p>
                  <div>
                    <label className="block font-semibold text-amber-800 mb-1">Beneficiary Name</label>
                    <input
                      type="text"
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      required
                      placeholder="Name of new legal beneficiary"
                      className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white"
                    />
                  </div>
                  <label className="flex items-center space-x-2 text-amber-900 font-medium">
                    <input
                      type="checkbox"
                      checked={allRorMembersAlive}
                      onChange={(e) => setAllRorMembersAlive(e.target.checked)}
                    />
                    <span>Are all ROR members alive?</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700"
                >
                  Submit Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
