<template>
    <div class="submissions-dashboard">
        <HeaderHero :title="$i18n.locale === 'en' ? 'Submission Management' : 'จัดการการส่งงาน'" :description="$i18n.locale === 'en' ? 'Track and manage all artwork submissions, student assignments, and digital portfolios.' : 'ติดตามและจัดการการส่งผลงานศิลปะ งานที่ได้รับมอบหมาย และพอร์ตโฟลิโอดิจิทัลทั้งหมด'" icon="cil-list" :showCreateButton="activeSection === 'submissions'" :showExportButton="activeSection === 'submissions'" :createButtonText="$i18n.locale === 'en' ? 'Add Submission' : 'เพิ่มการส่งงาน'" themeColor="red" @create="addSubmission" @export="handleExport" />
        <div class="submission-section-tabs mb-4" role="tablist">
            <button type="button" class="section-tab" :class="{ active: activeSection === 'submissions' }" @click="activeSection = 'submissions'">
                <CIcon name="cil-list" class="mr-2" />
                <span>{{ $i18n.locale === 'en' ? 'Submissions' : 'รายการ Submission' }}</span>
                <span class="tab-badge">{{ submissions.length }}</span>
            </button>
            <button type="button" class="section-tab" :class="{ active: activeSection === 'post-term' }" @click="activeSection = 'post-term'">
                <CIcon name="cil-clock" class="mr-2" />
                <span>{{ $i18n.locale === 'en' ? 'Post-term sale management' : 'จัดการการขายหลังครบ 1 ปี' }}</span>
                <span v-if="postTermDueCount > 0" class="tab-badge-alert" v-c-tooltip="$i18n.locale === 'en' ? 'Artworks requiring attention' : 'มีผลงานที่ต้องบันทึกความประสงค์'">
                    <CIcon name="cil-warning" size="sm" class="mr-1" />
                    ! {{ postTermDueCount }}
                </span>
            </button>
        </div>
        <div v-if="activeSection === 'post-term'"><PostTermSaleQueue /></div>
        <div v-else>
            <SubmissionWidget v-model="filters.quickRange" />
            <SubmissionFilter v-model="filters" />
            <SubmissionTable ref="submissionTable" :filters="filters" @view="handleView" @edit="handleEdit" @delete="handleDelete" />
        </div>
        <SubmissionCreateModal :show.sync="showCreateModal" :saving="saving" @save="handleSave" />
        <SubmissionCreateChoiceModal :show.sync="showChoiceModal" @manual="handleChoiceManual" @import="handleChoiceImport" @artwork-import="showArtworkImportModal = true" @download-template="downloadTemplate" />
        <ArtworkImportModal :show.sync="showArtworkImportModal" :submissions="submissions" @imported="handleArtworkImported" />
        <SubmissionEditModal :show.sync="showEditModal" :submissionData="selectedSubmission" :saving="saving" @update="handleUpdate" />
    </div>
</template>

<script>
import Service from '@/service/api';
import SubmissionTable from './components/table/SubmissionTable.vue'
import HeaderHero from './components/HeaderHero.vue'
import SubmissionWidget from './components/widget/SubmissionWidget.vue'
import SubmissionFilter from './components/filter/SubmissionFilter.vue'
import SubmissionCreateModal from './components/modal/submission/SubmissionCreateModal.vue'
import SubmissionCreateChoiceModal from './components/modal/submission/SubmissionCreateChoiceModal.vue'
import SubmissionEditModal from './components/modal/submission/SubmissionEditModal.vue'
import ArtworkImportModal from './components/modal/submission/ArtworkImportModal.vue'
import PostTermSaleQueue from './components/post_term/PostTermSaleQueue.vue'
import * as XLSX from 'xlsx';

