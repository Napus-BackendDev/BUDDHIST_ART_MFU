<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="view-user-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-user" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'User Information' : 'ข้อมูลผู้ใช้' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Detailed profiles and system permissions.' : 'โปรไฟล์แบบละเอียดและสิทธิ์การใช้งานระบบ' }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-4 py-2" v-if="user">
            <!-- 1) Profile Header Section -->
            <div class="profile-header-vertical text-center mb-5">
                <div class="avatar-xl mx-auto mb-4 shadow-lg border-white border-4 overflow-hidden d-flex align-items-center justify-content-center">
                    <img v-if="user.image" :src="user.image" class="w-100 h-100 object-fit-cover rounded-circle" />
                    <span v-else>{{ getInitials(getName('en') || getName('th')) }}</span>
                </div>
                <h3 class="font-weight-bold text-dark mb-2">{{ getName('en') || getName('th') || 'N/A' }}</h3>
                <div class="d-flex justify-content-center align-items-center mb-3 flex-wrap">
                    <CBadge :class="['status-badge-lg px-4 py-2 mx-1 mb-1', getStatusClass(getStatusName())]">
                        <CIcon :name="getStatusIcon(getStatusName())" size="sm" class="mr-2" />
                        {{ getLocalizedStatusName() }}
                    </CBadge>
                    <CBadge :class="['status-badge-lg px-4 py-2 mx-1 mb-1', getRoleClass(user.role)]">
                        <CIcon :name="getRoleIcon(user.role)" size="sm" class="mr-2" />
                        {{ getLocalizedRoleName() }}
                    </CBadge>
                </div>
                <div v-if="isArtist && user.course" class="font-weight-bold text-muted mb-2">{{ courseText }}</div>
                <div class="text-muted small">
                    <CIcon name="cil-id-card" size="sm" class="mr-1" />
                    ID: {{ user.studentId || 'N/A' }} • Joined: {{ user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' }}
                </div>
            </div>

            <hr class="my-5 divider-faded">

            <!-- 2) Bio Section -->
            <div class="profile-section mb-5">
                <h6 class="section-title-modern mb-4">
                    <CIcon name="cil-description" class="mr-2" />
                    {{ $i18n.locale === 'en' ? 'Biography' : 'ประวัติส่วนตัว' }}
                </h6>
                <div class="bio-content-box p-4 rounded-xl bg-light">
                    {{ user.bio || ($i18n.locale === 'en' ? 'No biography information provided for this user.' : 'ไม่มีข้อมูลประวัติส่วนตัวสำหรับผู้ใช้นี้') }}
                </div>
            </div>

            <!-- 3) Personal Information -->
            <div class="profile-section mb-5">
                <h6 class="section-title-modern mb-4">
                    <CIcon name="cil-user" class="mr-2" />
                    {{ $i18n.locale === 'en' ? 'Personal Information' : 'ข้อมูลส่วนตัว' }}
                </h6>
                <div class="info-grid-modern">
                    <div class="info-item-modern">
                        <label>{{ $i18n.locale === 'en' ? 'FULL NAME (THAI)' : 'ชื่อ-นามสกุล (ไทย)' }}</label>
                        <div class="value">{{ getName('th') || 'N/A' }}</div>
                    </div>
                    <div class="info-item-modern" v-if="!isCustomer">
                        <label>{{ $i18n.locale === 'en' ? 'FULL NAME (ENGLISH)' : 'ชื่อ-นามสกุล (อังกฤษ)' }}</label>
                        <div class="value">{{ getName('en') || 'N/A' }}</div>
                    </div>
                    <div class="info-item-modern" v-if="!isCustomer">
                        <label>{{ $i18n.locale === 'en' ? 'OFFICIAL EMAIL' : 'อีเมลอย่างเป็นทางการ' }}</label>
                        <div class="value text-primary font-weight-bold">{{ (user.contact && user.contact.studentEmail) || 'N/A' }}</div>
                    </div>
                    <div class="info-item-modern">
                        <label>{{ $i18n.locale === 'en' ? 'PERSONAL EMAIL' : 'อีเมลส่วนตัว' }}</label>
                        <div class="value">{{ (user.contact && user.contact.personalEmail) || 'Not Provided' }}</div>
                    </div>
                    <div class="info-item-modern">
                        <label>{{ $i18n.locale === 'en' ? 'TELEPHONE' : 'เบอร์โทรศัพท์' }}</label>
                        <div class="value">{{ (user.contact && user.contact.telephone) || 'N/A' }}</div>
                    </div>
                </div>
            </div>

            <!-- 4) Address Section (Customer Only) -->
            <div class="profile-section mb-5" v-if="isCustomer">
                <h6 class="section-title-modern mb-4">
                    <CIcon name="cil-location-pin" class="mr-2" />
                    {{ $i18n.locale === 'en' ? 'Address Information' : 'ข้อมูลที่อยู่' }}
                </h6>
                <div class="address-grid">
                    <div class="address-box p-3 rounded-xl border mb-3">
                        <div class="text-label-xs mb-2">{{ $i18n.locale === 'en' ? 'SHIPPING ADDRESS' : 'ที่อยู่สำหรับจัดส่ง' }}</div>
                        <div class="text-dark small">{{ (user.address && user.address.shipping) || ($i18n.locale === 'en' ? 'No shipping address provided.' : 'ไม่มีข้อมูลที่อยู่สำหรับจัดส่ง') }}</div>
                    </div>
                    <div class="address-box p-3 rounded-xl border">
                        <div class="text-label-xs mb-2">{{ $i18n.locale === 'en' ? 'BILLING ADDRESS' : 'ที่อยู่สำหรับออกบิล' }}</div>
                        <div class="text-dark small">{{ (user.address && user.address.bill) || ($i18n.locale === 'en' ? 'No billing address provided.' : 'ไม่มีข้อมูลที่อยู่สำหรับออกบิล') }}</div>
                    </div>
                </div>
            </div>


        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end align-items-center py-2">
                <CButton 
                    variant="ghost" 
                    @click="$emit('update:show', false)"
                    class="btn-cancel mr-3"
                >
                    {{ $i18n.locale === 'en' ? 'Close' : 'ปิด' }}
                </CButton>
                <CButton 
                    v-if="!readOnly"
                    color="primary" 
                    @click="$emit('edit', user)"
                    class="btn-edit-user"
                >
                    <CIcon name="cil-pencil" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Edit Profile' : 'แก้ไขโปรไฟล์' }}
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
import { courseLabel } from '@/utils/courses';
import {
    getRoleEnName,
    getSystemRoleKey,
    getRoleDisplayLabel,
    getRoleBadgeMeta,
    resolveUserStatusMeta
} from '@/utils/roles';

