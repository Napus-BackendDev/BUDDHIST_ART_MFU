<template>
  <CModal :show="show" @update:show="$emit('update:show', $event)" centered class="submit-artwork-modal">
    <template #header>
      <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <div class="icon-square mr-3"><CIcon name="cil-cloud-upload" size="lg" /></div>
          <div>
            <h5 class="modal-title font-weight-bold mb-1">{{ $i18n.locale === 'en' ? 'Submit Artwork' : 'ส่งผลงานสร้างสรรค์' }}</h5>
            <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Complete two short steps to submit your work.' : 'กรอกข้อมูล 2 ขั้นตอนสั้น ๆ เพื่อส่งผลงาน' }}</p>
          </div>
        </div>
        <button class="close-btn" @click="$emit('update:show', false)"><CIcon name="cil-x" /></button>
      </div>
    </template>

    <div class="wizard-body">
      <div class="wizard-grid">
        <main class="wizard-form-column">
          <section v-show="currentStep === 1">
            <div class="step-heading"><span>01</span><div><h6>ข้อมูลผลงานภาษาไทย</h6><p>กรอกข้อมูลอ้างอิงภาษาไทยก่อน</p></div></div>
            <div class="form-group-custom"><label class="form-label">ชื่อผลงาน (ภาษาไทย) *</label><CInput v-model="form.title.th" placeholder="กรอกชื่อผลงานภาษาไทย" class="custom-input mb-0" /></div>
            <div class="form-group-custom"><label class="form-label">หมวดหมู่ *</label><CDropdown :caret="false" class="w-100"><template #toggler><CButton class="custom-select-btn"><span>{{ categoryLabel }}</span><CIcon name="cil-chevron-bottom" /></CButton></template><CDropdownMenu class="w-100"><CDropdownItem v-for="item in categories" :key="item._id" @click="form.category = item._id">{{ getName('th', item) }}</CDropdownItem></CDropdownMenu></CDropdown></div>
            <div class="form-group-custom"><label class="form-label">เทคนิคที่ใช้ (ภาษาไทย)</label><CInput v-model="form.technique.th" placeholder="เช่น สีน้ำมันบนผ้าใบ" class="custom-input mb-0" /></div>
            <div class="form-group-custom"><label class="form-label">ขนาด (กว้าง × ยาว{{ is3D ? ' × สูง' : '' }}) *</label><div class="dimensions"><CInput type="number" v-model="form.width" placeholder="ความกว้าง" class="custom-input mb-0" /><b>×</b><CInput type="number" v-model="form.height" placeholder="ความยาว" class="custom-input mb-0" /><template v-if="is3D"><b>×</b><CInput type="number" v-model="form.depth" placeholder="ความสูง" class="custom-input mb-0" /></template><div class="unit-dropdown-wrap"><CDropdown :key="form.unit" :caret="false"><template #toggler><CButton class="custom-select-btn unit-select-btn"><span>{{ getUnitLabel }}</span><CIcon name="cil-chevron-bottom" class="dropdown-icon ml-1" /></CButton></template><CDropdownMenu class="border-0 shadow-lg mt-2"><CDropdownItem v-for="unit in units" :key="unit.en" @click="form.unit = unit.en">{{ unit.th }}</CDropdownItem></CDropdownMenu></CDropdown></div></div></div>
            <div class="form-group-custom"><label class="form-label">หมายเหตุ (ภาษาไทย)</label><CInput v-model="form.remark.th" placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับผลงาน" class="custom-input mb-0" /></div>
            <div class="form-group-custom mb-0"><label class="form-label">รายละเอียดผลงาน (ภาษาไทย)</label><CTextarea v-model="form.description.th" rows="4" placeholder="อธิบายแนวคิด ที่มา หรือรายละเอียดของผลงาน" class="custom-textarea" /></div>
          </section>

          <section v-show="currentStep === 2">
            <div class="step-heading"><span>02</span><div><h6>Artwork details in English</h6><p>Enter matching English information for the same artwork.</p></div></div>
            <div class="form-group-custom"><label class="form-label">Artwork title (English) *</label><CInput v-model="form.title.en" placeholder="e.g. The Golden Serenity" class="custom-input mb-0" /></div>
            <div class="form-group-custom"><label class="form-label">Category *</label><CDropdown :caret="false" class="w-100"><template #toggler><CButton class="custom-select-btn"><span>{{ categoryLabelEn }}</span><CIcon name="cil-chevron-bottom" /></CButton></template><CDropdownMenu class="w-100"><CDropdownItem v-for="item in categories" :key="item._id" @click="form.category = item._id">{{ getName('en', item) }}</CDropdownItem></CDropdownMenu></CDropdown></div>
            <div class="form-group-custom"><label class="form-label">Technique (English)</label><CInput v-model="form.technique.en" placeholder="e.g. Oil on Canvas" class="custom-input mb-0" /></div>
            <div class="form-group-custom"><label class="form-label">Dimensions (width × length{{ is3D ? ' × height' : '' }}) *</label><div class="dimensions"><CInput type="number" v-model="form.width" placeholder="Width" class="custom-input mb-0" /><b>×</b><CInput type="number" v-model="form.height" placeholder="Length" class="custom-input mb-0" /><template v-if="is3D"><b>×</b><CInput type="number" v-model="form.depth" placeholder="Height" class="custom-input mb-0" /></template><div class="unit-dropdown-wrap"><CDropdown :key="form.unit" :caret="false"><template #toggler><CButton class="custom-select-btn unit-select-btn"><span>{{ form.unit }}</span><CIcon name="cil-chevron-bottom" class="dropdown-icon ml-1" /></CButton></template><CDropdownMenu class="border-0 shadow-lg mt-2"><CDropdownItem v-for="unit in units" :key="unit.en" @click="form.unit = unit.en">{{ unit.en }}</CDropdownItem></CDropdownMenu></CDropdown></div></div></div>
            <div class="form-group-custom"><label class="form-label">Remark (English)</label><CInput v-model="form.remark.en" placeholder="Additional notes in English" class="custom-input mb-0" /></div>
            <div class="form-group-custom mb-0"><label class="form-label">Description (English)</label><CTextarea v-model="form.description.en" rows="4" placeholder="Describe the artwork in English" class="custom-textarea" /></div>
          </section>
        </main>

        <aside class="wizard-image-column">
          <div class="image-heading"><span><CIcon name="cil-image1" size="lg" /></span><div><h6>{{ $i18n.locale === 'en' ? 'Artwork image *' : 'รูปภาพผลงาน *' }}</h6><p>{{ $i18n.locale === 'en' ? 'Upload the main image shown on the website.' : 'อัปโหลดรูปหลักที่จะแสดงบนเว็บไซต์' }}</p></div></div>
          <div class="image-upload-panel"><input id="submission-image" type="file" accept="image/png,image/jpeg" @change="handleFileUpload" /><label for="submission-image"><template v-if="imagePreview"><img :src="imagePreview" alt="Artwork preview" /><span>เปลี่ยนรูปภาพ</span></template><template v-else><i><CIcon name="cil-cloud-upload" size="xl" /></i><strong>{{ $i18n.locale === 'en' ? 'Choose artwork image' : 'เลือกรูปภาพผลงาน' }}</strong><small>PNG, JPG or JPEG</small><em>{{ $i18n.locale === 'en' ? 'Maximum 5 MB' : 'ขนาดไม่เกิน 5 MB' }}</em></template></label></div>
          <div class="sale-box"><div class="form-group-custom"><label class="form-label">{{ $i18n.locale === 'en' ? 'Storage location' : 'สถานที่จัดเก็บ' }}</label><CDropdown :caret="false" class="w-100"><template #toggler><CButton class="custom-select-btn"><span>{{ $i18n.locale === 'en' ? storageLabelEn : storageLabel }}</span><CIcon name="cil-chevron-bottom" /></CButton></template><CDropdownMenu class="w-100"><CDropdownItem v-for="item in storages" :key="item._id" @click="form.storage = item._id">{{ getName($i18n.locale === 'en' ? 'en' : 'th', item) }}</CDropdownItem></CDropdownMenu></CDropdown></div><div class="form-group-custom mb-0"><label class="form-label">{{ $i18n.locale === 'en' ? 'Price' : 'ราคา' }}</label><CInput v-model="form.price" type="number" placeholder="฿ 0.00" class="custom-input mb-0" /></div></div>
        </aside>
      </div>
    </div>

    <template #footer>
      <div class="wizard-footer w-100 d-flex justify-content-between align-items-center">
        <CButton variant="ghost" :class="currentStep === 1 ? 'btn-cancel' : 'btn-back'" @click="currentStep === 1 ? $emit('update:show', false) : currentStep = 1"><CIcon v-if="currentStep === 2" name="cil-arrow-left" class="mr-1" />{{ currentStep === 1 ? ($i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก') : ($i18n.locale === 'en' ? 'Back' : 'ย้อนกลับ') }}</CButton>
        <div><CButton v-if="currentStep === 1" color="primary" class="btn-submit" @click="currentStep = 2">{{ $i18n.locale === 'en' ? 'Next' : 'ถัดไป' }} <CIcon name="cil-arrow-right" class="ml-1" /></CButton><CButton v-else color="primary" class="btn-submit" :disabled="!isFormValid || loading" @click="handleSave">{{ $i18n.locale === 'en' ? 'Submit artwork' : 'ส่งผลงาน' }}</CButton></div>
      </div>
    </template>
  </CModal>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SubmissionCreateModal',
  props: { show: Boolean, loading: Boolean, assignmentTitle: String },
  data: () => ({
    currentStep: 1, categories: [], storages: [], statuses: [], imagePreview: null,
    units: [{ en: 'cm', th: 'ซม' }, { en: 'm', th: 'ม.' }, { en: 'inch', th: 'นิ้ว' }, { en: 'mm', th: 'มม.' }],
    form: { title: { th: '', en: '' }, artist: '', category: '', storage: '', technique: { th: '', en: '' }, width: '', height: '', depth: '', unit: 'cm', price: '', description: { th: '', en: '' }, remark: { th: '', en: '' }, status: { approval: '', sale: '' }, image: null }
  }),
  computed: {
    ...mapGetters({ userId: 'auth/userId' }),
    saleStatuses () { return this.statuses.filter(item => this.getName('en', item) === 'Available') },
    approvalStatuses () { return this.statuses.filter(item => this.getName('en', item) === 'Pending') },
    selectedCategory () { return this.categories.find(item => String(item._id) === String(this.form.category)) },
    selectedStorage () { return this.storages.find(item => String(item._id) === String(this.form.storage)) },
    categoryLabel () { return this.selectedCategory ? this.getName('th', this.selectedCategory) : 'เลือกหมวดหมู่' },
    categoryLabelEn () { return this.selectedCategory ? this.getName('en', this.selectedCategory) : 'Select category' },
    storageLabel () { return this.selectedStorage ? this.getName('th', this.selectedStorage) : 'เลือกสถานที่จัดเก็บ' },
    storageLabelEn () { return this.selectedStorage ? this.getName('en', this.selectedStorage) : 'Select storage location' },
    getUnitLabel () { const unit = this.units.find(item => item.en === this.form.unit); return unit ? unit.th : this.form.unit },
    is3D () { const name = this.getName('en', this.selectedCategory || {}).toLowerCase(); return name.includes('sculpture') || name.includes('installation') },
    isFormValid () { return this.form.title.th.trim() && this.form.title.en.trim() && this.form.category && this.form.width !== '' && this.form.height !== '' && this.imagePreview && this.form.price !== '' }
  },
  watch: { show (visible) { if (visible) this.resetForm() } },
  async created () { await this.fetchInitialData() },
  methods: {
    getName (lang, item) { const title = item && (item.title || item.name); if (Array.isArray(title)) return title.find(value => value.key === lang)?.value || title[0]?.value || ''; return typeof title === 'string' ? title : '' },
    async fetchInitialData () { try { this.categories = await this.$store.dispatch('artwork/category', { method: 'get' }) || []; await this.$store.dispatch('setting/status/get'); this.statuses = this.$store.getters['setting/status/item'] || []; await this.$store.dispatch('setting/storage/get'); this.storages = this.$store.getters['setting/storage/item'] || []; this.resetForm() } catch (error) { console.error('Unable to load submission form data:', error) } },
    resetForm () { const sale = this.saleStatuses[0]; const approval = this.approvalStatuses[0]; this.currentStep = 1; this.imagePreview = null; this.form = { title: { th: '', en: '' }, artist: this.userId || '', category: this.categories[0]?._id || '', storage: '', technique: { th: '', en: '' }, width: '', height: '', depth: '', unit: 'cm', price: '', description: { th: '', en: '' }, remark: { th: '', en: '' }, status: { approval: approval?._id || '', sale: sale?._id || '' }, image: null } },
    handleFileUpload (event) { const file = event.target.files && event.target.files[0]; if (!file) return; if (!file.type.match(/^image\//) || file.size > 5 * 1024 * 1024) { alert(this.$i18n.locale === 'en' ? 'Use an image file no larger than 5 MB.' : 'กรุณาใช้ไฟล์รูปภาพขนาดไม่เกิน 5 MB'); event.target.value = ''; return } this.form.image = file; const reader = new FileReader(); reader.onload = value => { this.imagePreview = value.target.result }; reader.readAsDataURL(file) },
    handleSave () { if (!this.isFormValid) return; const sizeEn = this.is3D ? `${this.form.width} x ${this.form.height} x ${this.form.depth} ${this.form.unit}` : `${this.form.width} x ${this.form.height} ${this.form.unit}`; const unitTh = this.getUnitLabel; const sizeTh = this.is3D ? `${this.form.width} x ${this.form.height} x ${this.form.depth} ${unitTh}` : `${this.form.width} x ${this.form.height} ${unitTh}`; this.$emit('submit', { title: [{ key: 'en', value: this.form.title.en }, { key: 'th', value: this.form.title.th }], description: [{ key: 'en', value: this.form.description.en }, { key: 'th', value: this.form.description.th }], artist: this.form.artist, category: this.form.category, storage: this.form.storage || null, technique: [{ key: 'en', value: this.form.technique.en }, { key: 'th', value: this.form.technique.th }], size: [{ key: 'en', value: sizeEn }, { key: 'th', value: sizeTh }], price: Number(this.form.price), status: this.form.status, remark: [{ key: 'en', value: this.form.remark.en }, { key: 'th', value: this.form.remark.th }], _image: this.form.image }); this.$emit('update:show', false) }
  }
}
</script>

<style scoped>
::v-deep .modal-dialog { max-width: 1100px; width: calc(100% - 2rem); }
::v-deep .modal-content { border: 0; border-radius: 22px; overflow: hidden; box-shadow: 0 25px 55px rgba(20, 17, 36, .22); }
::v-deep .modal-header { padding: 1.1rem 2rem; border-bottom: 1px solid #f0ecea; }
::v-deep .modal-body { max-height: calc(100vh - 215px); overflow-y: auto; padding: 1.5rem 2.5rem; }
::v-deep .modal-footer { padding: .9rem 2.5rem; border-top: 1px solid #f0ecea; }
.icon-square, .image-heading > span { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 13px; color: #8c1515; background: rgba(140,21,21,.08); }
.close-btn { border: 0; background: transparent; color: #94a3b8; padding: .45rem; }
.wizard-grid { display: grid; grid-template-columns: minmax(0, 1.75fr) minmax(265px, .8fr); gap: 2rem; }
.wizard-image-column { border-left: 1px solid #eee7e4; padding-left: 2rem; position: sticky; top: 0; align-self: start; }
.step-heading, .image-heading { display: flex; gap: .85rem; align-items: flex-start; border-bottom: 1px solid #f1e9e5; padding-bottom: 1rem; margin-bottom: 1.25rem; }
.step-heading > span { font: 700 1.4rem Georgia, serif; color: #b7791f; padding-top: .08rem; }.step-heading h6,.image-heading h6 { margin:0; color:#27364a; font-weight:800; }.step-heading p,.image-heading p { margin:.2rem 0 0; font-size:.75rem; color:#94a3b8; }
.form-group-custom { margin-bottom: 1.15rem; }.form-label { display:block; margin-bottom:.55rem; font-size:.75rem; font-weight:800; text-transform:uppercase; letter-spacing:.04em; color:#64748b; }
.custom-input ::v-deep .form-control,.custom-textarea ::v-deep .form-control { min-height:52px; border:1px solid #eef1f4; border-radius:12px; background:#f8fafc; padding:.8rem 1rem; }.custom-textarea ::v-deep .form-control { min-height:110px; }.custom-input ::v-deep .form-control:focus,.custom-textarea ::v-deep .form-control:focus { background:#fff; border-color:#8c1515; box-shadow:0 0 0 3px rgba(140,21,21,.08); }
.custom-select-btn { width:100%; min-height:52px; display:flex; align-items:center; justify-content:space-between; border:1px solid #eef1f4; background:#f8fafc; border-radius:12px; padding:.75rem 1rem; color:#475569; transition:all .3s cubic-bezier(.4,0,.2,1); }.custom-select-btn:hover { background:#fff; border-color:#e2e8f0; }.unit-dropdown-wrap { flex:0 0 auto!important; }.unit-select-btn { min-width:96px; }.dropdown-icon { width:14px; color:#94a3b8; }.dimensions { display:flex; align-items:center; gap:.55rem; }.dimensions > div { flex:1; }.dimensions b { color:#94a3b8; }
.image-upload-panel { aspect-ratio:1; border:2px dashed #dccdc8; border-radius:16px; overflow:hidden; background:linear-gradient(145deg,#fffdfb,#f8f5f3); }.image-upload-panel input { display:none; }.image-upload-panel label { width:100%; height:100%; margin:0; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.45rem; color:#344155; text-align:center; }.image-upload-panel i { display:grid; place-items:center; width:66px; height:66px; border-radius:50%; background:#fff; color:#8c1515; box-shadow:0 10px 25px rgba(140,21,21,.12); }.image-upload-panel small { color:#94a3b8; }.image-upload-panel em { font-style:normal; font-size:.68rem; font-weight:700; color:#9a681d; background:rgba(183,121,31,.1); border-radius:99px; padding:.25rem .6rem; }.image-upload-panel img { width:100%; height:calc(100% - 27px); object-fit:contain; padding:.5rem; }.image-upload-panel label span { font-size:.78rem; color:#8c1515; font-weight:700; }.sale-box { margin-top:1.15rem; padding-top:1.15rem; border-top:1px solid #eee7e4; }
.btn-cancel,.btn-back { color:#64748b!important; font-weight:700; }.btn-submit { border-radius:999px!important; padding:.65rem 1.7rem!important; background:#8c1515!important; border-color:#8c1515!important; font-weight:700; }
@media (max-width: 767px) { ::v-deep .modal-body { padding:1.25rem; }.wizard-grid { grid-template-columns:1fr; }.wizard-image-column { position:static; padding:1.5rem 0 0; border-left:0; border-top:1px solid #eee7e4; }.dimensions { flex-wrap:wrap; }.dimensions > div { min-width:40%; } }
</style>
