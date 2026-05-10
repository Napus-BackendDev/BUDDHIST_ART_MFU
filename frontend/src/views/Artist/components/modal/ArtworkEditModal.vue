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
                    <div class="icon-square bg-red-light text-red mr-3">
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
            <!-- Titles EN/TH -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Artwork Title (EN)</label>
                        <CInput 
                            v-model="form.title.en" 
                            placeholder="e.g. The Golden Serenity" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Artwork Title (TH)</label>
                        <CInput 
                            v-model="form.title.th" 
                            placeholder="ชื่อผลงานภาษาไทย" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Category Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Category</label>
                        <CDropdown :key="form.category" :caret="false" class="w-100">
                            <template #toggler>
                                <CButton class="custom-select-btn">
                                    <span class="text-dark">{{ selectedCategoryName }}</span>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </CButton>
                            </template>
                            <CDropdownMenu class="w-100 border-0 shadow-lg mt-2">
                                <CDropdownItem 
                                    v-for="cat in categories" 
                                    :key="cat._id" 
                                    @click="handleCategorySelect(cat._id)"
                                >
                                    {{ getName('en', cat) }}
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Technique & Status Row -->
            <!-- Technique Row EN/TH -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Technique (EN)</label>
                        <CInput 
                            v-model="form.technique.en" 
                            placeholder="e.g. Oil on Canvas" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Technique (TH)</label>
                        <CInput 
                            v-model="form.technique.th" 
                            placeholder="เช่น สีน้ำมันบนผ้าใบ" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Size Row EN/TH -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Size (EN)</label>
                        <CInput 
                            v-model="form.size.en" 
                            placeholder="e.g. 100 x 150 cm" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Size (TH)</label>
                        <CInput 
                            v-model="form.size.th" 
                            placeholder="เช่น 100 x 150 ซม." 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Price & Sale Status Row -->
            <CRow>
                <CCol :md="isPriceVisible ? '6' : '12'">
                    <div class="form-group-custom">
                        <label class="form-label">Sale Status</label>
                        <CDropdown :key="form.status.sale" :caret="false" class="w-100">
                            <template #toggler>
                                <CButton class="custom-select-btn">
                                    <span class="text-dark">{{ selectedSaleStatusName }}</span>
                                    <CIcon name="cil-filter" class="dropdown-icon" />
                                </CButton>
                            </template>
                            <CDropdownMenu class="w-100 border-0 shadow-lg mt-2">
                                <CDropdownItem 
                                    v-for="status in saleStatuses" 
                                    :key="status._id" 
                                    @click="handleSaleStatusSelect(status._id)"
                                >
                                    {{ getName('en', status) }}
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </div>
                </CCol>
                <CCol md="6" v-if="isPriceVisible">
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
                                        <CIcon name="cil-cloud-upload" size="xl" class="text-red mb-2" />
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
            <!-- Description Row (EN) -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Description (EN)</label>
                        <CTextarea 
                            v-model="form.description.en" 
                            placeholder="English description..." 
                            rows="4"
                            class="custom-textarea"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Description Row (TH) -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Description (TH)</label>
                        <CTextarea 
                            v-model="form.description.th" 
                            placeholder="รายละเอียดภาษาไทย..." 
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
    components: {
    },
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
            form: {
                id: null,
                title: { en: '', th: '' },
                artist: '',
                category: '',
                technique: { en: '', th: '' },
                size: { en: '', th: '' },
                price: '',
                description: { en: '', th: '' },
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
            const basicValid = this.form.title.en.trim() !== '' && 
                               this.form.title.th.trim() !== '' && 
                               this.form.artist !== '' && 
                               this.imagePreview !== null;
            
            if (this.isPriceVisible) {
                return basicValid && this.form.price !== '' && parseFloat(this.form.price) >= 0;
            }
            return basicValid;
        },
        saleStatuses() {
            if (!this.statuses) return [];
            return this.statuses.filter(s => {
                const groupName = s.group ? this.getName('en', s.group).trim() : '';
                const statusName = this.getName('en', s).trim();
                return groupName === 'Sale Status' && statusName !== 'Sold Out';
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
            const cat = this.categories.find(c => String(c._id) === String(this.form.category));
            return cat ? this.getName('en', cat) : 'Select Category';
        },
        selectedSaleStatusName() {
            const status = this.saleStatuses.find(s => String(s._id) === String(this.form.status.sale));
            return status ? this.getName('en', status) : 'Select Status';
        },
        selectedApprovalStatusName() {
            const status = this.statuses.find(s => s._id === this.form.status.approval);
            return status ? this.getName('en', status) : 'Select Approval Status';
        },
        isPriceVisible() {
            if (!this.form.status.sale) return true;
            return this.selectedSaleStatusName === 'Available';
        }
    },
    methods: {
        handleCategorySelect(id) {
            console.log('Category selected:', id);
            this.$set(this.form, 'category', id);
        },
        handleSaleStatusSelect(id) {
            console.log('Sale Status selected:', id);
            this.$set(this.form.status, 'sale', id);
        },
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
            const getVal = (field, lang) => {
                if (!field) return '';
                if (typeof field === 'string') return field;
                if (Array.isArray(field)) {
                    const obj = field.find(n => n.key === lang);
                    return obj ? obj.value : '';
                }
                return '';
            };

            this.form = {
                id: artwork._id,
                title: {
                    en: getVal(artwork.title, 'en'),
                    th: getVal(artwork.title, 'th')
                },
                artist: artwork.artist ? artwork.artist._id : '',
                category: artwork.category ? artwork.category._id : '',
                technique: {
                    en: getVal(artwork.technique, 'en'),
                    th: getVal(artwork.technique, 'th')
                },
                size: {
                    en: getVal(artwork.size, 'en'),
                    th: getVal(artwork.size, 'th')
                },
                price: this.cleanPrice(artwork.price),
                description: {
                    en: getVal(artwork.description, 'en'),
                    th: getVal(artwork.description, 'th')
                },
                status: {
                    approval: artwork.status?.approval?._id || '',
                    sale: artwork.status?.sale?._id || ''
                },
                image: null
            };
            this.imagePreview = artwork.image || null;
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
        handlePreview() {
            const artist = this.form.artist;
            if (!this.form.title.en && !this.form.title.th || !artist || !this.form.price || !this.imagePreview) {
                alert('Please fill in all required fields (Title, Price, and Image) before previewing.');
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
            
            // Find the "Pending" status to reset approval upon edit
            const pendingStatus = this.approvalStatuses.find(s => this.getName('en', s) === 'Pending');
            if (pendingStatus) {
                this.form.status.approval = pendingStatus._id;
            }

            const payload = {
                _id: this.form.id,
                title: [{ key: 'en', value: this.form.title.en }, { key: 'th', value: this.form.title.th }],
                description: [{ key: 'en', value: this.form.description.en }, { key: 'th', value: this.form.description.th }],
                artist: this.form.artist,
                category: this.form.category,
                technique: [{ key: 'en', value: this.form.technique.en }, { key: 'th', value: this.form.technique.th }],
                size: [{ key: 'en', value: this.form.size.en }, { key: 'th', value: this.form.size.th }],
                price: this.isPriceVisible ? parseFloat(this.form.price) : 0,
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
    border-color: #8c151533;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(140, 21, 21, 0.05);
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

.custom-input-with-prefix ::v-deep .form-control:focus {
    background-color: #ffffff !important;
    border-color: #8c151533 !important;
    box-shadow: 0 0 0 4px rgba(140, 21, 21, 0.05) !important;
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

/* File Upload Stying */
.file-upload-container {
    border: 2px dashed #e2e8f0;
    border-radius: 16px;
    background-color: #f8fafc;
    transition: all 0.2s ease;
    overflow: hidden;
}

.file-upload-container:hover {
    border-color: #8c1515;
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

.bg-red-light {
    background-color: #8c151511;
}

.text-red {
    color: #8c1515;
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
    background-color: #8c1515 !important;
    border-color: #8c1515 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    font-size: 1rem;
    box-shadow: 0 10px 15px -3px rgba(140, 21, 21, 0.2);
}

.btn-preview {
    color: #8c1515 !important;
    font-weight: 600;
    font-size: 1rem;
}
</style>
