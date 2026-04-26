<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="create-submission-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-purple-light text-purple mr-3">
                        <CIcon name="cil-list" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">Create New Submission</h5>
                        <p class="text-muted small mb-0">Set up a new submission portal for students to upload their artworks.</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2">
            <!-- Basic Info Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Submission Title</label>
                        <CInput 
                            v-model="form.title" 
                            placeholder="e.g. Midterm Art Project 2024" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Dates Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Start Date</label>
                        <CInput 
                            v-model="form.startDate" 
                            type="date" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Due Date (Deadline)</label>
                        <CInput 
                            v-model="form.dueDate" 
                            type="date" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Enrollment Metric -->
            <CRow class="mb-4">
                <CCol md="12">
                    <div class="form-group-custom mb-3">
                        <label class="form-label">Enrollment Summary</label>
                        <div class="custom-input-readonly d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="font-weight-bold text-purple h5 mb-0 mr-2">{{ selectedStudents.length }}</span>
                                <span class="text-muted small uppercase font-weight-bold">Students officially enrolled</span>
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
                                <button class="btn-remove-tag" @click="toggleStudent(student)">
                                    <CIcon name="cil-x" size="custom-sm" />
                                </button>
                            </div>
                        </div>
                    </div>
                </CCol>
            </CRow>

            <!-- Student Selection Section -->
            <div class="student-selection-wrapper mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <label class="form-label mb-0">Select Students to Enroll</label>
                    <div class="select-all-toggle" @click="toggleSelectAll">
                        <span class="text-purple small font-weight-bold pointer">{{ allSelected ? 'Deselect All' : 'Select All' }}</span>
                    </div>
                </div>
                
                <div class="search-box-purple mb-3">
                    <CIcon name="cil-search" class="search-icon-purple" />
                    <input 
                        type="text" 
                        v-model="studentSearch" 
                        placeholder="Search students by name or ID..."
                        class="search-input-purple"
                    />
                </div>

                <div class="student-list-container">
                    <div 
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
                    </div>
                </div>
            </div>

            <!-- Dynamic Assignments Section -->
            <div class="dynamic-assignments-wrapper mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <label class="form-label mb-0">Sub-Assignments Tasks</label>
                    <CButton 
                        size="sm" 
                        color="primary" 
                        variant="ghost" 
                        class="btn-add-task"
                        @click="addAssignment"
                    >
                        <CIcon name="cil-plus" class="mr-1" /> Add Task
                    </CButton>
                </div>

                <div class="assignments-list">
                    <div v-for="(assignment, index) in form.assignments" :key="assignment.id" class="assignment-task-item mb-3">
                        <div class="task-card-purple p-3 shadow-sm border rounded-lg bg-white">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="task-number text-purple-dark small font-weight-bold">Task #{{ index + 1 }}</div>
                                <button 
                                    v-if="form.assignments.length > 1" 
                                    class="btn-remove-task-pill" 
                                    @click="removeAssignment(index)"
                                >
                                    <CIcon name="cil-trash" size="sm" class="mr-1" /> Remove
                                </button>
                            </div>
                            
                            <CRow>
                                <CCol md="12" class="mb-2">
                                    <input 
                                        v-model="assignment.title" 
                                        placeholder="Assignment Title (e.g. Sketch 1: Perspective)" 
                                        class="task-input-premium w-100"
                                    />
                                </CCol>
                                <CCol md="6">
                                    <div class="date-picker-mini">
                                        <label class="mini-label">Start Date & Time</label>
                                        <input 
                                            type="datetime-local" 
                                            v-model="assignment.startDateTime"
                                            class="mini-date-input"
                                        />
                                    </div>
                                </CCol>
                                <CCol md="6">
                                    <div class="date-picker-mini">
                                        <label class="mini-label">End Date & Time</label>
                                        <input 
                                            type="datetime-local" 
                                            v-model="assignment.endDateTime"
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
                    class="btn-create-submission"
                    :disabled="!isFormValid"
                >
                    Create Submission Portal
                </CButton>
            </div>
        </template>
