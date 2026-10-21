<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="create-assignment-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-task" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Create New Assignment Task' : 'สร้างคำสั่งงานย่อยใหม่' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Add a specific task or milestone to this submission portal.' : 'เพิ่มงานหรือกิจกรรมย่อยในช่องทางส่งงานนี้' }}</p>
                    </div>
                </div>
                <button type="button" :disabled="saving" :aria-label="$i18n.locale === 'en' ? 'Close' : 'ปิด'" class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2">
            <p v-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
            <!-- Basic Info Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label for="assignment-create-title" class="form-label">{{ $i18n.locale === 'en' ? 'Assignment Title' : 'หัวข้องาน' }}</label>
                        <CInput 
                            id="assignment-create-title" v-model="form.title"
                            :placeholder="$i18n.locale === 'en' ? 'e.g. Sketch 1: Basic Shapes' : 'เช่น วาดเส้น 1: รูปทรงพื้นฐาน'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Dates Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label for="assignment-create-startDateTime" class="form-label">{{ $i18n.locale === 'en' ? 'Start Date & Time' : 'วันและเวลาเริ่มต้น' }}</label>
                        <CInput 
                            id="assignment-create-startDateTime" v-model="form.startDateTime"
                            :type="form.startDateTime ? 'datetime-local' : 'text'"
                            placeholder="วัน/เดือน/ปี --:--"
                            lang="en-GB"
                            @focus="$event.target.type = 'datetime-local'; if ($event.target.showPicker) $event.target.showPicker();"
                            @blur="!$event.target.value && ($event.target.type = 'text')"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label for="assignment-create-endDateTime" class="form-label">{{ $i18n.locale === 'en' ? 'End Date & Time (Deadline)' : 'วันและเวลาสิ้นสุด (กำหนดส่ง)' }}</label>
                        <CInput 
                            id="assignment-create-endDateTime" v-model="form.endDateTime"
                            :type="form.endDateTime ? 'datetime-local' : 'text'"
                            placeholder="วัน/เดือน/ปี --:--"
                            lang="en-GB"
                            @focus="$event.target.type = 'datetime-local'; if ($event.target.showPicker) $event.target.showPicker();"
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
                                <span class="font-weight-bold text-blue h5 mb-0 mr-2">{{ selectedStudents.length }}</span>
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
                        <span class="text-blue small font-weight-bold pointer">{{ allSelected ? ($i18n.locale === 'en' ? 'Deselect All' : 'ยกเลิกเลือกทั้งหมด') : ($i18n.locale === 'en' ? 'Select All' : 'เลือกทั้งหมด') }}</span>
                    </button>
                </div>
                
                <div class="search-box-blue mb-3">
                    <CIcon name="cil-search" class="search-icon-blue" />
                    <input 
                        type="text" 
                        v-model="studentSearch" :aria-label="$i18n.locale === 'en' ? 'Search learners' : 'ค้นหาผู้เรียน'"
                        :placeholder="$i18n.locale === 'en' ? 'Search students by name or ID...' : 'ค้นหานักศึกษาจากชื่อหรือรหัส...'"
                        class="search-input-blue"
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
                                <div class="student-id-text">ID: {{ student.studentId }}</div>
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
                    color="info" 
                    @click="handleSave"
                    class="btn-create-assignment"
                    :disabled="!isFormValid"
                    :loading="saving"
                    :loading-text="$i18n.locale === 'en' ? 'Creating...' : 'กำลังสร้าง...'"
                >
                    {{ $i18n.locale === 'en' ? 'Create Assignment' : 'มอบหมายงาน' }}
                </LoadingButton>
            </div>
        </template>
</CModal>
</template>

<script>
import { hasInvalidSubmissionDates } from '@/utils/submissionDates'
export default {
    name: 'AssignmentCreateModal',
    props: {
        error: { type: String, default: '' },
        show: {
            type: Boolean,
            default: false
        },
        // Enrolled students in the submission portal
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
        show(value) { if (value) this.resetForm(); },
        enrolledStudents: {
            immediate: true,
            handler(newVal) {
                if (newVal && newVal.length > 0 && this.selectedStudents.length === 0) {
                    // Default to all enrolled students being targeted
                    this.selectedStudents = newVal.map(s => s._id);
                }
            }
        }
    },
    computed: {
        hasDateRangeError() { return hasInvalidSubmissionDates({ assignments: [this.form] }); },
        isFormValid() {
            if (hasInvalidSubmissionDates({ assignments: [this.form] })) return false;
            return this.form.title && this.form.startDateTime && this.form.endDateTime && this.selectedStudents.length > 0;
        },
        filteredStudents() {
            if (!this.studentSearch) return this.enrolledStudents;
            const q = this.studentSearch.toLowerCase();
            return this.enrolledStudents.filter(s => {
                const name = this.getStudentName(s).toLowerCase();
                const studentId = (s.studentId || s.username || '').toLowerCase();
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
        handleSave() {
            if (!this.isFormValid) return;
            this.$emit('save', { 
                title: this.form.title, // Parent will wrap this
                startDateTime: this.form.startDateTime,
                endDateTime: this.form.endDateTime,
                selectedStudents: this.selectedStudents 
            });
        },
        resetForm() {
            this.form = {
                title: '',
                startDateTime: '',
                endDateTime: '',
                description: ''
            };
            this.selectedStudents = this.enrolledStudents.map(s => s._id);
            this.studentSearch = '';
        }
    }
}
</script>

<style scoped>
.student-item { width: 100%; text-align: left; font: inherit; color: inherit; }
.select-all-toggle { border: 0; background: transparent; font: inherit; }
.student-item:focus-visible, .select-all-toggle:focus-visible { outline: 3px solid #321fdb; outline-offset: 2px; }
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
    border-color: #3182ce33; /* Blue focus */
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.05);
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

.bg-blue-light { background-color: #3182ce11; }
.text-blue { color: #3182ce; }

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

.search-box-blue {
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #bee3f8;
    border-radius: 10px;
    padding: 0 1rem;
    height: 44px;
}

.search-icon-blue {
    color: #4299e1;
    width: 16px;
    margin-right: 12px;
}

.search-input-blue {
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.9rem;
    color: #2b6cb0;
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
    background: #bee3f8;
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
    border-color: #ebf8ff;
}

.student-item.selected {
    background: #f7fafc;
    border-color: #4299e1;
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
    background: #4299e1;
    border-color: #4299e1;
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

.btn-create-assignment {
    background-color: #4299e1 !important;
    border-color: #4299e1 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    box-shadow: 0 10px 15px -3px rgba(66, 153, 225, 0.2);
}

.btn-create-assignment:hover:not(:disabled) {
    background-color: #3182ce !important;
    transform: translateY(-1px);
}
</style>
