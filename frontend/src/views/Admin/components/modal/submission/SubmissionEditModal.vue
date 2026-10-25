<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="edit-submission-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-orange-light text-orange mr-3">
                        <CIcon name="cil-pencil" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Edit Submission Portal' : 'แก้ไขช่องทางส่งงาน' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Update the details and assignments for this submission portal.' : 'อัปเดตรายละเอียดและใบงานสำหรับช่องทางส่งงานนี้' }}</p>
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
                <CCol md="8">
                    <div class="form-group-custom">
                        <label for="submission-edit-title" class="form-label">{{ $i18n.locale === 'en' ? 'Submission Title' : 'หัวข้อหลักการส่งงาน' }}</label>
                        <CInput 
                            id="submission-edit-title" v-model="form.title"
                            :placeholder="$i18n.locale === 'en' ? 'e.g. Midterm Art Project 2024' : 'เช่น โครงการศิลปะกลางภาค 2568'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="4">
                    <div class="form-group-custom">
                        <label for="submission-edit-courseLevel" class="form-label">{{ $i18n.locale === 'en' ? 'Course Level' : 'ระดับหลักสูตร' }}</label>
                        <CInput
                            id="submission-edit-courseLevel" v-model="form.courseLevel"
                            placeholder="01"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Dates Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label for="submission-edit-startDate" class="form-label">{{ $i18n.locale === 'en' ? 'Start Date' : 'วันที่เริ่มรับงาน' }}</label>
                        <CInput 
                            id="submission-edit-startDate" v-model="form.startDate"
                            :type="form.startDate ? 'date' : 'text'"
                            placeholder="วัน/เดือน/ปี"
                            lang="en-GB"
                            @focus="$event.target.type = 'date'; if ($event.target.showPicker && navigator.userActivation && navigator.userActivation.isActive) $event.target.showPicker();"
                            @blur="!$event.target.value && ($event.target.type = 'text')"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label for="submission-edit-dueDate" class="form-label">{{ $i18n.locale === 'en' ? 'Due Date (Deadline)' : 'วันที่สิ้นสุด (กำหนดส่ง)' }}</label>
                        <CInput 
                            id="submission-edit-dueDate" v-model="form.dueDate"
                            :type="form.dueDate ? 'date' : 'text'"
                            placeholder="วัน/เดือน/ปี"
                            lang="en-GB"
                            @focus="$event.target.type = 'date'; if ($event.target.showPicker && navigator.userActivation && navigator.userActivation.isActive) $event.target.showPicker();"
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
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Enrollment Summary' : 'สรุปการลงทะเบียนเรียน' }}</label>
                        <div class="custom-input-readonly d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="font-weight-bold text-orange h5 mb-0 mr-2">{{ selectedStudents.length }}</span>
                                <span class="text-muted small uppercase font-weight-bold">{{ $i18n.locale === 'en' ? 'Students officially enrolled' : 'นักศึกษาที่ได้ทำการลงทะเบียนแล้ว' }}</span>
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
                    <label class="form-label mb-0">{{ $i18n.locale === 'en' ? 'Select Students to Enroll' : 'เลือกนักศึกษาลงทะเบียน' }}</label>
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
                                <div class="student-id-text">ID: {{ student.studentId }}</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Dynamic Assignments Section -->
            <div class="dynamic-assignments-wrapper mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <label class="form-label mb-0">{{ $i18n.locale === 'en' ? 'Sub-Assignments Tasks' : 'หัวข้อย่อย / ใบงาน' }}</label>
                    <CButton 
                        size="sm" 
                        color="warning" 
                        variant="ghost" 
                        class="btn-add-task"
                        @click="addAssignment"
                    >
                        <CIcon name="cil-plus" class="mr-1" /> {{ $i18n.locale === 'en' ? 'Add Task' : 'เพิ่มใบงาน' }}
                    </CButton>
                </div>

                <div class="assignments-list">
                    <div v-for="(assignment, index) in form.assignments" :key="assignment.id" class="assignment-task-item mb-3">
                        <div class="task-card-orange p-3 shadow-sm border rounded-lg bg-white">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="task-number text-orange-dark small font-weight-bold">{{ $i18n.locale === 'en' ? 'Task #' : 'ใบงานที่ ' }}{{ index + 1 }}</div>
                                <button 
                                    v-if="form.assignments.length > 1" 
                                    class="btn-remove-task-pill" 
                                    @click="removeAssignment(index)"
                                >
                                    <CIcon name="cil-trash" size="sm" class="mr-1" /> {{ $i18n.locale === 'en' ? 'Remove' : 'ลบออก' }}
                                </button>
                            </div>
                            
                            <CRow>
                                <CCol md="12" class="mb-2">
                                    <input 
                                        v-model="assignment.title" :aria-label="($i18n.locale === 'en' ? 'Task title ' : 'หัวข้อใบงานที่ ') + (index + 1)"
                                        :placeholder="$i18n.locale === 'en' ? 'Assignment Title (e.g. Sketch 1: Perspective)' : 'หัวข้อใบงาน (เช่น ภาพร่าง 1: ทัศนียภาพ)'" 
                                        class="task-input-premium w-100"
                                    />
                                </CCol>
                                <CCol md="6">
                                    <div class="date-picker-mini">
                                        <label class="mini-label">{{ $i18n.locale === 'en' ? 'Start Date & Time' : 'วันและเวลาเริ่มต้น' }}</label>
                                        <input 
                                            :type="assignment.startDateTime ? 'datetime-local' : 'text'" 
                                            placeholder="วัน/เดือน/ปี --:--"
                                            lang="en-GB"
                                            v-model="assignment.startDateTime" :aria-label="($i18n.locale === 'en' ? 'Task start ' : 'วันเริ่มใบงานที่ ') + (index + 1)"
                                            @focus="$event.target.type = 'datetime-local'; if ($event.target.showPicker && navigator.userActivation && navigator.userActivation.isActive) $event.target.showPicker();"
                                            @blur="!$event.target.value && ($event.target.type = 'text')"
                                            class="mini-date-input"
                                        />
                                    </div>
                                </CCol>
                                <CCol md="6">
                                    <div class="date-picker-mini">
                                        <label class="mini-label">{{ $i18n.locale === 'en' ? 'End Date & Time' : 'วันและเวลาสิ้นสุด (กำหนดส่ง)' }}</label>
                                        <input 
                                            :type="assignment.endDateTime ? 'datetime-local' : 'text'" 
                                            placeholder="วัน/เดือน/ปี --:--"
                                            lang="en-GB"
                                            v-model="assignment.endDateTime" :aria-label="($i18n.locale === 'en' ? 'Task deadline ' : 'กำหนดส่งใบงานที่ ') + (index + 1)"
                                            @focus="$event.target.type = 'datetime-local'; if ($event.target.showPicker && navigator.userActivation && navigator.userActivation.isActive) $event.target.showPicker();"
                                            @blur="!$event.target.value && ($event.target.type = 'text')"
                                            class="mini-date-input"
                                        />
                                    </div>
                                </CCol>
                            </CRow>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <p v-if="hasDateRangeError" role="alert" class="text-danger w-100">{{ $i18n.locale === 'en' ? 'End dates must not precede start dates.' : 'วันสิ้นสุดต้องไม่อยู่ก่อนวันเริ่มต้น กรุณาตรวจสอบช่วงวันที่ของ Submission และใบงาน' }}</p>
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
                    class="btn-update-submission"
                    :disabled="!isFormValid"
                    :loading="saving"
                    :loading-text="$i18n.locale === 'en' ? 'Updating...' : 'กำลังอัปเดต...'"
                >
                    {{ $i18n.locale === 'en' ? 'Update Submission Portal' : 'อัปเดตช่องทางส่งงาน' }}
                </LoadingButton>
            </div>
        </template>
