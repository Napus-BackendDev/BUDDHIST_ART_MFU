<template>
    <div class="artworks-dashboard">
        <HeaderHero title="Artwork Management" description="Manage your art collection, update availability, and showcase new arrivals." icon="cil-paint" :showCreateButton="true" :showExportButton="true" createButtonText="Create Artwork" @create="onAddArtwork" @export="handleExport" />
        <ArtworkWidget v-model="filters.status" :items="artworks" />
        <ArtworkFilter v-model="filters" />
        <AdminTable ref="adminTable" :filters="filters" :items="artworks" @view="handleViewArtwork" @edit="handleEditArtwork" @delete="handleDeleteArtwork" @approve="handleApproveArtwork" @reject="handleRejectArtwork"/>
        <ArtworkCreateModal :show.sync="showCreateModal" @save="handleSaveArtwork"/>
        <ArtworkCreateChoiceModal :show.sync="showChoiceModal" @manual="handleChoiceManual" @import="handleChoiceImport" @download-template="downloadTemplate"/>
        <ArtworkViewModal :show.sync="showViewModal" :artwork="selectedArtwork" @edit="handleEditArtworkFromView"/>
        <ArtworkEditModal :show.sync="showEditModal" :artwork="selectedArtwork" @save="handleUpdateArtwork"/>
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
            categories: []
        }
    },
    created() {
        this.fetchArtworks();
        this.fetchCategories();
        this.$store.dispatch('setting/status/get');
        this.$store.dispatch('user/get', {}); // Fetch users to enable artist lookup during import
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
                        alert("The file is empty or invalid.");
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
                            }
                        };
                    }).filter(a => a.title[0].value || a.title[1].value);

                    if (mappedArtworks.length === 0) {
                        alert("No valid artwork data found. Please check column headers.");
                        return;
                    }

                    if (confirm(`Detected ${mappedArtworks.length} artworks. Proceed with bulk import?`)) {
                        this.$store.dispatch('artwork/create', mappedArtworks)
                            .then(() => {
                                this.fetchArtworks();
                                alert("Bulk import completed successfully!");
                                this.showChoiceModal = false;
                            })
                            .catch(err => {
                                console.error("Import error:", err);
                                alert("Failed to import artworks. Please check data format.");
                            });
                    }
                } catch (error) {
                    console.error("File processing error:", error);
                    alert("Error reading file.");
                }
            };
            reader.readAsArrayBuffer(file);
        },
        downloadTemplate() {
            const data = [
                ["ArtworkTitleThai", "ArtworkTitleEng", "DescriptionThai", "DescriptionEng", "TechniqueThai", "TechniqueEng", "SizeThai", "SizeEng", "Price", "ArtistID", "Category", "SaleStatus", "ShowStatuses"],
                ["ภาพวาดพุทธศิลป์ตัวอย่าง", "Sample Buddhist Art", "คำอธิบายผลงานเบื้องต้น...", "Brief artwork description...", "สีน้ำมันบนผ้าใบ", "Oil on Canvas", "60x80 ซม.", "60x80 cm", "5500", "64XXXXXX", "Painting", "Available", "Approved"]
            ];
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Artwork_Template");
            
            // Auto-width columns
            const wscols = [
                {wch: 25}, {wch: 25}, {wch: 30}, {wch: 30}, {wch: 20}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, "Artwork_Import_Template.xlsx");
        },
        async handleSaveArtwork(artworkData) {
            try {
                // 1. Create Artwork (POST /api/v1/artwork)
                console.log('--- Step 1: Creating Artwork Data ---', artworkData);
                const response = await this.$store.dispatch('artwork/create', artworkData);
                
                if (response.data && response.data.data) {
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
                }

                await this.fetchArtworks();
                this.showCreateModal = false;
                this.$store.commit('dialog/showToast', {
                    title: 'Success',
                    message: 'Artwork created successfully.',
                    variant: 'success'
                });
            } catch (error) {
                console.error('Error saving artwork:', error);
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
                await this.$store.dispatch('artwork/update', artworkData);

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
                    title: 'Success',
                    message: 'Artwork updated successfully.',
                    variant: 'success'
                });
            } catch (error) {
                console.error('Error updating artwork:', error);
            }
        },
        async handleApproveArtwork(artwork) {
            await this.updateStatus(artwork, 'Approved', 'Success', 'Artwork has been approved.');
        },
        async handleRejectArtwork(artwork) {
            await this.updateStatus(artwork, 'Rejected', 'Success', 'Artwork has been rejected.');
        },
        async updateStatus(artwork, statusName, toastTitle, toastMsg) {
            try {
                const statuses = this.$store.getters['setting/status/item'] || [];
                const targetStatus = statuses.find(s => this.getName('en', s) === statusName);
                
                if (!targetStatus) {
                    throw new Error(`Status "${statusName}" not found. Please contact administrator.`);
                }

                const updateData = {
                    _id: artwork._id,
                    status: {
                        ...artwork.status,
                        approval: targetStatus._id
                    }
                };

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
                    title: 'Error',
                    message: error.message || `Failed to update status to ${statusName}.`,
                    variant: 'danger'
                });
            }
        },
        async handleDeleteArtwork(artwork) {
            try {
                await this.$store.dispatch('artwork/delete', { _id: artwork._id });
                this.fetchArtworks();
                this.$store.commit('dialog/showToast', {
                    title: 'Deleted',
                    message: `Artwork "${this.getName('en', artwork)}" has been removed.`,
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
