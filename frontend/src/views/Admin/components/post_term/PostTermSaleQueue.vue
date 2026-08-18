<template>
  <section class="post-term-queue">
    <div class="queue-tabs mb-3" role="tablist" :aria-label="$i18n.locale === 'en' ? 'Post-term sale filters' : 'ตัวกรองการขายหลังครบ 1 ปี'">
      <button v-for="tab in tabs" :key="tab.key" type="button" class="queue-tab" :class="{ active: filter === tab.key }" @click="filter = tab.key">
        {{ tab.label }} <span class="queue-count">{{ tab.count }}</span>
      </button>
    </div>

    <CCard class="border-0 shadow-sm">
      <CCardBody class="p-0">
        <div class="queue-toolbar p-3 d-flex flex-wrap align-items-center justify-content-between">
          <div>
            <h5 class="mb-1 font-weight-bold">{{ $i18n.locale === 'en' ? 'Post-term sale management' : 'จัดการการขายหลังครบ 1 ปี' }}</h5>
            <p class="text-muted mb-0 small">{{ $i18n.locale === 'en' ? 'Record whether each artwork remains for regular sale or display only.' : 'บันทึกว่าผลงานจะวางขายต่อแบบปกติหรือแสดงเฉย ๆ' }}</p>
          </div>
          <div class="d-flex align-items-center mt-2 mt-md-0">
            <LoadingButton v-if="selectedIds.length" color="primary" class="mr-2" :loading="saving" :loading-text="$i18n.locale === 'en' ? 'Preparing...' : 'กำลังเตรียม...'" @click="openBulkDecision">
              {{ $i18n.locale === 'en' ? `Record ${selectedIds.length} decisions` : `บันทึก ${selectedIds.length} รายการ` }}
            </LoadingButton>
            <CInput v-model="search" class="mb-0 mr-2 queue-search" :placeholder="$i18n.locale === 'en' ? 'Search artist or artwork...' : 'ค้นหาศิลปินหรือผลงาน...'" aria-label="ค้นหาศิลปินหรือผลงาน" />
            <LoadingButton color="light" :loading="loading" :loading-text="$i18n.locale === 'en' ? 'Loading...' : 'กำลังโหลด...'" @click="fetchItems"><CIcon name="cil-reload" /></LoadingButton>
          </div>
        </div>

        <div v-if="loading" class="text-center py-5"><CSpinner color="primary" /><p class="text-muted mt-3 mb-0">{{ $i18n.locale === 'en' ? 'Loading...' : 'กำลังโหลด...' }}</p></div>
        <div v-else-if="filteredItems.length === 0" class="text-center text-muted py-5">{{ $i18n.locale === 'en' ? 'No artworks in this queue.' : 'ไม่พบผลงานในรายการนี้' }}</div>
        <CDataTable v-else :items="filteredItems" :fields="fields" hover responsive class="mb-0">
          <template #select="{ item }">
            <td class="align-middle text-center">
              <CInput type="checkbox" :checked="selectedIds.includes(item._id)" :disabled="item.postTermSale && item.postTermSale.needsReview" :aria-label="`Select ${titleOf(item)}`" @change="toggleSelection(item)" />
            </td>
          </template>
          <template #artwork="{ item }">
            <td class="align-middle">
              <div class="d-flex align-items-center">
                <img v-if="item.image" :src="item.image" :alt="titleOf(item)" class="queue-thumb mr-3" />
                <div v-else class="queue-thumb queue-thumb-empty mr-3"><CIcon name="cil-image" /></div>
                <div><div class="font-weight-bold text-dark">{{ titleOf(item) }}</div><div class="small text-muted">{{ item.artworkCode || '-' }}</div></div>
              </div>
            </td>
          </template>
          <template #artist="{ item }"><td class="align-middle">{{ artistOf(item) }}</td></template>
          <template #deadline="{ item }">
            <td class="align-middle"><div>{{ formatDate(item.postTermSale.initialSaleEndsAt) }}</div><small :class="deadlineClass(item)">{{ countdown(item) }}</small></td>
          </template>
          <template #decision="{ item }"><td class="align-middle"><span class="queue-status" :class="statusClass(item)">{{ decisionLabel(item) }}</span></td></template>
          <template #action="{ item }">
            <td class="align-middle text-right"><CButton color="primary" size="sm" class="font-weight-bold" :disabled="item.postTermSale && item.postTermSale.needsReview" @click="openDecision(item)">{{ item.postTermSale && item.postTermSale.needsReview ? ($i18n.locale === 'en' ? 'Review deadline' : 'ตรวจสอบวันครบกำหนด') : ($i18n.locale === 'en' ? 'Record decision' : 'บันทึกความประสงค์') }}</CButton></td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <CModal :show.sync="showModal" :title="$i18n.locale === 'en' ? 'Record post-term sale decision' : 'บันทึกความประสงค์หลังครบ 1 ปี'" closeOnBackdrop>
      <div v-if="selectedItem">
        <div v-if="selectedIds.length > 1" class="alert alert-info py-2">{{ $i18n.locale === 'en' ? `Applying the same decision to ${selectedIds.length} selected artworks.` : `จะบันทึกความประสงค์เดียวกันให้ผลงานที่เลือก ${selectedIds.length} รายการ` }}</div>
        <div class="d-flex align-items-center mb-4"><img v-if="selectedItem.image" :src="selectedItem.image" :alt="titleOf(selectedItem)" class="queue-thumb mr-3" /><div><h5 class="mb-1">{{ titleOf(selectedItem) }}</h5><small class="text-muted">{{ artistOf(selectedItem) }} · {{ formatDate(selectedItem.postTermSale.initialSaleEndsAt) }}</small></div></div>
        <label class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Decision' : 'ความประสงค์' }}</label>
        <div class="decision-options mb-3"><button type="button" class="decision-option" :class="{ selected: form.decision === 'continue_sale' }" @click="form.decision = 'continue_sale'"><strong>วางขายต่อแบบปกติ</strong><small>ขายต่อไม่มีกำหนดจนกว่าจะหยุดขาย</small></button><button type="button" class="decision-option" :class="{ selected: form.decision === 'display_only' }" @click="form.decision = 'display_only'"><strong>แสดงเฉย ๆ</strong><small>ยังอยู่ในพอร์ต แต่ไม่เปิดให้ซื้อ</small></button></div>
        <label class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Contact method' : 'ช่องทางติดต่อ' }}</label>
        <CSelect v-model="form.contactMethod" :options="contactOptions" class="mb-3" />
        <label class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Note' : 'หมายเหตุ' }}</label>
        <CTextarea v-model="form.note" rows="3" :placeholder="$i18n.locale === 'en' ? 'Optional admin note' : 'หมายเหตุเพิ่มเติม (ถ้ามี)'" />
        <small class="text-muted d-block mt-2">การบันทึกจะเก็บชื่อผู้บันทึก วันเวลา และประวัติการเปลี่ยนแปลง</small>
      </div>
      <template #footer><CButton color="light" @click="showModal = false">{{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}</CButton><CButton color="primary" :disabled="saving || !form.decision || !form.contactMethod" @click="saveDecision">{{ saving ? 'กำลังบันทึก...' : ($i18n.locale === 'en' ? 'Save decision' : 'บันทึกความประสงค์') }}</CButton></template>
    </CModal>
  </section>
