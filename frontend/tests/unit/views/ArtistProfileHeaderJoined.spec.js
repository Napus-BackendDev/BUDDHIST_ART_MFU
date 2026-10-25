import ArtistProfileHeader from '@/views/Artist/components/ArtistProfileHeader.vue';

const joined = user => ArtistProfileHeader.computed.joinedDate.call({ user, $i18n: { locale: 'en' } });

describe('ArtistProfileHeader joinedDate', () => {
  it('uses createdAt when present', () => {
    expect(joined({ _id: '6a7c67ac1ec8e06e58fea371', createdAt: '2025-03-02T00:00:00Z' })).toBe('March 2025');
  });
  it('falls back to the ObjectId creation time instead of a made-up date', () => {
    const id = Math.floor(Date.UTC(2026, 9, 24) / 1000).toString(16) + '0000000000000000';
    expect(joined({ _id: id })).toBe('October 2026');
  });
  it('shows a dash when no creation time is known', () => {
    expect(joined({ _id: 'legacy' })).toBe('-');
  });
});
