<template>
    <div class="submissions-detail-dashboard" v-if="submission">
        <!-- Back Button -->
        <div class="mb-3">
            <CLink :to="{ name: 'Submissions' }" class="back-link d-inline-flex align-items-center text-muted">
                <CIcon name="cil-arrow-left" class="mr-2" />
                <span class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Back to Submissions' : 'กลับไปยังหน้าการส่งงาน' }}</span>
            </CLink>
        </div>

        <HeaderHero :title="getName($i18n.locale, submission)" :description="($i18n.locale === 'en' ? 'Managing assignments and tracking progress for ' : 'จัดการงานและติดตามความคืบหน้าของนักศึกษาจำนวน ') + (submission.artist ? submission.artist.length : 0) + ($i18n.locale === 'en' ? ' students.' : ' คน')" icon="cil-list" :showCreateButton="true" :createButtonText="$i18n.locale === 'en' ? 'Create Assignment' : 'สร้างงานมอบหมาย'" :showExportButton="true" @create="addAssignment" @export="handleExport" />
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
import * as XLSX from 'xlsx'
import moment from 'moment'

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
                    alert(this.$i18n.locale === 'en' ? "Assignment created successfully." : "สร้างงานมอบหมายเรียบร้อยแล้ว");
                })
                .catch(err => {
                    console.error('Create assignment error:', err);
                    alert(this.$i18n.locale === 'en' ? "Failed to create assignment." : "ไม่สามารถสร้างงานมอบหมายได้");
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
                        alert(this.$i18n.locale === 'en' ? "Assignment updated successfully." : "อัปเดตงานมอบหมายเรียบร้อยแล้ว");
                    })
                    .catch(err => {
                        console.error('Update assignment error:', err);
                        alert(this.$i18n.locale === 'en' ? "Failed to update assignment." : "ไม่สามารถอัปเดตงานมอบหมายได้");
                    });
            }
        },
        handleDelete(item) {
            const title = this.getName(this.$i18n.locale, item);
            const confirmMsg = this.$i18n.locale === 'en'
                ? `Are you sure you want to delete assignment "${title}"?`
                : `คุณแน่ใจหรือว่าต้องการลบงานมอบหมาย "${title}"?`;

            if (confirm(confirmMsg)) {
                const updatedSubmission = { ...this.submission };
                updatedSubmission.assignments = updatedSubmission.assignments.filter(a => a._id !== item._id);
                
                this.$store.dispatch('submission/update', updatedSubmission)
                    .then(() => {
                        this.fetchSubmission();
                        alert(this.$i18n.locale === 'en' ? "Assignment deleted successfully." : "ลบงานมอบหมายเรียบร้อยแล้ว");
                    })
                    .catch(err => {
                        console.error('Delete assignment error:', err);
                        alert(this.$i18n.locale === 'en' ? "Failed to delete assignment." : "ไม่สามารถลบงานมอบหมายได้");
                    });
            }
        },
        handleExport() {
            if (!this.submission || !this.submission.assignments || this.submission.assignments.length === 0) {
                alert(this.$i18n.locale === 'en' ? 'No data available to export.' : 'ไม่มีข้อมูลสำหรับการส่งออก');
                return;
            }

            const headers = this.$i18n.locale === 'en' ? [
                'Assignment Title', 'Start Date & Time', 'Due Date & Time', 
                'Total Target Students', 'Submitted Students', 'Approved count', 
                'Pending Review count', 'Rejected count'
            ] : [
                'หัวข้อคำสั่งงาน', 'วันเริ่มต้น', 'วันกำหนดส่ง', 
                'จำนวนนักศึกษาที่มอบหมาย', 'นักศึกษาที่ส่งแล้ว', 'ผ่าน/อนุมัติ (คน)', 
                'รอตรวจสอบ (คน)', 'ไม่ผ่าน (คน)'
            ];

            const totalEnrolled = this.submission.artist ? this.submission.artist.length : 0;

            const data = this.submission.assignments.map(item => {
                const title = this.getName(this.$i18n.locale, item);
                const start = item.create && item.create.startAt ? moment(item.create.startAt).format('DD/MM/YYYY HH:mm') : 'N/A';
                const end = item.create && item.create.endAt ? moment(item.create.endAt).format('DD/MM/YYYY HH:mm') : 'N/A';
                
                // Get unique submitters count
                const artworks = item.artworks || [];
                const submittedOwners = new Set();
                artworks.forEach(aw => {
                    const ownerId = (aw.owner?._id || aw.owner)?.toString();
                    if (ownerId) submittedOwners.add(ownerId);
                });
                
                const submittedCount = submittedOwners.size;
                const targetCount = item.artist && item.artist.length > 0 ? item.artist.length : totalEnrolled;
                
                // Get approval status counts
                const approvedCount = artworks.filter(a => {
                    const statusVal = a.status && typeof a.status === 'object' ? this.getName('en', a.status) : a.status;
                    return statusVal === 'Approved' || statusVal === 'Passed';
                }).length;
                
                const pendingCount = artworks.filter(a => {
                    const statusVal = a.status && typeof a.status === 'object' ? this.getName('en', a.status) : a.status;
                    return statusVal === 'Pending';
                }).length;
                
                const rejectedCount = artworks.filter(a => {
                    const statusVal = a.status && typeof a.status === 'object' ? this.getName('en', a.status) : a.status;
                    return statusVal === 'Rejected' || statusVal === 'Fail';
                }).length;

                return [
                    title,
                    start,
                    end,
                    targetCount,
                    submittedCount,
                    approvedCount,
                    pendingCount,
                    rejectedCount
                ];
            });

            const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Assignments');
            const portalName = this.getName(this.$i18n.locale, this.submission).replace(/\s+/g, '_');
            XLSX.writeFile(wb, `Portal_${portalName}_Assignments_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
        }
    }
}
</script>

<style scoped>
.submissions-detail-dashboard {
    position: relative;
    overflow: visible !important;
    padding-bottom: 2rem;
}

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