</template>

<script>
import moment from 'moment'
import Service from '@/service/api'
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin'

export default {
  name: 'PostTermSaleQueue',
  mixins: [statusBadgeMixin],
  data() {
    return { items: [], loading: false, saving: false, search: '', filter: 'all', showModal: false, selectedItem: null, selectedIds: [], form: { decision: 'continue_sale', contactMethod: 'phone', note: '' } }
  },
  computed: {
    filteredItems() {
      const q = this.search.trim().toLowerCase()
      return this.items.filter(item => {
        const haystack = `${this.titleOf(item)} ${this.artistOf(item)} ${item.artworkCode || ''}`.toLowerCase()
        if (q && !haystack.includes(q)) return false
        const sale = item.postTermSale || {}
        const expired = sale.initialSaleEndsAt && moment(sale.initialSaleEndsAt).isSameOrBefore(moment())
        if (this.filter === 'due') return !expired && moment(sale.initialSaleEndsAt).diff(moment(), 'days', true) <= 30
        if (this.filter === 'pending') return sale.decision === 'pending'
        if (this.filter === 'standard') return sale.mode === 'standard_sale' || sale.decision === 'continue_sale' && expired
        if (this.filter === 'display') return sale.mode === 'display_only' || sale.decision === 'display_only' && expired
        if (this.filter === 'sold') return this.saleName(item) === 'Sold Out'
        return true
      })
    },
    tabs() {
      const count = key => key === 'all' ? this.items.length : this.items.filter(item => {
        const sale = item.postTermSale || {}; const expired = sale.initialSaleEndsAt && moment(sale.initialSaleEndsAt).isSameOrBefore(moment())
        if (key === 'due') return !expired && moment(sale.initialSaleEndsAt).diff(moment(), 'days', true) <= 30
        if (key === 'pending') return sale.decision === 'pending'
        if (key === 'standard') return sale.mode === 'standard_sale' || sale.decision === 'continue_sale' && expired
        if (key === 'display') return sale.mode === 'display_only' || sale.decision === 'display_only' && expired
        return this.saleName(item) === 'Sold Out'
      }).length
      return [
        { key: 'all', label: 'ทั้งหมด', count: count('all') },
        { key: 'due', label: 'ใกล้ครบ 30 วัน', count: count('due') },
        { key: 'pending', label: 'รอคำตอบ', count: count('pending') },
        { key: 'standard', label: 'ขายต่อปกติ', count: count('standard') },
        { key: 'display', label: 'แสดงเฉย ๆ', count: count('display') },
        { key: 'sold', label: 'ขายแล้ว', count: count('sold') }
      ]
    },
    fields() { return [{ key: 'select', label: '' }, { key: 'artwork', label: 'ผลงาน' }, { key: 'artist', label: 'ศิลปิน' }, { key: 'deadline', label: 'ครบกำหนด' }, { key: 'decision', label: 'สถานะ' }, { key: 'action', label: 'การจัดการ' }] },
    contactOptions() { return [{ value: 'phone', label: 'โทรศัพท์' }, { value: 'email', label: 'อีเมล' }, { value: 'in_person', label: 'พบด้วยตนเอง' }] }
  },
  created() { this.fetchItems() },
  mounted() { window.addEventListener('admin:data-changed', this.handleRealtimeChange) },
  beforeDestroy() { window.removeEventListener('admin:data-changed', this.handleRealtimeChange) },
  methods: {
    async fetchItems() { this.loading = true; try { const response = await Service.artwork('post-term-list', {}); this.items = response.data.data || [] } catch (error) { this.$store.commit('dialog/showToast', { title: 'โหลดข้อมูลไม่สำเร็จ', message: 'กรุณาลองใหม่อีกครั้ง', variant: 'danger' }) } finally { this.loading = false } },
    handleRealtimeChange(event) { const change = event && event.detail; if (!change || change.resource === 'artwork' || change.resource === 'all') this.fetchItems() },
    titleOf(item) { return this.getName(this.$i18n.locale, item) || this.getName('en', item) || '-' },
    artistOf(item) { return item.artist ? this.getName(this.$i18n.locale, item.artist) || this.getName('en', item.artist) : '-' },
    saleName(item) { return this.getName('en', item.status && item.status.sale) },
    formatDate(value) {
      if (!value) return 'ต้องตรวจสอบ'
      return new Intl.DateTimeFormat(this.$i18n.locale === 'en' ? 'en-GB' : 'th-TH-u-ca-gregory', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
    },
    countdown(item) { const end = item.postTermSale && item.postTermSale.initialSaleEndsAt; if (!end) return 'ต้องตรวจสอบวันครบกำหนด'; const days = moment(end).diff(moment(), 'days'); return days < 0 ? `หมดอายุแล้ว ${Math.abs(days)} วัน` : `เหลือ ${days} วัน` },
    deadlineClass(item) { return item.postTermSale && item.postTermSale.initialSaleEndsAt && moment(item.postTermSale.initialSaleEndsAt).diff(moment(), 'days') <= 7 ? 'text-danger font-weight-bold' : 'text-muted' },
    decisionLabel(item) { const sale = item.postTermSale || {}; if (sale.needsReview) return 'ต้องตรวจสอบวันครบกำหนด'; if (sale.mode === 'standard_sale') return 'ขายต่อแบบปกติ'; if (sale.mode === 'display_only') return 'แสดงเฉย ๆ'; if (sale.decision === 'continue_sale') return 'รอครบกำหนด · ขายต่อ'; return 'รอคำตอบ' },
    statusClass(item) { const label = this.decisionLabel(item); return label.includes('ขายต่อ') ? 'status-success' : label.includes('แสดง') ? 'status-muted' : 'status-warning' },
    toggleSelection(item) { if (item.postTermSale && item.postTermSale.needsReview) return; const index = this.selectedIds.indexOf(item._id); if (index === -1) this.selectedIds.push(item._id); else this.selectedIds.splice(index, 1) },
    openDecision(item) { if (item.postTermSale && item.postTermSale.needsReview) return; this.selectedIds = [item._id]; this.selectedItem = item; this.form = { decision: item.postTermSale && item.postTermSale.decision === 'display_only' ? 'display_only' : 'continue_sale', contactMethod: 'phone', note: '' }; this.showModal = true },
    openBulkDecision() { const first = this.items.find(item => this.selectedIds.includes(item._id)); if (!first) return; this.selectedItem = first; this.form = { decision: 'continue_sale', contactMethod: 'phone', note: '' }; this.showModal = true },
    async saveDecision() { if (!this.selectedItem || !this.selectedIds.length || !this.form.decision) return; this.saving = true; try { await Service.artwork('post-term-decision', { artworkIds: this.selectedIds, decision: this.form.decision, contactMethod: this.form.contactMethod, note: this.form.note }); this.showModal = false; this.selectedIds = []; await this.fetchItems(); this.$store.commit('dialog/showToast', { title: 'บันทึกแล้ว', message: 'อัปเดตการขายหลังครบ 1 ปีเรียบร้อย', variant: 'success' }) } catch (error) { this.$store.commit('dialog/showToast', { title: 'บันทึกไม่สำเร็จ', message: error.response && error.response.data && error.response.data.data && error.response.data.data.error || 'กรุณาลองใหม่อีกครั้ง', variant: 'danger' }) } finally { this.saving = false } }
  }
}
</script>

<style scoped>
.queue-tabs { display:flex; gap:.5rem; flex-wrap:wrap; }
.queue-tab { border:1px solid #e2e8f0; background:#fff; border-radius:999px; padding:.5rem .85rem; color:#64748b; font-weight:600; cursor:pointer; }
.queue-tab.active { background:#321fdb; border-color:#321fdb; color:#fff; }
.queue-count { margin-left:.3rem; opacity:.8; }
.queue-search { min-width:260px; }
.queue-thumb { width:48px; height:48px; object-fit:cover; border-radius:8px; background:#f1f5f9; }
.queue-thumb-empty { display:flex; align-items:center; justify-content:center; color:#94a3b8; }
.queue-status { display:inline-flex; border-radius:999px; padding:.3rem .65rem; font-size:.75rem; font-weight:700; white-space:nowrap; }
.status-success { color:#166534; background:#dcfce7; }.status-muted { color:#475569; background:#e2e8f0; }.status-warning { color:#92400e; background:#fef3c7; }
.decision-options { display:grid; gap:.65rem; }
.decision-option { text-align:left; border:1px solid #e2e8f0; background:#fff; border-radius:10px; padding:.75rem 1rem; }
.decision-option.selected { border-color:#321fdb; box-shadow:0 0 0 3px rgba(50,31,219,.1); }
.decision-option strong,.decision-option small { display:block; }.decision-option small { color:#64748b; margin-top:.2rem; }
@media (max-width: 576px) { .queue-search { min-width:0; width:calc(100vw - 100px); } .queue-toolbar { align-items:flex-start !important; } }
</style>
