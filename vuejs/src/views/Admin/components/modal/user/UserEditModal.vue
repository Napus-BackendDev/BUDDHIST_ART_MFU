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
                                    <span class="text-dark">{{ form.role || 'Select Role' }}</span>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </button>
                            </template>
                            <CDropdownItem @click="form.role = 'Admin'">Admin</CDropdownItem>
                            <CDropdownItem @click="form.role = 'Developer'">Developer</CDropdownItem>
                            <CDropdownItem @click="form.role = 'Evaluator'">Evaluator</CDropdownItem>
                            <CDropdownItem @click="form.role = 'Customer'">Customer</CDropdownItem>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Status Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Account Status</label>
                        <CDropdown :caret="false" class="w-100">
                            <template #toggler>
                                <button class="custom-select-btn">
                                    <div class="d-flex align-items-center">
                                        <div :class="['status-dot mr-2', getStatusDotClass(form.status)]"></div>
                                        <span class="text-dark">{{ form.status || 'Select Status' }}</span>
                                    </div>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </button>
                            </template>
                            <CDropdownItem @click="form.status = 'Active'">Active</CDropdownItem>
                            <CDropdownItem @click="form.status = 'Inactive'">Inactive</CDropdownItem>
                            <CDropdownItem @click="form.status = 'Suspended'">Suspended</CDropdownItem>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Names Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Full Name (Thai)</label>
                        <CInput 
                            v-model="form.nameTh" 
                            placeholder="ภาษาไทย" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
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
                <CCol md="6">
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
                <CCol md="6">
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
            return this.form && this.form.studentId && this.form.nameEn && this.form.email;
        }
    },
    methods: {
        initForm() {
            this.form = {
                id: this.user.id,
                studentId: this.user.studentId || this.user.student_id || '',
                role: this.user.role || 'Customer',
                status: this.user.status || 'Active',
                nameTh: this.user.nameTh || this.user.name || '',
                nameEn: this.user.nameEn || this.user.name || '',
                email: this.user.email || this.user.email_office || '',
                personalEmail: this.user.personalEmail || this.user.email_personal || '',
                telephone: this.user.telephone || this.user.tel || ''
            };
        },
        handleSave() {
            if (!this.isFormValid) return;
            this.$emit('save', { ...this.form });
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
