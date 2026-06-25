<template>
    <div class="artworks-dashboard">
        <HeaderHero :title="$i18n.locale === 'en' ? 'Artwork Management' : 'จัดการผลงานศิลปะ'" :description="$i18n.locale === 'en' ? 'Manage your art collection, update availability, and showcase new arrivals.' : 'จัดการคอลเลกชันผลงานของคุณ อัปเดตสถานะ และแสดงผลงานใหม่'" icon="cil-paint" :showCreateButton="true" :showExportButton="true" :createButtonText="$i18n.locale === 'en' ? 'Create Artwork' : 'เพิ่มผลงานศิลปะ'" themeColor="yellow" @create="onAddArtwork" @export="handleExport" />
        <ArtworkWidget v-model="filters.status" :items="artworks" />
        <ArtworkFilter v-model="filters" />
        <AdminTable ref="adminTable" :filters="filters" :items="artworks" :loadingItems="loadingItems" @view="handleViewArtwork" @edit="handleEditArtwork" @delete="handleDeleteArtwork" @approve="handleApproveArtwork" @reject="handleRejectArtwork"/>
        <ArtworkCreateModal :show.sync="showCreateModal" @save="handleSaveArtwork"/>
        <ArtworkCreateChoiceModal :show.sync="showChoiceModal" @manual="handleChoiceManual" @import="handleChoiceImport" @download-template="downloadTemplate"/>
        <ArtworkViewModal :show.sync="showViewModal" :artwork="selectedArtwork" @edit="handleEditArtworkFromView"/>
        <ArtworkEditModal :show.sync="showEditModal" :artwork="selectedArtwork" @save="handleUpdateArtwork"/>

        <!-- Rejection Reason Modal -->
        <CModal :title="$i18n.locale === 'en' ? 'Reject Artwork' : 'ปฏิเสธผลงานศิลปะ'" :show.sync="showRejectModal" color="danger" size="lg">
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
            showRejectModal: false,
            rejectRemark: '',
            loading: false
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
            this.showChoiceModal = true;
        },
        handleChoiceManual() {
            this.showChoiceModal = false;
            this.showCreateModal = true;
        },
        handleChoiceImport(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const results = XLSX.utils.sheet_to_json(worksheet);
                    
                    if (results.length === 0) {
                        alert(this.$i18n.locale === 'en' ? "The file is empty or invalid." : "ไฟล์ว่างเปล่าหรือไม่ถูกต้อง");
                        return;
                    }

                    console.log('--- Raw Results from XLSX ---', results);
                    console.log('--- Available Categories ---', this.categories);

                    const mappedArtworks = results.map((row, index) => {
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
                        const categoryName = getValue('Category') || getValue('Catogory') || '';
                        const artistStudentId = getValue('ArtistID') || '';
                        const remarkTh = getValue('RemarkThai') || getValue('RemarkTh') || getValue('หมายเหตุไทย') || getValue('หมายเหตุ') || '';
                        const remarkEn = getValue('RemarkEng') || getValue('RemarkEn') || getValue('หมายเหตุอังกฤษ') || getValue('Remark') || '';

                        // Handle price with commas
                        const rawPrice = String(priceStr).replace(/,/g, '');
                        const parsedPrice = parseFloat(rawPrice) || 0;
                        
                        const artistId = this.findArtistId(artistStudentId);
                        const categoryId = this.findCategoryId(categoryName);

                        console.log(`Row ${index + 1} Mapping:`, {
                            title: titleTh || titleEn,
                            artist: { studentId: artistStudentId, matchedId: artistId },
                            category: { name: categoryName, matchedId: categoryId }
                        });

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

                        let approvalStatusId = "69677d4de5f76f7a8c42dbf6"; // Default: Pending
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
                    }).filter(a => a.title[0].value || a.title[1].value);

                    if (mappedArtworks.length === 0) {
                        alert(this.$i18n.locale === 'en' ? "No valid artwork data found. Please check column headers." : "ไม่พบข้อมูลผลงานที่ถูกต้อง กรุณาตรวจสอบหัวตาราง");
                        return;
                    }

                    const confirmMsg = this.$i18n.locale === 'en'
                        ? `Detected ${mappedArtworks.length} artworks. Proceed with bulk import?`
                        : `ตรวจพบผลงานจำนวน ${mappedArtworks.length} ชิ้น ดำเนินการนำเข้าข้อมูลทั้งหมดหรือไม่?`;

                    if (confirm(confirmMsg)) {
                        this.$store.dispatch('artwork/create', mappedArtworks)
                            .then(() => {
                                this.fetchArtworks();
                                alert(this.$i18n.locale === 'en' ? "Bulk import completed successfully!" : "นำเข้าข้อมูลเรียบร้อยแล้ว!");
                                this.showChoiceModal = false;
                            })
                            .catch(err => {
                                console.error("Import error:", err);
                                alert(this.$i18n.locale === 'en' ? "Failed to import artworks. Please check data format." : "ไม่สามารถนำเข้าข้อมูลได้ กรุณาตรวจสอบรูปแบบข้อมูล");
                            });
                    }
                } catch (error) {
                    console.error("File processing error:", error);
                    alert(this.$i18n.locale === 'en' ? "Error reading file." : "เกิดข้อผิดพลาดในการอ่านไฟล์");
                }
            };
            reader.readAsArrayBuffer(file);
        },
        downloadTemplate() {
            const data = [
                ["ArtworkTitleThai", "ArtworkTitleEng", "DescriptionThai", "DescriptionEng", "TechniqueThai", "TechniqueEng", "SizeThai", "SizeEng", "Price", "ArtistID", "Category", "SaleStatus", "ShowStatuses", "RemarkThai", "RemarkEng"],
                ["ภาพวาดพุทธศิลป์ตัวอย่าง", "Sample Buddhist Art", "คำอธิบายผลงานเบื้องต้น...", "Brief artwork description...", "สีน้ำมันบนผ้าใบ", "Oil on Canvas", "60x80 ชม.", "60x80 cm", "5500", "64XXXXXX", "Painting", "Available", "Approved", "หมายเหตุ...", "Remark..."]
            ];
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
                const statuses = this.$store.getters['setting/status/item'] || [];
                const targetStatus = statuses.find(s => this.getName('en', s) === statusName);
                
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
            }
        },
        async handleDeleteArtwork(artwork) {
            const confirmMsg = this.$i18n.locale === 'en'
                ? `Are you sure you want to delete artwork "${this.getName('en', artwork)}"?`
                : `คุณแน่ใจหรือว่าต้องการลบผลงาน "${this.getName('th', artwork)}"?`;
            
            if (!confirm(confirmMsg)) {
                return;
            }

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
