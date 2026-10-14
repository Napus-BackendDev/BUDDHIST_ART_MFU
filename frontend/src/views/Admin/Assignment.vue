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
            :description="$i18n.locale === 'en' ? 'Manage and review all learner submissions, provide feedback, and grade their work in real-time.' : 'จัดการและตรวจสอบการส่งงานของผู้เรียนทั้งหมด ให้ข้อเสนอแนะ และให้คะแนนแบบเรียลไทม์'"
            icon="cil-task" 
            :showCreateButton="false" 
            :showExportButton="true" 
            themeColor="green"
            @export="handleExport"
        />
        <AssignmentWidget v-model="filters.status" :stats="stats" />
        <AssignmentFilter v-model="filters" />
        <AssignmentTable :filters="filters" :items="mappedArtworks" :location-options="storageLocationOptions" @update-status="handleStatusUpdate" @update-location="handleLocationUpdate" @delete="handleDeleteArtwork" />

        <!-- Rejection Reason Modal -->
        <CModal class="admin-modal" :title="$i18n.locale === 'en' ? 'Reject Submission' : 'ปฏิเสธงานส่งของนักศึกษา'" :show.sync="showRejectModal" color="danger" size="lg">
            <div class="p-3">
                <p class="text-muted mb-3">
                    {{ $i18n.locale === 'en' ? 'Please provide a reason for rejecting this submission. This message will be sent to the student via email.' : 'กรุณาระบุเหตุผลในการปฏิเสธงานส่งนี้ ข้อความนี้จะถูกส่งไปยังอีเมลของนักศึกษาเพื่อแจ้งเตือน' }}
                </p>
                <CTextarea 
                    v-model="rejectRemark" 
                    :placeholder="$i18n.locale === 'en' ? 'Enter reason for rejection...' : 'ระบุเหตุผล...'" 
                    rows="5"
                    class="reject-textarea"
                />
            </div>
            <template #footer>
                <CButton color="secondary" @click="showRejectModal = false" :disabled="loading">{{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}</CButton>
                <CButton color="danger" @click="confirmRejectAssignment" :disabled="!rejectRemark || loading">
                    <CIcon v-if="loading" name="cil-reload" class="mr-2 spinner-animation" />
                    {{ loading ? ($i18n.locale === 'en' ? 'Processing...' : 'กำลังดำเนินการ...') : ($i18n.locale === 'en' ? 'Confirm Reject' : 'ยืนยันการปฏิเสธ') }}
                </CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import AssignmentTable from './components/table/AssignmentTable.vue'
import AssignmentWidget from './components/widget/AssignmentWidget.vue'
import AssignmentFilter from './components/filter/AssignmentFilter.vue'
import HeaderHero from './components/HeaderHero.vue'
import moment from 'moment'
import * as XLSX from 'xlsx'
import { submissionImageUrl } from '@/utils/submissionArtworkImport'

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
            },
            showRejectModal: false,
            rejectRemark: '',
            pendingRejectArtworkId: null,
            pendingRejectStatusName: '',
            loading: false
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
            return this.assignment ? this.getName(this.$i18n.locale, this.assignment) : (this.$i18n.locale === 'en' ? 'Assignment Detail' : 'รายละเอียดงาน');
        },
        storageLocationOptions() {
            if (!this.submission || !Array.isArray(this.submission.assignments)) return [];
            const locations = this.submission.assignments.reduce((result, assignment) => {
                (assignment.artworks || []).forEach(artwork => {
                    const location = (artwork.storageDetail || '').trim();
                    if (location) result.push(location);
                });
                return result;
            }, []);
            return [...new Set(locations)].sort((a, b) => a.localeCompare(b, this.$i18n.locale));
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
                        studentName = this.getName(this.$i18n.locale, owner);
                        studentId = owner.studentId || 'N/A';
                    } else {
                        // It's just an ID string (Population didn't happen)
                        studentName = `User (ID: ${owner.substring(owner.length - 4)})`;
                        studentId = owner;
                    }
                }

                // Determine status name safely (kept as 'en' to align with table badge CSS maps and keys)
                let statusName = 'Pending';
                if (status) {
                    statusName = typeof status === 'object' ? (this.getName('en', status) || 'Pending') : 'Pending';
                }

                return {
                    id: aw._id,
                    preview: submissionImageUrl(aw._id, aw.image),
                    student_name: studentName,
                    student_id: studentId,
                    submitted_date: aw.create ? moment(aw.create.at).format('DD/MM/YYYY HH:mm') : 'N/A',
                    submitted_date_raw: aw.create ? aw.create.at : null,
                    on_time: aw.create && this.assignment.create ? moment(aw.create.at).isBefore(moment(this.assignment.create.endAt)) : true,
                    status: statusName,
                    deadline: this.assignment.create ? moment(this.assignment.create.endAt).format('DD/MM/YYYY HH:mm') : 'N/A',
                    
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
                    category: aw.category ? (this.getName(this.$i18n.locale, aw.category) || (this.$i18n.locale === 'en' ? 'General' : 'ทั่วไป')) : (this.$i18n.locale === 'en' ? 'General' : 'ทั่วไป'),
                    artist_name: aw.artist ? this.getName(this.$i18n.locale, aw.artist) : studentName,
                    remark_en: this.getName('en', { title: aw.remark }),
                    remark_th: this.getName('th', { title: aw.remark }),
                    remark: aw.remark,
                    storage: aw.storage,
                    storageDetail: aw.storageDetail || ''
                };
            });
        }
    },
    methods: {
        async handleDeleteArtwork(item) {
            const message = this.$i18n.locale === 'en'
                ? `Delete “${item.title_en || item.title_th || 'this artwork'}”? This action cannot be undone.`
                : `ยืนยันลบผลงาน “${item.title_th || item.title_en || 'รายการนี้'}” หรือไม่? การลบไม่สามารถย้อนกลับได้`;
            if (!window.confirm(message) || !this.submission || !this.assignment) return;

            try {
                const updatedSubmission = JSON.parse(JSON.stringify(this.submission));
                const assignment = updatedSubmission.assignments.find(a => a._id === this.assignment._id);
                if (!assignment) return;
                assignment.artworks = (assignment.artworks || []).filter(artwork => artwork._id !== item.id);

                if (updatedSubmission.artist) updatedSubmission.artist = updatedSubmission.artist.map(artist => artist._id || artist);
                updatedSubmission.assignments.forEach(entry => {
                    if (entry.artist) entry.artist = entry.artist.map(artist => artist._id || artist);
                    (entry.artworks || []).forEach(artwork => {
                        if (artwork.owner && typeof artwork.owner === 'object') artwork.owner = artwork.owner._id;
                        if (artwork.status && typeof artwork.status === 'object') artwork.status = artwork.status._id;
                        if (artwork.category && typeof artwork.category === 'object') artwork.category = artwork.category._id;
                        if (artwork.storage && typeof artwork.storage === 'object') artwork.storage = artwork.storage._id;
                    });
                });

                await this.$store.dispatch('submission/update', updatedSubmission);
                await this.fetchSubmission();
                alert(this.$i18n.locale === 'en' ? 'Artwork deleted successfully.' : 'ลบผลงานเรียบร้อยแล้ว');
            } catch (error) {
                console.error('Error deleting submitted artwork:', error);
                alert(this.$i18n.locale === 'en' ? 'Unable to delete the artwork.' : 'ไม่สามารถลบผลงานได้');
            }
        },
        async handleLocationUpdate({ artworkId, storageDetail }) {
            if (!this.submission || !this.assignment) return;
            const updatedSubmission = JSON.parse(JSON.stringify(this.submission));
            const assignment = updatedSubmission.assignments.find(a => a._id === this.assignment._id);
            const artwork = assignment && assignment.artworks.find(aw => aw._id === artworkId);
            if (!artwork) return;
            artwork.storageDetail = storageDetail.trim();
            if (updatedSubmission.artist) updatedSubmission.artist = updatedSubmission.artist.map(a => a._id || a);
            updatedSubmission.assignments.forEach(a => {
                if (a.artist) a.artist = a.artist.map(item => item._id || item);
                (a.artworks || []).forEach(aw => {
                    if (aw.owner && typeof aw.owner === 'object') aw.owner = aw.owner._id;
                    if (aw.status && typeof aw.status === 'object') aw.status = aw.status._id;
                    if (aw.category && typeof aw.category === 'object') aw.category = aw.category._id;
                    if (aw.storage && typeof aw.storage === 'object') aw.storage = aw.storage._id;
                });
            });
            await this.$store.dispatch('submission/update', updatedSubmission);
            await this.fetchSubmission();
        },
        fetchSubmission() {
            this.$store.dispatch('submission/get', { _id: this.$route.params.submissionId });
        },
        async handleStatusUpdate({ artworkId, statusName }) {
            if (statusName === 'Rejected') {
                this.pendingRejectArtworkId = artworkId;
                this.pendingRejectStatusName = statusName;
                this.rejectRemark = '';
                this.showRejectModal = true;
                return;
            }

            try {
                if (!this.submission || !this.assignment) return;

                // 1. Find the target status ID
                const targetStatus = this.allStatuses.find(s => {
                    const title = this.getName('en', s);
                    return title.toLowerCase() === statusName.toLowerCase() || 
                           (statusName === 'Approved' && title.toLowerCase() === 'approved');
                });

                if (!targetStatus) {
                    alert(this.$i18n.locale === 'en' ? 'Requested status not found in the system.' : 'ไม่พบสถานะที่ต้องการในระบบ');
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
                alert(this.$i18n.locale === 'en' ? `Status updated to ${statusName} successfully.` : `อัปเดตสถานะเป็น ${statusName} เรียบร้อยแล้ว`);
                
            } catch (error) {
                console.error('Error updating status:', error);
                alert(this.$i18n.locale === 'en' ? 'An error occurred while updating the status.' : 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
            }
        },
        async confirmRejectAssignment() {
            try {
                if (!this.submission || !this.assignment || !this.pendingRejectArtworkId) return;

                this.loading = true;

                // 1. Find the target status ID
                const targetStatus = this.allStatuses.find(s => {
                    const title = this.getName('en', s);
                    return title.toLowerCase() === 'rejected';
                });

                if (!targetStatus) {
                    alert(this.$i18n.locale === 'en' ? 'Requested status not found in the system.' : 'ไม่พบสถานะที่ต้องการในระบบ');
                    this.showRejectModal = false;
                    return;
                }

                // 2. Clone and update the submission object
                const updatedSubmission = JSON.parse(JSON.stringify(this.submission));
                
                // Find the assignment and the artwork
                const assignmentIndex = updatedSubmission.assignments.findIndex(a => a._id === this.assignment._id);
                if (assignmentIndex === -1) {
                    this.showRejectModal = false;
                    return;
                }

                const artworkIndex = updatedSubmission.assignments[assignmentIndex].artworks.findIndex(aw => aw._id === this.pendingRejectArtworkId);
                if (artworkIndex === -1) {
                    this.showRejectModal = false;
                    return;
                }

                // Update the status ID and rejectionReason
                updatedSubmission.assignments[assignmentIndex].artworks[artworkIndex].status = targetStatus._id;
                updatedSubmission.assignments[assignmentIndex].artworks[artworkIndex].rejectionReason = this.rejectRemark;

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
                
                this.showRejectModal = false;
                this.rejectRemark = '';
                this.pendingRejectArtworkId = null;
                this.pendingRejectStatusName = '';
                
                alert(this.$i18n.locale === 'en' ? 'Submission rejected and notification sent.' : 'ปฏิเสธชิ้นงานส่งของนักศึกษาและส่งอีเมลแจ้งเตือนเรียบร้อยแล้ว');
                
            } catch (error) {
                console.error('Error rejecting submission:', error);
                alert(this.$i18n.locale === 'en' ? 'An error occurred while rejecting the submission.' : 'เกิดข้อผิดพลาดในการปฏิเสธการส่งงาน');
            } finally {
                this.loading = false;
            }
        },
        handleExport() {
            if (!this.mappedArtworks || this.mappedArtworks.length === 0) {
                alert(this.$i18n.locale === 'en' ? 'No data available to export.' : 'ไม่มีข้อมูลสำหรับการส่งออก');
                return;
            }

            const headers = this.$i18n.locale === 'en' ? [
                'Student Name', 'Student ID', 'Submitted Date & Time', 
                'On Time Status', 'Review Status', 'Artwork Title (TH)', 
                'Artwork Title (EN)', 'Category', 'Technique (EN)', 
                'Size (EN)', 'Price (THB)'
            ] : [
                'ชื่อนักศึกษา', 'รหัสนักศึกษา', 'วันที่และเวลาที่ส่ง', 
                'ความตรงต่อเวลา', 'สถานะการตรวจสอบ', 'ชื่อผลงาน (ไทย)', 
                'ชื่อผลงาน (อังกฤษ)', 'หมวดหมู่', 'เทคนิค (อังกฤษ)', 
                'ขนาด (อังกฤษ)', 'ราคา (บาท)'
            ];

            const data = this.mappedArtworks.map(item => {
                const onTimeText = item.on_time 
                    ? (this.$i18n.locale === 'en' ? 'On Time' : 'ตรงเวลา')
                    : (this.$i18n.locale === 'en' ? 'Late' : 'สาย');
                
                const statusText = this.$i18n.locale === 'en' 
                    ? item.status 
                    : (item.status === 'Approved' || item.status === 'Passed' ? 'ผ่าน/อนุมัติ' : item.status === 'Rejected' || item.status === 'Fail' ? 'ไม่ผ่าน' : 'รอตรวจสอบ');

                return [
                    item.student_name,
                    item.student_id,
                    item.submitted_date,
                    onTimeText,
                    statusText,
                    item.title_th,
                    item.title_en,
                    item.category,
                    item.technique_en,
                    item.size_en,
                    item.price
                ];
            });

            const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
            const assignmentName = this.assignmentTitle.replace(/\s+/g, '_');
            XLSX.writeFile(wb, `Assignment_${assignmentName}_Submissions_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
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
