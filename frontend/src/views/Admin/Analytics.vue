<template>
  <div class="analytics-page">
    <section class="analytics-hero mb-4">
      <div class="analytics-hero__content">
        <div class="analytics-hero__icon"><CIcon name="cil-chart" size="xl" /></div>
        <div>
          <h1>{{ isEnglish ? 'Cohort Analytics' : 'วิเคราะห์ข้อมูลรายรุ่น' }}</h1>
          <p>{{ isEnglish ? 'Submission, artwork, learner and order insights for each cohort.' : 'วิเคราะห์ผลงาน ผู้เรียน และคำสั่งซื้อ โดยแยกข้อมูลเฉพาะแต่ละรุ่น' }}</p>
        </div>
      </div>

      <div class="analytics-toolbar">
        <label>
          <span>{{ isEnglish ? 'Cohort' : 'เลือกรุ่น' }}</span>
          <select v-model="selectedBatchKey" class="analytics-select">
            <option v-for="batch in batchOptions" :key="batch.key" :value="batch.key">
              {{ batchLabel(batch) }}
            </option>
          </select>
        </label>

        <div class="export-actions">
          <button class="export-btn export-btn--primary" :disabled="exporting || !hasSelectedBatch" @click="exportAll">
            <CSpinner v-if="exporting" size="sm" class="mr-1" />
            <CIcon v-else name="cil-cloud-download" />
            {{ exporting ? (isEnglish ? 'Exporting...' : 'กำลังส่งออก...') : (isEnglish ? 'Export all' : 'Export ทั้งหมด') }}
          </button>
          <button class="export-btn" :disabled="exporting || !filteredSubmissions.length" @click="exportSubmissions"><CSpinner v-if="exporting" size="sm" class="mr-1" />Submission</button>
          <button class="export-btn" :disabled="exporting || !filteredArtworks.length" @click="exportArtworks"><CSpinner v-if="exporting" size="sm" class="mr-1" />Artwork</button>
          <button class="export-btn" :disabled="exporting || !filteredOrders.length" @click="exportOrders"><CSpinner v-if="exporting" size="sm" class="mr-1" />Order</button>
        </div>
      </div>
    </section>

    <div v-if="loading" class="analytics-loading">
      <CSpinner color="danger" />
      <span>{{ isEnglish ? 'Loading analytics...' : 'กำลังโหลดข้อมูลวิเคราะห์...' }}</span>
    </div>

    <template v-else>
      <div v-if="!hasSelectedBatch" class="empty-state">
        <CIcon name="cil-chart" size="3xl" />
        <h3>{{ isEnglish ? 'No cohort data' : 'ยังไม่มีข้อมูลรุ่น' }}</h3>
        <p>{{ isEnglish ? 'Create a submission with academic year and cohort first.' : 'กรุณาสร้าง Submission ที่ระบุปีการศึกษาและรุ่นก่อน' }}</p>
      </div>

      <template v-else>
        <CRow class="widget-row">
          <CCol v-for="widget in widgets" :key="widget.key" sm="6" xl="3" class="mb-4">
            <article class="analytics-widget" :class="`analytics-widget--${widget.color}`">
              <div>
                <span>{{ widget.label }}</span>
                <strong>{{ widget.displayValue || widget.value.toLocaleString() }}</strong>
              </div>
              <div class="analytics-widget__icon"><CIcon :name="widget.icon" size="xl" /></div>
            </article>
          </CCol>
        </CRow>

        <CRow class="mb-4">
          <CCol lg="7" class="mb-4 mb-lg-0">
            <section class="analytics-card analytics-chart-card h-100">
              <header class="analytics-card__header">
                <div>
                  <h2>{{ isEnglish ? 'Artworks by category' : 'จำนวนผลงานแบ่งตามหมวดหมู่' }}</h2>
                  <p>{{ currentBatchLabel }}</p>
                </div>
                <span class="record-pill">{{ filteredArtworks.length }} {{ isEnglish ? 'items' : 'ผลงาน' }}</span>
              </header>
              <div v-if="categoryLabels.length" class="chart-wrap">
                <CChartBar :labels="categoryLabels" :datasets="categoryDatasets" :options="chartOptions" />
              </div>
              <div v-else class="chart-empty">{{ isEnglish ? 'No artwork data' : 'ไม่มีข้อมูลผลงานในรุ่นนี้' }}</div>
            </section>
          </CCol>

          <CCol lg="5">
            <section class="analytics-card cohort-summary h-100">
              <header class="analytics-card__header">
                <div>
                  <h2>{{ isEnglish ? 'Cohort summary' : 'สรุปข้อมูลรุ่น' }}</h2>
                  <p>{{ currentBatchLabel }}</p>
                </div>
              </header>
              <dl>
                <div><dt>{{ isEnglish ? 'Submissions' : 'Submission' }}</dt><dd>{{ filteredSubmissions.length }}</dd></div>
                <div><dt>{{ isEnglish ? 'Learners' : 'ผู้เรียนทั้งหมด' }}</dt><dd>{{ cohortLearners.length }}</dd></div>
                <div><dt>{{ isEnglish ? 'Orders' : 'คำสั่งซื้อ' }}</dt><dd>{{ filteredOrders.length }}</dd></div>
                <div><dt>{{ isEnglish ? 'Sales value' : 'มูลค่างานที่สั่งซื้อ' }}</dt><dd>฿{{ orderValue.toLocaleString() }}</dd></div>
              </dl>
            </section>
          </CCol>
        </CRow>

        <section class="analytics-card mb-4">
          <header class="analytics-card__header">
            <div>
              <h2>{{ isEnglish ? 'Orders in this cohort' : 'ตารางคำสั่งซื้อเฉพาะรุ่น' }}</h2>
              <p>{{ filteredOrders.length }} {{ isEnglish ? 'orders found' : 'รายการ' }}</p>
            </div>
            <button class="table-export" :disabled="exporting || !filteredOrders.length" @click="exportOrders">
              <CSpinner v-if="exporting" size="sm" class="mr-1" /><CIcon v-else name="cil-cloud-download" /> Excel
            </button>
          </header>
          <div class="table-responsive">
            <CDataTable :items="filteredOrders" :fields="orderFields" :items-per-page="8" :no-items-view="{ noItems: isEnglish ? 'No orders found' : 'ไม่พบคำสั่งซื้อ', noResults: isEnglish ? 'No matching orders' : 'ไม่พบคำสั่งซื้อที่ตรงกัน' }" pagination hover>
              <template #orderNumber="{ item }"><td><strong>{{ item.orderNumber || shortId(item._id) }}</strong></td></template>
              <template #customer="{ item }"><td>{{ item.contact && item.contact.name || '-' }}<small>{{ item.contact && item.contact.email || '' }}</small></td></template>
              <template #artworks="{ item }"><td>{{ orderArtworkNames(item) }}</td></template>
              <template #amount="{ item }"><td><strong>฿{{ orderTotal(item).toLocaleString() }}</strong></td></template>
              <template #status="{ item }"><td><span class="status-chip">{{ translatedName(item.status) || '-' }}</span></td></template>
              <template #createdAt="{ item }"><td>{{ formatDate(item.createdAt) }}</td></template>
            </CDataTable>
          </div>
        </section>

        <section class="analytics-card mb-4">
          <header class="analytics-card__header">
            <div>
              <h2>{{ isEnglish ? 'Artworks in this cohort' : 'ตารางผลงานศิลปะเฉพาะรุ่น' }}</h2>
              <p>{{ filteredArtworks.length }} {{ isEnglish ? 'artworks found' : 'ผลงาน' }}</p>
            </div>
            <button class="table-export" :disabled="exporting || !filteredArtworks.length" @click="exportArtworks">
              <CSpinner v-if="exporting" size="sm" class="mr-1" /><CIcon v-else name="cil-cloud-download" /> Excel
            </button>
          </header>
          <div class="table-responsive">
            <CDataTable :items="filteredArtworks" :fields="artworkFields" :items-per-page="8" :no-items-view="{ noItems: isEnglish ? 'No artworks found' : 'ไม่พบผลงานศิลปะ', noResults: isEnglish ? 'No matching artworks' : 'ไม่พบผลงานศิลปะที่ตรงกัน' }" pagination hover>
              <template #image="{ item }"><td><img class="artwork-thumb" :src="item.image || fallbackImage" :alt="translatedName(item)" /></td></template>
              <template #title="{ item }"><td><strong>{{ translatedName(item) || '-' }}</strong><small>{{ item.artworkCode || '-' }}</small></td></template>
              <template #artist="{ item }"><td>{{ translatedName(item.artist) || '-' }}<small>{{ item.artist && item.artist.studentId || '' }}</small></td></template>
              <template #category="{ item }"><td><span class="category-chip">{{ translatedName(item.category) || '-' }}</span></td></template>
              <template #price="{ item }"><td>฿{{ Number(item.price || 0).toLocaleString() }}</td></template>
              <template #saleStatus="{ item }"><td><span class="status-chip" :class="{ 'status-chip--sold': isSoldArtwork(item) }">{{ translatedName(item.status && item.status.sale) || '-' }}</span></td></template>
              <template #createdAt="{ item }"><td>{{ formatDate(item.createdAt) }}</td></template>
            </CDataTable>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script>
