<template>
    <div class="assignment-table-container">
        <div class="row m-0">
            <!-- Main Table Area -->
            <div class="col-12 pl-0 pr-0 transition-width">
                <CCard class="assignment-table-card mb-4">
                    <div>
                        <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                            :striped="false" :items-per-page="10" :active-page="activePage" @page-change="pageChange"
                            @row-clicked="selectItem">

                            <!-- Preview Image Column -->
                            <template #preview="{ item }">
                                <td class="text-center align-middle" @click="selectItem(item)" style="cursor: pointer;">
                                    <img :src="item.preview" alt="Artwork Preview" class="preview-img" />
                                </td>
                            </template>

                            <!-- Student Name Column -->
                            <template #student_name="{ item }">
                                <td class="align-middle" @click="selectItem(item)" style="cursor: pointer;">
                                    <div class="font-weight-bold" style="color: #2c3e50;">{{ item.student_name }}</div>
                                    <div class="small text-muted">{{ item.student_id }}</div>
                                </td>
                            </template>

                            <!-- Submitted Date Column -->
                            <template #submitted_date="{ item }">
                                <td class="align-middle" @click="selectItem(item)" style="cursor: pointer;">
                                    {{ item.submitted_date }}
                                </td>
                            </template>

                            <!-- Status Column -->
                            <template #status="{ item }">
                                <td class="align-middle" @click="selectItem(item)" style="cursor: pointer;">
                                    <div :class="['status-badge', getStatusBadge(item.status).class]">
                                        <CIcon :name="getStatusBadge(item.status).icon" size="sm" class="status-icon" />
                                        {{ getTranslatedStatus(item.status) }}
                                    </div>
                                </td>
                            </template>

                            <!-- Deadline Column -->
                            <template #deadline="{ item }">
                                <td class="align-middle" @click="selectItem(item)" style="cursor: pointer;">
                                    <div :class="['status-badge', item.on_time ? 'badge-passed' : 'badge-fail']">
                                        <CIcon :name="item.on_time ? 'cil-check' : 'cil-warning'" size="sm" class="status-icon" />
                                        {{ item.on_time ? ($i18n.locale === 'en' ? 'On Time' : 'ตรงเวลา') : ($i18n.locale === 'en' ? 'Late' : 'สาย') }}
                                    </div>
                                </td>
                            </template>
                        </CDataTable>
                    </div>

                    <CCardFooter
                        class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
                        <div class="text-muted text-sm" v-if="filteredItems.length > 0">
                            {{ $i18n.locale === 'en' ? 'Showing' : 'แสดง' }} {{ (activePage - 1) * 10 + 1 }} {{ $i18n.locale === 'en' ? 'to' : 'ถึง' }} {{ Math.min(activePage * 10, filteredItems.length) }} {{ $i18n.locale === 'en' ? 'of' : 'จาก' }} {{ filteredItems.length }} {{ $i18n.locale === 'en' ? 'submissions' : 'รายการ' }}
                        </div>
                        <div class="text-muted text-sm" v-else>
                            {{ $i18n.locale === 'en' ? 'Showing 0 submissions' : 'แสดง 0 รายการ' }}
                        </div>
                        <CPagination
                            :active-page.sync="activePage"
                            :pages="Math.max(1, Math.ceil(filteredItems.length / 10))"
                            size="sm"
                            align="end"
                            class="mb-0 pill-pagination"
                        />
                    </CCardFooter>
                </CCard>
            </div>
        </div>

        <!-- Submission Review Modal (Placed outside for reliability) -->
        <SubmissionReviewModal 
            :show.sync="modalShow" 
            :artwork="selectedItem"
            :isUpdating="isUpdating"
            @update-status="handleAction"
        />
    </div>
</template>

<script>
import moment from 'moment'
import SubmissionReviewModal from '../modal/submission/SubmissionReviewModal.vue'

