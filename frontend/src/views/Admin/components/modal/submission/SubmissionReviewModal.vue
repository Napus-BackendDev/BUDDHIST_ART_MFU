<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="review-artwork-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-magnifying-glass" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Submission Review' : 'ตรวจสอบผลงานที่ส่ง' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Review and provide feedback for this submission.' : 'ตรวจสอบและประเมินผลงานการส่งงานนี้' }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="wizard-body px-3 py-2" v-if="artwork">
            <div class="wizard-content-grid">
                <!-- Left Column: Artwork Information -->
                <div class="wizard-form-column">
                    <div class="wizard-panel">
                        <div class="step-heading">
                            <span>{{ activeLanguage === 'th' ? '01' : '02' }}</span>
                            <div>
                                <h6>{{ activeLanguage === 'th'
                                    ? ($i18n.locale === 'en' ? 'Artwork details in Thai' : 'ข้อมูลเบื้องต้นของผลงาน')
                                    : ($i18n.locale === 'en' ? 'Artwork details in English' : 'ข้อมูลผลงานภาษาอังกฤษ') }}</h6>
                                <p>{{ activeLanguage === 'th'
                                    ? ($i18n.locale === 'en' ? 'Thai reference information.' : 'ข้อมูลอ้างอิงภาษาไทย')
                                    : ($i18n.locale === 'en' ? 'English artwork information.' : 'ข้อมูลผลงานภาษาอังกฤษ') }}</p>
                            </div>
                        </div>

                        <!-- Row 1: Title -->
                        <CRow>
                            <CCol md="12">
                                <div class="form-group-custom">
                                    <label class="form-label">
                                        {{ activeLanguage === 'th'
                                            ? ($i18n.locale === 'en' ? 'Title (TH)' : 'ชื่อภาษาไทย (TH)')
                                            : ($i18n.locale === 'en' ? 'Title (EN)' : 'ชื่อภาษาอังกฤษ (EN)') }}
                                    </label>
                                    <div class="custom-display-box font-weight-500">
                                        {{ (activeLanguage === 'th' ? (artwork.title_th || artwork.title_en) : (artwork.title_en || artwork.title_th)) || '-' }}
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 2: Artist / Submitter -->
                        <CRow>
                            <CCol md="12">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Artist / Submitter' : 'ชื่อศิลปิน / ผู้ส่งผลงาน' }}</label>
                                    <div class="custom-display-box with-icon-left">
                                        <CIcon name="cil-user" class="input-icon-left" />
                                        <div class="d-flex align-items-center justify-content-between w-100 pr-2">
                                            <span class="font-weight-500 text-dark">{{ artwork.artist_name || artwork.student_name || 'N/A' }}</span>
                                            <span v-if="artwork.student_id" class="text-muted small">
                                                ({{ artwork.student_id }})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 3: Category -->
                        <CRow>
                            <CCol md="12">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Category' : 'หมวดหมู่' }}</label>
                                    <div class="custom-display-box">
                                        <span class="font-weight-500 text-dark">{{ getCategoryDisplayName(artwork.category) }}</span>
                                        <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 4: Technique -->
                        <CRow>
                            <CCol md="12">
                                <div class="form-group-custom">
                                    <label class="form-label">
                                        {{ activeLanguage === 'th'
                                            ? ($i18n.locale === 'en' ? 'Technique (TH)' : 'เทคนิคภาษาไทย (TH)')
                                            : ($i18n.locale === 'en' ? 'Technique (EN)' : 'เทคนิคภาษาอังกฤษ (EN)') }}
                                    </label>
                                    <div class="custom-display-box">
                                        <span class="font-weight-500 text-dark">
                                            {{ (activeLanguage === 'th' ? (artwork.technique_th || artwork.technique_en) : (artwork.technique_en || artwork.technique_th)) || '-' }}
                                        </span>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 5: Dimensions -->
                        <CRow>
                            <CCol md="12">
                                <div class="form-group-custom">
                                    <label class="form-label">
                                        {{ $i18n.locale === 'en'
                                            ? 'Dimensions (' + (dimensions.is3D ? 'Width x Length x Height' : 'Width x Length') + ')'
                                            : 'ขนาด (' + (dimensions.is3D ? 'กว้าง x ยาว x สูง' : 'กว้าง x ยาว') + ')' }}
                                    </label>
                                    <div v-if="dimensions.width && dimensions.height" class="d-flex align-items-center">
                                        <div class="flex-grow-1">
                                            <div class="custom-display-box px-3 justify-content-start">
                                                <span class="dimension-prefix">W</span>
                                                <span class="font-weight-600 text-dark">{{ dimensions.width }}</span>
                                            </div>
                                        </div>
                                        <div class="mx-2 text-muted font-weight-bold">×</div>
                                        <div class="flex-grow-1">
                                            <div class="custom-display-box px-3 justify-content-start">
                                                <span class="dimension-prefix">L</span>
                                                <span class="font-weight-600 text-dark">{{ dimensions.height }}</span>
                                            </div>
                                        </div>
                                        <template v-if="dimensions.depth">
                                            <div class="mx-2 text-muted font-weight-bold">×</div>
                                            <div class="flex-grow-1">
                                                <div class="custom-display-box px-3 justify-content-start">
                                                    <span class="dimension-prefix">H</span>
                                                    <span class="font-weight-600 text-dark">{{ dimensions.depth }}</span>
                                                </div>
                                            </div>
                                        </template>
                                        <div class="ml-2">
                                            <div class="custom-display-box px-3" style="min-width: 80px; height: 50px;">
                                                <span class="text-dark font-weight-500">{{ dimensions.unit }}</span>
                                                <CIcon name="cil-chevron-bottom" class="dropdown-icon ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="custom-display-box">
                                        <span class="font-weight-500 text-dark">{{ dimensions.raw || '-' }}</span>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 6: Remark (if available) -->
                        <CRow v-if="hasRemark">
                            <CCol md="12">
                                <div class="form-group-custom">
                                    <label class="form-label">
                                        {{ activeLanguage === 'th'
                                            ? ($i18n.locale === 'en' ? 'Remark (TH)' : 'หมายเหตุภาษาไทย (TH)')
                                            : ($i18n.locale === 'en' ? 'Remark (EN)' : 'หมายเหตุภาษาอังกฤษ (EN)') }}
                                    </label>
                                    <div class="custom-display-box">
                                        <span class="text-dark">{{ (activeLanguage === 'th' ? (artwork.remark_th || artwork.remark_en) : (artwork.remark_en || artwork.remark_th)) || '-' }}</span>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 7: Description -->
                        <div class="artwork-description-grid">
                            <CRow>
                                <CCol md="12">
                                    <div class="form-group-custom">
                                        <label class="form-label">
                                            {{ activeLanguage === 'th'
                                                ? ($i18n.locale === 'en' ? 'Description (TH)' : 'คำอธิบายภาษาไทย (TH)')
                                                : ($i18n.locale === 'en' ? 'Description (EN)' : 'คำอธิบายภาษาอังกฤษ (EN)') }}
                                        </label>
                                        <div class="custom-display-box custom-textarea-box">
                                            <span :class="hasDescription ? 'text-dark' : 'text-muted font-italic'">
                                                {{ currentDescription || ($i18n.locale === 'en' ? 'No description provided.' : 'ไม่มีคำอธิบาย') }}
                                            </span>
                                        </div>
                                    </div>
                                </CCol>
                            </CRow>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Artwork Image & Submission Settings -->
                <aside class="wizard-image-column">
                    <div class="image-column-heading">
                        <span><CIcon name="cil-image1" size="lg" /></span>
                        <div>
                            <h6>{{ $i18n.locale === 'en' ? 'Artwork Image *' : 'รูปภาพผลงาน *' }}</h6>
                            <p>{{ $i18n.locale === 'en' ? 'Main image submitted by the student.' : 'รูปหลักที่ส่งโดยนักศึกษา' }}</p>
                        </div>
                    </div>

                    <!-- Artwork Image Box -->
                    <div class="image-upload-block">
                        <div class="file-upload-container">
                            <div class="preview-container">
                                <img v-if="artwork.preview || artwork.image"
                                    v-submission-image="artwork.preview || artwork.image"
                                    class="upload-preview" 
                                    :alt="artwork.title_en || artwork.title_th || 'Artwork'"
                                />
                                <p v-else class="text-muted p-3">{{ $i18n.locale === 'en' ? 'No image uploaded' : 'ยังไม่มีรูปภาพผลงาน' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Status Settings Under Image -->
                    <div class="sale-settings-under-image">
                        <CRow>
                            <!-- Submission Status -->
                            <CCol md="6">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Submission Status' : 'สถานะการส่งงาน' }}</label>
                                    <div class="custom-display-box bg-white">
                                        <div class="d-flex align-items-center">
                                            <CIcon :name="getStatusBadge(artwork.status).icon" class="mr-2" :class="getStatusBadge(artwork.status).iconColor" />
                                            <span class="font-weight-500" :class="getStatusBadge(artwork.status).textColor">
                                                {{ getTranslatedStatus(artwork.status) }}
                                            </span>
                                        </div>
                                        <CBadge :class="['px-3 py-1 font-weight-bold', getStatusBadge(artwork.status).class]">
                                            {{ getTranslatedStatus(artwork.status) }}
                                        </CBadge>
                                    </div>
                                </div>
                            </CCol>

                            <!-- Deadline Progress (Punctuality) -->
                            <CCol md="6">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Deadline Progress' : 'ความตรงต่อเวลา' }}</label>
                                    <div class="custom-display-box bg-white">
                                        <div class="d-flex align-items-center">
                                            <CIcon :name="artwork.on_time ? 'cil-check-circle' : 'cil-warning'" class="mr-2" :class="artwork.on_time ? 'text-success' : 'text-danger'" />
                                            <span class="font-weight-500" :class="artwork.on_time ? 'text-success' : 'text-danger'">
                                                {{ artwork.on_time ? ($i18n.locale === 'en' ? 'On Time' : 'ตรงเวลา') : ($i18n.locale === 'en' ? 'Late' : 'ส่งช้า') }}
                                            </span>
                                        </div>
                                        <CBadge :class="['px-3 py-1 font-weight-bold', artwork.on_time ? 'status-completed' : 'status-cancelled']">
                                            {{ artwork.on_time ? ($i18n.locale === 'en' ? 'On Time' : 'ตรงเวลา') : ($i18n.locale === 'en' ? 'Late' : 'ส่งช้า') }}
                                        </CBadge>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>
                    </div>

                    <!-- Price, Storage Location & Details -->
                    <div class="storage-location-row">
                        <!-- Price (if available) -->
                        <div v-if="artwork.price && Number(artwork.price) > 0" class="form-group-custom">
                            <label class="form-label">{{ $i18n.locale === 'en' ? 'Price / Value' : 'ราคา / มูลค่า' }}</label>
                            <div class="custom-display-box bg-white justify-content-start">
                                <span class="currency-prefix">฿</span>
                                <span class="font-weight-bold text-dark h6 mb-0">{{ formatPrice(artwork.price) }}</span>
                            </div>
                        </div>

                        <!-- Artwork Code (if available) -->
                        <div v-if="artwork.artworkCode" class="form-group-custom">
                            <label class="form-label">{{ $i18n.locale === 'en' ? 'Artwork Code' : 'รหัสผลงาน' }}</label>
                            <div class="custom-display-box bg-white">
                                <span class="text-dark font-weight-bold">{{ artwork.artworkCode }}</span>
                                <CIcon name="cil-qr-code" class="dropdown-icon text-muted" />
                            </div>
                        </div>

                        <!-- Storage Location (underneath Artwork Code) -->
                        <div class="form-group-custom">
                            <label class="form-label">{{ $i18n.locale === 'en' ? 'Storage location' : 'สถานที่จัดเก็บ' }}</label>
                            <div class="custom-display-box bg-white">
                                <span class="text-dark font-weight-500">{{ getStorageDisplayName(artwork.storage) }}</span>
                                <CIcon name="cil-location-pin" class="dropdown-icon text-danger" />
                            </div>
                            <p v-if="artwork.storageDetail" class="small text-muted mt-1 mb-0 px-1">
                                {{ artwork.storageDetail }}
                            </p>
                        </div>

                        <!-- Submitted Date (if available) -->
                        <div v-if="artwork.submitted_date" class="form-group-custom mb-0">
                            <label class="form-label">{{ $i18n.locale === 'en' ? 'Submitted Date' : 'วันที่ส่งงาน' }}</label>
                            <div class="custom-display-box bg-white">
                                <span class="text-muted small">{{ artwork.submitted_date }}</span>
                                <CIcon name="cil-clock" class="dropdown-icon text-muted" />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>

        <template #footer>
            <div class="wizard-footer w-100 d-flex justify-content-between align-items-center py-2">
                <div class="language-tabs" role="tablist" aria-label="Artwork language">
                    <button
                        type="button"
                        class="language-tab"
                        :class="{ active: activeLanguage === 'th' }"
                        :aria-selected="activeLanguage === 'th'"
                        role="tab"
                        @click="activeLanguage = 'th'"
                    >
                        ภาษาไทย
                    </button>
                    <button
                        type="button"
                        class="language-tab"
                        :class="{ active: activeLanguage === 'en' }"
                        :aria-selected="activeLanguage === 'en'"
                        role="tab"
                        @click="activeLanguage = 'en'"
                    >
                        ภาษาอังกฤษ
                    </button>
                </div>
                
                <div class="wizard-actions d-flex align-items-center">
                    <div class="d-flex align-items-center mr-3" v-if="!readOnly && artwork && artwork.status === 'Pending'">
                        <CButton 
                            class="btn-action-modal btn-passed-modal mr-2" 
                            :disabled="!!isUpdating"
                            @click="handleAction('Approved')"
                        >
                            <CSpinner v-if="isUpdating === 'Approved'" size="sm" class="mr-2" />
                            <CIcon v-else name="cil-check" size="sm" class="mr-1" />
                            {{ isUpdating === 'Approved' ? ($i18n.locale === 'en' ? 'Sending...' : 'กำลังส่ง...') : ($i18n.locale === 'en' ? 'Approve' : 'อนุมัติผ่าน') }}
                        </CButton>
                        <CButton 
                            class="btn-action-modal btn-failed-modal" 
                            :disabled="!!isUpdating"
                            @click="handleAction('Rejected')"
                        >
                            <CSpinner v-if="isUpdating === 'Rejected'" size="sm" class="mr-2" />
                            <CIcon v-else name="cil-x" size="sm" class="mr-1" />
                            {{ isUpdating === 'Rejected' ? ($i18n.locale === 'en' ? 'Sending...' : 'กำลังส่ง...') : ($i18n.locale === 'en' ? 'Reject' : 'ปฏิเสธไม่ผ่าน') }}
                        </CButton>
                    </div>
                    <div v-else-if="artwork" class="text-muted font-italic small mr-3">
                        {{ $i18n.locale === 'en' ? `Action unavailable: This submission is already ${artwork.status.toLowerCase()}` : `ไม่สามารถดำเนินการได้: การส่งงานได้รับการ${artwork.status === 'Approved' || artwork.status === 'Passed' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}` }}
                    </div>

                    <CButton 
                        color="secondary" 
                        variant="ghost"
                        @click="$emit('update:show', false)"
                        class="btn-close-modal"
                        :disabled="!!isUpdating"
                    >
                        {{ $i18n.locale === 'en' ? 'Close' : 'ปิด' }}
                    </CButton>
                </div>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'SubmissionReviewModal',
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        show: {
            type: Boolean,
            default: false
        },
        artwork: {
            type: Object,
            default: () => null
        },
        isUpdating: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            activeLanguage: 'th'
        };
    },
    created() {
        this.$store.dispatch('setting/storage/get', {});
    },
    watch: {
        show(isVisible) {
            if (isVisible) this.activeLanguage = 'th';
        }
    },
    computed: {
        hasRemark() {
            if (!this.artwork) return false;
            const remarkTh = this.artwork.remark_th || (typeof this.artwork.remark === 'string' ? this.artwork.remark : '');
            const remarkEn = this.artwork.remark_en || '';
            return (remarkTh && remarkTh.trim() !== '') || (remarkEn && remarkEn.trim() !== '');
        },
        currentDescription() {
            if (!this.artwork) return '';
            if (this.activeLanguage === 'th') {
                return this.artwork.description_th || this.artwork.description_en || '';
            }
            return this.artwork.description_en || this.artwork.description_th || '';
        },
        hasDescription() {
            return this.currentDescription && this.currentDescription.trim() !== '';
        },
        dimensions() {
            if (!this.artwork) return { width: '', height: '', depth: '', unit: 'cm', is3D: false, raw: '' };
            const sizeStr = (this.activeLanguage === 'th' ? (this.artwork.size_th || this.artwork.size_en) : (this.artwork.size_en || this.artwork.size_th)) || (typeof this.artwork.size === 'string' ? this.artwork.size : '') || '';
            const normalizedSize = sizeStr.replace(/×/g, 'x').replace(/X/g, 'x');
            const matches = normalizedSize.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)(?:\s*x\s*(\d+(?:\.\d+)?))?/i);

            // Check if 3D
            const cat = this.artwork.category ? String(this.artwork.category).toLowerCase() : '';
            const is3D = cat.includes('sculpture') || cat.includes('installation') || cat.includes('ประติมากรรม') || cat.includes('จัดวาง');

            // Extract unit
            const unitMatch = normalizedSize.match(/(cm|mm|inch|m|ชม\.|ซม\.?|มม\.|ม\.|นิ้ว)/i);
            let unit = this.$i18n.locale === 'en' ? 'cm' : 'ซม.';
            if (unitMatch) {
                const u = unitMatch[0].toLowerCase();
                if (u === 'cm' || u === 'ชม.' || u === 'ซม.' || u === 'ซม') unit = this.$i18n.locale === 'en' ? 'cm' : 'ซม.';
                else if (u === 'm' || u === 'ม.') unit = this.$i18n.locale === 'en' ? 'm' : 'ม.';
                else if (u === 'inch' || u === 'นิ้ว') unit = this.$i18n.locale === 'en' ? 'inch' : 'นิ้ว';
                else if (u === 'mm' || u === 'มม.') unit = this.$i18n.locale === 'en' ? 'mm' : 'มม.';
            }

            if (matches) {
                return {
                    width: matches[1],
                    height: matches[2],
                    depth: matches[3] || '',
                    unit: unit,
                    is3D: is3D || !!matches[3],
                    raw: sizeStr
                };
            }
            return {
                width: '',
                height: '',
                depth: '',
                unit: unit,
                is3D: is3D,
                raw: sizeStr
            };
        }
    },
    methods: {
        handleAction(statusName) {
            this.$emit('update-status', statusName);
        },
        getCategoryDisplayName(category) {
            if (!category) return '-';
            if (typeof category === 'string') return category;
            return this.getName(this.activeLanguage, category) || '-';
        },
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;

            if (Array.isArray(item)) {
                const target = item.find(n => n.key === lang) || item[0];
                return target ? target.value : '';
            }

            const field = item.title || item.name || item.key;
            if (field) {
                if (typeof field === 'string') return field;
                if (Array.isArray(field)) {
                    const target = field.find(n => n.key === lang) || field[0];
                    return target ? target.value : '';
                }
            }

            if (typeof item === 'object') {
                return item.value || '';
            }

            return '';
        },
        getStorageDisplayName(storage) {
            if (!storage) return this.$i18n.locale === 'en' ? 'Not specified' : 'ไม่ได้ระบุ';
            if (typeof storage === 'string') {
                const storages = this.$store.getters['setting/storage/item'] || [];
                const found = storages.find(s => String(s._id || s.id) === String(storage));
                if (found) {
                    return this.getName(this.activeLanguage, found) || this.getName(this.$i18n.locale, found) || this.getName('th', found) || this.getName('en', found);
                }
                if (storage.length === 24 && /^[0-9a-fA-F]+$/.test(storage)) {
                    return this.$i18n.locale === 'en' ? 'University Storage' : 'คลังมหาวิทยาลัย';
                }
                return storage;
            }
            const name = this.getName(this.activeLanguage, storage) || this.getName(this.$i18n.locale, storage) || this.getName('th', storage) || this.getName('en', storage);
            return name || (this.$i18n.locale === 'en' ? 'Not specified' : 'ไม่ได้ระบุ');
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0.00';
            const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
            return isNaN(num) ? '0.00' : num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        getTranslatedStatus(status) {
            if (status === 'Approved' || status === 'Passed') return this.$i18n.locale === 'en' ? 'Approved' : 'ผ่าน/อนุมัติ';
            if (status === 'Rejected' || status === 'Fail') return this.$i18n.locale === 'en' ? 'Rejected' : 'ไม่ผ่าน';
            if (status === 'Pending') return this.$i18n.locale === 'en' ? 'Pending' : 'รอการตรวจสอบ';
            return status || '-';
        },
        getStatusBadge(status) {
            if (status === 'Passed' || status === 'Approved') {
                return { class: 'status-completed', icon: 'cil-check-circle', textColor: 'text-success', iconColor: 'text-success' };
            }
            if (status === 'Fail' || status === 'Rejected') {
                return { class: 'status-cancelled', icon: 'cil-ban', textColor: 'text-danger', iconColor: 'text-danger' };
            }
            if (status === 'Pending') {
                return { class: 'status-pending', icon: 'cil-clock', textColor: 'text-warning', iconColor: 'text-warning' };
            }
            return { class: 'status-update', icon: 'cil-history', textColor: 'text-info', iconColor: 'text-info' };
        }
    }
}
</script>