export default {
    name: 'UserViewModal',
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        show: {
            type: Boolean,
            default: false
        },
        user: {
            type: Object,
            default: () => null
        }
    },
    computed: {
        courseText() {
            return courseLabel(this.user && this.user.course, this.$i18n.locale);
        },
        isCustomer() {
            return this.user ? getSystemRoleKey(this.user.role) === 'customer' : false;
        },
        isArtist() {
            return this.user ? getSystemRoleKey(this.user.role) === 'artist' : false;
        }
    },
    methods: {
        getInitials(name) {
            if (!name) return '??';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        },
        getStatusIcon(status) {
            switch(status) {
                case 'Active': return 'cil-check-circle';
                case 'Inactive': return 'cil-clock';
                case 'Suspended': return 'cil-ban';
                default: return 'cil-clock';
            }
        },
        getStatusClass(status) {
            switch(status) {
                case 'Active': return 'status-active';
                case 'Inactive': return 'status-inactive';
                case 'Suspended': return 'status-suspended';
                default: return 'status-learner';
            }
        },
        getName(lang) {
            if (!this.user || !this.user.name) return '';
            if (typeof this.user.name === 'string') return this.user.name;
            if (Array.isArray(this.user.name)) {
                const nameObj = this.user.name.find(n => n.key === lang);
                return nameObj ? nameObj.value : (this.user.name[0] ? this.user.name[0].value : '');
            }
            return '';
        },
        getRoleName() {
            if (!this.user || !this.user.role) return 'User';
            return getRoleEnName(this.user.role);
        },
        getLocalizedRoleName() {
            if (!this.user || !this.user.role) return 'User';
            return getRoleDisplayLabel(this.user.role, this.$i18n ? this.$i18n.locale : 'th');
        },
        getStatusName() {
            return resolveUserStatusMeta(this.user, 'en').key;
        },
        getLocalizedStatusName() {
            return resolveUserStatusMeta(this.user, this.$i18n ? this.$i18n.locale : 'th').label;
        },
        getRoleClass(role) {
            const key = getSystemRoleKey(role);
            if (key === 'admin') return 'role-admin';
            if (key === 'artist') return 'role-artist';
            if (key === 'customer') return 'role-customer';
            const badge = getRoleBadgeMeta(role, this.$i18n ? this.$i18n.locale : 'th');
            if (badge.class === 'status-reviewer') return 'role-reviewer';
            if (badge.class === 'status-curator') return 'role-curator';
            return 'role-default';
        },
        getRoleIcon(role) {
            return getRoleBadgeMeta(role, this.$i18n ? this.$i18n.locale : 'th').icon;
        }
    }
}
</script>

