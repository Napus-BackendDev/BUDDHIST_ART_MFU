<template>
  <CModal :show="show" size="xl" centered class="admin-modal" @update:show="close">
    <template #header>
      <div class="d-flex justify-content-between align-items-center w-100">
        <div><h5 class="mb-1">นำเข้าผลงานเข้า Submission</h5><small class="text-muted">รองรับแบบฟอร์มฐานข้อมูลผลงานสร้างสรรค์ รุ่นที่ 6 และ Template เดิม</small></div>
        <button type="button" class="close-btn" aria-label="ปิด" :disabled="busy" @click="close(false)"><CIcon name="cil-x"/></button>
      </div>
    </template>
    <div class="p-3">
      <div class="row">
        <div class="col-md-6"><label for="import-submission">Submission *</label><select id="import-submission" v-model="submissionId" class="form-control" :disabled="busy"><option value="">เลือก Submission</option><option v-for="s in submissions" :key="s._id" :value="s._id">{{ name(s.title) }}</option></select></div>
        <div class="col-md-6"><label for="import-assignment">หัวข้องาน *</label><select id="import-assignment" v-model="assignmentId" class="form-control" :disabled="!selectedSubmission || busy"><option value="">เลือกหัวข้องาน</option><option v-for="a in assignments" :key="a._id" :value="a._id">{{ name(a.title) }}</option></select></div>
      </div>
      <div class="row mt-3">
        <div class="col-12"><label for="import-excel">ไฟล์ Excel *</label><input id="import-excel" ref="excel" type="file" accept=".xlsx,.xls,.csv" class="form-control" :disabled="busy || loading" @change="readExcel"><small class="text-muted">ใช้หัวคอลัมน์เดิมได้ เลือก Submission และหัวข้องานปลายทางด้านบน</small></div>
      </div>
      <p class="text-muted small mt-3">ใช้ลิงก์ภาพจาก “คอลัมน์ 1” ก่อน “อัพโหลดภาพผลงานสมบูรณ์” กรุณาเปิดดูภาพและตั้งสิทธิ์ลิงก์ให้เข้าถึงได้โดยไม่ต้องเข้าสู่ระบบ</p>
      <p class="text-muted small">ประเภทผลงานที่จับคู่ไม่ได้จะใช้ “อื่นๆ” และเก็บประเภทต้นฉบับในหมายเหตุหลังบ้าน</p>
      <div v-if="loading" role="status" class="alert alert-info">กำลังอ่านไฟล์และโหลดข้อมูลอ้างอิง...</div>
      <div v-if="error" role="alert" class="alert alert-danger mt-3 mb-0">{{ error }}</div>
      <div v-if="rows.length" class="mt-4">
        <div class="d-flex justify-content-between align-items-center"><h6>ตัวอย่างข้อมูล ({{ rows.length }} รายการ)</h6><span>มีภาพ {{ imageCount }}/{{ rows.length }} · ต้องแก้ไข {{ invalidCount }} รายการ</span></div>
        <div class="table-responsive preview"><table class="table table-sm"><thead><tr><th>แถว / ชิ้นที่</th><th>ชื่อผลงาน</th><th>ผู้เรียน</th><th>ประเภท / ราคา</th><th>รูปภาพ</th><th>ตรวจสอบ</th></tr></thead><tbody>
          <tr v-for="r in rows" :key="r.rowNumber">
            <td>{{ r.rowNumber }}<small class="d-block">ชิ้นที่ {{ r.piece || '-' }} / ลำดับ {{ r.sequence || '-' }}</small></td>
            <td>{{ r.titleTh || r.titleEn || '-' }}<small class="d-block">{{ r.titleEn }}</small></td>
            <td>{{ r.studentId }}<small class="d-block">{{ r.artistName }}</small></td>
            <td>{{ r.categoryFallback ? 'อื่นๆ' : (r.category || '-') }}<small v-if="r.categoryFallback" class="d-block">ประเภทต้นฉบับ: {{ r.category }} (เก็บในหมายเหตุ)</small><small class="d-block">{{ r.price }} บาท</small></td>
            <td><span v-if="r.image" class="text-success">{{ r.image.name }}</span><a v-else-if="r.imageUrl" :href="r.imageUrl" target="_blank" rel="noopener noreferrer">เปิดดูภาพ</a><span v-else class="text-warning">ไม่มีรูปภาพ</span></td>
            <td class="text-danger">{{ issues(r).join(' · ') }}<span v-if="!issues(r).length" class="text-success">พร้อมนำเข้า</span></td>
          </tr>
        </tbody></table></div>
        <label v-if="imageCount < rows.length" class="mt-3"><input v-model="allowMissingImages" type="checkbox" :disabled="busy"> นำเข้ารายการที่ไม่มีภาพด้วย (เพิ่มภาพภายหลังได้)</label>
        <p class="text-muted small mb-0">นำเข้าทุกรายการไปยังหัวข้องานที่เลือก เก็บประทับเวลา คำอธิบาย เทคนิค ขนาด ราคา และวิธีติดตั้งเป็นหมายเหตุ ชื่อผู้เรียนใช้แสดงประกอบและจับคู่เจ้าของด้วยรหัสประจำตัว</p>
      </div>
    </div>
    <template #footer><div class="w-100 d-flex justify-content-between"><button type="button" class="btn btn-link" :disabled="busy" @click="close(false)">ยกเลิก</button><div><button type="button" class="btn btn-primary" :disabled="!canImport || busy" @click="importRows"><CSpinner v-if="busy" size="sm" class="mr-2" />{{ busy ? 'กำลังนำเข้า...' : 'นำเข้าและบันทึก' }}</button></div></div></template>
  </CModal>
