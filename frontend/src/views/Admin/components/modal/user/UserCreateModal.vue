<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="create-user-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-user-plus" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Add New User' : 'เพิ่มผู้ใช้ใหม่' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Enter user details manually to create a new system account.' : 'กรอกรายละเอียดผู้ใช้ด้วยตนเองเพื่อสร้างบัญชีใหม่ในระบบ' }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2">
            <!-- Account Info Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Student ID / Username' : 'รหัสนักศึกษา / ชื่อผู้ใช้' }}</label>
                        <CInput 
                            v-model="form.studentId" 
                            placeholder="e.g. 66xxxxxxxx" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'System Role' : 'บทบาทในระบบ' }}</label>
                        <CDropdown :key="form.roleId" :caret="false" class="w-100">
                            <template #toggler>
                                <CButton class="custom-select-btn">
                                    <span class="text-dark">{{ getRoleLabel() || ($i18n.locale === 'en' ? 'Select Role' : 'เลือกบทบาท') }}</span>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </CButton>
                            </template>
                            <CDropdownMenu class="w-100 shadow-sm border-0 mt-1">
                                <CDropdownItem v-for="r in roles" :key="r._id" @click="handleRoleSelect(r)">
                                    {{ r.name }}
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <CRow>
                <CCol md="12" v-if="form.roleNameEn === 'Artist'">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Account Status' : 'สถานะบัญชี' }}</label>
                        <CDropdown :key="form.statusId" :caret="false" class="w-100">
                            <template #toggler>
                                <CButton class="custom-select-btn">
                                    <span class="text-dark">{{ getStatusLabel() || ($i18n.locale === 'en' ? 'Select Status' : 'เลือกสถานะ') }}</span>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </CButton>
                            </template>
                            <CDropdownMenu class="w-100 shadow-sm border-0 mt-1">
                                <CDropdownItem v-for="s in statuses" :key="s._id" @click="handleStatusSelect(s)">
                                    {{ s.name }}
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Names Row -->
            <CRow>
                <CCol :md="form.roleNameEn === 'Customer' ? '12' : '6'">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Full Name (Thai)' : 'ชื่อ-นามสกุล (ภาษาไทย)' }}</label>
                        <CInput 
                            v-model="form.nameTh" 
                            placeholder="ภาษาไทย" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6" v-if="form.roleNameEn !== 'Customer'">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Full Name (English)' : 'ชื่อ-นามสกุล (ภาษาอังกฤษ)' }}</label>
                        <CInput 
                            v-model="form.nameEn" 
                            placeholder="English name" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Contacts Row 1 -->
            <CRow>
                <CCol md="6" v-if="form.roleNameEn !== 'Customer'">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Official Email' : 'อีเมลทางการ' }}</label>
                        <CInput 
                            v-model="form.email" 
                            type="email" 
                            placeholder="official@edu.com" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol :md="form.roleNameEn === 'Customer' ? '12' : '6'">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Personal Email' : 'อีเมลส่วนตัว' }}</label>
                        <CInput 
                            v-model="form.personalEmail" 
                            type="email" 
                            placeholder="personal@gmail.com" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Contacts Row 2 -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Telephone' : 'เบอร์โทรศัพท์' }}</label>
                        <CInput 
                            v-model="form.telephone" 
                            placeholder="08x-xxx-xxxx" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Temporary Password' : 'รหัสผ่านชั่วคราว' }}</label>
                        <CInput 
                            v-model="form.password" 
                            type="password" 
                            :placeholder="$i18n.locale === 'en' ? 'Enter password' : 'กรอกรหัสผ่าน'"
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
                    {{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
                </CButton>
                <CButton 
                    color="primary" 
                    @click="handleSave"
                    class="btn-create-user"
                    :disabled="!isFormValid"
                >
                    {{ $i18n.locale === 'en' ? 'Create User Account' : 'สร้างบัญชีผู้ใช้' }}
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'UserCreateModal',
    props: {
        show: {
            type: Boolean,
            default: false
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
            form: {
                studentId: '',
                roleId: '',
                roleName: '',
                roleNameEn: '',
                statusId: '',
                statusName: '',
                statusNameEn: '',
                nameTh: '',
                nameEn: '',
                email: '',
                personalEmail: '',
                telephone: '',
                password: ''
            }
        }
    },
    computed: {
        isFormValid() {
            const baseValid = this.form.studentId && this.form.roleId && this.form.nameEn && this.form.email && this.form.password;
            if (this.form.roleNameEn === 'Artist') {
                return baseValid && this.form.statusId;
            }
            return baseValid;
        }
    },
    methods: {
        getRoleLabel() {
            if (!this.form.roleId) return '';
            const found = this.roles.find(r => r._id === this.form.roleId);
            return found ? found.name : this.form.roleName;
        },
        getStatusLabel() {
            if (!this.form.statusId) return '';
            const found = this.statuses.find(s => s._id === this.form.statusId);
            return found ? found.name : this.form.statusName;
        },
        handleRoleSelect(role) {
            this.$set(this.form, 'roleId', role._id);
            this.$set(this.form, 'roleName', role.name);
            this.$set(this.form, 'roleNameEn', role.nameEn);
            // If the role is not Artist, clear the status fields so validation holds
            if (role.nameEn !== 'Artist') {
                this.$set(this.form, 'statusId', '');
                this.$set(this.form, 'statusName', '');
                this.$set(this.form, 'statusNameEn', '');
            }
        },
        handleStatusSelect(status) {
            this.$set(this.form, 'statusId', status._id);
            this.$set(this.form, 'statusName', status.name);
            this.$set(this.form, 'statusNameEn', status.nameEn);
        },
        handleSave() {
            if (!this.isFormValid) return;
            const payload = {
                studentId: this.form.studentId,
                role: this.form.roleId,
                name: [
                    { key: 'th', value: this.form.nameTh },
                    { key: 'en', value: this.form.nameEn }
                ],
                contact: {
                    studentEmail: this.form.email,
                    personalEmail: this.form.personalEmail,
                    telephone: this.form.telephone
                },
                status: this.form.statusId || null,
                password: this.form.password
            };

            this.$emit('save', payload);
            this.resetForm();
        },
        resetForm() {
            this.form = {
                studentId: '',
                roleId: '',
                roleName: '',
                roleNameEn: '',
                statusId: '',
                statusName: '',
                statusNameEn: '',
                nameTh: '',
                nameEn: '',
                email: '',
                personalEmail: '',
                telephone: '',
                password: ''
            };
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
    border-color: #3b82f633;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
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

.bg-blue-light { background-color: #3b82f611; }
.text-blue { color: #3b82f6; }

.close-btn {
    background: transparent;
    border: none;
    padding: 8px;
    color: #94a3b8;
    transition: color 0.2s;
}

::v-deep .modal-content {
    border-radius: 20px;
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

.btn-create-user {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

.btn-create-user:hover:not(:disabled) {
    background-color: #2563eb !important;
    transform: translateY(-1px);
}
</style>
