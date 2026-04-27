<template>
    <CCard class="submission-detail-table-card mb-4">
        <div>
            <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false">

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

                <template #actions="{ item }">
                    <td class="text-right">
                        <div class="d-inline-flex align-items-center" v-if="!isClosed(item)">
                            <button 
                                v-if="hasSubmitted(item)"
                                class="btn-view-work" 
                                @click="$emit('view-work', item)"
                            >
                                <CIcon name="cil-magnifying-glass" class="mr-2 icon-submit" />
                                <span>ดูผลงานที่ส่งไป</span>
                            </button>
                            <button 
                                v-else
                                class="btn-submit-work" 
                                @click="$emit('submit-work', item)"
                            >
                                <CIcon name="cil-cloud-upload" class="mr-2 icon-submit" />
                                <span>ส่งงาน</span>
                            </button>
                        </div>
                    </td>
                </template>
            </CDataTable>
        </div>

        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
            <div class="text-muted text-sm">Showing {{ items.length }} of {{ items.length }} assignments</div>
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
        isClosed(item) {
            return item.create && item.create.endAt && moment(item.create.endAt).isBefore(moment());
        },
        getProgressColor(progress) {
            if (progress >= 100) return 'success'
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
        hasSubmitted(item) {
            if (!item.artworks || !Array.isArray(item.artworks)) return false;
            const currentUserId = this.userId;
            return item.artworks.some(art => {
                const ownerId = art.owner?._id || art.owner;
                return ownerId === currentUserId;
            });
        }
    },
    computed: {
        ...mapGetters({
            userId: 'auth/userId'
        }),
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

.pill-badge {
    border-radius: 50px;
    font-weight: 600;
    padding: 4px 12px !important;
    font-size: 0.75rem;
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
.btn-submit-work {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    border: none;
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(56, 161, 105, 0.2);
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-submit-work:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(56, 161, 105, 0.3);
    background: linear-gradient(135deg, #51cf84 0%, #40b074 100%);
}

.btn-submit-work:active {
    transform: translateY(0);
}

.btn-view-work {
    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
    border: none;
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.2);
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-view-work:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(66, 153, 225, 0.3);
    background: linear-gradient(135deg, #50aff5 0%, #3a91d6 100%);
}

.btn-view-work:active {
    transform: translateY(0);
}

.icon-submit {
    width: 16px;
    height: 16px;
}

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
