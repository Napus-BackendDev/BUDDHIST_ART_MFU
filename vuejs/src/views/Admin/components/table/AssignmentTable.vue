<template>
    <div class="row m-0">
        <!-- Main Table Area (Expands if no item selected, shrinks if item selected) -->
        <div :class="[selectedItem ? 'col-md-8' : 'col-12', 'pl-0 pr-0 pr-md-3 transition-width']">
            <CCard class="assignment-table-card mb-4">
                <div>
                    <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                        :striped="false">

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
                                    {{ item.status }}
                                </div>
                            </td>
                        </template>

                        <!-- Deadline Column -->
                        <template #deadline="{ item }">
                            <td class="align-middle" @click="selectItem(item)" style="cursor: pointer;">
                                <div v-if="item.on_time" class="status-badge badge-passed">
                                    <CIcon name="cil-check" size="sm" class="status-icon" /> On Time
                                </div>
                                <div v-else class="status-badge badge-fail">
                                    <CIcon name="cil-warning" size="sm" class="status-icon" /> Late
                                </div>
                            </td>
                        </template>
                    </CDataTable>
                </div>

                <CCardFooter
                    class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
                    <div class="text-muted text-sm">Showing {{ items.length }} of {{ items.length }} submissions</div>
                    <div class="pagination-buttons">
                        <CButton color="light" class="btn-pagination mr-2" disabled>Previous</CButton>
                        <CButton color="light" class="btn-pagination">Next</CButton>
                    </div>
                </CCardFooter>
            </CCard>
        </div>

        <!-- Right Side Panel (Split-View Card) -->
        <div v-if="selectedItem" class="col-md-4 p-0 mt-4 mt-md-0 slide-in">
            <CCard class="preview-card h-100 border-0 shadow-sm">
                <CCardHeader class="bg-white border-0 d-flex justify-content-between align-items-center pt-4 px-4 pb-0">
                    <h6 class="m-0 font-weight-bold panel-title">Submission Detail</h6>
                    <button class="close-panel-btn" @click="closePanel">
                        <CIcon name="cil-x" size="custom" height="18" />
                    </button>
                </CCardHeader>

                <CCardBody class="p-4 d-flex flex-column">
                    <!-- Artwork Image -->
                    <div class="image-section mb-4">
                        <div class="detail-image-wrapper shadow-sm custom-img-hover">
                            <img :src="selectedItem.preview" alt="Student Submission" class="img-fluid detail-image" />
                            <div class="img-overlay d-flex align-items-center justify-content-center">
                                <a :href="selectedItem.preview" target="_blank" class="btn btn-light rounded-pill font-weight-bold shadow-sm px-4">
                                    View Fullscreen
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Student & Submission Details -->
                    <div class="d-flex justify-content-between align-items-start mb-4 pb-4 border-bottom-light">
                        <div class="student-info-block">
                            <h3 class="student-name mb-1">{{ selectedItem.student_name }}</h3>
                            <p class="submission-date mb-0">Submitted on {{ selectedItem.submitted_date }}</p>
                        </div>
                        <div class="status-badges-group d-flex flex-column align-items-end">
                            <div :class="['status-badge status-badge-sm mb-2', getStatusBadge(selectedItem.status).class]">
                                <CIcon :name="getStatusBadge(selectedItem.status).icon" size="sm" class="status-icon" />
                                {{ selectedItem.status }}
                            </div>
                            <div v-if="selectedItem.on_time" class="status-badge status-badge-sm badge-passed">
                                <CIcon name="cil-check" size="sm" class="status-icon" /> On-time
                            </div>
                            <div v-else class="status-badge status-badge-sm badge-fail">
                                <CIcon name="cil-warning" size="sm" class="status-icon" /> Late
                            </div>
                        </div>
                    </div>

                    <!-- Artwork Detail Block -->
                    <div class="mb-4">
                        <p class="detail-label mb-2">ARTWORK DETAIL</p>
                        <div class="artwork-description-box">
                            <p class="description-text m-0">
                                Acrylic on canvas, 24x36 inches. A study of color theory using primary colors.
                            </p>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex justify-content-between action-buttons mt-auto pt-2">
                        <CButton class="btn-action btn-passed flex-grow-1 mr-3" variant="outline">Mark Passed</CButton>
                        <CButton class="btn-action btn-failed flex-grow-1" variant="outline">Mark Fail</CButton>
                    </div>
                </CCardBody>
            </CCard>
        </div>
    </div>
</template>

<script>
import moment from 'moment'

export default {
    name: 'AssignmentTable',
    props: {
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
            fields: [
                { key: 'preview', label: 'Preview', _classes: 'font-weight-bold' },
                { key: 'student_name', label: 'Student Name', _classes: 'font-weight-bold' },
                { key: 'submitted_date', label: 'Submitted Date' },
                { key: 'status', label: 'Status' },
                { key: 'deadline', label: 'Deadline' }
            ],
            items: [
                {
                    id: 1,
                    preview: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=150',
                    student_name: 'John Doe',
                    student_id: '6431501001',
                    submitted_date: 'Oct 23, 2023 10:30 AM',
                    on_time: true,
                    status: 'Passed',
                    deadline: 'Oct 25, 2023 11:59 PM'
                },
                {
                    id: 2,
                    preview: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=150',
                    student_name: 'Jane Smith',
                    student_id: '6431501002',
                    submitted_date: 'Oct 24, 2023 02:15 PM',
                    on_time: true,
                    status: 'Pending',
                    deadline: 'Oct 25, 2023 11:59 PM'
                },
                {
                    id: 3,
                    preview: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=150',
                    student_name: 'Bob Johnson',
                    student_id: '6431501003',
                    submitted_date: 'Oct 26, 2023 09:40 AM',
                    on_time: false,
                    status: 'Pending',
                    deadline: 'Oct 25, 2023 11:59 PM'
                },
                {
                    id: 4,
                    preview: 'https://images.unsplash.com/photo-1574182245536-392197177651?w=150',
                    student_name: 'Alice Williams',
                    student_id: '6431501004',
                    submitted_date: 'Oct 25, 2023 11:50 PM',
                    on_time: true,
                    status: 'Fail',
                    deadline: 'Oct 25, 2023 11:59 PM'
                },
                {
                    id: 5,
                    preview: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=150',
                    student_name: 'Charlie Brown',
                    student_id: '6431501005',
                    submitted_date: 'Oct 22, 2023 08:00 AM',
                    on_time: true,
                    status: 'Passed',
                    deadline: 'Oct 25, 2023 11:59 PM'
                }
            ]
        }
    },
    computed: {
        filteredItems() {
            return this.items.filter(item => {
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
        }
    },
    methods: {
        selectItem(item) {
            this.selectedItem = item;
        },
        closePanel() {
            this.selectedItem = null;
        },
        getStatusBadge(status) {
            if (status === 'Passed') return { class: 'badge-passed', icon: 'cil-check-circle' };
            if (status === 'Fail') return { class: 'badge-fail', icon: 'cil-x-circle' };
            return { class: 'badge-pending', icon: 'cil-clock' }; // Pending
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
    font-size: 0.95rem;
    line-height: 1.6;
    color: #5c6873;
    font-weight: 500;
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

::v-deep .table td {
    vertical-align: middle;
}

::v-deep tr:hover td {
    background-color: #f8f9fa;
}
</style>
