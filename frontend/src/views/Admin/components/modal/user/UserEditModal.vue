<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="edit-user-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-orange-light text-orange mr-3">
                        <CIcon name="cil-pencil" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">Edit User Account</h5>
                        <p class="text-muted small mb-0">Modify user profile, system roles, and account status.</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2" v-if="form">
            <!-- Account Info Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Student ID / Username</label>
                        <CInput 
                            v-model="form.studentId" 
                            placeholder="e.g. 66xxxxxxxx" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">System Role</label>
                        <CDropdown :caret="false" class="w-100">
                            <template #toggler>
                                <button class="custom-select-btn">
                                    <span class="text-dark">{{ form.roleName || 'Select Role' }}</span>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </button>
                            </template>
                            <CDropdownMenu class="w-100 shadow-sm border-0 mt-1">
                                <CDropdownItem v-for="r in roles" :key="r._id" @click="form.roleId = r._id; form.roleName = r.name">
                                    {{ r.name }}
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Status Row -->
            <CRow v-if="form.roleName === 'Artist'">
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Account Status</label>
                        <CDropdown :caret="false" class="w-100">
                            <template #toggler>
                                <button class="custom-select-btn">
                                    <div class="d-flex align-items-center">
                                        <div :class="['status-dot mr-2', getStatusDotClass(form.statusName)]"></div>
                                        <span class="text-dark">{{ form.statusName || 'Select Status' }}</span>
                                    </div>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </button>
                            </template>
                            <CDropdownMenu class="w-100 shadow-sm border-0 mt-1">
                                <CDropdownItem v-for="s in statuses" :key="s._id" @click="form.statusId = s._id; form.statusName = s.name">
                                    <div class="d-flex align-items-center">
                                        <div :class="['status-dot mr-2', getStatusDotClass(s.name)]"></div>
                                        {{ s.name }}
                                    </div>
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Names Row -->
            <CRow>
                <CCol :md="form.roleName === 'Customer' ? '12' : '6'">
                    <div class="form-group-custom">
                        <label class="form-label">Full Name (Thai)</label>
                        <CInput 
                            v-model="form.nameTh" 
                            placeholder="ภาษาไทย" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6" v-if="form.roleName !== 'Customer'">
                    <div class="form-group-custom">
                        <label class="form-label">Full Name (English)</label>
                        <CInput 
                            v-model="form.nameEn" 
                            placeholder="English name" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Contacts Row -->
            <CRow>
                <CCol md="6" v-if="form.roleName !== 'Customer'">
                    <div class="form-group-custom">
                        <label class="form-label">Official Email</label>
                        <CInput 
                            v-model="form.email" 
                            type="email" 
                            placeholder="official@edu.com" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol :md="form.roleName === 'Customer' ? '12' : '6'">
                    <div class="form-group-custom">
                        <label class="form-label">Personal Email</label>
                        <CInput 
                            v-model="form.personalEmail" 
                            type="email" 
                            placeholder="personal@gmail.com" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Telephone</label>
                        <CInput 
                            v-model="form.telephone" 
                            placeholder="08x-xxx-xxxx" 
                            class="custom-input mb-0"
                        />
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
                    Cancel
                </CButton>
                <CButton 
                    color="primary" 
                    @click="handleSave"
                    class="btn-save-user"
                    :disabled="!isFormValid"
                >
                    Save Changes
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'UserEditModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        user: {
            type: Object,
            default: () => null
        },
        roles: {
            type: Array,
            default: () => []
        },
        statuses: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            form: null
        }
    },
    watch: {
        show(newVal) {
            if (newVal && this.user) {
                this.initForm();
            }
        }
    },
    computed: {
        isFormValid() {
            if (!this.form) return false;
            const baseValid = this.form.studentId && this.form.roleId && this.form.nameEn && this.form.email;
            if (this.form.roleName === 'Artist') {
                return baseValid && this.form.statusId;
            }
            return baseValid;
        }
    },
    methods: {
        initForm() {
            const getNameFromML = (lang) => {
                if (!this.user || !this.user.name) return '';
                if (typeof this.user.name === 'string') return lang === 'en' ? this.user.name : '';
                if (Array.isArray(this.user.name)) {
                    const obj = this.user.name.find(n => n.key === lang);
                    return obj ? obj.value : '';
                }
                return '';
            };

            const getRoleInfo = () => {
                const role = this.user.role;
                if (!role) return { id: '', name: '' };
                
                // If role is an object with _id (populated)
                if (typeof role === 'object' && role._id) {
                    const titleEn = role.title && Array.isArray(role.title) ? role.title.find(t => t.key === 'en') : null;
                    const name = titleEn ? titleEn.value : (role.title && role.title[0] ? role.title[0].value : 'Unknown');
                    return { id: role._id, name };
                }
                
                // If role is an ID string or Name string
                const found = this.roles.find(r => r._id === role || r.name === role);
                if (found) return { id: found._id, name: found.name };
                
                return { id: role, name: role }; // Fallback
            };

            const getStatusInfo = () => {
                const status = this.user.status;
                if (!status) return { id: '', name: '' };
                
                // If status is an object with _id (populated)
                if (typeof status === 'object' && status._id) {
                    const titleEn = status.title && Array.isArray(status.title) ? status.title.find(t => t.key === 'en') : null;
                    const name = titleEn ? titleEn.value : (status.title && status.title[0] ? status.title[0].value : 'Unknown');
                    return { id: status._id, name };
                }
                
                // If status is an ID string or Name string, find it in the statuses prop
                const found = this.statuses.find(s => s._id === status || s.name === status);
                if (found) return { id: found._id, name: found.name };
                
                return { id: status, name: status }; // Fallback
            };

            const roleInfo = getRoleInfo();
            const statusInfo = getStatusInfo();

            this.form = {
                _id: this.user._id,
                studentId: this.user.studentId || '',
                roleId: roleInfo.id,
                roleName: roleInfo.name,
                statusId: statusInfo.id,
                statusName: statusInfo.name,
                nameTh: getNameFromML('th'),
                nameEn: getNameFromML('en'),
                email: (this.user.contact && this.user.contact.studentEmail) || '',
                personalEmail: (this.user.contact && this.user.contact.personalEmail) || '',
                telephone: (this.user.contact && this.user.contact.telephone) || ''
            };
        },
        handleSave() {
            if (!this.isFormValid) return;
            
            const payload = {
                _id: this.form._id,
                studentId: this.form.studentId,
                role: this.form.roleId, // Always send ObjectID
                status: this.form.statusId || null, // Always send ObjectID or null
                name: [
                    { key: 'th', value: this.form.nameTh },
                    { key: 'en', value: this.form.nameEn }
                ],
                contact: {
                    studentEmail: this.form.email,
                    personalEmail: this.form.personalEmail,
                    telephone: this.form.telephone
                }
            };

            console.log('--- Saving User Data ---');
            console.log('Payload:', payload);

            this.$emit('save', payload);
            this.$emit('update:show', false);
        },
        getStatusDotClass(status) {
            switch(status) {
                case 'Active': return 'bg-success';
                case 'Inactive': return 'bg-warning';
                case 'Suspended': return 'bg-danger';
                default: return 'bg-secondary';
            }
        }
    }
}
</script>

