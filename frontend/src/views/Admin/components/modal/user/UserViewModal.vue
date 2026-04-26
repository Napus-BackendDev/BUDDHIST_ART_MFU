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

        <div class="px-3 py-2" v-if="user">
            <CRow>
                <!-- Profile Section -->
                <CCol md="4" class="mb-4 mb-md-0">
                    <div class="user-profile-card rounded-xl overflow-hidden shadow-sm border p-4 text-center bg-light-gradient">
                        <div class="avatar-large mx-auto mb-3 shadow-sm">
                            <span v-if="!user.avatar">{{ getInitials(getName('en') || getName('th')) }}</span>
                            <img v-else :src="user.avatar" class="w-100 h-100 object-fit-cover" />
                        </div>
                        <h4 class="font-weight-bold text-dark mb-1">{{ getName('en') || getName('th') || 'N/A' }}</h4>
                        <p class="text-muted small mb-3">{{ (user.contact && user.contact.studentEmail) || 'No Email' }}</p>
                        <CBadge :class="['status-badge-lg px-4 py-2', getStatusClass(user.status || 'Active')]">
                            <CIcon :name="getStatusIcon(user.status || 'Active')" size="sm" class="mr-2" />
                            {{ user.status || 'Active' }}
                        </CBadge>
                    </div>
                    
                    <div class="mt-4 info-list-card rounded-xl border p-3">
                        <div class="d-flex align-items-center mb-3">
                            <div class="mini-icon-box bg-blue-light text-blue mr-3">
                                <CIcon name="cil-id-card" size="sm" />
                            </div>
                            <div>
                                <div class="text-label-xs">STUDENT ID / USERNAME</div>
                                <div class="font-weight-bold text-dark">{{ user.studentId || 'N/A' }}</div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center">
                            <div class="mini-icon-box bg-green-light text-green mr-3">
                                <CIcon name="cil-shield-alt" size="sm" />
                            </div>
                            <div>
                                <div class="text-label-xs">ACCOUNT ROLE</div>
                                <div class="font-weight-bold text-dark">{{ user.role || 'User' }}</div>
                            </div>
                        </div>
                    </div>
                </CCol>

                <!-- Details Section -->
                <CCol md="8">
                    <div class="details-container p-2">
                        <h6 class="section-title mb-4">Personal Information</h6>
                        
                        <CRow class="mb-4">
                            <CCol sm="6">
                                <div class="info-group">
                                    <label class="info-label">Full Name (Thai)</label>
                                    <div class="info-value">{{ getName('th') || 'N/A' }}</div>
                                </div>
                            </CCol>
                            <CCol sm="6">
                                <div class="info-group">
                                    <label class="info-label">Full Name (English)</label>
                                    <div class="info-value">{{ getName('en') || 'N/A' }}</div>
                                </div>
                            </CCol>
                        </CRow>

                        <CRow class="mb-4">
                            <CCol sm="6">
                                <div class="info-group">
                                    <label class="info-label">Official Email</label>
                                    <div class="info-value text-blue font-weight-600">{{ (user.contact && user.contact.studentEmail) || 'N/A' }}</div>
                                </div>
                            </CCol>
                            <CCol sm="6">
                                <div class="info-group">
                                    <label class="info-label">Personal Email</label>
                                    <div class="info-value">{{ (user.contact && user.contact.personalEmail) || 'Not Provided' }}</div>
                                </div>
                            </CCol>
                        </CRow>

                        <CRow class="mb-4">
                            <CCol sm="6">
                                <div class="info-group">
                                    <label class="info-label">Telephone</label>
                                    <div class="info-value">{{ (user.contact && user.contact.telephone) || 'N/A' }}</div>
                                </div>
                            </CCol>
                            <CCol sm="6">
                                <div class="info-group">
                                    <label class="info-label">Member Since</label>
                                    <div class="info-value">{{ user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' }}</div>
                                </div>
                            </CCol>
                        </CRow>

                        <hr class="my-4 light-divider">
                        
                        <h6 class="section-title mb-4">System Activity</h6>
                        <CRow>
                            <CCol sm="4">
                                <div class="stat-box">
                                    <div class="stat-label">Last Login</div>
                                    <div class="stat-value small">2 hours ago</div>
                                </div>
                            </CCol>
                            <CCol sm="4">
                                <div class="stat-box">
                                    <div class="stat-label">Total Submissions</div>
                                    <div class="stat-value">12</div>
                                </div>
                            </CCol>
                            <CCol sm="4">
                                <div class="stat-box">
                                    <div class="stat-label">Artworks</div>
                                    <div class="stat-value">4</div>
                                </div>
                            </CCol>
                        </CRow>
                    </div>
                </CCol>
            </CRow>
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
        }
    }
}
</script>

<style scoped>
.modal-header-custom {
    padding: 0.5rem 0;
}

.icon-square {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bg-blue-light { background-color: #3b82f611; }
.text-blue { color: #3b82f6; }
.bg-green-light { background-color: #10b98111; }
.text-green { color: #10b981; }

.avatar-large {
    width: 100px;
    height: 100px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 800;
    border: 4px solid #fff;
}

.user-profile-card {
    background: #fff;
}

.bg-light-gradient {
    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.rounded-xl {
    border-radius: 20px;
}

.status-badge-lg {
    display: inline-flex;
    align-items: center;
    border-radius: 50px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    border: 1px solid transparent;
}

.status-active {
    background-color: #ecfdf5;
    color: #10b981;
    border-color: #10b98133;
}

.status-inactive {
    background-color: #fffbeb;
    color: #f59e0b;
    border-color: #f59e0b33;
}

.status-suspended {
    background-color: #fef2f2;
    color: #ef4444;
    border-color: #ef444433;
}

.text-label-xs {
    font-size: 0.65rem;
    font-weight: 800;
    color: #94a3b8;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
}

.mini-icon-box {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.info-group {
    margin-bottom: 1rem;
}

.info-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 0.5rem;
    letter-spacing: 0.05em;
}

.info-value {
    font-size: 1.05rem;
    color: #1e293b;
    font-weight: 500;
}

.section-title {
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #475569;
    letter-spacing: 0.1em;
    position: relative;
    padding-bottom: 8px;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 30px;
    height: 2px;
    background: #3b82f6;
}

.stat-box {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 12px;
    text-align: center;
}

.stat-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 4px;
}

.stat-value {
    font-size: 1.25rem;
    font-weight: 800;
    color: #1e293b;
}

.light-divider {
    border-color: #f1f5f9;
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

.font-weight-600 { font-weight: 600; }
</style>
