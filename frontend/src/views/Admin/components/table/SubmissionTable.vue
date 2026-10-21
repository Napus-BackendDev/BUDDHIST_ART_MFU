<template>
    <CCard class="submission-table-card mb-4">
        <div>
            <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false" :items-per-page="itemsPerPage" :active-page="activePage" @page-change="pageChange">

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
                            <div class="text-muted date-text-sm">
                                <div>{{ formatDate(item.create.startAt) }} &ndash; {{ formatDate(item.create.endAt) }}</div>
                                <div class="small mt-1">{{ formatTime(item.create.startAt) }} &ndash; {{ formatTime(item.create.endAt) }}</div>
                            </div>
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
                                :aria-label="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'"
                                v-c-tooltip="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'"
                                @click="$emit('view', item)"
                            >
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-edit ml-2" 
                                :aria-label="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'"
                                v-c-tooltip="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'"
                                @click="$emit('edit', item)"
                            >
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-trash ml-2" 
                                :aria-label="$i18n.locale === 'en' ? 'Delete' : 'ลบ'"
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

        <TablePaginationFooter :total="filteredItems.length" :active-page.sync="activePage" :items-per-page.sync="itemsPerPage" :show-page-size="false" noun-en="submissions" noun-th="รายการส่งงาน" />
    </CCard>
</template>

<script>
import moment from 'moment'
import * as XLSX from 'xlsx';
import { mapGetters } from 'vuex'
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';
import TablePaginationFooter from './TablePaginationFooter.vue';
import { submissionProgress } from '@/utils/submissionReview';

export default {
    name: 'SubmissionTable',
    components: { TablePaginationFooter },
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
            activePage: 1,
            itemsPerPage: 10
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
            return submissionProgress(item);
        },
        pageChange(val) {
            this.activePage = val;
        },
        exportDate(date) {
            // Round-trippable (re-importable) date; blank when absent
            return date && moment(date).isValid() ? moment(date).toISOString() : '';
        },
        nameOrBlank(lang, field) {
            // Bilingual value or a truly empty string. The mixin's getName returns 'N/A' for an
            // empty translation array; export blanks so re-import reconstructs the same tree
            // (a literal 'N/A' cell would otherwise be stored as [{value:'N/A'}]).
            if (!field) return '';
            if (Array.isArray(field) && field.length === 0) return '';
            const val = this.getName(lang, field);
            return (!val || val === 'N/A') ? '' : val;
        },
        getStudentId(ref) {
            // ref may be a populated user object or a bare ObjectId
            if (!ref) return '';
            if (typeof ref === 'object' && ref.studentId) return ref.studentId;
            const id = typeof ref === 'object' ? ref._id : ref;
            const users = this.$store.getters['user/user'] || [];
            const u = users.find(x => x._id === String(id));
            return u ? (u.studentId || '') : '';
        },
        getCategoryName(cat) {
            // Only readable when the ref is populated; a bare id can't be resolved here
            if (!cat || typeof cat === 'string') return '';
            return this.nameOrBlank(this.$i18n.locale, cat);
        },
        exportExcel() {
            const wb = this.createExportWorkbook();
            XLSX.writeFile(wb, `Submissions_Export_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
        },
        createExportWorkbook() {
            const headers = [
                'SubmissionTitleThai', 'SubmissionTitleEng', 'CourseLevel', 'AcademicYear', 'SubmissionStartDate', 'SubmissionEndDate',
                'AssignmentTitleThai', 'AssignmentTitleEng', 'AssignmentStartDate', 'AssignmentEndDate',
                'ArtistStudentID',
                'ArtworkTitleThai', 'ArtworkTitleEng', 'ArtworkDescriptionThai', 'ArtworkDescriptionEng', 'Technique', 'Size', 'Price', 'Category'
            ];

            const rows = [];
            this.filteredItems.forEach(sub => {
                const subCols = [
                    this.nameOrBlank('th', sub),
                    this.nameOrBlank('en', sub),
                    sub.courseLevel || '',
                    sub.academicYear || '',
                    sub.create ? this.exportDate(sub.create.startAt) : '',
                    sub.create ? this.exportDate(sub.create.endAt) : ''
                ];

                const represented = new Set(); // studentIds already emitted for this submission
                const assignments = sub.assignments || [];

                assignments.forEach(asg => {
                    const asgCols = [
                        this.nameOrBlank('th', asg),
                        this.nameOrBlank('en', asg),
                        asg.create ? this.exportDate(asg.create.startAt) : '',
                        asg.create ? this.exportDate(asg.create.endAt) : ''
                    ];
                    const artworks = asg.artworks || [];
                    const artists = asg.artist?.length ? asg.artist : (sub.artist || []);
                    const submitted = new Set();

                    if (artworks.length > 0) {
                        artworks.forEach(aw => {
                            const sid = this.getStudentId(aw.owner);
                            if (sid) submitted.add(sid);
                            if (sid) represented.add(sid);
                            rows.push([
                                ...subCols, ...asgCols,
                                sid,
                                this.nameOrBlank('th', aw),
                                this.nameOrBlank('en', aw),
                                this.nameOrBlank('th', aw.description),
                                this.nameOrBlank('en', aw.description),
                                this.nameOrBlank(this.$i18n.locale, aw.technique),
                                this.nameOrBlank(this.$i18n.locale, aw.size),
                                aw.price || 0,
                                this.getCategoryName(aw.category)
                            ]);
                        });
                    }
                    // Keep each task enrollment even when other learners have already submitted.
                    artists.forEach(person => {
                        const sid = this.getStudentId(person);
                        if (sid) represented.add(sid);
                        if (!submitted.has(sid)) rows.push([...subCols, ...asgCols, sid, '', '', '', '', '', '', '', '']);
                    });
                    if (artworks.length === 0 && artists.length === 0) {
                        // assignment with neither people nor artworks
                        rows.push([...subCols, ...asgCols, '', '', '', '', '', '', '', '', '']);
                    }
                });

                // Enrolled-at-submission artists not represented by any assignment/artwork row.
                // Emit them so re-import preserves the enrollment (and any pending student transition).
                (sub.artist || []).forEach(person => {
                    const sid = this.getStudentId(person);
                    if (sid && !represented.has(sid)) {
                        represented.add(sid);
                        rows.push([...subCols, '', '', '', '', sid, '', '', '', '', '', '', '', '']);
                    }
                });

                // Submission with no assignment rows and no enrolled artists -> one bare row
                if (assignments.length === 0 && represented.size === 0) {
                    rows.push([...subCols, '', '', '', '', '', '', '', '', '', '', '', '', '']);
                }
            });

            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
            return wb;
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
                const search = (this.filters.search || '').toLowerCase();
                const matchesSearch = ['th', 'en'].some(lang => (this.getName(lang, item) || '').toLowerCase().includes(search));
                
                let matchesDate = true
                if (this.filters.startDate || this.filters.endDate) {
                    const startAt = (item.create && item.create.startAt) ? item.create.startAt : item.createdAt;
                    const itemDate = new Date(startAt);
                    if (this.filters.startDate && itemDate < new Date(this.filters.startDate).setHours(0, 0, 0, 0)) matchesDate = false
                    if (this.filters.endDate && itemDate > new Date(this.filters.endDate).setHours(23, 59, 59, 999)) matchesDate = false
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
