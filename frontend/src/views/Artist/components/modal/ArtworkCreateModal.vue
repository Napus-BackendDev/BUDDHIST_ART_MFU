<template>
    <CModal 
        :title="isEditMode ? 'Edit Artwork' : 'Add New Artwork'"
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="create-artwork-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-red-light text-red mr-3">
                        <CIcon :name="isEditMode ? 'cil-pencil' : 'cil-paint'" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">
                            {{ isEditMode
                                ? ($i18n.locale === 'en' ? 'Edit Artwork' : 'แก้ไขผลงานศิลปะ')
                                : ($i18n.locale === 'en' ? 'Add New Artwork' : 'เพิ่มผลงานศิลปะใหม่') }}
                        </h5>
                        <p class="text-muted small mb-0">
                            {{ isEditMode
                                ? ($i18n.locale === 'en' ? 'Review and update the artwork in 2 short steps.' : 'ตรวจสอบและแก้ไขข้อมูลผลงานใน 2 ขั้นตอนสั้น ๆ')
                                : ($i18n.locale === 'en' ? 'Complete 2 short steps to add your artwork.' : 'กรอกข้อมูล 2 ขั้นตอนสั้น ๆ เพื่อเพิ่มผลงาน') }}
                        </p>
                    </div>
                </div>
                <button type="button" class="close-btn" :aria-label="$i18n.locale === 'en' ? 'Close' : 'ปิด'" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="wizard-body px-3 py-2">
            <div class="wizard-content-grid">
            <div class="wizard-form-column">
            <div v-show="currentStep === 1" class="wizard-panel">
                <div class="step-heading">
                    <span>01</span>
                    <div>
                        <h6>{{ $i18n.locale === 'en' ? 'Artwork details in Thai' : 'ข้อมูลเบื้องต้นของผลงาน' }}</h6>
                        <p>{{ $i18n.locale === 'en' ? 'Enter the Thai reference information first.' : 'กรอกข้อมูลอ้างอิงภาษาไทยก่อน' }}</p>
                    </div>
                </div>
            <!-- Thai artwork title -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Artwork Title (TH)' : 'ชื่อผลงาน (ภาษาไทย)' }} *</label>
                        <CInput
                            :aria-label="$i18n.locale === 'en' ? 'Artwork Title (TH)' : 'ชื่อผลงาน (ภาษาไทย)'" v-model="form.title.th"
                            :placeholder="$i18n.locale === 'en' ? 'Enter artwork title in Thai' : 'กรอกชื่อผลงานภาษาไทย'"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Category Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Category' : 'หมวดหมู่' }} *</label>
                        <CDropdown :key="form.category" :caret="false" class="w-100">
                            <template #toggler>
                                <CButton class="custom-select-btn">
                                    <span class="text-dark">{{ selectedCategoryName }}</span>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </CButton>
                            </template>
                            <div class="w-100 border-0 shadow-lg mt-2">
                                <CDropdownItem 
                                    v-for="cat in categories" 
                                    :key="cat._id" 
                                    @click="handleCategorySelect(cat._id)"
                                >
                                    {{ getName($i18n.locale === 'en' ? 'en' : 'th', cat) }}
                                </CDropdownItem>
                            </div>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Thai technique -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Technique (TH)' : 'เทคนิคที่ใช้ (ภาษาไทย)' }}</label>
                        <CInput 
                            :aria-label="$i18n.locale === 'en' ? 'Technique (TH)' : 'เทคนิคที่ใช้ (ภาษาไทย)'" v-model="form.technique.th"
                            :placeholder="$i18n.locale === 'en' ? 'e.g. Oil on Canvas (Thai)' : 'เช่น สีน้ำมันบนผ้าใบ'"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Size Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">
                            {{ $i18n.locale === 'en'
                                ? `Dimensions (${is3D ? 'Width × Length × Height' : 'Width × Length'})`
                                : `ขนาด (${is3D ? 'กว้าง × ยาว × สูง' : 'กว้าง × ยาว'})` }} *
                        </label>
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1">
                                <div class="input-group-custom">
                                    <span class="dimension-prefix">W</span>
                                    <CInput 
                                        type="number"
                                        :aria-label="$i18n.locale === 'en' ? 'Width' : 'ความกว้าง'" v-model="form.width"
                                        :placeholder="$i18n.locale === 'en' ? 'Width' : 'ความกว้าง'"
                                        class="custom-input-with-prefix mb-0"
                                    />
                                </div>
                            </div>
                            <div class="mx-2 text-muted font-weight-bold">×</div>
                            <div class="flex-grow-1">
                                <div class="input-group-custom">
                                    <span class="dimension-prefix">L</span>
                                    <CInput 
                                        type="number"
                                        :aria-label="$i18n.locale === 'en' ? 'Length' : 'ความยาว'" v-model="form.height"
                                        :placeholder="$i18n.locale === 'en' ? 'Length' : 'ความยาว'"
                                        class="custom-input-with-prefix mb-0"
                                    />
                                </div>
                            </div>
                            <template v-if="is3D">
                                <div class="mx-2 text-muted font-weight-bold">×</div>
                                <div class="flex-grow-1">
                                    <div class="input-group-custom">
                                        <span class="dimension-prefix">H</span>
                                        <CInput 
                                            type="number"
                                            :aria-label="$i18n.locale === 'en' ? 'Height' : 'ความสูง'" v-model="form.depth"
                                            :placeholder="$i18n.locale === 'en' ? 'Height' : 'ความสูง'"
                                            class="custom-input-with-prefix mb-0"
                                        />
                                    </div>
                                </div>
                            </template>
                            <div class="ml-2">
                                <CDropdown :key="form.unit" :caret="false">
                                    <template #toggler>
                                        <CButton class="custom-select-btn" style="min-width: 80px; height: 46px;">
                                            <span class="text-dark">{{ $i18n.locale === 'en' ? (form.unit || 'Unit') : (form.unit ? getUnitTH(form.unit) : 'หน่วย') }}</span>
                                            <CIcon name="cil-chevron-bottom" class="dropdown-icon ml-1" />
                                        </CButton>
                                    </template>
                                    <div class="border-0 shadow-lg mt-2">
                                        <CDropdownItem v-for="u in unitOptions" :key="u.en" @click="form.unit = u.en">
                                            {{ $i18n.locale === 'en' ? u.en : u.th }}
                                        </CDropdownItem>
                                    </div>
                                </CDropdown>
                            </div>
                        </div>
                    </div>
                </CCol>
            </CRow>

            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Remark (TH)' : 'หมายเหตุ (ภาษาไทย)' }}</label>
                        <CInput
                            :aria-label="$i18n.locale === 'en' ? 'Remark (TH)' : 'หมายเหตุ (ภาษาไทย)'" v-model="form.remark.th"
                            :placeholder="$i18n.locale === 'en' ? 'Additional notes in Thai...' : 'หมายเหตุเพิ่มเติมเกี่ยวกับผลงาน'"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Description (TH)' : 'รายละเอียดผลงาน (ภาษาไทย)' }}</label>
                        <CTextarea
                            :aria-label="$i18n.locale === 'en' ? 'Description (TH)' : 'รายละเอียดผลงาน (ภาษาไทย)'" v-model="form.description.th"
                            :placeholder="$i18n.locale === 'en' ? 'Artwork description in Thai...' : 'อธิบายแนวคิด ที่มา หรือรายละเอียดของผลงาน'"
                            rows="3"
                            class="custom-textarea"
                        />
                    </div>
                </CCol>
            </CRow>

            </div>

            <div v-show="currentStep === 2" class="wizard-panel">
                <div class="step-heading">
                    <span>02</span>
                    <div>
                        <h6>{{ $i18n.locale === 'en' ? 'Artwork details in English' : 'ข้อมูลผลงานภาษาอังกฤษ' }}</h6>
                        <p>{{ $i18n.locale === 'en' ? 'Add the English information and sale settings.' : 'กรอกข้อมูลภาษาอังกฤษและกำหนดการขาย' }}</p>
                    </div>
                </div>

            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Artwork Title (EN)' : 'ชื่อผลงาน (ภาษาอังกฤษ)' }} *</label>
                        <CInput
                            :aria-label="$i18n.locale === 'en' ? 'Artwork Title (EN)' : 'ชื่อผลงาน (ภาษาอังกฤษ)'" v-model="form.title.en"
                            :placeholder="$i18n.locale === 'en' ? 'e.g. The Golden Serenity' : 'กรอกชื่อผลงานภาษาอังกฤษ'"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Category' : 'หมวดหมู่' }} *</label>
                        <CDropdown :key="`en-${form.category}`" :caret="false" class="w-100">
                            <template #toggler>
                                <CButton class="custom-select-btn">
                                    <span class="text-dark">{{ selectedCategoryName }}</span>
                                    <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                </CButton>
                            </template>
                            <div class="w-100 border-0 shadow-lg mt-2">
                                <CDropdownItem
                                    v-for="cat in categories"
                                    :key="cat._id"
                                    @click="handleCategorySelect(cat._id)"
                                >
                                    {{ getName($i18n.locale === 'en' ? 'en' : 'th', cat) }}
                                </CDropdownItem>
                            </div>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Technique (EN)' : 'เทคนิคที่ใช้ (ภาษาอังกฤษ)' }}</label>
                        <CInput
                            :aria-label="$i18n.locale === 'en' ? 'Technique (EN)' : 'เทคนิคที่ใช้ (ภาษาอังกฤษ)'" v-model="form.technique.en"
                            :placeholder="$i18n.locale === 'en' ? 'e.g. Oil on Canvas' : 'เช่น Oil on Canvas'"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">
                            {{ $i18n.locale === 'en'
                                ? `Dimensions (${is3D ? 'Width × Length × Height' : 'Width × Length'})`
                                : `ขนาด (${is3D ? 'กว้าง × ยาว × สูง' : 'กว้าง × ยาว'})` }} *
                        </label>
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1">
                                <div class="input-group-custom">
                                    <span class="dimension-prefix">W</span>
                                    <CInput
                                        type="number"
                                        :aria-label="$i18n.locale === 'en' ? 'Width' : 'ความกว้าง'" v-model="form.width"
                                        :placeholder="$i18n.locale === 'en' ? 'Width' : 'ความกว้าง'"
                                        class="custom-input-with-prefix mb-0"
                                    />
                                </div>
                            </div>
                            <div class="mx-2 text-muted font-weight-bold">×</div>
                            <div class="flex-grow-1">
                                <div class="input-group-custom">
                                    <span class="dimension-prefix">L</span>
                                    <CInput
                                        type="number"
                                        :aria-label="$i18n.locale === 'en' ? 'Length' : 'ความยาว'" v-model="form.height"
                                        :placeholder="$i18n.locale === 'en' ? 'Length' : 'ความยาว'"
                                        class="custom-input-with-prefix mb-0"
                                    />
                                </div>
                            </div>
                            <template v-if="is3D">
                                <div class="mx-2 text-muted font-weight-bold">×</div>
                                <div class="flex-grow-1">
                                    <div class="input-group-custom">
                                        <span class="dimension-prefix">H</span>
                                        <CInput
                                            type="number"
                                            :aria-label="$i18n.locale === 'en' ? 'Height' : 'ความสูง'" v-model="form.depth"
                                            :placeholder="$i18n.locale === 'en' ? 'Height' : 'ความสูง'"
                                            class="custom-input-with-prefix mb-0"
                                        />
                                    </div>
                                </div>
                            </template>
                            <div class="ml-2">
                                <CDropdown :key="`en-${form.unit}`" :caret="false">
                                    <template #toggler>
                                        <CButton class="custom-select-btn" style="min-width: 80px; height: 46px;">
                                            <span class="text-dark">{{ $i18n.locale === 'en' ? (form.unit || 'Unit') : (form.unit ? getUnitTH(form.unit) : 'หน่วย') }}</span>
                                            <CIcon name="cil-chevron-bottom" class="dropdown-icon ml-1" />
                                        </CButton>
                                    </template>
                                    <div class="border-0 shadow-lg mt-2">
                                        <CDropdownItem v-for="u in unitOptions" :key="u.en" @click="form.unit = u.en">
                                            {{ $i18n.locale === 'en' ? u.en : u.th }}
                                        </CDropdownItem>
                                    </div>
                                </CDropdown>
                            </div>
                        </div>
                    </div>
                </CCol>
            </CRow>

            <!-- English remark -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Remark (EN)' : 'หมายเหตุ (ภาษาอังกฤษ)' }}</label>
                        <CInput
                            :aria-label="$i18n.locale === 'en' ? 'Remark (EN)' : 'หมายเหตุ (ภาษาอังกฤษ)'" v-model="form.remark.en"
                            :placeholder="$i18n.locale === 'en' ? 'Additional notes in English...' : 'หมายเหตุเพิ่มเติมเป็นภาษาอังกฤษ'"
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Description Row -->
            <!-- Description Row (EN) -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Description (EN)' : 'รายละเอียดผลงาน (ภาษาอังกฤษ)' }}</label>
                        <CTextarea
                            :aria-label="$i18n.locale === 'en' ? 'Description (EN)' : 'รายละเอียดผลงาน (ภาษาอังกฤษ)'" v-model="form.description.en"
                            :placeholder="$i18n.locale === 'en' ? 'English description...' : 'อธิบายรายละเอียดผลงานเป็นภาษาอังกฤษ'"
                            rows="4"
                            class="custom-textarea"
                        />
                    </div>
                </CCol>
            </CRow>

            </div>
            </div>

            <aside class="wizard-image-column">
                <div class="image-column-heading">
                    <span><CIcon name="cil-image1" size="lg" /></span>
                    <div>
                        <h6>{{ $i18n.locale === 'en' ? 'Artwork Image' : 'รูปภาพผลงาน' }} *</h6>
                        <p>{{ $i18n.locale === 'en' ? 'Upload the main image shown on the website.' : 'อัปโหลดรูปหลักที่จะแสดงบนเว็บไซต์' }}</p>
                    </div>
                </div>
                <div class="file-upload-container image-upload-panel" :class="{ 'has-image': imagePreview }">
                    <input
                        type="file"
                        :id="uploadInputId"
                        @change="handleFileUpload"
                        accept="image/png,image/jpeg"
                        :disabled="isProcessingImage"
                        class="file-input-hidden"
                    />
                    <label :for="uploadInputId" class="file-upload-label w-100">
                        <template v-if="!imagePreview">
                            <div class="upload-placeholder text-center">
                                <span class="upload-icon"><CIcon name="cil-cloud-upload" size="xl" /></span>
                                <div class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Choose artwork image' : 'เลือกรูปภาพผลงาน' }}</div>
                                <div class="text-muted small">PNG, JPG or JPEG</div>
                                <div class="upload-limit">{{ $i18n.locale === 'en' ? 'Maximum 5 MB' : 'ขนาดไม่เกิน 5 MB' }}</div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="preview-container position-relative">
                                <img :src="imagePreview" class="upload-preview" :alt="$i18n.locale === 'en' ? 'Artwork preview' : 'ตัวอย่างรูปภาพผลงาน'" />
                                <div class="preview-overlay">
                                    <div class="overlay-content">
                                        <CIcon name="cil-pencil" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Change image' : 'เปลี่ยนรูปภาพ' }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </label>
                </div>
                <p v-if="imageError" role="alert" class="text-danger mt-2">{{ imageError }}</p>
                <div class="sale-settings-under-image">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Sale Status' : 'สถานะการขาย' }}</label>
                        <CDropdown :key="form.status.sale" :caret="false" class="w-100" :disabled="isInitialTermLocked">
                            <template #toggler>
                                <CButton class="custom-select-btn" :disabled="isInitialTermLocked" :aria-describedby="isInitialTermLocked ? 'initial-term-sale-help' : undefined">
                                    <span class="text-dark">{{ selectedSaleStatusName }}</span>
                                    <CIcon name="cil-filter" class="dropdown-icon" />
                                </CButton>
                            </template>
                            <div v-if="!isInitialTermLocked" class="w-100 border-0 shadow-lg mt-2">
                                <CDropdownItem
                                    v-for="status in saleStatuses"
                                    :key="status._id"
                                    @click="handleSaleStatusSelect(status._id)"
                                >
                                    {{ getSaleStatusLabel(status) }}
                                </CDropdownItem>
                            </div>
                        </CDropdown>
                        <small v-if="isInitialTermLocked" id="initial-term-sale-help" class="text-muted d-block mt-2">{{ $i18n.locale === 'en' ? 'Sale rights remain active during the first year. Contact an admin to change this status.' : 'ระหว่างปีแรก ระบบเปิดสิทธิ์ขายอยู่ หากต้องการเปลี่ยนสถานะ กรุณาติดต่อแอดมิน' }}</small>
                    </div>
                    <div v-if="isPriceVisible" class="form-group-custom mb-0">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Price' : 'ราคา' }}</label>
                        <div class="input-group-custom">
                            <span class="currency-prefix">฿</span>
                            <CInput
                                type="number"
                                :aria-label="$i18n.locale === 'en' ? 'Price' : 'ราคา'" v-model="form.price"
                                placeholder="0.00"
                                class="custom-input-with-prefix text-right mb-0"
                            />
                        </div>
                    </div>
                </div>
                <div class="image-tip">
                    <CIcon name="cil-lightbulb" />
                    <span>{{ $i18n.locale === 'en' ? 'Use a clear, well-lit image with the whole artwork visible.' : 'ควรใช้ภาพคมชัด แสงเพียงพอ และเห็นผลงานครบทั้งชิ้น' }}</span>
                </div>
            </aside>
            </div>
        </div>

        <template #footer>
            <MissingFieldsHint class="w-100 mb-2" :labels="missingFields" />
            <div class="wizard-footer w-100 d-flex justify-content-between align-items-center py-2">
                <CButton 
                    variant="ghost" 
                    @click="currentStep === 1 ? $emit('update:show', false) : currentStep = 1"
                    :class="currentStep === 1 ? 'btn-cancel' : 'btn-back'"
                >
                    <CIcon v-if="currentStep === 2" name="cil-arrow-left" class="mr-1" />
                    {{ currentStep === 1
                        ? ($i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก')
                        : ($i18n.locale === 'en' ? 'Back' : 'ย้อนกลับ') }}
                </CButton>
                <div class="wizard-actions d-flex align-items-center">
                <CButton
                    v-if="currentStep === 1"
                    color="primary"
                    @click="currentStep = 2"
                    class="btn-create-artwork"
                    :disabled="!isStepOneValid"
                >
                    {{ $i18n.locale === 'en' ? 'Continue' : 'ถัดไป' }} <CIcon name="cil-arrow-right" class="ml-2" />
                </CButton>
                <CButton 
                    v-if="currentStep === 2"
                    color="primary" 
                    @click="handleSave"
                    class="btn-create-artwork"
                    :disabled="!isFormValid || loading"
                >
                    <CSpinner v-if="loading" size="sm" class="mr-2" />
                    {{ loading
                        ? ($i18n.locale === 'en' ? 'Saving...' : 'กำลังบันทึก...')
                        : (isEditMode
                            ? ($i18n.locale === 'en' ? 'Save Changes' : 'บันทึกการแก้ไข')
                            : ($i18n.locale === 'en' ? 'Create Artwork' : 'สร้างผลงาน')) }}
                </CButton>
                </div>
            </div>
        </template>
    </CModal>
</template>

<script>
import { CDropdown, CDropdownItem } from '@coreui/vue';
import { mapGetters } from 'vuex';
import artistImageInput from '@/mixins/artistImageInput';
import MissingFieldsHint from '@/components/MissingFieldsHint.vue';
import { missingLabels, dimensionsOk, priceOk } from '@/utils/missingFields';

export default {
    name: 'ArtworkCreateModal',
    mixins: [artistImageInput],
    components: {
        CDropdown,
        CDropdownItem,
        MissingFieldsHint
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        initialArtistId: {
            type: String,
            default: ''
        },
        mode: {
            type: String,
            default: 'create'
        },
        artwork: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            currentStep: 1,
            previousBodyOverflow: null,
            previousHtmlOverflow: null,
            categories: [],
            statuses: [],
            imagePreview: null,
            form: {
                title: { en: '', th: '' },
                artist: '',
                category: '',
                technique: { en: '', th: '' },
                size: { en: '', th: '' },
                width: '',
                height: '',
                depth: '',
                unit: 'cm',
                price: '',
                description: { en: '', th: '' },
                status: { approval: '', sale: '' },
                remark: { en: '', th: '' },
                image: null
            },
            unitOptions: [
                { en: 'cm', th: 'ซม' },
                { en: 'm', th: 'ม.' },
                { en: 'inch', th: 'นิ้ว' },
                { en: 'mm', th: 'มม.' }
            ]
        }
    },
    async created() {
        this.fetchInitialData();
    },
    beforeDestroy() {
        this.lockPageScroll(false);
    },
    computed: {
        ...mapGetters({
            allUsers: 'user/user'
        }),
        isEditMode() {
            return this.mode === 'edit';
        },
        uploadInputId() {
            return this.isEditMode ? 'artwork-image-edit-upload' : 'artwork-image-create-upload';
        },
        isStepOneValid() {
            const dimensions = [this.form.width, this.form.height];
            if (this.is3D) dimensions.push(this.form.depth);
            const dimensionsValid = dimensions.every(value => Number.isFinite(Number(value)) && Number(value) > 0);
            return this.form.title.th.trim() !== '' &&
                   this.form.artist !== '' &&
                   this.form.category !== '' &&
                   dimensionsValid;
        },
        missingFields() {
            const stepOne = [
                ['titleTh', this.form.title.th.trim() !== ''],
                ['artist', this.form.artist !== ''],
                ['category', this.form.category !== ''],
                ['size', dimensionsOk(this.form, this.is3D)]
            ];
            if (this.currentStep === 1) return missingLabels(stepOne, this.$i18n.locale);
            return missingLabels([
                ['imageBusy', !this.isProcessingImage],
                ['titleEn', this.form.title.en.trim() !== ''],
                ['image', this.imagePreview !== null],
                ...(this.isPriceVisible ? [['price', priceOk(this.form.price)]] : [])
            ], this.$i18n.locale);
        },
        isFormValid() {
            const basicValid = !this.isProcessingImage && this.isStepOneValid &&
                               this.form.title.en.trim() !== '' &&
                               this.imagePreview !== null;
            
            if (this.isPriceVisible) {
                return basicValid && String(this.form.price).trim() !== '' &&
                       Number.isFinite(Number(this.form.price)) && Number(this.form.price) >= 0;
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
            const language = this.$i18n.locale === 'en' ? 'en' : 'th';
            return cat
                ? this.getName(language, cat)
                : (language === 'th' ? 'เลือกหมวดหมู่' : 'Select Category');
        },
        selectedSaleStatusName() {
            const status = this.saleStatuses.find(s => String(s._id) === String(this.form.status.sale));
            const language = this.$i18n.locale === 'en' ? 'en' : 'th';
            return status
                ? this.getSaleStatusLabel(status)
                : (language === 'th' ? 'เลือกสถานะ' : 'Select Status');
        },
        selectedApprovalStatusName() {
            const status = this.statuses.find(s => s._id === this.form.status.approval);
            return status ? this.getName('en', status) : 'Select Approval Status';
        },
        is3D() {
            const cat = this.categories.find(c => String(c._id) === String(this.form.category));
            if (!cat) return false;
            const enName = this.getName('en', cat).toLowerCase();
            const thName = this.getName('th', cat).toLowerCase();
            return enName.includes('sculpture') || 
                   enName.includes('installation') || 
                   thName.includes('ประติมากรรม') || 
                   thName.includes('จัดวาง');
        },
        isPriceVisible() {
            if (!this.form.status.sale) return true;
            const status = this.saleStatuses.find(s => String(s._id) === String(this.form.status.sale));
            return status ? this.getName('en', status) === 'Available' : true;
        },
        isInitialTermLocked() {
            const lifecycle = this.artwork && this.artwork.postTermSale;
            return this.isEditMode
                && lifecycle
                && lifecycle.applicable
                && lifecycle.initialSaleEndsAt
                && new Date(lifecycle.initialSaleEndsAt).getTime() > Date.now();
        }
    },
    methods: {
        lockPageScroll(locked) {
            if (typeof document === 'undefined') return;
            if (locked) {
                if (this.previousBodyOverflow === null) {
                    this.previousBodyOverflow = document.body.style.overflow;
                    this.previousHtmlOverflow = document.documentElement.style.overflow;
                }
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
                return;
            }
            if (this.previousBodyOverflow !== null) {
                document.body.style.overflow = this.previousBodyOverflow;
                document.documentElement.style.overflow = this.previousHtmlOverflow || '';
                this.previousBodyOverflow = null;
                this.previousHtmlOverflow = null;
            }
        },
        handleCategorySelect(id) {
            this.$set(this.form, 'category', id);
        },
        handleSaleStatusSelect(id) {
            this.$set(this.form.status, 'sale', id);
        },
        async fetchInitialData() {
            try {
                // Fetch Users (Artists)
                this.$store.dispatch('user/get', {});

                // Fetch Categories
                const categories = await this.$store.dispatch('artwork/category', { method: 'get' });
                this.categories = categories || [];
                if (!this.isEditMode && this.categories.length > 0) this.form.category = this.categories[0]._id;

                // Fetch Statuses
                await this.$store.dispatch('setting/status/get');
                this.statuses = this.$store.getters['setting/status/item'] || [];
                
                // Set default statuses
                const defaultSale = this.saleStatuses.find(s => this.getName('en', s) === 'Available');
                if (defaultSale) this.form.status.sale = defaultSale._id;
                
                const defaultApproval = this.approvalStatuses.find(s => this.getName('en', s) === 'Pending');
                if (defaultApproval) this.form.status.approval = defaultApproval._id;
                
                if (this.initialArtistId) {
                    this.form.artist = this.initialArtistId;
                }

                if (this.isEditMode && this.artwork) {
                    this.populateForm(this.artwork);
                }

            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        },
        handleCategorySelect(id) {
            this.$set(this.form, 'category', id);
        },
        handleSaleStatusSelect(id) {
            this.$set(this.form.status, 'sale', id);
        },
        toggleArtistDropdown() {
            // Deprecated for Artist-facing modal
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
        getSaleStatusLabel(status) {
            const englishName = this.getName('en', status);
            if (this.$i18n.locale !== 'en' && englishName === 'Available') return 'พร้อมขาย';
            return this.getName(this.$i18n.locale === 'en' ? 'en' : 'th', status);
        },
        getUnitTH(unitEN) {
            const unit = this.unitOptions.find(u => u.en === unitEN);
            return unit ? unit.th : unitEN;
        },
        cleanPrice(price) {
            if (price === null || price === undefined) return '';
            return String(price).replace(/[^0-9.]/g, '');
        },
        populateForm(artwork) {
            const getVal = (field, language) => {
                if (!field) return '';
                if (typeof field === 'string') return field;
                if (!Array.isArray(field)) return '';
                const value = field.find(item => item.key === language);
                return value ? value.value : '';
            };

            const sizeEn = getVal(artwork.size, 'en');
            const sizeParts = sizeEn.split('x').map(part => part.trim());
            let width = '';
            let height = '';
            let depth = '';
            let unit = 'cm';

            if (sizeParts.length >= 2) {
                width = sizeParts[0].replace(/[^0-9.]/g, '');
                const finalPart = sizeParts[sizeParts.length - 1].split(/\s+/);
                unit = finalPart[1] || 'cm';
                if (sizeParts.length >= 3) {
                    height = sizeParts[1].replace(/[^0-9.]/g, '');
                    depth = finalPart[0].replace(/[^0-9.]/g, '');
                } else {
                    height = finalPart[0].replace(/[^0-9.]/g, '');
                }
            }

            this.form = {
                title: { en: getVal(artwork.title, 'en'), th: getVal(artwork.title, 'th') },
                artist: artwork.artist ? (artwork.artist._id || artwork.artist) : (this.initialArtistId || ''),
                category: artwork.category ? (artwork.category._id || artwork.category) : '',
                technique: { en: getVal(artwork.technique, 'en'), th: getVal(artwork.technique, 'th') },
                width,
                height,
                depth,
                unit,
                price: this.cleanPrice(artwork.price),
                description: { en: getVal(artwork.description, 'en'), th: getVal(artwork.description, 'th') },
                status: {
                    approval: artwork.status && artwork.status.approval
                        ? (artwork.status.approval._id || artwork.status.approval)
                        : '',
                    sale: artwork.status && artwork.status.sale
                        ? (artwork.status.sale._id || artwork.status.sale)
                        : ''
                },
                remark: { en: getVal(artwork.remark, 'en'), th: getVal(artwork.remark, 'th') },
                image: null
            };
            this.imagePreview = artwork.image || null;
            this.currentStep = 1;
        },
        handleSave() {
            if (!this.isFormValid) return;

            if (this.isEditMode) {
                const pendingStatus = this.approvalStatuses.find(status => this.getName('en', status) === 'Pending');
                if (pendingStatus) this.form.status.approval = pendingStatus._id;
            }
            
            // Reformat for API
            const payload = {
                ...(this.isEditMode && this.artwork ? { _id: this.artwork._id } : {}),
                title: [{ key: 'en', value: this.form.title.en }, { key: 'th', value: this.form.title.th }],
                description: [{ key: 'en', value: this.form.description.en }, { key: 'th', value: this.form.description.th }],
                artist: this.form.artist,
                category: this.form.category,
                technique: [{ key: 'en', value: this.form.technique.en }, { key: 'th', value: this.form.technique.th }],
                size: [
                    { 
                        key: 'en', 
                        value: this.is3D 
                            ? `${this.form.width} x ${this.form.height} x ${this.form.depth} ${this.form.unit}` 
                            : `${this.form.width} x ${this.form.height} ${this.form.unit}` 
                    },
                    { 
                        key: 'th', 
                        value: this.is3D 
                            ? `${this.form.width} x ${this.form.height} x ${this.form.depth} ${this.getUnitTH(this.form.unit)}` 
                            : `${this.form.width} x ${this.form.height} ${this.getUnitTH(this.form.unit)}` 
                    }
                ],
                price: this.isPriceVisible ? parseFloat(this.form.price) : 0,
                status: {
                    approval: this.form.status.approval,
                    sale: this.form.status.sale
                },
                remark: [{ key: 'en', value: this.form.remark.en }, { key: 'th', value: this.form.remark.th }],
                _image: this.form.image
            };

            this.$emit('save', payload);
            // resetForm is now handled by the watch:show for a better UX (prevents clearing on error)
        },
        resetForm() {
            if (this.isEditMode && this.artwork) {
                this.populateForm(this.artwork);
                return;
            }
            const defaultSale = this.saleStatuses.find(s => this.getName('en', s) === 'Available');
            const defaultApproval = this.approvalStatuses.find(s => this.getName('en', s) === 'Pending');

            this.form = {
                title: { en: '', th: '' },
                artist: this.initialArtistId || '',
                category: this.categories.length > 0 ? this.categories[0]._id : '',
                technique: { en: '', th: '' },
                width: '',
                height: '',
                depth: '',
                unit: 'cm',
                price: '',
                description: { en: '', th: '' },
                status: {
                    approval: defaultApproval ? defaultApproval._id : '',
                    sale: defaultSale ? defaultSale._id : ''
                },
                remark: { en: '', th: '' },
                image: null
            };
            this.imagePreview = null;
            this.currentStep = 1;
        },
        formatPrice(value) {
            if (!value) return '0.00';
            return parseFloat(value).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    },
    watch: {
        artwork: {
            immediate: true,
            handler(value) {
                if (this.isEditMode && value) this.populateForm(value);
            }
        },
        show(newVal) {
            if (newVal) {
                this.resetForm();
                this.lockPageScroll(true);
                // We don't necessarily need to fetchInitialData every time
                // since it's already in created(), but resetting the form
                // ensures a clean state for the "Add New" action.
            } else {
                this.lockPageScroll(false);
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

.custom-input ::v-deep .form-control::placeholder,
.custom-textarea ::v-deep .form-control::placeholder {
    color: #94a3b8;
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
    transition: all 0.2s ease !important;
}

.custom-input-with-prefix ::v-deep .form-control:focus {
    background-color: #ffffff !important;
    border-color: #3b82f633 !important;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05) !important;
}

.dimension-prefix {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 700;
    color: #94a3b8;
    font-size: 0.7rem;
    z-index: 10;
}

.custom-input-with-prefix ::v-deep .form-control {
    padding-left: 2.2rem !important;
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
    display: flex;
    max-height: calc(100vh - 2rem);
    overflow: hidden;
    border-radius: 20px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

::v-deep .modal-header {
    flex: 0 0 auto;
    border-bottom: 1px solid #f1f5f9;
    padding: 1.15rem 2rem;
}

::v-deep .modal-footer {
    flex: 0 0 auto;
    border-top: 1px solid #f1f5f9;
    padding: 0.85rem 2.5rem;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(10px);
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
    background-color: #8c1515 !important;
    border-color: #8c1515 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    font-size: 1rem;
    box-shadow: 0 10px 15px -3px rgba(140, 21, 21, 0.2);
}

.btn-create-artwork:hover:not(:disabled) {
    background-color: #701111 !important;
    transform: translateY(-1px);
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

/* Two-step wizard */
.wizard-panel {
    padding: 0.75rem 0 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
}

.step-heading {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f2e8e5;
}

.step-heading > span {
    color: #b7791f;
    font-family: var(--app-font-family);
    font-size: 1.35rem;
    font-weight: 700;
}

.step-heading h6 {
    margin: 0;
    color: #27364a;
    font-size: 1rem;
    font-weight: 800;
}

.step-heading p {
    margin: 0.2rem 0 0;
    color: #94a3b8;
    font-size: 0.75rem;
}

.btn-back {
    color: #64748b !important;
    font-weight: 700;
}

.btn-back:hover {
    color: #8c1515 !important;
    background: rgba(140, 21, 21, 0.05) !important;
}

::v-deep .modal-body {
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
    padding: 1rem 2rem;
}

::v-deep .modal-dialog {
    width: calc(100% - 2rem);
    max-width: 1100px;
    min-height: calc(100% - 2rem);
    margin: 1rem auto;
}

.wizard-body {
    min-height: 0;
}

.wizard-content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.75fr) minmax(280px, 0.85fr);
    gap: 2rem;
    align-items: start;
}

.wizard-form-column {
    min-width: 0;
}

.wizard-image-column {
    position: sticky;
    top: 0;
    min-width: 0;
    padding: 0.75rem 0 0 2rem;
    border-left: 1px solid #eee7e4;
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
    flex: 0 0 2.25rem;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 10px;
    background: rgba(140, 21, 21, 0.07);
    color: #8c1515;
}

.image-column-heading h6 {
    margin: 0;
    color: #27364a;
    font-size: 0.95rem;
    font-weight: 800;
}

.image-column-heading p {
    margin: 0.2rem 0 0;
    color: #94a3b8;
    font-size: 0.72rem;
    line-height: 1.45;
}

.image-upload-panel {
    width: 100%;
    min-height: 0;
    aspect-ratio: 1 / 1;
    border-color: #d9c6c0;
    background: linear-gradient(145deg, #fffdfb, #f8f5f3);
}

.image-upload-panel .file-upload-label,
.image-upload-panel .upload-placeholder,
.image-upload-panel .preview-container {
    width: 100%;
    height: 100%;
    min-height: 0;
}

.image-upload-panel .upload-placeholder {
    justify-content: center;
    gap: 0.35rem;
    padding: 2rem 1rem;
}

.upload-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    margin-bottom: 0.75rem;
    border-radius: 50%;
    background: #fff;
    color: #8c1515;
    box-shadow: 0 10px 25px rgba(140, 21, 21, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-upload-panel:hover .upload-icon {
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(140, 21, 21, 0.16);
}

.upload-limit {
    margin-top: 0.5rem;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    background: rgba(183, 121, 31, 0.09);
    color: #9a681d;
    font-size: 0.68rem;
    font-weight: 700;
}

.image-upload-panel .upload-preview {
    object-fit: contain;
    padding: 0.5rem;
}

.sale-settings-under-image {
    margin-top: 1.1rem;
    padding-top: 1.1rem;
    border-top: 1px solid #eee7e4;
}

.sale-settings-under-image .form-group-custom {
    margin-bottom: 1rem;
}

.sale-settings-under-image .custom-select-btn,
.sale-settings-under-image .custom-input-with-prefix ::v-deep .form-control {
    background-color: #ffffff !important;
    border-color: #e9e1de !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.image-tip {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin-top: 0.85rem;
    color: #7c6f69;
    font-size: 0.7rem;
    line-height: 1.45;
}

.image-tip svg {
    flex: 0 0 auto;
    margin-top: 0.1rem;
    color: #b7791f;
}

@media (max-width: 767.98px) {
    ::v-deep .modal-dialog {
        margin: 0.75rem;
    }

    ::v-deep .modal-header,
    ::v-deep .modal-footer,
    ::v-deep .modal-body {
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .icon-square {
        width: 44px;
        height: 44px;
        flex: 0 0 44px;
    }

    .modal-title {
        font-size: 1rem;
    }

    .wizard-panel {
        padding: 0.75rem 0 0.15rem;
    }

    .wizard-content-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }

    .wizard-image-column {
        position: static;
        padding: 1.25rem 0 0;
        border-top: 1px solid #eee7e4;
        border-left: 0;
    }

    .wizard-footer {
        align-items: stretch !important;
        gap: 0.5rem;
    }

    .wizard-actions {
        justify-content: flex-end;
    }

    .btn-create-artwork {
        padding: 0.7rem 1.15rem !important;
    }
}

@media (max-width: 480px) {
    .wizard-footer {
        flex-direction: column-reverse;
    }

    .wizard-actions {
        width: 100%;
    }

    .wizard-actions .btn-create-artwork {
        flex: 1;
    }

}
</style>
