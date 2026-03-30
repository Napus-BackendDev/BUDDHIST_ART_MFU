<template>
    <CRow class="mb-4">
        <!-- Total Students -->
        <CCol sm="6" lg="3" @click="updateFilter('All Status', 'Artist')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': currentRole === 'Artist' && value === 'All Status' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Total Student</div>
                        <div class="widget-value text-primary">{{ studentsCount }}</div>
                    </div>
                    <div class="icon-wrapper bg-blue-light text-blue">
                        <CIcon name="cil-people" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Admins -->
        <CCol sm="6" lg="3" @click="updateFilter('All Status', 'Admin')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': currentRole === 'Admin' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Admin</div>
                        <div class="widget-value text-info">{{ adminsCount }}</div>
                    </div>
                    <div class="icon-wrapper bg-info-soft text-info">
                        <CIcon name="cil-shield-check" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- New Student -->
        <CCol sm="6" lg="3" @click="updateFilter('NewStudent', 'Artist')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'NewStudent' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">New Student</div>
                        <div class="widget-value text-success">{{ newStudentsCount }}</div>
                    </div>
                    <div class="icon-wrapper bg-green-light text-green">
                        <CIcon name="cil-check-circle" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Old Student -->
        <CCol sm="6" lg="3" @click="updateFilter('OldStudent', 'Artist')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'OldStudent' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Old Student</div>
                        <div class="widget-value text-secondary">{{ oldStudentsCount }}</div>
                    </div>
                    <div class="icon-wrapper bg-gray-light text-gray">
                        <CIcon name="cil-history" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'UserWidget',
    props: {
        value: {
            type: String,
            default: 'All Status'
        },
        currentRole: {
            type: String,
            default: 'All Roles'
        }
    },
    computed: {
        ...mapGetters({
            users: 'user/user'
        }),
        studentsCount() {
            return this.users.filter(u => this.getRoleName(u.role) === 'Artist').length;
        },
        adminsCount() {
            return this.users.filter(u => this.getRoleName(u.role) === 'Admin').length;
        },
        newStudentsCount() {
            return this.users.filter(u => this.getStatusName(u.status) === 'NewStudent').length;
        },
        oldStudentsCount() {
            return this.users.filter(u => this.getStatusName(u.status) === 'OldStudent').length;
        }
    },
    methods: {
        updateFilter(status, role) {
            this.$emit('input', status);
            this.$emit('update:currentRole', role);
        },
        getRoleName(role) {
            if (!role) return 'User';
            if (typeof role === 'string') return role;
            if (typeof role === 'object' && role.title && Array.isArray(role.title)) {
                const titleEn = role.title.find(t => t.key === 'en');
                return titleEn ? titleEn.value : (role.title[0] ? role.title[0].value : 'Unknown');
            }
            return 'User';
        },
        getStatusName(status) {
            if (!status) return 'Active';
            if (typeof status === 'string') return status;
            if (typeof status === 'object' && status.title && Array.isArray(status.title)) {
                const titleEn = status.title.find(t => t.key === 'en');
                return titleEn ? titleEn.value : (status.title[0] ? status.title[0].value : 'Unknown');
            }
            return 'Active';
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
.text-blue { color: #321fdb; }
.bg-info-soft { background-color: #e0faff; }
.text-info { color: #00b8d9; }
.bg-green-light { background-color: #ebfcf1; }
.text-green { color: #10b981; }
.bg-red-light { background-color: #fff5f5; }
.text-red { color: #e53e3e; }
.bg-gray-light { background-color: #f7fafc; }
.text-gray { color: #718096; }
</style>
