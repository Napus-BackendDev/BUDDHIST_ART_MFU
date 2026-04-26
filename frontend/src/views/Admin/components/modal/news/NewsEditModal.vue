<template>
    <CModal 
        title="Edit News" 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="edit-news-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-pencil" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">Edit News Article</h5>
                        <p class="text-muted small mb-0">Update the details of your news announcement.</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2" v-if="form">
            <!-- Title Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">News Title</label>
                        <CInput 
                            v-model="form.title" 
                            placeholder="e.g. New Exhibition Opening Soon" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Content Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <CTextarea 
                            label="Content" 
                            placeholder="Enter news content..." 
                            v-model="form.description" 
                            rows="5"
                            class="custom-textarea"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Category Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Category</label>
                        <CSelect 
                            :options="categoryOptions" 
                            :value.sync="form.category"
                            class="custom-select-field mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- File Upload Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">News Images (Multiple)</label>
                        <div class="multiple-upload-container">
                            <input 
                                type="file" 
                                id="news-images-edit" 
                                @change="handleMultipleFileUpload" 
                                accept="image/*"
                                multiple
                                class="file-input-hidden"
                            />
                            <label for="news-images-edit" class="upload-trigger-card mb-3">
                                <div class="upload-placeholder py-4 text-center">
                                    <CIcon name="cil-cloud-upload" size="xl" class="text-blue mb-2" />
                                    <div class="font-weight-bold">Click to add more images</div>
                                    <div class="text-muted small">PNG, JPG or JPEG</div>
                                </div>
                            </label>

                            <div class="previews-grid">
                                <!-- Existing Images from Backend -->
                                <div v-for="(img, index) in existingImages" :key="'ex-'+index" class="preview-item">
                                    <img :src="img" class="preview-img" />
                                    <div class="existing-badge">Existing</div>
                                    <button class="remove-img-btn" @click.stop="removeExistingImage(index)">
                                        <CIcon name="cil-x" size="sm" />
                                    </button>
                                </div>
                                <!-- New Selected Images -->
                                <div v-for="(preview, index) in imagePreviews" :key="'new-'+index" class="preview-item">
                                    <img :src="preview" class="preview-img" />
                                    <button class="remove-img-btn" @click.stop="removeImage(index)">
                                        <CIcon name="cil-x" size="sm" />
                                    </button>
                                </div>
                            </div>
                        </div>
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
                    color="outline-primary" 
                    @click="onPreview"
                    class="btn-preview-news mr-2"
                    :disabled="previewLoading"
                >
                    {{ previewLoading ? 'Preparing...' : 'Preview' }}
                </CButton>
                <CButton 
                    color="primary" 
                    @click="onSave"
                    class="btn-save-news"
                    :disabled="!isFormValid"
                >
                    Update News
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'NewsEditModal',
    props: {
        show: { type: Boolean, default: false },
        news: { type: Object, default: () => null },
        categories: { type: Array, default: () => [] }
    },
    data() {
        return {
            previewLoading: false,
            imagePreviews: [],
            existingImages: [],
            form: {
                _id: '',
                title: '',
                description: '',
                category: null,
                images: []
            }
        }
    },
    watch: {
        news: {
            immediate: true,
            handler(val) {
                if (val) {
                    this.form = {
                        _id: val._id,
                        title: this.getName('en', val.title),
                        description: this.getName('en', val.description || val.content),
                        category: val.category ? (typeof val.category === 'object' ? val.category._id : val.category) : null,
                        images: []
                    };
                    this.existingImages = val.images || (val.image ? [val.image] : []);
                    this.imagePreviews = [];
                }
            }
        }
    },
    computed: {
        isFormValid() {
            return this.form.title && this.form.title.trim() !== '' && 
                   this.form.description && this.form.description.trim() !== '' &&
                   this.form.category;
        },
        categoryOptions() {
            const options = this.categories.map(cat => ({
                value: cat._id,
                label: this.getName('en', cat.title)
            }));
            return [{ value: null, label: 'Select Category', disabled: true }, ...options];
        }
    },
    methods: {
        getName(lang, field) {
            if (!field) return '';
            if (typeof field === 'string') return field;
            if (Array.isArray(field)) {
                const obj = field.find(f => f.key === lang) || field[0];
                return obj ? obj.value : '';
            }
            return '';
        },
        handleMultipleFileUpload(event) {
            const files = Array.from(event.target.files);
            if (files.length === 0) return;
            files.forEach(file => {
                if (!file.type.match('image.*')) return;
                this.form.images.push(file);
                const reader = new FileReader();
                reader.onload = (e) => { this.imagePreviews.push(e.target.result); };
                reader.readAsDataURL(file);
            });
        },
        removeImage(index) {
            this.form.images.splice(index, 1);
            this.imagePreviews.splice(index, 1);
        },
        removeImage(index) {
            this.form.images.splice(index, 1);
            this.imagePreviews.splice(index, 1);
        },
        removeExistingImage(index) {
            this.existingImages.splice(index, 1);
        },
        onSave() {
            if (!this.isFormValid) return;
            const payload = {
                _id: this.form._id,
                title: [{ key: 'en', value: this.form.title }, { key: 'th', value: this.form.title }],
                description: [{ key: 'en', value: this.form.description }, { key: 'th', value: this.form.description }],
                category: this.form.category,
                images: this.existingImages,
                _images: this.form.images
            };
            this.$emit('save', payload);
        },
        async onPreview() {
            if (this.previewLoading) return;
            this.previewLoading = true;

            try {
                // Find selected category object
                const categoryObj = this.categories.find(c => c._id === this.form.category);
                
                // Resize images for preview to avoid localStorage limits
                const compressedImages = await Promise.all(
                    this.imagePreviews.map(img => this.resizeImage(img, 800))
                );

                // Create preview data structure
                const previewData = {
                    title: [{ key: 'en', value: this.form.title }, { key: 'th', value: this.form.title }],
                    description: [{ key: 'en', value: this.form.description }, { key: 'th', value: this.form.description }],
                    category: categoryObj,
                    images: [...this.existingImages, ...compressedImages],
                    views: this.news ? this.news.views : 0,
                    create: { datetime: this.news ? (this.news.create ? this.news.create.datetime : new Date()) : new Date() }
                };

                // Store in Vuex
                this.$store.commit('news/setPreviewData', previewData);

                // Also store in localStorage to persist across tabs
                try {
                    localStorage.setItem('news_preview_data', JSON.stringify(previewData));
                } catch (e) {
                    console.error('LocalStorage error:', e);
                    previewData.images = [];
                    localStorage.setItem('news_preview_data', JSON.stringify(previewData));
                }

                // Open in new tab
                const routeData = this.$router.resolve({ 
                    name: 'NewsDetail', 
                    params: { id: 'preview' },
                    query: { preview: 'true' }
                });
                window.open(routeData.href, '_blank');
            } catch (error) {
                console.error('Preview error:', error);
            } finally {
                this.previewLoading = false;
            }
        },
        resizeImage(base64Str, maxWidth) {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = base64Str;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7)); // 0.7 quality
                };
            });
        },
    }
}
</script>

