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

export default dedupeRoles;
