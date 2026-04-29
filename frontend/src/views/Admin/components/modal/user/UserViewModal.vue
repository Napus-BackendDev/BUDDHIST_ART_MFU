<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="view-user-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-user" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">User Information</h5>
                        <p class="text-muted small mb-0">Detailed profiles and system permissions.</p>
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
                <div class="avatar-xl mx-auto mb-4 shadow-lg border-white border-4">
                    <span v-if="!user.avatar">{{ getInitials(getName('en') || getName('th')) }}</span>
                    <img v-else :src="user.avatar" class="w-100 h-100 object-fit-cover rounded-circle" />
                </div>
                <h3 class="font-weight-bold text-dark mb-2">{{ getName('en') || getName('th') || 'N/A' }}</h3>
                <div class="d-flex justify-content-center align-items-center mb-3">
                    <CBadge :class="['status-badge-lg px-4 py-2 mx-1', getStatusClass(getStatusName())]">
                        <CIcon :name="getStatusIcon(getStatusName())" size="sm" class="mr-2" />
                        {{ getStatusName() }}
                    </CBadge>
                    <CBadge color="light" class="status-badge-lg px-4 py-2 mx-1 border text-dark">
                        <CIcon name="cilShieldAlt" size="sm" class="mr-2" />
                        {{ getRoleName() }}
                    </CBadge>
                </div>
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
                    Biography
                </h6>
                <div class="bio-content-box p-4 rounded-xl bg-light">
                    {{ user.bio || 'No biography information provided for this user.' }}
                </div>
            </div>

            <!-- 3) Personal Information -->
            <div class="profile-section mb-5">
                <h6 class="section-title-modern mb-4">
                    <CIcon name="cil-user" class="mr-2" />
                    Personal Information
                </h6>
                <div class="info-grid-modern">
                    <div class="info-item-modern">
                        <label>FULL NAME (THAI)</label>
                        <div class="value">{{ getName('th') || 'N/A' }}</div>
                    </div>
                    <div class="info-item-modern" v-if="!isCustomer">
                        <label>FULL NAME (ENGLISH)</label>
                        <div class="value">{{ getName('en') || 'N/A' }}</div>
                    </div>
                    <div class="info-item-modern" v-if="!isCustomer">
                        <label>OFFICIAL EMAIL</label>
                        <div class="value text-primary font-weight-bold">{{ (user.contact && user.contact.studentEmail) || 'N/A' }}</div>
                    </div>
                    <div class="info-item-modern">
                        <label>PERSONAL EMAIL</label>
                        <div class="value">{{ (user.contact && user.contact.personalEmail) || 'Not Provided' }}</div>
                    </div>
                    <div class="info-item-modern">
                        <label>TELEPHONE</label>
                        <div class="value">{{ (user.contact && user.contact.telephone) || 'N/A' }}</div>
                    </div>
                </div>
            </div>

            <!-- 4) Address Section (Customer Only) -->
            <div class="profile-section mb-5" v-if="isCustomer">
                <h6 class="section-title-modern mb-4">
                    <CIcon name="cil-location-pin" class="mr-2" />
                    Address Information
                </h6>
                <div class="address-grid">
                    <div class="address-box p-3 rounded-xl border mb-3">
                        <div class="text-label-xs mb-2">SHIPPING ADDRESS</div>
                        <div class="text-dark small">{{ (user.address && user.address.shipping) || 'No shipping address provided.' }}</div>
                    </div>
                    <div class="address-box p-3 rounded-xl border">
                        <div class="text-label-xs mb-2">BILLING ADDRESS</div>
                        <div class="text-dark small">{{ (user.address && user.address.bill) || 'No billing address provided.' }}</div>
                    </div>
                </div>
            </div>

            <!-- 5) Artworks Stat -->
            <div class="profile-section mb-4">
                <h6 class="section-title-modern mb-4">
                    <CIcon name="cil-image" class="mr-2" />
                    Artist Status
                </h6>
                <div class="stats-banner-modern p-4 rounded-xl d-flex align-items-center justify-content-between text-white shadow-sm">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon-circle mr-4">
                            <CIcon name="cil-brush" size="xl" />
                        </div>
                        <div>
                            <div class="stat-label-white">TOTAL ARTWORKS</div>
                            <div class="stat-value-large">{{ (user.artworks && user.artworks.length) || 0 }}</div>
                        </div>
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
                    Close
                </CButton>
                <CButton 
                    color="primary" 
                    @click="$emit('edit', user)"
                    class="btn-edit-user"
                >
                    <CIcon name="cil-pencil" class="mr-2" /> Edit Profile
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'UserViewModal',
    props: {
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
        isCustomer() {
            if (!this.user || !this.user.role) return false;
            
            // Check if role is an object (populated)
            if (typeof this.user.role === 'object' && this.user.role.title) {
                const titleEn = this.user.role.title.find(t => t.key === 'en');
                return titleEn && titleEn.value === 'Customer';
            }
            
            // Check if role is a string
            const roleName = String(this.user.role).toLowerCase();
            return roleName === 'customer';
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
                default: return 'cil-circle';
            }
        },
        getStatusClass(status) {
            switch(status) {
                case 'Active': return 'status-active';
                case 'Inactive': return 'status-inactive';
                case 'Suspended': return 'status-suspended';
                default: return '';
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
            const role = this.user.role;
            if (typeof role === 'string') return role;
            if (typeof role === 'object' && role.title && Array.isArray(role.title)) {
                const titleEn = role.title.find(t => t.key === 'en');
                return titleEn ? titleEn.value : (role.title[0] ? role.title[0].value : 'Unknown');
            }
            return 'User';
        },
        getStatusName() {
            if (!this.user || !this.user.status) return 'Active';
            const status = this.user.status;
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
</style>
