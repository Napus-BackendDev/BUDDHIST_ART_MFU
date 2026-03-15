<template>
    <CCard class="submission-table-card mb-4">
        <div>
            <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false">

                <template #title="{ item }">
                    <td class="font-weight-bold text-dark">{{ item.title }}</td>
                </template>

                <template #totalStudent="{ item }">
                    <td class="text-muted">{{ item.totalStudent }} Students</td>
                </template>

                <template #subAssignment="{ item }">
                    <td>
                        <CBadge color="info" class="p-2 pill-badge">{{ item.subAssignment }} Tasks</CBadge>
                    </td>
                </template>

                <template #progress="{ item }">
                    <td style="min-width: 150px;">
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1 mr-3">
                                <CProgress 
                                    :value="item.progress" 
                                    :color="getProgressColor(item.progress)" 
                                    height="6px" 
                                    class="progress-premium"
                                />
                            </div>
                            <span class="progress-label">{{ item.progress }}%</span>
                        </div>
                    </td>
                </template>

                <template #dueDate="{ item }">
                    <td style="white-space: nowrap;">
                        <div class="d-flex align-items-center">
                            <CIcon name="cil-calendar" class="mr-2 text-muted" size="sm" />
                            <span class="text-muted date-text-sm">{{ formatDate(item.startDate) }} &ndash; {{ formatDate(item.dueDate) }}</span>
                        </div>
                    </td>
                </template>

                <template #actions="{ item }">
                    <td class="text-right">
                        <div class="d-inline-flex align-items-center">
                            <button 
                                class="action-btn icon-view" 
                                v-c-tooltip="'ดูรายละเอียด'"
                                @click="$emit('view', item)"
                            >
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-edit ml-2" 
                                v-c-tooltip="'แก้ไข'"
                                @click="$emit('edit', item)"
                            >
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-trash ml-2" 
                                v-c-tooltip="'ลบ'"
                                @click="$emit('delete', item)"
                            >
                                <CIcon name="cil-trash" size="lg" />
                            </button>
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
</template>

<script>
import moment from 'moment'

export default {
    name: 'SubmissionTable',
    props: {
        filters: {
            type: Object,
            default: () => ({
                search: '',
                startDate: null,
                endDate: null,
                quickRange: 'All Time'
            })
        }
    },
    data() {
        return {
            fields: [
                { key: 'title', label: 'SUBMISSION TITLE', _classes: 'border-top-0 border-bottom' },
                { key: 'totalStudent', label: 'TOTAL STUDENT', _classes: 'border-top-0 border-bottom' },
                { key: 'subAssignment', label: 'SUBASSIGNMENT', _classes: 'border-top-0 border-bottom' },
                { key: 'progress', label: 'PROGRESS', _classes: 'border-top-0 border-bottom' },
                { key: 'dueDate', label: 'DATE & TIME', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ],
            items: [
                { 
                    id: 1, 
                    title: 'Midterm Art Project', 
                    totalStudent: 45, 
                    subAssignment: 3, 
                    progress: 85, 
                    startDate: '2024-04-01', 
                    dueDate: '2024-04-20', 
                    date: new Date(),
                    selectedStudents: ['USR-001', 'USR-002', 'USR-003'],
                    assignments: [
                        { id: 101, title: 'Sketch 1: Research', startDateTime: '2024-04-01T08:00', endDateTime: '2024-04-05T17:00' },
                        { id: 102, title: 'Sketch 2: Draft', startDateTime: '2024-04-06T08:00', endDateTime: '2024-04-10T17:00' },
                        { id: 103, title: 'Final Painting', startDateTime: '2024-04-11T08:00', endDateTime: '2024-04-20T23:59' }
                    ]
                },
                { 
                    id: 2, 
                    title: 'Final Sculpture Exhibition', 
                    totalStudent: 30, 
                    subAssignment: 1, 
                    progress: 45, 
                    startDate: '2024-05-01', 
                    dueDate: '2024-05-15', 
                    date: new Date(),
                    selectedStudents: ['USR-004', 'USR-005'],
                    assignments: [
                        { id: 201, title: 'Concept Proposal', startDateTime: '2024-05-01T08:00', endDateTime: '2024-05-15T17:00' }
                    ]
                },
                { 
                    id: 3, 
                    title: 'Weekly Sketchbook - Week 1', 
                    totalStudent: 50, 
                    subAssignment: 0, 
                    progress: 100, 
                    startDate: '2024-01-15', 
                    dueDate: '2024-02-01', 
                    date: new Date(),
                    selectedStudents: ['USR-001', 'USR-002', 'USR-003', 'USR-004', 'USR-005', 'USR-006', 'USR-007'],
                    assignments: []
                }
            ]
        }
    },
    methods: {
        formatDate(date) {
            return moment(date).format('MMM DD, YYYY')
        },
        getProgressColor(progress) {
            if (progress === 100) return 'success'
            if (progress > 70) return 'info'
            if (progress > 30) return 'warning'
            return 'danger'
        }
    },
    computed: {
        filteredItems() {
            return this.items.filter(item => {
                const matchesSearch = item.title.toLowerCase().includes(this.filters.search.toLowerCase())
                
                let matchesDate = true
                if (this.filters.startDate || this.filters.endDate) {
                    const itemDate = new Date(item.date)
                    if (this.filters.startDate && itemDate < this.filters.startDate) matchesDate = false
                    if (this.filters.endDate && itemDate > this.filters.endDate) matchesDate = false
                }
                
                return matchesSearch && matchesDate
            })
        }
    }
}
</script>

<style scoped>
.submission-table-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    margin-top: 1rem;
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

.text-dark {
    color: #2c3e50 !important;
    font-size: 0.95rem;
}

.text-muted {
    color: #8c98a9 !important;
    font-size: 0.95rem;
}

.text-sm {
    font-size: 0.9rem;
}

/* Footer Pagination */
.pagination-footer {
    border-top: 1px solid #f0f1f5 !important;
    margin: 0 1.5rem;
    padding-left: 0;
    padding-right: 0;
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

/* Action Buttons */
.action-btn {
    background: transparent;
    border: none;
    padding: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: transform 0.2s, background-color 0.2s, opacity 0.2s;
    outline: none;
    opacity: 1; /* Always visible */
}

.action-btn:hover {
    transform: scale(1.15);
}

.icon-success {
    color: #48bb78;
}

.icon-success:hover {
    background-color: #f0fff4;
    /* Light green bg */
}

.icon-danger {
    color: #e53e3e;
}

.icon-danger:hover {
    background-color: #ffdddd;
    /* Light red bg */
}

.icon-trash {
    color: #ed8936;
}

.icon-trash:hover {
    background-color: #fffaf0;
}

.icon-view {
    color: #a0aec0;
}

.icon-view:hover {
    background-color: #f1f9ff;
    /* Light gray bg */
}

.icon-edit {
    color: #4299e1;
}

.icon-edit:hover {
    background-color: #ebf8ff;
    /* Light blue bg */
}

.pill-badge {
    border-radius: 50px;
    font-weight: 600;
    padding: 4px 12px !important;
    font-size: 0.75rem;
}

.progress-premium {
    border-radius: 10px;
    background-color: #f1f5f9;
}

.progress-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #475569;
    min-width: 35px;
}

.date-text-sm {
    font-size: 0.85rem;
    font-weight: 500;
}
</style>
