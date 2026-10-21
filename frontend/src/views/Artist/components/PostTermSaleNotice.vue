<template>
  <CCard v-if="!loading && actionItems.length" class="post-term-notice border-0 shadow-sm mt-4" role="region" aria-labelledby="post-term-title">
    <CCardBody class="p-4">
      <div class="d-flex align-items-start mb-3"><div class="notice-icon mr-3"><CIcon name="cil-clock" /></div><div><h4 id="post-term-title" class="font-weight-bold mb-1">การขายหลังครบ 1 ปี</h4><p class="text-muted mb-0">ผลงานที่ใกล้หรือพ้นกำหนด เลือกวางขายต่อแบบปกติหรือแสดงเฉย ๆ ได้</p></div></div>
      <div v-for="item in actionItems" :key="item._id" class="notice-row d-flex flex-wrap align-items-center justify-content-between py-3">
        <div class="d-flex align-items-center"><img v-if="item.image" :src="artworkImageUrl(item)" :alt="titleOf(item)" class="notice-thumb mr-3" /><div><div class="font-weight-bold">{{ titleOf(item) }}</div><small class="text-muted">ครบกำหนด {{ formatDate(item.postTermSale.initialSaleEndsAt) }}</small></div></div>
        <div class="notice-actions mt-2 mt-md-0"><CButton color="primary" size="sm" class="mr-2" @click="openDecision(item, 'continue_sale')">วางขายต่อแบบปกติ</CButton><CButton color="light" size="sm" @click="openDecision(item, 'display_only')">แสดงเฉย ๆ</CButton></div>
      </div>
    </CCardBody>
    <CModal :show.sync="showModal" title="ยืนยันความประสงค์" closeOnBackdrop>
      <p>คุณเลือกให้ผลงาน <strong>{{ selectedItem ? titleOf(selectedItem) : '' }}</strong> เป็น <strong>{{ selectedDecision === 'continue_sale' ? 'ขายต่อแบบปกติ' : 'แสดงเฉย ๆ' }}</strong></p>
      <label class="d-flex align-items-start mt-3"><CInput type="checkbox" v-model="confirmed" class="mr-2 mt-1" /><span>{{ selectedDecision === 'continue_sale' ? 'ฉันยืนยันความประสงค์นี้ และเข้าใจว่าการเลือก “ขายต่อแบบปกติ” จะไม่มีวันหมดอายุใหม่' : 'ฉันยืนยันให้แสดงผลงานเฉย ๆ โดยไม่เปิดจำหน่าย' }}</span></label>
      <template #footer><CButton color="light" @click="showModal = false">ยกเลิก</CButton><CButton color="primary" :disabled="!confirmed || saving" @click="saveDecision">{{ saving ? 'กำลังบันทึก...' : 'ยืนยันและบันทึก' }}</CButton></template>
    </CModal>
  </CCard>
</template>

<script>
import Service from '@/service/api'
import { artworkImageUrl } from '@/utils/submissionArtworkImport'

export default {
  name: 'PostTermSaleNotice',
  data() { return { items: [], loading: false, saving: false, showModal: false, selectedItem: null, selectedDecision: null, confirmed: false } },
  computed: {
    actionItems() {
      return this.items.filter(item => {
        const sale = item.postTermSale
        if (!sale || !sale.initialSaleEndsAt || sale.decision !== 'pending') return false
        const deadline = new Date(sale.initialSaleEndsAt).getTime()
        return Number.isFinite(deadline) && deadline <= Date.now() + 30 * 86400000
      })
    }
  },
  created() { this.fetchItems() },
  methods: {
    artworkImageUrl,
    async fetchItems() { this.loading = true; try { const response = await Service.artwork('post-term-list', {}); this.items = response.data.data || [] } catch (error) { this.items = [] } finally { this.loading = false } },
    titleOf(item) { const field = item && item.title; if (Array.isArray(field)) return field.find(value => value.key === this.$i18n.locale)?.value || field[0]?.value || '-'; return field || '-' },
    formatDate(value) {
      if (!value) return 'ต้องตรวจสอบ'
      return new Intl.DateTimeFormat(this.$i18n.locale === 'en' ? 'en-GB' : 'th-TH-u-ca-gregory', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
    },
    openDecision(item, decision) { this.selectedItem = item; this.selectedDecision = decision; this.confirmed = false; this.showModal = true },
    async saveDecision() { if (!this.confirmed || !this.selectedItem) return; this.saving = true; try { await Service.artwork('post-term-decision', { artworkId: this.selectedItem._id, decision: this.selectedDecision, contactMethod: 'portal' }); this.showModal = false; await this.fetchItems(); this.$store.commit('dialog/showToast', { title: 'บันทึกแล้ว', message: 'อัปเดตความประสงค์เรียบร้อย', variant: 'success' }) } catch (error) { this.$store.commit('dialog/showToast', { title: 'บันทึกไม่สำเร็จ', message: 'กรุณาลองใหม่อีกครั้ง', variant: 'danger' }) } finally { this.saving = false } }
  }
}
</script>

<style scoped>
.post-term-notice { border-left:4px solid #321fdb !important; }
.notice-icon { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#321fdb; background:#eef2ff; }
.notice-row { border-top:1px solid #eef2f7; gap:1rem; }
.notice-thumb { width:52px; height:52px; object-fit:cover; border-radius:8px; background:#f1f5f9; }
.notice-actions { display:flex; flex-wrap:wrap; }
</style>
