export const isValidPersonalEmail = value => value === undefined || value === null ||
  (typeof value === 'string' && (!value.trim() ||
    (value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))))
