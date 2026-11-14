export const ADMIN_TABS = [
  {
    key: 'overview',
    route: '/admin',
    en: 'Overview',
    th: 'ภาพรวม',
    descEn: 'Executive summary & KPIs',
    descTh: 'หน้าภาพรวมและตัวชี้วัดหลัก',
  },
  {
    key: 'analytics',
    route: '/admin/analytics',
    en: 'Analytics',
    th: 'วิเคราะห์ข้อมูล',
    descEn: 'Sales & cohort statistics',
    descTh: 'สถิติยอดขายและแนวโน้มผลงาน',
  },
  {
    key: 'orders',
    route: '/admin/orders',
    en: 'Orders',
    th: 'คำสั่งซื้อ',
    descEn: 'Verify slips, approve orders & print certificates',
    descTh: 'ตรวจสอบสลิป อนุมัติคำสั่งซื้อ และออกเอกสาร',
  },
  {
    key: 'artworks',
    route: '/admin/artworks',
    en: 'Artworks',
    th: 'ผลงานศิลปะ',
    descEn: 'Manage exhibition catalog & post-term status',
    descTh: 'จัดการรายการผลงานศิลปะและสถานะหลังครบกำหนด',
  },
  {
    key: 'news',
    route: '/admin/news',
    en: 'News',
    th: 'ข่าวสาร',
    descEn: 'Publish announcements & events',
    descTh: 'จัดการข่าวสารและกิจกรรมประชาสัมพันธ์',
  },
  {
    key: 'submissions',
    route: '/admin/submissions',
    en: 'Submissions',
    th: 'ผลงานที่ส่ง',
    descEn: 'Inspect submitted works, approve/reject or import Excel',
    descTh: 'ตรวจผลงานที่นักศึกษาส่ง อนุมัติ/ปฏิเสธ หรือนำเข้า Excel',
  },
  {
    key: 'users',
    route: '/admin/users-management',
    en: 'User Management',
    th: 'จัดการผู้ใช้งาน',
    descEn: 'Create, edit, import accounts & assign roles',
    descTh: 'เพิ่ม แก้ไข นำเข้าบัญชีผู้ใช้ และกำหนดบทบาท',
  },
  {
    key: 'settings',
    route: '/admin/settings',
    en: 'System Settings',
    th: 'ตั้งค่าระบบ',
    descEn: 'Configure groups, statuses & categories',
    descTh: 'ตั้งค่ากลุ่ม สถานะการทำงาน และหมวดหมู่',
  },
  {
    key: 'roles',
    route: '/admin/roles',
    en: 'Roles & Permissions',
    th: 'จัดการบทบาทและสิทธิ์',
    descEn: 'Manage admin roles and tab permissions',
    descTh: 'สร้างและกำหนดสิทธิ์แต่ละหน้าในระบบหลังบ้าน',
  },
];

export const ADMIN_TAB_KEYS = ADMIN_TABS.map(t => t.key);
export const PERMISSION_LEVELS = ['none', 'view', 'edit'];
export const LEVEL_RANK = { none: 0, view: 1, edit: 2 };

export function isAdminRoleName(roleName) {
  return String(roleName || '').trim().toLowerCase() === 'admin';
}

export function buildDefaultPermissions(defaultLevel = 'none') {
  const level = PERMISSION_LEVELS.includes(defaultLevel) ? defaultLevel : 'none';
  return ADMIN_TAB_KEYS.reduce((acc, key) => {
    acc[key] = level;
    return acc;
  }, {});
}

export function extractRoleTitleEn(roleDoc) {
  if (!roleDoc) return '';
  if (typeof roleDoc === 'string') return roleDoc.trim();
  if (Array.isArray(roleDoc.title)) {
    const en = roleDoc.title.find(t => t && t.key === 'en');
    if (en && en.value) return String(en.value).trim();
    const th = roleDoc.title.find(t => t && t.key === 'th');
    if (th && th.value) return String(th.value).trim();
  }
  return String(roleDoc.nameEn || roleDoc.name || '').trim();
}

export function normalizePermissions(rawPermissions, roleNameOrDoc = '') {
  const roleName = extractRoleTitleEn(roleNameOrDoc);
  if (isAdminRoleName(roleName)) {
    return buildDefaultPermissions('edit');
  }
  const source = rawPermissions && typeof rawPermissions === 'object' ? rawPermissions : {};
  return ADMIN_TAB_KEYS.reduce((acc, key) => {
    const level = String(source[key] || 'none').trim().toLowerCase();
    acc[key] = PERMISSION_LEVELS.includes(level) ? level : 'none';
    return acc;
  }, {});
}

export function readSession() {
  try {
    const raw = localStorage.getItem('objs');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

export function saveSessionPermissions(roleName, permissions) {
  try {
    const session = readSession();
    if (!session || (!session.xAccessToken && !session.token)) return session;
    const next = {
      ...session,
      ...(roleName ? { role: roleName } : {}),
      permissions: normalizePermissions(permissions, roleName || session.role),
    };
    localStorage.setItem('objs', JSON.stringify(next));
    return next;
  } catch (e) {
    return null;
  }
}

export function resolveSessionObject(source = null) {
  if (!source) return readSession();
  if (source.$store && source.$store.state && source.$store.state.auth) {
    const authState = source.$store.state.auth;
    const stored = readSession();
    return {
      ...stored,
      role: authState.role || stored.role,
      permissions: authState.permissions || stored.permissions,
    };
  }
  return source;
}

export function getEffectivePermissions(source = null) {
  const session = resolveSessionObject(source);
  return normalizePermissions(session && session.permissions, session && session.role);
}

export function hasTabPermission(source, tab, requiredLevel = 'view') {
  const perms = getEffectivePermissions(source);
  const actual = LEVEL_RANK[perms[tab]] || 0;
  const needed = LEVEL_RANK[requiredLevel] || LEVEL_RANK.view;
  return actual >= needed;
}

export function hasAdminAccess(source = null) {
  const session = resolveSessionObject(source);
  if (isAdminRoleName(session && session.role)) return true;
  const perms = getEffectivePermissions(session);
  return ADMIN_TAB_KEYS.some(key => perms[key] === 'view' || perms[key] === 'edit');
}

export function firstAllowedAdminRoute(source = null) {
  const matched = ADMIN_TABS.find(tab => hasTabPermission(source, tab.key, 'view'));
  return matched ? matched.route : '/';
}