<style scoped>
.form-group-custom {
    margin-bottom: 1.25rem;
}

.form-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 0.75rem;
    letter-spacing: 0.05em;
}

.custom-input ::v-deep .form-control {
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    padding: 0.85rem 1.25rem;
    height: auto;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: #f8fafc;
    color: #1e293b;
}

.custom-input ::v-deep .form-control:focus {
    border-color: #fb923c33; /* Orange focus for edit */
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.05);
}

.custom-select-btn {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    padding: 0.85rem 1.25rem;
    height: auto;
    font-size: 1rem;
    transition: all 0.2s ease;
    outline: none;
    cursor: pointer;
}

.custom-select-btn:hover {
    background: #ffffff;
}

.dropdown-icon {
    color: #94a3b8;
    width: 14px;
}

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

.bg-orange-light { background-color: #fb923c11; }
.text-orange { color: #fb923c; }

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
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
    padding: 1.5rem 2rem;
}

::v-deep .modal-footer {
    border-top: 1px solid #f1f5f9;
    padding: 1.5rem 2.5rem;
}

.btn-cancel {
    color: #94a3b8 !important;
    font-weight: 600;
}

.btn-save-user {
    background-color: #fb923c !important;
    border-color: #fb923c !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    box-shadow: 0 10px 15px -3px rgba(251, 146, 60, 0.2);
}

.btn-save-user:hover:not(:disabled) {
    background-color: #f97316 !important;
    transform: translateY(-1px);
}
</style>
