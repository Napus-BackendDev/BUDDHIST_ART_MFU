<template>
  <CCard v-if="!loading && actionItems.length" class="post-term-notice border-0 shadow-sm mt-4" role="region" aria-labelledby="post-term-title">
    <CCardBody class="p-4">
      <div class="d-flex align-items-start mb-3">
        <div class="notice-icon mr-3"><CIcon name="cil-clock" /></div>
        <div>
          <h4 id="post-term-title" class="font-weight-bold mb-1">
            {{ isEn ? '1-Year Archive Schedule' : 'แจ้งเตือนกำหนดย้ายเข้าคลัง Archive (ครบ 1 ปี)' }}
          </h4>
          <p class="text-muted mb-0">
            {{ isEn
              ? 'Published works from closed submissions automatically move to the non-commercial Archive after 1 year. Contact an administrator if you need assistance.'
              : 'ผลงานที่ครบกำหนด 1 ปีหลังปิดระบบส่งผลงานจะถูกย้ายเข้าสู่คลังผลงาน (Archive) เพื่อจัดแสดงโดยไม่เปิดจำหน่ายอัตโนมัติ (หากมีกรณีพิเศษ กรุณาติดต่อผู้ดูแลระบบ)' }}
          </p>
        </div>
      </div>
      <div v-for="item in actionItems" :key="item._id" class="notice-row d-flex flex-wrap align-items-center justify-content-between py-3">
        <div class="d-flex align-items-center">
          <img v-if="item.image" :src="artworkImageUrl(item)" :alt="titleOf(item)" class="notice-thumb mr-3" />
          <div>
            <div class="font-weight-bold">{{ titleOf(item) }}</div>
            <small class="text-muted">
              {{ isEn ? 'Archive date:' : 'กำหนดเข้าคลัง Archive:' }} {{ formatDate(item.postTermSale.initialSaleEndsAt) }}
            </small>
          </div>
        </div>
        <div class="notice-actions mt-2 mt-md-0">
          <span class="archive-status-pill" :class="{ 'is-archived': isPastDeadline(item) }">
            {{ deadlineBadgeText(item) }}
          </span>
        </div>
      </div>
    </CCardBody>
  </CCard>
</template>

<script>
import Service from '@/service/api'
import { artworkImageUrl } from '@/utils/submissionArtworkImport'

export default {
  name: 'PostTermSaleNotice',
  data() { return { items: [], loading: false } },
  computed: {
    isEn() {
      return this.$i18n && this.$i18n.locale === 'en'
    },
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
    async fetchItems() {
      this.loading = true
      try {
        const response = await Service.artwork('post-term-list', {})
        this.items = response.data.data || []
      } catch (error) {
        this.items = []
      } finally {
        this.loading = false
      }
    },
    titleOf(item) {
      const field = item && item.title
      if (Array.isArray(field)) return field.find(value => value.key === (this.isEn ? 'en' : 'th'))?.value || field[0]?.value || '-'
      return field || '-'
    },
    formatDate(value) {
      if (!value) return this.isEn ? 'Needs review' : 'ต้องตรวจสอบ'
      return new Intl.DateTimeFormat(this.isEn ? 'en-GB' : 'th-TH-u-ca-gregory', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
    },
    isPastDeadline(item) {
      const endsAt = item?.postTermSale?.initialSaleEndsAt
      if (!endsAt) return false
      return new Date(endsAt).getTime() <= Date.now()
    },
    deadlineBadgeText(item) {
      const endsAt = item?.postTermSale?.initialSaleEndsAt
      if (!endsAt) return this.isEn ? 'Needs Review' : 'รอตรวจสอบวัน'
      const daysLeft = Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000)
      if (daysLeft <= 0) return this.isEn ? 'Moved to Archive' : 'เข้าคลัง Archive แล้ว'
      return this.isEn ? `Archive in ${daysLeft}d` : `เข้า Archive ใน ${daysLeft} วัน`
    }
  }
}
</script>

<style scoped>
.post-term-notice { border-left:4px solid #612721 !important; }
.notice-icon { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#612721; background:#fdf2f2; }
.notice-row { border-top:1px solid #eef2f7; gap:1rem; }
.notice-thumb { width:52px; height:52px; object-fit:cover; border-radius:8px; background:#f1f5f9; }
.notice-actions { display:flex; flex-wrap:wrap; align-items:center; }
.archive-status-pill { display:inline-block; padding:0.35rem 0.85rem; border-radius:999px; font-size:0.82rem; font-weight:600; background:#fef3c7; color:#92400e; }
.archive-status-pill.is-archived { background:#f3f4f6; color:#4b5563; }
</style>