</CModal>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'SubmissionCreateModal',
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            form: {
                title: '',
                startDate: '',
                dueDate: '',
                assignments: [
                    { id: Date.now(), title: '', startDateTime: '', endDateTime: '' }
                ]
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
    computed: {
        ...mapGetters({
            availableStudents: 'user/user' // Correct getter from User store
        }),
        isFormValid() {
            const hasAssignments = this.form.assignments.length > 0 && 
                this.form.assignments.every(a => a.title.trim() !== '' && a.startDateTime && a.endDateTime);
            return this.form.title && this.form.startDate && this.form.dueDate && this.selectedStudents.length > 0 && hasAssignments;
        },
        filteredStudents() {
            if (!this.availableStudents) return [];
            const q = this.studentSearch.toLowerCase();
            return this.availableStudents.filter(s => {
                const name = this.getStudentName(s).toLowerCase();
                const studentId = (s.username || '').toLowerCase(); // Assuming username is student_id
                return name.includes(q) || studentId.includes(q);
            });
        },
        allSelected() {
            return this.availableStudents && this.selectedStudents.length === this.availableStudents.length;
        },
        selectedStudentDetails() {
            if (!this.availableStudents) return [];
            return this.availableStudents.filter(s => this.selectedStudents.includes(s._id));
        }
    },
    methods: {
        getStudentName(student) {
            if (!student || !student.name) return 'N/A';
            const nameObj = student.name.find(n => n.key === 'en') || student.name[0];
            return nameObj ? nameObj.value : 'N/A';
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
                this.selectedStudents = this.availableStudents.map(s => s._id);
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
            
            const submissionData = {
                title: [
                    { key: 'en', value: this.form.title },
                    { key: 'th', value: this.form.title }
                ],
                create: {
                    startAt: this.form.startDate,
                    endAt: this.form.dueDate
                },
                artist: this.selectedStudents,
                assignments: this.form.assignments.map(a => ({
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

            console.log("--- CREATING NEW SUBMISSION ---");
            console.log("Title:", this.form.title);
            console.log("Artists Enrolled (IDs):", this.selectedStudents);
            console.log("Full Payload:", submissionData);

            this.$emit('save', submissionData);
            this.resetForm();
        },
        resetForm() {
            this.form = {
                title: '',
                startDate: '',
                dueDate: '',
                assignments: [
                    { id: Date.now(), title: '', startDateTime: '', endDateTime: '' }
                ]
            };
            this.selectedStudents = [];
            this.studentSearch = '';
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
    border-color: #8b5cf633; /* Purple focus */
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.05);
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

.bg-purple-light { background-color: #8b5cf611; }
.text-purple { color: #8b5cf6; }

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
    padding: 0;
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
    background: #f8fafc; /* Lighter bg for enrollment */
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 1.5rem;
}

/* Dynamic Assignments Styles */
.dynamic-assignments-wrapper {
    background: #fcfaff;
    border: 1px solid #f1e7ff;
    border-radius: 16px;
    padding: 1.5rem;
}

.btn-add-task {
    color: #8b5cf6 !important;
    font-weight: 700 !important;
    font-size: 0.8rem !important;
    text-transform: uppercase;
}

.task-card-purple {
    border-color: #f1e7ff !important;
    transition: all 0.2s;
}

.task-card-purple:hover {
    border-color: #8b5cf6 !important;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.08) !important;
}

.text-purple-dark { color: #5b21b6; }

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
    border-color: #8b5cf6;
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
    border-color: #ddd6fe;
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

.search-box-purple {
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #e9d5ff;
    border-radius: 10px;
    padding: 0 1rem;
    height: 44px;
}

.search-icon-purple {
    color: #a78bfa;
    width: 16px;
    margin-right: 12px;
}

.search-input-purple {
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.9rem;
    color: #4c1d95;
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
    background: #e9d5ff;
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
    background: #f5f3ff;
    border-color: #ddd6fe;
}

.student-item.selected {
    background: #f5f3ff;
    border-color: #8b5cf6;
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
    background: #8b5cf6;
    border-color: #8b5cf6;
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

.btn-create-submission {
    background-color: #8b5cf6 !important;
    border-color: #8b5cf6 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.2);
}

.btn-create-submission:hover:not(:disabled) {
    background-color: #7c3aed !important;
    transform: translateY(-1px);
}
</style>
