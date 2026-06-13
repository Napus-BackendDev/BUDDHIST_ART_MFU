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
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Edit News Article' : 'แก้ไขบทความข่าว' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Update the details of your news announcement.' : 'อัปเดตรายละเอียดประกาศข่าวของคุณ' }}</p>
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
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'News Title' : 'หัวข้อข่าว' }}</label>
                        <CInput 
                            v-model="form.title" 
                            :placeholder="$i18n.locale === 'en' ? 'e.g. New Exhibition Opening Soon' : 'เช่น นิทรรศการใหม่เปิดเร็วๆ นี้'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Content Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Content' : 'เนื้อหา' }}</label>
                        <quill-editor 
                            v-model="form.description" 
                            :options="editorOptions"
                            class="custom-quill-editor"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- File Upload Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'News Images (Multiple) - Click an image to set as cover' : 'รูปภาพข่าว (หลายรูป) - คลิกที่รูปเพื่อตั้งเป็นหน้าปก' }}</label>
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
                                    <div class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Click to add more images' : 'คลิกเพื่อเพิ่มรูปภาพ' }}</div>
                                    <div class="text-muted small">PNG, JPG or JPEG</div>
                                </div>
                            </label>

                            <div class="previews-grid">
                                <!-- Existing Images from Backend -->
                                <div 
                                    v-for="(img, index) in existingImages" 
                                    :key="'ex-'+index" 
                                    class="preview-item clickable-thumbnail"
                                    :class="{ 'border-primary-highlight': coverIndex === index }"
                                    @click="setCoverIndex(index)"
                                >
                                    <img :src="img" class="preview-img" />
                                    <div class="cover-badge" v-if="coverIndex === index">
                                        {{ $i18n.locale === 'en' ? 'Cover' : 'หน้าปก' }}
                                    </div>
                                    <div class="existing-badge" v-else>{{ $i18n.locale === 'en' ? 'Existing' : 'รูปเดิม' }}</div>
                                    <div class="set-cover-overlay" v-if="coverIndex !== index">
                                        {{ $i18n.locale === 'en' ? 'Set Cover' : 'ตั้งเป็นหน้าปก' }}
                                    </div>
                                    <button class="remove-img-btn" @click.stop="removeExistingImage(index)">
                                        <CIcon name="cil-x" size="sm" />
                                    </button>
                                </div>
                                <!-- New Selected Images -->
                                <div 
                                    v-for="(preview, index) in imagePreviews" 
                                    :key="'new-'+index" 
                                    class="preview-item clickable-thumbnail"
                                    :class="{ 'border-primary-highlight': coverIndex === (index + existingImages.length) }"
                                    @click="setCoverIndex(index + existingImages.length)"
                                >
                                    <img :src="preview" class="preview-img" />
                                    <div class="cover-badge" v-if="coverIndex === (index + existingImages.length)">
                                        {{ $i18n.locale === 'en' ? 'Cover' : 'หน้าปก' }}
                                    </div>
                                    <div class="set-cover-overlay" v-else>
                                        {{ $i18n.locale === 'en' ? 'Set Cover' : 'ตั้งเป็นหน้าปก' }}
                                    </div>
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
                    {{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
                </CButton>
                <CButton 
                    color="outline-primary" 
                    @click="onPreview"
                    class="btn-preview-news mr-2"
                    :disabled="previewLoading"
                >
                    {{ previewLoading ? ($i18n.locale === 'en' ? 'Preparing...' : 'กำลังเตรียม...') : ($i18n.locale === 'en' ? 'Preview' : 'ดูตัวอย่าง') }}
                </CButton>
                <CButton 
                    color="primary" 
                    @click="onSave"
                    class="btn-save-news"
                    :disabled="!isFormValid"
                >
                    {{ $i18n.locale === 'en' ? 'Update News' : 'อัปเดตข่าว' }}
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.snow.css'

export default {
    name: 'NewsEditModal',
    components: {
        quillEditor
    },
    props: {
        show: { type: Boolean, default: false },
        news: { type: Object, default: () => null }
    },
    data() {
        return {
            previewLoading: false,
            imagePreviews: [],
            existingImages: [],
            coverIndex: 0,
            form: {
                _id: '',
                title: '',
                description: '',
                images: []
            },
            editorOptions: {
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        ['link'],
                        ['clean']
                    ]
                },
                placeholder: this.$i18n.locale === 'en' ? 'Enter news content...' : 'กรอกเนื้อหาข่าว...',
                theme: 'snow'
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
                        images: []
                    };
                    this.existingImages = val.images || (val.image ? [val.image] : []);
                    this.imagePreviews = [];
                    this.coverIndex = 0; // Default cover index to first existing image
                }
            }
        }
    },
    computed: {
        isFormValid() {
            return this.form.title && this.form.title.trim() !== '' && 
                   this.form.description && this.form.description.trim() !== '';
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
            const actualIndex = index + this.existingImages.length;
            if (this.coverIndex === actualIndex) {
                this.coverIndex = 0;
            } else if (this.coverIndex > actualIndex) {
                this.coverIndex--;
            }
        },
        removeExistingImage(index) {
            this.existingImages.splice(index, 1);
            if (this.coverIndex === index) {
                this.coverIndex = 0;
            } else if (this.coverIndex > index) {
                this.coverIndex--;
            }
        },
        setCoverIndex(index) {
            this.coverIndex = index;
        },
        onSave() {
            if (!this.isFormValid) return;
            
            // Determine if cover is new or existing
            let newCoverIndex = null;
            const L_existing = this.existingImages.length;
            
            if (this.coverIndex >= L_existing) {
                newCoverIndex = this.coverIndex - L_existing;
            } else {
                // If it is one of the existing images, we reorder existingImages
                if (this.coverIndex > 0 && this.coverIndex < L_existing) {
                    const coverImg = this.existingImages[this.coverIndex];
                    this.existingImages.splice(this.coverIndex, 1);
                    this.existingImages.unshift(coverImg);
                }
            }

            const payload = {
                _id: this.form._id,
                title: [{ key: 'en', value: this.form.title }, { key: 'th', value: this.form.title }],
                description: [{ key: 'en', value: this.form.description }, { key: 'th', value: this.form.description }],
                images: this.existingImages,
                _images: this.form.images,
                newCoverIndex: newCoverIndex
            };
            this.$emit('save', payload);
        },
        async onPreview() {
            if (this.previewLoading) return;
            this.previewLoading = true;
            
            try {
                // Resize images for preview to avoid localStorage limits
                const compressedImages = await Promise.all(
                    this.imagePreviews.map(img => this.resizeImage(img, 800))
                );

                const combinedImages = [...this.existingImages, ...compressedImages];
                
                // Reorder combined images based on coverIndex
                if (this.coverIndex > 0 && this.coverIndex < combinedImages.length) {
                    const coverImg = combinedImages[this.coverIndex];
                    combinedImages.splice(this.coverIndex, 1);
                    combinedImages.unshift(coverImg);
                }

                // Create preview data structure
                const previewData = {
                    title: [{ key: 'en', value: this.form.title }, { key: 'th', value: this.form.title }],
                    description: [{ key: 'en', value: this.form.description }, { key: 'th', value: this.form.description }],
                    images: combinedImages,
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
.form-group-custom { margin-bottom: 1.25rem; }
.form-label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 0.75rem; letter-spacing: 0.05em; }
.custom-input ::v-deep .form-control { border-radius: 12px; border: 1px solid #f1f5f9; padding: 0.85rem 1.25rem; font-size: 1rem; background-color: #f8fafc; }

.custom-quill-editor ::v-deep .ql-toolbar {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border-color: #f1f5f9;
    background-color: #f8fafc;
}
.custom-quill-editor ::v-deep .ql-container {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    border-color: #f1f5f9;
    min-height: 180px;
    font-family: 'Sarabun', sans-serif;
    font-size: 1rem;
    background-color: #ffffff;
}

.multiple-upload-container { width: 100%; }
.upload-trigger-card { border: 2px dashed #e2e8f0; border-radius: 16px; background-color: #f8fafc; cursor: pointer; display: block; transition: all 0.2s; }
.upload-trigger-card:hover { border-color: #3b82f6; background-color: #f1f5f9; }
.file-input-hidden { display: none; }

.previews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 14px; }
.preview-item { position: relative; width: 100%; height: 110px; border-radius: 12px; overflow: hidden; border: 2px solid #e2e8f0; transition: all 0.25s ease; cursor: pointer; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.remove-img-btn { position: absolute; top: 4px; right: 4px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 5; }

.preview-item.border-primary-highlight {
    border-color: #321fdb;
    box-shadow: 0 0 0 3px rgba(50, 31, 219, 0.25);
}

.cover-badge {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(50, 31, 219, 0.9);
    color: white;
    font-size: 10px;
    text-align: center;
    padding: 3px 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 2;
}

.existing-badge {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(108, 117, 125, 0.95);
    color: white;
    font-size: 10px;
    text-align: center;
    padding: 3px 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 2;
}

.set-cover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    color: white;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 2;
}
.preview-item:hover .set-cover-overlay {
    opacity: 1;
}

.icon-square { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.bg-blue-light { background-color: #3b82f611; }
.text-blue { color: #3b82f6; }
.close-btn { background: transparent; border: none; padding: 8px; color: #94a3b8; }
::v-deep .modal-content { border-radius: 20px; border: none; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); }
</style>
