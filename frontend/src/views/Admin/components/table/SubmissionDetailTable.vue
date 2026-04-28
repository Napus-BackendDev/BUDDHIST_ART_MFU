<template>
    <CCard class="submission-detail-table-card mb-4">
        <div>
            <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false" :items-per-page="10" :active-page="activePage" @page-change="pageChange">

                <template #assignmentTitle="{ item }">
                    <td class="font-weight-bold text-dark">{{ getName('en', item) }}</td>
                </template>

                <template #status="{ item }">
                    <td>
                        <div v-if="item.create" :class="['status-badge', moment(item.create.endAt).isBefore(moment()) ? 'badge-closed' : 'badge-in-progress']">
                            <CIcon :name="moment(item.create.endAt).isBefore(moment()) ? 'cil-lock-locked' : 'cil-history'" size="sm" class="status-icon" /> 
                            {{ moment(item.create.endAt).isBefore(moment()) ? 'Closed' : 'In Progress' }}
                        </div>
                    </td>
                </template>

                <template #datetime="{ item }">
                    <td style="white-space: nowrap;">
                        <div class="d-flex align-items-center" v-if="item.create">
                            <CIcon name="cil-calendar" class="mr-2 text-muted" size="sm" />
                            <span class="text-muted date-text-sm">{{ formatDate(item.create.startAt) }} &ndash; {{ formatDate(item.create.endAt) }}</span>
                        </div>
                    </td>
                </template>

                <template #submission="{ item }">
                    <td style="min-width: 150px;">
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1 mr-3">
                                <CProgress 
                                    :value="getEffectiveTotalStudents(item) > 0 ? Math.round(((item.artworks ? item.artworks.length : 0) / getEffectiveTotalStudents(item)) * 100) : 0" 
                                    :color="getProgressColor(getEffectiveTotalStudents(item) > 0 ? Math.round(((item.artworks ? item.artworks.length : 0) / getEffectiveTotalStudents(item)) * 100) : 0)" 
                                    height="6px" 
                                    class="progress-premium"
                                />
                            </div>
                            <span class="progress-label">{{ getEffectiveTotalStudents(item) > 0 ? Math.round(((item.artworks ? item.artworks.length : 0) / getEffectiveTotalStudents(item)) * 100) : 0 }}%</span>
                        </div>
                    </td>
                </template>

                <template #respon="{ item }">
                    <td>
                        <div class="d-flex align-items-center">
                            <!-- Finish -->
                            <div class="status-display-item mr-4">
                                <div class="status-box bg-success-premium">
                                    <CIcon name="cil-check" size="lg" />
                                </div>
                                <span class="status-count ml-2">{{ getResponStats(item).finish }}</span>
                            </div>
                            
                            <!-- Pending -->
                            <div class="status-display-item mr-4">
                                <div class="status-box bg-warning-premium text-dark-blue">
                                    <CIcon name="cil-clock" size="lg" />
                                </div>
                                <span class="status-count ml-2">{{ getResponStats(item).pending }}</span>
                            </div>

                            <!-- Error -->
                            <div class="status-display-item">
                                <div class="status-box bg-danger-premium">
                                    <CIcon name="cil-warning" size="lg" />
                                </div>
                                <span class="status-count ml-2">{{ getResponStats(item).error }}</span>
                            </div>
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
                                class="action-btn icon-edit mx-2" 
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
            <div class="text-muted text-sm" v-if="filteredItems.length > 0">
                Showing {{ (activePage - 1) * 10 + 1 }} to {{ Math.min(activePage * 10, filteredItems.length) }} of {{ filteredItems.length }} assignments
            </div>
            <div class="text-muted text-sm" v-else>
                Showing 0 assignments
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
</template>

<script>
import moment from 'moment'

