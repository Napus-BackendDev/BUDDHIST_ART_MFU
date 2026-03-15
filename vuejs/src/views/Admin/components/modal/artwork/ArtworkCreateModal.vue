<template>
    <CModal 
        title="Add New Artwork" 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="create-artwork-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-paint" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">Add New Artwork</h5>
                        <p class="text-muted small mb-0">Enter the artwork details to add it to the collection.</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2">
            <!-- Basic Info Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Artwork Title</label>
                        <CInput 
                            v-model="form.title" 
                            placeholder="e.g. The Golden Serenity" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Price</label>
                        <div class="input-group-custom">
                            <span class="currency-prefix">฿</span>
                            <CInput 
                                type="number"
                                v-model="form.price" 
                                placeholder="0.00" 
                                class="custom-input-with-prefix text-right mb-0"
                            />
                        </div>
                    </div>
                </CCol>
            </CRow>

            <!-- Artist & Category Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Artist Name</label>
                        <div class="searchable-dropdown">
                            <div class="search-input-wrapper position-relative">
                                <CIcon name="cil-user" class="input-icon-left" />
                                <CInput 
                                    v-model="artistSearchQuery" 
                                    placeholder="Search or select artist..." 
                                    class="custom-input-searchable mb-0"
                                    @focus="showArtistDropdown = true"
                                    @input="handleArtistSearch"
                                    @blur="handleArtistBlur"
                                />
                                <div class="dropdown-arrow-wrapper" @click="toggleArtistDropdown">
                                    <CIcon 
                                        :name="showArtistDropdown ? 'cil-chevron-top' : 'cil-chevron-bottom'" 
                                        class="dropdown-arrow-icon" 
                                    />
                                </div>
                            </div>
                            
                            <!-- Search Results List -->
                            <div v-if="showArtistDropdown" class="artist-results-list shadow-lg">
                                <div 
                                    v-for="artist in filteredArtists" 
                                    :key="artist" 
                                    class="artist-result-item"
                                    :class="{ 'active': form.artist === artist }"
                                    @mousedown="selectArtist(artist)"
                                >
                                    {{ artist }}
                                    <CIcon v-if="form.artist === artist" name="cil-check" class="ml-auto text-blue" size="sm" />
                                </div>
                                <div v-if="filteredArtists.length === 0" class="artist-result-item text-muted">
                                    No artists found
                                </div>
                            </div>
                        </div>
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Category</label>
                        <CDropdown :caret="false" class="w-100">
                            <template #toggler>
                                <button class="custom-select-btn">
                                    <span class="text-dark">{{ form.category || 'Select Category' }}</span>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </button>
                            </template>
                            <CDropdownItem @click="form.category = 'Painting'">Painting</CDropdownItem>
                            <CDropdownItem @click="form.category = 'Sculpture'">Sculpture</CDropdownItem>
                            <CDropdownItem @click="form.category = 'Digital Art'">Digital Art</CDropdownItem>
                            <CDropdownItem @click="form.category = 'Photography'">Photography</CDropdownItem>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Technique & Status Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Technique</label>
                        <CInput 
                            v-model="form.technique" 
                            placeholder="e.g. Oil on Canvas" 
                            class="custom-input"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Status</label>
                        <CDropdown :caret="false" class="w-100">
                            <template #toggler>
                                <button class="custom-select-btn">
                                    <span class="text-dark">{{ form.status || 'Select Status' }}</span>
                                    <CIcon name="cil-filter" class="dropdown-icon" />
                                </button>
                            </template>
                            <CDropdownItem @click="form.status = 'Available'">Available</CDropdownItem>
                            <CDropdownItem @click="form.status = 'Update'">Update</CDropdownItem>
                            <CDropdownItem @click="form.status = 'Sold Out'">Sold Out</CDropdownItem>
                            <CDropdownItem @click="form.status = 'Archived'">Archived</CDropdownItem>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- File Upload Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Artwork Image</label>
                        <div class="file-upload-container" :class="{ 'has-image': imagePreview }">
                            <input 
                                type="file" 
                                id="artwork-image-upload" 
                                @change="handleFileUpload" 
                                accept="image/*"
                                class="file-input-hidden"
                            />
                            <label for="artwork-image-upload" class="file-upload-label w-100">
                                <template v-if="!imagePreview">
                                    <div class="upload-placeholder py-4 text-center">
                                        <CIcon name="cil-cloud-upload" size="xl" class="text-blue mb-2" />
                                        <div class="font-weight-bold">Click to upload image</div>
                                        <div class="text-muted small">PNG, JPG or JPEG (Max 5MB)</div>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="preview-container position-relative">
                                        <img :src="imagePreview" class="upload-preview" />
                                        <div class="preview-overlay">
                                            <div class="overlay-content">
                                                <CIcon name="cil-pencil" class="mr-2" /> Change Image
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </label>
                        </div>
                    </div>
                </CCol>
            </CRow>

            <!-- Description Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Description</label>
                        <CTextarea 
                            v-model="form.description" 
                            placeholder="Write a brief description of the artwork..." 
                            rows="4"
                            class="custom-textarea"
                        />
                    </div>
                </CCol>
            </CRow>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end align-items-center py-2">
                <CButton 
                    variant="ghost" 
                    @click="$emit('update:show', false)"
                    class="btn-cancel mr-3"
                >
                    Cancel
                </CButton>
                <CButton 
                    variant="ghost" 
                    @click="handlePreview"
                    class="btn-preview mr-3"
                >
                    Preview
                </CButton>
                <CButton 
                    color="primary" 
                    @click="handleSave"
                    class="btn-create-artwork"
                    :disabled="!isFormValid"
                >
                    Create Artwork
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'ArtworkCreateModal',
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            artists: [
                'Somsak K.',
                'Elena G.',
                'Davide B.',
                'Sarah L.',
                'Mike R.',
                'Ananda S.',
                'Malee W.',
                'Jiro K.',
                'Panya T.'
            ],
            imagePreview: null,
            artistSearchQuery: '',
            showArtistDropdown: false,
            form: {
                title: '',
                artist: '',
                category: 'Painting',
                technique: '',
                price: '',
                description: '',
                status: 'Available',
                image: null // This will store the File object or base64
            }
        }
    },
    computed: {
        isFormValid() {
            return this.form.title.trim() !== '' && 
                   (this.form.artist.trim() !== '' || this.artistSearchQuery.trim() !== '') && 
                   this.form.price !== '' && 
                   this.imagePreview !== null;
        },
        filteredArtists() {
            if (!this.artistSearchQuery) return this.artists;
            return this.artists.filter(artist => 
                artist.toLowerCase().includes(this.artistSearchQuery.toLowerCase())
            );
        }
    },
    methods: {
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Basic validation
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }

            this.form.image = file;

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        handleArtistSearch() {
            this.showArtistDropdown = true;
            this.form.artist = this.artistSearchQuery; // Sync as user types
        },
        handleArtistBlur() {
            // Slight timeout to allow the click on the result item to register
            setTimeout(() => {
                this.showArtistDropdown = false;
            }, 200);
        },
        selectArtist(artist) {
            this.form.artist = artist;
            this.artistSearchQuery = artist;
            this.showArtistDropdown = false;
        },
        toggleArtistDropdown() {
            this.showArtistDropdown = !this.showArtistDropdown;
        },
        handlePreview() {
            const artist = this.form.artist || this.artistSearchQuery;
            if (!this.form.title || !artist || !this.form.price || !this.imagePreview) {
                alert('Please fill in all required fields (Title, Artist, Price, and Image) before previewing.');
                return;
            }
            
            // Prepare preview data
            const previewData = {
                ...this.form,
                artist: artist,
                image: this.imagePreview, 
                medium: this.form.technique || 'N/A',
                dimensions: '60 x 80 cm', 
            };
            
            // Store in sessionStorage
            sessionStorage.setItem('artwork_preview', JSON.stringify(previewData));
            
            // Navigate to User Detail page
            this.$router.push({ 
                name: 'ArtworkDetail', 
                params: { id: 'preview' } 
            });
        },
        handleSave() {
            if (!this.isFormValid) return;
            
            this.$emit('save', { 
                ...this.form, 
                imagePreview: this.imagePreview // Include preview for mock UI update
            });
            this.resetForm();
        },
        resetForm() {
            this.form = {
                title: '',
                artist: '',
                category: 'Painting',
                technique: '',
                price: '',
                description: '',
                status: 'Available',
                image: null
            };
            this.imagePreview = null;
            this.artistSearchQuery = '';
            this.showArtistDropdown = false;
        },
        formatPrice(value) {
            if (!value) return '0.00';
            return parseFloat(value).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    }
}
</script>

