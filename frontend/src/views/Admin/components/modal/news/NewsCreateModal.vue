<template>
    <CModal 
        title="Add New News" 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="create-news-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-newspaper" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Add New News' : 'เพิ่มข่าวใหม่' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Create a new announcement or update for the community.' : 'สร้างประกาศหรือการอัปเดตใหม่สำหรับชุมชน' }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2">
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
                                id="news-images-upload" 
                                @change="handleMultipleFileUpload" 
                                accept="image/*"
                                multiple
                                class="file-input-hidden"
                            />
                            <label for="news-images-upload" class="upload-trigger-card mb-3">
                                <div class="upload-placeholder py-4 text-center">
                                    <CIcon name="cil-cloud-upload" size="xl" class="text-blue mb-2" />
                                    <div class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Click to upload multiple images' : 'คลิกเพื่ออัปโหลดรูปภาพหลายรูป' }}</div>
                                    <div class="text-muted small">{{ $i18n.locale === 'en' ? 'PNG, JPG or JPEG (Max 10 files)' : 'PNG, JPG หรือ JPEG (สูงสุด 10 ไฟล์)' }}</div>
                                </div>
                            </label>

                            <div v-if="imagePreviews.length > 0" class="previews-grid">
                                <div 
                                    v-for="(preview, index) in imagePreviews" 
                                    :key="index" 
                                    class="preview-item clickable-thumbnail"
                                    :class="{ 'border-primary-highlight': coverIndex === index }"
                                    @click="setCoverIndex(index)"
                                >
                                    <img :src="preview" class="preview-img" />
                                    <div class="cover-badge" v-if="coverIndex === index">
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
                    {{ $i18n.locale === 'en' ? 'Create News' : 'สร้างข่าว' }}
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.snow.css'

export default {
    name: 'NewsCreateModal',
    components: {
        quillEditor
    },
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            previewLoading: false,
            imagePreviews: [],
            coverIndex: 0,
            form: {
                title: '',
                description: '',
                images: []
            },
            editorOptions: {
                modules: {
                    toolbar: [
                        [{ 'size': ['small', false, 'large', 'huge'] }],
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
    computed: {
        isFormValid() {
            return this.form.title && this.form.title.trim() !== '' && 
                   this.form.description && this.form.description.trim() !== '';
        }
    },
    methods: {
        getName(lang, field) {
            if (!field) return 'N/A';
            if (typeof field === 'string') return field;
            if (Array.isArray(field)) {
                const obj = field.find(f => f.key === lang) || field[0];
                return obj ? obj.value : 'N/A';
            }
            return 'N/A';
        },
        handleMultipleFileUpload(event) {
            const files = Array.from(event.target.files);
            if (files.length === 0) return;

            files.forEach(file => {
                if (!file.type.match('image.*')) return;
                
                this.form.images.push(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.imagePreviews.push(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        },
        removeImage(index) {
            this.form.images.splice(index, 1);
            this.imagePreviews.splice(index, 1);
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
            // Reorder form.images based on coverIndex
            if (this.coverIndex > 0 && this.coverIndex < this.form.images.length) {
                const coverImage = this.form.images[this.coverIndex];
                this.form.images.splice(this.coverIndex, 1);
                this.form.images.unshift(coverImage);
            }

            const payload = {
                title: [{ key: 'en', value: this.form.title }, { key: 'th', value: this.form.title }],
                description: [{ key: 'en', value: this.form.description }, { key: 'th', value: this.form.description }],
                _images: this.form.images,
                newCoverIndex: 0 // Since we reordered form.images, the cover is always index 0 of the uploaded files
            };

            this.$emit('save', payload);
            this.resetForm();
        },
        async onPreview() {
            if (this.previewLoading) return;
            this.previewLoading = true;
            
            try {
                // Resize images for preview to avoid localStorage limits
                const compressedImages = await Promise.all(
                    this.imagePreviews.map(img => this.resizeImage(img, 800))
                );

                // Reorder compressed images based on coverIndex
                if (this.coverIndex > 0 && this.coverIndex < compressedImages.length) {
                    const coverImg = compressedImages[this.coverIndex];
                    compressedImages.splice(this.coverIndex, 1);
                    compressedImages.unshift(coverImg);
                }

                // Create preview data structure
                const previewData = {
                    title: [{ key: 'en', value: this.form.title }, { key: 'th', value: this.form.title }],
                    description: [{ key: 'en', value: this.form.description }, { key: 'th', value: this.form.description }],
                    images: compressedImages,
                    views: 0,
                    create: { datetime: new Date() }
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
            // If it's already a URL (not base64), just return it
            if (!base64Str || !base64Str.startsWith('data:')) {
                return Promise.resolve(base64Str);
            }

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
        resetForm() {
            this.form = {
                title: '',
                description: '',
                images: []
            };
            this.imagePreviews = [];
            this.coverIndex = 0;
        }
    }
}
</script>

<style scoped>
.form-group-custom { margin-bottom: 1.25rem; }
.form-label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 0.75rem; letter-spacing: 0.05em; }
.custom-input ::v-deep .form-control { border-radius: 12px; border: 1px solid #f1f5f9; padding: 0.85rem 1.25rem; font-size: 1rem; background-color: #f8fafc; }
.custom-input ::v-deep .form-control:focus { border-color: #3b82f633; background-color: #ffffff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }

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
