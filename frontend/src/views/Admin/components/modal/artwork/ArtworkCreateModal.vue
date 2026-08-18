<template>
    <CModal 
        :title="$i18n.locale === 'en' ? 'Add New Artwork' : 'เพิ่มผลงานศิลปะชิ้นใหม่'" 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="create-artwork-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-paint" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Add New Artwork' : 'เพิ่มผลงานศิลปะชิ้นใหม่' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Complete 2 short steps to add your artwork.' : 'กรอกข้อมูล 2 ขั้นตอนสั้น ๆ เพื่อเพิ่มผลงาน' }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="wizard-body px-3 py-2">
            <div class="wizard-content-grid">
                <div class="wizard-form-column">
                    <div class="wizard-panel">
                        <div class="step-heading">
                            <span>{{ currentStep === 1 ? '01' : '02' }}</span>
                            <div>
                                <h6>{{ currentStep === 1
                                    ? ($i18n.locale === 'en' ? 'Artwork details in Thai' : 'ข้อมูลเบื้องต้นของผลงาน')
                                    : ($i18n.locale === 'en' ? 'Artwork details in English' : 'ข้อมูลผลงานภาษาอังกฤษ') }}</h6>
                                <p>{{ currentStep === 1
                                    ? ($i18n.locale === 'en' ? 'Enter the Thai reference information first.' : 'กรอกข้อมูลอ้างอิงภาษาไทยก่อน')
                                    : ($i18n.locale === 'en' ? 'Add the English information before saving.' : 'กรอกข้อมูลภาษาอังกฤษก่อนบันทึกผลงาน') }}</p>
                            </div>
                        </div>

            <!-- Row 1: Titles -->
            <CRow>
                <CCol md="12" v-show="currentStep === 1">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Title (TH)' : 'ชื่อภาษาไทย (TH)' }}</label>
                        <CInput 
                            v-model="form.title.th" 
                            :placeholder="$i18n.locale === 'en' ? 'Thai Title' : 'ชื่อภาษาไทย'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="12" v-show="currentStep === 2">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Title (EN)' : 'ชื่อภาษาอังกฤษ (EN)' }}</label>
                        <CInput 
                            v-model="form.title.en" 
                            :placeholder="$i18n.locale === 'en' ? 'English Title' : 'ชื่อภาษาอังกฤษ'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Row 2: Artist -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Artist Name' : 'ชื่อศิลปิน' }}</label>
                        <div class="searchable-dropdown">
                            <div class="search-input-wrapper position-relative">
                                <CIcon name="cil-user" class="input-icon-left" />
                                <CInput 
                                    v-model="artistSearchQuery" 
                                    :placeholder="$i18n.locale === 'en' ? 'Search or select artist...' : 'ค้นหาหรือเลือกศิลปิน...'" 
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
                                    {{ $i18n.locale === 'en' ? 'No artists found' : 'ไม่พบศิลปิน' }}
                                </div>
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
                                    {{ getName($i18n.locale, cat) }}
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </div>
                </CCol>
            </CRow>

            <!-- Row 4: Technique -->
            <CRow>
                <CCol md="12" v-show="currentStep === 1">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Technique (TH)' : 'เทคนิคภาษาไทย (TH)' }}</label>
                        <CInput 
                            v-model="form.technique.th" 
                            :placeholder="$i18n.locale === 'en' ? 'e.g. Oil on Canvas' : 'เช่น สีน้ำมันบนผ้าใบ'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="12" v-show="currentStep === 2">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Technique (EN)' : 'เทคนิคภาษาอังกฤษ (EN)' }}</label>
                        <CInput 
                            v-model="form.technique.en" 
                            :placeholder="$i18n.locale === 'en' ? 'e.g. Oil on Canvas' : 'เช่น Oil on Canvas'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Row 5: Size -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Dimensions (' + (is3D ? 'Width x Length x Height' : 'Width x Length') + ')' : 'ขนาด (' + (is3D ? 'กว้าง x ยาว x สูง' : 'กว้าง x ยาว') + ')' }}</label>
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1">
                                <div class="input-group-custom">
                                    <span class="dimension-prefix">W</span>
                                    <CInput 
                                        type="number"
                                        v-model="form.width" 
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
                                        v-model="form.height" 
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
                                            v-model="form.depth" 
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
                                            <span class="text-dark">{{ getUnitLabel(form.unit) }}</span>
                                            <CIcon name="cil-chevron-bottom" class="dropdown-icon ml-1" />
                                        </CButton>
                                    </template>
                                    <CDropdownMenu class="border-0 shadow-lg mt-2">
                                        <CDropdownItem v-for="u in unitOptions" :key="u.en" @click="form.unit = u.en">
                                            {{ u.en }} ({{ u.th }})
                                        </CDropdownItem>
                                    </CDropdownMenu>
                                </CDropdown>
                            </div>
                        </div>
                    </div>
                </CCol>
            </CRow>

            <!-- Row 6: Remark -->
            <CRow>
                <CCol md="12" v-show="currentStep === 1">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Remark (TH)' : 'หมายเหตุภาษาไทย (TH)' }}</label>
                        <CInput 
                            v-model="form.remark.th" 
                            :placeholder="$i18n.locale === 'en' ? 'Additional notes in Thai...' : 'หมายเหตุเพิ่มเติม (ภาษาไทย)...'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="12" v-show="currentStep === 2">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Remark (EN)' : 'หมายเหตุภาษาอังกฤษ (EN)' }}</label>
                        <CInput 
                            v-model="form.remark.en" 
                            :placeholder="$i18n.locale === 'en' ? 'Additional notes in English...' : 'หมายเหตุเพิ่มเติมภาษาอังกฤษ...'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Row 7: Sale Status & Price -->
            <div class="artwork-description-grid">
            <!-- Row 8: Description (TH) -->
            <CRow v-show="currentStep === 1">
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Description (TH)' : 'คำอธิบายภาษาไทย (TH)' }}</label>
                        <CTextarea 
                            v-model="form.description.th" 
                            :placeholder="$i18n.locale === 'en' ? 'Thai description...' : 'รายละเอียดภาษาไทย...'" 
                            rows="4"
                            class="custom-textarea"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Row 9: Description (EN) -->
            <CRow v-show="currentStep === 2">
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Description (EN)' : 'คำอธิบายภาษาอังกฤษ (EN)' }}</label>
                        <CTextarea 
                            v-model="form.description.en" 
                            :placeholder="$i18n.locale === 'en' ? 'English description...' : 'คำอธิบายภาษาอังกฤษ...'" 
                            rows="4"
                            class="custom-textarea"
                        />
                    </div>
                </CCol>
            </CRow>
            </div>
                    </div>
                </div>

                <aside class="wizard-image-column">
                    <div class="image-column-heading">
                        <span><CIcon name="cil-image1" size="lg" /></span>
                        <div>
                            <h6>{{ $i18n.locale === 'en' ? 'Artwork Image *' : 'รูปภาพผลงาน *' }}</h6>
                            <p>{{ $i18n.locale === 'en' ? 'Upload the main image displayed on the website.' : 'อัปโหลดรูปหลักที่จะแสดงบนเว็บไซต์' }}</p>
                        </div>
                    </div>

                    <div class="sale-settings-under-image">
            <CRow>
                <CCol :md="selectedSaleStatusName === 'Available' || selectedSaleStatusName === 'พร้อมขาย' ? '6' : '12'">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Sale Status' : 'สถานะการขาย' }}</label>
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
                                    {{ getName($i18n.locale, status) }}
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </div>
                </CCol>
                <CCol md="6" v-if="selectedSaleStatusName === 'Available' || selectedSaleStatusName === 'พร้อมขาย'">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Price' : 'ราคา' }}</label>
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
                    </div>

                    <!-- Storage and exact university location -->
                    <CRow class="storage-location-row">
                        <CCol :md="isUniversityStorageSelected ? '6' : '12'">
                            <div class="form-group-custom">
                                <label class="form-label">{{ $i18n.locale === 'en' ? 'Storage location' : 'สถานที่จัดเก็บ' }}</label>
                                <CDropdown :key="form.storage" :caret="false" class="w-100">
                                    <template #toggler>
                                        <CButton class="custom-select-btn">
                                            <span class="text-dark">{{ selectedStorageName }}</span>
                                            <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                                        </CButton>
                                    </template>
                                    <CDropdownMenu class="w-100 border-0 shadow-lg mt-2">
                                        <CDropdownItem
                                            v-for="storage in storages"
                                            :key="storage._id"
                                            @click="handleStorageSelect(storage._id)"
                                        >
                                            {{ getName($i18n.locale, storage) || getName('en', storage) }}
                                        </CDropdownItem>
                                    </CDropdownMenu>
                                </CDropdown>
                            </div>
                        </CCol>
                        <CCol v-if="isUniversityStorageSelected" md="6">
                            <div class="form-group-custom">
                                <label class="form-label">{{ $i18n.locale === 'en' ? 'Exact location at university *' : 'ตำแหน่งจัดเก็บจริงในมหาวิทยาลัย *' }}</label>
                                <CInput
                                    v-model="form.storageDetail"
                                    :placeholder="$i18n.locale === 'en' ? 'Building, room, shelf...' : 'เช่น อาคาร ห้อง ชั้นวาง...'"
                                    class="custom-input mb-0"
                                />
                            </div>
                        </CCol>
                    </CRow>

            <!-- Row 7: Artwork Image -->
                    <div class="image-upload-block">
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Artwork Image' : 'ภาพผลงานศิลปะ' }}</label>
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
                                        <div class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Click to upload image' : 'คลิกเพื่ออัปโหลดรูปภาพ' }}</div>
                                        <div class="text-muted small">{{ $i18n.locale === 'en' ? 'PNG, JPG or JPEG (Max 5MB)' : 'ไฟล์ PNG, JPG หรือ JPEG (ไม่เกิน 5MB)' }}</div>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="preview-container position-relative">
                                        <img :src="imagePreview" class="upload-preview" />
                                        <div class="preview-overlay">
                                            <div class="overlay-content">
                                                <CIcon name="cil-pencil" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Change Image' : 'เปลี่ยนรูปภาพ' }}
                                            </div>
                                        </div>
                                        <!-- Remove Button -->
                                        <button 
                                            type="button" 
                                            class="btn-remove-image shadow-sm" 
                                            @click.stop.prevent="removeImage"
                                            :title="$i18n.locale === 'en' ? 'Remove image' : 'ลบรูปภาพ'"
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

                    </div>
                    <div class="image-tip">
                        <CIcon name="cil-lightbulb" />
                        <span>{{ $i18n.locale === 'en' ? 'Use a clear image with enough light and show the whole artwork.' : 'ควรใช้ภาพคมชัด แสงเพียงพอ และเห็นผลงานครบทั้งชิ้น' }}</span>
                    </div>
                </aside>

            </div>
        </div>

        <template #footer>
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
                    :disabled="!isFormValid || saving"
                >
                    <CSpinner v-if="saving" size="sm" class="mr-2" />
                    {{ saving ? ($i18n.locale === 'en' ? 'Creating...' : 'กำลังสร้าง...') : ($i18n.locale === 'en' ? 'Create Artwork' : 'สร้างผลงาน') }}
                </CButton>
                </div>
            </div>
        </template>
    </CModal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'ArtworkCreateModal',
    components: {
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        saving: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            currentStep: 1,
            categories: [],
            storages: [],
            statuses: [],
            imagePreview: null,
            artistSearchQuery: '',
            showArtistDropdown: false,
            form: {
                title: { en: '', th: '' },
                artist: '',
                category: '',
                storage: '',
                storageDetail: '',
                technique: { en: '', th: '' },
                size: { en: '', th: '' },
                width: '',
                height: '',
                depth: '',
                unit: 'cm',
                price: '',
                description: { en: '', th: '' },
                status: {
                    approval: '',
                    sale: ''
                },
                remark: { en: '', th: '' },
                image: null
            },
            unitOptions: [
                { en: 'cm', th: 'ชม.' },
                { en: 'm', th: 'ม.' },
                { en: 'inch', th: 'นิ้ว' },
                { en: 'mm', th: 'มม.' }
            ]
        }
    },
    async created() {
        this.fetchInitialData();
    },
    computed: {
        ...mapGetters({
            allUsers: 'user/user'
        }),
        isStepOneValid() {
            const dimensionsValid = this.form.width !== '' &&
                                    this.form.height !== '' &&
                                    (!this.is3D || this.form.depth !== '');
            return this.form.title.th.trim() !== '' &&
                   this.form.artist !== '' &&
                   this.form.category !== '' &&
                   dimensionsValid;
        },
        isFormValid() {
            return (this.form.title.en.trim() !== '' || this.form.title.th.trim() !== '') && 
                   this.form.artist !== '' && 
                   this.form.width !== '' &&
                   this.form.height !== '' &&
                   this.form.price !== '' && 
                   this.imagePreview !== null &&
                   (!this.isUniversityStorageSelected || this.form.storageDetail.trim() !== '');
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
            const cat = this.categories.find(c => String(c._id) === String(this.form.category));
            return cat ? this.getName(this.$i18n.locale, cat) : (this.$i18n.locale === 'en' ? 'Select Category' : 'เลือกหมวดหมู่');
        },
        selectedStorageName() {
            const storage = this.storages.find(s => String(s._id) === String(this.form.storage));
            return storage
                ? (this.getName(this.$i18n.locale, storage) || this.getName('en', storage))
                : (this.$i18n.locale === 'en' ? 'Select storage' : 'เลือกสถานที่จัดเก็บ');
        },
        isUniversityStorageSelected() {
            const storage = this.storages.find(s => String(s._id) === String(this.form.storage));
            if (!storage) return false;
            const name = `${this.getName('en', storage)} ${this.getName('th', storage)}`.toLowerCase();
            return name.includes('university') || name.includes('mfu') || name.includes('มหาวิทยาลัย');
        },
        selectedSaleStatusName() {
            const status = this.saleStatuses.find(s => String(s._id) === String(this.form.status.sale));
            return status ? this.getName(this.$i18n.locale, status) : (this.$i18n.locale === 'en' ? 'Select Status' : 'เลือกสถานะการขาย');
        },
        selectedApprovalStatusName() {
            const status = this.statuses.find(s => s._id === this.form.status.approval);
            return status ? this.getName(this.$i18n.locale, status) : (this.$i18n.locale === 'en' ? 'Select Approval Status' : 'เลือกสถานะการอนุมัติ');
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
        }
    },
    methods: {
        getUnitLabel(unit) {
            const u = this.unitOptions.find(opt => opt.en === unit);
            return u ? (this.$i18n.locale === 'en' ? u.en : u.th) : (this.$i18n.locale === 'en' ? 'Unit' : 'หน่วย');
        },
        handleCategorySelect(id) {
            this.$set(this.form, 'category', id);
        },
        handleStorageSelect(id) {
            this.$set(this.form, 'storage', id);
            if (!this.isUniversityStorageSelected) this.$set(this.form, 'storageDetail', '');
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
                if (this.categories.length > 0) this.form.category = this.categories[0]._id;

                await this.$store.dispatch('setting/storage/get', {});
                this.storages = this.$store.getters['setting/storage/item'] || [];

                // Fetch Statuses
                await this.$store.dispatch('setting/status/get');
                this.statuses = this.$store.getters['setting/status/item'] || [];
                console.log('--- Artwork Statuses ---', this.statuses);
                
                // Set default statuses
                const defaultSale = this.saleStatuses.find(s => this.getName('en', s) === 'Available');
                if (defaultSale) this.form.status.sale = defaultSale._id;
                
                const defaultApproval = this.approvalStatuses.find(s => this.getName('en', s) === 'Pending');
                if (defaultApproval) this.form.status.approval = defaultApproval._id;

            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        },
        async handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.match('image.*')) {
                alert(this.$i18n.locale === 'en' ? 'Please select an image file' : 'กรุณาเลือกไฟล์รูปภาพ');
                return;
            }

            // Create temporary object URL for instant preview to user
            if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(this.imagePreview);
            }
            this.imagePreview = URL.createObjectURL(file);

            // Show loading state if needed or just process
            try {
                const compressedFile = await this.compressImage(file);
                this.form.image = compressedFile;
            } catch (error) {
                console.error('Compression error:', error);
                alert(this.$i18n.locale === 'en' ? 'Failed to process image. Please try another file.' : 'ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใช้ไฟล์อื่น');
            }
        },
        compressImage(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // Max resolution 2048px
                        const maxDim = 2048;
                        if (width > maxDim || height > maxDim) {
                            if (width > height) {
                                height = Math.round((height * maxDim) / width);
                                width = maxDim;
                            } else {
                                width = Math.round((width * maxDim) / height);
                                height = maxDim;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        // Compression quality logic
                        let quality = 0.9;
                        const mimeType = 'image/jpeg';
                        
                        const getBlob = (q) => {
                            return new Promise((res) => {
                                canvas.toBlob((blob) => {
                                    res(blob);
                                }, mimeType, q);
                            });
                        };

                        // Recursive check for size < 3MB
                        const checkAndResolve = async (q) => {
                            const blob = await getBlob(q);
                            if (blob.size > 3 * 1024 * 1024 && q > 0.1) {
                                return checkAndResolve(q - 0.1);
                            } else {
                                // Convert blob back to file
                                const compressedFile = new File([blob], file.name, {
                                    type: mimeType,
                                    lastModified: Date.now()
                                });
                                resolve(compressedFile);
                            }
                        };

                        checkAndResolve(quality);
                    };
                    img.onerror = reject;
                };
                reader.onerror = reject;
            });
        },
        handleArtistSearch() {
            this.showArtistDropdown = true;
            // Clear current artist ID if searching again, or keep it until selection
            // We set it when they click selectArtist
        },
        handleArtistBlur() {
            // Slight timeout to allow the click on the result item to register
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
        getUnitTH(unitEN) {
            const unit = this.unitOptions.find(u => u.en === unitEN);
            return unit ? unit.th : unitEN;
        },
        handleSave() {
            if (!this.isFormValid) return;
            
            // Reformat for API
            const payload = {
                title: [
                    { key: 'en', value: this.form.title.en }, 
                    { key: 'th', value: this.form.title.th }
                ],
                description: [
                    { key: 'en', value: this.form.description.en }, 
                    { key: 'th', value: this.form.description.th }
                ],
                artist: this.form.artist,
                category: this.form.category,
                technique: [
                    { key: 'en', value: this.form.technique.en }, 
                    { key: 'th', value: this.form.technique.th }
                ],
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
                price: parseFloat(this.form.price),
                status: {
                    approval: this.form.status.approval,
                    sale: this.form.status.sale
                },
                storage: this.form.storage || null,
                storageDetail: this.isUniversityStorageSelected ? this.form.storageDetail.trim() : '',
                remark: [{ key: 'en', value: this.form.remark.en }, { key: 'th', value: this.form.remark.th }],
                _image: this.form.image
            };

            this.$emit('save', payload);
            this.resetForm();
        },
        resetForm() {
            const defaultSale = this.saleStatuses.find(s => this.getName('en', s) === 'Available');
            const defaultApproval = this.approvalStatuses.find(s => this.getName('en', s) === 'Pending');

            this.form = {
                title: { en: '', th: '' },
                artist: '',
                category: this.categories.length > 0 ? this.categories[0]._id : '',
                storage: '',
                storageDetail: '',
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
            this.artistSearchQuery = '';
            this.showArtistDropdown = false;
            this.currentStep = 1;
        },
        removeImage() {
            if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(this.imagePreview);
            }
            this.form.image = null;
            this.imagePreview = null;
            // Clear the file input so the same file can be selected again
            const input = document.getElementById('artwork-image-upload');
            if (input) input.value = '';
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
        show(newValue) {
            if (newValue) this.currentStep = 1;
        }
    }
}
</script>

