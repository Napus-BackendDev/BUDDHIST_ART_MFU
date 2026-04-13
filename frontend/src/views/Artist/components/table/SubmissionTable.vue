<template>
    <CCard class="submission-table-card mb-4">
        <div>
            <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false">

                <template #title="{ item }">
                    <td class="font-weight-bold text-dark">{{ getName('en', item) }}</td>
                </template>

                <template #totalStudent="{ item }">
                    <td class="text-muted">{{ getTotalStudents(item) }} Students</td>
                </template>

                <template #subAssignment="{ item }">
                    <td>
                        <div class="task-badge">
                            <CIcon name="cilDescription" size="sm" class="badge-icon" />
                            <span>{{ getAssignmentCount(item) }} Tasks</span>
                        </div>
                    </td>
                </template>

                <template #progress="{ item }">
                    <td style="min-width: 150px;">
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1 mr-3">
                                <CProgress 
                                    :value="calculateProgress(item)" 
                                    :color="getProgressColor(calculateProgress(item))" 
                                    height="6px" 
                                    class="progress-premium"
                                />
                            </div>
                            <span class="progress-label">{{ calculateProgress(item) }}%</span>
                        </div>
                    </td>
                </template>

                <template #dueDate="{ item }">
                    <td style="white-space: nowrap;">
                        <div class="d-flex align-items-center" v-if="item.create">
                            <CIcon name="cil-calendar" class="mr-2 text-muted" size="sm" />
                            <span class="text-muted date-text-sm">{{ formatDate(item.create.startAt) }} &ndash; {{ formatDate(item.create.endAt) }}</span>
                        </div>
                        <div class="d-flex align-items-center" v-else>
                            <span class="text-muted date-text-sm">N/A</span>
                        </div>
                    </td>
                </template>

                <template #status="{ item }">
                    <td>
                        <div :class="['status-badge', getStatusClass(item)]">
                            <CIcon :name="getStatusIcon(item)" size="sm" class="badge-icon" />
                            <span>{{ getStatusLabel(item) }}</span>
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
                        </div>
                    </td>
                </template>
            </CDataTable>
        </div>

        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
            <div class="text-muted text-sm">Showing {{ filteredItems.length }} of {{ filteredItems.length }} submissions</div>
            <div class="pagination-buttons">
                <CButton class="btn-pill-pagination mr-2" :disabled="true">
                    <CIcon name="cil-chevron-left" size="sm" class="mr-1" /> Previous
                </CButton>
                <CButton class="btn-pill-pagination">
                    Next <CIcon name="cil-chevron-right" size="sm" class="ml-1" />
                </CButton>
            </div>
        </CCardFooter>
    </CCard>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'

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
                { key: 'status', label: 'STATUS', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ]
        }
    },
    methods: {
        formatDate(date) {
            if (!date) return 'N/A';
            return moment(date).format('MMM DD, YYYY')
        },
        moment(arg) {
            return moment(arg);
        },
        getProgressColor(progress) {
            if (progress === 100) return 'success'
            if (progress > 70) return 'info'
            if (progress > 30) return 'warning'
            return 'danger'
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
        getTotalStudents(item) {
            return item.artist ? item.artist.length : 0;
        },
        getAssignmentCount(item) {
            return item.assignments ? item.assignments.length : 0;
        },
        calculateProgress(item) {
            if (!item.assignments || item.assignments.length === 0 || !item.artist || item.artist.length === 0) return 0;
            const totalPossible = item.assignments.length * item.artist.length;
            let totalSubmitted = 0;
            item.assignments.forEach(assign => {
                totalSubmitted += assign.artworks ? assign.artworks.length : 0;
            });
            return Math.round((totalSubmitted / totalPossible) * 100);
        },
        getStatusLabel(item) {
            if (!item.create || !item.create.startAt || !item.create.endAt) return 'N/A';
            const now = moment();
            const start = moment(item.create.startAt);
            const end = moment(item.create.endAt);

            if (now.isBefore(start)) return 'Upcoming';
            if (now.isBetween(start, end)) return 'Open';
            return 'Closed';
        },
        getStatusColor(item) {
            if (!item.create || !item.create.startAt || !item.create.endAt) return 'secondary';
            const now = moment();
            const start = moment(item.create.startAt);
            const end = moment(item.create.endAt);

            if (now.isBefore(start)) return 'warning';
            if (now.isBetween(start, end)) return 'success';
            return 'danger';
        },
        getStatusClass(item) {
            const status = this.getStatusLabel(item).toLowerCase().replace('/', '');
            return `status-${status}`;
        },
        getStatusIcon(item) {
            const status = this.getStatusLabel(item);
            if (status === 'Open') return 'cilLockUnlocked';
            if (status === 'Closed') return 'cilLockLocked';
            return 'cilHistory';
        }
    },
    computed: {
        ...mapGetters({
            submissions: 'submission/submissions'
        }),
        filteredItems() {
            if (!this.submissions) return [];
            return this.submissions.filter(item => {
                const title = (this.getName('en', item) || this.getName('th', item) || '').toLowerCase();
                const matchesSearch = title.includes(this.filters.search.toLowerCase())
                
                let matchesDate = true
                if (this.filters.startDate || this.filters.endDate) {
                    const startAt = (item.create && item.create.startAt) ? item.create.startAt : item.createdAt;
                    const itemDate = new Date(startAt);
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

/* Custom Status Badges */
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 1rem;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 700;
    border: 1.5px solid transparent;
    width: fit-content;
}

.status-badge .badge-icon {
    margin-right: 0.4rem;
    width: 14px;
    height: 14px;
}

.status-open {
    background-color: rgba(72, 187, 120, 0.08); /* Very light green */
    border-color: rgba(72, 187, 120, 0.3);
    color: #2f855a;
}

.status-closed {
    background-color: rgba(229, 62, 62, 0.08); /* Very light red */
    border-color: rgba(229, 62, 62, 0.3);
    color: #c53030;
}

.status-upcoming {
    background-color: rgba(237, 137, 54, 0.08); /* Very light orange */
    border-color: rgba(237, 137, 54, 0.3);
    color: #c05621;
}

.status-na {
    background-color: #f1f5f9;
    color: #64748b;
}

/* Task Badge Style */
.task-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.85rem;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 700;
    background-color: rgba(66, 153, 225, 0.08);
    border: 1.5px solid rgba(66, 153, 225, 0.3);
    color: #3182ce;
    width: fit-content;
    white-space: nowrap;
}

.task-badge .badge-icon {
    margin-right: 0.35rem;
    width: 14px;
    height: 14px;
}
</style>
