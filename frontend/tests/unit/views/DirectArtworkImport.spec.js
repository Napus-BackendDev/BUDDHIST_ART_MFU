import Artworks from '@/views/Admin/Artworks.vue'
const user={_id:'qa-owner',studentId:'QA-OWNER'}
const categories=[{_id:'qa-paint',name:[{key:'en',value:'Painting'}]},{_id:'qa-other',code:'OTHER',name:[{key:'en',value:'Other'}]}]
const row={ArtworkTitleThai:'QA import',ArtistID:'QA-OWNER',Category:'Painting',Price:500}
const vm=users=>({categories,$store:{getters:{'user/user':users}}})
test.each([[[]],[[user,{...user,_id:'duplicate'}]]])('unmatched or ambiguous artist blocks import with a row number',users=>{
 expect(()=>Artworks.methods.prepareImportRows.call(vm(users),[row])).toThrow(/2/)
})
test('unknown medium uses configured Other and preserves the source in private remarks',()=>{
 const result=Artworks.methods.prepareImportRows.call(vm([user]),[{...row,ArtistID:' QA-OWNER ',Category:'Mixed Media & Kinetic Mechanism',RemarkThai:'QA internal'}])[0]
 expect(result.artistId).toBe('qa-owner');expect(result.categoryId).toBe('qa-other');expect(result.remarkTh).toContain('Mixed Media & Kinetic Mechanism');expect(result.remarkTh).toContain('QA internal')
})
test('invalid prices block the whole import before writing',()=>{
 expect(()=>Artworks.methods.prepareImportRows.call(vm([user]),[row,{...row,Price:'invalid'}])).toThrow(/3/)
})
