<template>
    <div class="assignment-dashboard">
        <!-- Back Button -->
        <div class="mb-3">
            <CLink :to="{ name: 'SubmissionsDetail', params: { id: $route.params.submissionId } }" class="back-link d-inline-flex align-items-center text-muted">
                <CIcon name="cil-arrow-left" class="mr-2" />
                <span class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Back to detail' : 'กลับไปยังหน้ารายละเอียด' }}</span>
            </CLink>
        </div>

        <HeaderHero 
            :title="assignmentTitle" 
            :description="$i18n.locale === 'en' ? 'Manage and review all student submissions, provide feedback, and grade their work in real-time.' : 'จัดการและตรวจสอบการส่งงานของนักศึกษาทั้งหมด ให้ข้อเสนอแนะ และให้คะแนนแบบเรียลไทม์'" 
            icon="cil-task" 
            :showCreateButton="false" 
            :showExportButton="true" 
            @export="handleExport"
        />
        <AssignmentWidget v-model="filters.status" :stats="stats" />
        <AssignmentFilter v-model="filters" />
        <AssignmentTable :filters="filters" :items="mappedArtworks" @update-status="handleStatusUpdate" />
    </div>
</template>

<script>
import AssignmentTable from './components/table/AssignmentTable.vue'
import AssignmentWidget from './components/widget/AssignmentWidget.vue'
import AssignmentFilter from './components/filter/AssignmentFilter.vue'
import HeaderHero from './components/HeaderHero.vue'
import moment from 'moment'

