import { readArtworkImage } from '@/utils/artworkImage'

const NativeReader=global.FileReader, NativeImage=global.Image
let decodingFails,readingFails,reads
beforeEach(()=>{
 decodingFails=false;readingFails=false;reads=0
 global.FileReader=class { readAsDataURL(){reads++;if(readingFails){this.onerror();return}this.result='data:image/png;base64,QA';this.onload()} }
 global.Image=class { constructor(){this.naturalWidth=900;this.naturalHeight=700} set src(value){if(decodingFails)this.onerror();else this.onload()} }
})
afterEach(()=>{global.FileReader=NativeReader;global.Image=NativeImage})
test.each([['image/svg+xml',20],['image/gif',20],['image/png',5*1024*1024+1]])('rejects %s/%s bytes before reading',(type,size)=>{
 const file=new File([new Uint8Array(size)],'qa-image',{type})
 return expect(readArtworkImage(file,'en')).rejects.toThrow().then(()=>expect(reads).toBe(0))
})
test('accepts a decodable PNG at the5MB boundary without conversion',async()=>{
 expect(await readArtworkImage(new File([new Uint8Array(5*1024*1024)],'qa.png',{type:'image/png'}),'en')).toBe('data:image/png;base64,QA')
})
test.each(['en','th'])('reports damaged images in %s',async locale=>{
 decodingFails=true
 await expect(readArtworkImage(new File(['broken'],'qa.png',{type:'image/png'}),locale)).rejects.toThrow(locale==='en'?'Unable to read':'ไม่สามารถอ่าน')
})
test('reports file reader failures',async()=>{
 readingFails=true
 await expect(readArtworkImage(new File(['broken'],'qa.png',{type:'image/png'}),'en')).rejects.toThrow('Unable to read')
})
