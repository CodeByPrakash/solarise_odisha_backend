export const REGEX = {
  // Indian 10-digit mobile number starting with 6, 7, 8, or 9
  mobile: /^[6-9]\d{9}$/,
  // Standard email address pattern
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Indian Permanent Account Number (PAN): 5 letters, 4 digits, 1 letter
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  // Indian Aadhaar Card: Exactly 12 numeric digits
  aadhaar: /^\d{12}$/,
};

export const validateMobile = (phone, fieldName = "Mobile number") => {
  if (!phone || String(phone).trim() === "") {
    return { valid: false, error: `${fieldName} is required.` };
  }
  const cleanPhone = String(phone).trim();
  if (!REGEX.mobile.test(cleanPhone)) {
    return { valid: false, error: `${fieldName} must be a valid 10-digit Indian mobile number starting with 6-9 (e.g. 9876543210).` };
  }
  return { valid: true };
};

export const validateEmail = (email, fieldName = "Email address") => {
  if (!email || String(email).trim() === "") {
    return { valid: false, error: `${fieldName} is required.` };
  }
  const cleanEmail = String(email).trim().toLowerCase();
  if (!REGEX.email.test(cleanEmail)) {
    return { valid: false, error: `${fieldName} must be a valid email format (e.g. user@domain.com).` };
  }
  return { valid: true };
};

export const validatePAN = (pan) => {
  if (!pan || String(pan).trim() === "") return { valid: true };
  const cleanPAN = String(pan).trim().toUpperCase();
  if (!REGEX.pan.test(cleanPAN)) {
    return { valid: false, error: "PAN Card number must be 10 characters long in valid format (e.g. ABCDE1234F)." };
  }
  return { valid: true };
};

export const validateAadhaar = (aadhaar) => {
  if (!aadhaar || String(aadhaar).trim() === "") return { valid: true };
  const cleanAadhaar = String(aadhaar).trim();
  if (!REGEX.aadhaar.test(cleanAadhaar)) {
    return { valid: false, error: "Aadhaar number must be exactly 12 numeric digits (e.g. 123456789012)." };
  }
  return { valid: true };
};
