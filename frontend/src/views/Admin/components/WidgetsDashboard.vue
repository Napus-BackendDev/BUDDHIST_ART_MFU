<template>
  <div>
    <CRow class="mb-4">
      <!-- Total Artworks -->
      <CCol sm="6" lg="4" class="mb-4 mb-lg-0">
        <CCard class="widget-card h-100">
          <CCardBody class="d-flex justify-content-between align-items-center p-4">
            <div>
              <div class="widget-title">{{ $i18n.locale === 'en' ? 'Total Artworks' : 'ผลงานทั้งหมด' }}</div>
              <div class="widget-value text-purple">{{ stats.summary.artworks }}</div>
            </div>
            <div class="icon-wrapper bg-purple-light text-purple">
              <CIcon name="cil-brush" size="xl" />
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Total Users -->
      <CCol sm="6" lg="4" class="mb-4 mb-lg-0">
        <CCard class="widget-card h-100">
          <CCardBody class="d-flex justify-content-between align-items-center p-4">
            <div>
              <div class="widget-title">{{ $i18n.locale === 'en' ? 'Total Users' : 'ผู้ใช้งานทั้งหมด' }}</div>
              <div class="widget-value text-blue">{{ stats.summary.users }}</div>
            </div>
            <div class="icon-wrapper bg-blue-light text-blue">
              <CIcon name="cil-people" size="xl" />
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Total Orders -->
      <CCol sm="6" lg="4">
        <CCard class="widget-card h-100">
          <CCardBody class="d-flex justify-content-between align-items-center p-4">
            <div>
              <div class="widget-title">{{ $i18n.locale === 'en' ? 'Total Orders' : 'คำสั่งซื้อทั้งหมด' }}</div>
              <div class="widget-value text-orange">{{ stats.summary.orders }}</div>
            </div>
            <div class="icon-wrapper bg-orange-light text-orange">
              <CIcon name="cil-cart" size="xl" />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow>
      <CCol md="6">
        <CCard>
          <CCardHeader>{{ $i18n.locale === 'en' ? 'Artworks Status Distribution' : 'สัดส่วนสถานะของผลงาน' }}</CCardHeader>
          <CCardBody>
            <CChartPie
              :datasets="statusChartData.datasets"
              :labels="statusChartData.labels"
              :options="{ maintainAspectRatio: false }"
              style="height: 300px"
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md="6">
        <CCard>
          <CCardHeader>{{ $i18n.locale === 'en' ? 'Artworks per Category' : 'จำนวนผลงานแบ่งตามหมวดหมู่' }}</CCardHeader>
          <CCardBody>
            <CChartBar
              :datasets="categoryChartData.datasets"
              :labels="categoryChartData.labels"
              :options="{ maintainAspectRatio: false, legend: { display: false } }"
              style="height: 300px"
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { CChartBar, CChartPie } from '@coreui/vue-chartjs'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'WidgetsDashboard',
  components: {
    CChartBar,
    CChartPie
  },
  computed: {
    ...mapState('dashboard', ['stats', 'loading']),
    statusChartData() {
      const data = this.stats.charts.status.map(item => item.count)
      const labels = this.stats.charts.status.map(item => {
        const statusMap = {
          approved: { en: 'Approved', th: 'อนุมัติแล้ว' },
          pending: { en: 'Pending', th: 'รอตรวจสอบ' },
          rejected: { en: 'Rejected', th: 'ปฏิเสธ' }
        }
        const lower = (item._id || '').toLowerCase()
        if (statusMap[lower]) {
          return statusMap[lower][this.$i18n.locale]
        }
        return item._id || (this.$i18n.locale === 'en' ? 'No Data' : 'ไม่มีข้อมูล')
      })
      return {
        labels: labels.length ? labels : [this.$i18n.locale === 'en' ? 'No Data' : 'ไม่มีข้อมูล'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            data: data.length ? data : [0]
          }
        ]
      }
    },
    categoryChartData() {
      const data = this.stats.charts.category.map(item => item.count)
      const labels = this.stats.charts.category.map(item => {
        const categoryMap = {
          painting: { en: 'Painting', th: 'จิตรกรรม' },
          sculpture: { en: 'Sculpture', th: 'ประติมากรรม' },
          'digital art': { en: 'Digital Art', th: 'ศิลปะดิจิทัล' },
          photography: { en: 'Photography', th: 'ภาพถ่าย' }
        }
        const lower = (item._id || '').toLowerCase()
        if (categoryMap[lower]) {
          return categoryMap[lower][this.$i18n.locale]
        }
        return item._id || (this.$i18n.locale === 'en' ? 'No Data' : 'ไม่มีข้อมูล')
      })
      return {
        labels: labels.length ? labels : [this.$i18n.locale === 'en' ? 'No Data' : 'ไม่มีข้อมูล'],
        datasets: [
          {
            label: this.$i18n.locale === 'en' ? 'Artworks' : 'ผลงานศิลปะ',
            backgroundColor: '#f87979',
            data: data.length ? data : [0]
          }
        ]
      }
    }
  },
  methods: {
    ...mapActions('dashboard', ['getStats'])
  },
  mounted() {
    this.getStats()
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border: 1px solid #eef0f3;
}
.card-header {
  background-color: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 600;
  color: #3c4b64;
}

/* Custom stats widgets matching assignment & order widgets */
.widget-card {
  border-radius: 12px;
  border: 1px solid #eef0f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  height: 100%;
  margin-bottom: 0;
  background-color: #ffffff;
}

.widget-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.widget-title {
  color: #6b778c;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.widget-value {
  color: #172b4d;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-purple-light {
  background-color: #f5f0ff;
}
.text-purple {
  color: #6f42c1;
}

.bg-blue-light {
  background-color: #f0f4ff;
}
.text-blue {
  color: #3f6ad8;
}

.bg-orange-light {
  background-color: #fff6e8;
}
.text-orange {
  color: #d97706;
}
</style>
