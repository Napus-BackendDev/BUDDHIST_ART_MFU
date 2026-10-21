import Artworks from '@/views/page/Artworks.vue'
import i18nMixin from '@/mixins/i18nMixin'
const art={_id:'qa',title:[{key:'th',value:'ผลงานแบ่งหน้า'},{key:'en',value:'Pagination Artwork'}],artist:{name:[{key:'th',value:'ศิลปินทดสอบ'},{key:'en',value:'QA Peer Artist'}]},artworkCode:'BA-QA-CODE',price:1000}
const search=(locale,query)=>Artworks.computed.filteredArtworks.call({approvedArtworks:[art],$i18n:{locale},getName:i18nMixin.methods.getName,filters:{searchQuery:query,category:'All Categories',cohort:'all',minPrice:0,maxPrice:2000,sort:'newest'},cohortMap:{},getCohortKey:()=> 'qa',getCohortSortValue:()=>0})
describe.each(['th','en'])('%s gallery search',locale=>{
 test.each(['ผลงานแบ่งหน้า','Pagination Artwork','ศิลปินทดสอบ','QA Peer Artist'])('finds either language: %s',query=>{expect(search(locale,query)).toEqual([art])})
})
test('artwork code search remains available',()=>{expect(search('th','BA-QA-CODE')).toEqual([art])})
test('unknown search is empty',()=>{expect(search('en','QA-NO-MATCH')).toEqual([])})
