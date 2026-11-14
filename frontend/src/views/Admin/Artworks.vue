<template>
    <div class="artworks-dashboard">
        <HeaderHero :title="$i18n.locale === 'en' ? 'Artwork Management' : 'จัดการผลงานศิลปะ'" :description="$i18n.locale === 'en' ? 'Manage your art collection, update availability, and showcase new arrivals.' : 'จัดการคอลเลกชันผลงานศิลปะ อัปเดตสถานะ และแสดงผลงานใหม่'" icon="cil-paint" :showCreateButton="canEdit" :showExportButton="true" :createButtonText="$i18n.locale === 'en' ? 'Create Artwork' : 'เพิ่มผลงานศิลปะ'" themeColor="yellow" @create="onAddArtwork" @export="handleExport" />
        <div v-if="!canEdit" class="alert alert-warning d-flex align-items-center mb-3" role="note">
            <CIcon name="cil-lock-locked" class="mr-2" />
            <span>{{ $i18n.locale === 'en' ? 'View-Only access: creating, editing, approving, rejecting, or deleting artworks is disabled.' : 'สิทธิ์ดูอย่างเดียว (View Only): ไม่สามารถเพิ่ม แก้ไข อนุมัติ ปฏิเสธ หรือลบผลงานได้' }}</span>
        </div>
        <p v-if="importFeedback" class="alert alert-success" role="status">{{ importFeedback }}</p>
        <ArtworkWidget v-model="filters.status" :items="artworks" />
        <ArtworkFilter v-model="filters" :categories="categories" />
        <AdminTable ref="adminTable" :filters="filters" :items="artworks" :loadingItems="loadingItems" :loadingActions="loadingActions" :read-only="!canEdit" @view="handleViewArtwork" @edit="handleEditArtwork" @delete="handleDeleteArtwork" @approve="handleApproveArtwork" @reject="handleRejectArtwork"/>
        <ArtworkCreateModal :show.sync="showCreateModal" :saving="saving" @save="handleSaveArtwork"/>
        <ArtworkCreateChoiceModal :show.sync="showChoiceModal" :error="importError" :import-count="pendingImport.length" :importing="importing" @manual="handleChoiceManual" @import="handleChoiceImport" @confirm-import="confirmArtworkImport" @download-template="downloadTemplate"/>
        <ArtworkViewModal :show.sync="showViewModal" :artwork="selectedArtwork" @edit="handleEditArtworkFromView"/>
        <ArtworkEditModal :show.sync="showEditModal" :artwork="selectedArtwork" :saving="saving" @save="handleUpdateArtwork"/>

        <!-- Rejection Reason Modal -->
        <CModal class="admin-modal" :title="$i18n.locale === 'en' ? 'Reject Artwork' : 'ปฏิเสธผลงานศิลปะ'" :show.sync="showRejectModal" color="danger" size="lg">
            <div class="p-3">
                <p class="text-muted mb-3">
                    {{ $i18n.locale === 'en' ? 'Please provide a reason for rejecting this artwork. This message will be sent to the artist via email.' : 'กรุณาระบุเหตุผลในการปฏิเสธผลงานนี้ ข้อความนี้จะถูกส่งไปยังอีเมลของศิลปินเพื่อแจ้งเตือน' }}
                </p>
                <CTextarea 
                    v-model="rejectRemark" 
                    :placeholder="$i18n.locale === 'en' ? 'Enter reason for rejection...' : 'ระบุเหตุผล...'" 
                    rows="5"
                    class="reject-textarea"
                />
            </div>
            <template #footer>
                <CButton color="secondary" @click="showRejectModal = false" :disabled="loading">{{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}</CButton>
                <CButton color="danger" @click="confirmRejectArtwork" :disabled="!rejectRemark || loading">
                    <CIcon v-if="loading" name="cil-reload" class="mr-2 spinner-animation" />
                    {{ loading ? ($i18n.locale === 'en' ? 'Processing...' : 'กำลังดำเนินการ...') : ($i18n.locale === 'en' ? 'Confirm Reject' : 'ยืนยันการปฏิเสธ') }}
                </CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import AdminTable from './components/table/AdminTable.vue';
import HeaderHero from './components/HeaderHero.vue';
import ArtworkWidget from './components/widget/ArtworkWidget.vue';
import ArtworkFilter from './components/filter/ArtworkFilter.vue';
import ArtworkCreateModal from './components/modal/artwork/ArtworkCreateModal.vue';
import ArtworkViewModal from './components/modal/artwork/ArtworkViewModal.vue';
import ArtworkEditModal from './components/modal/artwork/ArtworkEditModal.vue';
import ArtworkCreateChoiceModal from './components/modal/artwork/ArtworkCreateChoiceModal.vue';
import * as XLSX from 'xlsx';
import { parseArtworkRows } from '@/utils/submissionArtworkImport';
import { hasTabPermission } from '@/utils/permissions';

export default {
    name: 'Artworks',
    components: {
        AdminTable,
        HeaderHero,
        ArtworkWidget,
        ArtworkFilter,
        ArtworkCreateModal,
        ArtworkViewModal,
        ArtworkEditModal,
        ArtworkCreateChoiceModal
    },
    data() {
        return {
            showCreateModal: false,
            showChoiceModal: false,
            pendingImport: [],
            importError: '',
            importFeedback: '',
            importing: false,
            showViewModal: false,
            showEditModal: false,
            selectedArtwork: null,
            filters: {
                search: '',
                category: 'All Categories',
                status: 'All Status',
                startDate: null,
                endDate: null,
                quickRange: 'All Time'
            },
            categories: [],
            loadingItems: [],
            loadingActions: {},
            showRejectModal: false,
            rejectRemark: '',
            loading: false,
            saving: false
        }
    },
    created() {
        this.fetchArtworks();
        this.fetchCategories();
        this.$store.dispatch('setting/status/get');
        this.$store.dispatch('user/get', {}); // Fetch users to enable artist lookup during import
        if (this.$route.query.search) {
            this.filters.search = this.$route.query.search;
        }
    },
    computed: {
        canEdit() {
            return hasTabPermission(this, 'artworks', 'edit');
        },
        artworks() {
            return this.$store.getters['artwork/artworks'] || [];
        }
    },
    methods: {
        async fetchArtworks() {
            try {
                await this.$store.dispatch('artwork/get');
            } catch (error) {
                console.error('Error fetching artworks:', error);
            }
        },
        async fetchCategories() {
            try {
                const response = await this.$store.dispatch('artwork/category', { method: 'get' });
                this.categories = response || [];
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        },
        onAddArtwork() {
            this.pendingImport = [];
            this.importError = '';
            this.importFeedback = '';
            this.showChoiceModal = true;
        },
        handleChoiceManual() {
            this.showChoiceModal = false;
            this.showCreateModal = true;
        },
        handleChoiceImport(file) {
            if (this.importing) return;
            this.pendingImport = [];
            this.importError = '';
            const reader = new FileReader();
            reader.onerror = () => { this.importError = this.$i18n.locale === 'en' ? 'Error reading file.' : 'เกิดข้อผิดพลาดในการอ่านไฟล์'; };
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const results = XLSX.utils.sheet_to_json(worksheet);
                    
                    if (results.length === 0) {
                        this.importError = this.$i18n.locale === 'en' ? "The file is empty or invalid." : "ไฟล์ว่างเปล่าหรือไม่ถูกต้อง";
                        return;
                    }

                    const parsedRows = this.prepareImportRows(results);
                    const mappedArtworks = results.map((row, index) => {
                        const rowNumber = row.__rowNum__ == null ? index + 2 : row.__rowNum__ + 1;
                        const parsed = parsedRows.find(item => item.rowNumber === rowNumber);
                        if (!parsed) return null;
                        // Find values by loose key matching (ignore case and spaces)
                        const getValue = (targetKey) => {
                            const target = targetKey.toLowerCase().replace(/\s/g, '');
                            const foundKey = Object.keys(row).find(k => {
                                const key = k.toLowerCase().replace(/\s/g, '');
                                return key === target || key.includes(target) || target.includes(key);
                            });
                            return foundKey ? row[foundKey] : undefined;
                        };

                        const titleTh = getValue('ArtworkTitleThai') || '';
                        const titleEn = getValue('ArtworkTitleEng') || '';
                        const descTh = getValue('DescriptionThai') || '';
                        const descEn = getValue('DescriptionEng') || '';
                        const techTh = getValue('TechniqueThai') || '';
                        const techEn = getValue('TechniqueEng') || '';
                        const sizeTh = getValue('SizeThai') || '';
                        const sizeEn = getValue('SizeEng') || '';
                        const priceStr = getValue('Price') || '0';
                        const remarkTh = parsed.remarkTh || getValue('RemarkThai') || getValue('RemarkTh') || getValue('หมายเหตุไทย') || getValue('หมายเหตุ') || '';
                        const remarkEn = getValue('RemarkEng') || getValue('RemarkEn') || getValue('หมายเหตุอังกฤษ') || getValue('Remark') || '';

                        // Handle price with commas
                        const rawPrice = String(priceStr).replace(/,/g, '');
                        const parsedPrice = parseFloat(rawPrice) || 0;
                        
                        const artistId = parsed.artistId;
                        const categoryId = parsed.categoryId || '';

                        const saleStatusName = getValue('SaleStatus') || '';
                        const approvalStatusName = getValue('ShowStatuses') || '';

                        // Resolve Status IDs
                        const allStatuses = this.$store.getters['setting/status/item'] || [];
                        
                        let saleStatusId = "69678075e5f76f7a8c42dc12"; // Default: Not for sale
                        if (saleStatusName) {
                            const foundSale = allStatuses.find(s => 
                                this.getName('en', s).toLowerCase().includes(saleStatusName.toLowerCase()) ||
                                this.getName('th', s).toLowerCase().includes(saleStatusName.toLowerCase())
                            );
                            if (foundSale) saleStatusId = foundSale._id;
                        }

                        let approvalStatusId = allStatuses.find(s => s.code === 'PENDING')?._id || "69677d4de5f76f7a8c42dbf6"; // Default: Pending
                        if (approvalStatusName) {
                            const foundApproval = allStatuses.find(s => 
                                this.getName('en', s).toLowerCase().includes(approvalStatusName.toLowerCase()) ||
                                this.getName('th', s).toLowerCase().includes(approvalStatusName.toLowerCase())
                            );
                            if (foundApproval) approvalStatusId = foundApproval._id;
                        }

                        return {
                            title: [
                                { key: 'th', value: titleTh },
                                { key: 'en', value: titleEn }
                            ],
                            description: [
                                { key: 'th', value: descTh },
                                { key: 'en', value: descEn }
                            ],
                            technique: [
                                { key: 'th', value: techTh },
                                { key: 'en', value: techEn }
                            ],
                            size: [
                                { key: 'th', value: sizeTh },
                                { key: 'en', value: sizeEn }
                            ],
                            price: parsedPrice,
                            artist: artistId,
                            category: categoryId,
                            status: {
                                approval: approvalStatusId,
                                sale: saleStatusId
                            },
                            remark: [
                                { key: 'th', value: remarkTh },
                                { key: 'en', value: remarkEn }
                            ]
                        };
                    }).filter(a => a && (a.title[0].value || a.title[1].value));

                    if (mappedArtworks.length === 0) {
                        this.importError = this.$i18n.locale === 'en' ? "No valid artwork data found. Please check column headers." : "ไม่พบข้อมูลผลงานที่ถูกต้อง กรุณาตรวจสอบหัวตาราง";
                        return;
                    }

                    this.pendingImport = mappedArtworks;
                } catch (error) {
                    this.importError = error.importValidation ? error.message : (this.$i18n.locale === 'en' ? "Error reading file." : "เกิดข้อผิดพลาดในการอ่านไฟล์");
                }
            };
            reader.readAsArrayBuffer(file);
        },
        async confirmArtworkImport() {
            if (this.importing || !this.pendingImport.length) return;
            this.importing = true;
            this.importError = '';
            try {
                await this.$store.dispatch('artwork/create', this.pendingImport);
                this.pendingImport = [];
                this.showChoiceModal = false;
                this.importFeedback = this.$i18n.locale === 'en' ? 'Bulk import completed successfully!' : 'นำเข้าข้อมูลเรียบร้อยแล้ว!';
                await this.fetchArtworks();
            } catch (error) {
                this.importError = this.$i18n.locale === 'en' ? 'Failed to import artworks. Please try again.' : 'ไม่สามารถนำเข้าข้อมูลได้ กรุณาลองใหม่';
            } finally {
                this.importing = false;
            }
        },
        prepareImportRows(results) {
            try {
                const rows = parseArtworkRows(results, this.$store.getters['user/user'] || [], this.categories);
                const messages = {
                    'ไม่พบรหัสผู้เรียนที่ตรงกันเพียงคนเดียว': 'No unique matching learner ID',
                    'ไม่มีชื่อผลงาน': 'Artwork title is missing',
                    'ราคาไม่ถูกต้อง': 'Invalid price',
                    'ไม่พบประเภทผลงานที่ตรงกันเพียงประเภทเดียว': 'No unique matching category',
                    'ประทับเวลาไม่ถูกต้อง': 'Invalid timestamp'
                };
                const english = this.$i18n?.locale === 'en';
                const issues = rows.filter(row => row.issues.length).map(row => `${english ? 'Row' : 'แถวที่'} ${row.rowNumber}: ${row.issues.map(issue => english ? messages[issue] || issue : issue).join(', ')}`);
                if (issues.length) throw new Error(issues.join('\n'));
                return rows;
            } catch (error) {
                error.importValidation = true;
                throw error;
            }
        },
        downloadTemplate() {
            const data = [[
                "ArtworkTitleThai", "ArtworkTitleEng", "DescriptionThai", "DescriptionEng", "TechniqueThai", "TechniqueEng", "SizeThai", "SizeEng", "Price", "ArtistID", "Category", "SaleStatus", "ShowStatuses", "RemarkThai", "RemarkEng"
            ]];
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Artwork_Template");
            
            // Auto-width columns
            const wscols = [
                {wch: 25}, {wch: 25}, {wch: 30}, {wch: 30}, {wch: 20}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 20}, {wch: 20}
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, "Artwork_Import_Template.xlsx");
        },
        async handleSaveArtwork(artworkData) {
            if (this.saving) return;
            this.saving = true;
            try {
                // 1. Create Artwork (POST /api/v1/artwork)
                console.log('--- Step 1: Creating Artwork Data ---', artworkData);
                const response = await this.$store.dispatch('artwork/create', artworkData);
                
                if (response && response.data && (response.data.code === 20000 || response.data.status === 20000 || response.status === 200)) {
                    const createdArtwork = response.data.data;
                    console.log('--- Artwork Created Successfully ---', createdArtwork._id);
                    
                    // 2. Upload Image (PUT /api/v1/artwork/upload)
                    if (artworkData._image && createdArtwork._id) {
                        console.log('--- Step 2: Uploading Image for ID ---', createdArtwork._id);
                        const uploadFormData = new FormData();
                        uploadFormData.append('_id', createdArtwork._id);
                        uploadFormData.append('image', artworkData._image);
                        await this.$store.dispatch('artwork/upload', uploadFormData);
                        console.log('--- Image Uploaded Successfully ---');
                    }

                    await this.fetchArtworks();
                    this.showCreateModal = false;
                    this.$store.commit('dialog/showToast', {
                        title: this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                        message: this.$i18n.locale === 'en' ? 'Artwork created successfully.' : 'สร้างผลงานศิลปะเรียบร้อยแล้ว',
                        variant: 'success'
                    });
                } else {
                    throw new Error('Backend returned an error status.');
                }
            } catch (error) {
                console.error('Error saving artwork:', error);
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Error' : 'ข้อผิดพลาด',
                    message: this.$i18n.locale === 'en' ? 'Failed to create artwork. Please try again.' : 'ไม่สามารถสร้างผลงานศิลปะได้ กรุณาลองใหม่อีกครั้ง',
                    variant: 'danger'
                });
            } finally {
                this.saving = false;
            }
        },
        handleViewArtwork(artwork) {
            this.selectedArtwork = artwork;
            this.showViewModal = true;
        },
        handleEditArtwork(artwork) {
            this.selectedArtwork = artwork;
            this.showEditModal = true;
        },
        handleEditArtworkFromView(artwork) {
            this.showViewModal = false;
            this.handleEditArtwork(artwork);
        },
        async handleUpdateArtwork(artworkData) {
            if (this.saving) return;
            this.saving = true;
            try {
                console.log('--- Step 1: Updating Artwork Data ---', artworkData);
                const response = await this.$store.dispatch('artwork/update', artworkData);

                if (response && response.data && (response.data.code === 20000 || response.data.status === 20000 || response.status === 200)) {
                    if (artworkData._image) {
                        console.log('--- Step 2: Uploading New Image for ID ---', artworkData._id);
                        const uploadFormData = new FormData();
                        uploadFormData.append('_id', artworkData._id);
                        uploadFormData.append('image', artworkData._image);
                        await this.$store.dispatch('artwork/upload', uploadFormData);
                        console.log('--- Image Updated Successfully ---');
                    }

                    await this.fetchArtworks();
                    this.showEditModal = false;
                    this.$store.commit('dialog/showToast', {
                        title: this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                        message: this.$i18n.locale === 'en' ? 'Artwork updated successfully.' : 'อัปเดตผลงานศิลปะเรียบร้อยแล้ว',
                        variant: 'success'
                    });
                } else {
                    throw new Error('Backend returned an error status.');
                }
            } catch (error) {
                console.error('Error updating artwork:', error);
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Error' : 'ข้อผิดพลาด',
                    message: this.$i18n.locale === 'en' ? 'Failed to update artwork. Please try again.' : 'ไม่สามารถอัปเดตผลงานศิลปะได้ กรุณาลองใหม่อีกครั้ง',
                    variant: 'danger'
                });
            } finally {
                this.saving = false;
            }
        },
        async handleApproveArtwork(artwork) {
            await this.updateStatus(
                artwork,
                'Approved',
                this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                this.$i18n.locale === 'en' ? 'Artwork has been approved.' : 'อนุมัติผลงานศิลปะเรียบร้อยแล้ว'
            );
        },
        async handleRejectArtwork(artwork) {
            this.selectedArtwork = artwork;
            this.rejectRemark = '';
            this.showRejectModal = true;
        },
        async confirmRejectArtwork() {
            if (!this.rejectRemark) return;
            this.loading = true;
            try {
                await this.updateStatus(
                    this.selectedArtwork,
                    'Rejected',
                    this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                    this.$i18n.locale === 'en' ? 'Artwork has been rejected.' : 'ปฏิเสธผลงานศิลปะเรียบร้อยแล้ว',
                    this.rejectRemark
                );
                this.showRejectModal = false;
            } catch (err) {
                console.error("Failed to reject artwork:", err);
            } finally {
                this.loading = false;
            }
        },
        async updateStatus(artwork, statusName, toastTitle, toastMsg, rejectionReason = null) {
            try {
                this.loadingItems.push(artwork._id);
                this.$set(this.loadingActions, artwork._id, statusName);
                const statuses = this.$store.getters['setting/status/item'] || [];
                const statusCode = { Approved: 'APPROVED', Rejected: 'REJECTED', Pending: 'PENDING' }[statusName];
                const targetStatus = statuses.find(s => statusCode && s.code === statusCode) || statuses.find(s => this.getName('en', s) === statusName);
                
                if (!targetStatus) {
                    throw new Error(this.$i18n.locale === 'en' ? `Status "${statusName}" not found. Please contact administrator.` : `ไม่พบสถานะ "${statusName}" กรุณาติดต่อผู้ดูแลระบบ`);
                }

                const updateData = {
                    _id: artwork._id,
                    status: {
                        ...artwork.status,
                        approval: targetStatus._id
                    }
                };

                if (rejectionReason) {
                    updateData.rejectionReason = rejectionReason;
                }

                await this.$store.dispatch('artwork/update', updateData);
                await this.fetchArtworks();

                this.$store.commit('dialog/showToast', {
                    title: toastTitle,
                    message: toastMsg,
                    variant: 'success'
                });
            } catch (error) {
                console.error(`Error updating to ${statusName}:`, error);
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Error' : 'ข้อผิดพลาด',
                    message: error.message || (this.$i18n.locale === 'en' ? `Failed to update status to ${statusName}.` : `ไม่สามารถอัปเดตสถานะเป็น ${statusName} ได้`),
                    variant: 'danger'
                });
            } finally {
                this.loadingItems = this.loadingItems.filter(id => id !== artwork._id);
                this.$delete(this.loadingActions, artwork._id);
            }
        },
        // AdminTable already asks for confirmation before emitting `delete`.
        async handleDeleteArtwork(artwork) {
            try {
                await this.$store.dispatch('artwork/delete', { _id: artwork._id });
                this.fetchArtworks();
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Deleted' : 'ลบแล้ว',
                    message: this.$i18n.locale === 'en' 
                        ? `Artwork "${this.getName('en', artwork)}" has been removed.`
                        : `ผลงาน "${this.getName('th', artwork)}" ถูกลบออกแล้ว`,
                    variant: 'info'
                });
            } catch (error) {
                console.error('Error deleting artwork:', error);
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
        },
        handleExport() {
            if (this.$refs.adminTable) {
                this.$refs.adminTable.exportExcel();
            }
        },
        findArtistId(studentId) {
            if (!studentId) return null;
            const users = this.$store.getters['user/user'] || [];
            const artist = users.find(u => u.studentId === String(studentId));
            return artist ? artist._id : null;
        },
        findCategoryId(categoryName) {
            if (!categoryName) return "69b917247aa08919285fb7ee"; // Default ID
            const cat = this.categories.find(c => {
                const nameEn = this.getName('en', c).toLowerCase();
                const nameTh = this.getName('th', c).toLowerCase();
                const search = String(categoryName).trim().toLowerCase();
                return nameEn === search || nameTh === search || nameEn.includes(search);
            });
            return cat ? cat._id : "69b917247aa08919285fb7ee";
        }
    }
}
</script>

<style scoped>
.artworks-dashboard {
    padding-bottom: 2rem;
    position: relative;
    overflow: visible !important;
}
</style>