<style scoped>
/* Modal Structure & Layout */
::v-deep .modal-dialog {
    width: calc(100% - 2rem);
    max-width: 1100px;
    min-height: calc(100% - 2rem);
    margin: 1rem auto;
}

::v-deep .modal-content {
    max-height: calc(100vh - 2rem);
    display: flex;
    border-radius: 20px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

::v-deep .modal-header {
    border-bottom: 1px solid #f1f5f9;
    padding: 1.5rem 2rem;
}

::v-deep .modal-body {
    flex: 1;
    min-height: 0;
    max-height: none;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
    padding: 1rem 2rem;
}

::v-deep .modal-footer {
    border-top: 1px solid #f1f5f9;
    padding: 1.25rem 2rem;
}

/* Header Styling */
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

/* Grid Layout matching Edit Modal */
.wizard-content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.75fr) minmax(280px, 0.85fr);
    gap: 2rem;
    align-items: start;
}

.wizard-form-column {
    min-width: 0;
}

.wizard-panel {
    padding: 0.75rem 0 0;
}

.step-heading {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e8edf5;
}

.step-heading > span {
    color: #b7791f;
    font-family: var(--app-font-family);
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.step-heading h6 {
    margin: 0 0 0.2rem;
    color: #27364a;
    font-size: 1.15rem;
    font-weight: 700;
}

.step-heading p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.85rem;
}

