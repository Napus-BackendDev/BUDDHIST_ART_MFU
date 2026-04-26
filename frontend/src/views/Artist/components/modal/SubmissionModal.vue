<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="submission-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-success-light text-success mr-3">
                        <CIcon name="cil-cloud-upload" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">ส่งผลงาน (Submit Work)</h5>
                        <p class="text-muted small mb-0">{{ assignmentTitle }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2">
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">หัวข้อผลงาน (Artwork Title)</label>
                        <CInput 
                            v-model="form.title" 
                            placeholder="ระบุชื่อผลงานของคุณ..." 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Category & Technique Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">หมวดหมู่ (Category)</label>
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
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">เทคนิค (Technique)</label>
                        <CInput 
                            v-model="form.technique" 
                            placeholder="เช่น สีน้ำมันบนผ้าใบ (Oil on Canvas)" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Size & Price Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">ขนาด (Size)</label>
                        <CInput 
                            v-model="form.size" 
                            placeholder="เช่น 60 x 80 cm" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">ราคา (Price)</label>
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

            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">รูปภาพผลงาน (Artwork Image)</label>
                        <div class="file-upload-container" :class="{ 'has-image': imagePreview }">
                            <input 
                                type="file" 
                                id="submission-image-upload" 
                                @change="handleFileUpload" 
                                accept="image/*"
                                class="file-input-hidden"
                            />
                            <label for="submission-image-upload" class="file-upload-label w-100">
                                <template v-if="!imagePreview">
                                    <div class="upload-placeholder py-5 text-center">
                                        <CIcon name="cil-cloud-upload" size="xl" class="text-success mb-2 icon-upload" />
                                        <div class="font-weight-bold">คลิกเพื่ออัปโหลดรูปภาพ</div>
                                        <div class="text-muted small">PNG, JPG หรือ JPEG (ไม่เกิน 10MB)</div>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="preview-container position-relative">
                                        <img :src="imagePreview" class="upload-preview" />
                                        <div class="preview-overlay">
                                            <div class="overlay-content">
                                                <CIcon name="cil-pencil" class="mr-2" /> เปลี่ยนรูปภาพ
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </label>
                        </div>
                    </div>
                </CCol>
            </CRow>

            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">รายละเอียดเพิ่มเติม (Description)</label>
                        <CTextarea 
                            v-model="form.description" 
                            placeholder="ระบุรายละเอียดหรือแนวคิดของผลงาน..." 
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
                    ยกเลิก
                </CButton>
                <CButton 
                    color="success" 
                    @click="handleSubmit"
                    class="btn-submit-save"
                    :disabled="!isFormValid || loading"
                >
                    <CSpinner v-if="loading" size="sm" class="mr-2" />
                    ยืนยันการส่งงาน
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'SubmissionModal',
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
            form: {
                title: '',
                description: '',
                category: '',
                technique: '',
                size: '',
                price: '',
                image: null
            }
        }
    },
    async created() {
        this.fetchInitialData();
    },
    computed: {
        isFormValid() {
            return this.form.title.trim() !== '' && 
                   this.form.category !== '' &&
                   this.form.technique.trim() !== '' &&
                   this.form.size.trim() !== '' &&
                   this.form.price !== '' &&
                   this.form.image !== null;
        },
        selectedCategoryName() {
            const cat = this.categories.find(c => c._id === this.form.category);
            return cat ? this.getName('en', cat) : 'เลือกหมวดหมู่ (Select Category)';
        }
    },
    methods: {
        async fetchInitialData() {
            try {
                // Fetch Categories for the dropdown
                const categories = await this.$store.dispatch('artwork/category', { method: 'get' });
                this.categories = categories || [];
                if (this.categories.length > 0) this.form.category = this.categories[0]._id;
            } catch (error) {
                console.error('Error fetching categories:', error);
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
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.match('image.*')) {
                alert('โปรดเลือกไฟล์รูปภาพเท่านั้น');
                return;
            }

            this.form.image = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        handleSubmit() {
            if (!this.isFormValid) return;
            this.$emit('submit', { ...this.form });
            // Don't reset here, parent handles it post-success
        },
        resetForm() {
            this.form = {
                title: '',
                description: '',
                category: this.categories.length > 0 ? this.categories[0]._id : '',
                technique: '',
                size: '',
                price: '',
                image: null
            };
            this.imagePreview = null;
        }
    },
    watch: {
        show(newVal) {
            if (!newVal) {
                // Delay reset to avoid flicker during modal close animation
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
    border-color: #48bb7833;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(72, 187, 120, 0.05);
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

/* File Upload Stying */
.file-upload-container {
    border: 2px dashed #e2e8f0;
    border-radius: 16px;
    background-color: #f8fafc;
    transition: all 0.2s ease;
    overflow: hidden;
}

.file-upload-container:hover {
    border-color: #48bb78;
    background-color: #f0fff4;
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

.icon-upload {
    color: #48bb78;
}

.preview-container {
    width: 100%;
    height: 250px;
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
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bg-success-light {
    background-color: #f0fff4;
}

.text-success {
    color: #38a169;
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

.btn-submit-save {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    border: none;
    color: white;
    padding: 0.65rem 2rem;
    border-radius: 50px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(56, 161, 105, 0.2);
    transition: all 0.2s;
}

.btn-submit-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(56, 161, 105, 0.3);
}

.btn-cancel {
    color: #64748b;
    font-weight: 600;
}

::v-deep .modal-content {
    border-radius: 20px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}
</style>
