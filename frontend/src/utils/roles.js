const SYSTEM_ROLE_LABELS = {
  admin: { en: 'Admin', th: 'ผู้ดูแลระบบ' },
  artist: { en: 'Artist', th: 'ศิลปิน' },
  customer: { en: 'Customer', th: 'ลูกค้า' }
};

export const resolveLocalizedTitle = (item, locale = 'th') => {
  if (!item) return '';
  if (typeof item === 'string') return item.trim();

  const list = Array.isArray(item)
    ? item
    : Array.isArray(item.title)
      ? item.title
      : Array.isArray(item.name)
        ? item.name
        : null;

  if (list) {
    const pick = (key) => {
      const found = list.find(entry => entry && entry.key === key && String(entry.value || '').trim());
      return found ? String(found.value).trim() : '';
    };
    const exact = pick(locale);
    if (exact) return exact;
    const alt = pick(locale === 'en' ? 'th' : 'en');
    if (alt) return alt;
    const first = list.find(entry => entry && String(entry.value || '').trim());
    return first ? String(first.value).trim() : '';
  }

  if (locale === 'en') {
    return String(item.nameEn || item.name || item.title || '').trim();
  }
  return String(item.name || item.nameEn || item.title || '').trim();
};

export const findRoleRecord = (role, availableRoles = []) => {
  if (!role) return null;
  const list = Array.isArray(availableRoles) ? availableRoles : [];
  if (typeof role === 'object') {
    if (Array.isArray(role.title) || role.nameEn || role.name || role.code) return role;
    if (role._id) {
      return list.find(r => r && String(r._id) === String(role._id)) || role;
    }
    return role;
  }
  const needle = String(role).trim().toLowerCase();
  return list.find((r) => {
    if (!r) return false;
    if (String(r._id) === String(role)) return true;
    if (r.code && String(r.code).trim().toLowerCase() === needle) return true;
    if (r.nameEn && String(r.nameEn).trim().toLowerCase() === needle) return true;
    if (r.name && String(r.name).trim().toLowerCase() === needle) return true;
    if (Array.isArray(r.title)) {
      return r.title.some(t => t && String(t.value || '').trim().toLowerCase() === needle);
    }
    return false;
  }) || null;
};

export const getRoleEnName = (role, availableRoles = []) => {
  const record = findRoleRecord(role, availableRoles);
  if (!record) {
    if (!role || typeof role !== 'string') return 'Customer';
    const r = role.trim().toLowerCase();
    if (r === 'admin' || r === 'administrator' || r === 'ผู้ดูแลระบบ') return 'Admin';
    if (r === 'artist' || r === 'student' || r === 'ศิลปิน' || r === 'นักศึกษา') return 'Artist';
    if (r === 'customer' || r === 'user' || r === 'ลูกค้า') return 'Customer';
    return role.trim();
  }
  const code = String(record.code || '').trim().toUpperCase();
  if (code === 'ADMIN') return 'Admin';
  if (code === 'ARTIST') return 'Artist';
  if (code === 'CUSTOMER' || code === 'USER') return 'Customer';

  const enTitle = resolveLocalizedTitle(record, 'en');
  if (enTitle) {
    const low = enTitle.toLowerCase();
    if (low === 'user') return 'Customer';
    return enTitle;
  }
  return 'Customer';
};

export const getSystemRoleKey = (role, availableRoles = []) => {
  if (!role) return 'customer';
  const record = findRoleRecord(role, availableRoles);
  if (record && record.code) {
    const c = String(record.code).trim().toUpperCase();
    if (c === 'ADMIN') return 'admin';
    if (c === 'ARTIST') return 'artist';
    if (c === 'CUSTOMER' || c === 'USER') return 'customer';
  }
  const enLower = getRoleEnName(record || role, availableRoles).trim().toLowerCase();
  const thVal = resolveLocalizedTitle(record || role, 'th').trim();
  if (enLower === 'admin' || enLower === 'administrator' || thVal === 'ผู้ดูแลระบบ') return 'admin';
  if (enLower === 'artist' || thVal === 'ศิลปิน' || thVal === 'นักศึกษา') return 'artist';
  if (enLower === 'customer' || enLower === 'user' || thVal === 'ลูกค้า') return 'customer';
  return (record || (typeof role === 'string' && role.trim())) ? 'custom' : 'customer';
};

