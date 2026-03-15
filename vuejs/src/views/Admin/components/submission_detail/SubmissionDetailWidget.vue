<template>
  <CRow>
    <!-- Total Assignments -->
    <CCol sm="6" lg="3">
      <CCard class="widget-card">
        <CCardBody class="d-flex justify-content-between align-items-start">
          <div>
            <div class="text-value-lg text-dark font-weight-bold">4</div>
            <div class="text-muted text-uppercase font-weight-bold small">Total Assignments</div>
          </div>
          <div class="icon-wrapper bg-soft-blue">
            <CIcon name="cil-list" class="text-blue" />
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Students Enrolled -->
    <CCol sm="6" lg="3">
      <CCard class="widget-card">
        <CCardBody class="d-flex justify-content-between align-items-start">
          <div>
            <div class="text-value-lg text-dark font-weight-bold">45</div>
            <div class="text-muted text-uppercase font-weight-bold small">Students Enrolled</div>
          </div>
          <div class="icon-wrapper bg-soft-info">
            <CIcon name="cil-people" class="text-info" />
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Average Progress -->
    <CCol sm="6" lg="3">
      <CCard class="widget-card">
        <CCardBody class="d-flex justify-content-between align-items-start">
          <div>
            <div class="text-value-lg text-dark font-weight-bold">72%</div>
            <div class="text-muted text-uppercase font-weight-bold small">Avg. Progress</div>
          </div>
          <div class="icon-wrapper bg-soft-success">
            <CIcon name="cil-chart-line" class="text-success" />
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Pending Reviews -->
    <CCol sm="6" lg="3">
      <CCard class="widget-card">
        <CCardBody class="d-flex justify-content-between align-items-start">
          <div>
            <div class="text-value-lg text-dark font-weight-bold">12</div>
            <div class="text-muted text-uppercase font-weight-bold small">Pending Reviews</div>
          </div>
          <div class="icon-wrapper bg-soft-warning">
            <CIcon name="cil-clock" class="text-warning" />
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'SubmissionDetailWidget'
}
</script>

<style scoped>
.widget-card {
  border-radius: 12px;
  border: 1px solid #eef0f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.2s;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.widget-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  border-color: #d1d5db;
}

.icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-soft-blue { background-color: #ebf8ff; }
.text-blue { color: #3182ce; }

.bg-soft-info { background-color: #e0faff; }
.text-info { color: #00b8d9; }

.bg-soft-success { background-color: #f0fff4; }
.text-success { color: #38a169; }

.bg-soft-warning { background-color: #fffaf0; }
.text-warning { color: #d69e2e; }

.text-value-lg {
  font-size: 1.5rem;
}
</style>