<style scoped>
.form-group-custom {
    margin-bottom: 1.25rem;
}

.form-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 0.75rem;
    letter-spacing: 0.05em;
}

.custom-input ::v-deep .form-control,
.custom-textarea ::v-deep .form-control {
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    padding: 0.85rem 1.25rem;
    height: auto;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: #f8fafc;
    color: #1e293b;
}

.custom-input ::v-deep .form-control::placeholder,
.custom-textarea ::v-deep .form-control::placeholder {
    color: #94a3b8;
}

.custom-input ::v-deep .form-control:focus,
.custom-textarea ::v-deep .form-control:focus {
    border-color: #3b82f633;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
}

.input-group-custom {
    position: relative;
}

.currency-prefix {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 600;
    color: #1e293b;
    z-index: 10;
    font-size: 1.1rem;
    pointer-events: none;
}

.custom-input-with-prefix ::v-deep .form-control {
    padding-left: 2.85rem !important;
    height: 52px !important;
    border-radius: 12px !important;
    border: 1px solid #f1f5f9 !important;
    background-color: #f8fafc !important;
    font-size: 1rem !important;
    transition: all 0.2s ease !important;
}

.custom-input-with-prefix ::v-deep .form-control:focus {
    background-color: #ffffff !important;
    border-color: #3b82f633 !important;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05) !important;
}

