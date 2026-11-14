import {
  dedupeRoles,
  dedupeStatuses,
  getRoleBadgeMeta,
  getSystemRoleKey,
  resolveUserStatusMeta
} from '@/utils/roles';

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

  it('resolves dynamic custom roles without falling back to Customer', () => {
    const reviewerRole = {
      _id: 'role-rev',
      title: [{ key: 'th', value: 'อาจารย์ตรวจผลงาน' }, { key: 'en', value: 'Reviewer' }]
    };
    const curatorRole = {
      _id: 'role-cur',
      title: [{ key: 'th', value: 'ภัณฑารักษ์' }, { key: 'en', value: 'Curator' }]
    };
    const customThOnlyRole = {
      _id: 'role-custom',
      title: [{ key: 'th', value: 'ฝ่ายประสานงาน' }]
    };

    expect(getSystemRoleKey(reviewerRole)).toBe('custom');
    expect(getRoleBadgeMeta(reviewerRole, 'th')).toMatchObject({
      key: 'custom',
      label: 'อาจารย์ตรวจผลงาน',
      class: 'status-reviewer'
    });
    expect(getRoleBadgeMeta(reviewerRole, 'en')).toMatchObject({
      key: 'custom',
      label: 'Reviewer',
      class: 'status-reviewer'
    });
    expect(getRoleBadgeMeta(curatorRole, 'th')).toMatchObject({
      key: 'custom',
      label: 'ภัณฑารักษ์',
      class: 'status-curator'
    });
    expect(getRoleBadgeMeta(customThOnlyRole, 'en')).toMatchObject({
      key: 'custom',
      label: 'ฝ่ายประสานงาน',
      class: 'status-custom-role'
    });
  });

  it('treats legacy learner statuses on non-Artist roles as Active while keeping learner statuses for Artist', () => {
    const reviewer = {
      role: { title: [{ key: 'th', value: 'อาจารย์ตรวจผลงาน' }, { key: 'en', value: 'Reviewer' }] },
      status: { code: 'OLD_STUDENT', title: [{ key: 'th', value: 'ผู้เรียนเก่า' }, { key: 'en', value: 'OldStudent' }] }
    };
    const artist = {
      role: { title: [{ key: 'th', value: 'ศิลปิน' }, { key: 'en', value: 'Artist' }] },
      status: { code: 'OLD_STUDENT', title: [{ key: 'th', value: 'ผู้เรียนเก่า' }, { key: 'en', value: 'OldStudent' }] }
    };

    expect(resolveUserStatusMeta(reviewer, 'th')).toMatchObject({ key: 'Active', label: 'ใช้งานอยู่', isLearner: false });
    expect(resolveUserStatusMeta(reviewer, 'en')).toMatchObject({ key: 'Active', label: 'Active', isLearner: false });
    expect(resolveUserStatusMeta(artist, 'th')).toMatchObject({ key: 'OldStudent', label: 'ผู้เรียนเก่า', isLearner: true });
  });
});
