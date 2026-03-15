<template>
    <div class="submissions-detail-dashboard">
        <!-- Back Button -->
        <div class="mb-3">
            <CLink :to="{ name: 'Submissions' }" class="back-link d-inline-flex align-items-center text-muted">
                <CIcon name="cil-arrow-left" class="mr-2" />
                <span class="font-weight-bold">Back to Submissions</span>
            </CLink>
        </div>

        <HeaderHero 
            title="Midterm Art Project" 
            description="Managing assignments and tracking student progress for 45 students." 
            icon="cil-list"
            :showCreateButton="true"
            createButtonText="Create Assignment"
            :showExportButton="true"
            @create="addAssignment"
            @export="handleExport"
        />
        <SubmissionDetailWidget />
        <SubmissionDetailFilter v-model="filters" @create="addAssignment" />
        <SubmissionDetailTable :filters="filters" @view="handleView" @edit="handleEdit" @delete="handleDelete" />
        <AssignmentCreateModal :show.sync="showAssignmentModal" :enrolledStudents="mockEnrolledStudents" @save="handleAssignmentSave" />
        <AssignmentEditModal :show.sync="showEditAssignmentModal" :assignmentData="selectedAssignment" :enrolledStudents="mockEnrolledStudents" @update="handleAssignmentUpdate" />
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
    methods: {
        addAssignment() {
            this.showAssignmentModal = true;
        },
        handleAssignmentSave(data) {
            console.log('New assignment task created:', data);
            alert('New assignment task created successfully!');
            this.showAssignmentModal = false;
        },
        handleView(item) {
            console.log('Viewing assignment item:', item);
            this.$router.push({ name: 'Assignment', params: { id: item.id } });
        },
        handleEdit(item) {
            console.log('Editing assignment item:', item);
            this.selectedAssignment = item;
            this.showEditAssignmentModal = true;
        },
        handleAssignmentUpdate(data) {
            console.log('Assignment task updated:', data);
            alert('Assignment task updated successfully!');
            this.showEditAssignmentModal = false;
        },
        handleDelete(item) {
            console.log('Deleting item:', item);
            // Confirm and delete
        },
        handleExport() {
            if (this.$refs.detailTable) {
                // Assuming SubmissionDetailTable has an export method or logic
                console.log('Exporting data...');
                // In a real scenario, you'd call a method on the table ref or use a utility
            }
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
