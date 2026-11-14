<template>
    <div class="mb-4">
        <CRow>
            <!-- Total Users -->
            <CCol sm="6" lg="3" class="mb-3 mb-lg-0" @click="updateFilter('All Status', 'All Roles')" style="cursor: pointer;">
                <CCard :class="['widget-card', { 'active-widget': isRoleActive('All Roles') }]">
                    <CCardBody class="d-flex justify-content-between align-items-center p-4">
                        <div>
                            <div class="widget-title">{{ $i18n.locale === 'en' ? 'Total Users' : 'ผู้ใช้งานทั้งหมด' }}</div>
                            <div class="widget-value text-primary">{{ totalCount }}</div>
                        </div>
                        <div class="icon-wrapper bg-blue-light text-blue">
                            <CIcon name="cil-people" size="xl" />
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>

            <!-- Admins -->
            <CCol sm="6" lg="3" class="mb-3 mb-lg-0" @click="updateFilter('All Status', 'Admin')" style="cursor: pointer;">
                <CCard :class="['widget-card', { 'active-widget': isRoleActive('Admin') }]">
                    <CCardBody class="d-flex justify-content-between align-items-center p-4">
                        <div>
                            <div class="widget-title">{{ $i18n.locale === 'en' ? 'Admin' : 'ผู้ดูแลระบบ' }}</div>
                            <div class="widget-value text-info">{{ adminsCount }}</div>
                        </div>
                        <div class="icon-wrapper bg-info-soft text-info">
                            <CIcon name="cilShieldAlt" size="xl" />
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>

            <!-- Artists -->
            <CCol sm="6" lg="3" class="mb-3 mb-sm-0" @click="updateFilter('All Status', 'Artist')" style="cursor: pointer;">
                <CCard :class="['widget-card', { 'active-widget': isRoleActive('Artist') }]">
                    <CCardBody class="d-flex justify-content-between align-items-center p-4">
                        <div>
                            <div class="widget-title">{{ $i18n.locale === 'en' ? 'Artist' : 'ศิลปิน' }}</div>
                            <div class="widget-value text-success">{{ artistsCount }}</div>
                        </div>
                        <div class="icon-wrapper bg-green-light text-green">
                            <CIcon name="cil-brush" size="xl" />
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>

            <!-- Customers -->
            <CCol sm="6" lg="3" @click="updateFilter('All Status', 'Customer')" style="cursor: pointer;">
                <CCard :class="['widget-card', { 'active-widget': isRoleActive('Customer') }]">
                    <CCardBody class="d-flex justify-content-between align-items-center p-4">
                        <div>
                            <div class="widget-title">{{ $i18n.locale === 'en' ? 'Customer' : 'ลูกค้า' }}</div>
                            <div class="widget-value text-warning">{{ customersCount }}</div>
                        </div>
                        <div class="icon-wrapper bg-yellow-light text-warning">
                            <CIcon name="cil-user" size="xl" />
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>

        <!-- Dynamic Custom Role Quick Filters -->
        <div v-if="customRoleCards.length" class="custom-roles-strip mt-3 d-flex flex-wrap align-items-center">
            <span class="custom-roles-label mr-2">
                {{ $i18n.locale === 'en' ? 'Additional Roles:' : 'บทบาทเพิ่มเติม:' }}
            </span>
            <button
                v-for="card in customRoleCards"
                :key="card.key"
                type="button"
                :class="['custom-role-chip', { 'active': isRoleActive(card.filterValue) || isRoleActive(card.id) }]"
                @click="toggleCustomRole(card)"
            >
                <CIcon :name="card.badge.icon" size="sm" class="mr-1" />
                <span>{{ card.badge.label }}</span>
                <span class="custom-role-count ml-2">{{ card.count }}</span>
            </button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getSystemRoleKey, getRoleEnName, getRoleBadgeMeta } from '@/utils/roles';

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
        },
        roles: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        ...mapGetters({
            users: 'user/user'
        }),
        totalCount() {
            return this.users ? this.users.length : 0;
        },
        adminsCount() {
            return (this.users || []).filter(u => getSystemRoleKey(u.role, this.roles) === 'admin').length;
        },
        artistsCount() {
            return (this.users || []).filter(u => getSystemRoleKey(u.role, this.roles) === 'artist').length;
        },
        customersCount() {
            return (this.users || []).filter(u => getSystemRoleKey(u.role, this.roles) === 'customer').length;
        },
        customRoleCards() {
            const locale = this.$i18n ? this.$i18n.locale : 'th';
            const buckets = new Map();
            const registerRole = (roleObj, countDelta = 0) => {
                if (!roleObj) return;
                if (getSystemRoleKey(roleObj, this.roles) !== 'custom') return;
                const badge = getRoleBadgeMeta(roleObj, locale, this.roles);
                const roleEn = getRoleEnName(roleObj, this.roles);
                const id = typeof roleObj === 'object' && roleObj._id ? String(roleObj._id) : '';
                const mapKey = (roleEn || badge.label || id).toLowerCase();
                if (!mapKey) return;
                if (!buckets.has(mapKey)) {
                    buckets.set(mapKey, {
                        key: mapKey,
                        id,
                        filterValue: roleEn || badge.label || id,
                        badge,
                        count: 0
                    });
                }
                const entry = buckets.get(mapKey);
                if (id && !entry.id) entry.id = id;
                entry.count += countDelta;
            };

            (this.roles || []).forEach(r => registerRole(r, 0));
            (this.users || []).forEach(u => registerRole(u.role, 1));
            return Array.from(buckets.values());
        }
    },
    methods: {
        updateFilter(status, role) {
            this.$emit('input', status);
            this.$emit('update:currentRole', role);
        },
        isRoleActive(role) {
            if (!this.currentRole) return role === 'All Roles';
            return String(this.currentRole).trim().toLowerCase() === String(role).trim().toLowerCase();
        },
        toggleCustomRole(card) {
            if (this.isRoleActive(card.filterValue) || (card.id && this.isRoleActive(card.id))) {
                this.updateFilter('All Status', 'All Roles');
            } else {
                this.updateFilter('All Status', card.filterValue);
            }
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
.bg-yellow-light { background-color: #fffbeb; }
.text-warning { color: #d97706; }
.bg-gray-light { background-color: #f7fafc; }
.text-gray { color: #718096; }

.custom-roles-strip {
    gap: 0.5rem;
}

.custom-roles-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #6b778c;
}

.custom-role-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    color: #334155;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.custom-role-chip:hover {
    border-color: #6366f1;
    color: #4338ca;
    background: #eef2ff;
}

.custom-role-chip.active {
    border-color: #321fdb;
    background: #eef2ff;
    color: #321fdb;
    box-shadow: 0 2px 8px rgba(50, 31, 219, 0.12);
}

.custom-role-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.35rem;
    height: 1.35rem;
    padding: 0 0.4rem;
    border-radius: 999px;
    background: #f1f5f9;
    color: #1e293b;
    font-size: 0.75rem;
    font-weight: 700;
}

.custom-role-chip.active .custom-role-count {
    background: #321fdb;
    color: #ffffff;
}
</style>
