import {
  buildOfficialEmail,
  normalizeArtistContact
} from '@/utils/officialEmail';

describe('Artist official email helpers', () => {
  it('derives the Lamduan address from a trimmed Student ID', () => {
    expect(buildOfficialEmail(' 6980000004 ')).toBe('6980000004@lamduan.mfu.ac.th');
  });

  it('moves a legacy Official Email to Personal Email when Personal Email is empty', () => {
    expect(normalizeArtistContact('6980000004', {
      studentEmail: 'legacy@gmail.com',
      personalEmail: ''
    })).toEqual({
      studentEmail: '6980000004@lamduan.mfu.ac.th',
      personalEmail: 'legacy@gmail.com'
    });
  });

  it('does not overwrite an existing Personal Email', () => {
    expect(normalizeArtistContact('6980000004', {
      studentEmail: 'legacy@gmail.com',
      personalEmail: 'current@gmail.com'
    })).toEqual({
      studentEmail: '6980000004@lamduan.mfu.ac.th',
      personalEmail: 'current@gmail.com'
    });
  });
});
