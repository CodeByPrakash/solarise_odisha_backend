export const ALL_DOCUMENT_TYPES = [
  { value: 'electric_bill', label: 'DISCOM Electricity Bill' },
  { value: 'aadhaar_card', label: 'Aadhaar Card' },
  { value: 'pan_card', label: 'PAN Card' },
  { value: 'bank_passbook', label: 'Bank Passbook / Cancelled Cheque' },
  { value: 'roof_geotagged_photo', label: 'Roof Geotagged Photo' },
  { value: 'land_ror', label: 'Land ROR (Patta / Record of Rights)' },
  { value: 'sale_deed', label: 'Land Sale Deed' },
  { value: 'malgujani', label: 'Malgujani Land Receipt' },
  { value: 'bank_statement_6m', label: 'Bank Statement (6 Months)' },
  { value: 'salary_slip', label: 'Salary Slip / Income Proof' },
  { value: 'it_return', label: 'IT Return Document' },
  { value: 'beneficiary_aadhaar', label: 'Legal Beneficiary Aadhaar Card' },
  { value: 'noc', label: 'DISCOM Feasibility NOC' },
  { value: 'form_1', label: 'Form-1 Application Copy' },
  { value: 'self_undertaking', label: 'Self Undertaking Affidavit' },
  { value: 'death_certificate', label: 'Death Certificate (Legal Heir)' },
  { value: 'legal_heir_certificate', label: 'Legal Heir Certificate' },
  { value: 'material_sealing_video', label: 'Material Sealing Video' },
  { value: 'customer_consent_video', label: 'Customer Consent Video' },
  { value: 'plant_geotagged_photo', label: 'Plant Geotagged Photo' },
  { value: 'inverter_serial_photo', label: 'Inverter Serial Number Photo' },
  { value: 'inverter_setup_photo', label: 'Inverter Setup Photo' },
  { value: 'earthing_photo', label: 'Earthing System Photo' },
  { value: 'la_photo', label: 'Lightning Arrester (LA) Photo' },
  { value: 'inspection_report', label: 'Joint Inspection Report' },
  { value: 'psa_agreement', label: 'PSA Agreement' },
  { value: 'net_metering_agreement', label: 'Net Metering Agreement' },
  { value: 'other', label: 'Other Verification Document' },
];

export const DOC_TYPE_LABELS = ALL_DOCUMENT_TYPES.reduce((acc, dt) => {
  acc[dt.value] = dt.label;
  return acc;
}, {
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  ror: 'Land ROR (Patta)',
  geotag_photo: 'Roof Geotagged Photo',
  discom_noc: 'DISCOM Feasibility NOC',
  installation_photo: 'Plant Geotagged Photo',
});