import { orderDocumentUrl } from '@/utils/orderDocuments'
import { CChartBar } from '@coreui/vue-chartjs';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';

export default {
  name: 'AdminAnalytics',
  components: { CChartBar },
  data() {
    return {
      loading: true,
      exporting: false,
      selectedBatchKey: '',
      submissions: [],
      artworks: [],
      orders: [],
      users: [],
      fallbackImage: 'https://via.placeholder.com/64/f5f1ed/7a3028?text=Art'
    };
  },
  computed: {
    isEnglish() { return this.$i18n.locale === 'en'; },
    batchOptions() {
      const batches = new Map();
      const add = (item) => {
        const courseLevel = String(item && item.courseLevel || '').trim();
        const academicYear = String(item && item.academicYear || '').trim();
        if (!courseLevel || courseLevel === '00') return;
        const key = `${academicYear}|${courseLevel}`;
        if (!batches.has(key)) batches.set(key, { key, academicYear, courseLevel });
      };
      // A cohort exists only when it has been created in Submission.
      // Artwork records inherit their cohort from that Submission and must not
      // create orphan cohort options in analytics.
      this.submissions.forEach(add);
      return Array.from(batches.values()).sort((a, b) => {
        const yearCompare = String(b.academicYear).localeCompare(String(a.academicYear), undefined, { numeric: true });
        return yearCompare || String(b.courseLevel).localeCompare(String(a.courseLevel), undefined, { numeric: true });
      });
    },
    selectedBatch() {
      return this.batchOptions.find(batch => batch.key === this.selectedBatchKey) || null;
    },
    hasSelectedBatch() { return Boolean(this.selectedBatch); },
    currentBatchLabel() { return this.selectedBatch ? this.batchLabel(this.selectedBatch) : '-'; },
    filteredSubmissions() { return this.submissions.filter(item => this.inSelectedBatch(item)); },
    filteredPublishedArtworks() { return this.artworks.filter(item => this.inSelectedBatch(item)); },
    submissionArtworks() {
      const rows = [];
      this.filteredSubmissions.forEach(submission => {
        (submission.assignments || []).forEach(assignment => {
          (assignment.artworks || []).forEach(artwork => rows.push({
            ...artwork,
            academicYear: String(submission.academicYear || ''),
            courseLevel: String(submission.courseLevel || ''),
            artist: artwork.owner || null,
            submissionId: submission._id,
            assignmentId: assignment._id
          }));
        });
      });
      return rows;
    },
    filteredArtworks() {
      const published = this.filteredPublishedArtworks;
      const publishedSubmissionIds = new Set(
        published.map(item => this.idOf(item.submissionArtworkId)).filter(Boolean)
      );
      const publishedIds = new Set(published.map(item => this.idOf(item)).filter(Boolean));
      const pendingOrUnpublished = this.submissionArtworks.filter(item => {
        const id = this.idOf(item);
        return id && !publishedIds.has(id) && !publishedSubmissionIds.has(id);
      });
      return [...published, ...pendingOrUnpublished];
    },
    filteredOrders() {
      const artworkIds = new Set(this.filteredArtworks.map(item => this.idOf(item)));
      return this.orders.filter(order => (order.artwork || []).some(art => artworkIds.has(this.idOf(art))));
    },
    cohortLearners() {
      const ids = new Set();
      this.filteredSubmissions.forEach(submission => (submission.artist || []).forEach(artist => ids.add(this.idOf(artist))));
      // Imported artwork may retain its owner even when Submission.artist is incomplete.
      this.filteredArtworks.forEach(artwork => {
        const owner = artwork.artist || artwork.owner;
        const ownerId = this.idOf(owner);
        if (ownerId) ids.add(ownerId);
      });
      const learners = this.users.filter(user => ids.has(this.idOf(user)));
      const knownIds = new Set(learners.map(user => this.idOf(user)));
      this.filteredArtworks.forEach(artwork => {
        const owner = artwork.artist || artwork.owner;
        const ownerId = this.idOf(owner);
        if (owner && ownerId && !knownIds.has(ownerId)) {
          learners.push(owner);
          knownIds.add(ownerId);
        }
      });
      return learners;
    },
    newLearners() { return this.cohortLearners.filter(user => this.statusText(user).includes('newstudent')); },
    oldLearners() { return this.cohortLearners.filter(user => this.statusText(user).includes('oldstudent')); },
    soldArtworkIds() {
      const cohortIds = new Set(this.filteredArtworks.map(item => this.idOf(item)));
      const ids = new Set(this.filteredArtworks.filter(item => this.isSoldArtwork(item)).map(item => this.idOf(item)));
      this.filteredOrders.filter(order => this.isApprovedOrder(order)).forEach(order => (order.artwork || []).forEach(art => {
        const artworkId = this.idOf(art);
        if (cohortIds.has(artworkId)) ids.add(artworkId);
      }));
      return ids;
    },
    widgets() {
      return [
        { key: 'users', label: this.isEnglish ? 'Users' : 'จำนวนผู้ใช้', value: this.cohortLearners.length, icon: 'cil-people', color: 'slate' },
        { key: 'artworks', label: this.isEnglish ? 'Artworks' : 'จำนวนผลงาน', value: this.filteredArtworks.length, icon: 'cil-brush', color: 'wine' },
        { key: 'value', label: this.isEnglish ? 'Artwork value' : 'มูลค่าผลงาน', value: this.artworkValue, displayValue: `฿${this.artworkValue.toLocaleString()}`, icon: 'cil-money', color: 'gold' },
        { key: 'sold', label: this.isEnglish ? 'Sold' : 'จำหน่ายได้', value: this.soldArtworkIds.size, icon: 'cil-cart', color: 'green' }
      ];
    },
    categorySummary() {
      const summary = new Map();
      this.filteredArtworks.forEach(artwork => {
        const name = this.translatedName(artwork.category) || (this.isEnglish ? 'Uncategorized' : 'ไม่ระบุหมวดหมู่');
        summary.set(name, (summary.get(name) || 0) + 1);
      });
      return Array.from(summary.entries()).sort((a, b) => b[1] - a[1]);
    },
    categoryLabels() { return this.categorySummary.map(item => item[0]); },
    categoryDatasets() {
      return [{
        label: this.isEnglish ? 'Artworks' : 'จำนวนผลงาน',
        backgroundColor: ['#7a3028', '#a85f40', '#c8954d', '#876f5f', '#566a65', '#a37b73'],
        barPercentage: 0.68,
        categoryPercentage: 0.72,
        maxBarThickness: 72,
        borderRadius: 8,
        data: this.categorySummary.map(item => item[1])
      }];
    },
    chartOptions() {
      const highestCategoryCount = Math.max(0, ...this.categorySummary.map(item => item[1]));
      return {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        layout: { padding: { top: 12, right: 8, bottom: 0, left: 0 } },
        tooltips: {
          displayColors: false,
          callbacks: {
            label: tooltipItem => `${tooltipItem.yLabel} ${this.isEnglish ? 'artworks' : 'ผลงาน'}`
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              precision: 0,
              stepSize: 1,
              suggestedMax: Math.max(2, highestCategoryCount + 1)
            },
            gridLines: { color: 'rgba(74, 53, 47, .08)', drawBorder: false }
          }],
          xAxes: [{
            gridLines: { display: false, drawBorder: false },
            ticks: { autoSkip: false, maxRotation: 0, minRotation: 0 }
          }]
        }
      };
    },
    artworkValue() { return this.filteredArtworks.reduce((sum, artwork) => sum + Number(artwork.price || 0), 0); },
    orderValue() { return this.filteredOrders.reduce((sum, order) => sum + this.orderTotal(order), 0); },
    orderFields() {
      return [
        { key: 'orderNumber', label: this.isEnglish ? 'Order' : 'เลขคำสั่งซื้อ' },
        { key: 'customer', label: this.isEnglish ? 'Customer' : 'ผู้สั่งซื้อ' },
        { key: 'artworks', label: this.isEnglish ? 'Artworks' : 'ผลงาน' },
        { key: 'amount', label: this.isEnglish ? 'Amount' : 'ยอดรวม' },
        { key: 'status', label: this.isEnglish ? 'Status' : 'สถานะ' },
        { key: 'createdAt', label: this.isEnglish ? 'Date' : 'วันที่' }
      ];
    },
    artworkFields() {
      return [
        { key: 'image', label: this.isEnglish ? 'Image' : 'รูปภาพ' },
        { key: 'title', label: this.isEnglish ? 'Artwork' : 'ผลงาน' },
        { key: 'artist', label: this.isEnglish ? 'Learner / Artist' : 'ผู้เรียน / ศิลปิน' },
        { key: 'category', label: this.isEnglish ? 'Category' : 'หมวดหมู่' },
        { key: 'price', label: this.isEnglish ? 'Price' : 'ราคา' },
        { key: 'saleStatus', label: this.isEnglish ? 'Sale status' : 'สถานะการขาย' },
        { key: 'createdAt', label: this.isEnglish ? 'Created' : 'วันที่สร้าง' }
      ];
    }
  },
  watch: {
    '$store.state.submission.submissions': {
      handler(value) { this.submissions = value || []; }
    },
    '$store.state.artwork.artworks': {
      handler(value) { this.artworks = value || []; }
    },
    '$store.state.order.orders': {
      handler(value) { this.orders = value || []; }
    },
    '$store.state.user.user': {
      handler(value) { this.users = value || []; }
    },
    batchOptions: {
      immediate: true,
      handler(options) {
        if (options.length && !options.some(item => item.key === this.selectedBatchKey)) this.selectedBatchKey = options[0].key;
      }
    }
  },
  async created() {
    await this.loadAnalytics();
  },
  methods: {
    async loadAnalytics() {
      this.loading = true;
      try {
        const [submissions, artworks, orders, users] = await Promise.all([
          this.$store.dispatch('submission/get'),
          this.$store.dispatch('artwork/get'),
          this.$store.dispatch('order/get'),
          this.$store.dispatch('user/get')
        ]);
        this.submissions = submissions || [];
        this.artworks = artworks || [];
        this.orders = orders || [];
        this.users = users || [];
      } catch (error) {
        console.error('Unable to load cohort analytics:', error);
        this.$store.commit('dialog/showToast', {
          title: this.isEnglish ? 'Unable to load analytics' : 'โหลดข้อมูลวิเคราะห์ไม่สำเร็จ',
          message: error.message,
          variant: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    idOf(value) { return String(value && (value._id || value) || ''); },
    inSelectedBatch(item) {
      if (!this.selectedBatch) return false;
      const sameCourse = String(item.courseLevel || '') === this.selectedBatch.courseLevel;
      const selectedYear = this.selectedBatch.academicYear;
      return sameCourse && (!selectedYear || String(item.academicYear || '') === selectedYear);
    },
    batchLabel(batch) {
      const cohort = this.isEnglish ? `Cohort ${batch.courseLevel}` : `รุ่น ${batch.courseLevel}`;
      if (!batch.academicYear) return cohort;
      return `${cohort} · ${this.isEnglish ? 'Academic year' : 'ปีการศึกษา'} ${batch.academicYear}`;
    },
    translatedName(item, locale = this.$i18n.locale) {
      if (!item) return '';
      if (typeof item === 'string') return item;
      const field = item.title || item.name;
      if (typeof field === 'string') return field;
      if (Array.isArray(field)) return (field.find(value => value.key === locale) || field.find(value => value.value) || {}).value || '';
      return '';
    },
    statusText(user) {
      return `${this.translatedName(user.status, 'en')} ${this.translatedName(user.status, 'th')}`.toLowerCase().replace(/\s/g, '');
    },
    isSoldArtwork(artwork) {
      const status = `${this.translatedName(artwork && artwork.status && artwork.status.sale, 'en')} ${this.translatedName(artwork && artwork.status && artwork.status.sale, 'th')}`.toLowerCase();
      return status.includes('sold out') || status.includes('ขายแล้ว');
    },
    shortId(id) { return String(id || '').slice(-8).toUpperCase(); },
    formatDate(value) { return value ? moment(value).format('DD/MM/YYYY') : '-'; },
    cohortOrderArtworks(order) {
      const cohortIds = new Set(this.filteredArtworks.map(item => this.idOf(item)));
      return (order.artwork || []).filter(artwork => cohortIds.has(this.idOf(artwork)));
    },
    orderTotal(order) { return this.cohortOrderArtworks(order).reduce((sum, artwork) => sum + Number(artwork.price || 0), 0); },
    orderArtworkNames(order) { return this.cohortOrderArtworks(order).map(item => this.translatedName(item) || item.artworkCode).filter(Boolean).join(', ') || '-'; },
    workbookFileName(type) {
      const batch = this.selectedBatch || { academicYear: '', courseLevel: '' };
      return `${type}_AY${batch.academicYear || 'NA'}_Cohort${batch.courseLevel}_${moment().format('YYYYMMDD_HHmm')}.xlsx`;
    },
    apiBaseUrl() {
      return String(process.env.VUE_APP_API_URL || window.location.origin).replace(/\/+$/, '');
    },
    absoluteAssetUrl(value) {
      const raw = String(value || '').trim();
      if (!raw) return '';
      if (/^(?:https?:|data:|blob:)/i.test(raw)) return raw;
      return `${this.apiBaseUrl()}/${raw.replace(/^\/+/, '')}`;
    },
    sanitizeForPath(value) {
      return String(value || '').trim()
        .replace(/\s+/g, '_')
        .replace(/[/\\?%*:|"<>]/g, '');
    },
    isApprovedOrder(order) {
      return statusBadgeMixin.methods.getOrderStatusGroup(order && order.status) === 'Completed';
    },
    orderFileUrl(order, type) {
      if (!order) return '';
      if (type === 'invoice' || (type === 'certificate' && this.isApprovedOrder(order))) return orderDocumentUrl(order, type);
      return '';
    },
    async refreshCertificates(orders) {
      const token = this.$store && this.$store.state ? this.$store.state.xAccessToken : '';
      const approvedOrders = orders.filter(order => this.isApprovedOrder(order) && order._id);
      await Promise.all(approvedOrders.map(async order => {
        try {
          const response = await fetch(`${this.apiBaseUrl()}/api/v1/order/certificate/${order._id}`, {
            headers: token ? {
              'X-Access-Token': token,
              Authorization: `Bearer ${token}`
            } : {}
          });
          if (!response.ok) throw new Error(`Certificate refresh returned HTTP ${response.status}`);
        } catch (error) {
          console.warn(`Certificate refresh failed for order ${order._id}:`, error);
        }
      }));
    },
    imageFormulaCell(image) {
      const url = String(image.url || '').replace(/"/g, '""');
      const alt = String(image.alt || 'Image').replace(/"/g, '""');
      return {
        f: `IMAGE("${url}","${alt}",0)`,
        v: '',
        l: { Target: image.url, Tooltip: alt }
      };
    },
    fitColumns(worksheet, rows, headers, imageKeys, linkKeys) {
      worksheet['!cols'] = headers.map(key => {
        if (imageKeys.includes(key)) return { wch: 18 };
        if (linkKeys.includes(key)) return { wch: 22 };
        const longest = rows.reduce((max, row) => Math.max(max, String(row[key] == null ? '' : row[key]).length), key.length);
        return { wch: Math.min(45, Math.max(10, longest + 2)) };
      });
      if (rows.length) {
        worksheet['!rows'] = [{ hpx: 26 }, ...rows.map(row => ({ hpx: row.__images && row.__images.length ? 96 : 20 }))];
      }
    },
    appendSheet(workbook, rows, name) {
      const imageKeys = [];
      const linkKeys = [];
      rows.forEach(row => {
        (row.__images || []).forEach(image => {
          if (image.key && !imageKeys.includes(image.key)) imageKeys.push(image.key);
        });
        (row.__links || []).forEach(link => {
          if (link.key && !linkKeys.includes(link.key)) linkKeys.push(link.key);
        });
      });

      const dataRows = rows.length ? rows.map(row => {
        const cleanRow = {};
        Object.keys(row).forEach(key => {
          if (!key.startsWith('__')) cleanRow[key] = row[key];
        });
        imageKeys.forEach(key => { if (!(key in cleanRow)) cleanRow[key] = ''; });
        linkKeys.forEach(key => { if (!(key in cleanRow)) cleanRow[key] = ''; });
        return cleanRow;
      }) : [{ Message: this.isEnglish ? 'No data' : 'ไม่มีข้อมูล' }];
      const worksheet = XLSX.utils.json_to_sheet(dataRows);
      const headers = Object.keys(dataRows[0]);
      const columnIndex = new Map(headers.map((header, index) => [header, index]));

      rows.forEach((row, rowIndex) => {
        (row.__images || []).forEach(image => {
          const column = columnIndex.get(image.key);
          if (!image.url || column === undefined) return;
          worksheet[XLSX.utils.encode_cell({ r: rowIndex + 1, c: column })] = this.imageFormulaCell(image);
        });
        (row.__links || []).forEach(link => {
          const column = columnIndex.get(link.key);
          if (!link.url || column === undefined) return;
          worksheet[XLSX.utils.encode_cell({ r: rowIndex + 1, c: column })] = {
            t: 's',
            v: link.label || 'Open file',
            l: { Target: link.url, Tooltip: link.label || 'Open file' }
          };
        });
      });

      this.fitColumns(worksheet, rows, headers, imageKeys, linkKeys);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    },
    submissionRows() {
      const rows = [];
      this.filteredSubmissions.forEach(submission => {
        const learners = (submission.artist || []).map(user => this.translatedName(user) || user.studentId).join(', ');
        if (!(submission.assignments || []).length) {
          rows.push({ AcademicYear: submission.academicYear, Cohort: submission.courseLevel, Submission: this.translatedName(submission), Assignment: '-', Learners: learners, ArtworkCount: 0, __images: [] });
          return;
        }
        submission.assignments.forEach(assignment => {
          const artworks = assignment.artworks || [];
          rows.push({
            AcademicYear: submission.academicYear,
            Cohort: submission.courseLevel,
            Submission: this.translatedName(submission),
            Assignment: this.translatedName(assignment),
            Learners: learners,
            ArtworkCount: artworks.length,
            StartDate: this.formatDate(assignment.create && assignment.create.startAt),
            EndDate: this.formatDate(assignment.create && assignment.create.endAt),
            __images: artworks.filter(artwork => artwork && artwork.image).map((artwork, index) => ({
              key: `ArtworkImage${index + 1}`,
              url: this.absoluteAssetUrl(artwork.image),
              alt: this.translatedName(artwork) || `Artwork ${index + 1}`
            }))
          });
        });
      });
      return rows;
    },
    artworkRows() {
      return this.filteredArtworks.map(artwork => ({
        AcademicYear: artwork.academicYear,
        Cohort: artwork.courseLevel,
        ArtworkCode: artwork.artworkCode || '',
        TitleTH: this.translatedName(artwork, 'th'),
        TitleEN: this.translatedName(artwork, 'en'),
        LearnerArtist: this.translatedName(artwork.artist),
        StudentId: artwork.artist && artwork.artist.studentId || '',
        Category: this.translatedName(artwork.category),
        Price: Number(artwork.price || 0),
        SaleStatus: this.translatedName(artwork.status && artwork.status.sale),
        CreatedAt: this.formatDate(artwork.createdAt),
        __images: artwork.image ? [{
          key: 'ArtworkImage',
          url: this.absoluteAssetUrl(artwork.image),
          alt: this.translatedName(artwork) || artwork.artworkCode || 'Artwork'
        }] : []
      }));
    },
    orderRows() {
      return this.filteredOrders.map(order => {
        const artworks = this.cohortOrderArtworks(order);
        const links = [];
        const invoiceUrl = this.orderFileUrl(order, 'invoice');
        const certificateUrl = this.orderFileUrl(order, 'certificate');
        if (invoiceUrl) links.push({ key: 'InvoiceFile', url: invoiceUrl, label: 'Open Invoice' });
        if (certificateUrl) links.push({ key: 'CertificateFile', url: certificateUrl, label: 'Open Certificate' });
        const images = artworks.filter(artwork => artwork && artwork.image).map((artwork, index) => ({
          key: `ArtworkImage${index + 1}`,
          url: this.absoluteAssetUrl(artwork.image),
          alt: this.translatedName(artwork) || `Artwork ${index + 1}`
        }));
        if (order.image) images.push({ key: 'PaymentSlipImage', url: this.absoluteAssetUrl(order.image), alt: 'Payment slip' });
        return {
          OrderNumber: order.orderNumber || this.shortId(order._id),
          Customer: order.contact && order.contact.name || '',
          Email: order.contact && order.contact.email || '',
          ArtworkCodes: artworks.map(artwork => artwork.artworkCode).filter(Boolean).join(', '),
          Artworks: this.orderArtworkNames(order),
          Amount: this.orderTotal(order),
          Status: this.translatedName(order.status),
          CreatedAt: this.formatDate(order.createdAt),
          __images: images,
          __links: links
        };
      });
    },
    async exportWorkbook(type, sheets) {
      this.exporting = true;
      try {
        if (type === 'Orders' || type === 'Analytics') await this.refreshCertificates(this.filteredOrders);
        const workbook = XLSX.utils.book_new();
        sheets.forEach(sheet => this.appendSheet(workbook, sheet.rows, sheet.name));
        XLSX.writeFile(workbook, this.workbookFileName(type));
      } finally {
        this.exporting = false;
      }
    },
    exportSubmissions() { return this.exportWorkbook('Submissions', [{ name: 'Submissions', rows: this.submissionRows() }]); },
    exportArtworks() { return this.exportWorkbook('Artworks', [{ name: 'Artworks', rows: this.artworkRows() }]); },
    exportOrders() { return this.exportWorkbook('Orders', [{ name: 'Orders', rows: this.orderRows() }]); },
    exportAll() {
      return this.exportWorkbook('Analytics', [
        { name: 'Submissions', rows: this.submissionRows() },
        { name: 'Artworks', rows: this.artworkRows() },
        { name: 'Orders', rows: this.orderRows() }
      ]);
    }
  }
};
</script>

<style scoped>
.analytics-page { --wine: #7a3028; --ink: #2f3a4c; --muted: #7c8493; padding-bottom: 2rem; }
.analytics-hero { padding: 1.5rem 1.65rem; background: linear-gradient(135deg, #fff 0%, #fbf7f3 100%); border: 1px solid rgba(122,48,40,.1); border-radius: 20px; box-shadow: 0 14px 38px rgba(65,44,37,.06); }
.analytics-hero__content, .analytics-toolbar, .export-actions { display: flex; align-items: center; }
.analytics-hero__content { gap: 1rem; }
.analytics-hero__icon { display: grid; place-items: center; width: 52px; height: 52px; color: var(--wine); background: #f8ece8; border-radius: 15px; }
.analytics-hero h1 { margin: 0; color: var(--ink); font-size: 1.55rem; font-weight: 800; }
.analytics-hero p { margin: .25rem 0 0; color: var(--muted); }
.analytics-toolbar { justify-content: space-between; gap: 1rem; margin-top: 1.35rem; padding-top: 1.2rem; border-top: 1px solid rgba(122,48,40,.08); }
.analytics-toolbar label { display: flex; align-items: center; gap: .75rem; margin: 0; color: #5b6270; font-weight: 700; }
.analytics-select { min-width: 260px; height: 43px; padding: 0 2.5rem 0 .9rem; color: var(--ink); background: #fff; border: 1px solid #ded8d3; border-radius: 11px; outline: none; transition: all .3s cubic-bezier(.4,0,.2,1); }
.analytics-select:focus { border-color: #a85f40; box-shadow: 0 0 0 3px rgba(168,95,64,.12); }
.export-actions { flex-wrap: wrap; justify-content: flex-end; gap: .5rem; }
.export-btn, .table-export { min-height: 40px; padding: .55rem .9rem; color: #633b34; background: #fff; border: 1px solid #decfc9; border-radius: 10px; font-weight: 700; transition: all .3s cubic-bezier(.4,0,.2,1); }
.export-btn:hover:not(:disabled), .table-export:hover:not(:disabled) { color: #fff; background: #8a3a31; border-color: #8a3a31; transform: translateY(-1px); }
.export-btn--primary { color: #fff; background: linear-gradient(135deg, #8f3b31, #6f261f); border-color: transparent; }
button:disabled { cursor: not-allowed; opacity: .45; }
.analytics-loading, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 380px; gap: 1rem; color: var(--muted); }
.empty-state h3, .empty-state p { margin: 0; }
.analytics-widget { display: flex; align-items: center; justify-content: space-between; height: 100%; min-height: 130px; padding: 1.35rem; background: #fff; border: 1px solid #ece7e3; border-radius: 18px; box-shadow: 0 12px 30px rgba(56,42,36,.06); transition: all .3s cubic-bezier(.4,0,.2,1); }
.analytics-widget:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(56,42,36,.1); }
.analytics-widget span { display: block; color: var(--muted); font-size: .88rem; font-weight: 700; }
.analytics-widget strong { display: block; margin-top: .4rem; color: var(--ink); font-size: 2rem; line-height: 1; }
.analytics-widget__icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px; }
.analytics-widget--wine .analytics-widget__icon { color: #7a3028; background: #f8eae7; }
.analytics-widget--gold .analytics-widget__icon { color: #a66b17; background: #fff3db; }
.analytics-widget--slate .analytics-widget__icon { color: #536377; background: #edf1f5; }
.analytics-widget--green .analytics-widget__icon { color: #477065; background: #e9f3ef; }
.analytics-card { overflow: hidden; background: #fff; border: 1px solid #ece7e3; border-radius: 18px; box-shadow: 0 12px 30px rgba(56,42,36,.05); }
.analytics-card__header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.25rem 1.4rem; border-bottom: 1px solid #f0ece9; }
.analytics-card__header h2 { margin: 0; color: var(--ink); font-size: 1.05rem; font-weight: 800; }
.analytics-card__header p { margin: .25rem 0 0; color: var(--muted); font-size: .82rem; }
.record-pill, .category-chip, .status-chip { display: inline-flex; padding: .32rem .7rem; white-space: nowrap; border-radius: 999px; font-size: .75rem; font-weight: 700; }
.record-pill { color: #7a3028; background: #f8ece8; }
.chart-wrap { position: relative; height: 330px; padding: 1.2rem 1.35rem 1.35rem; }
.chart-wrap >>> div, .chart-wrap >>> canvas { width: 100% !important; height: 100% !important; }
.chart-empty { display: grid; place-items: center; height: 330px; color: var(--muted); }
.cohort-summary dl { margin: 0; padding: .7rem 1.4rem 1.4rem; }
.cohort-summary dl div { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px dashed #e8e2de; }
.cohort-summary dl div:last-child { border: 0; }
.cohort-summary dt { color: #606977; font-weight: 600; }
.cohort-summary dd { margin: 0; color: var(--wine); font-size: 1.1rem; font-weight: 800; }
.table-responsive { padding: .25rem 1rem 1rem; }
.analytics-card >>> table { min-width: 850px; }
.analytics-card >>> thead th { color: #6d7481; background: #faf9f8; border: 0; font-size: .72rem; letter-spacing: .035em; text-transform: uppercase; }
.analytics-card >>> tbody td { vertical-align: middle; border-color: #f0ece9; color: #4c5564; }
.analytics-card td small { display: block; margin-top: .2rem; color: #9299a4; }
.artwork-thumb { width: 52px; height: 52px; object-fit: cover; border: 1px solid #eee7e2; border-radius: 11px; }
.category-chip { color: #6b514a; background: #f4efec; }
.status-chip { color: #536377; background: #edf1f5; }
.status-chip--sold { color: #376658; background: #e5f3ed; }
.table-export { min-height: 36px; padding: .42rem .75rem; font-size: .8rem; }
@media (max-width: 991.98px) { .analytics-toolbar { align-items: stretch; flex-direction: column; } .export-actions { justify-content: flex-start; } }
@media (max-width: 575.98px) { .analytics-hero { padding: 1.1rem; border-radius: 15px; } .analytics-hero__content { align-items: flex-start; } .analytics-hero h1 { font-size: 1.25rem; } .analytics-toolbar label { align-items: stretch; flex-direction: column; gap: .4rem; } .analytics-select { width: 100%; min-width: 0; } .export-actions { display: grid; grid-template-columns: 1fr 1fr; } .export-btn { width: 100%; } .analytics-card__header { align-items: flex-start; } .chart-wrap { height: 280px; padding: 1rem .65rem 1.15rem; } }
</style>
