<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="edit-assignment-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-orange-light text-orange mr-3">
                        <CIcon name="cil-pencil" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Edit Assignment Task' : 'แก้ไขคำสั่งงานย่อย' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Update the title and deadline for this specific task.' : 'อัปเดตหัวข้องานและกำหนดส่งสำหรับงานย่อยนี้' }}</p>
                    </div>
                </div>
                <button type="button" :disabled="saving" :aria-label="$i18n.locale === 'en' ? 'Close' : 'ปิด'" class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2 pb-4">
            <p v-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
            <!-- Basic Info Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label for="assignment-edit-title" class="form-label">{{ $i18n.locale === 'en' ? 'Assignment Title' : 'หัวข้องาน' }}</label>
                        <CInput 
                            id="assignment-edit-title" v-model="form.title"
                            :placeholder="$i18n.locale === 'en' ? 'e.g. Sketch 1: Basic Shapes' : 'เช่น วาดเส้น 1: รูปทรงพื้นฐาน'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Dates Row -->
            <CRow class="mb-4">
                <CCol md="6">
                    <div class="form-group-custom">
                        <label for="assignment-edit-startDateTime" class="form-label">{{ $i18n.locale === 'en' ? 'Start Date & Time' : 'วันและเวลาเริ่มต้น' }}</label>
                        <CInput 
                            id="assignment-edit-startDateTime" v-model="form.startDateTime"
                            :type="form.startDateTime ? 'datetime-local' : 'text'"
                            placeholder="วัน/เดือน/ปี --:--"
                            lang="en-GB"
                            @focus="$event.target.type = 'datetime-local'; if ($event.target.showPicker && navigator.userActivation && navigator.userActivation.isActive) $event.target.showPicker();"
                            @blur="!$event.target.value && ($event.target.type = 'text')"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label for="assignment-edit-endDateTime" class="form-label">{{ $i18n.locale === 'en' ? 'End Date & Time (Deadline)' : 'วันและเวลาสิ้นสุด (กำหนดส่ง)' }}</label>
                        <CInput 
                            id="assignment-edit-endDateTime" v-model="form.endDateTime"
                            :type="form.endDateTime ? 'datetime-local' : 'text'"
                            placeholder="วัน/เดือน/ปี --:--"
                            lang="en-GB"
                            @focus="$event.target.type = 'datetime-local'; if ($event.target.showPicker && navigator.userActivation && navigator.userActivation.isActive) $event.target.showPicker();"
                            @blur="!$event.target.value && ($event.target.type = 'text')"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Enrollment Metric -->
            <CRow class="mb-4">
                <CCol md="12">
                    <div class="form-group-custom mb-3">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Target Students' : 'กลุ่มเป้าหมายนักศึกษา' }}</label>
                        <div class="custom-input-readonly d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="font-weight-bold text-orange h5 mb-0 mr-2">{{ selectedStudents.length }}</span>
                                <span class="text-muted small uppercase font-weight-bold">{{ $i18n.locale === 'en' ? 'Students targeted for this task' : 'จำนวนนักศึกษาสำหรับส่งงานนี้' }}</span>
                            </div>
                            
                            <!-- Selected Avatars Preview -->
                            <div v-if="selectedStudents.length > 0" class="selected-avatars-preview d-flex align-items-center">
                                <div class="avatar-stack mr-2">
                                    <div 
                                        v-for="(student, idx) in selectedStudentDetails.slice(0, 5)" 
                                        :key="student._id"
                                        class="avatar-preview-sm"
                                        :style="{ backgroundColor: getAvatarColor(getStudentName(student)), zIndex: 10 - idx }"
                                        v-c-tooltip="getStudentName(student)"
                                    >
                                        {{ getInitials(getStudentName(student)) }}
                                    </div>
                                    <div v-if="selectedStudents.length > 5" class="avatar-more-sm">
                                        +{{ selectedStudents.length - 5 }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Detailed Selection Box (Wrapping) -->
                    <div v-if="selectedStudents.length > 0" class="selection-summary-box mb-4 animate-in">
                        <div class="d-flex flex-wrap py-1 px-1">
                            <div 
                                v-for="student in selectedStudentDetails" 
                                :key="'sel-' + student._id"
                                class="selected-tag mr-2 mb-2 d-flex align-items-center"
                            >
                                <div class="avatar-xs mr-2" :style="{ backgroundColor: getAvatarColor(getStudentName(student)) }">
                                    {{ getInitials(getStudentName(student)) }}
                                </div>
                                <span class="tag-name mr-2 text-truncate">{{ getStudentName(student) }}</span>
                                <button type="button" :aria-label="($i18n.locale === 'en' ? 'Remove learner: ' : 'นำผู้เรียนออก: ') + getStudentName(student)" class="btn-remove-tag" @click="toggleStudent(student)">
                                    <CIcon name="cil-x" size="sm" />
                                </button>
                            </div>
                        </div>
                    </div>
                </CCol>
            </CRow>

            <!-- Student Selection Section -->
            <div class="student-selection-wrapper mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <label class="form-label mb-0">{{ $i18n.locale === 'en' ? 'Assign to Students' : 'มอบหมายให้นักศึกษา' }}</label>
                    <button type="button" class="select-all-toggle" @click="toggleSelectAll">
                        <span class="text-orange small font-weight-bold pointer">{{ allSelected ? ($i18n.locale === 'en' ? 'Deselect All' : 'ยกเลิกเลือกทั้งหมด') : ($i18n.locale === 'en' ? 'Select All' : 'เลือกทั้งหมด') }}</span>
                    </button>
                </div>
                
                <div class="search-box-orange mb-3">
                    <CIcon name="cil-search" class="search-icon-orange" />
                    <input 
                        type="text" 
                        v-model="studentSearch" :aria-label="$i18n.locale === 'en' ? 'Search learners' : 'ค้นหาผู้เรียน'"
                        :placeholder="$i18n.locale === 'en' ? 'Search students by name or ID...' : 'ค้นหานักศึกษาจากชื่อหรือรหัส...'"
                        class="search-input-orange"
                    />
                </div>

                <div class="student-list-container">
                    <button type="button" :aria-pressed="isSelected(student._id) ? 'true' : 'false'"
                        v-for="student in filteredStudents" 
                        :key="student._id"
                        class="student-item"
                        :class="{ 'selected': isSelected(student._id) }"
                        @click="toggleStudent(student)"
                    >
                        <div class="d-flex align-items-center">
                            <div class="check-box-custom mr-3" :class="{ 'checked': isSelected(student._id) }">
                                <CIcon v-if="isSelected(student._id)" name="cil-check" size="sm" />
                            </div>
                            <div class="avatar-sm mr-3" :style="{ backgroundColor: getAvatarColor(getStudentName(student)) }">
                                {{ getInitials(getStudentName(student)) }}
                            </div>
                            <div>
                                <div class="student-name-text">{{ getStudentName(student) }}</div>
                                <div class="student-id-text">ID: {{ student.studentId || student.username || student._id }}</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <template #footer>
            <p v-if="hasDateRangeError" role="alert" class="text-danger w-100">{{ $i18n.locale === 'en' ? 'End dates must not precede start dates.' : 'วันสิ้นสุดต้องไม่อยู่ก่อนวันเริ่มต้น' }}</p>
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
                    color="warning" 
                    @click="handleUpdate"
                    class="btn-update-assignment"
                    :disabled="!isFormValid"
                    :loading="saving"
                    :loading-text="$i18n.locale === 'en' ? 'Updating...' : 'กำลังอัปเดต...'"
                >
                    {{ $i18n.locale === 'en' ? 'Update Assignment' : 'อัปเดตงาน' }}
                </LoadingButton>
            </div>
        </template>
</CModal>
</template>

<script>
import { hasInvalidSubmissionDates } from '@/utils/submissionDates'
export default {
    name: 'AssignmentEditModal',
    props: {
        error: { type: String, default: '' },
        show: {
            type: Boolean,
            default: false
        },
        assignmentData: {
            type: Object,
            default: () => null
        },
        enrolledStudents: {
            type: Array,
            default: () => []
        },
        saving: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            form: {
                id: null,
                title: '',
                startDateTime: '',
                endDateTime: '',
                description: ''
            },
            studentSearch: '',
            selectedStudents: []
        }
    },
    watch: {
        show(value) { if (value && this.assignmentData) { this.populateForm(this.assignmentData); this.studentSearch = ''; } },
        assignmentData: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.populateForm(newVal);
                }
            }
        }
    },
    computed: {
        hasDateRangeError() { return hasInvalidSubmissionDates({ assignments: [this.form] }); },
        isFormValid() {
            if (hasInvalidSubmissionDates({ assignments: [this.form] })) return false;
            return this.form.title && this.form.startDateTime && this.form.endDateTime;
        },
        filteredStudents() {
            if (!this.studentSearch) return this.enrolledStudents;
            const q = this.studentSearch.toLowerCase();
            return this.enrolledStudents.filter(s => {
                const name = this.getStudentName(s).toLowerCase();
                const studentId = (s.username || '').toLowerCase();
                return name.includes(q) || studentId.includes(q);
            });
        },
        allSelected() {
            return this.enrolledStudents && this.selectedStudents.length === this.enrolledStudents.length;
        },
        selectedStudentDetails() {
            if (!this.enrolledStudents) return [];
            return this.enrolledStudents.filter(s => this.selectedStudents.includes(s._id));
        }
    },
    methods: {
        getStudentName(student) {
            if (!student || !student.name) return 'N/A';
            if (typeof student.name === 'string') return student.name;
            if (Array.isArray(student.name)) {
                const nameObj = student.name.find(n => n.key === 'en') || student.name[0];
                return nameObj ? nameObj.value : 'N/A';
            }
            return 'N/A';
        },
        getName(lang, item) {
            if (!item || !item.title) return '';
            if (typeof item.title === 'string') return item.title;
            const nameObj = item.title.find(n => n.key === lang);
            return nameObj ? nameObj.value : (item.title[0] ? item.title[0].value : '');
        },
        populateForm(data) {
            this.form = {
                _id: data._id,
                title: this.getName('en', data),
                startDateTime: (data.create && data.create.startAt) ? this.formatDateTimeForInput(data.create.startAt) : '',
                endDateTime: (data.create && data.create.endAt) ? this.formatDateTimeForInput(data.create.endAt) : '',
                description: data.description || ''
            };
            // Map artist from backend to selectedStudents used in local form
            this.selectedStudents = data.artist ? data.artist.map(s => (typeof s === 'object' && s !== null && s._id ? s._id : s)) : 
                                    (data.selectedStudents ? [...data.selectedStudents] : 
                                    (this.enrolledStudents ? this.enrolledStudents.map(s => s._id) : []));
        },
        formatDateTimeForInput(date) {
            if (!date) return '';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        },
        isSelected(id) {
            return this.selectedStudents.includes(id);
        },
        toggleStudent(student) {
            const index = this.selectedStudents.indexOf(student._id);
            if (index > -1) {
                this.selectedStudents.splice(index, 1);
            } else {
                this.selectedStudents.push(student._id);
            }
        },
        toggleSelectAll() {
            if (this.allSelected) {
                this.selectedStudents = [];
            } else {
                this.selectedStudents = this.enrolledStudents.map(s => s._id);
            }
        },
        getInitials(name) {
            return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        },
        getAvatarColor(name) {
            const colors = ['#e06e64', '#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#a0aec0'];
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            return colors[Math.abs(hash) % colors.length];
        },
        handleUpdate() {
            if (!this.isFormValid) return;
            
            const assignmentData = {
                _id: this.form._id,
                title: [
                    { key: 'en', value: this.form.title },
                    { key: 'th', value: this.form.title }
                ],
                create: {
                    startAt: this.form.startDateTime,
                    endAt: this.form.endDateTime
                },
                selectedStudents: this.selectedStudents 
            };
            
            this.$emit('update', assignmentData);
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

.custom-input ::v-deep .form-control,
.custom-textarea ::v-deep .form-control {
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    padding: 0.85rem 1.25rem;
    height: auto;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: #f8fafc;
    color: #1e293b;
}

.custom-input ::v-deep .form-control:focus,
.custom-textarea ::v-deep .form-control:focus {
    border-color: #f6ad5533; /* Orange focus */
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(246, 173, 85, 0.05);
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

.bg-orange-light { background-color: #f6ad5511; }
.text-orange { color: #f6ad55; }

.close-btn {
    background: transparent;
    border: none;
    padding: 8px;
    color: #94a3b8;
    transition: color 0.2s;
}

.custom-input-readonly {
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    padding: 0.85rem 1.25rem;
    height: 54px;
}

/* Selected Summary styles */
.selected-avatars-preview {
    padding-right: 0.5rem;
}

.avatar-stack {
    display: flex;
    flex-direction: row-reverse;
}

.avatar-preview-sm, .avatar-more-sm {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 700;
    color: white;
    margin-left: -8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.avatar-more-sm {
    background: #e2e8f0;
    color: #475569;
    z-index: 15;
    margin-left: 0;
}

.selection-summary-box {
    background: #f1f5f944;
    border-radius: 12px;
    border: 1px dashed #cbd5e1;
    padding: 0.75rem 0.5rem 0.25rem 0.75rem;
    max-height: 200px;
    overflow-y: auto;
}

.selected-tag {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 30px;
    padding: 4px 6px 4px 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    max-width: 160px;
}

.avatar-xs {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.6rem;
    font-weight: 700;
}

.tag-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
}

.btn-remove-tag {
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-remove-tag:hover {
    background: #fee2e2;
    color: #ef4444;
}

.selection-summary-box::-webkit-scrollbar {
    width: 4px;
}

.selection-summary-box::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.animate-in {
    animation: fadeInSlide 0.3s ease-out;
}

@keyframes fadeInSlide {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Student Selection Styles */
.student-selection-wrapper {
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 1.5rem;
}

.search-box-orange {
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #fed7aa;
    border-radius: 10px;
    padding: 0 1rem;
    height: 44px;
}

.search-icon-orange {
    color: #fb923c;
    width: 16px;
    margin-right: 12px;
}

.search-input-orange {
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.9rem;
    color: #c2410c;
}

.student-list-container {
    max-height: 240px;
    overflow-y: auto;
    padding-right: 4px;
}

.student-list-container::-webkit-scrollbar {
    width: 4px;
}

.student-list-container::-webkit-scrollbar-thumb {
    background: #fed7aa;
    border-radius: 10px;
}

.student-item {
    padding: 0.75rem 1rem;
    border-radius: 10px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
    border: 1px solid #f1f5f9;
}

.student-item:hover {
    background: #f7fafc;
    border-color: #fed7aa;
}

.student-item.selected {
    background: #f7fafc;
    border-color: #f6ad55;
}

.check-box-custom {
    width: 20px;
    height: 20px;
    border: 2px solid #e2e8f0;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.check-box-custom.checked {
    background: #f6ad55;
    border-color: #f6ad55;
    color: white;
}

.avatar-sm {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
}

.student-name-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
}

.student-id-text {
    font-size: 0.75rem;
    color: #64748b;
}

.pointer { cursor: pointer; }
.uppercase { text-transform: uppercase; }

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

.btn-update-assignment {
    background-color: #f6ad55 !important;
    border-color: #f6ad55 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    box-shadow: 0 10px 15px -3px rgba(246, 173, 85, 0.2);
}

.btn-update-assignment:hover:not(:disabled) {
    background-color: #ed8936 !important;
    transform: translateY(-1px);
}
</style>
