<template>
  <CCardFooter class="admin-table-footer">
    <div class="admin-table-summary">
      <span v-if="total > 0">{{ locale === 'en' ? `Showing ${start} to ${end} of ${total} ${nounEn}` : `แสดง ${start} ถึง ${end} จากทั้งหมด ${total} ${nounTh}` }}</span>
      <span v-else>{{ locale === 'en' ? `Showing 0 ${nounEn}` : `แสดง 0 ${nounTh}` }}</span>
    </div>
    <div class="admin-table-controls">
      <template v-if="showPageSize">
      <label class="admin-page-size-label">{{ locale === 'en' ? 'Rows per page' : 'แถวต่อหน้า' }}</label>
      <select class="admin-page-size" :value="itemsPerPage" @change="changePageSize">
        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
      </select>
      </template>
      <CPagination :active-page="activePage" :pages="pageCount" size="sm" align="end" class="mb-0 pill-pagination" @update:activePage="$emit('update:activePage', $event)" />
    </div>
  </CCardFooter>
</template>

<script>
export default {
  name: 'TablePaginationFooter',
  props: {
    total: { type: Number, default: 0 }, activePage: { type: Number, default: 1 },
    itemsPerPage: { type: Number, default: 10 }, nounEn: { type: String, default: 'items' },
    nounTh: { type: String, default: 'รายการ' }, options: { type: Array, default: () => [10, 25, 50, 100] },
    showPageSize: { type: Boolean, default: true }
  },
  computed: {
    locale() { return this.$i18n.locale },
    start() { return this.total ? ((this.activePage - 1) * this.itemsPerPage) + 1 : 0 },
    end() { return Math.min(this.activePage * this.itemsPerPage, this.total) },
    pageCount() { return Math.max(1, Math.ceil(this.total / this.itemsPerPage)) }
  },
  methods: {
    changePageSize(event) {
      this.$emit('update:itemsPerPage', Number(event.target.value));
      this.$emit('update:activePage', 1);
    }
  }
}
</script>

<style scoped>
.admin-table-footer { min-height:76px; padding:16px 24px; border-top:1px solid #ece7e4!important; background:#fff; display:flex; align-items:center; justify-content:space-between; gap:16px; }
.admin-table-summary { color:#6b7280; font-size:.875rem; }
.admin-table-controls { display:flex; align-items:center; gap:10px; }
.admin-page-size-label { margin:0; color:#6b7280; font-size:.82rem; white-space:nowrap; }
.admin-page-size { height:36px; min-width:68px; padding:0 28px 0 12px; border:1px solid #dfd6d1; border-radius:9px; color:#622820; background:#fff; font-weight:700; outline:none; }
.admin-page-size:focus { border-color:#8f2419; box-shadow:0 0 0 3px rgba(143,36,25,.1); }
@media(max-width:767px){.admin-table-footer{align-items:flex-start;flex-direction:column;padding:14px 16px}.admin-table-controls{width:100%;flex-wrap:wrap;justify-content:space-between}}
</style>