export default {
    name: 'Assignment',
    components: {
        AssignmentTable,
        AssignmentWidget,
        AssignmentFilter,
        HeaderHero
    },
    data() {
        return {
            filters: {
                search: '',
                status: 'All Statuses',
                deadline: 'Any Deadline',
                quickRange: 'All Time',
                startDate: null,
                endDate: null
            }
        }
    },
    created() {
        this.fetchSubmission();
        this.$store.dispatch('setting/status/get', {});
    },
    computed: {
        allStatuses() {
            return this.$store.getters['setting/status/item'] || [];
        },
        stats() {
            const artworks = this.mappedArtworks;
            const totalArtists = (this.submission && this.submission.artist) ? this.submission.artist.length : 0;
            
            // Count unique students who have submitted
            const uniqueSubmitters = new Set(artworks.map(aw => aw.student_id)).size;
            
            return {
                totalSubmitted: uniqueSubmitters,
                totalExpected: totalArtists,
                passed: artworks.filter(aw => aw.status === 'Approved').length,
                pending: artworks.filter(aw => aw.status === 'Pending').length,
                failed: artworks.filter(aw => aw.status === 'Rejected').length
            };
        },
        submission() {
            return this.$store.getters['submission/submissions'].find(s => s._id === this.$route.params.submissionId);
        },
        assignment() {
            if (!this.submission || !this.submission.assignments) return null;
            return this.submission.assignments.find(a => a._id === this.$route.params.id);
        },
        assignmentTitle() {
            return this.assignment ? this.getName('en', this.assignment) : 'Assignment Detail';
        },
        mappedArtworks() {
            if (!this.assignment || !this.assignment.artworks) return [];
            return this.assignment.artworks.map(aw => {
                const owner = aw.owner;
                const status = aw.status;
                
                // Determine student name and ID safely
                let studentName = 'N/A';
                let studentId = 'N/A';
                
                if (owner) {
                    if (typeof owner === 'object') {
                        studentName = this.getName('en', owner);
                        studentId = owner.studentId || 'N/A';
                    } else {
                        // It's just an ID string (Population didn't happen)
                        studentName = `User (ID: ${owner.substring(owner.length - 4)})`;
                        studentId = owner;
                    }
                }

                // Determine status name safely
                let statusName = 'Pending';
                if (status) {
                    statusName = typeof status === 'object' ? (this.getName('en', status) || 'Pending') : 'Pending';
                }

                return {
                    id: aw._id,
                    preview: aw.image,
                    student_name: studentName,
                    student_id: studentId,
                    submitted_date: aw.create ? moment(aw.create.at).format('MMM DD, YYYY hh:mm A') : 'N/A',
                    on_time: aw.create && this.assignment.create ? moment(aw.create.at).isBefore(moment(this.assignment.create.endAt)) : true,
                    status: statusName,
                    deadline: this.assignment.create ? moment(this.assignment.create.endAt).format('MMM DD, YYYY hh:mm A') : 'N/A',
                    
                    // Detailed Fields
                    title_en: this.getName('en', { title: aw.title }),
                    title_th: this.getName('th', { title: aw.title }),
                    description_en: this.getName('en', { title: aw.description }),
                    description_th: this.getName('th', { title: aw.description }),
                    technique_en: this.getName('en', { title: aw.technique }),
                    technique_th: this.getName('th', { title: aw.technique }),
                    size_en: this.getName('en', { title: aw.size }),
                    size_th: this.getName('th', { title: aw.size }),
                    price: aw.price || 0,
                    category: aw.category ? (this.getName('en', aw.category) || 'General') : 'General',
                    artist_name: aw.artist ? this.getName('en', aw.artist) : studentName
                };
            });
        }
    },
    methods: {
        fetchSubmission() {
            this.$store.dispatch('submission/get', { _id: this.$route.params.submissionId });
        },
        async handleStatusUpdate({ artworkId, statusName }) {
            try {
                if (!this.submission || !this.assignment) return;

                // 1. Find the target status ID
                const targetStatus = this.allStatuses.find(s => {
                    const title = this.getName('en', s);
                    return title.toLowerCase() === statusName.toLowerCase() || 
                           (statusName === 'Approved' && title.toLowerCase() === 'approved') ||
                           (statusName === 'Rejected' && title.toLowerCase() === 'rejected');
                });

                if (!targetStatus) {
                    alert('ไม่พบสถานะที่ต้องการในระบบ');
                    return;
                }

                // 2. Clone and update the submission object
                const updatedSubmission = JSON.parse(JSON.stringify(this.submission));
                
                // Find the assignment and the artwork
                const assignmentIndex = updatedSubmission.assignments.findIndex(a => a._id === this.assignment._id);
                if (assignmentIndex === -1) return;

                const artworkIndex = updatedSubmission.assignments[assignmentIndex].artworks.findIndex(aw => aw._id === artworkId);
                if (artworkIndex === -1) return;

                // Update the status ID
                updatedSubmission.assignments[assignmentIndex].artworks[artworkIndex].status = targetStatus._id;

                // 3. Unpopulate fields to prevent Mongoose cast errors
                if (updatedSubmission.artist && updatedSubmission.artist.length > 0 && typeof updatedSubmission.artist[0] === 'object') {
                    updatedSubmission.artist = updatedSubmission.artist.map(a => a._id);
                }
                
                updatedSubmission.assignments.forEach(assignment => {
                    if (assignment.artist && assignment.artist.length > 0 && typeof assignment.artist[0] === 'object') {
                        assignment.artist = assignment.artist.map(a => a._id);
                    }
                    if (assignment.artworks) {
                        assignment.artworks.forEach(aw => {
                            if (aw.owner && typeof aw.owner === 'object') aw.owner = aw.owner._id;
                            if (aw.status && typeof aw.status === 'object') aw.status = aw.status._id;
                            if (aw.category && typeof aw.category === 'object') aw.category = aw.category._id;
                        });
                    }
                });

                // 4. Save to backend
                await this.$store.dispatch('submission/update', updatedSubmission);
                
                // 5. Refresh data
                await this.fetchSubmission();
                alert(`อัปเดตสถานะเป็น ${statusName} เรียบร้อยแล้ว`);
                
            } catch (error) {
                console.error('Error updating status:', error);
                alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
            }
        },
        handleExport() {
            console.log('Exporting data...');
        },
        getName(lang, item) {
            if (!item) return 'N/A';
            
            if (typeof item === 'string') return item;

            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            
            if (Array.isArray(titleField)) {
                const nameObj = titleField.find(n => n.key === lang);
                const fallback = titleField[0] ? titleField[0].value : 'N/A';
                return nameObj ? nameObj.value : fallback;
            }
            return 'N/A';
        },
    }
}
</script>

<style scoped>
/* Back Link Styling */
.back-link {
    text-decoration: none;
    font-size: 1rem;
    transition: all 0.2s;
    color: #8a93a2 !important;
}

.back-link:hover {
    color: #172b4d !important;
    text-decoration: none;
    transform: translateX(-4px);
}

.assignment-dashboard {
    position: relative;
    overflow: visible !important;
    padding-bottom: 2rem;
}
</style>