<style scoped>
.profile-header-vertical {
    border-radius: 20px;
}

.rounded-xl {
    border-radius: 20px !important;
}

.avatar-xl {
    width: 140px;
    height: 140px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5rem;
    font-weight: 800;
}

.section-title-modern {
    font-size: 0.9rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #1e293b;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    border-left: 4px solid #3b82f6;
    padding-left: 15px;
}

.bio-content-box {
    line-height: 1.8;
    color: #475569;
    font-size: 1rem;
    border-left: 4px solid #e2e8f0;
}

.info-grid-modern {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
}

.info-item-modern label {
    display: block;
    font-size: 0.65rem;
    font-weight: 800;
    color: #94a3b8;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
}

.info-item-modern .value {
    font-size: 1.1rem;
    color: #1e293b;
    font-weight: 600;
}

.divider-faded {
    opacity: 0.4;
    border-top: 1px dashed #cbd5e1;
}

.stats-banner-modern {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 20px;
}

.stat-icon-circle {
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-label-white {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 0.1em;
    margin-bottom: 4px;
}

.stat-value-large {
    font-size: 2rem;
    font-weight: 800;
}

.pill-btn {
    border-radius: 50px;
    padding: 0.5rem 1.5rem;
    font-weight: 600;
}

.close-btn {
    background: transparent;
    border: none;
    padding: 8px;
    color: #94a3b8;
    transition: color 0.2s;
}

::v-deep .modal-content {
    border-radius: 24px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

::v-deep .modal-body {
    padding: 2.5rem !important;
}

::v-deep .modal-header {
    border-bottom: 1px solid #f1f5f9;
    padding: 1.5rem 2.5rem;
}

::v-deep .modal-footer {
    border-top: 1px solid #f1f5f9;
    padding: 1.5rem 2.5rem;
}

.btn-cancel {
    color: #94a3b8 !important;
    font-weight: 600;
}

.btn-edit-user {
    background-color: #3b82f6 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

.role-admin {
    background-color: #e0f2fe !important;
    color: #0369a1 !important;
    border: 1px solid #bae6fd !important;
}

.role-artist {
    background-color: #f3e8ff !important;
    color: #6b21a8 !important;
    border: 1px solid #d8b4fe !important;
}

.role-customer {
    background-color: #f1f5f9 !important;
    color: #64748b !important;
    border: 1px solid #e2e8f0 !important;
}

.role-default {
    background-color: #eef2ff !important;
    color: #3730a3 !important;
    border: 1px solid #c7d2fe !important;
}

.role-reviewer {
    background-color: #ede9fe !important;
    color: #5b21b6 !important;
    border: 1px solid #ddd6fe !important;
}

.role-curator {
    background-color: #f0fdfa !important;
    color: #0f766e !important;
    border: 1px solid #99f6e4 !important;
}

.status-active {
    background-color: #ecfdf5 !important;
    color: #047857 !important;
    border: 1px solid #a7f3d0 !important;
}

.status-learner {
    background-color: #fffbeb !important;
    color: #b45309 !important;
    border: 1px solid #fde68a !important;
}
</style>
