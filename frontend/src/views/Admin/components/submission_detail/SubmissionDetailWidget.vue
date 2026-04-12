<template>
  <CRow class="mb-4">
    <!-- Total Assignments -->
    <CCol sm="6" lg="3" @click="$emit('input', 'All Status')" style="cursor: pointer;">
      <CCard :class="['widget-card', { 'active-widget': value === 'All Status' }]">
        <CCardBody class="d-flex justify-content-between align-items-center p-4">
          <div>
            <div class="widget-title">Total Assignments</div>
            <div class="widget-value text-blue">{{ totalAssignments }}</div>
          </div>
          <div class="icon-wrapper bg-soft-blue text-blue border-blue">
            <CIcon name="cil-list" size="xl" />
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Students Enrolled -->
    <CCol sm="6" lg="3" @click="$emit('input', 'All Status')" style="cursor: pointer;">
      <CCard :class="['widget-card', { 'active-widget': false }]">
        <CCardBody class="d-flex justify-content-between align-items-center p-4">
          <div>
            <div class="widget-title">Students Enrolled</div>
            <div class="widget-value text-info">{{ studentsEnrolled }}</div>
          </div>
          <div class="icon-wrapper bg-soft-info text-info border-info">
            <CIcon name="cil-people" size="xl" />
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Average Progress -->
    <CCol sm="6" lg="3" @click="$emit('input', 'In Progress')" style="cursor: pointer;">
      <CCard :class="['widget-card', { 'active-widget': value === 'In Progress' }]">
        <CCardBody class="d-flex justify-content-between align-items-center p-4">
          <div>
            <div class="widget-title">Avg. Progress</div>
            <div class="widget-value text-success">{{ avgProgress }}%</div>
          </div>
          <div class="icon-wrapper bg-soft-success text-success border-success">
            <CIcon name="cil-chart-line" size="xl" />
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Pending Reviews -->
    <CCol sm="6" lg="3" @click="$emit('input', 'In Progress')" style="cursor: pointer;">
      <CCard :class="['widget-card', { 'active-widget': false }]">
        <CCardBody class="d-flex justify-content-between align-items-center p-4">
          <div>
            <div class="widget-title">Pending Reviews</div>
            <div class="widget-value text-warning">{{ pendingReviews }}</div>
          </div>
          <div class="icon-wrapper bg-soft-warning text-warning border-warning">
            <CIcon name="cil-clock" size="xl" />
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'SubmissionDetailWidget',
  props: {
    submission: {
      type: Object,
      required: true
    },
    value: {
      type: String,
      default: 'All Status'
    }
  },
  computed: {
    totalAssignments() {
      return this.submission.assignments ? this.submission.assignments.length : 0;
    },
    studentsEnrolled() {
      return this.submission.artist ? this.submission.artist.length : 0;
    },
    avgProgress() {
      if (!this.submission.assignments || this.submission.assignments.length === 0 || !this.submission.artist || this.submission.artist.length === 0) return 0;
      const totalPossible = this.submission.assignments.length * this.submission.artist.length;
      let totalSubmitted = 0;
      this.submission.assignments.forEach(assign => {
        totalSubmitted += assign.artworks ? assign.artworks.length : 0;
      });
      return Math.round((totalSubmitted / totalPossible) * 100);
    },
    pendingReviews() {
        if (!this.submission.assignments) return 0;
        let pending = 0;
        this.submission.assignments.forEach(assign => {
            if (assign.artworks) {
                pending += assign.artworks.filter(a => a.status === 'Pending').length;
            }
        });
        return pending;
    }
  }
}
</script>

<style scoped>
.widget-card {
  border-radius: 12px;
  border: 1px solid #eef0f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  height: 100%;
  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
}

.widget-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.active-widget {
  border-color: #3182ce !important;
  background-color: #f0f4ff !important;
  box-shadow: 0 6px 16px rgba(49, 130, 206, 0.1) !important;
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

.bg-soft-blue { background-color: #f0f4ff; }
.text-blue { color: #3182ce; }

.bg-soft-info { background-color: #e0faff; }
.text-info { color: #00b8d9; }

.bg-soft-success { background-color: #ebfcf1; }
.text-success { color: #10b981; }

.bg-soft-warning { background-color: #fff6e8; }
.text-warning { color: #f59e0b; }
</style>