export default {
    name: 'AssignmentTable',
    components: {
        SubmissionReviewModal
    },
    props: {
        items: {
            type: Array,
            default: () => []
        },
        filters: {
            type: Object,
            default: () => ({
                search: '',
                status: 'All Statuses',
                deadline: 'Any Deadline',
                quickRange: 'All Time',
                startDate: null,
                endDate: null
            })
        }
    },
    data() {
        return {
            selectedItem: null,
            isUpdating: null, // Stores 'Approved' or 'Rejected' during update
            activePage: 1,
            modalShow: false
        }
    },
    watch: {
        'filters': {
            handler() {
                this.activePage = 1;
            },
            deep: true
        }
    },
    computed: {
        fields() {
            return [
                { key: 'preview', label: this.$i18n.locale === 'en' ? 'Preview' : 'รูปตัวอย่าง', _classes: 'font-weight-bold' },
                { key: 'student_name', label: this.$i18n.locale === 'en' ? 'Student Name' : 'ชื่อนักเรียน', _classes: 'font-weight-bold' },
                { key: 'submitted_date', label: this.$i18n.locale === 'en' ? 'Submitted Date' : 'วันที่ส่ง' },
                { key: 'status', label: this.$i18n.locale === 'en' ? 'Status' : 'สถานะ' },
                { key: 'deadline', label: this.$i18n.locale === 'en' ? 'Deadline' : 'กำหนดส่ง' }
            ];
        },
        filteredItems() {
            const list = this.items.filter(item => {
                // Search Filter
                const searchMatch = !this.filters.search || 
                    item.student_name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                    item.student_id.toLowerCase().includes(this.filters.search.toLowerCase());

                // Status Filter
                const statusMatch = this.filters.status === 'All Statuses' || item.status === this.filters.status;

                // Deadline Filter
                let deadlineMatch = true;
                if (this.filters.deadline !== 'Any Deadline') {
                    const isOnTime = this.filters.deadline === 'On Time';
                    if (item.on_time !== isOnTime) deadlineMatch = false;
                }

                // Date Filter
                let dateMatch = true;
                if (this.filters.startDate || this.filters.endDate) {
                    const itemDate = moment(item.submitted_date, 'MMM DD, YYYY hh:mm A');
                    if (this.filters.startDate && itemDate.isBefore(moment(this.filters.startDate).startOf('day'))) dateMatch = false;
                    if (this.filters.endDate && itemDate.isAfter(moment(this.filters.endDate).endOf('day'))) dateMatch = false;
                }

                return searchMatch && statusMatch && deadlineMatch && dateMatch;
            });
            return list.sort((a, b) => {
                const dateA = moment(a.submitted_date, 'MMM DD, YYYY hh:mm A');
                const dateB = moment(b.submitted_date, 'MMM DD, YYYY hh:mm A');
                return dateB - dateA;
            });
        }
    },
    methods: {
        selectItem(item) {
            this.selectedItem = item;
            this.modalShow = true;
        },
        closePanel() {
            this.modalShow = false;
            // Delay clearing item to allow modal exit animation
            setTimeout(() => {
                if (!this.modalShow) this.selectedItem = null;
            }, 300);
        },
        async handleAction(statusName) {
            if (this.isUpdating) return;
            
            this.isUpdating = statusName;
            try {
                await this.$emit('update-status', { 
                    artworkId: this.selectedItem.id, 
                    statusName: statusName 
                });
                // The update happens in parent, we wait a bit or let parent signal completion
                // For UX, we'll keep loading for a short duration or until selectedItem changes
            } finally {
                // We'll reset this after parent updates
                setTimeout(() => {
                    this.isUpdating = null;
                }, 1000);
            }
        },
        getStatusBadge(status) {
            if (status === 'Passed' || status === 'Approved') return { class: 'badge-passed', icon: 'cil-check-circle' };
            if (status === 'Fail' || status === 'Rejected') return { class: 'badge-fail', icon: 'cil-x-circle' };
            if (status === 'Pending') return { class: 'badge-pending', icon: 'cil-clock' };
            return { class: 'badge-in-progress', icon: 'cil-history' };
        },
        getTranslatedStatus(status) {
            const map = {
                'Passed': this.$i18n.locale === 'en' ? 'Passed' : 'ผ่าน',
                'Approved': this.$i18n.locale === 'en' ? 'Passed' : 'ผ่าน',
                'Fail': this.$i18n.locale === 'en' ? 'Fail' : 'ไม่ผ่าน',
                'Rejected': this.$i18n.locale === 'en' ? 'Fail' : 'ไม่ผ่าน',
                'Pending': this.$i18n.locale === 'en' ? 'Pending' : 'รอดำเนินการ',
            };
            return map[status] || status;
        },
        pageChange(val) {
            this.activePage = val;
        }
    }
}
</script>

<style scoped>
.preview-img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.detail-image {
    max-height: 250px;
    width: 100%;
    object-fit: cover;
    border-radius: 12px;
}

.custom-img-hover:hover .img-overlay {
    opacity: 1;
}

.preview-card {
    border-radius: 16px;
    border: 1px solid #eef0f3;
}

.panel-title {
    color: #4f5d73;
    font-size: 0.95rem;
    letter-spacing: -0.01em;
}