<style scoped>
/* ... (existing styles) */
.btn-remove-image {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
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

.btn-remove-image:hover {
    background-color: #dc2626;
    transform: scale(1.1);
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

/* Learner artwork form layout, kept presentation-only for the Admin modal. */
::v-deep .modal-dialog {
    width: calc(100% - 2rem);
    max-width: 1100px;
    min-height: calc(100% - 2rem);
    margin: 1rem auto;
}

::v-deep .modal-content {
    max-height: calc(100vh - 2rem);
    display: flex;
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
    font-family: Georgia, serif;
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

.wizard-image-column {
    position: sticky;
    top: 0;
    min-width: 0;
    padding: 0.75rem 0 0 2rem;
    border-left: 1px solid #e8edf5;
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

.wizard-image-column > .image-upload-block {
    order: 1;
}

.wizard-image-column > .sale-settings-under-image {
    order: 2;
}

.wizard-image-column > .storage-location-row {
    order: 3;
}

.wizard-image-column > .image-tip {
    order: 4;
}

.wizard-image-column {
    display: flex;
    flex-direction: column;
}

.image-upload-block .form-group-custom {
    margin-bottom: 0;
}

.image-upload-block .form-label {
    display: none;
}

.image-upload-block .file-upload-container {
    width: 100%;
    aspect-ratio: 1 / 1;
    border: 2px dashed #d9e0eb;
    border-radius: 1.25rem;
    background: linear-gradient(145deg, #fbfcff, #f6f8fc);
}

.image-upload-block .file-upload-label,
.image-upload-block .upload-placeholder,
.image-upload-block .preview-container {
    width: 100%;
    height: 100%;
}

.image-upload-block .upload-placeholder {
    justify-content: center;
    gap: 0.45rem;
    padding: 1rem;
    color: #52627a;
}

.image-upload-block .upload-placeholder .text-muted {
    color: #94a3b8 !important;
}

.image-upload-block .text-blue {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    margin: 0 auto 0.5rem !important;
    border-radius: 50%;
    background: #ffffff;
    color: #6d8ff0;
    box-shadow: 0 12px 25px rgba(104, 132, 205, 0.15);
}

.image-upload-block .preview-container {
    height: 100%;
}

.image-upload-block .upload-preview {
    padding: 0.5rem;
    object-fit: contain;
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

.sale-settings-under-image .form-group-custom {
    margin-bottom: 1rem;
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

.storage-location-row .form-group-custom {
    margin-bottom: 1rem;
}

.storage-location-row .custom-select-btn,
.storage-location-row .custom-input ::v-deep .form-control {
    background: #ffffff !important;
    border-color: #e8edf5 !important;
}

.sale-settings-under-image .custom-select-btn,
.sale-settings-under-image .custom-input-with-prefix ::v-deep .form-control {
    background: #ffffff !important;
    border-color: #e8edf5 !important;
}

.image-tip {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    margin-top: 1rem;
    padding: 0.25rem 0 0.75rem;
    color: #64748b;
    font-size: 0.8rem;
    line-height: 1.5;
}

.image-tip ::v-deep svg,
.image-tip > svg {
    flex: 0 0 auto;
    margin-top: 0.1rem;
    color: #d39a3b;
}

.artwork-description-grid {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
}

.artwork-description-grid .form-group-custom {
    margin-bottom: 1.25rem;
}

.wizard-footer {
    gap: 1rem;
}

.wizard-actions {
    gap: 0.25rem;
}

.btn-back {
    color: #6d8ff0 !important;
    font-weight: 600;
    font-size: 1rem;
}

.btn-back:hover {
    background: #eef3ff !important;
}

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
        align-items: stretch !important;
        flex-direction: column;
    }

    .wizard-footer .btn-cancel {
        align-self: flex-start;
    }

    .wizard-actions {
        justify-content: flex-end;
    }
}
</style>