/* Form Groups & Custom Readonly Display Boxes */
.form-group-custom {
    margin-bottom: 1.25rem;
}

.form-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
    display: block;
}

.custom-display-box {
    width: 100%;
    min-height: 52px;
    padding: 0.85rem 1.25rem;
    background-color: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    font-size: 1rem;
    color: #1e293b;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;
}

.custom-display-box.with-icon-left {
    position: relative;
    padding-left: 2.85rem;
    justify-content: flex-start;
}

.custom-display-box .input-icon-left {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    width: 16px;
}

.custom-display-box.custom-textarea-box {
    min-height: 100px;
    align-items: flex-start;
    line-height: 1.6;
    white-space: pre-wrap;
    color: #0f172a;
}

.dropdown-icon {
    color: #94a3b8;
    width: 14px;
}

.dimension-prefix {
    color: #94a3b8;
    font-weight: 600;
    font-size: 0.85rem;
    margin-right: 0.65rem;
}

.artwork-description-grid {
    margin-top: 0;
    padding-top: 0;
}

/* Right Column: Image & Settings */
.wizard-image-column {
    position: sticky;
    top: 0;
    min-width: 0;
    padding: 0.75rem 0 0 2rem;
    border-left: 1px solid #e8edf5;
    display: flex;
    flex-direction: column;
}

