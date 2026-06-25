<template>
    <CCard class="submission-table-card mb-4">
        <div>
            <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false" :items-per-page="10" :active-page="activePage" @page-change="pageChange">

                <template #title="{ item }">
                    <td class="font-weight-bold text-dark">{{ getName($i18n.locale, item) || getName('en', item) }}</td>
                </template>

                <template #totalStudent="{ item }">
                    <td class="text-muted">
                        {{ $i18n.locale === 'en' ? `${getTotalStudents(item)} Students` : `${getTotalStudents(item)} คน` }}
                    </td>
                </template>

                <template #subAssignment="{ item }">
                    <td>
                        <div class="status-badge badge-update">
                            <CIcon name="cil-list" size="sm" class="status-icon" /> 
                            {{ $i18n.locale === 'en' ? `${getAssignmentCount(item)} Tasks` : `${getAssignmentCount(item)} รายการ` }}
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

                <template #actions="{ item }">
                    <td class="text-right">
                        <div class="d-inline-flex align-items-center">
                            <button 
                                class="action-btn icon-view" 
                                v-c-tooltip="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'"
                                @click="$emit('view', item)"
                            >
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-edit ml-2" 
                                v-c-tooltip="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'"
                                @click="$emit('edit', item)"
                            >
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-trash ml-2" 
                                v-c-tooltip="$i18n.locale === 'en' ? 'Delete' : 'ลบ'"
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
            class="d-flex justify-content-between align-items-center bg-white border-0 rounded-bottom pagination-footer">
            <div class="text-muted text-sm" v-if="filteredItems.length > 0">
                {{ $i18n.locale === 'en' ? `Showing ${(activePage - 1) * 10 + 1} to ${Math.min(activePage * 10, filteredItems.length)} of ${filteredItems.length} submissions` : `แสดง ${(activePage - 1) * 10 + 1} ถึง ${Math.min(activePage * 10, filteredItems.length)} จากทั้งหมด ${filteredItems.length} รายการส่งงาน` }}
            </div>
            <div class="text-muted text-sm" v-else>
                {{ $i18n.locale === 'en' ? 'Showing 0 submissions' : 'แสดง 0 รายการส่งงาน' }}
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
import { mapGetters } from 'vuex'
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';

export default {
    name: 'SubmissionTable',
    mixins: [statusBadgeMixin],
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
        moment(arg) {
            return moment(arg);
        },
        getProgressColor(progress) {
            if (progress === 100) return 'success'
            if (progress > 70) return 'info'
            if (progress > 30) return 'warning'
            return 'danger'
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
                if (assign.artworks) {
                    const submittedOwners = new Set();
                    assign.artworks.forEach(aw => {
                        const ownerId = (aw.owner?._id || aw.owner || aw.artist?._id || aw.artist)?.toString();
                        if (ownerId) submittedOwners.add(ownerId);
                    });
                    totalSubmitted += submittedOwners.size;
                }
            });
            return Math.min(100, Math.round((totalSubmitted / totalPossible) * 100));
        },
        pageChange(val) {
            this.activePage = val;
        }
    },
    computed: {
        ...mapGetters({
            submissions: 'submission/submissions'
        }),
        fields() {
            return [
                { key: 'title', label: this.$i18n.locale === 'en' ? 'SUBMISSION TITLE' : 'หัวข้อการส่งงาน', _classes: 'border-top-0 border-bottom' },
                { key: 'totalStudent', label: this.$i18n.locale === 'en' ? 'TOTAL STUDENT' : 'จำนวนนักศึกษา', _classes: 'border-top-0 border-bottom' },
                { key: 'subAssignment', label: this.$i18n.locale === 'en' ? 'SUBASSIGNMENT' : 'หัวข้อย่อย', _classes: 'border-top-0 border-bottom' },
                { key: 'progress', label: this.$i18n.locale === 'en' ? 'PROGRESS' : 'ความคืบหน้า', _classes: 'border-top-0 border-bottom' },
                { key: 'dueDate', label: this.$i18n.locale === 'en' ? 'DATE & TIME' : 'วันและเวลา', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right' }
            ];
        },
        filteredItems() {
            if (!this.submissions) return [];
            const list = this.submissions.filter(item => {
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
            });
            return list.sort((a, b) => {
                const dateA = a.create ? new Date(a.create.startAt || a.createdAt || 0) : new Date(a.createdAt || 0);
                const dateB = b.create ? new Date(b.create.startAt || b.createdAt || 0) : new Date(b.createdAt || 0);
                return dateB - dateA;
            });
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



.date-text-sm {
    font-size: 0.85rem;
    font-weight: 500;
}
</style>
