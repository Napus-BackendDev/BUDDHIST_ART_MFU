<template>
  <section class="post-term-queue">
    <!-- Filter & Queue Navigation Card -->
    <CCard class="mb-4 border-0 shadow-sm admin-filter-card">
      <CCardBody class="p-4">
        <!-- Filter Tabs -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div class="queue-tabs-wrapper" role="tablist" :aria-label="$i18n.locale === 'en' ? 'Post-term sale filters' : 'ตัวกรองการขายหลังครบ 1 ปี'">
            <button 
              v-for="tab in tabs" 
              :key="tab.key" 
              type="button" 
              class="queue-tab-pill" 
              :class="{ active: filter === tab.key }" 
              @click="filter = tab.key"
            >
              <span>{{ tab.label }}</span>
              <span class="queue-badge-count">{{ tab.count }}</span>
            </button>
          </div>

          <div class="d-flex align-items-center flex-wrap justify-content-end">
            <button
              type="button"
              class="btn-select-all mr-2"
              :disabled="loading || !selectableFilteredItems.length"
              :aria-pressed="allFilteredSelected ? 'true' : 'false'"
              @click="toggleSelectAll"
            >
              <CIcon :name="allFilteredSelected ? 'cil-check-circle' : 'cil-check-alt'" class="mr-1" />
              {{ allFilteredSelected
                ? ($i18n.locale === 'en' ? 'Deselect all' : 'ยกเลิกเลือกทั้งหมด')
                : ($i18n.locale === 'en' ? 'Select all' : 'เลือกทั้งหมด') }}
            </button>
            <button 
              v-if="selectedIds.length" 
              type="button" 
              class="btn-bulk-decision mr-2" 
              :disabled="saving" 
              @click="openBulkDecision"
            >
              <CIcon name="cil-check" class="mr-1" />
              {{ $i18n.locale === 'en' ? `Record ${selectedIds.length} decisions` : `บันทึกความประสงค์ ${selectedIds.length} รายการ` }}
            </button>
            <button 
              type="button" 
              class="btn-reload-icon" 
              :title="$i18n.locale === 'en' ? 'Reload data' : 'รีเฟรชข้อมูล'" 
              @click="fetchItems"
            >
              <CIcon name="cil-reload" :class="{ 'spinner-animation': loading }" />
            </button>
          </div>
        </div>

        <!-- Toolbar / Search Bar -->
        <div class="row align-items-center">
          <div class="col-md-6 col-lg-5">
            <div class="search-field-wrapper">
              <CIcon name="cilMagnifyingGlass" class="search-icon-fixed" />
              <input 
                v-model="search" 
                class="search-input-plain" 
                :placeholder="$i18n.locale === 'en' ? 'Search by artwork title, artist, or code...' : 'ค้นหาตามชื่อผลงาน, ศิลปิน หรือรหัส...'" 
                :aria-label="$i18n.locale === 'en' ? 'Search artist or artwork' : 'ค้นหาศิลปินหรือผลงาน'" 
              />
              <button v-if="search" type="button" class="btn-clear-search" @click="search = ''">
                <CIcon name="cil-x" size="sm" />
              </button>
            </div>
          </div>
          <div class="col-md-6 col-lg-7 text-md-right mt-2 mt-md-0">
            <span class="text-muted small">
              {{ $i18n.locale === 'en' ? 'Showing' : 'แสดง' }} 
              <strong class="text-dark">{{ filteredItems.length }}</strong> 
              {{ $i18n.locale === 'en' ? 'artworks in this queue' : 'ผลงานในรายการนี้' }}
            </span>
          </div>
        </div>
      </CCardBody>
    </CCard>

    <!-- Main Queue Table Card -->
    <CCard class="artwork-table-card mb-4 border-0">
      <div v-if="loading" class="text-center py-5">
        <CSpinner color="primary" />
        <p class="text-muted mt-3 mb-0">{{ $i18n.locale === 'en' ? 'Loading post-term artworks...' : 'กำลังโหลดข้อมูลการขายหลังครบ 1 ปี...' }}</p>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state-wrap py-5">
        <CIcon name="cil-paint" class="empty-icon mb-3" />
        <h6 class="font-weight-bold text-muted mb-1">{{ $i18n.locale === 'en' ? 'No artworks in this queue.' : 'ไม่พบรายการผลงานในหมวดนี้' }}</h6>
        <p class="small text-muted mb-0">{{ $i18n.locale === 'en' ? 'Try changing your search filter or selecting another tab.' : 'ลองเปลี่ยนคำค้นหาหรือเลือกแท็บอื่น' }}</p>
      </div>

      <div v-else class="table-responsive">
        <CDataTable 
          :items="paginatedItems" 
          :fields="fields" 
          hover 
          class="custom-table mb-0"
        >
          <!-- Select Checkbox -->
          <template #select="{ item }">
            <td class="align-middle text-center py-3" style="width: 45px;">
              <input 
                type="checkbox" 
                class="custom-table-checkbox" 
                :checked="selectedIds.includes(item._id)" 
                :disabled="item.postTermSale && item.postTermSale.needsReview" 
                :aria-label="`Select ${titleOf(item)}`" 
                @change="toggleSelection(item)" 
              />
            </td>
          </template>

          <!-- Artwork Thumbnail & Title -->
          <template #artwork="{ item }">
            <td class="align-middle py-3">
              <div class="d-flex align-items-center">
                <div 
                  class="thumbnail-wrapper clickable mr-3" 
                  role="button" 
                  tabindex="0" 
                  :aria-label="`View ${titleOf(item)} image`" 
                  @click="zoomImg(item)" 
                  @keydown.enter="zoomImg(item)" 
                  @keydown.space.prevent="zoomImg(item)"
                >
                  <img 
                    v-if="item.image" 
                    :src="getImageUrl(item)"
                    :alt="titleOf(item)" 
                    class="thumbnail-img" 
                  />
                  <div v-else class="thumbnail-empty">
                    <span>{{ getInitials(titleOf(item)) }}</span>
                  </div>
                  <div class="zoom-overlay">
                    <CIcon name="cilMagnifyingGlass" />
                  </div>
                </div>
                <div>
                  <div class="font-weight-bold text-dark-blue">{{ titleOf(item) }}</div>
                  <div class="d-flex align-items-center mt-1">
                    <span class="code-badge-pill">{{ item.artworkCode || '—' }}</span>
                    <span v-if="item.price" class="price-pill ml-2">฿{{ formatPrice(item.price) }}</span>
                  </div>
                </div>
              </div>
            </td>
          </template>

          <!-- Artist -->
          <template #artist="{ item }">
            <td class="align-middle py-3">
              <div class="artist-name font-weight-bold text-dark">{{ artistOf(item) }}</div>
              <div v-if="item.artist && item.artist.studentId" class="artist-id small text-muted mt-1">ID: {{ item.artist.studentId }}</div>
            </td>
          </template>

          <!-- Batch / Round Column -->
          <template #batch_round="{ item }">
            <td class="align-middle py-3">
              <div class="d-flex align-items-center mb-1 flex-wrap">
                <span class="batch-badge">
                  <CIcon name="cil-school" size="sm" class="mr-1" />
                  {{ getBatchLabel(item) }}
                </span>
                <span v-if="item.academicYear" class="year-pill ml-1">ปี {{ item.academicYear }}</span>
              </div>
              <div class="round-title small font-weight-bold text-truncate" style="max-width: 170px;" :title="getRoundLabel(item)">
                <CIcon name="cil-layers" size="sm" class="mr-1 text-muted" />
                {{ getRoundLabel(item) }}
              </div>
            </td>
          </template>

          <!-- Deadline & Countdown -->
          <template #deadline="{ item }">
            <td class="align-middle py-3">
              <div class="font-weight-bold text-dark-blue">{{ formatDate(item.postTermSale && item.postTermSale.initialSaleEndsAt) }}</div>
              <div class="mt-1">
                <span class="countdown-badge" :class="getDeadlineBadgeClass(item)">
                  <CIcon :name="getDeadlineIcon(item)" size="sm" class="mr-1" />
                  {{ countdown(item) }}
                </span>
              </div>
            </td>
          </template>

          <!-- Decision / Status -->
          <template #decision="{ item }">
            <td class="align-middle py-3">
              <div :class="['status-badge', getDecisionStatusBadge(item).class]">
                <CIcon :name="getDecisionStatusBadge(item).icon" size="sm" class="status-icon mr-1" />
                {{ getDecisionStatusBadge(item).label }}
              </div>
            </td>
          </template>

          <!-- Action Button -->
          <template #action="{ item }">
            <td class="align-middle text-right py-3 pr-4">
              <CButton 
                v-if="!(item.postTermSale && item.postTermSale.needsReview)" 
                class="btn-decision-action" 
                size="sm" 
                @click="openDecision(item)"
              >
                <CIcon name="cil-pencil" class="mr-1" />
                {{ $i18n.locale === 'en' ? 'Record decision' : 'บันทึกความประสงค์' }}
              </CButton>
              <span v-else class="text-danger small font-weight-bold">
                {{ $i18n.locale === 'en' ? 'Review required' : 'ต้องตรวจสอบวัน' }}
              </span>
            </td>
          </template>
        </CDataTable>

        <!-- Pagination Footer -->
        <div class="pagination-footer d-flex flex-wrap justify-content-between align-items-center p-3 bg-white border-top">
          <div class="text-muted small mb-2 mb-md-0">
            {{ $i18n.locale === 'en' ? 'Showing' : 'แสดง' }} {{ (activePage - 1) * itemsPerPage + 1 }} {{ $i18n.locale === 'en' ? 'to' : 'ถึง' }} {{ Math.min(activePage * itemsPerPage, filteredItems.length) }} {{ $i18n.locale === 'en' ? 'of' : 'จาก' }} {{ filteredItems.length }} {{ $i18n.locale === 'en' ? 'artworks' : 'รายการ' }}
          </div>
          <CPagination 
            :active-page.sync="activePage" 
            :pages="Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))" 
            size="sm" 
            align="end" 
            class="mb-0 pill-pagination" 
          />
        </div>
      </div>
    </CCard>

    <!-- Record Decision Modal -->
    <CModal 
      :show.sync="showModal" 
      :title="$i18n.locale === 'en' ? 'Record Post-term Sale Decision' : 'บันทึกความประสงค์การขายหลังครบ 1 ปี'" 
      centered 
      class="admin-modal" 
      size="lg"
    >
      <div v-if="selectedItem" class="p-3">
        <div v-if="selectedIds.length > 1" class="alert alert-info border-0 rounded-lg py-2 mb-3">
          <CIcon name="cil-info" class="mr-2" />
          {{ $i18n.locale === 'en' ? `Applying the same decision to ${selectedIds.length} selected artworks.` : `กำลังจะบันทึกความประสงค์เดียวกันให้ผลงานที่เลือกทั้งหมด ${selectedIds.length} รายการ` }}
        </div>

        <!-- Selected Artwork Header Preview -->
        <div class="artwork-preview-box d-flex align-items-center mb-4 p-3 rounded-lg">
          <img 
            v-if="selectedItem.image" 
            :src="getImageUrl(selectedItem)"
            :alt="titleOf(selectedItem)" 
            class="preview-thumb mr-3" 
          />
          <div v-else class="preview-thumb-empty mr-3">
            <span>{{ getInitials(titleOf(selectedItem)) }}</span>
          </div>
          <div>
            <h6 class="font-weight-bold text-dark-blue mb-1">{{ titleOf(selectedItem) }}</h6>
            <div class="small text-muted">
              <span>{{ artistOf(selectedItem) }}</span>
              <span class="mx-2">·</span>
              <span>{{ $i18n.locale === 'en' ? 'Deadline:' : 'วันครบกำหนด:' }} {{ formatDate(selectedItem.postTermSale && selectedItem.postTermSale.initialSaleEndsAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Decision Selection Option Cards -->
        <div class="form-group mb-3">
          <label class="modal-form-label">{{ $i18n.locale === 'en' ? 'Select Decision' : 'เลือกความประสงค์' }} <span class="text-danger">*</span></label>
          <div class="decision-card-grid">
            <button
              type="button"
              class="decision-select-card" 
              :class="{ selected: form.decision === 'continue_sale' }" 
              :aria-pressed="form.decision === 'continue_sale' ? 'true' : 'false'"
              @click="form.decision = 'continue_sale'"
            >
              <div class="d-flex align-items-center">
                <div class="decision-icon-badge bg-green-soft text-green mr-3">
                  <CIcon name="cil-cart" size="lg" />
                </div>
                <div>
                  <div class="decision-card-title">{{ $i18n.locale === 'en' ? 'Continue Regular Sale' : 'วางขายต่อแบบปกติ' }}</div>
                  <div class="decision-card-desc">{{ $i18n.locale === 'en' ? 'Available for purchase with no end date until changed.' : 'ขายต่อไม่มีกำหนดจนกว่าจะหยุดขาย พร้อมออกใบรับรองสิทธิ์' }}</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              class="decision-select-card" 
              :class="{ selected: form.decision === 'display_only' }" 
              :aria-pressed="form.decision === 'display_only' ? 'true' : 'false'"
              @click="form.decision = 'display_only'"
            >
              <div class="d-flex align-items-center">
                <div class="decision-icon-badge bg-blue-soft text-blue mr-3">
                  <CIcon name="cil-eye" size="lg" />
                </div>
                <div>
                  <div class="decision-card-title">{{ $i18n.locale === 'en' ? 'Display Only (Archive)' : 'แสดงเฉย ๆ (จัดแสดงในนิทรรศการ)' }}</div>
                  <div class="decision-card-desc">{{ $i18n.locale === 'en' ? 'Remain in student portfolio without purchase button.' : 'ยังคงอยู่ในพอร์ตโฟลิโอแต่ปิดการสั่งซื้อ' }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Contact Method Select -->
        <div class="form-group mb-3">
          <label for="post-term-contact-method" class="modal-form-label">{{ $i18n.locale === 'en' ? 'Contact Method' : 'ช่องทางติดต่อที่ได้รับคำตอบ' }} <span class="text-danger">*</span></label>
          <select id="post-term-contact-method" v-model="form.contactMethod" class="form-control custom-select-field">
            <option v-for="opt in contactOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <!-- Note Textarea -->
        <div class="form-group mb-3">
          <label for="post-term-note" class="modal-form-label">{{ $i18n.locale === 'en' ? 'Note / Remark' : 'หมายเหตุเพิ่มเติม (ถ้ามี)' }}</label>
          <textarea 
            id="post-term-note"
            v-model="form.note" 
            rows="3" 
            class="form-control custom-textarea-field" 
            :placeholder="$i18n.locale === 'en' ? 'Optional administrative note...' : 'ระบุบันทึกเพิ่มเติม...'"
          ></textarea>
          <small class="text-muted d-block mt-2">
            <CIcon name="cil-info" class="mr-1" />
            {{ $i18n.locale === 'en' ? 'This action logs administrator identity, timestamp, and audit trail.' : 'ระบบจะบันทึกชื่อผู้ดูแลระบบ วันเวลา และประวัติการเปลี่ยนแปลงอัตโนมัติ' }}
          </small>
        </div>
      </div>

      <template #footer>
        <CButton color="secondary" variant="outline" class="px-4 font-weight-bold" :disabled="saving" @click="showModal = false">
          {{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
        </CButton>
        <CButton 
          color="primary" 
          class="px-4 font-weight-bold btn-save-primary" 
          :disabled="saving || !form.decision || !form.contactMethod" 
          @click="saveDecision"
        >
          <CIcon v-if="saving" name="cil-reload" class="mr-2 spinner-animation" />
          {{ saving ? ($i18n.locale === 'en' ? 'Saving...' : 'กำลังบันทึก...') : ($i18n.locale === 'en' ? 'Save Decision' : 'บันทึกความประสงค์') }}
        </CButton>
      </template>
    </CModal>

    <!-- Image Zoom Modal (Matching AdminTable) -->
    <CModal :show.sync="showZoomModal" centered size="lg" class="admin-modal">
      <div class="p-3 text-center">
        <img :src="zoomedImage" :alt="zoomedTitle" class="img-fluid rounded-lg shadow-sm" style="max-height: 70vh; object-fit: contain;" />
        <h5 class="mt-3 font-weight-bold text-dark-blue">{{ zoomedTitle }}</h5>
      </div>
      <template #footer>
        <CButton color="secondary" class="px-4 font-weight-bold" @click="showZoomModal = false">
          {{ $i18n.locale === 'en' ? 'Close' : 'ปิด' }}
        </CButton>
      </template>
    </CModal>
  </section>
</template>

<script>
import moment from 'moment';
import Service from '@/service/api';
import { artworkImageUrl } from '@/utils/submissionArtworkImport';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';

export default {
  name: 'PostTermSaleQueue',
  mixins: [statusBadgeMixin],
  data() {
    return {
      items: [],
      loading: false,
      saving: false,
      search: '',
      filter: 'all',
      showModal: false,
      selectedItem: null,
      selectedIds: [],
      activePage: 1,
      itemsPerPage: 10,
      showZoomModal: false,
      zoomedImage: '',
      zoomedTitle: '',
      form: {
        decision: 'continue_sale',
        contactMethod: 'phone',
        note: ''
      }
    };
  },
  watch: {
    filter() {
      this.activePage = 1;
    },
    search() {
      this.activePage = 1;
    }
  },
  computed: {
    filteredItems() {
      const q = this.search.trim().toLowerCase();
      return this.items.filter(item => {
        const batch = this.getBatchLabel(item);
        const round = this.getRoundLabel(item);
        const haystack = `${this.titleOf(item)} ${this.artistOf(item)} ${item.artworkCode || ''} ${item.academicYear || ''} ${batch} ${round}`.toLowerCase();
        if (q && !haystack.includes(q)) return false;
        const sale = item.postTermSale || {};
        const expired = sale.initialSaleEndsAt && moment(sale.initialSaleEndsAt).isSameOrBefore(moment());
        if (this.filter === 'due') return !expired && moment(sale.initialSaleEndsAt).diff(moment(), 'days', true) <= 30;
        if (this.filter === 'pending') return sale.decision === 'pending';
        if (this.filter === 'standard') return sale.mode === 'standard_sale' || (sale.decision === 'continue_sale' && expired);
        if (this.filter === 'display') return sale.mode === 'display_only' || (sale.decision === 'display_only' && expired);
        if (this.filter === 'sold') return this.saleName(item) === 'Sold Out';
        return true;
      });
    },
    paginatedItems() {
      const start = (this.activePage - 1) * this.itemsPerPage;
      return this.filteredItems.slice(start, start + this.itemsPerPage);
    },
    selectableFilteredItems() {
      return this.filteredItems.filter(item => !(item.postTermSale && item.postTermSale.needsReview));
    },
    allFilteredSelected() {
      return this.selectableFilteredItems.length > 0 && this.selectableFilteredItems.every(item => this.selectedIds.includes(item._id));
    },
    tabs() {
      const count = key => key === 'all' ? this.items.length : this.items.filter(item => {
        const sale = item.postTermSale || {};
        const expired = sale.initialSaleEndsAt && moment(sale.initialSaleEndsAt).isSameOrBefore(moment());
        if (key === 'due') return !expired && moment(sale.initialSaleEndsAt).diff(moment(), 'days', true) <= 30;
        if (key === 'pending') return sale.decision === 'pending';
        if (key === 'standard') return sale.mode === 'standard_sale' || (sale.decision === 'continue_sale' && expired);
        if (key === 'display') return sale.mode === 'display_only' || (sale.decision === 'display_only' && expired);
        return this.saleName(item) === 'Sold Out';
      }).length;
      return [
        { key: 'all', label: this.$i18n.locale === 'en' ? 'All Artworks' : 'ทั้งหมด', count: count('all') },
        { key: 'due', label: this.$i18n.locale === 'en' ? 'Due within 30 Days' : 'ใกล้ครบ 30 วัน', count: count('due') },
        { key: 'pending', label: this.$i18n.locale === 'en' ? 'Pending Decision' : 'รอคำตอบ', count: count('pending') },
        { key: 'standard', label: this.$i18n.locale === 'en' ? 'Continue Sale' : 'ขายต่อปกติ', count: count('standard') },
        { key: 'display', label: this.$i18n.locale === 'en' ? 'Display Only' : 'แสดงเฉย ๆ', count: count('display') },
        { key: 'sold', label: this.$i18n.locale === 'en' ? 'Sold Out' : 'ขายแล้ว', count: count('sold') }
      ];
    },
    fields() {
      return [
        { key: 'select', label: '', _classes: 'text-center' },
        { key: 'artwork', label: this.$i18n.locale === 'en' ? 'ARTWORK' : 'ผลงานศิลปะ' },
        { key: 'artist', label: this.$i18n.locale === 'en' ? 'ARTIST' : 'ศิลปิน' },
        { key: 'batch_round', label: this.$i18n.locale === 'en' ? 'BATCH / ROUND' : 'รุ่น / รอบส่งงาน' },
        { key: 'deadline', label: this.$i18n.locale === 'en' ? 'TERM DEADLINE' : 'วันครบกำหนด' },
        { key: 'decision', label: this.$i18n.locale === 'en' ? 'STATUS / DECISION' : 'สถานะความประสงค์' },
        { key: 'action', label: this.$i18n.locale === 'en' ? 'ACTION' : 'การจัดการ', _classes: 'text-right' }
      ];
    },
    contactOptions() {
      return [
        { value: 'phone', label: this.$i18n.locale === 'en' ? 'Phone Call' : 'โทรศัพท์' },
        { value: 'email', label: this.$i18n.locale === 'en' ? 'Email' : 'อีเมล' },
        { value: 'in_person', label: this.$i18n.locale === 'en' ? 'In Person at Center' : 'พบด้วยตนเองที่ศูนย์บริการ' }
      ];
    }
  },
  created() {
    this.fetchItems();
  },
  mounted() {
    window.addEventListener('admin:data-changed', this.handleRealtimeChange);
  },
  beforeDestroy() {
    window.removeEventListener('admin:data-changed', this.handleRealtimeChange);
  },
  methods: {
    getImageUrl(item) {
      const image = artworkImageUrl(item);
      if (!image) return '';
      if (image.startsWith('http://') || image.startsWith('https://')) return image;
      const baseUrl = process.env.VUE_APP_API_URL || window.location.origin;
      return `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
    },
    getInitials(name) {
      if (!name) return 'A';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    },
    formatPrice(price) {
      return Number(price || 0).toLocaleString();
    },
    async fetchItems() {
      this.loading = true;
      try {
        const response = await Service.artwork('post-term-list', {});
        this.items = response.data.data || [];
      } catch (error) {
        this.$store.commit('dialog/showToast', {
          title: this.$i18n.locale === 'en' ? 'Load Failed' : 'โหลดข้อมูลไม่สำเร็จ',
          message: this.$i18n.locale === 'en' ? 'Please try again.' : 'กรุณาลองใหม่อีกครั้ง',
          variant: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    handleRealtimeChange(event) {
      const change = event && event.detail;
      if (!change || change.resource === 'artwork' || change.resource === 'all') {
        this.fetchItems();
      }
    },
    titleOf(item) {
      return this.getName(this.$i18n.locale, item) || this.getName('en', item) || '—';
    },
    artistOf(item) {
      return item.artist ? (this.getName(this.$i18n.locale, item.artist) || this.getName('en', item.artist)) : '—';
    },
    saleName(item) {
      return this.getName('en', item.status && item.status.sale);
    },
    getBatchLabel(item) {
      if (!item.courseLevel || item.courseLevel === '00') return this.$i18n.locale === 'en' ? 'General' : 'ทั่วไป';
      const lvl = parseInt(item.courseLevel, 10);
      if (!isNaN(lvl)) {
        return this.$i18n.locale === 'en' ? `Batch ${lvl}` : `รุ่นที่ ${lvl}`;
      }
      return item.courseLevel;
    },
    getRoundLabel(item) {
      if (item.submissionTitle) return item.submissionTitle;
      const lvl = parseInt(item.courseLevel, 10);
      if (lvl === 4) return this.$i18n.locale === 'en' ? 'Round 1: Degree Thesis' : 'รอบที่ 1: ศิลปนิพนธ์';
      if (lvl === 3) return this.$i18n.locale === 'en' ? 'Round 2: Creative Studio' : 'รอบที่ 2: สร้างสรรค์พุทธศิลป์';
      if (lvl === 2) return this.$i18n.locale === 'en' ? 'Round 1: Midterm Studio' : 'รอบที่ 1: ปฏิบัติการพุทธศิลป์';
      return this.$i18n.locale === 'en' ? 'Regular Submission' : 'รอบปกติ: ประจำภาคเรียน';
    },
    formatDate(value) {
      if (!value) return this.$i18n.locale === 'en' ? 'Needs Review' : 'ต้องตรวจสอบ';
      return new Intl.DateTimeFormat(this.$i18n.locale === 'en' ? 'en-GB' : 'th-TH-u-ca-gregory', {
        timeZone: 'Asia/Bangkok',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(new Date(value));
    },
    countdown(item) {
      const end = item.postTermSale && item.postTermSale.initialSaleEndsAt;
      if (!end) return this.$i18n.locale === 'en' ? 'Review date required' : 'ต้องตรวจสอบวัน';
      const days = moment(end).diff(moment(), 'days');
      if (days < 0) return this.$i18n.locale === 'en' ? `Expired ${Math.abs(days)}d ago` : `ครบกำหนดแล้ว ${Math.abs(days)} วัน`;
      if (days === 0) return this.$i18n.locale === 'en' ? 'Expires today' : 'ครบกำหนดวันนี้';
      return this.$i18n.locale === 'en' ? `${days} days left` : `เหลืออีก ${days} วัน`;
    },
    getDeadlineBadgeClass(item) {
      const end = item.postTermSale && item.postTermSale.initialSaleEndsAt;
      if (!end) return 'badge-danger-soft';
      const days = moment(end).diff(moment(), 'days');
      if (days <= 7 && days >= 0) return 'badge-danger-soft';
      if (days <= 30 && days > 7) return 'badge-warning-soft';
      if (days < 0) return 'badge-muted-soft';
      return 'badge-info-soft';
    },
    getDeadlineIcon(item) {
      const end = item.postTermSale && item.postTermSale.initialSaleEndsAt;
      if (!end) return 'cil-warning';
      const days = moment(end).diff(moment(), 'days');
      if (days <= 7) return 'cil-warning';
      if (days <= 30) return 'cil-clock';
      return 'cil-calendar';
    },
    getDecisionStatusBadge(item) {
      const sale = item.postTermSale || {};
      if (this.saleName(item) === 'Sold Out') {
        return {
          class: 'status-sold',
          icon: 'cil-check-circle',
          label: this.$i18n.locale === 'en' ? 'Sold Out' : 'ขายแล้ว'
        };
      }
      if (sale.needsReview) {
        return {
          class: 'status-danger',
          icon: 'cil-warning',
          label: this.$i18n.locale === 'en' ? 'Needs Review' : 'ต้องตรวจสอบ'
        };
      }
      if (sale.mode === 'standard_sale' || (sale.decision === 'continue_sale' && moment(sale.initialSaleEndsAt).isSameOrBefore(moment()))) {
        return {
          class: 'status-artist',
          icon: 'cil-check-circle',
          label: this.$i18n.locale === 'en' ? 'Continue Regular Sale' : 'ขายต่อแบบปกติ'
        };
      }
      if (sale.mode === 'display_only' || (sale.decision === 'display_only' && moment(sale.initialSaleEndsAt).isSameOrBefore(moment()))) {
        return {
          class: 'status-muted',
          icon: 'cil-eye',
          label: this.$i18n.locale === 'en' ? 'Display Only' : 'แสดงเฉย ๆ'
        };
      }
      if (sale.decision === 'continue_sale') {
        return {
          class: 'status-artist',
          icon: 'cil-clock',
          label: this.$i18n.locale === 'en' ? 'Waiting Term · Continue Sale' : 'รอครบกำหนด · ขายต่อ'
        };
      }
      return {
        class: 'status-customer',
        icon: 'cil-clock',
        label: this.$i18n.locale === 'en' ? 'Pending Decision' : 'รอคำตอบ'
      };
    },
    toggleSelection(item) {
      if (item.postTermSale && item.postTermSale.needsReview) return;
      const index = this.selectedIds.indexOf(item._id);
      if (index === -1) this.selectedIds.push(item._id);
      else this.selectedIds.splice(index, 1);
    },
    toggleSelectAll() {
      const ids = this.selectableFilteredItems.map(item => item._id);
      if (!ids.length) return;
      if (this.allFilteredSelected) {
        this.selectedIds = this.selectedIds.filter(id => !ids.includes(id));
      } else {
        this.selectedIds = [...new Set([...this.selectedIds, ...ids])];
      }
    },
    zoomImg(item) {
      this.zoomedImage = this.getImageUrl(item);
      this.zoomedTitle = this.titleOf(item);
      this.showZoomModal = true;
    },
    openDecision(item) {
      if (item.postTermSale && item.postTermSale.needsReview) return;
      this.selectedIds = [item._id];
      this.selectedItem = item;
      this.form = {
        decision: item.postTermSale && item.postTermSale.decision === 'display_only' ? 'display_only' : 'continue_sale',
        contactMethod: 'phone',
        note: ''
      };
      this.showModal = true;
    },
    openBulkDecision() {
      const first = this.items.find(item => this.selectedIds.includes(item._id));
      if (!first) return;
      this.selectedItem = first;
      this.form = {
        decision: 'continue_sale',
        contactMethod: 'phone',
        note: ''
      };
      this.showModal = true;
    },
    async saveDecision() {
      if (!this.selectedItem || !this.selectedIds.length || !this.form.decision) return;
      this.saving = true;
      try {
        await Service.artwork('post-term-decision', {
          artworkIds: this.selectedIds,
          decision: this.form.decision,
          contactMethod: this.form.contactMethod,
          note: this.form.note
        });
        this.showModal = false;
        this.selectedIds = [];
        await this.fetchItems();
        this.$store.commit('dialog/showToast', {
          title: this.$i18n.locale === 'en' ? 'Saved' : 'บันทึกเรียบร้อย',
          message: this.$i18n.locale === 'en' ? 'Updated post-term sale decision successfully.' : 'อัปเดตการขายหลังครบ 1 ปีเรียบร้อย',
          variant: 'success'
        });
      } catch (error) {
        this.$store.commit('dialog/showToast', {
          title: this.$i18n.locale === 'en' ? 'Save Failed' : 'บันทึกไม่สำเร็จ',
          message: error.response && error.response.data && error.response.data.data && error.response.data.data.error || (this.$i18n.locale === 'en' ? 'Please try again.' : 'กรุณาลองใหม่อีกครั้ง'),
          variant: 'danger'
        });
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.post-term-queue {
  color: #172b4d;
}

/* Admin Filter Card */
.admin-filter-card {
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #eef0f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

/* Queue Tab Pills */
.queue-tabs-wrapper {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.queue-tab-pill {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 50px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.queue-tab-pill:hover {
  background: #f8fafc;
  color: #8c1515;
  border-color: #cbd5e1;
}

.queue-tab-pill.active {
  background: #8c1515;
  border-color: #8c1515;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(140, 21, 21, 0.2);
}

.queue-badge-count {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 800;
  border-radius: 50px;
  background: #f1f5f9;
  color: #475569;
}

.queue-tab-pill.active .queue-badge-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Buttons */
.btn-select-all {
  background: #ffffff;
  color: #8c1515;
  border: 1px solid #e7c4c0;
  border-radius: 50px;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-select-all:hover:not(:disabled),
.btn-select-all[aria-pressed="true"] {
  background: #fff5f3;
  border-color: #8c1515;
}

.btn-select-all:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn-bulk-decision {
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  padding: 8px 18px;
  font-size: 0.82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
  transition: all 0.2s ease;
}

.btn-bulk-decision:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-reload-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reload-icon:hover {
  background: #f8fafc;
  color: #8c1515;
}

/* Search Box (Matching ArtworkFilter) */
.search-field-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  height: 42px;
  padding: 0 14px;
  transition: all 0.2s;
}

.search-field-wrapper:focus-within {
  border-color: #8c1515;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(140, 21, 21, 0.08);
}

.search-icon-fixed {
  color: #8c98a9;
  width: 16px;
  height: 16px;
  margin-right: 10px;
}

.search-input-plain {
  flex-grow: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.88rem;
  color: #1e293b;
}

.btn-clear-search {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
}

/* Table Card (Matching AdminTable) */
.artwork-table-card {
  border-radius: 12px;
  border: 1px solid #eef0f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  background: #ffffff;
  overflow: hidden;
}

.text-dark-blue {
  color: #172b4d !important;
  font-size: 0.95rem;
}

/* Thumbnail */
.thumbnail-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  background: #f1f5f9;
  flex: 0 0 48px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: #64748b;
  background: #e2e8f0;
}

.zoom-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.thumbnail-wrapper:hover .zoom-overlay {
  opacity: 1;
}

.code-badge-pill {
  font-family: var(--app-font-family);
  font-size: 0.75rem;
  font-weight: 700;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 2px 8px;
  border-radius: 6px;
}

.price-pill {
  font-size: 0.78rem;
  font-weight: 700;
  color: #8c1515;
}

/* Batch & Round Badges */
.batch-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.74rem;
  font-weight: 700;
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 2px 7px;
}

.year-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: #8c1515;
  background: #fff1f0;
  border: 1px solid #fee2e2;
  border-radius: 6px;
  padding: 2px 6px;
}

.round-title {
  color: #475569;
  display: flex;
  align-items: center;
  font-size: 0.78rem;
}

/* Countdown Badges */
.countdown-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
}

.badge-danger-soft { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.badge-warning-soft { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
.badge-info-soft { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
.badge-muted-soft { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 50px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-artist {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.status-customer {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.status-muted {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.status-sold {
  background-color: #f7f0ff;
  color: #805ad5;
  border: 1px solid #e9d8fd;
}

.status-danger {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Action Buttons */
.btn-decision-action {
  background: #8c1515 !important;
  color: #ffffff !important;
  border: none !important;
  font-weight: 700 !important;
  font-size: 0.8rem !important;
  border-radius: 50px !important;
  padding: 0.4rem 1rem !important;
  display: inline-flex !important;
  align-items: center !important;
  box-shadow: 0 2px 6px rgba(140, 21, 21, 0.2) !important;
  transition: all 0.2s ease !important;
}

.btn-decision-action:hover {
  background: #6e1010 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(140, 21, 21, 0.3) !important;
}

.custom-table-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #8c1515;
  cursor: pointer;
}

/* Modal Form Styles */
.modal-form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
}

.artwork-preview-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.preview-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 10px;
}

.preview-thumb-empty {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #e2e8f0;
  font-weight: 700;
  color: #64748b;
}

.decision-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.decision-select-card {
  width: 100%;
  color: inherit;
  text-align: left;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.decision-select-card:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.decision-select-card:focus-visible {
  outline: 3px solid #8c1515;
  outline-offset: 3px;
}

.decision-select-card.selected {
  border-color: #8c1515;
  background: #fffaf9;
  box-shadow: 0 4px 12px rgba(140, 21, 21, 0.08);
}

.decision-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex: 0 0 44px;
}

.bg-green-soft { background: #ecfdf5; color: #10b981; }
.bg-blue-soft { background: #eff6ff; color: #3b82f6; }

.decision-card-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #1e293b;
}

.decision-card-desc {
  font-size: 0.76rem;
  color: #64748b;
  margin-top: 2px;
}

.custom-select-field,
.custom-textarea-field {
  border: 1px solid #d8dee8;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1e293b;
}

.custom-select-field:focus,
.custom-textarea-field:focus {
  border-color: #8c1515;
  box-shadow: 0 0 0 3px rgba(140, 21, 21, 0.1);
}

.btn-save-primary {
  background: #8c1515 !important;
  border-color: #8c1515 !important;
}

.btn-save-primary:hover {
  background: #6e1010 !important;
  border-color: #6e1010 !important;
}

.spinner-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .decision-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