export default {
    name: 'SubmissionDetailTable',
    props: {
        items: {
            type: Array,
            default: () => []
        },
        totalStudents: {
            type: Number,
            default: 0
        },
        filters: {
            type: Object,
            default: () => ({
                search: '',
                status: 'All Status'
            })
        }
    },
    data() {
        return {
            fields: [
                { key: 'assignmentTitle', label: 'ASSIGNMENT TITLE', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'status', label: 'STATUS', _classes: 'border-top-0 border-bottom' },
                { key: 'datetime', label: 'DATE & TIME', _classes: 'border-top-0 border-bottom' },
                { key: 'submission', label: 'SUBMISSION', _classes: 'border-top-0 border-bottom' },
                { key: 'respon', label: 'RESPOND', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ],
            activePage: 1
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
    methods: {
        formatDate(date) {
            if (!date) return 'N/A';
            return moment(date).format('MMM DD, YYYY')
        },
        moment(arg) {
            return moment(arg);
        },
        getProgressColor(progress) {
            if (progress >= 100) return 'success'
            if (progress > 70) return 'info'
            if (progress > 30) return 'warning'
            return 'danger'
        },
        getEffectiveTotalStudents(item) {
            if (item && item.artist && item.artist.length > 0) return item.artist.length;
            return this.totalStudents;
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
        getResponStats(item) {
            const artworks = item.artworks || [];
            return {
                finish: artworks.filter(a => a.status === 'Approved').length, // Assuming status names
                pending: artworks.filter(a => a.status === 'Pending').length,
                error: artworks.filter(a => a.status === 'Rejected').length
            };
        },
        pageChange(val) {
            this.activePage = val;
        }
    },
    computed: {
        filteredItems() {
            return (this.items || []).filter(item => {
                const title = (this.getName('en', item) || this.getName('th', item) || '').toLowerCase();
                const searchMatch = !this.filters.search || 
                    title.includes(this.filters.search.toLowerCase());
                
                // Status logic can be refined based on dates
                const now = moment();
                const isClosed = item.create && item.create.endAt && moment(item.create.endAt).isBefore(now);
                const status = isClosed ? 'Closed' : 'In Progress';

                const statusMatch = this.filters.status === 'All Status' || status === this.filters.status;

                let dateMatch = true;
                if (this.filters.startDate && this.filters.endDate) {
                    const startAt = (item.create && item.create.startAt) ? item.create.startAt : null;
                    if (startAt) {
                        const assignmentDate = moment(startAt).startOf('day');
                        const start = moment(this.filters.startDate).startOf('day');
                        const end = moment(this.filters.endDate).endOf('day');
                        dateMatch = assignmentDate.isBetween(start, end, null, '[]');
                    } else {
                        dateMatch = false;
                    }
                }

                return searchMatch && statusMatch && dateMatch;
            });
        }
    }
}
</script>

<style scoped>
.submission-detail-table-card {
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

.text-danger {
    color: #e53e3e !important;
}

.text-muted {
    color: #8c98a9 !important;
    font-size: 0.95rem;
}

.status-display-item {
    display: flex;
    align-items: center;
    width: 65px; /* Fixed width for alignment */
    margin-right: 0.75rem;
}

.status-box {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-box ::v-deep svg, 
.status-box ::v-deep i {
    width: 14px;
    height: 14px;
}

.bg-success-premium {
    background-color: #2ecc71;
}

.bg-warning-premium {
    background-color: #f1c40f;
}

.bg-danger-premium {
    background-color: #e74c3c;
}

.text-dark-blue {
    color: #2c3e50 !important;
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

.badge-in-progress {
    color: #38a169;
    background-color: #f0fff4;
    border: 1px solid rgba(56, 161, 105, 0.4);
}

.badge-closed {
    color: #e53e3e;
    background-color: #fff5f5;
    border: 1px solid rgba(229, 62, 62, 0.4);
}

.date-text-sm {
    font-size: 0.85rem;
    font-weight: 500;
}

.status-count {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1;
}

.respon-badge {
    font-size: 0.7rem;
    padding: 4px 8px;
    border-radius: 4px;
}
.text-sm {
    font-size: 0.9rem;
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
    min-width: 45px;
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
    opacity: 1;
    /* Always visible */
}

/* Show action buttons when the table row is hovered */
::v-deep .custom-table tbody tr:hover .action-btn {
    opacity: 1;
}

.action-btn:hover {
    transform: scale(1.15);
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
</style>
