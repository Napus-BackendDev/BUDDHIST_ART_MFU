<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="edit-user-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-orange-light text-orange mr-3">
                        <CIcon name="cil-pencil" size="lg" aria-hidden="true" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Edit User Account' : 'แก้ไขบัญชีผู้ใช้' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Modify user profile, system roles, and account status.' : 'ปรับเปลี่ยนโปรไฟล์ผู้ใช้, บทบาทในระบบ และสถานะบัญชี' }}</p>
                    </div>
                </div>
                <button class="close-btn" type="button" @click="$emit('update:show', false)" :aria-label="$i18n.locale === 'en' ? 'Close' : 'ปิดหน้าต่าง'">
                    <CIcon name="cil-x" size="sm" aria-hidden="true" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2" v-if="form">
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
                        <small v-if="isArtist" class="form-hint">
                            {{ $i18n.locale === 'en' ? 'Official Email is generated automatically from the Student ID.' : 'ระบบจะสร้างอีเมลทางการจากรหัสนักศึกษาให้อัตโนมัติ' }}
                        </small>
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
                            <div class="w-100 shadow-sm border-0 mt-1">
                                <CDropdownItem v-for="r in roleOptions" :key="r._id" @click="handleRoleSelect(r)">
                                    {{ r.name }}
                                </CDropdownItem>
                            </div>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Status Row -->
            <CRow v-if="isArtist">
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Account Status' : 'สถานะบัญชี' }}</label>
                        <CDropdown :key="form.statusId" :caret="false" class="w-100">
                            <template #toggler>
                                <CButton class="custom-select-btn">
                                    <div class="d-flex align-items-center">
                                        <div :class="['status-dot mr-2', getStatusDotClass(form.statusNameEn)]"></div>
                                        <span class="text-dark">{{ getStatusLabel() || ($i18n.locale === 'en' ? 'Select Status' : 'เลือกสถานะ') }}</span>
                                    </div>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </CButton>
                            </template>
                            <div class="w-100 shadow-sm border-0 mt-1">
                                <CDropdownItem v-for="s in statuses" :key="s._id" @click="handleStatusSelect(s)">
                                    <div class="d-flex align-items-center">
                                        <div :class="['status-dot mr-2', getStatusDotClass(s.nameEn)]"></div>
                                        {{ s.name }}
                                    </div>
                                </CDropdownItem>
                            </div>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Course Row -->
            <CRow v-if="isArtist">
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label" for="user-edit-course">{{ $i18n.locale === 'en' ? 'Course' : 'หลักสูตร' }}</label>
                        <select id="user-edit-course" v-model="form.course" class="form-control custom-input">
                            <option value="">{{ $i18n.locale === 'en' ? 'Not specified' : 'ไม่ระบุ' }}</option>
                            <option v-for="c in courses" :key="c.value" :value="c.value">{{ $i18n.locale === 'en' ? c.en : c.th }}</option>
                        </select>
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

            <!-- Contacts Row -->
            <CRow>
                <CCol md="6" v-if="form.roleNameEn !== 'Customer'">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Official Email' : 'อีเมลทางการ' }}</label>
                        <CInput
                            v-if="!isArtist"
                            v-model="form.email" 
                            type="email" 
                            placeholder="official@edu.com" 
                            class="custom-input mb-0"
                        />
                        <CInput
                            v-else
                            :value="officialEmail"
                            type="email"
                            readonly
                            :placeholder="$i18n.locale === 'en' ? 'Enter Student ID above' : 'กรอกรหัสนักศึกษาด้านบน'"
                            class="custom-input mb-0 official-email-readonly"
                            :aria-describedby="'official-email-help-edit'"
                        />
                        <small v-if="isArtist" id="official-email-help-edit" class="form-hint">
                            {{ $i18n.locale === 'en' ? 'Format: StudentID@lamduan.mfu.ac.th' : 'รูปแบบ: รหัสนักศึกษา@lamduan.mfu.ac.th' }}
                        </small>
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

            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Telephone' : 'เบอร์โทรศัพท์' }}</label>
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
            <MissingFieldsHint class="w-100 mb-2" :labels="missingFields" />
            <div class="w-100 d-flex justify-content-end align-items-center py-2">
                <CButton 
                    variant="ghost" 
                    @click="$emit('update:show', false)"
                    class="btn-cancel mr-3"
                    :disabled="saving"
                >
                    {{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
                </CButton>
                <LoadingButton 
                    color="primary" 
                    @click="handleSave"
                    class="btn-save-user"
                    :disabled="!isFormValid"
                    :loading="saving"
                    :loading-text="$i18n.locale === 'en' ? 'Updating...' : 'กำลังอัปเดต...'"
                >
                    {{ $i18n.locale === 'en' ? 'Save Changes' : 'บันทึกการเปลี่ยนแปลง' }}
                </LoadingButton>
            </div>
        </template>
    </CModal>
</template>

<script>
import { buildOfficialEmail, isArtistRole } from '@/utils/officialEmail';
import { dedupeRoles } from '@/utils/roles';
import { COURSES, normalizeCourse } from '@/utils/courses';
import MissingFieldsHint from '@/components/MissingFieldsHint.vue';
import { missingLabels, dimensionsOk, priceOk } from '@/utils/missingFields';

export default {
    name: 'UserEditModal',
    components: { MissingFieldsHint },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        user: {
            type: Object,
            default: () => null
        },
        saving: {
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
            courses: COURSES,
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
        isCustomer() {
            return this.form && String(this.form.roleNameEn).toLowerCase() === 'customer';
        },
        roleOptions() {
            return dedupeRoles(this.roles);
        },
        isArtist() {
            return this.form ? isArtistRole(this.form.roleNameEn) : false;
        },
        officialEmail() {
            if (!this.form) return '';
            return this.isArtist
                ? buildOfficialEmail(this.form.studentId)
                : this.form.email;
        },
        missingFields() {
            if (!this.form) return [];
            const name = this.isCustomer ? this.form.nameTh : this.form.nameEn;
            const email = this.isCustomer ? this.form.personalEmail : this.officialEmail;
            return missingLabels([
                ['studentId', String(this.form.studentId).trim() !== ''],
                ['role', !!this.form.roleId],
                ...(this.isArtist ? [['status', !!this.form.statusId]] : []),
                ['name', String(name || '').trim() !== ''],
                ['email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())]
            ], this.$i18n.locale);
        },
        isFormValid() {
            if (!this.form) return false;
            const name = this.isCustomer ? this.form.nameTh : this.form.nameEn;
            const email = this.isCustomer ? this.form.personalEmail : this.officialEmail;
            const baseValid = String(this.form.studentId).trim() && this.form.roleId &&
                String(name || '').trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
            if (this.isArtist) {
                return baseValid && this.form.statusId;
            }
            return baseValid;
        }
    },
    methods: {
        getRoleLabel() {
            if (!this.form || !this.form.roleId) return '';
            const found = this.roles.find(r => r._id === this.form.roleId);
            return found ? found.name : this.form.roleName;
        },
        getStatusLabel() {
            if (!this.form || !this.form.statusId) return '';
            const found = this.statuses.find(s => s._id === this.form.statusId);
            return found ? found.name : this.form.statusName;
        },
        handleRoleSelect(role) {
            this.$set(this.form, 'roleId', role._id);
            this.$set(this.form, 'roleName', role.name);
            this.$set(this.form, 'roleNameEn', role.nameEn);
            // If the role is not Artist, clear the status fields
            if (!isArtistRole(role.nameEn)) {
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
                if (!role) return { id: '', name: '', nameEn: '' };
                
                // If role is an object with _id (populated)
                if (typeof role === 'object' && role._id) {
                    const titleEn = role.title && Array.isArray(role.title) ? role.title.find(t => t.key === 'en') : null;
                    const nameEn = titleEn ? titleEn.value : (role.title && role.title[0] ? role.title[0].value : 'Unknown');
                    const lang = this.$i18n.locale || 'en';
                    const titleLang = role.title && Array.isArray(role.title) ? (role.title.find(t => t.key === lang) || titleEn) : null;
                    const name = titleLang ? titleLang.value : nameEn;
                    return { id: role._id, name, nameEn };
                }
                
                // If role is an ID string or Name string
                const found = this.roles.find(r => r._id === role || r.nameEn === role || r.name === role);
                if (found) return { id: found._id, name: found.name, nameEn: found.nameEn };
                
                return { id: role, name: role, nameEn: role }; // Fallback
            };

            const getStatusInfo = () => {
                const status = this.user.status;
                if (!status) return { id: '', name: '', nameEn: '' };
                
                // If status is an object with _id (populated)
                if (typeof status === 'object' && status._id) {
                    const titleEn = status.title && Array.isArray(status.title) ? status.title.find(t => t.key === 'en') : null;
                    const nameEn = titleEn ? titleEn.value : (status.title && status.title[0] ? status.title[0].value : 'Unknown');
                    const lang = this.$i18n.locale || 'en';
                    const titleLang = status.title && Array.isArray(status.title) ? (status.title.find(t => t.key === lang) || titleEn) : null;
                    const name = titleLang ? titleLang.value : nameEn;
                    return { id: status._id, name, nameEn };
                }
                
                // If status is an ID string or Name string, find it in the statuses prop
                const found = this.statuses.find(s => s._id === status || s.nameEn === status || s.name === status);
                if (found) return { id: found._id, name: found.name, nameEn: found.nameEn };
                
                return { id: status, name: status, nameEn: status }; // Fallback
            };

            const roleInfo = getRoleInfo();
            const statusInfo = getStatusInfo();

            this.form = {
                _id: this.user._id,
                studentId: this.user.studentId || '',
                roleId: roleInfo.id,
                roleName: roleInfo.name,
                roleNameEn: roleInfo.nameEn,
                course: normalizeCourse(this.user.course),
                statusId: statusInfo.id,
                statusName: statusInfo.name,
                statusNameEn: statusInfo.nameEn,
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
                course: normalizeCourse(this.form.course),
                name: [
                    { key: 'th', value: this.form.nameTh },
                    { key: 'en', value: this.form.nameEn || (this.isCustomer ? this.form.nameTh : '') }
                ],
                contact: {
                    ...(this.isCustomer ? {} : { studentEmail: this.officialEmail }),
                    personalEmail: this.form.personalEmail,
                    telephone: this.form.telephone
                }
            };

            this.$emit('save', payload);
        },
        getStatusDotClass(status) {
            if (!status) return 'bg-secondary';
            const s = status.toLowerCase();
            switch(s) {
                case 'active': return 'bg-success';
                case 'inactive': return 'bg-warning';
                case 'suspended': return 'bg-danger';
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

.form-hint {
    display: block;
    color: #94a3b8;
    font-size: 0.75rem;
    margin-top: 0.4rem;
}

.official-email-readonly ::v-deep .form-control {
    background-color: #fff7ed;
    color: #475569;
    cursor: copy;
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