export default {
    name: 'Submissions',
    components: {
        SubmissionTable,
        HeaderHero,
        SubmissionWidget,
        SubmissionFilter,
        SubmissionCreateModal,
        SubmissionCreateChoiceModal,
        SubmissionEditModal,
        ArtworkImportModal,
        PostTermSaleQueue
    },
    data() {
        return {
            showCreateModal: false,
            showChoiceModal: false,
            showEditModal: false,
            showArtworkImportModal: false,
            activeSection: 'submissions',
            selectedSubmission: null,
            categories: [],
            referenceReady: false,
            saving: false,
            postTermDueCount: 0,
            filters: {
                search: '',
                startDate: null,
                endDate: null,
                quickRange: 'All Time'
            }
        }
    },
    computed: {
        submissions() { return this.$store.getters['submission/submissions'] || [] }
    },
    async created() {
        this.fetchSubmissions();
        this.fetchPostTermAlerts();
        window.addEventListener('admin:data-changed', this.fetchPostTermAlerts);
        try {
            await Promise.all([
                this.$store.dispatch('user/get', {}),
                this.fetchCategories(),
                this.$store.dispatch('setting/status/get')
            ]);
        } catch (err) {
            console.error('Error loading reference data:', err);
        } finally {
            this.referenceReady = true;
        }
    },
    beforeDestroy() {
        window.removeEventListener('admin:data-changed', this.fetchPostTermAlerts);
    },
    methods: {
        async fetchPostTermAlerts() {
            try {
                const res = await Service.artwork('post-term-list', {});
                const items = res.data.data || [];
                const now = new Date();
                this.postTermDueCount = items.filter(item => {
                    const sale = item.postTermSale || {};
                    if (sale.needsReview) return true;
                    if (sale.decision === 'pending') return true;
                    const end = sale.initialSaleEndsAt ? new Date(sale.initialSaleEndsAt) : null;
                    if (end) {
                        const diffDays = (end - now) / (1000 * 60 * 60 * 24);
                        return diffDays <= 30;
                    }
                    return false;
                }).length;
            } catch (err) {
                // silent
            }
        },
        fetchSubmissions() {
            this.$store.dispatch('submission/get', {});
        },
        async fetchCategories() {
            try {
                const response = await this.$store.dispatch('artwork/category', { method: 'get' });
                this.categories = response || [];
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        },
        findCategoryId(categoryName) {
            if (!categoryName) return null;
            const cat = this.categories.find(c => {
                const nameEn = this.getName('en', c).toLowerCase();
                const nameTh = this.getName('th', c).toLowerCase();
                const search = String(categoryName).trim().toLowerCase();
                return nameEn === search || nameTh === search || nameEn.includes(search);
            });
            return cat ? cat._id : null;
        },
        findStatusId(statusName, defaultId) {
            const statuses = this.$store.getters['setting/status/item'] || [];
            if (statusName) {
                const search = String(statusName).toLowerCase();
                const found = statuses.find(s =>
                    this.getName('en', s).toLowerCase().includes(search) ||
                    this.getName('th', s).toLowerCase().includes(search)
                );
                if (found) return found._id;
            }
            return defaultId;
        },
        buildBilingual(thVal, enVal) {
            const arr = [];
            if (thVal) arr.push({ key: 'th', value: thVal });
            if (enVal) arr.push({ key: 'en', value: enVal });
            return arr;
        },
        addSubmission() {
            this.showChoiceModal = true;
        },
        handleChoiceManual() {
            this.showChoiceModal = false;
            this.showCreateModal = true;
        },
        handleArtworkImported(count) {
            this.fetchSubmissions();
            alert(`นำเข้าผลงานสำเร็จ ${count} รายการ`);
        },
        handleExport() {
            if (this.$refs.submissionTable) {
                this.$refs.submissionTable.exportExcel();
            }
        },
        findArtistId(studentId) {
            if (!studentId) return null;
            const users = this.$store.getters['user/user'] || [];
            const artist = users.find(u => u.studentId === String(studentId).trim());
            return artist ? artist._id : null;
        },
        handleChoiceImport(file) {
            // Gate: reference data (users/categories/statuses) must be loaded before we can
            // resolve owners/categories/statuses, otherwise the import would silently mis-map.
            const users = this.$store.getters['user/user'] || [];
            if (!this.referenceReady || users.length === 0) {
                alert(this.$i18n.locale === 'en'
                    ? 'Reference data is still loading. Please wait a moment and try again.'
                    : 'กำลังโหลดข้อมูลอ้างอิง กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
                return;
            }
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const results = XLSX.utils.sheet_to_json(worksheet);

                    if (results.length === 0) {
                        alert(this.$i18n.locale === 'en' ? "The file is empty or invalid." : "ไฟล์ว่างเปล่าหรือไม่ถูกต้อง");
                        return;
                    }

                    // Normalise any date value (JS Date, ISO string, etc.) to ISO or null
                    const toISO = (val) => {
                        if (!val) return null;
                        const d = val instanceof Date ? val : new Date(val);
                        return isNaN(d.getTime()) ? null : d.toISOString();
                    };
                    // create block that omits absent dates (schema defaults: startAt -> now,
                    // absent endAt -> "no deadline", avoiding an accidental student transition)
                    const buildCreate = (startVal, endVal) => {
                        const startAt = toISO(startVal);
                        const endAt = toISO(endVal);
                        if (!startAt && !endAt) return null;
                        const create = {};
                        if (startAt) create.startAt = startAt;
                        if (endAt) create.endAt = endAt;
                        return create;
                    };
                    const defaultStatusId = this.findStatusId('Pending', "69677d4de5f76f7a8c42dbf6");

                    // Group the flat rows back into the nested submission tree.
                    const subMap = new Map(); // submissionKey -> submission (with helper Map/Set)
                    const unmatched = new Set(); // studentIds present in the file but not found

                    results.forEach((row) => {
                        // Find values by loose key matching (ignore case and spaces)
                        const getValue = (targetKey) => {
                            const target = targetKey.toLowerCase().replace(/\s/g, '');
                            const foundKey = Object.keys(row).find(k => {
                                const key = k.toLowerCase().replace(/\s/g, '');
                                return key === target || key.includes(target) || target.includes(key);
                            });
                            return foundKey ? row[foundKey] : undefined;
                        };

                        const subTitleTh = String(getValue('SubmissionTitleThai') || '').trim();
                        const subTitleEn = String(getValue('SubmissionTitleEng') || '').trim();
                        if (!subTitleTh && !subTitleEn) return; // rows without a submission title are skipped

                        const courseLevel = String(getValue('CourseLevel') || '1').trim() || '1';
                        const academicYear = String(getValue('AcademicYear') || (new Date().getFullYear() + 543)).trim();
                        const subKey = (subTitleEn || subTitleTh) + '|' + courseLevel + '|' + academicYear;

                        let sub = subMap.get(subKey);
                        if (!sub) {
                            sub = {
                                title: this.buildBilingual(subTitleTh, subTitleEn),
                                courseLevel,
                                academicYear,
                                artist: [],
                                assignments: [],
                                _artistSet: new Set(),
                                _assignMap: new Map()
                            };
                            const create = buildCreate(getValue('SubmissionStartDate'), getValue('SubmissionEndDate'));
                            if (create) sub.create = create;
                            subMap.set(subKey, sub);
                        }

                        // Assignment ("หัวข้อย่อย") within this submission
                        const asgTitleTh = String(getValue('AssignmentTitleThai') || '').trim();
                        const asgTitleEn = String(getValue('AssignmentTitleEng') || '').trim();
                        const asgStart = toISO(getValue('AssignmentStartDate'));
                        const asgEnd = toISO(getValue('AssignmentEndDate'));
                        let assignment = null;
                        if (asgTitleTh || asgTitleEn) {
                            const asgKey = (asgTitleEn || asgTitleTh) + '|' + (asgStart || '') + '|' + (asgEnd || '');
                            assignment = sub._assignMap.get(asgKey);
                            if (!assignment) {
                                assignment = {
                                    title: this.buildBilingual(asgTitleTh, asgTitleEn),
                                    artist: [],
                                    artworks: [],
                                    _artistSet: new Set()
                                };
                                const acreate = buildCreate(getValue('AssignmentStartDate'), getValue('AssignmentEndDate'));
                                if (acreate) assignment.create = acreate;
                                sub._assignMap.set(asgKey, assignment);
                                sub.assignments.push(assignment);
                            }
                        }

                        // The person on this row. A present-but-unmatched studentId is recorded
                        // (surfaced in the confirm/alert) rather than silently dropped.
                        const rawStudentId = getValue('ArtistStudentID');
                        const hasStudentId = rawStudentId !== undefined && String(rawStudentId).trim() !== '';
                        const ownerId = this.findArtistId(rawStudentId);
                        if (hasStudentId && !ownerId) {
                            unmatched.add(String(rawStudentId).trim());
                        }
                        if (ownerId) {
                            if (!sub._artistSet.has(ownerId)) { sub._artistSet.add(ownerId); sub.artist.push(ownerId); }
                            if (assignment && !assignment._artistSet.has(ownerId)) { assignment._artistSet.add(ownerId); assignment.artist.push(ownerId); }
                        }

                        // That person's artwork within this assignment (columns may be blank).
                        // Skip when a studentId was given but couldn't be matched: pushing an ownerless
                        // artwork would misrepresent the data.
                        const awTitleTh = String(getValue('ArtworkTitleThai') || '').trim();
                        const awTitleEn = String(getValue('ArtworkTitleEng') || '').trim();
                        if (assignment && (awTitleTh || awTitleEn) && !(hasStudentId && !ownerId)) {
                            const awDescTh = String(getValue('ArtworkDescriptionThai') || '').trim();
                            const awDescEn = String(getValue('ArtworkDescriptionEng') || '').trim();
                            const technique = String(getValue('Technique') || '').trim();
                            const size = String(getValue('Size') || '').trim();
                            const price = parseFloat(String(getValue('Price') || '0').replace(/,/g, '')) || 0;
                            const artwork = {
                                title: this.buildBilingual(awTitleTh, awTitleEn),
                                description: this.buildBilingual(awDescTh, awDescEn),
                                technique: this.buildBilingual(technique, technique),
                                size: this.buildBilingual(size, size),
                                price,
                                category: this.findCategoryId(getValue('Category')),
                                status: defaultStatusId
                            };
                            if (ownerId) artwork.owner = ownerId;
                            assignment.artworks.push(artwork);
                        }
                    });

                    // Strip the grouping helpers before sending to the backend
                    const submissions = Array.from(subMap.values()).map(sub => {
                        const assignments = sub.assignments.map(a => {
                            const { _artistSet, ...asg } = a; // eslint-disable-line no-unused-vars
                            return asg;
                        });
                        const { _artistSet, _assignMap, ...s } = sub; // eslint-disable-line no-unused-vars
                        s.assignments = assignments;
                        return s;
                    });

                    if (submissions.length === 0) {
                        alert(this.$i18n.locale === 'en' ? "No valid submission data found. Please check column headers." : "ไม่พบข้อมูลการส่งงานที่ถูกต้อง กรุณาตรวจสอบหัวตาราง");
                        return;
                    }

                    const skippedMsg = unmatched.size > 0
                        ? (this.$i18n.locale === 'en'
                            ? ` ${unmatched.size} artist ID(s) could not be matched and were skipped.`
                            : ` มีรหัสนักศึกษา ${unmatched.size} รหัสที่ไม่พบและถูกข้าม`)
                        : '';

                    const confirmMsg = this.$i18n.locale === 'en'
                        ? `Detected ${submissions.length} submissions from ${results.length} rows.${skippedMsg} Proceed with bulk import?`
                        : `ตรวจพบการส่งงาน ${submissions.length} รายการ จาก ${results.length} แถว${skippedMsg} ดำเนินการนำเข้าข้อมูลทั้งหมดหรือไม่?`;

                    if (confirm(confirmMsg)) {
                        try {
                            const isEmbeddedImageWorkbook = file.name.toLowerCase().endsWith('.xlsx');
                            let importSummary = null;
                            if (isEmbeddedImageWorkbook) {
                                const formData = new FormData();
                                formData.append('workbook', file);
                                const response = await this.$store.dispatch('submission/importExcel', formData);
                                importSummary = response.data?.data?.summary || null;
                            } else {
                                await this.$store.dispatch('submission/create', submissions);
                            }
                            this.fetchSubmissions();
                            const imageMessage = importSummary
                                ? (this.$i18n.locale === 'en'
                                    ? ` Images saved: ${importSummary.imagesSaved}/${importSummary.artworkCount}. Missing image rows: ${(importSummary.missingImageRows || []).join(', ') || 'none'}.`
                                    : ` บันทึกรูปแล้ว ${importSummary.imagesSaved}/${importSummary.artworkCount} รูป แถวที่ไม่มีรูป: ${(importSummary.missingImageRows || []).join(', ') || 'ไม่มี'}`)
                                : '';
                            const successMsg = this.$i18n.locale === 'en' ? "Bulk import completed successfully!" : "นำเข้าข้อมูลเรียบร้อยแล้ว!";
                            alert(successMsg + imageMessage + skippedMsg);
                            this.showChoiceModal = false;
                        } catch (err) {
                            console.error("Import error:", err);
                            const backendMessage = err.response?.data?.message;
                            alert(backendMessage || (this.$i18n.locale === 'en' ? "Failed to import submissions. Please check data format." : "ไม่สามารถนำเข้าข้อมูลได้ กรุณาตรวจสอบรูปแบบข้อมูล"));
                        }
                    }
                } catch (error) {
                    console.error("File processing error:", error);
                    alert(this.$i18n.locale === 'en' ? "Error reading file." : "เกิดข้อผิดพลาดในการอ่านไฟล์");
                }
            };
            reader.readAsArrayBuffer(file);
        },
        downloadTemplate() {
            const data = [[
                "SubmissionTitleThai", "SubmissionTitleEng", "CourseLevel", "AcademicYear", "SubmissionStartDate", "SubmissionEndDate", "AssignmentTitleThai", "AssignmentTitleEng", "AssignmentStartDate", "AssignmentEndDate", "ArtistStudentID", "ArtworkTitleThai", "ArtworkTitleEng", "ArtworkDescriptionThai", "ArtworkDescriptionEng", "Technique", "Size", "Price", "Category", "EmbeddedImage"
            ]];
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Submission_Template");

            // Auto-width columns
            worksheet['!cols'] = [
                {wch: 28}, {wch: 28}, {wch: 12}, {wch: 14}, {wch: 18}, {wch: 18},
                {wch: 24}, {wch: 24}, {wch: 18}, {wch: 18},
                {wch: 16},
                {wch: 24}, {wch: 24}, {wch: 30}, {wch: 30}, {wch: 18}, {wch: 14}, {wch: 10}, {wch: 16}, {wch: 18}
            ];

            XLSX.writeFile(workbook, "Submission_Import_Template.xlsx");
        },
        async handleSave(data) {
            if (this.saving) return;
            this.saving = true;
            try {
                await this.$store.dispatch('submission/create', data);
                this.fetchSubmissions();
                this.showCreateModal = false;
            } catch (error) {
                console.error('Create submission error:', error);
            } finally {
                this.saving = false;
            }
        },
        handleView(item) {
            this.$router.push({ name: 'SubmissionsDetail', params: { id: item._id } });
        },
        handleEdit(item) {
            this.selectedSubmission = item;
            this.showEditModal = true;
        },
        async handleUpdate(data) {
            if (this.saving) return;
            this.saving = true;
            try {
                await this.$store.dispatch('submission/update', data);
                this.fetchSubmissions();
                this.showEditModal = false;
            } catch (error) {
                console.error('Update submission error:', error);
            } finally {
                this.saving = false;
            }
        },
        handleDelete(item) {
            const title = this.getName(this.$i18n.locale, item);
            const confirmMsg = this.$i18n.locale === 'en'
                ? `Are you sure you want to delete submission "${title}"?`
                : `คุณแน่ใจหรือว่าต้องการลบการส่งงาน "${title}"?`;
            
            if (confirm(confirmMsg)) {
                this.$store.dispatch('submission/delete', { _id: item._id })
                    .then(() => {
                        this.fetchSubmissions();
                        alert(this.$i18n.locale === 'en' ? "Submission deleted successfully." : "ลบการส่งงานเรียบร้อยแล้ว");
                    })
                    .catch(err => {
                        console.error("Delete submission error:", err);
                        alert(this.$i18n.locale === 'en' ? "Failed to delete submission." : "ไม่สามารถลบการส่งงานได้");
                    });
            }
        },
        getName(lang, item) {
            if (!item) return 'N/A';
            if (typeof item === 'string') return item;
            
            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            
            if (Array.isArray(titleField)) {
                const nameObj = titleField.find(n => n.key === lang);
                const firstVal = titleField[0] ? titleField[0].value : 'N/A';
                return nameObj ? nameObj.value : firstVal;
            }
            return 'N/A';
        }
    }
}
</script>

