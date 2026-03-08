<template>
    <div class="row m-0">
        <!-- Main Table Area (Expands if no item selected, shrinks if item selected) -->
        <div :class="[selectedItem ? 'col-md-8' : 'col-12', 'pl-0 pr-0 pr-md-3 transition-width']">
            <CCard class="assignment-table-card mb-4">
                <div>
                    <CDataTable :items="items" :fields="fields" class="custom-table mb-0" hover :border="false"
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
                                <span :class="getStatusBadge(item.status)" class="badge-custom">
                                    {{ item.status }}
                                </span>
                            </td>
                        </template>

                        <!-- Deadline Column -->
                        <template #deadline="{ item }">
                            <td class="align-middle" @click="selectItem(item)" style="cursor: pointer;">
                                <span v-if="item.on_time" class="badge-custom badge-success-soft">On Time</span>
                                <span v-else class="badge-custom badge-danger-soft">Late</span>
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
            <CCard class="shadow-sm h-100 preview-card">
                <CCardHeader
                    class="bg-white border-0 d-flex justify-content-between align-items-center pt-3 pb-0 rounded-top">
                    <h6 class="m-0 font-weight-bold text-dark">Submission Detail</h6>
                    <button class="btn btn-link text-muted p-0" @click="closePanel">
                        <CIcon name="cil-x" size="lg" />
                    </button>
                </CCardHeader>
                <CCardBody class="pt-3">
                    <!-- Artwork Image -->
                    <div class="image-container mb-4 text-center pb-3 border-bottom position-relative custom-img-hover">
                        <img :src="selectedItem.preview" alt="Student Submission"
                            class="img-fluid rounded shadow-sm detail-image" />
                        <div class="img-overlay d-flex align-items-center justify-content-center rounded">
                            <a :href="selectedItem.preview" target="_blank"
                                class="btn btn-light rounded-pill font-weight-bold shadow-sm px-4">
                                View Fullscreen
                            </a>
                        </div>
                    </div>

                    <!-- Student & Submission Details -->
                    <div class="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h3 class="font-weight-bold text-dark mb-1" style="font-size: 1.4rem;">{{
                                selectedItem.student_name
                            }}</h3>
                            <p class="text-muted mb-0 font-weight-bold" style="font-size: 0.95rem;">
                                Submitted on {{ selectedItem.submitted_date }}
                            </p>
                        </div>
                        <div class="text-right d-flex flex-column align-items-end">
                            <span :class="getStatusBadge(selectedItem.status)" class="badge-custom mb-2">
                                {{ selectedItem.status }}
                            </span>
                            <span v-if="selectedItem.on_time" class="status-text text-success font-weight-bold"
                                style="font-size: 0.9rem;">
                                On-time Submission
                            </span>
                            <span v-else class="status-text text-danger font-weight-bold" style="font-size: 0.9rem;">
                                Late Submission
                            </span>
                        </div>
                    </div>

                    <!-- Artwork Detail Block -->
                    <div class="mb-4">
                        <p class="text-muted small mb-2 text-uppercase font-weight-bold tracking-wide"
                            style="color: #6c7d93;">
                            ARTWORK DETAIL
                        </p>
                        <div class="artwork-detail-box p-3 rounded" style="background-color: #f8f9fa;">
                            <p class="mb-0 text-dark" style="font-size: 1rem; line-height: 1.6;">
                                Acrylic on canvas, 24x36 inches. A study of color theory using primary colors.
                            </p>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex justify-content-between action-buttons mt-auto pt-3">
                        <CButton color="success" class="flex-grow-1 mr-2 px-0" variant="outline">Mark Passed</CButton>
                        <CButton color="danger" class="flex-grow-1 ml-2 px-0" variant="outline">Mark Fail</CButton>
                    </div>
                </CCardBody>
            </CCard>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AssignmentTable',
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
    methods: {
        selectItem(item) {
            this.selectedItem = item;
        },
        closePanel() {
            this.selectedItem = null;
        },
        getStatusBadge(status) {
            if (status === 'Passed') return 'badge-success-soft';
            if (status === 'Fail') return 'badge-danger-soft';
            return 'badge-warning-soft'; // Pending
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

.img-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100% - 1rem);
    /* avoid border-bottom area */
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}

.badge-custom {
    padding: 0.2em 0.8em;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid transparent;
}

.badge-success-soft {
    background-color: #f4fff8;
    color: #2e8555;
    border-color: #cce9d6;
}

.badge-warning-soft {
    background-color: #fffaf0;
    color: #c05621;
    border-color: #feebc8;
}

.badge-danger-soft {
    background-color: #fff5f5;
    color: #c53030;
    border-color: #fed7d7;
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

.tracking-wide {
    letter-spacing: 0.5px;
}

.assignment-table-card,
.preview-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.rounded-top {
    border-top-left-radius: 12px !important;
    border-top-right-radius: 12px !important;
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