export const getRoleDisplayLabel = (role, locale = 'th', availableRoles = []) => {
  const lang = locale === 'en' ? 'en' : 'th';
  const sysKey = getSystemRoleKey(role, availableRoles);
  const record = findRoleRecord(role, availableRoles);
  const resolved = resolveLocalizedTitle(record || (typeof role === 'string' ? role : null), lang);

  if (sysKey !== 'custom') {
    const defaults = SYSTEM_ROLE_LABELS[sysKey];
    if (!resolved) return defaults[lang];
    const resLower = resolved.toLowerCase();
    if (lang === 'th' && ['admin', 'administrator', 'artist', 'customer', 'user'].includes(resLower)) {
      return defaults.th;
    }
    if (lang === 'en' && ['ผู้ดูแลระบบ', 'ศิลปิน', 'ลูกค้า'].includes(resolved)) {
      return defaults.en;
    }
    return resolved;
  }

  return resolved || getRoleEnName(role, availableRoles) || (lang === 'en' ? 'Custom Role' : 'บทบาทกำหนดเอง');
};

export const getRoleBadgeMeta = (role, locale = 'th', availableRoles = []) => {
  const key = getSystemRoleKey(role, availableRoles);
  const label = getRoleDisplayLabel(role, locale, availableRoles);
  const en = getRoleEnName(role, availableRoles);

  if (key === 'admin') {
    return { key, en, label, class: 'status-admin', icon: 'cilShieldAlt' };
  }
  if (key === 'artist') {
    return { key, en, label, class: 'status-artist', icon: 'cil-brush' };
  }
  if (key === 'customer') {
    return { key, en, label, class: 'status-customer', icon: 'cil-user' };
  }

  const combined = `${en} ${label}`.toLowerCase();
  if (/review|ตรวจ|ประเมิน|อาจารย์|evaluator/.test(combined)) {
    return { key, en, label, class: 'status-reviewer', icon: 'cil-check-circle' };
  }
  if (/curator|ภัณฑารักษ์|นิทรรศการ|exhibit/.test(combined)) {
    return { key, en, label, class: 'status-curator', icon: 'cil-star' };
  }
  return { key, en, label, class: 'status-custom-role', icon: 'cil-badge' };
};

export const isLearnerStatusObject = (status) => {
  if (!status) return false;
  if (typeof status === 'string') {
    const low = status.trim().toLowerCase();
    return ['newstudent', 'new student', 'oldstudent', 'old student', 'new_student', 'old_student', 'ผู้เรียนใหม่', 'ผู้เรียนเก่า'].includes(low);
  }
  const code = String(status.code || '').trim().toUpperCase();
  if (code === 'NEW_STUDENT' || code === 'OLD_STUDENT') return true;
  const titles = Array.isArray(status.title)
    ? status.title.map(t => String((t && t.value) || '').trim().toLowerCase())
    : [resolveLocalizedTitle(status, 'en').toLowerCase(), resolveLocalizedTitle(status, 'th').toLowerCase()];
  return titles.some(val => ['newstudent', 'new student', 'oldstudent', 'old student', 'ผู้เรียนใหม่', 'ผู้เรียนเก่า'].includes(val));
};

export const resolveUserStatusMeta = (user, locale = 'th', availableRoles = []) => {
  const lang = locale === 'en' ? 'en' : 'th';
  const sysKey = getSystemRoleKey(user && user.role, availableRoles);
  const rawStatus = user && user.status;
  const activeFallback = {
    key: 'Active',
    code: 'ACTIVE',
    label: lang === 'en' ? 'Active' : 'ใช้งานอยู่',
    isLearner: false
  };

  if (!rawStatus) return activeFallback;
  if (sysKey !== 'artist' && isLearnerStatusObject(rawStatus)) {
    return activeFallback;
  }

  const key = resolveLocalizedTitle(rawStatus, 'en') || (typeof rawStatus === 'string' ? rawStatus : 'Active');
  const label = resolveLocalizedTitle(rawStatus, lang) || key;
  const code = typeof rawStatus === 'object' && rawStatus.code ? String(rawStatus.code).trim() : '';
  return {
    key,
    code,
    label,
    isLearner: sysKey === 'artist'
  };
};

/**
 * Keep one option per logical role name while preserving the first configured
 * role ID. The database may contain legacy duplicate Role documents; those
 * IDs remain valid for existing users, but should not appear repeatedly in a
 * selection menu.
 */
export const dedupeRoles = (roles) => {
  const seen = new Set();
  return (Array.isArray(roles) ? roles : []).filter((role) => {
    if (!role) return false;
    const key = String(role.nameEn || role.name || role._id || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const dedupeStatuses = (statuses) => {
  const seen = new Set();
  return (Array.isArray(statuses) ? statuses : []).filter((status) => {
    if (!status) return false;
    const key = String(status.nameEn || status.name || status._id || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export default dedupeRoles;
