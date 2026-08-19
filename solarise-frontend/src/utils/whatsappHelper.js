/**
 * Helper utility for generating WhatsApp Web & Mobile deep links
 * with consumer-friendly descriptions for all 44 ADP Solarise project status types.
 */

// Formats phone number into standard international format (+91 for India)
export const formatWhatsAppPhone = (phone) => {
  if (!phone) return '';
  let cleanPhone = String(phone).replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  return cleanPhone;
};

// Generates a pre-filled wa.me link
export const generateWhatsAppLink = (phone, message) => {
  const formattedPhone = formatWhatsAppPhone(phone);
  if (!formattedPhone) return '#';
  const encodedMessage = encodeURIComponent(message.trim());
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

// Opens WhatsApp in a new browser tab or native WhatsApp app
export const openWhatsAppChat = (phone, message) => {
  const url = generateWhatsAppLink(phone, message);
  if (url !== '#') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Complete Mapping of all 44 Project Status Types from adp_solarise_system_table.sql
 * converted into simple, friendly English/Odia terms with helpful explanations for consumers.
 */
export const CONSUMER_FRIENDLY_STATUS = {
  new_registration: {
    label: 'New Project Registration 📝',
    detail: 'Your rooftop solar application has been registered with Solarise Odisha.',
    nextStep: 'Our team is preparing your document verification folder.',
  },
  doc_requested: {
    label: 'Document Submission Requested 📄',
    detail: 'Please provide your Aadhaar Card, Electricity Bill, & Land ROR (Patta) copy.',
    nextStep: 'Upload files via agent or share photos with our desk team.',
  },
  doc_uploaded: {
    label: 'Documents Under Verification 🔍',
    detail: 'Your submitted identity & property documents have been uploaded.',
    nextStep: 'Our compliance team is verifying your details for DISCOM submission.',
  },
  doc_verified: {
    label: 'Documents Verified & Cleared ✓',
    detail: 'All your property and identity documents are 100% verified!',
    nextStep: 'Submitting feasibility application to DISCOM power portal.',
  },
  action_required: {
    label: 'Action Required On Profile ⚠️',
    detail: 'A minor document update or name match requires your verification.',
    nextStep: 'Please get in touch with your Solarise account executive.',
  },
  action_required_bank: {
    label: 'Bank Loan Action Required 🏦',
    detail: 'Your bank loan application requires an additional document or signature.',
    nextStep: 'Please contact our loan department for quick resolution.',
  },
  work_in_progress: {
    label: 'Project Processing Active ⚡',
    detail: 'Your solar rooftop installation process is actively progressing.',
    nextStep: 'DISCOM & vendor workflow steps are currently underway.',
  },
  processing_fee_paid: {
    label: 'DISCOM Fee Confirmed 💳',
    detail: 'Your official DISCOM solar registration processing fee has been paid.',
    nextStep: 'Awaiting DISCOM registration number generation.',
  },
  registration_no_generated: {
    label: 'DISCOM Registration Approved 📜',
    detail: 'Your official DISCOM Solar Registration Number has been issued!',
    nextStep: 'Feasibility survey and technical line-up in progress.',
  },
  master_data_pending: {
    label: 'State Solar Portal Entry Pending ⏳',
    detail: 'Your consumer profile is being configured in the state portal.',
    nextStep: 'Data synchronization with DISCOM servers in progress.',
  },
  name_corrected: {
    label: 'Bill Name Updated ✓',
    detail: 'Electricity bill name match correction has been completed.',
    nextStep: 'Proceeding with DISCOM feasibility approval.',
  },
  ownership_changed: {
    label: 'Rooftop Ownership Verified 🏠',
    detail: 'Rooftop property ownership transfer records verified.',
    nextStep: 'Proceeding with rooftop solar installation line-up.',
  },
  type_converted: {
    label: 'Tariff Type Converted ⚡',
    detail: 'Electricity connection tariff conversion updated.',
    nextStep: 'Proceeding with grid interconnection workflow.',
  },
  pending_with_discom: {
    label: 'Awaiting DISCOM Feasibility NOC 🏛️',
    detail: 'Your application is under technical feasibility review with DISCOM grid engineers.',
    nextStep: 'NOC approval expected shortly.',
  },
  security_deposit_pending: {
    label: 'DISCOM Connection Deposit Pending 💵',
    detail: 'DISCOM solar grid connection deposit is under process.',
    nextStep: 'Deposit receipt will be generated upon confirmation.',
  },
  security_deposit_paid: {
    label: 'DISCOM Deposit Paid & Cleared 💳',
    detail: 'DISCOM solar grid security deposit has been confirmed!',
    nextStep: 'Power Supply Agreement (PSA) generation in progress.',
  },
  psa_agreement_done: {
    label: 'Solar Agreement Executed 🤝',
    detail: 'Power Supply Agreement (PSA) has been signed and completed.',
    nextStep: 'PM Surya Ghar portal clearance and material dispatch.',
  },
  pmsgy_done: {
    label: 'PM Surya Ghar Subsidy Registration Completed ☀️',
    detail: 'Your profile is registered on the PM Surya Ghar Muft Bijli Yojana portal!',
    nextStep: 'Solar panels and mounting structure material dispatch.',
  },
  loan_applied: {
    label: 'Bank Solar Loan Submitted 🏦',
    detail: 'Your solar rooftop bank loan application has been submitted to the bank.',
    nextStep: 'Awaiting bank sanction letter.',
  },
  loan_approved: {
    label: 'Bank Solar Loan Approved 🎉',
    detail: 'Congratulations! Your rooftop solar bank loan has been approved by the bank!',
    nextStep: 'Material dispatch to your installation location.',
  },
  loan_rejected: {
    label: 'Bank Loan Under Further Review 📑',
    detail: 'Bank loan requires co-applicant or alternate income proof.',
    nextStep: 'Our finance team will assist you with re-submission.',
  },
  line_up_given: {
    label: 'Rooftop Line-Up Cleared 📐',
    detail: 'Technical site layout and rooftop structure line-up cleared by engineers.',
    nextStep: 'Unloading solar materials at your property.',
  },
  materials_delivered: {
    label: 'Solar Panels & Equipment Delivered 📦',
    detail: 'Solar panels, structure, inverter, & wiring materials have arrived at your site!',
    nextStep: 'Installation team will arrive to begin rooftop mounting.',
  },
  installation_in_progress: {
    label: 'Rooftop Solar Installation In Progress 🛠️',
    detail: 'Our engineering team is actively mounting panels & wiring your rooftop solar plant.',
    nextStep: 'Civil concreting, earthing pits, and inverter setup.',
  },
  installation_done: {
    label: 'Rooftop Solar Plant Installed ⚡',
    detail: 'Physical installation of your rooftop solar plant is 100% complete!',
    nextStep: 'Uploading completion photos for DISCOM Net Metering inspection.',
  },
  installation_uploaded_pmsgy: {
    label: 'Plant Completion Verified On PM Surya Ghar Portal 📸',
    detail: 'Geotagged photos of your installed solar plant uploaded to PM Surya Ghar portal.',
    nextStep: 'Applying for Net Metering grid connection.',
  },
  net_metering_applied: {
    label: 'Net Metering Grid Request Applied 📟',
    detail: 'Application for bi-directional Net Metering submitted to DISCOM office.',
    nextStep: 'Meter testing and DISCOM agreement execution.',
  },
  net_metering_rts_pending: {
    label: 'DISCOM Net Meter Testing In Progress ⚙️',
    detail: 'Rooftop Solar (RTS) Net Meter is under lab testing at DISCOM testing station.',
    nextStep: 'Scheduling DISCOM field installation team.',
  },
  net_metering_payment_pending: {
    label: 'Net Metering Fee Confirmed 💳',
    detail: 'Net meter testing & installation charges processing.',
    nextStep: 'Interconnection agreement signing.',
  },
  net_metering_agreement_done: {
    label: 'Net Metering Agreement Signed 📜',
    detail: 'Bi-directional Net Metering interconnection agreement signed with DISCOM!',
    nextStep: 'Final joint inspection & meter mounting.',
  },
  inspection_report_submitted: {
    label: 'Joint Inspection Report Submitted 📋',
    detail: 'Technical Joint Inspection Report (JIR) submitted to DISCOM Inspector.',
    nextStep: 'Service release order issuance.',
  },
  site_activity: {
    label: 'DISCOM Site Inspection Scheduled 🚗',
    detail: 'DISCOM engineers scheduled for final on-site meter verification.',
    nextStep: 'Mounting solar bi-directional net meter.',
  },
  approval_desk: {
    label: 'Final DISCOM Approval Desk Clearance 🏛️',
    detail: 'Your project is at the final DISCOM approval desk.',
    nextStep: 'Issuing service release order for grid turn-on.',
  },
  service_release: {
    label: 'Grid Service Release Order Issued ⚡',
    detail: 'DISCOM service release order issued for grid connection.',
    nextStep: 'Net meter installation at consumer main board.',
  },
  service_released: {
    label: 'Grid Service Released ✓',
    detail: 'DISCOM power utility has released grid synchronization order.',
    nextStep: 'Installing bi-directional net meter.',
  },
  meter_installed: {
    label: 'Bi-Directional Net Meter Installed 📟⚡',
    detail: 'DISCOM Net Meter installed! Your system can now measure solar export & import.',
    nextStep: 'Commissioning solar plant for power generation.',
  },
  project_commissioned: {
    label: 'Solar Rooftop Plant Fully Commissioned 🌟🎉',
    detail: 'Congratulations! Your rooftop solar plant is LIVE, active, & generating free solar power!',
    nextStep: 'Enjoy zero electricity bills & clean green energy!',
  },
  subsidy_redeemed: {
    label: 'Government Subsidy Claimed 💰',
    detail: 'Government solar subsidy voucher & claim submitted to Central PM Surya Ghar portal.',
    nextStep: 'Awaiting Direct Benefit Transfer (DBT) credit into your bank account.',
  },
  subsidy_return: {
    label: 'Subsidy Claim Verification 🔍',
    detail: 'Subsidy bank account details undergoing final government audit.',
    nextStep: 'DBT bank credit processing.',
  },
  subsidy_pending: {
    label: 'Subsidy Bank Credit Queued 🏦',
    detail: 'Your government subsidy amount is queued for direct bank transfer (DBT).',
    nextStep: 'Direct credit to your bank account within days.',
  },
  subsidy_disbursed_cfa: {
    label: 'Central Govt Subsidy Credited (CFA) 💰🎉',
    detail: 'Central Government Direct Benefit Subsidy credited directly into your bank account!',
    nextStep: 'Check your bank statement for credited subsidy amount.',
  },
  subsidy_disbursed_sfa: {
    label: 'State Govt Subsidy Credited (SFA) 💰🎉',
    detail: 'State Government Direct Benefit Subsidy credited directly into your bank account!',
    nextStep: 'Check your bank statement for credited subsidy amount.',
  },
  project_handover_pending: {
    label: 'Handover & Warranty Folder Preparing 📁',
    detail: 'Preparing your 25-year panel warranty cards & plant maintenance guide.',
    nextStep: 'Official project handover ceremony.',
  },
  project_handed_over: {
    label: 'Official Project Handover Completed 📜🌟',
    detail: 'Project handover complete! Warranty card, inverter manual, & solar plant guide delivered.',
    nextStep: 'Welcome to the Solarise Odisha family!',
  },
};

/**
 * Formats a project status key into a consumer-friendly WhatsApp message string.
 */
export const buildConsumerStatusWhatsAppMessage = ({ consumerName, projectCode, statusKey, capacityKw }) => {
  const info = CONSUMER_FRIENDLY_STATUS[statusKey] || {
    label: (statusKey || 'In Progress').replace(/_/g, ' ').toUpperCase(),
    detail: 'Your rooftop solar project installation is progressing.',
    nextStep: 'Our team will update you on the next milestone.',
  };

  const nameStr = consumerName ? `*${consumerName.trim()}*` : 'Valued Consumer';
  const projStr = projectCode ? `*${projectCode}*` : 'Solar Application';
  const kwStr = capacityKw ? `${capacityKw} kW` : 'Rooftop';

  return `Hello ${nameStr} 👋,

Here is an update on your *Solarise Odisha* rooftop solar project (${projStr}):

📍 *Current Status:* ${info.label}
⚡ *System Capacity:* ${kwStr}

📝 *Details:* ${info.detail}

🚀 *Next Step:* ${info.nextStep}

Thank you for choosing solar energy! Reply to this message anytime for assistance.`;
};

// Progress Update Message Templates
export const WHATSAPP_TEMPLATES = {
  PROJECT_STATUS_UPDATE: ({ consumerName, projectCode, statusName, capacityKw }) =>
    buildConsumerStatusWhatsAppMessage({
      consumerName,
      projectCode,
      statusKey: statusName,
      capacityKw,
    }),

  MATERIAL_DELIVERED: ({ consumerName, projectCode, itemsCount }) =>
    `Hello *${consumerName || 'Valued Consumer'}* 👋,\n\nGreat news! Solar panels, structure, & electrical materials for project *${projectCode || 'PROJ'}* have arrived at your site!\n\n📦 *Batches Delivered:* ${itemsCount || 1} batch\n\nOur technical team will arrive shortly to begin rooftop mounting.`,

  ACTION_REQUIRED: ({ consumerName, projectCode, actionTitle, description }) =>
    `Hello *${consumerName || 'Valued Consumer'}* ⚠️,\n\nAction required for your solar project *${projectCode || 'PROJ'}*:\n\n📌 *Issue:* ${actionTitle || 'Document Verification'}\n📝 *Details:* ${description || 'Please contact our team for document verification.'}\n\nPlease get in touch with your site manager as soon as possible.`,

  NET_METERING_COMPLETE: ({ consumerName, projectCode }) =>
    `Congratulations *${consumerName || 'Valued Consumer'}* 🎉⚡!\n\nYour Net Metering DISCOM connection for project *${projectCode || 'PROJ'}* has been successfully commissioned! Your rooftop solar plant is now LIVE and generating green solar electricity!`,
};
