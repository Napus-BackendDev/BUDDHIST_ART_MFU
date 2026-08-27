export const OFFICIAL_EMAIL_DOMAIN = 'lamduan.mfu.ac.th';

export const normalizeStudentId = (value) => String(value == null ? '' : value).trim();

export const normalizeEmail = (value) => {
  const email = String(value == null ? '' : value).trim();
  return email === '-' ? '' : email;
};

export const isArtistRole = (roleName) => String(roleName || '').trim().toLowerCase() === 'artist';

export const buildOfficialEmail = (studentId) => {
  const normalizedId = normalizeStudentId(studentId);
  if (!normalizedId || !/^[A-Za-z0-9._-]+$/.test(normalizedId)) return '';
  return `${normalizedId}@${OFFICIAL_EMAIL_DOMAIN}`.toLowerCase();
};

export const normalizeArtistContact = (studentId, incomingContact = {}, existingContact = {}) => {
  const incoming = incomingContact || {};
  const existing = existingContact || {};
  const officialEmail = buildOfficialEmail(studentId);
  if (!officialEmail) return { ...existing, ...incoming };

  const incomingOfficial = normalizeEmail(incoming.studentEmail);
  const existingOfficial = normalizeEmail(existing.studentEmail);
  const incomingPersonal = normalizeEmail(incoming.personalEmail);
  const existingPersonal = normalizeEmail(existing.personalEmail);
  const legacyOfficial = [incomingOfficial, existingOfficial]
    .find(email => email && !email.toLowerCase().endsWith(`@${OFFICIAL_EMAIL_DOMAIN}`));

  return {
    ...existing,
    ...incoming,
    studentEmail: officialEmail,
    personalEmail: incomingPersonal || existingPersonal || legacyOfficial || ''
  };
};
