<template>
    <div class="artworks-dashboard">
        <HeaderHero title="Artwork Management" description="Manage your art collection, update availability, and showcase new arrivals." icon="cil-paint" :showCreateButton="true" :showExportButton="true" createButtonText="Create Artwork" @create="onAddArtwork" @export="handleExport" />
        <ArtworkWidget v-model="filters.status" :items="artworks" />
        <ArtworkFilter v-model="filters" />
        <AdminTable ref="adminTable" :filters="filters" :items="artworks" @view="handleViewArtwork" @edit="handleEditArtwork" @delete="handleDeleteArtwork" @approve="handleApproveArtwork" @reject="handleRejectArtwork"/>
        <ArtworkCreateModal :show.sync="showCreateModal" @save="handleSaveArtwork"/>
        <ArtworkCreateChoiceModal :show.sync="showChoiceModal" @manual="handleChoiceManual" @import="handleChoiceImport"/>
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
            }
        }
    },
    created() {
        this.fetchArtworks();
        this.$store.dispatch('setting/status/get');
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
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const results = XLSX.utils.sheet_to_json(worksheet);
                
                console.log('Imported Data:', results);
                
                // Show success toast or message
                if (this.$store && this.$store.commit) {
                    this.$store.commit('dialog/showToast', {
                        title: 'Import Successful',
                        message: `Successfully imported ${results.length} artworks.`,
                        variant: 'success'
                    });
                } else {
                    alert(`Imported ${results.length} artworks successfully (check console).`);
                }
            };
            reader.readAsArrayBuffer(file);
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
                // 1. Update Artwork (PUT /api/v1/artwork)
                console.log('--- Step 1: Updating Artwork Data ---', artworkData);
                await this.$store.dispatch('artwork/update', artworkData);

                // 2. Upload Image if new one present (PUT /api/v1/artwork/upload)
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
