<template>
    <CModal 
        title="Edit Artwork" 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="edit-artwork-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-pencil" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">Edit Artwork</h5>
                        <p class="text-muted small mb-0">Modify the details of this artwork.</p>
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
                                    :key="artist._id" 
                                    class="artist-result-item"
                                    :class="{ 'active': form.artist === artist._id }"
                                    @mousedown="selectArtist(artist)"
                                >
                                    <div class="d-flex flex-column">
                                        <span class="artist-name">{{ getArtistName(artist) }}</span>
                                        <span class="artist-id text-muted extra-small">ID: {{ artist.studentId || 'N/A' }}</span>
                                    </div>
                                    <CIcon v-if="form.artist === artist._id" name="cil-check" class="ml-auto text-blue" size="sm" />
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
                                    <span class="text-dark">{{ selectedCategoryName }}</span>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </button>
                            </template>
                            <CDropdownMenu class="w-100 border-0 shadow-lg mt-2">
                                <CDropdownItem 
                                    v-for="cat in categories" 
                                    :key="cat._id" 
                                    @click="form.category = cat._id"
                                >
                                    {{ getName('en', cat) }}
                                </CDropdownItem>
                            </CDropdownMenu>
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
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Size</label>
                        <CInput 
                            v-model="form.size" 
                            placeholder="e.g. 100 x 150 cm" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Sale Status</label>
                        <CDropdown :caret="false" class="w-100">
                            <template #toggler>
                                <button class="custom-select-btn">
                                    <span class="text-dark">{{ selectedSaleStatusName }}</span>
                                    <CIcon name="cil-filter" class="dropdown-icon" />
                                </button>
                            </template>
                            <CDropdownMenu class="w-100 border-0 shadow-lg mt-2">
                                <CDropdownItem 
                                    v-for="status in saleStatuses" 
                                    :key="status._id" 
                                    @click="form.status.sale = status._id"
                                >
                                    {{ getName('en', status) }}
                                </CDropdownItem>
                            </CDropdownMenu>
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
                                id="artwork-image-edit-upload" 
                                @change="handleFileUpload" 
                                accept="image/*"
                                class="file-input-hidden"
                            />
                            <label for="artwork-image-edit-upload" class="file-upload-label w-100">
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
                    Preview Mode
                </CButton>
                <CButton 
                    color="primary" 
                    @click="handleSave"
                    class="btn-save-artwork"
                    :disabled="!isFormValid"
                >
                    Save Changes
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'ArtworkEditModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        artwork: {
            type: Object,
            default: () => null
        }
    },
    data() {
        return {
            categories: [],
            statuses: [],
            imagePreview: null,
            artistSearchQuery: '',
            showArtistDropdown: false,
            form: {
                id: null,
                title: '',
                artist: '',
                category: '',
                technique: '',
                size: '',
                price: '',
                description: '',
                status: {
                    approval: '',
                    sale: ''
                },
                image: null
            }
        }
    },
    async created() {
        await this.fetchInitialData();
    },
    watch: {
        artwork: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.populateForm(newVal);
                }
            }
        },
        show(newVal) {
            if (newVal && this.artwork) {
                this.populateForm(this.artwork);
            }
        }
    },
    computed: {
        ...mapGetters({
            allUsers: 'user/user'
        }),
        isFormValid() {
            return this.form.title.trim() !== '' && 
                   this.form.artist !== '' && 
                   this.form.price !== '' && 
                   this.imagePreview !== null;
        },
        filteredArtists() {
            if (!this.allUsers) return [];
            const q = this.artistSearchQuery.toLowerCase();
            return this.allUsers.filter(artist => {
                const name = this.getArtistName(artist).toLowerCase();
                return name.includes(q);
            });
        },
        saleStatuses() {
            if (!this.statuses) return [];
            return this.statuses.filter(s => {
                const groupName = s.group ? this.getName('en', s.group).trim() : '';
                return groupName === 'Sale Status';
            });
        },
        approvalStatuses() {
            if (!this.statuses) return [];
            return this.statuses.filter(s => {
                const groupName = s.group ? this.getName('en', s.group).trim() : '';
                return groupName === 'Show Status';
            });
        },
        selectedCategoryName() {
            const cat = this.categories.find(c => c._id === this.form.category);
            return cat ? this.getName('en', cat) : 'Select Category';
        },
        selectedSaleStatusName() {
            const status = this.statuses.find(s => s._id === this.form.status.sale);
            return status ? this.getName('en', status) : 'Select Sale Status';
        },
        selectedApprovalStatusName() {
            const status = this.statuses.find(s => s._id === this.form.status.approval);
            return status ? this.getName('en', status) : 'Select Approval Status';
        }
    },
    methods: {
        async fetchInitialData() {
            try {
                this.$store.dispatch('user/get', {});

                const categories = await this.$store.dispatch('artwork/category', { method: 'get' });
                console.log('--- Edit Artwork Categories ---', categories);
                this.categories = categories || [];

                await this.$store.dispatch('setting/status/get');
                this.statuses = this.$store.getters['setting/status/item'] || [];
                console.log('--- Edit Artwork Statuses ---', this.statuses);
                
                if (this.artwork) {
                    console.log('--- Populating Form with Artwork ---', this.artwork);
                    this.populateForm(this.artwork);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        },
        populateForm(artwork) {
            this.form = {
                id: artwork._id,
                title: this.getName('en', artwork),
                artist: artwork.artist ? artwork.artist._id : '',
                category: artwork.category ? artwork.category._id : '',
                technique: this.getName('en', { title: artwork.technique }),
                size: this.getName('en', { title: artwork.size }),
                price: this.cleanPrice(artwork.price),
                description: this.getName('en', { title: artwork.description }),
                status: {
                    approval: artwork.status?.approval?._id || '',
                    sale: artwork.status?.sale?._id || ''
                },
                image: null
            };
            this.artistSearchQuery = artwork.artist ? this.getArtistDisplay(artwork.artist) : '';
            this.imagePreview = artwork.image || null;
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
        getArtistName(artist) {
            if (!artist) return 'N/A';
            if (Array.isArray(artist.name)) {
                const nameObj = artist.name.find(n => n.key === 'en') || artist.name[0];
                return nameObj ? nameObj.value : (artist.studentId || 'N/A');
            }
            return artist.studentId || 'N/A';
        },
        getArtistDisplay(artist) {
            if (!artist) return 'N/A';
            const name = this.getArtistName(artist);
            const id = artist.studentId ? ` (${artist.studentId})` : '';
            return name + id;
        },
        cleanPrice(price) {
            if (!price) return '';
            return String(price).replace(/[^0-9.]/g, '');
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }

            this.form.image = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        handleArtistSearch() {
            this.showArtistDropdown = true;
        },
        handleArtistBlur() {
            setTimeout(() => {
                this.showArtistDropdown = false;
            }, 200);
        },
        selectArtist(artist) {
            this.form.artist = artist._id;
            this.artistSearchQuery = this.getArtistDisplay(artist);
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
            
            const previewData = {
                ...this.form,
                artist: artist,
                image: this.imagePreview, 
                medium: this.form.technique || 'N/A',
                dimensions: '60 x 80 cm', 
            };
            
            sessionStorage.setItem('artwork_preview', JSON.stringify(previewData));
            this.$router.push({ 
                name: 'ArtworkDetail', 
                params: { id: 'preview' } 
            });
        },
        handleSave() {
            if (!this.isFormValid) return;
            
            const payload = {
                _id: this.form.id,
                title: [{ key: 'en', value: this.form.title }, { key: 'th', value: this.form.title }],
                description: [{ key: 'en', value: this.form.description }, { key: 'th', value: this.form.description }],
                artist: this.form.artist,
                category: this.form.category,
                technique: [{ key: 'en', value: this.form.technique }, { key: 'th', value: this.form.technique }],
                size: [{ key: 'en', value: this.form.size }, { key: 'th', value: this.form.size }],
                price: parseFloat(this.form.price),
                status: this.form.status,
                _image: this.form.image
            };

            this.$emit('save', payload);
            this.$emit('update:show', false);
        }
    }
}
</script>

<style scoped>
/* Reusing styles from ArtworkCreateModal.vue for consistency */
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
}

.custom-input-searchable ::v-deep .form-control {
    padding-left: 2.85rem !important;
    padding-right: 2.85rem !important;
    height: 52px !important;
    border-radius: 12px !important;
    border: 1px solid #f1f5f9 !important;
    background-color: #f8fafc !important;
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

.btn-save-artwork {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    font-size: 1rem;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

.btn-preview {
    color: #3b82f6 !important;
    font-weight: 600;
    font-size: 1rem;
}
</style>
