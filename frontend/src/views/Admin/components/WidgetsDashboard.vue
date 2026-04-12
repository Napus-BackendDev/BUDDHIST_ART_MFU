<template>
  <div>
    <CRow>
      <CCol sm="6" lg="4">
        <CWidgetDropdown
          color="primary"
          :header="stats.summary.artworks.toString()"
          text="Total Artworks"
          class="pb-4 mb-4"
        >
          <template #default>
            <div class="chart-wrapper mt-3 mx-3" style="height:70px">
              <CChartLine
                :datasets="[{ data: [1, 2, 1, 3, 2, 4, 3], label: 'New Artworks', backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,.55)', pointBackgroundColor: 'primary' }]"
                :options="{ maintainAspectRatio: false, legend: { display: false }, scales: { xAxes: [{ display: false }], yAxes: [{ display: false }] } }"
                labels="months"
              />
            </div>
          </template>
        </CWidgetDropdown>
      </CCol>
      <CCol sm="6" lg="4">
        <CWidgetDropdown
          color="info"
          :header="stats.summary.users.toString()"
          text="Total Users"
          class="pb-4 mb-4"
        >
          <template #default>
            <div class="chart-wrapper mt-3 mx-3" style="height:70px">
              <CChartLine
                :datasets="[{ data: [15, 20, 18, 25, 22, 30, 28], label: 'New Users', backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,.55)', pointBackgroundColor: 'info' }]"
                :options="{ maintainAspectRatio: false, legend: { display: false }, scales: { xAxes: [{ display: false }], yAxes: [{ display: false }] } }"
                labels="months"
              />
            </div>
          </template>
        </CWidgetDropdown>
      </CCol>
      <CCol sm="6" lg="4">
        <CWidgetDropdown
          color="warning"
          :header="stats.summary.orders.toString()"
          text="Total Orders"
          class="pb-4 mb-4"
        >
          <template #default>
            <div class="chart-wrapper mt-3 mx-3" style="height:70px">
              <CChartLine
                :datasets="[{ data: [5, 10, 8, 15, 12, 20, 18], label: 'Orders', backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,.55)', pointBackgroundColor: 'warning' }]"
                :options="{ maintainAspectRatio: false, legend: { display: false }, scales: { xAxes: [{ display: false }], yAxes: [{ display: false }] } }"
                labels="months"
              />
            </div>
          </template>
        </CWidgetDropdown>
      </CCol>
    </CRow>

    <CRow>
      <CCol md="6">
        <CCard>
          <CCardHeader>Artworks Status Distribution</CCardHeader>
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
          <CCardHeader>Artworks per Category</CCardHeader>
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
import { CChartLine, CChartBar, CChartPie } from '@coreui/vue-chartjs'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'WidgetsDashboard',
  components: {
    CChartLine,
    CChartBar,
    CChartPie
  },
  computed: {
    ...mapState('dashboard', ['stats', 'loading']),
    statusChartData() {
      const data = this.stats.charts.status.map(item => item.count)
      const labels = this.stats.charts.status.map(item => item._id)
      return {
        labels: labels.length ? labels : ['No Data'],
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
      const labels = this.stats.charts.category.map(item => item._id)
      return {
        labels: labels.length ? labels : ['No Data'],
        datasets: [
          {
            label: 'Artworks',
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
.chart-wrapper {
  transition: all 0.3s ease;
}
.card {
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}
.card-header {
  background-color: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 600;
  color: #3c4b64;
}
</style>
