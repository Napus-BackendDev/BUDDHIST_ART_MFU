jest.doMock('xlsx', () => ({ ...jest.requireActual('xlsx'), writeFile: jest.fn() }))
const XLSX = require('xlsx')
const Portal = require('@/views/Admin/SubmissionsDetail.vue').default
import Table from '@/views/Admin/components/table/SubmissionDetailTable.vue'
import Widget from '@/views/Admin/components/submission_detail/SubmissionDetailWidget.vue'
jest.doMock('vue-multiselect/dist/vue-multiselect.min.css',()=>({}))
const Assignment=require('@/views/Admin/Assignment.vue').default

const title=value=>[{key:'en',value}]
const status=code=>({code,title:title('Renamed '+code)})
const art=(owner,code)=>({_id:'art-'+owner,owner,status:status(code),title:[],create:{at:'2026-10-17T03:00Z'}})
const tasks=[{_id:'all',title:title('All'),artist:['a','b','c'],artworks:[art('a','APPROVED'),art('b','PENDING'),art('c','REJECTED')]},{_id:'one',title:title('One'),artist:['a'],artworks:[art('a','PENDING')]}]
const submission={_id:'portal',title:title('QA'),artist:['a','b','c'],assignments:tasks}

test('table response counts use immutable codes after status rename',()=>{
 expect(Table.methods.getResponStats.call({},tasks[0])).toEqual({finish:1,pending:1,error:1})
})
test('pending widget uses codes and targeted progress uses each task enrollment',()=>{
 expect(Widget.computed.pendingReviews.call({submission})).toBe(2)
 expect(Widget.computed.avgProgress.call({submission})).toBe(100)
})
test.each(['en','th'])('export review totals match each task after rename (%s)',locale=>{
 const write=jest.spyOn(XLSX,'writeFile').mockImplementation(()=>{})
 try{
  Portal.methods.handleExport.call({submission,$i18n:{locale},getName:Portal.methods.getName})
  const workbook=write.mock.calls[0][0]
  const rows=XLSX.utils.sheet_to_json(workbook.Sheets.Assignments,{header:1})
  expect(rows[1].slice(3)).toEqual([3,3,1,1,1]);expect(rows[2].slice(3)).toEqual([1,1,0,1,0])
 }finally{write.mockRestore()}
})
test('assignment view canonical review status and expected learners use the task target',()=>{
 const vm={assignment:tasks[0],submission,$i18n:{locale:'en'},getName:Portal.methods.getName}
 const mapped=Assignment.computed.mappedArtworks.call(vm)
 expect(mapped.map(x=>x.status)).toEqual(['Approved','Pending','Rejected'])
 const stats=Assignment.computed.stats.call({...vm,assignment:tasks[1],mappedArtworks:[{student_id:'a',status:'Pending'}]})
 expect(stats.totalExpected).toBe(1)
})
test('legacy title and nested approval shapes still count, and code takes precedence',()=>{
 const rows={artworks:[{status:'Passed'},{status:{approval:status('PENDING')}},{status:'Fail'},{status:{code:'APPROVED',title:title('Pending')}}]}
 expect(Table.methods.getResponStats.call({},rows)).toEqual({finish:2,pending:1,error:1})
})
