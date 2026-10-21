jest.doMock('xlsx',()=>({utils:{aoa_to_sheet:jest.fn(rows=>rows),book_new:jest.fn(()=>({})),book_append_sheet:jest.fn()},writeFile:jest.fn()}))
const Table=require('@/views/Admin/components/table/OrderTable.vue').default
const XLSX=require('xlsx')
const i18nMixin=require('@/mixins/i18nMixin').default
test('order export uses saved line prices after catalogue prices change, including free items',()=>{
 const vm={filteredItems:[{_id:'qa-order',orderNumber:'ORD-QA',contact:{name:'QA'},status:{title:[{key:'en',value:'Approved'}]},artwork:[{_id:'art1',title:'First',price:9000},{_id:'art2',title:'Free',price:500}],amounts:{subtotal:700,shipping:0,total:700,items:[{artwork:'art1',price:700},{artwork:'art2',price:0}]}}],$i18n:{locale:'en'},sanitizeForPath:x=>x,getName:i18nMixin.methods.getName,formatDate:()=>'',getStatusBadge:()=>({label:'Approved'})}
 Table.methods.exportExcel.call(vm)
 const rows=XLSX.utils.aoa_to_sheet.mock.calls[0][0]
 expect(rows.slice(1).map(row=>row[5])).toEqual([700,0])
})

test('export document links return through the authenticated frontend even without cached invoice metadata',()=>{
 XLSX.utils.aoa_to_sheet.mockClear()
 const vm={filteredItems:[{_id:'qa-doc-order',orderNumber:'ORD-QA',contact:{name:'QA buyer'},status:{title:[{key:'en',value:'Approved'}]},artwork:[]}],$i18n:{locale:'en'},sanitizeForPath:x=>x,getName:i18nMixin.methods.getName,formatDate:()=>'',getStatusBadge:()=>({label:'Approved'})}
 Table.methods.exportExcel.call(vm)
 const row=XLSX.utils.aoa_to_sheet.mock.calls[0][0][1]
 for(const [col,type] of [[9,'invoice'],[10,'certificate']]) {
  const url=new URL(row[col].l.Target)
  expect(url.origin).toBe(window.location.origin)
  expect(url.pathname).toBe('/admin/orders')
  expect(url.searchParams.get('order')).toBe('qa-doc-order')
  expect(url.searchParams.get('document')).toBe(type)
  expect(url.search).not.toMatch(/token|password|buyer/i)
 }
})
