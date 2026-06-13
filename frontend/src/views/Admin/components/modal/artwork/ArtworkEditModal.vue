<template>
    <CModal 
        :title="$i18n.locale === 'en' ? 'Edit Artwork' : 'แก้ไขผลงานศิลปะ'" 
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
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Edit Artwork' : 'แก้ไขผลงานศิลปะ' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Modify the details of this artwork.' : 'แก้ไขรายละเอียดข้อมูลสำหรับผลงานศิลปะชิ้นนี้' }}</p>
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
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Title (EN)' : 'ชื่อภาษาอังกฤษ (EN)' }}</label>
                        <CInput 
                            v-model="form.title.en" 
                            :placeholder="$i18n.locale === 'en' ? 'English Title' : 'ชื่อภาษาอังกฤษ'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Title (TH)' : 'ชื่อภาษาไทย (TH)' }}</label>
                        <CInput 
                            v-model="form.title.th" 
                            :placeholder="$i18n.locale === 'en' ? 'Thai Title' : 'ชื่อภาษาไทย'" 
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
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Technique (EN)' : 'เทคนิคภาษาอังกฤษ (EN)' }}</label>
                        <CInput 
                            v-model="form.technique.en" 
                            :placeholder="$i18n.locale === 'en' ? 'e.g. Oil on Canvas' : 'เช่น Oil on Canvas'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Technique (TH)' : 'เทคนิคภาษาไทย (TH)' }}</label>
                        <CInput 
                            v-model="form.technique.th" 
                            :placeholder="$i18n.locale === 'en' ? 'e.g. Oil on Canvas' : 'เช่น สีน้ำมันบนผ้าใบ'" 
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
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Remark (EN)' : 'หมายเหตุภาษาอังกฤษ (EN)' }}</label>
                        <CInput 
                            v-model="form.remark.en" 
                            :placeholder="$i18n.locale === 'en' ? 'Additional notes in English...' : 'หมายเหตุเพิ่มเติมภาษาอังกฤษ...'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Remark (TH)' : 'หมายเหตุภาษาไทย (TH)' }}</label>
                        <CInput 
                            v-model="form.remark.th" 
                            :placeholder="$i18n.locale === 'en' ? 'Additional notes in Thai...' : 'หมายเหตุเพิ่มเติม (ภาษาไทย)...'" 
                            class="custom-input mb-0"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Row 6: Sale Status & Price -->
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

            <!-- Row 7: Artwork Image -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Artwork Image' : 'ภาพผลงานศิลปะ' }}</label>
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

            <!-- Row 8: Description (EN) -->
            <CRow>
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

            <!-- Row 9: Description (TH) -->
            <CRow>
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
                    variant="ghost" 
                    @click="handlePreview"
                    class="btn-preview mr-3"
                >
                    {{ $i18n.locale === 'en' ? 'Preview Mode' : 'ดูตัวอย่าง' }}
                </CButton>
                <CButton 
                    color="primary" 
                    @click="handleSave"
                    class="btn-save-artwork"
                    :disabled="!isFormValid"
                >
                    {{ $i18n.locale === 'en' ? 'Save Changes' : 'บันทึกการเปลี่ยนแปลง' }}
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
            artistSearchQuery: '',
            showArtistDropdown: false,
            form: {
                id: null,
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
            return (this.form.title.en.trim() !== '' || this.form.title.th.trim() !== '') && 
                   this.form.artist !== '' && 
                   this.form.width !== '' &&
                   this.form.height !== '' &&
                   this.form.price !== '';
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
        handleSaleStatusSelect(id) {
            this.$set(this.form.status, 'sale', id);
        },
        async fetchInitialData() {
            try {
                this.$store.dispatch('user/get', {});

                const categories = await this.$store.dispatch('artwork/category', { method: 'get' });
                this.categories = categories || [];

                await this.$store.dispatch('setting/status/get');
                this.statuses = this.$store.getters['setting/status/item'] || [];
                
                if (this.artwork) {
                    this.populateForm(this.artwork);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        },
        populateForm(artwork) {
            this.form = {
                id: artwork._id,
                title: {
                    en: this.getName('en', artwork),
                    th: this.getName('th', artwork)
                },
                artist: artwork.artist ? artwork.artist._id : '',
                category: artwork.category ? artwork.category._id : '',
                technique: {
                    en: this.getName('en', { title: artwork.technique }),
                    th: this.getName('th', { title: artwork.technique })
                },
                size: {
                    en: this.getName('en', { title: artwork.size }),
                    th: this.getName('th', { title: artwork.size })
                },
                price: this.cleanPrice(artwork.price),
                description: {
                    en: this.getName('en', { title: artwork.description }),
                    th: this.getName('th', { title: artwork.description })
                },
                status: {
                    approval: artwork.status?.approval?._id || '',
                    sale: artwork.status?.sale?._id || ''
                },
                remark: {
                    en: this.getName('en', { title: artwork.remark }),
                    th: this.getName('th', { title: artwork.remark })
                },
                image: null
            };

            // Parse size string with regex-based parsing to support non-standard separator characters
            const sizeEn = this.getName('en', { title: artwork.size }) || '';
            const normalizedSize = sizeEn.replace(/×/g, 'x').replace(/X/g, 'x');
            const matches = normalizedSize.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)(?:\s*x\s*(\d+(?:\.\d+)?))?/i);
            
            if (matches) {
                this.form.width = matches[1];
                this.form.height = matches[2];
                this.form.depth = matches[3] || '';
                
                // Extract unit from the string
                const unitMatch = normalizedSize.match(/(cm|m|inch|mm|ชม\.|ม\.|นิ้ว|มม\.)/i);
                let unit = 'cm';
                if (unitMatch) {
                    const u = unitMatch[0].toLowerCase();
                    if (u === 'cm' || u === 'ชม.') unit = 'cm';
                    else if (u === 'm' || u === 'ม.') unit = 'm';
                    else if (u === 'inch' || u === 'นิ้ว') unit = 'inch';
                    else if (u === 'mm' || u === 'มม.') unit = 'mm';
                }
                this.form.unit = unit;
            } else {
                this.form.width = '';
                this.form.height = '';
                this.form.depth = '';
                this.form.unit = 'cm';
            }

            this.artistSearchQuery = artwork.artist ? this.getArtistDisplay(artwork.artist) : '';
            this.imagePreview = artwork.image || null;
        },
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;
            
            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            
            if (Array.isArray(titleField)) {
                const nameObj = titleField.find(n => n.key === lang);
                return nameObj ? nameObj.value : '';
            }
            return '';
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
        async handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.match('image.*')) {
                alert(this.$i18n.locale === 'en' ? 'Please select an image file' : 'กรุณาเลือกไฟล์รูปภาพ');
                return;
            }

            try {
                const compressedFile = await this.compressImage(file);
                this.form.image = compressedFile;

                const reader = new FileReader();
                reader.onload = (e) => {
                    this.imagePreview = e.target.result;
                };
                reader.readAsDataURL(compressedFile);
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

                        let quality = 0.9;
                        const mimeType = 'image/jpeg';
                        
                        const getBlob = (q) => {
                            return new Promise((res) => {
                                canvas.toBlob((blob) => {
                                    res(blob);
                                }, mimeType, q);
                            });
                        };

                        const checkAndResolve = async (q) => {
                            const blob = await getBlob(q);
                            if (blob.size > 3 * 1024 * 1024 && q > 0.1) {
                                return checkAndResolve(q - 0.1);
                            } else {
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
            if (!this.form.title.en && !this.form.title.th) {
                alert(this.$i18n.locale === 'en' ? 'Please enter a title.' : 'กรุณาระบุชื่อผลงาน');
                return;
            }
            if (!artist || !this.form.price || !this.imagePreview) {
                alert(this.$i18n.locale === 'en' ? 'Please fill in required fields (Artist, Price, and Image) before previewing.' : 'กรุณากรอกข้อมูลที่จำเป็น (ศิลปิน, ราคา และรูปภาพ) ก่อนดูตัวอย่าง');
                return;
            }
            
            const previewData = {
                ...this.form,
                title: this.form.title.en || this.form.title.th,
                artist: artist,
                image: this.imagePreview, 
                medium: this.form.technique.en || this.form.technique.th || 'N/A',
                dimensions: `${this.form.width} x ${this.form.height} ${this.form.unit}`,
                description: this.form.description.en || this.form.description.th || ''
            };
            
            sessionStorage.setItem('artwork_preview', JSON.stringify(previewData));
            this.$router.push({ 
                name: 'ArtworkDetail', 
                params: { id: 'preview' } 
            });
        },
        getUnitTH(unitEN) {
            const unit = this.unitOptions.find(u => u.en === unitEN);
            return unit ? unit.th : unitEN;
        },
        handleSave() {
            if (!this.isFormValid) return;
            
            const payload = {
                _id: this.form.id,
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
                status: this.form.status,
                remark: [{ key: 'en', value: this.form.remark.en }, { key: 'th', value: this.form.remark.th }],
                _image: this.form.image
            };

            this.$emit('save', payload);
            this.$emit('update:show', false);
        },
        removeImage() {
            this.form.image = null;
            this.imagePreview = null;
            // Clear the file input so the same file can be selected again
            const input = document.getElementById('artwork-image-edit-upload');
            if (input) input.value = '';
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