.close-panel-btn {
    background: transparent;
    border: none;
    color: #8a93a2;
    padding: 0;
    transition: color 0.2s;
    outline: none !important;
}

.close-panel-btn:hover {
    color: #4f5d73;
}

.detail-image-wrapper {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: #f8f9fa;
}

.detail-image {
    width: 100%;
    height: 240px;
    object-fit: cover;
    display: block;
}

.student-name {
    font-size: 1.6rem;
    font-weight: 700;
    color: #3b4d6b;
    letter-spacing: -0.02em;
}

.submission-date {
    font-size: 0.9rem;
    font-weight: 600;
    color: #8c98a9;
}

.border-bottom-light {
    border-bottom: 1px solid #f0f2f5;
}

.detail-label {
    font-size: 0.72rem;
    font-weight: 800;
    color: #8c98a9;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.artwork-description-box {
    background-color: #f8f9fa;
    border-radius: 10px;
    padding: 1.25rem;
}

.description-text {
    font-size: 0.88rem;
    line-height: 1.5;
    color: #5c6873;
    font-weight: 500;
}

.artwork-detail-scroll {
    overflow-y: auto;
    padding-right: 4px;
}

.artwork-detail-scroll::-webkit-scrollbar {
    width: 4px;
}

.artwork-detail-scroll::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.detail-value-box {
    background: #f8f9fa;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.9rem;
    color: #2c3e50;
    font-weight: 600;
    border: 1px solid #f1f3f5;
}

.lang-tag {
    font-size: 0.65rem;
    font-weight: 800;
    color: #ffffff;
    background: #8c98a9;
    padding: 2px 6px;
    border-radius: 4px;
    margin-right: 6px;
}

.detail-info-mini {
    background: #ffffff;
    border: 1px solid #f0f2f5;
    padding: 0.6rem 0.8rem;
    border-radius: 10px;
    font-size: 0.85rem;
    color: #4f5d73;
    font-weight: 600;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.btn-action {
    height: 44px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s;
}

.btn-passed {
    border-color: #10b981 !important;
    color: #10b981 !important;
}

.btn-passed:hover {
    background-color: #10b981 !important;
    color: #ffffff !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.2);
}

.btn-failed {
    border-color: #e53e3e !important;
    color: #e53e3e !important;
}

.btn-failed:hover {
    background-color: #e53e3e !important;
    color: #ffffff !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(229, 62, 62, 0.2);
}

.status-badge-sm {
    padding: 0.3rem 0.8rem;
    font-size: 0.72rem;
}

.transition-width {
    transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-in {
    animation: slideInRight 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.assignment-table-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.custom-table th {
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 700;
    color: #7a8aa3;
    padding: 1.25rem 1.5rem;
    border-color: #f0f1f5;
    background-color: #ffffff;
}

.custom-table td {
    padding: 1.25rem 1.5rem;
    vertical-align: middle;
    border-bottom: 1px solid #f0f1f5;
    color: #172b4d;
}

.custom-table tr:last-child td {
    border-bottom: none;
}

/* Footer Pagination */
.pagination-footer {
    border-top: 1px solid #f0f1f5 !important;
    margin: 0 1.5rem;
    padding-left: 0;
    padding-right: 0;
}

.text-sm {
    font-size: 0.9rem;
}

.btn-pagination {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    color: #4a5568;
    font-weight: 600;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
    background-color: #f7fafc;
    color: #1a202c;
}

.btn-pagination:disabled {
    opacity: 0.6;
    background-color: #ffffff;
}

.rounded-bottom {
    border-bottom-left-radius: 12px !important;
    border-bottom-right-radius: 12px !important;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 1rem;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.3px;
    white-space: nowrap;
}

.status-icon {
    width: 14px;
    height: 14px;
    margin-right: 6px;
}

.badge-passed {
    color: #38a169;
    background-color: #f0fff4;
    border: 1px solid rgba(56, 161, 105, 0.4);
}

.badge-pending {
    color: #d69e2e;
    background-color: #fffaf0;
    border: 1px solid rgba(214, 158, 46, 0.4);
}

.badge-fail {
    color: #e53e3e;
    background-color: #fff5f5;
    border: 1px solid rgba(229, 62, 62, 0.4);
}

.badge-in-progress {
    color: #3182ce;
    background-color: #ebf8ff;
    border: 1px solid rgba(49, 130, 206, 0.4);
}

.text-dark-blue {
    color: #2c3e50 !important;
}

.deadline-container {
    line-height: 1.2;
}

::v-deep .table td {
    vertical-align: middle;
}

::v-deep tr:hover td {
    background-color: #f8f9fa;
    cursor: pointer;
}
</style>
