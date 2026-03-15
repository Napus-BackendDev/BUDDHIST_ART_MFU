<template>
    <div class="artworks-dashboard">
        <HeaderHero title="Artwork Management" description="Manage your art collection, update availability, and showcase new arrivals." icon="cil-paint" :showCreateButton="true" :showExportButton="true" createButtonText="Create Artwork" @create="onAddArtwork" @export="handleExport" />
        <ArtworkWidget @filter-status="filters.status = $event" />
        <ArtworkFilter v-model="filters" />
        <AdminTable ref="adminTable" :filters="filters" @view="handleViewArtwork" @edit="handleEditArtwork"/>
        <ArtworkCreateModal :show.sync="showCreateModal" @save="handleSaveArtwork"/>
        <ArtworkCreateChoiceModal 
            :show.sync="showChoiceModal" 
            @manual="handleChoiceManual"
            @import="handleChoiceImport"
        />
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
    methods: {
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
        handleSaveArtwork(formData) {
            console.log('New Artwork:', formData);
            // Mocking success
            this.showCreateModal = false;
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
        handleUpdateArtwork(formData) {
            console.log('Updated Artwork:', formData);
            // In a real app, this would refresh the table or show success
            this.showEditModal = false;
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
}
</style>