.image-column-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.image-column-heading > span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.8rem;
    background: #eef3ff;
    color: #6d8ff0;
}

.image-column-heading h6 {
    margin: 0 0 0.2rem;
    color: #27364a;
    font-size: 1rem;
    font-weight: 700;
}

.image-column-heading p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.78rem;
    line-height: 1.4;
}

/* Image Container */
.image-upload-block {
    margin-bottom: 0;
}

.file-upload-container {
    width: 100%;
    aspect-ratio: 1 / 1;
    border: 2px dashed #d9e0eb;
    border-radius: 1.25rem;
    background: linear-gradient(145deg, #fbfcff, #f6f8fc);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.upload-preview {
    width: 100%;
    height: 100%;
    padding: 0.5rem;
    object-fit: contain;
    background-color: transparent;
}

.sale-settings-under-image {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid #e8edf5;
}

.sale-settings-under-image ::v-deep .row {
    display: block;
    margin: 0;
}

.sale-settings-under-image ::v-deep [class*="col-"] {
    width: 100%;
    max-width: 100%;
    flex: 0 0 100%;
    padding: 0;
}

.storage-location-row {
    width: 100%;
    margin: 1.25rem 0 0;
    padding-top: 1.25rem;
    border-top: 1px solid #e8edf5;
}

.storage-location-row ::v-deep .row {
    display: block;
    margin: 0;
}

.storage-location-row ::v-deep [class*="col-"] {
    width: 100%;
    max-width: 100%;
    flex: 0 0 100%;
    padding: 0;
}

.currency-prefix {
    color: #6366f1;
    font-weight: 700;
    font-size: 1.1rem;
    margin-right: 0.5rem;
}

/* Badges */
.status-completed {
    background-color: #ecfdf5 !important;
    color: #059669 !important;
    border: 1px solid #a7f3d0 !important;
}

.status-cancelled {
    background-color: #fef2f2 !important;
    color: #dc2626 !important;
    border: 1px solid #fecaca !important;
}

.status-pending {
    background-color: #fffbeb !important;
    color: #d97706 !important;
    border: 1px solid #fde68a !important;
}

.status-update {
    background-color: #eff6ff !important;
    color: #2563eb !important;
    border: 1px solid #bfdbfe !important;
}

/* Action Buttons */
.btn-action-modal {
    border-radius: 30px !important;
    padding: 0.6rem 1.5rem !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s ease;
}

.btn-passed-modal {
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    color: white !important;
}

.btn-passed-modal:hover:not(:disabled) {
    background-color: #059669 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-failed-modal {
    background-color: #ef4444 !important;
    border-color: #ef4444 !important;
    color: white !important;
}

.btn-failed-modal:hover:not(:disabled) {
    background-color: #dc2626 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

/* Footer Styling & Language Tabs */
.wizard-footer {
    gap: 1rem;
}

.language-tabs {
    display: inline-flex;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 30px;
    gap: 4px;
}

.language-tab {
    border: none;
    background: transparent;
    padding: 6px 18px;
    border-radius: 20px;
    font-size: 0.88rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.25s ease;
    outline: none;
}

.language-tab:hover {
    color: #1e293b;
}

.language-tab.active {
    background: #ffffff;
    color: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-close-modal {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 30px;
    padding: 0.65rem 2.25rem;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.2s ease;
}

.btn-close-modal:hover {
    background: #e2e8f0;
    color: #1e293b;
}

/* Responsive Rules */
@media (max-width: 767px) {
    ::v-deep .modal-dialog {
        width: calc(100% - 1rem);
        min-height: calc(100% - 1rem);
        margin: 0.5rem auto;
    }

    ::v-deep .modal-body {
        padding: 0.75rem 1rem;
    }

    .wizard-content-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .wizard-image-column {
        position: static;
        padding: 1.5rem 0 0;
        border-top: 1px solid #e8edf5;
        border-left: 0;
    }

    .wizard-footer {
        flex-direction: column;
        align-items: stretch !important;
        gap: 1rem;
    }

    .language-tabs {
        justify-content: center;
    }

    .wizard-actions {
        justify-content: flex-end;
    }
}
</style>
