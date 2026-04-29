<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="submission-modal-premium"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-success-light text-success mr-3">
                        <CIcon name="cil-cloud-upload" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">Submit Artwork Work</h5>
                        <p class="text-muted small mb-0">{{ assignmentTitle }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2">
            <!-- Row 1: Titles -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Artwork Title (EN)</label>
                        <CInput 
                            v-model="form.title.en" 
                            placeholder="e.g. The Morning Light" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">ชื่อผลงาน (TH)</label>
                        <CInput 
                            v-model="form.title.th" 
                            placeholder="ระบุชื่อผลงานภาษาไทย" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Row 2: Category -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Category</label>
                        <CDropdown :caret="false" class="w-100">
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

            <!-- Row 3: Technique -->
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
                        <label class="form-label">เทคนิค (TH)</label>
                        <CInput 
                            v-model="form.technique.th" 
                            placeholder="ระบุเทคนิคภาษาไทย" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Row 4: Size -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Size (EN)</label>
                        <CInput 
                            v-model="form.size.en" 
                            placeholder="e.g. 60 x 80 cm" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">ขนาด (TH)</label>
                        <CInput 
                            v-model="form.size.th" 
                            placeholder="ระบุขนาดภาษาไทย" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Row 5: Sale Status & Price -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Sale Status</label>
                        <CInput 
                            value="Available" 
                            disabled 
                            class="custom-input mb-0 bg-light-premium"
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

            <!-- Row 6: Artwork Image -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Artwork Image</label>
                        <div class="file-upload-container-premium" :class="{ 'has-image': imagePreview }">
                            <input 
                                type="file" 
                                id="submission-image-upload-premium" 
                                @change="handleFileUpload" 
                                accept="image/*"
                                class="file-input-hidden"
                            />
                            <label for="submission-image-upload-premium" class="file-upload-label w-100">
                                <template v-if="!imagePreview">
                                    <div class="upload-placeholder py-5 text-center">
                                        <div class="icon-circle bg-success-light text-success mb-3">
                                            <CIcon name="cil-cloud-upload" size="xl" />
                                        </div>
                                        <div class="font-weight-bold h6 text-dark-premium">Click to upload artwork</div>
                                        <div class="text-muted small">PNG, JPG or JPEG (Max 10MB)</div>
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
                                        <button 
                                            type="button" 
                                            class="btn-remove-image-premium shadow-sm" 
                                            @click.stop.prevent="removeImage"
                                            title="Remove image"
                                        >
                                            <CIcon name="cil-trash" size="sm" />
                                        </button>
                                    </div>
                                </template>
                            </label>
                        </div>
                    </div>
                </CCol>
            </CRow>

            <!-- Row 7: Description (EN) -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Description (EN)</label>
                        <CTextarea 
                            v-model="form.description.en" 
                            placeholder="Enter artwork concept or details in English..." 
                            rows="4"
                            class="custom-textarea"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Row 8: Description (TH) -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">รายละเอียดเพิ่มเติม (TH)</label>
                        <CTextarea 
                            v-model="form.description.th" 
                            placeholder="ระบุแนวคิดหรือรายละเอียดผลงานภาษาไทย..." 
                            rows="4"
                            class="custom-textarea"
                        />
                    </div>
                </CCol>
            </CRow>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end align-items-center py-2 px-3">
                <CButton 
                    variant="ghost" 
                    @click="$emit('update:show', false)"
                    class="btn-cancel-premium mr-3"
                >
                    Cancel
                </CButton>
                <CButton 
                    color="success" 
                    @click="handleSubmit"
                    class="btn-submit-premium-modal"
                    :disabled="!isFormValid || loading"
                >
                    <CSpinner v-if="loading" size="sm" class="mr-2" />
                    <CIcon v-else name="cil-check" class="mr-2" />
                    Submit Artwork
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'SubmissionModal',
    components: {
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        assignmentTitle: {
            type: String,
            default: ''
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            imagePreview: null,
            categories: [],
            statuses: [],
            form: {
                title: { en: '', th: '' },
                description: { en: '', th: '' },
                category: '',
                technique: { en: '', th: '' },
                size: { en: '', th: '' },
                price: '',
                status: {
                    approval: '',
                    sale: ''
                },
                image: null
            }
        }
    },
    async created() {
        this.fetchInitialData();
    },
    computed: {
        ...mapGetters({
            userId: 'auth/userId'
        }),
        isFormValid() {
            return (this.form.title.en.trim() !== '' || this.form.title.th.trim() !== '') && 
                   this.form.category !== '' &&
                   this.imagePreview !== null;
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
        }
    },
    methods: {
        handleCategorySelect(id) {
            this.$set(this.form, 'category', id);
        },
        async fetchInitialData() {
            try {
                // Fetch Categories
                const categories = await this.$store.dispatch('artwork/category', { method: 'get' });
                this.categories = categories || [];
                if (this.categories.length > 0) this.form.category = this.categories[0]._id;

                // Fetch Statuses
                await this.$store.dispatch('setting/status/get');
                this.statuses = this.$store.getters['setting/status/item'] || [];
                
                // Set default statuses
                const defaultSale = this.saleStatuses.find(s => this.getName('en', s) === 'Available');
                if (defaultSale) this.form.status.sale = defaultSale._id;
                
                const defaultApproval = this.approvalStatuses.find(s => this.getName('en', s) === 'Pending');
                if (defaultApproval) this.form.status.approval = defaultApproval._id;

            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        },
        getName(lang, item) {
            if (!item) return 'N/A';
            if (typeof item === 'string') return item;
            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            if (Array.isArray(titleField)) {
                const nameObj = titleField.find(n => n.key === lang);
                return nameObj ? nameObj.value : (titleField[0] ? titleField[0].value : 'N/A');
            }
            return 'N/A';
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.match('image.*')) {
                alert('Please select an image file only');
                return;
            }

            this.form.image = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        removeImage() {
            this.form.image = null;
            this.imagePreview = null;
            const input = document.getElementById('submission-image-upload-premium');
            if (input) input.value = '';
        },
        handleSubmit() {
            if (!this.isFormValid) return;
            
            // Reformat for parent and backend consistency
            const finalData = {
                title: [
                    { key: 'en', value: this.form.title.en },
                    { key: 'th', value: this.form.title.th }
                ],
                description: [
                    { key: 'en', value: this.form.description.en },
                    { key: 'th', value: this.form.description.th }
                ],
                category: this.form.category,
                technique: [
                    { key: 'en', value: this.form.technique.en },
                    { key: 'th', value: this.form.technique.th }
                ],
                size: [
                    { key: 'en', value: this.form.size.en },
                    { key: 'th', value: this.form.size.th }
                ],
                price: this.form.price ? parseFloat(this.form.price) : 0,
                status: {
                    approval: this.form.status.approval,
                    sale: this.form.status.sale
                },
                _image: this.form.image
            };
            
            this.$emit('submit', finalData);
        },
        resetForm() {
            const defaultSale = this.saleStatuses.find(s => this.getName('en', s) === 'Available');
            const defaultApproval = this.approvalStatuses.find(s => this.getName('en', s) === 'Pending');

            this.form = {
                title: { en: '', th: '' },
                description: { en: '', th: '' },
                category: this.categories.length > 0 ? this.categories[0]._id : '',
                technique: { en: '', th: '' },
                size: { en: '', th: '' },
                price: '',
                status: {
                    approval: defaultApproval ? defaultApproval._id : '',
                    sale: defaultSale ? defaultSale._id : ''
                },
                image: null
            };
            this.imagePreview = null;
        }
    },
    watch: {
        show(newVal) {
            if (!newVal) {
                setTimeout(this.resetForm, 300);
            }
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

.custom-input ::v-deep .form-control:focus,
.custom-textarea ::v-deep .form-control:focus {
    border-color: #10b98133;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.05);
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

/* File Upload Premium Styling */
.file-upload-container-premium {
    border: 2px dashed #e2e8f0;
    border-radius: 16px;
    background-color: #f8fafc;
    transition: all 0.2s ease;
    overflow: hidden;
}

.file-upload-container-premium:hover {
    border-color: #10b981;
    background-color: #ecfdf5;
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

.icon-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bg-success-light { background-color: #ecfdf5; }
.text-success { color: #10b981; }

.preview-container {
    width: 100%;
    height: 280px;
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

.btn-remove-image-premium {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #ef4444;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.2s;
    cursor: pointer;
}

.btn-remove-image-premium:hover {
    background-color: #dc2626;
    transform: scale(1.1);
}

/* Header & Modal Styling */
.icon-square {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn {
    background: transparent;
    border: none;
    padding: 8px;
    color: #94a3b8;
    transition: color 0.2s;
}

.close-btn:hover { color: #64748b; }

.btn-submit-premium-modal {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 50px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    transition: all 0.2s;
}

.btn-submit-premium-modal:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
}

.btn-cancel-premium {
    color: #64748b;
    font-weight: 600;
}

.bg-light-premium {
    background-color: #f1f5f9 !important;
    opacity: 0.8;
}

.text-dark-premium { color: #1e293b; }

::v-deep .modal-content {
    border-radius: 24px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.shadow-premium-sm {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
}
</style>