<style scoped>
/* Reuse styles */
.form-group-custom { margin-bottom: 1.25rem; }
.form-label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 0.75rem; letter-spacing: 0.05em; }
.custom-input ::v-deep .form-control, .custom-textarea ::v-deep .form-control { border-radius: 12px; border: 1px solid #f1f5f9; padding: 0.85rem 1.25rem; font-size: 1rem; background-color: #f8fafc; }
.custom-select-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 0.85rem 1.25rem; font-size: 1rem; outline: none; cursor: pointer; }
.dropdown-icon { color: #94a3b8; width: 14px; }

.multiple-upload-container { width: 100%; }
.upload-trigger-card { border: 2px dashed #e2e8f0; border-radius: 16px; background-color: #f8fafc; cursor: pointer; display: block; transition: all 0.2s; }
.upload-trigger-card:hover { border-color: #3b82f6; background-color: #f1f5f9; }
.file-input-hidden { display: none; }

.previews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; }
.preview-item { position: relative; width: 100%; height: 100px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.remove-img-btn { position: absolute; top: 4px; right: 4px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; }
.existing-badge { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(59, 130, 246, 0.8); color: white; font-size: 10px; text-align: center; padding: 2px 0; font-weight: 700; }

.icon-square { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.bg-blue-light { background-color: #3b82f611; }
.text-blue { color: #3b82f6; }
.close-btn { background: transparent; border: none; padding: 8px; color: #94a3b8; }
::v-deep .modal-content { border-radius: 20px; border: none; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); }
</style>