</template>
<script>
import * as XLSX from 'xlsx'
import Service from '@/service/api'
import { parseArtworkRows, matchArtworkImages, artworkPayload } from '@/utils/submissionArtworkImport'

const id = value => String(value && value._id || value || '')
const titleKey = values => String((values || []).find(item => item.key === 'th' && item.value)?.value || (values || []).find(item => item.value)?.value || '').trim().toLowerCase()
const matchesExisting = (artwork, row) => artwork.importKey && row.importKey
  ? artwork.importKey === row.importKey
  : id(artwork.owner) === id(row.artistId) && titleKey(artwork.title) === (row.titleTh || row.titleEn).trim().toLowerCase()

export default {
  name: 'ArtworkImportModal',
  props: { show: Boolean, submissions: { type: Array, default: () => [] }, initialFile: { default: null } },
  data() { return { submissionId: '', assignmentId: '', rows: [], images: [], error: '', busy: false, loading: false, allowMissingImages: false, categories: [], uploadedImages: new Map() } },
  computed: {
    selectedSubmission() { return this.submissions.find(s => s._id === this.submissionId) },
    assignments() { return this.selectedSubmission?.assignments || [] },
    selectedAssignment() { return this.assignments.find(a => a._id === this.assignmentId) },
    pendingStatus() { return (this.$store.getters['setting/status/item'] || []).find(s => s.code === 'PENDING' || (s.title || s.name || []).some?.(n => ['pending', 'รอตรวจสอบ', 'รอตรวจ'].includes(String(n.value).trim().toLowerCase())))?._id },
    imageCount() { return this.rows.filter(r => r.image || r.imageUrl).length },
    invalidCount() { return this.rows.filter(r => this.issues(r).length).length },
    canImport() { return !!this.selectedAssignment && !!this.pendingStatus && this.rows.length > 0 && !this.invalidCount && (this.allowMissingImages || this.imageCount === this.rows.length) && !this.busy && !this.loading }
  },
  watch: {
    async show(value) {
      if (!value) return
      this.error = ''; this.rows = []; this.images = []; this.assignmentId = ''; this.allowMissingImages = false; this.uploadedImages = new Map()
      if (this.$refs.excel) this.$refs.excel.value = ''
      if (this.$refs.images) this.$refs.images.value = ''
      if (this.initialFile) await this.loadFile(this.initialFile)
    },
    submissionId() { this.assignmentId = '' }
  },
  methods: {
    close(value) { if (!this.busy) this.$emit('update:show', value) },
    name(value) { return typeof value === 'string' ? value : (value || []).find(x => x.key === this.$i18n.locale)?.value || value?.[0]?.value || '-' },
    setImages(event) { this.images = Array.from(event.target.files || []); this.rows = matchArtworkImages(this.rows, this.images) },
    async readExcel(event) { const file = event.target.files?.[0]; if (file) await this.loadFile(file) },
    async loadFile(file) {
      this.rows = []; this.error = ''; this.loading = true; this.allowMissingImages = false; this.uploadedImages = new Map()
      try {
        const [categories] = await Promise.all([
          this.$store.dispatch('artwork/category', { method: 'get' }),
          this.$store.dispatch('user/get', {}),
          this.$store.dispatch('setting/status/get')
        ])
        this.categories = categories || []
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true })
        const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
        this.rows = matchArtworkImages(parseArtworkRows(raw, this.$store.getters['user/user'] || [], this.categories), this.images)
        if (!this.rows.length) throw Error('ไฟล์ไม่มีข้อมูลผลงาน')
        if (!this.pendingStatus) this.error = 'ไม่พบสถานะรอตรวจสอบในระบบ กรุณาตรวจสอบการตั้งค่า'
      } catch (error) { this.rows = []; this.error = error.message || 'อ่านไฟล์ Excel ไม่สำเร็จ' }
      finally { this.loading = false }
    },
    issues(row) {
      const errors = [...row.issues]
      if (row.ambiguousImage) errors.push('ชื่อภาพซ้ำ กรุณาใช้ชื่อไฟล์ที่ไม่ซ้ำ')
      const key = (row.titleTh || row.titleEn).trim().toLowerCase()
      if (this.rows.some(other => other !== row && (other.importKey && row.importKey ? other.importKey === row.importKey : other.artistId === row.artistId && (other.titleTh || other.titleEn).trim().toLowerCase() === key))) errors.push('ระเบียนผลงานซ้ำในไฟล์')
      if (this.selectedAssignment?.artworks?.some(aw => matchesExisting(aw, row))) errors.push('มีผลงานนี้ในหัวข้องานแล้ว')
      return errors
    },
    async importRows() {
      if (!this.canImport) return
      this.busy = true; this.error = ''
      try {
        // Reload before appending to preserve changes made since opening the modal.
        const response = await Service.submission('exp', { _id: this.submissionId })
        const sub = JSON.parse(JSON.stringify(response.data.data))
        const assignment = sub.assignments.find(a => a._id === this.assignmentId)
        if (!assignment) throw Error('ไม่พบหัวข้องานปลายทาง กรุณาโหลดข้อมูลใหม่')
        assignment.artworks = assignment.artworks || []
        assignment.artist = (assignment.artist || []).map(id)
        sub.artist = (sub.artist || []).map(id)
        for (const row of this.rows) {
          if (assignment.artworks.some(aw => matchesExisting(aw, row))) throw Error(`แถว ${row.rowNumber}: มีผลงานนี้ในหัวข้องานแล้ว กรุณาโหลดข้อมูลใหม่`)
        }
        for (const row of this.rows) {
          let image = row.imageUrl || null
          if (row.image) {
            const cached = this.uploadedImages.get(row.rowNumber)
            if (cached?.file === row.image && cached.submissionId === sub._id && cached.assignmentId === assignment._id) image = cached.url
            else {
              const form = new FormData()
              form.append('_id', sub._id); form.append('assignmentTitle', this.name(assignment.title)); form.append('artworkTitle', `${row.titleTh || row.titleEn}_${row.sequence || row.rowNumber}`); form.append('image', row.image)
              const upload = await this.$store.dispatch('submission/upload', form)
              image = upload.data?.data?.url || upload.data?.url
              if (!image) throw Error(`แถว ${row.rowNumber}: อัปโหลดภาพไม่สำเร็จ`)
              this.uploadedImages.set(row.rowNumber, { file: row.image, url: image, submissionId: sub._id, assignmentId: assignment._id })
            }
          }
          assignment.artworks.push(artworkPayload(row, image, this.pendingStatus))
          if (!assignment.artist.includes(id(row.artistId))) assignment.artist.push(id(row.artistId))
          if (!sub.artist.includes(id(row.artistId))) sub.artist.push(id(row.artistId))
        }
        await this.$store.dispatch('submission/update', { _id: sub._id, artist: sub.artist, assignments: sub.assignments })
        this.$emit('imported', this.rows.length); this.$emit('update:show', false)
      } catch (error) { this.error = error.response?.data?.message || error.message || 'นำเข้าไม่สำเร็จ กรุณาตรวจสอบข้อมูล' }
      finally { this.busy = false }
    }
  }
}
</script>
<style scoped>
.preview{max-height:360px}.close-btn{border:0;background:none;color:#8792a2}label{font-weight:600}.btn-primary{background:#7b3f32;border-color:#7b3f32}td{min-width:100px}small{font-weight:400}
</style>