.custom-select-btn {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    padding: 0.85rem 1.25rem;
    height: auto;
    font-size: 1rem;
    transition: all 0.2s ease;
    outline: none;
    cursor: pointer;
}

.custom-select-btn:hover {
    background: #ffffff;
    border-color: #e2e8f0;
}

.dropdown-icon {
    color: #94a3b8;
    width: 14px;
}

/* Searchable Dropdown Styling */
.searchable-dropdown {
    position: relative;
    width: 100%;
}

.search-input-wrapper {
    position: relative;
    width: 100%;
    display: block;
}

.input-icon-left {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    color: #94a3b8;
    width: 16px;
    pointer-events: none;
}

.dropdown-arrow-wrapper {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    cursor: pointer;
}

.dropdown-arrow-icon {
    color: #94a3b8;
    width: 14px;
    transition: transform 0.2s ease;
}

.custom-input-searchable {
    width: 100% !important;
    margin-bottom: 0 !important;
}

.custom-input-searchable ::v-deep .form-control {
    padding-left: 2.85rem !important;
    padding-right: 2.85rem !important;
    width: 100% !important;
    height: 52px !important; /* Match other inputs */
    border-radius: 12px !important;
    border: 1px solid #f1f5f9 !important;
    background-color: #f8fafc !important;
    font-size: 1rem !important;
    transition: all 0.2s ease !important;
}

.custom-input-searchable ::v-deep .form-control:focus {
    background-color: #ffffff !important;
    border-color: #3b82f633 !important;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05) !important;
}

.artist-results-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    z-index: 1000;
    border-radius: 12px;
    margin-top: 5px;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #f1f5f9;
}

.artist-result-item {
    padding: 0.75rem 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.95rem;
    color: #1e293b;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.artist-result-item:hover,
.artist-result-item.active {
    background: #f1f5f9;
    color: #3b82f6;
    font-weight: 600;
}

.artist-result-item:not(:last-child) {
    border-bottom: 1px solid #f8fafc;
}

.ml-auto {
    margin-left: auto;
}

/* File Upload Stying */
.file-upload-container {
    border: 2px dashed #e2e8f0;
    border-radius: 16px;
    background-color: #f8fafc;
    transition: all 0.2s ease;
    overflow: hidden;
}

.file-upload-container:hover {
    border-color: #3b82f6;
    background-color: #f1f5f9;
}

.file-input-hidden {
    display: none;
}

.file-upload-label {
    cursor: pointer;
    display: block;
    margin-bottom: 0;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.preview-container {
    width: 100%;
    height: 180px;
}

.upload-preview {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: #ffffff;
}

.preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(30, 41, 59, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
}

.preview-container:hover .preview-overlay {
    opacity: 1;
}

.overlay-content {
    color: white;
    font-weight: 600;
    display: flex;
    align-items: center;
}

/* Header & Modal Stying */
.icon-square {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bg-blue-light {
    background-color: #3b82f611;
}

.text-blue {
    color: #3b82f6;
}

.close-btn {
    background: transparent;
    border: none;
    padding: 8px;
    color: #94a3b8;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #64748b;
}

::v-deep .modal-content {
    border-radius: 20px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

::v-deep .modal-header {
    border-bottom: 1px solid #f1f5f9;
    padding: 1.5rem 2rem;
}

::v-deep .modal-footer {
    border-top: 1px solid #f1f5f9;
    padding: 1.5rem 2.5rem;
}

.btn-cancel {
    color: #94a3b8 !important;
    font-weight: 600;
    font-size: 1rem;
}

.btn-cancel:hover {
    color: #64748b !important;
    background: transparent !important;
}

.btn-create-artwork {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    font-size: 1rem;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

.btn-create-artwork:hover:not(:disabled) {
    background-color: #2563eb !important;
    transform: translateY(-1px);
}

.btn-preview {
    color: #3b82f6 !important;
    font-weight: 600;
    font-size: 1rem;
}

.btn-preview:hover:not(:disabled) {
    background-color: #3b82f611 !important;
}

/* Artwork Preview Card */
.artwork-preview-card {
    background: #ffffff;
    border: 1px solid #f1f5f9;
}

.preview-img-wrapper {
    height: 180px;
    background: #f8fafc;
}

.object-fit-cover {
    object-fit: cover;
}

.font-weight-600 {
    font-weight: 600;
}

.cursor-pointer {
    cursor: pointer;
}
</style>
