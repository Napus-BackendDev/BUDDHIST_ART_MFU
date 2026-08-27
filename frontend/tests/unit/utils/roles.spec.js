import { dedupeRoles } from '@/utils/roles';

describe('Role option helpers', () => {
  it('keeps one option per logical English role name', () => {
    const roles = dedupeRoles([
      { _id: 'admin-1', name: 'ผู้ดูแลระบบ', nameEn: 'Admin' },
      { _id: 'artist-1', name: 'ศิลปิน', nameEn: 'Artist' },
      { _id: 'artist-legacy', name: 'ศิลปิน', nameEn: ' artist ' },
      { _id: 'admin-legacy', name: 'ผู้ดูแลระบบ', nameEn: 'ADMIN' }
    ]);

    expect(roles.map(role => role._id)).toEqual(['admin-1', 'artist-1']);
  });

  it('handles an empty or invalid role list safely', () => {
    expect(dedupeRoles()).toEqual([]);
    expect(dedupeRoles([null, { _id: 'missing-name' }])).toEqual([{ _id: 'missing-name' }]);
  });
});
