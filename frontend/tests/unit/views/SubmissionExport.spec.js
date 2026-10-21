import Table from '@/views/Admin/components/table/SubmissionTable.vue'
import * as XLSX from 'xlsx'
import i18nMixin from '@/mixins/i18nMixin'
import DetailWidget from '@/views/Admin/components/submission_detail/SubmissionDetailWidget.vue'

test.each(['คืนการลงทะเบียน', 'enrollment restore'])('search finds a submission by either language: %s', search => {
  const vm = { getName: i18nMixin.methods.getName, filters: { search }, submissions: [
    { _id:'qa-sub',title:[{key:'th',value:'QA คืนการลงทะเบียน'},{key:'en',value:'QA Enrollment Restore'}] }
  ] }
  expect(Table.computed.filteredItems.call(vm).map(s=>s._id)).toEqual(['qa-sub'])
})

test('a same-day date filter includes the whole local calendar day', () => {
  const day = new Date('2026-10-16T00:00:00');
  const vm = { getName:i18nMixin.methods.getName,filters:{search:'',startDate:day,endDate:day},
    submissions:['2026-10-15T23:59:59','2026-10-16T00:00:00','2026-10-16T09:00:00','2026-10-16T23:59:59','2026-10-17T00:00:00']
      .map((date,i)=>({_id:i,title:[],create:{startAt:new Date(date)}})) };
  expect(Table.computed.filteredItems.call(vm).map(s=>s._id)).toEqual([3,2,1]);
  expect(vm.filters.endDate.getHours()).toBe(0);
})

test('export preserves exact deadlines, academic year and every enrolled learner without submitted work', () => {
  const users = [{ _id: 'artist-a', studentId: 'QA-A' }, { _id: 'artist-b', studentId: 'QA-B' }]
  const vm = {
    ...Table.methods, getName: i18nMixin.methods.getName, $i18n: { locale: 'th' },
    $store: { getters: { 'user/user': users } },
    filteredItems: [{ title: [{ key: 'en', value: 'QA portal' }], courseLevel: '5', academicYear: '2568',
      artist: users, create: { startAt: '2025-10-16T02:00:00.000Z', endAt: '2025-10-21T09:00:00.000Z' },
      assignments: [{ title: [{ key: 'en', value: 'QA round' }], artist: [], artworks: [],
        create: { startAt: '2025-10-16T02:00:00.000Z', endAt: '2025-10-19T09:00:00.000Z' } }] }]
  }
  const workbook = vm.createExportWorkbook()
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
  expect(rows).toHaveLength(2)
  expect(rows.map(row => row.ArtistStudentID)).toEqual(['QA-A', 'QA-B'])
  for (const row of rows) {
    expect(row.AcademicYear).toBe('2568')
    expect(row.SubmissionStartDate).toBe('2025-10-16T02:00:00.000Z')
    expect(row.AssignmentEndDate).toBe('2025-10-19T09:00:00.000Z')
    expect(row.ArtworkTitleThai || '').toBe('')
  }
})

test('list progress agrees with details when assignments target different learners', () => {
  const portal = {artist:['a','b','c'],assignments:[
    {artist:['a','b','c'],artworks:['a','b','c'].map(owner=>({owner}))},
    {artist:['a'],artworks:[{owner:'a'}]}
  ]}
  expect(Table.methods.calculateProgress(portal)).toBe(100)
  expect(Table.methods.calculateProgress(portal)).toBe(DetailWidget.computed.avgProgress.call({submission:portal}))
})

test.each([false,true])('mixed submissions export every task enrollment, including non-submitters (bare refs %s)', bare => {
  const users = ['A','B','C'].map(suffix=>({_id:'artist-'+suffix,studentId:'QA-'+suffix}))
  const ref = user => bare ? user._id : user
  const vm = {...Table.methods,getName:i18nMixin.methods.getName,$i18n:{locale:'en'},$store:{getters:{'user/user':users}},filteredItems:[{
    title:[{key:'en',value:'Partial portal'}],artist:users.map(ref),assignments:[
      {title:[{key:'en',value:'Partial task'}],artist:users.slice(0,2).map(ref),artworks:[{owner:ref(users[0]),title:[{key:'en',value:'Artwork A'}]}]},
      {title:[{key:'en',value:'Empty task'}],artist:[ref(users[1])],artworks:[]}
    ]
  }]}
  const workbook=vm.createExportWorkbook()
  const rows=XLSX.utils.sheet_to_json(workbook.Sheets.Submissions)
  expect(rows.map(row=>[row.AssignmentTitleEng,row.ArtistStudentID,row.ArtworkTitleEng])).toEqual([
    ['Partial task','QA-A','Artwork A'],['Partial task','QA-B',''],['Empty task','QA-B',''],['','QA-C','']
  ])
})