<style scoped>
.submission-section-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid #eef0f3;
    background: #ffffff;
    padding: 12px 16px 0;
    border-radius: 14px 14px 0 0;
    border: 1px solid #eef0f3;
    border-bottom: 1px solid #f0f1f5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}
.section-tab {
    border: 0;
    background: transparent;
    color: #64748b;
    padding: 12px 20px;
    font-weight: 700;
    font-size: 0.92rem;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s ease;
}
.section-tab:hover {
    color: #8c1515;
    background: rgba(255, 255, 255, 0.8);
}
.section-tab.active {
    color: #8c1515;
    border-bottom-color: #8c1515;
    background: #ffffff;
}
.tab-badge {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 0.72rem;
    font-weight: 800;
    border-radius: 50px;
    background: #f1f5f9;
    color: #475569;
}
.section-tab.active .tab-badge {
    background: #fff1f0;
    color: #8c1515;
}
.tab-badge-alert {
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    padding: 3px 9px;
    font-size: 0.72rem;
    font-weight: 800;
    border-radius: 50px;
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;
    box-shadow: 0 2px 6px rgba(220, 38, 38, 0.2);
    animation: pulse-soft 2s infinite;
}

@keyframes pulse-soft {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
</style>

<style scoped>
.submissions-dashboard {
    padding-bottom: 2rem;
    position: relative;
    overflow: visible !important;
}

.filter-bar {
    width: 100%;
}

/* Base custom input wrapper styles */
.search-wrapper,
.filter-btn {
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #eef0f3;
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 48px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    transition: all 0.2s;
    cursor: pointer;
    outline: none;
}

.search-wrapper:hover,
.filter-btn:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

/* Search specific */
.search-wrapper {
    height: 48px;
    width: 420px;
}

.search-icon {
    color: #7a8aa3;
    width: 18px;
    height: 18px;
    margin-right: 12px;
}

/* Styles for the CInput to strip borders */
.custom-search-cinput {
    flex-grow: 1;
}

::v-deep .custom-search-cinput .form-group {
    margin-bottom: 0 !important;
}

::v-deep .custom-search-cinput .form-control {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.95rem;
    color: #172b4d;
    box-shadow: none;
    padding: 0;
}

::v-deep .custom-search-cinput .form-control::placeholder {
    color: #a0aec0;
}

/* Custom Text and Icons */
.date-text {
    font-weight: 600;
    color: #3b4d6b;
    font-size: 0.95rem;
    margin: 0 16px 0 12px;
}

.filter-icon {
    color: #7a8aa3;
    width: 18px;
    height: 18px;
}

.dropdown-icon {
    color: #7a8aa3;
    width: 14px;
    height: 14px;
}
</style>
