<template>
    <div class="submissions-detail-dashboard" v-if="submission">
        <!-- Back Button -->
        <div class="mb-3">
            <CLink :to="{ name: 'Submissions' }" class="back-link d-inline-flex align-items-center text-muted">
                <CIcon name="cil-arrow-left" class="mr-2" />
                <span class="font-weight-bold">Back to Submissions</span>
            </CLink>
        </div>

        <HeaderHero :title="getName('en', submission)" :description="`Managing assignments and tracking progress for ${submission.artist ? submission.artist.length : 0} students.`" icon="cil-list":showCreateButton="true"createButtonText="Create Assignment":showExportButton="true"@create="addAssignment"@export="handleExport"/>
        <SubmissionDetailWidget :submission="submission" v-model="filters.status" />
        <SubmissionDetailFilter v-model="filters" @create="addAssignment" />
        <SubmissionDetailTable :items="submission.assignments || []" :totalStudents="submission.artist ? submission.artist.length : 0" :filters="filters" @view="handleView" @edit="handleEdit" @delete="handleDelete" />
        <AssignmentCreateModal :show.sync="showAssignmentModal" :enrolledStudents="submission.artist || []" @save="handleAssignmentSave" />
        <AssignmentEditModal :show.sync="showEditAssignmentModal" :assignmentData="selectedAssignment" :enrolledStudents="submission.artist || []" @update="handleAssignmentUpdate" />
    </div>
</template>

<script>
import SubmissionDetailTable from './components/table/SubmissionDetailTable.vue'
import SubmissionDetailWidget from './components/submission_detail/SubmissionDetailWidget.vue'
import SubmissionDetailFilter from './components/submission_detail/SubmissionDetailFilter.vue'
import AssignmentCreateModal from './components/modal/submission/AssignmentCreateModal.vue'
import AssignmentEditModal from './components/modal/submission/AssignmentEditModal.vue'
import HeaderHero from './components/HeaderHero.vue'

export default {
    name: 'SubmissionsDetail',
    components: {
        SubmissionDetailTable,
        SubmissionDetailWidget,
        SubmissionDetailFilter,
        AssignmentCreateModal,
        AssignmentEditModal,
        HeaderHero
    },
    data() {
        return {
            showAssignmentModal: false,
            showEditAssignmentModal: false,
            selectedAssignment: null,
            filters: {
                search: '',
                status: 'All Status',
                startDate: null,
                endDate: null,
                quickRange: 'All Time'
            },
            // Mock enrolled students for this submission
            mockEnrolledStudents: [
                { id: 'USR-001', name: 'Albus Dumbledore', student_id: '6450001' },
                { id: 'USR-002', name: 'Harry Potter', student_id: '6450002' },
                { id: 'USR-003', name: 'Hermione Granger', student_id: '6450003' },
                { id: 'USR-004', name: 'Severus Snape', student_id: '6450004' },
                { id: 'USR-005', name: 'Ron Weasley', student_id: '6450005' }
            ]
        }
    },
    created() {
        this.fetchSubmission();
    },
    computed: {
        submission() {
            return this.$store.getters['submission/submissions'].find(s => s._id === this.$route.params.id);
        }
    },
    methods: {
        fetchSubmission() {
            // Already fetched in parent or can fetch specifically if needed
            this.$store.dispatch('submission/get', { _id: this.$route.params.id });
        },
        getName(lang, item) {
            if (!item || !item.title) return 'N/A';
            if (typeof item.title === 'string') return item.title;
            if (Array.isArray(item.title)) {
                const nameObj = item.title.find(n => n.key === lang);
                return nameObj ? nameObj.value : (item.title[0] ? item.title[0].value : 'N/A');
            }
            return 'N/A';
        },
        addAssignment() {
            this.showAssignmentModal = true;
        },
        handleAssignmentSave(data) {
            const updatedSubmission = { ...this.submission };
            if (!updatedSubmission.assignments) updatedSubmission.assignments = [];
            
            updatedSubmission.assignments.push({
                title: [
                    { key: 'en', value: data.title },
                    { key: 'th', value: data.title }
                ],
                artist: data.selectedStudents || [],
                create: {
                    startAt: data.startDateTime,
                    endAt: data.endDateTime
                }
            });

            this.$store.dispatch('submission/update', updatedSubmission)
                .then(() => {
                    this.fetchSubmission();
                    this.showAssignmentModal = false;
                });
        },
        handleView(item) {
            this.$router.push({ 
                name: 'Assignment', 
                params: { 
                    submissionId: this.$route.params.id,
                    id: item._id 
                } 
            });
        },
        handleEdit(item) {
            this.selectedAssignment = item;
            this.showEditAssignmentModal = true;
        },
        handleAssignmentUpdate(data) {
            const updatedSubmission = { ...this.submission };
            const index = updatedSubmission.assignments.findIndex(a => a._id === data._id);
            if (index !== -1) {
                // Merge data, preserving artworks and other fields not in the edit modal
                updatedSubmission.assignments[index] = {
                    ...updatedSubmission.assignments[index],
                    title: data.title,
                    artist: data.selectedStudents || [],
                    create: data.create
                };

                this.$store.dispatch('submission/update', updatedSubmission)
                    .then(() => {
                        this.fetchSubmission();
                        this.showEditAssignmentModal = false;
                    });
            }
        },
        handleDelete(item) {
            if (confirm('Are you sure you want to delete this assignment?')) {
                const updatedSubmission = { ...this.submission };
                updatedSubmission.assignments = updatedSubmission.assignments.filter(a => a._id !== item._id);
                
                this.$store.dispatch('submission/update', updatedSubmission)
                    .then(() => {
                        this.fetchSubmission();
                    });
            }
        },
        handleExport() {
            // Logic for export
        }
    }
}
</script>

<style scoped>
.back-link {
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.back-link:hover {
    color: #2c3e50 !important;
    transform: translateX(-4px);
}

.filter-bar {
    width: 100%;
}

.add-btn {
    background-color: #321fdb;
    border-color: #321fdb;
    color: #ffffff !important;
    border-radius: 8px;
    padding: 0.5rem 1.25rem;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(50, 31, 219, 0.3);
    transition: all 0.2s;
}

.add-btn:hover {
    background-color: #2c1bbd;
    border-color: #2c1bbd;
    color: #ffffff !important;
}

/* Base custom input wrapper styles */
.search-wrapper {
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #eef0f3;
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 48px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    transition: all 0.2s;
    width: 420px;
}

.search-wrapper:focus-within {
    border-color: #321fdb;
    box-shadow: 0 4px 10px rgba(50, 31, 219, 0.05);
}

.search-icon {
    color: #7a8aa3;
    width: 18px;
    height: 18px;
    margin-right: 12px;
}

/* Styles for the CInput to strip borders */
.custom-search-cinput {
    flex-grow: 1;
}

::v-deep .custom-search-cinput .form-group {
    margin-bottom: 0 !important;
}

::v-deep .custom-search-cinput .form-control {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.95rem;
    color: #172b4d;
    box-shadow: none;
    padding: 0;
}

::v-deep .custom-search-cinput .form-control::placeholder {
    color: #a0aec0;
}
</style>
