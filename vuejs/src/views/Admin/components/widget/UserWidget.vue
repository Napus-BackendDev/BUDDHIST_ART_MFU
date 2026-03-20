<template>
    <CRow class="mb-4">
        <!-- Total Users -->
        <CCol sm="6" lg="3" @click="updateFilter('All Status', 'All Roles')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'All Status' && currentRole === 'All Roles' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Total Users</div>
                        <div class="widget-value">{{ users.length.toLocaleString() }}</div>
                    </div>
                    <div class="icon-wrapper bg-blue-light text-blue">
                        <CIcon name="cil-people" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Active Admins -->
        <CCol sm="6" lg="3" @click="updateFilter('Active', 'Admin')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': currentRole === 'Admin' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Active Admins</div>
                        <div class="widget-value text-info">{{ adminsCount }}</div>
                    </div>
                    <div class="icon-wrapper bg-info-soft text-info">
                        <CIcon name="cil-shield-check" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Active Today -->
        <CCol sm="6" lg="3" @click="updateFilter('Active', 'All Roles')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'Active' && currentRole === 'All Roles' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Active Today</div>
                        <div class="widget-value text-success">{{ activeCount }}</div>
                    </div>
                    <div class="icon-wrapper bg-green-light text-green">
                        <CIcon name="cil-check-circle" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Suspended -->
        <CCol sm="6" lg="3" @click="updateFilter('Suspended', 'All Roles')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'Suspended' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Suspended</div>
                        <div class="widget-value text-danger">{{ suspendedCount }}</div>
                    </div>
                    <div class="icon-wrapper bg-red-light text-red">
                        <CIcon name="cil-user-unfollow" size="xl" />
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
    methods: {
        updateFilter(status, role) {
            this.$emit('input', status);
            this.$emit('update:role', role);
        }
    },
    computed: {
        ...mapGetters({
            users: 'user/user'
        }),
        adminsCount() {
            return this.users.filter(u => u.role === 'Admin').length;
        },
        activeCount() {
            return this.users.filter(u => u.status === 'Active' || !u.status).length;
        },
        suspendedCount() {
            return this.users.filter(u => u.status === 'Suspended').length;
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
</style>
