<template>
    <CRow class="mb-4">
        <!-- Total Submissions -->
        <CCol sm="6" lg="3" @click="$emit('input', 'All Time')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'All Time' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">{{ $i18n.locale === 'en' ? 'Total Submissions' : 'ส่งงานทั้งหมด' }}</div>
                        <div class="widget-value">{{ totalSubmissions }}</div>
                    </div>
                    <div class="icon-wrapper bg-blue-light text-blue">
                        <CIcon name="cil-list" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Active Assignments -->
        <CCol sm="6" lg="3" @click="$emit('input', 'All Time')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': false }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">{{ $i18n.locale === 'en' ? 'Assignments' : 'งานที่มอบหมาย' }}</div>
                        <div class="widget-value text-green">{{ totalAssignments }}</div>
                    </div>
                    <div class="icon-wrapper bg-green-light text-green">
                        <CIcon name="cil-task" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Students -->
        <CCol sm="6" lg="3" @click="$emit('input', 'All Time')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': false }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">{{ $i18n.locale === 'en' ? 'Students' : 'นักศึกษา' }}</div>
                        <div class="widget-value text-orange">{{ totalStudents }}</div>
                    </div>
                    <div class="icon-wrapper bg-orange-light text-orange">
                        <CIcon name="cil-people" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- New Submissions -->
        <CCol sm="6" lg="3" @click="$emit('input', 'Today')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'Today' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">{{ $i18n.locale === 'en' ? 'New Today' : 'มาใหม่วันนี้' }}</div>
                        <div class="widget-value text-purple">{{ newTodayCount }}</div>
                    </div>
                    <div class="icon-wrapper bg-purple-light text-purple">
                        <CIcon name="cil-bell" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'

export default {
    name: 'SubmissionWidget',
    props: {
        value: {
            type: String,
            default: 'All Time'
        }
    },
    computed: {
        ...mapGetters({
            submissions: 'submission/submissions'
        }),
        totalSubmissions() {
            return this.submissions ? this.submissions.length : 0;
        },
        totalAssignments() {
            if (!this.submissions) return 0;
            return this.submissions.reduce((acc, curr) => acc + (curr.assignments ? curr.assignments.length : 0), 0);
        },
        totalStudents() {
            if (!this.submissions) return 0;
            const studentIds = new Set();
            this.submissions.forEach(sub => {
                if (sub.artist) {
                    sub.artist.forEach(id => studentIds.add(id.toString()));
                }
            });
            return studentIds.size;
        },
        newTodayCount() {
            if (!this.submissions) return 0;
            const today = moment().startOf('day');
            return this.submissions.filter(sub => moment(sub.createdAt).isSameOrAfter(today)).length;
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
    cursor: default;
    user-select: none;
}

.widget-card:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
}

.active-widget {
    border-color: #321fdb !important;
    background-color: #f0f4ff !important;
    box-shadow: 0 6px 16px rgba(50, 31, 219, 0.1) !important;
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

.bg-blue-light { background-color: #f0f4ff; }
.text-blue { color: #3b82f6; }
.bg-green-light { background-color: #ebfcf1; }
.text-green { color: #10b981; }
.bg-orange-light { background-color: #fff6e8; }
.text-orange { color: #f59e0b; }
.bg-purple-light { background-color: #f5f3ff; }
.text-purple { color: #8b5cf6; }
</style>
