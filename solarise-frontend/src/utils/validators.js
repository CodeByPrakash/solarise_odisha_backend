export const REGEX = {
  mobile: /^[6-9]\d{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  aadhaar: /^\d{12}$/,
};

export const validateMobile = (phone, fieldName = 'Mobile number') => {
  if (!phone || String(phone).trim() === '') {
    return `${fieldName} is required`;
  }
  const cleanPhone = String(phone).trim();
  if (!REGEX.mobile.test(cleanPhone)) {
    return `${fieldName} must be a valid 10-digit Indian number starting with 6-9 (e.g. 9876543210)`;
  }
  return null;
};

export const validateEmail = (email, fieldName = 'Email address') => {
  if (!email || String(email).trim() === '') {
    return `${fieldName} is required`;
  }
  const cleanEmail = String(email).trim().toLowerCase();
  if (!REGEX.email.test(cleanEmail)) {
    return `${fieldName} must be a valid email (e.g. user@example.com)`;
  }
  return null;
};

export const validatePAN = (pan) => {
  if (!pan || String(pan).trim() === '') return null;
  const cleanPAN = String(pan).trim().toUpperCase();
  if (!REGEX.pan.test(cleanPAN)) {
    return 'PAN Card must be 10 characters long (5 letters, 4 numbers, 1 letter e.g. ABCDE1234F)';
  }
  return null;
};

export const validateAadhaar = (aadhaar) => {
  if (!aadhaar || String(aadhaar).trim() === '') return null;
  const cleanAadhaar = String(aadhaar).trim();
  if (!REGEX.aadhaar.test(cleanAadhaar)) {
    return 'Aadhaar number must be exactly 12 numeric digits (e.g. 123456789012)';
  }
  return null;
};
