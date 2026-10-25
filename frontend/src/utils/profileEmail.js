export const isValidPersonalEmail = value => value === undefined || value === null ||
  (typeof value === 'string' && (!value.trim() ||
    (value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))))

// Optional phone: empty is allowed; otherwise digits with spaces/dashes/parentheses/leading +, 9-15 digits.
export const isValidTelephone = value => value === undefined || value === null ||
  (typeof value === 'string' && (!value.trim() ||
    (/^\+?[\d\s()-]+$/.test(value.trim()) && /^\d{9,15}$/.test(value.replace(/\D/g, '')))))