</CModal>
</template>

<script>
import { hasInvalidSubmissionDates } from '@/utils/submissionDates'
import { mapGetters } from 'vuex'

export default {
    name: 'SubmissionEditModal',
    props: {
        error: { type: String, default: '' },
        show: {
            type: Boolean,
            default: false
        },
        submissionData: {
            type: Object,
            default: () => null
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
                courseLevel: '',
                startDate: '',
                dueDate: '',
                assignments: []
            },
            studentSearch: '',
            selectedStudents: []
        }
    },
    created() {
        if (!this.availableStudents || this.availableStudents.length === 0) {
            this.$store.dispatch('user/get', {});
        }
    },
    watch: {
        show(value) {
            if (value && this.submissionData) { this.populateForm(this.submissionData); this.studentSearch = ''; }
        },
        submissionData: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.populateForm(newVal);
                }
            }
        }
    },
    computed: {
        ...mapGetters({
            availableStudents: 'user/user'
        }),
        hasDateRangeError() { return hasInvalidSubmissionDates(this.form); },
        isFormValid() {
            if (hasInvalidSubmissionDates(this.form)) return false;
            const hasAssignments = this.form.assignments.length > 0 && 
                this.form.assignments.every(a => {
                    const title = typeof a.title === 'string' ? a.title : this.getName('en', a);
                    return title && title.trim() !== '' && (a.startDateTime || (a.create && a.create.startAt)) && (a.endDateTime || (a.create && a.create.endAt));
                });
            return this.form.title && this.form.startDate && this.form.dueDate && this.selectedStudents.length > 0 && hasAssignments;
        },
        filteredStudents() {
            if (!this.availableStudents) return [];
            const q = this.studentSearch.toLowerCase();
            return this.availableStudents.filter(s => {
                // Only show Artists
                if (this.getRoleName(s.role) !== 'Artist') return false;

                const name = this.getStudentName(s).toLowerCase();
                const studentId = (s.studentId || s.username || '').toLowerCase();
                return name.includes(q) || studentId.includes(q);
            });
        },
        allSelected() {
            const artists = this.availableStudents.filter(s => this.getRoleName(s.role) === 'Artist');
            return artists.length > 0 && this.selectedStudents.length === artists.length;
        },
        selectedStudentDetails() {
            if (!this.availableStudents) return [];
            return this.availableStudents.filter(s => this.selectedStudents.includes(s._id));
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
        getRoleName(role) {
            if (!role) return 'User';
            if (typeof role === 'string') return role;
            if (typeof role === 'object' && role.title && Array.isArray(role.title)) {
                const titleEn = role.title.find(t => t.key === 'en');
                return titleEn ? titleEn.value : (role.title[0] ? role.title[0].value : 'User');
            }
            return 'User';
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
                courseLevel: data.courseLevel || '1',
                startDate: (data.create && data.create.startAt) ? this.formatDateForInput(data.create.startAt) : '',
                dueDate: (data.create && data.create.endAt) ? this.formatDateForInput(data.create.endAt) : '',
                assignments: data.assignments ? data.assignments.map(a => ({
                    ...a,
                    title: this.getName('en', a),
                    startDateTime: (a.create && a.create.startAt) ? this.formatDateTimeForInput(a.create.startAt) : '',
                    endDateTime: (a.create && a.create.endAt) ? this.formatDateTimeForInput(a.create.endAt) : ''
                })) : [
                    { id: Date.now(), title: '', startDateTime: '', endDateTime: '' }
                ]
            };
            this.selectedStudents = data.artist ? data.artist.map(a => (typeof a === 'object' && a._id) ? a._id : a) : [];
        },
        formatDateForInput(date) {
            if (!date) return '';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        },
        formatDateTimeForInput(date) {
            if (!date) return '';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        },
        addAssignment() {
            this.form.assignments.push({ id: Date.now(), title: '', startDateTime: '', endDateTime: '' });
        },
        removeAssignment(index) {
            this.form.assignments.splice(index, 1);
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
                const artists = this.availableStudents.filter(s => this.getRoleName(s.role) === 'Artist');
                this.selectedStudents = artists.map(s => s._id);
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
            
            const submissionData = {
                _id: this.form._id,
                title: [
                    { key: 'en', value: this.form.title },
                    { key: 'th', value: this.form.title }
                ],
                courseLevel: this.form.courseLevel || '1',
                create: {
                    // Date-only inputs mean the whole local day: open at 00:00 and close at 23:59:59 (not UTC midnight).
                    startAt: new Date(`${this.form.startDate}T00:00:00`).toISOString(),
                    endAt: new Date(`${this.form.dueDate}T23:59:59`).toISOString()
                },
                artist: this.selectedStudents,
                assignments: this.form.assignments.map(a => ({
                    ...a,
                    title: [
                        { key: 'en', value: a.title },
                        { key: 'th', value: a.title }
                    ],
                    create: {
                        startAt: a.startDateTime,
                        endAt: a.endDateTime
                    }
                }))
            };

            this.$emit('update', submissionData);
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
    background: #fffaf3;
    border-color: #ffedd5;
}

.student-item.selected {
    background: #fffaf3;
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

/* Dynamic Assignments Styles */
.dynamic-assignments-wrapper {
    background: #fffaf3;
    border: 1px solid #ffedd5;
    border-radius: 16px;
    padding: 1.5rem;
}

.btn-add-task {
    color: #f6ad55 !important;
    font-weight: 700 !important;
    font-size: 0.8rem !important;
    text-transform: uppercase;
}

.task-card-orange {
    border-color: #ffedd5 !important;
    transition: all 0.2s;
}

.task-card-orange:hover {
    border-color: #f6ad55 !important;
    box-shadow: 0 4px 12px rgba(246, 173, 85, 0.08) !important;
}

.text-orange-dark { color: #9a3412; }

.task-input-premium {
    border: none;
    border-bottom: 2px solid #f1f5f9;
    padding: 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    outline: none;
    transition: border-color 0.2s;
}

.task-input-premium:focus {
    border-color: #f6ad55;
}

.date-picker-mini {
    margin-top: 0.5rem;
}

.mini-label {
    display: block;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 4px;
}

.mini-date-input {
    width: 100%;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 0.85rem;
    color: #475569;
    background: #f8fafc;
    outline: none;
}

.mini-date-input:focus {
    border-color: #fed7aa;
    background: white;
}

.btn-remove-task-pill {
    background: #fef2f2;
    border: 1px solid #fee2e2;
    color: #ef4444;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-remove-task-pill:hover {
    background: #ef4444;
    color: white;
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

.btn-update-submission {
    background-color: #f6ad55 !important;
    border-color: #f6ad55 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    box-shadow: 0 10px 15px -3px rgba(246, 173, 85, 0.2);
}

.btn-update-submission:hover:not(:disabled) {
    background-color: #ed8936 !important;
    transform: translateY(-1px);
}
</style>
