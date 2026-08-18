<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="create-order-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-cart" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Create New Order' : 'สร้างคำสั่งซื้อใหม่' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Enter the details below to register a new order.' : 'กรอกรายละเอียดด้านล่างเพื่อสร้างคำสั่งซื้อใหม่' }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="wizard-body px-3 py-2">
            <div class="wizard-content-grid">
                <!-- Left Column: Customer & Order Form -->
                <div class="wizard-form-column">
                    <div class="wizard-panel">
                        <div class="step-heading">
                            <span>01</span>
                            <div>
                                <h6>{{ $i18n.locale === 'en' ? 'Order & Customer Information' : 'ข้อมูลคำสั่งซื้อและลูกค้า' }}</h6>
                                <p>{{ $i18n.locale === 'en' ? 'Customer contact and delivery details.' : 'รายละเอียดผู้สั่งซื้อและสถานที่จัดส่ง' }}</p>
                            </div>
                        </div>

                        <!-- Row 1: Customer Name -->
                        <CRow>
                            <CCol md="12">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Customer Name *' : 'ชื่อลูกค้า *' }}</label>
                                    <div class="input-with-icon-left">
                                        <CIcon name="cil-user" class="input-icon-left" />
                                        <CInput 
                                            v-model="form.contact.name" 
                                            :placeholder="$i18n.locale === 'en' ? 'e.g. Alice Johnson' : 'เช่น สมชาย ดีใจ'" 
                                            class="custom-input pl-5 mb-0"
                                        />
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 2: Email & Phone -->
                        <CRow>
                            <CCol md="6">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Email Address' : 'ที่อยู่อีเมล' }}</label>
                                    <div class="input-with-icon-left">
                                        <CIcon name="cil-envelope-closed" class="input-icon-left" />
                                        <CInput 
                                            v-model="form.contact.email" 
                                            :placeholder="$i18n.locale === 'en' ? 'e.g. alice@example.com' : 'เช่น alice@example.com'" 
                                            class="custom-input pl-5 mb-0"
                                        />
                                    </div>
                                </div>
                            </CCol>
                            <CCol md="6">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Phone Number' : 'เบอร์โทรศัพท์' }}</label>
                                    <div class="input-with-icon-left">
                                        <CIcon name="cil-phone" class="input-icon-left" />
                                        <CInput 
                                            v-model="form.contact.telephone" 
                                            :placeholder="$i18n.locale === 'en' ? 'e.g. 081-234-5678' : 'เช่น 081-234-5678'" 
                                            class="custom-input pl-5 mb-0"
                                        />
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 3: Billing Address -->
                        <CRow>
                            <CCol md="12">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Billing Address' : 'ที่อยู่ใบเสร็จ' }}</label>
                                    <CTextarea 
                                        v-model="form.address.bill" 
                                        :placeholder="$i18n.locale === 'en' ? 'Billing address...' : 'ที่อยู่ใบเสร็จ...'" 
                                        rows="2"
                                        class="custom-textarea"
                                    />
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 4: Shipping Address -->
                        <CRow>
                            <CCol md="12">
                                <div class="form-group-custom">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <label class="form-label mb-0">{{ $i18n.locale === 'en' ? 'Shipping Address' : 'ที่อยู่จัดส่ง' }}</label> 
                                        <button 
                                            type="button" 
                                            @click="copyBillingToShipping" 
                                            class="btn-copy-address"
                                        >
                                            <CIcon name="cil-copy" size="sm" class="mr-1" />
                                            {{ $i18n.locale === 'en' ? 'Same as billing' : 'เหมือนที่อยู่ใบเสร็จ' }}
                                        </button>
                                    </div>
                                    <CTextarea 
                                        v-model="form.address.shipping" 
                                        :placeholder="$i18n.locale === 'en' ? 'Shipping address...' : 'ที่อยู่จัดส่ง...'" 
                                        rows="2"
                                        class="custom-textarea"
                                    />
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 5: Search & Add Artworks -->
                        <div class="artwork-selection-section mt-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <label class="form-label mb-0">{{ $i18n.locale === 'en' ? 'Search & Add Artworks *' : 'ค้นหาและเพิ่มผลงานศิลปะ *' }}</label>
                                <span class="badge badge-light border font-weight-bold" v-if="form.artworks.length > 0">
                                    {{ form.artworks.length }} {{ $i18n.locale === 'en' ? 'items' : 'รายการ' }}
                                </span>
                            </div>
                            
                            <div class="search-box-container position-relative mb-3">
                                <div class="search-input-wrapper-limited position-relative">
                                    <CIcon name="cil-search" class="search-input-icon" />
                                    <CInput 
                                        v-model="artworkSearchQuery" 
                                        :placeholder="$i18n.locale === 'en' ? 'Search by artwork title or artist...' : 'ค้นหาด้วยชื่อผลงานหรือศิลปิน...'" 
                                        class="custom-input-search mb-0 pl-5 pr-5"
                                    />
                                    <button 
                                        v-if="artworkSearchQuery" 
                                        class="search-clear-btn" 
                                        @click="artworkSearchQuery = ''"
                                    >
                                        <CIcon name="cil-x" size="sm" />
                                    </button>
                                </div>
                                
                                <!-- Search Results Dropdown -->
                                <div v-if="artworkSearchQuery.length >= 2" class="search-results-dropdown shadow-lg">
                                    <div v-if="searchResults.length > 0">
                                        <div 
                                            v-for="art in searchResults" 
                                            :key="art._id" 
                                            class="search-result-item d-flex align-items-center p-2"
                                            @click="selectArtwork(art)"
                                        >
                                            <img :src="art.image || `https://via.placeholder.com/40/eee/888?text=${getName($i18n.locale, art).charAt(0)}`" class="result-thumb mr-3" />
                                            <div class="flex-grow-1 min-w-0 pr-2">
                                                <div class="font-weight-bold text-dark text-truncate">{{ getName($i18n.locale, art) }}</div>
                                                <div class="text-muted small text-truncate">{{ art.artist ? getName($i18n.locale, art.artist) : 'N/A' }}</div>
                                            </div>
                                            <div class="mr-3 font-weight-bold text-primary">฿ {{ formatPrice(art.price) }}</div>
                                            <CButton color="primary" variant="ghost" size="sm" class="rounded-pill">
                                                <CIcon name="cil-plus" />
                                            </CButton>
                                        </div>
                                    </div>
                                    <div v-else class="p-4 text-center text-muted">
                                        <CIcon name="cil-search" size="xl" class="mb-2 d-block mx-auto opacity-50" />
                                        {{ $i18n.locale === 'en' ? 'No artworks found for' : 'ไม่พบผลงานสำหรับ' }} "{{ artworkSearchQuery }}"
                                    </div>
                                </div>
                            </div>

                            <!-- Selected Artworks List -->
                            <div v-if="form.artworks.length > 0" class="selected-artworks-list border rounded-xl p-2 bg-light-empty">
                                <div 
                                    v-for="(art, index) in form.artworks" 
                                    :key="art._id" 
                                    class="selected-art-item d-flex align-items-center p-2 mb-2 bg-white rounded-lg border shadow-sm"
                                >
                                    <img :src="art.image" class="selected-thumb mr-3" />
                                    <div class="flex-grow-1 min-w-0 pr-2">
                                        <div class="font-weight-bold text-dark text-truncate">{{ getName($i18n.locale, art) }}</div>
                                        <div class="text-muted small text-truncate">
                                            {{ art.artist ? getName($i18n.locale, art.artist) : 'N/A' }}
                                            <span v-if="art.category" class="badge badge-light ml-1">{{ getName($i18n.locale, art.category) }}</span>
                                        </div>
                                    </div>
                                    <div class="mr-3 font-weight-bold text-primary">฿ {{ formatPrice(art.price) }}</div>
                                    <CButton color="danger" variant="ghost" size="sm" @click="removeArtwork(index)" class="btn-remove">
                                        <CIcon name="cil-trash" />
                                    </CButton>
                                </div>
                            </div>
                            <div v-else class="empty-artworks-placeholder text-center py-4 border rounded-xl border-dashed bg-light">
                                <CIcon name="cil-image" size="xl" class="text-muted mb-2 d-block mx-auto opacity-50" />
                                <span class="text-muted small">{{ $i18n.locale === 'en' ? 'No artworks added yet. Search above to add.' : 'ยังไม่ได้เพิ่มผลงานศิลปะ ค้นหาด้านบนเพื่อเลือกผลงาน' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Proof of Payment & Order Summary -->
                <aside class="wizard-image-column">
                    <div class="image-column-heading">
                        <span><CIcon name="cil-cloud-upload" size="lg" /></span>
                        <div>
                            <h6>{{ $i18n.locale === 'en' ? 'Payment Slip & Summary' : 'สลิปการโอนและสรุปยอด' }}</h6>
                            <p>{{ $i18n.locale === 'en' ? 'Upload receipt and review order total.' : 'อัปโหลดหลักฐานการโอนและตรวจสอบยอด' }}</p>
                        </div>
                    </div>

                    <!-- Proof of Payment Upload Container -->
                    <div class="image-upload-block">
                        <div class="file-upload-container" :class="{ 'has-preview': imagePreview }">
                            <div v-if="!imagePreview" class="upload-dropzone w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-center" @click="$refs.fileInput.click()">
                                <div class="upload-icon-circle mb-2">
                                    <CIcon name="cil-cloud-upload" size="xl" class="text-primary" />
                                </div>
                                <div class="upload-title font-weight-bold text-dark small mb-1">
                                    {{ $i18n.locale === 'en' ? 'Click to upload payment slip' : 'คลิกเพื่ออัปโหลดสลิปการโอนเงิน' }}
                                </div>
                                <div class="upload-hint text-muted small">
                                    {{ $i18n.locale === 'en' ? 'PNG, JPG (Max 2MB)' : 'PNG, JPG (สูงสุด 2MB)' }}
                                </div>
                            </div>
                            <div v-else class="preview-container position-relative w-100 h-100">
                                <img :src="imagePreview" alt="Payment Proof" class="upload-preview" />
                                <div class="preview-overlay d-flex align-items-center justify-content-center">
                                    <button type="button" class="btn btn-sm btn-light rounded-pill mx-1" @click="$refs.fileInput.click()">
                                        <CIcon name="cil-reload" size="sm" class="mr-1" />
                                        {{ $i18n.locale === 'en' ? 'Change' : 'เปลี่ยน' }}
                                    </button>
                                    <button type="button" class="btn btn-sm btn-danger rounded-pill mx-1" @click="removeImage">
                                        <CIcon name="cil-trash" size="sm" class="mr-1" />
                                        {{ $i18n.locale === 'en' ? 'Remove' : 'ลบออก' }}
                                    </button>
                                </div>
                            </div>
                            <input type="file" ref="fileInput" class="d-none" @change="handleImageUpload" accept="image/*">
                        </div>
                    </div>

                    <!-- Summary Card & Details -->
                    <div class="storage-location-row mt-3">
                        <div class="form-group-custom mb-3">
                            <label class="form-label">{{ $i18n.locale === 'en' ? 'Selected Items' : 'จำนวนผลงานที่เลือก' }}</label>
                            <div class="custom-display-box bg-white">
                                <span class="text-dark font-weight-500">{{ form.artworks.length }} {{ $i18n.locale === 'en' ? 'items' : 'รายการ' }}</span>
                                <CIcon name="cil-cart" class="dropdown-icon text-muted" />
                            </div>
                        </div>

                        <!-- Total Amount Box -->
                        <div class="form-group-custom mb-0">
                            <label class="form-label">{{ $i18n.locale === 'en' ? 'Total Amount' : 'ยอดรวมทั้งสิ้น' }}</label>
                            <div class="custom-display-box bg-white total-amount-box justify-content-between">
                                <span class="text-muted font-weight-500">{{ $i18n.locale === 'en' ? 'Grand Total' : 'ราคารวม' }}</span>
                                <div class="d-flex align-items-center">
                                    <span class="currency-prefix">฿</span>
                                    <span class="font-weight-bold text-primary h4 mb-0">{{ formatPrice(totalAmount) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>

        <template #footer>
            <div class="wizard-footer w-100 d-flex justify-content-between align-items-center py-2">
                <div class="text-muted small">
                    {{ form.artworks.length }} {{ $i18n.locale === 'en' ? 'artworks selected' : 'รายการที่เลือก' }}
                </div>
                <div class="wizard-actions d-flex align-items-center">
                    <CButton 
                        color="secondary" 
                        variant="ghost"
                        @click="$emit('update:show', false)"
                        class="btn-close-modal mr-2"
                        :disabled="saving"
                    >
                        {{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
                    </CButton>
                    <LoadingButton 
                        color="primary" 
                        @click="handleSave"
                        class="btn-save-modal"
                        :disabled="form.artworks.length === 0 || !form.contact.name"
                        :loading="saving"
                        :loading-text="$i18n.locale === 'en' ? 'Creating...' : 'กำลังสร้าง...'"
                    >
                        <CIcon name="cil-save" class="mr-2" />
                        {{ $i18n.locale === 'en' ? 'Create Order' : 'สร้างคำสั่งซื้อ' }}
                    </LoadingButton>
                </div>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'OrderCreateModal',
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
            artworkSearchQuery: '',
            searchResults: [],
            imagePreview: null,
            imageFile: null,
            form: {
                contact: {
                    name: '',
                    email: '',
                    telephone: ''
                },
                address: {
                    bill: '',
                    shipping: ''
                },
                artworks: [],
                _image: null
            }
        }
    },
    watch: {
        show(val) {
            if (val) {
                this.resetForm();
                if (this.allArtworks.length === 0) {
                    this.$store.dispatch('artwork/get');
                }
            }
        },
        artworkSearchQuery(val) {
            if (val.length < 2) {
                this.searchResults = [];
                return;
            }
            const query = val.toLowerCase();
            this.searchResults = this.allArtworks.filter(art => {
                const titleEn = this.getName('en', art).toLowerCase();
                const titleTh = this.getName('th', art).toLowerCase();
                const artistEn = art.artist ? this.getName('en', art.artist).toLowerCase() : '';
                const artistTh = art.artist ? this.getName('th', art.artist).toLowerCase() : '';
                return titleEn.includes(query) || titleTh.includes(query) || artistEn.includes(query) || artistTh.includes(query);
            }).slice(0, 5);
        }
    },
    computed: {
        allArtworks() {
            return this.$store.getters['artwork/artworks'] || [];
        },
        totalAmount() {
            return this.form.artworks.reduce((sum, art) => sum + (parseFloat(art.price) || 0), 0);
        }
    },
    methods: {
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
        formatPrice(value) {
            if (value === undefined || value === null) return '0.00';
            return parseFloat(value).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        selectArtwork(art) {
            if (this.form.artworks.find(a => a._id === art._id)) {
                this.artworkSearchQuery = '';
                return;
            }
            this.form.artworks.push({ ...art });
            this.artworkSearchQuery = '';
        },
        removeArtwork(index) {
            this.form.artworks.splice(index, 1);
        },
        copyBillingToShipping() {
            this.form.address.shipping = this.form.address.bill;
        },
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert(this.$i18n.locale === 'en' ? 'Image size exceeds 2MB limit.' : 'ขนาดรูปภาพต้องไม่เกิน 2MB');
                    return;
                }
                this.imageFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.imagePreview = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        removeImage() {
            this.imagePreview = null;
            this.imageFile = null;
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = '';
            }
        },
        handleSave() {
            if (!this.form.contact.name || this.form.artworks.length === 0) {
                return;
            }
            
            const submitData = {
                contact: { ...this.form.contact },
                address: { ...this.form.address },
                artwork: this.form.artworks.map(a => a._id),
                _image: this.imageFile
            };
            
            this.$emit('save', submitData);
            this.resetForm();
        },
        resetForm() {
            this.form = {
                contact: { name: '', email: '', telephone: '' },
                address: { bill: '', shipping: '' },
                artworks: [],
                _image: null
            };
            this.artworkSearchQuery = '';
            this.searchResults = [];
            this.imagePreview = null;
            this.imageFile = null;
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = '';
            }
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

/* Form Groups & Inputs */
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

.input-with-icon-left {
    position: relative;
}

.input-icon-left {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    width: 16px;
    z-index: 2;
}

.custom-input ::v-deep input {
    min-height: 48px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background-color: #f8fafc;
    font-size: 0.95rem;
    color: #1e293b;
    transition: all 0.2s ease;
}

.custom-input ::v-deep input:focus {
    border-color: #3b82f6;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.custom-textarea {
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background-color: #f8fafc;
    font-size: 0.95rem;
    color: #1e293b;
    padding: 0.75rem 1rem;
    width: 100%;
    transition: all 0.2s ease;
    resize: vertical;
}

.custom-textarea:focus {
    border-color: #3b82f6;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    outline: none;
}

.btn-copy-address {
    background: transparent;
    border: none;
    color: #3b82f6;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    padding: 0;
    transition: color 0.2s ease;
}

.btn-copy-address:hover {
    color: #1d4ed8;
    text-decoration: underline;
}

/* Search Box & Dropdown */
.search-input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    width: 16px;
    z-index: 2;
}

.custom-input-search ::v-deep input {
    min-height: 48px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background-color: #f8fafc;
    font-size: 0.95rem;
}

.search-clear-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #94a3b8;
    padding: 4px;
    cursor: pointer;
    z-index: 2;
}

.search-results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    z-index: 100;
    max-height: 240px;
    overflow-y: auto;
    margin-top: 4px;
}

.search-result-item {
    cursor: pointer;
    transition: background-color 0.15s ease;
    border-bottom: 1px solid #f1f5f9;
}

.search-result-item:last-child {
    border-bottom: none;
}

.search-result-item:hover {
    background-color: #f8fafc;
}

.result-thumb, .selected-thumb {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    object-fit: cover;
    background: #f1f5f9;
    flex-shrink: 0;
}

.selected-art-item {
    border-color: #e2e8f0 !important;
}

.btn-remove {
    padding: 4px 8px;
    border-radius: 8px;
}

/* Custom Display Boxes */
.custom-display-box {
    width: 100%;
    min-height: 50px;
    padding: 0.75rem 1.25rem;
    background-color: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    font-size: 1rem;
    color: #1e293b;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.dropdown-icon {
    color: #94a3b8;
    width: 14px;
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
    cursor: pointer;
    transition: all 0.2s ease;
}

.file-upload-container:hover:not(.has-preview) {
    border-color: #3b82f6;
    background: #eff6ff;
}

.upload-icon-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
}

.preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.6);
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: 1.25rem;
}

.preview-container:hover .preview-overlay {
    opacity: 1;
}

.storage-location-row {
    width: 100%;
    margin: 1.25rem 0 0;
    padding-top: 1.25rem;
    border-top: 1px solid #e8edf5;
}

.currency-prefix {
    color: #6366f1;
    font-weight: 700;
    font-size: 1.1rem;
    margin-right: 0.4rem;
}

.total-amount-box {
    border: 1.5px solid #e0e7ff !important;
    background-color: #f5f7ff !important;
}

/* Footer Styling */
.wizard-footer {
    gap: 1rem;
}

.btn-close-modal {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 30px;
    padding: 0.65rem 2rem;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.2s ease;
}

.btn-close-modal:hover {
    background: #e2e8f0;
    color: #1e293b;
}

.btn-save-modal {
    border-radius: 30px !important;
    padding: 0.65rem 2rem !important;
    font-weight: 600 !important;
    font-size: 0.95rem !important;
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
}
</style>
