import { dedupeRoles, dedupeStatuses } from '@/utils/roles';

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

  it('keeps one option per logical status and deduplicates statuses safely', () => {
    const statuses = dedupeStatuses([
      { _id: 'status-new-1', name: 'ผู้เรียนใหม่', nameEn: 'NewStudent', code: 'NEW_STUDENT' },
      { _id: 'status-old-1', name: 'ผู้เรียนเก่า', nameEn: 'OldStudent', code: 'OLD_STUDENT' },
      { _id: 'status-new-2', name: 'ผู้เรียนใหม่', nameEn: 'NewStudent', code: 'NEW_STUDENT_IMPORT_TEST' },
      { _id: 'status-old-2', name: 'ผู้เรียนเก่า', nameEn: 'OldStudent', code: 'OLD_STUDENT_IMPORT_TEST' }
    ]);

    expect(statuses.map(s => s._id)).toEqual(['status-new-1', 'status-old-1']);
  });
});
