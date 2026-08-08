import React from 'react';

// Status Tag Color Mapping
const COLOR_MAP = {
  // Emerald / Green - Verified, Approved, Completed, Cleared, Resolved
  doc_verified: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  loan_approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  name_corrected: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  ownership_changed: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  type_converted: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  security_deposit_paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  installation_done: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  net_metering_agreement_done: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  meter_installed: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  project_commissioned: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  subsidy_disbursed_cfa: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  subsidy_disbursed_sfa: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  project_handed_over: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',

  // Blue / Cyan / Indigo - In Progress, Active Steps, Processing
  work_in_progress: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  processing_fee_paid: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  registration_no_generated: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  materials_delivered: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  installation_in_progress: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  net_metering_applied: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  pmsgy_done: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  site_activity: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  service_released: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  in_review: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  doc_uploaded: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',

  // Amber / Yellow - Pending, Action Required, Requests
  new_registration: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  doc_requested: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  action_required: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  action_required_bank: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  master_data_pending: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  pending_with_discom: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  security_deposit_pending: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  loan_applied: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  line_up_given: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  net_metering_rts_pending: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  net_metering_payment_pending: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  inspection_report_submitted: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  approval_desk: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  subsidy_pending: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  project_handover_pending: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  open: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  pending: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',

  // Purple / Violet - Agreements, Handover & Official Signings
  psa_agreement_done: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  subsidy_redeemed: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  service_release: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  installation_uploaded_pmsgy: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',

  // Rose / Red - Rejected, Cancelled, Return
  loan_rejected: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  subsidy_return: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  failed: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
};

export const StatusTag = ({ status, onClick, showHashtag = true, size = 'md' }) => {
  if (!status) return null;
  const rawStatus = status.startsWith('#') ? status.slice(1) : status;
  const formattedText = rawStatus.replace(/_/g, ' ');
  const colorClass = COLOR_MAP[rawStatus] || 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px]'
    : size === 'lg'
    ? 'px-3 py-1.5 text-xs'
    : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      onClick={() => onClick && onClick(rawStatus)}
      className={`inline-flex items-center space-x-1 font-semibold rounded-full border transition cursor-pointer font-mono ${sizeClasses} ${colorClass}`}
    >
      {showHashtag && <span className="opacity-60 font-bold">#</span>}
      <span className="capitalize">{formattedText}</span>
    </span>
  );
};

export default StatusTag;
