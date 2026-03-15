<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="edit-assignment-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-orange-light text-orange mr-3">
                        <CIcon name="cil-pencil" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">Edit Assignment Task</h5>
                        <p class="text-muted small mb-0">Update the details and target students for this specific task.</p>
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
                        <label class="form-label">Assignment Title</label>
                        <CInput 
                            v-model="form.title" 
                            placeholder="e.g. Sketch 1: Basic Shapes" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Dates Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Start Date & Time</label>
                        <CInput 
                            v-model="form.startDateTime" 
                            type="datetime-local" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">End Date & Time (Deadline)</label>
                        <CInput 
                            v-model="form.endDateTime" 
                            type="datetime-local" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Instructions/Description -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Instructions / Description</label>
                        <CTextarea 
                            v-model="form.description" 
                            placeholder="Describe what students need to do for this assignment..." 
                            rows="4"
                            class="custom-textarea mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Enrollment Metric -->
            <CRow class="mb-4">
                <CCol md="12">
                    <div class="form-group-custom mb-3">
                        <label class="form-label">Target Students</label>
                        <div class="custom-input-readonly d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="font-weight-bold text-orange h5 mb-0 mr-2">{{ selectedStudents.length }}</span>
                                <span class="text-muted small uppercase font-weight-bold">Students targeted for this task</span>
                            </div>
                            
                            <!-- Selected Avatars Preview -->
                            <div v-if="selectedStudents.length > 0" class="selected-avatars-preview d-flex align-items-center">
                                <div class="avatar-stack mr-2">
                                    <div 
                                        v-for="(student, idx) in selectedStudentDetails.slice(0, 5)" 
                                        :key="student.id"
                                        class="avatar-preview-sm"
                                        :style="{ backgroundColor: getAvatarColor(student.name), zIndex: 10 - idx }"
                                        v-c-tooltip="student.name"
                                    >
                                        {{ getInitials(student.name) }}
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
                                :key="'sel-' + student.id"
                                class="selected-tag mr-2 mb-2 d-flex align-items-center"
                            >
                                <div class="avatar-xs mr-2" :style="{ backgroundColor: getAvatarColor(student.name) }">
                                    {{ getInitials(student.name) }}
                                </div>
                                <span class="tag-name mr-2 text-truncate">{{ student.name }}</span>
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
                    <label class="form-label mb-0">Assign to Students</label>
                    <div class="select-all-toggle" @click="toggleSelectAll">
                        <span class="text-orange small font-weight-bold pointer">{{ allSelected ? 'Deselect All' : 'Select All' }}</span>
                    </div>
                </div>
                
                <div class="search-box-orange mb-3">
                    <CIcon name="cil-search" class="search-icon-orange" />
                    <input 
                        type="text" 
                        v-model="studentSearch" 
                        placeholder="Search students by name or ID..."
                        class="search-input-orange"
                    />
                </div>

                <div class="student-list-container">
                    <div 
                        v-for="student in enrolledStudents" 
                        :key="student.id"
                        class="student-item"
                        :class="{ 'selected': isSelected(student.id) }"
                        @click="toggleStudent(student)"
                    >
                        <div class="d-flex align-items-center">
                            <div class="check-box-custom mr-3" :class="{ 'checked': isSelected(student.id) }">
                                <CIcon v-if="isSelected(student.id)" name="cil-check" size="sm" />
                            </div>
                            <div class="avatar-sm mr-3" :style="{ backgroundColor: getAvatarColor(student.name) }">
                                {{ getInitials(student.name) }}
                            </div>
                            <div>
                                <div class="student-name-text">{{ student.name }}</div>
                                <div class="student-id-text">ID: {{ student.student_id }}</div>
                            </div>
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
                    color="warning" 
                    @click="handleUpdate"
                    class="btn-update-assignment"
                    :disabled="!isFormValid"
                >
                    Update Assignment
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'AssignmentEditModal',
    props: {
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
        isFormValid() {
            return this.form.title && this.form.startDateTime && this.form.endDateTime && this.selectedStudents.length > 0;
        },
        filteredStudents() {
            if (!this.studentSearch) return this.enrolledStudents;
            const q = this.studentSearch.toLowerCase();
            return this.enrolledStudents.filter(s => 
                s.name.toLowerCase().includes(q) || 
                s.student_id.toLowerCase().includes(q)
            );
        },
        allSelected() {
            return this.selectedStudents.length === this.enrolledStudents.length;
        },
        selectedStudentDetails() {
            return this.enrolledStudents.filter(s => this.selectedStudents.includes(s.id));
        }
    },
    methods: {
        populateForm(data) {
            this.form = {
                id: data.id,
                title: data.assignmentTitle || '',
                startDateTime: data.from ? this.formatDateTimeForInput(data.from) : '',
                endDateTime: data.to ? this.formatDateTimeForInput(data.to) : '',
                description: data.description || ''
            };
            this.selectedStudents = data.selectedStudents ? [...data.selectedStudents] : this.enrolledStudents.map(s => s.id);
        },
        formatDateTimeForInput(date) {
            if (!date) return '';
            const d = new Date(date);
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        },
        isSelected(id) {
            return this.selectedStudents.includes(id);
        },
        toggleStudent(student) {
            const index = this.selectedStudents.indexOf(student.id);
            if (index > -1) {
                this.selectedStudents.splice(index, 1);
            } else {
                this.selectedStudents.push(student.id);
            }
        },
        toggleSelectAll() {
            if (this.allSelected) {
                this.selectedStudents = [];
            } else {
                this.selectedStudents = this.enrolledStudents.map(s => s.id);
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
            this.$emit('update', { 
                ...this.form, 
                selectedStudents: this.selectedStudents 
            });
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
