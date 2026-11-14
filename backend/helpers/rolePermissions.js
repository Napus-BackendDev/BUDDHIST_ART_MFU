'use strict';

const ADMIN_TABS = [
    'overview',
    'analytics',
    'orders',
    'artworks',
    'news',
    'submissions',
    'users',
    'settings',
    'roles'
];

const LEVELS = ['none', 'view', 'edit'];
const LEVEL_RANK = { none: 0, view: 1, edit: 2 };
const SYSTEM_ROLE_KEYS = new Set(['admin', 'artist', 'customer']);

const isAdminRoleName = (name) => String(name || '').trim().toLowerCase() === 'admin';

const buildDefaultPermissions = (defaultLevel = 'none') => {
    const level = LEVELS.includes(defaultLevel) ? defaultLevel : 'none';
    return Object.fromEntries(ADMIN_TABS.map(tab => [tab, level]));
};

const extractEnglishRoleTitle = (roleDoc) => {
    if (!roleDoc) return '';
    if (typeof roleDoc === 'string') return roleDoc;
    if (Array.isArray(roleDoc.title)) {
        const en = roleDoc.title.find(t => t && t.key === 'en');
        if (en && en.value) return String(en.value).trim();
        const th = roleDoc.title.find(t => t && t.key === 'th');
        if (th && th.value) return String(th.value).trim();
    }
    return String(roleDoc.name || roleDoc.nameEn || '').trim();
};

const isSystemRoleDoc = (roleDoc) => {
    if (!roleDoc) return false;
    if (roleDoc.isSystem) return true;
    const titles = Array.isArray(roleDoc.title) ? roleDoc.title.map(t => String(t?.value || '').trim().toLowerCase()) : [];
    return titles.some(title => SYSTEM_ROLE_KEYS.has(title));
};

const normalizePermissions = (rawPermissions, roleNameOrDoc = '') => {
    const roleName = typeof roleNameOrDoc === 'string' ? roleNameOrDoc : extractEnglishRoleTitle(roleNameOrDoc);
    if (isAdminRoleName(roleName)) {
        return buildDefaultPermissions('edit');
    }
    const source = rawPermissions && typeof rawPermissions === 'object' ? rawPermissions : {};
    return Object.fromEntries(
        ADMIN_TABS.map(tab => {
            const val = String(source[tab] || 'none').trim().toLowerCase();
            return [tab, LEVELS.includes(val) ? val : 'none'];
        })
    );
};

const hasAdminAccess = (permissions, roleName = '') => {
    if (isAdminRoleName(roleName)) return true;
    if (!permissions || typeof permissions !== 'object') return false;
    return ADMIN_TABS.some(tab => (LEVEL_RANK[permissions[tab]] || 0) >= LEVEL_RANK.view);
};

const hasTabPermission = (req, tab, requiredLevel = 'view') => {
    const roleName = req?.user?.role;
    if (isAdminRoleName(roleName)) return true;
    const perms = req?.user?.permissions;
    if (!perms || typeof perms !== 'object') return false;
    const currentRank = LEVEL_RANK[String(perms[tab] || 'none').toLowerCase()] || 0;
    const neededRank = LEVEL_RANK[requiredLevel] || LEVEL_RANK.view;
    return currentRank >= neededRank;
};

const presetRoleDefinitions = () => [
    {
        key: 'admin',
        isSystem: true,
        title: [
            { key: 'en', value: 'Admin' },
            { key: 'th', value: 'ผู้ดูแลระบบ' }
        ],
        description: [
            { key: 'en', value: 'Full access to all administrative features' },
            { key: 'th', value: 'เข้าถึงฟีเจอร์การดูแลระบบทั้งหมด' }
        ],
        permissions: buildDefaultPermissions('edit')
    },
    {
        key: 'artist',
        isSystem: true,
        title: [
            { key: 'en', value: 'Artist' },
            { key: 'th', value: 'ศิลปิน' }
        ],
        description: [
            { key: 'en', value: 'Can manage their own profile and artworks' },
            { key: 'th', value: 'สามารถจัดการข้อมูลส่วนตัวและผลงานศิลปะของตนเอง' }
        ],
        permissions: buildDefaultPermissions('none')
    },
    {
        key: 'customer',
        isSystem: true,
        title: [
            { key: 'en', value: 'Customer' },
            { key: 'th', value: 'ลูกค้า/นักศึกษา' }
        ],
        description: [
            { key: 'en', value: 'Standard user access for browsing and ordering' },
            { key: 'th', value: 'การเข้าถึงของผู้ใช้ปกติสำหรับการเรียกดูและสั่งซื้อ' }
        ],
        permissions: buildDefaultPermissions('none')
    },
    {
        key: 'reviewer',
        isSystem: false,
        title: [
            { key: 'en', value: 'Reviewer' },
            { key: 'th', value: 'อาจารย์ตรวจผลงาน' }
        ],
        description: [
            { key: 'en', value: 'View-only access to inspect submitted artworks without editing or approving' },
            { key: 'th', value: 'เข้าดูรายการและรายละเอียดผลงานที่ส่งเข้ามาล่วงหน้าได้อย่างเดียว ไม่สามารถแก้ไขหรืออนุมัติ' }
        ],
        permissions: {
            ...buildDefaultPermissions('none'),
            submissions: 'view'
        }
    }
];

module.exports = {
    ADMIN_TABS,
    LEVELS,
    LEVEL_RANK,
    SYSTEM_ROLE_KEYS,
    isAdminRoleName,
    buildDefaultPermissions,
    extractEnglishRoleTitle,
    isSystemRoleDoc,
    normalizePermissions,
    hasAdminAccess,
    hasTabPermission,
    presetRoleDefinitions
};
