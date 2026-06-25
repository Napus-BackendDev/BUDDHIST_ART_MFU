<template>
    <CModal 
        :title="$i18n.locale === 'en' ? 'Edit Order' : 'แก้ไขคำสั่งซื้อ'" 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="edit-order-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-pencil" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Edit Order' : 'แก้ไขคำสั่งซื้อ' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Modify the details of the selected order' : 'แก้ไขรายละเอียดคำสั่งซื้อที่เลือก' }} #{{ order ? order._id.substring(order._id.length - 8).toUpperCase() : '' }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2">
            <!-- Customer Info Row -->
            <CRow>
                <CCol>
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Customer Name' : 'ชื่อลูกค้า' }}</label>
                        <CInput 
                            v-model="form.contact.name" 
                            :placeholder="$i18n.locale === 'en' ? 'e.g. Alice Johnson' : 'เช่น สมชาย ดีใจ'" 
                            class="custom-input"
                        />
                    </div>
                </CCol>
            </CRow>
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Email Address' : 'ที่อยู่อีเมล' }}</label>
                        <CInput 
                            v-model="form.contact.email" 
                            :placeholder="$i18n.locale === 'en' ? 'e.g. alice@example.com' : 'เช่น alice@example.com'" 
                            class="custom-input"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">{{ $i18n.locale === 'en' ? 'Phone Number' : 'เบอร์โทรศัพท์' }}</label>
                        <CInput 
                            v-model="form.contact.telephone" 
                            :placeholder="$i18n.locale === 'en' ? 'e.g. 081-234-5678' : 'เช่น 081-234-5678'" 
                            class="custom-input"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Address Row -->
            <CRow>
                <CCol>
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
            <CRow>
                <CCol>
                    <div class="form-group-custom">
                        <div class="d-flex justify-content-between align-items-center">
                            <label class="form-label">{{ $i18n.locale === 'en' ? 'Shipping Address' : 'ที่อยู่จัดส่ง' }}</label> 
                            <CLink @click="copyBillingToShipping" class="small font-weight-bold text-blue" style="cursor: pointer; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">
                                {{ $i18n.locale === 'en' ? 'Same as billing' : 'เหมือนที่อยู่ใบเสร็จ' }}
                            </CLink>
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

            <!-- Artwork Selection Section -->
            <div class="artwork-selection-section mt-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label mb-0">{{ $i18n.locale === 'en' ? 'Search & Add Artworks' : 'ค้นหาและเพิ่มผลงานศิลปะ' }}</label>
                    <div class="total-price-indicator" v-if="form.artworks.length > 0">
                        <span class="text-muted small">{{ $i18n.locale === 'en' ? 'Total:' : 'ยอดรวม:' }}</span>
                        <span class="font-weight-bold ml-1">฿ {{ formatPrice(totalAmount) }}</span>
                    </div>
                </div>
                
                <div class="search-box-container position-relative mb-3">
                    <div class="search-input-wrapper-limited position-relative">
                        <CInput 
                            v-model="artworkSearchQuery" 
                            :placeholder="$i18n.locale === 'en' ? 'Search by artwork title or artist...' : 'ค้นหาด้วยชื่อผลงานหรือศิลปิน...'" 
                            class="custom-input-search mb-0"
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
                                <div class="flex-grow-1">
                                    <div class="font-weight-bold text-dark">{{ getName($i18n.locale, art) }}</div>
                                    <div class="text-muted small">{{ art.artist ? getName($i18n.locale, art.artist) : 'N/A' }}</div>
                                </div>
                                <div class="mr-3 font-weight-bold text-blue">฿ {{ formatPrice(art.price) }}</div>
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
                <div v-if="form.artworks.length > 0" class="selected-artworks-list border rounded-lg p-3 bg-light-blue shadow-sm-inset">
                    <div v-for="(art, index) in form.artworks" :key="art._id" class="selected-art-item d-flex align-items-center mb-2 bg-white p-2 rounded-lg shadow-sm">
                        <img :src="art.image" class="selected-thumb mr-3" />
                        <div class="flex-grow-1">
                            <div class="font-weight-bold text-dark">{{ getName($i18n.locale, art) }}</div>
                            <div class="text-muted small">{{ art.artist ? getName($i18n.locale, art.artist) : 'N/A' }}</div>
                        </div>
                        <div class="mr-3 font-weight-bold text-blue">฿ {{ formatPrice(art.price) }}</div>
                        <CButton color="danger" variant="ghost" size="sm" @click="removeArtwork(index)" class="btn-remove">
                            <CIcon name="cil-trash" />
                        </CButton>
                    </div>
                </div>
                <div v-else class="empty-artworks-placeholder text-center py-4 border rounded-lg border-dashed">
                    <CIcon name="cil-image" size="xl" class="text-muted mb-2 d-block mx-auto" />
                    <span class="text-muted">{{ $i18n.locale === 'en' ? 'No artworks added yet' : 'ยังไม่ได้เพิ่มผลงานศิลปะ' }}</span>
                </div>
            </div>



            <!-- Proof of Payment Row -->
            <div class="form-group-custom mt-4 pt-4 border-top">
                <label class="form-label">{{ $i18n.locale === 'en' ? 'Proof of Payment (Optional)' : 'หลักฐานการชำระเงิน (ไม่บังคับ)' }}</label>
                <div class="upload-container">
                    <div v-if="!imagePreview" class="upload-area" @click="$refs.fileInput.click()">
                        <CIcon name="cil-cloud-upload" size="xl" class="text-blue mb-2" />
                        <div class="upload-text">{{ $i18n.locale === 'en' ? 'Click or drag receipt here' : 'คลิกหรือลากหลักฐานการโอนเงินมาที่นี่' }}</div>
                        <div class="upload-hint text-muted small">{{ $i18n.locale === 'en' ? 'PNG, JPG, PDF (Max 2MB)' : 'PNG, JPG, PDF (สูงสุด 2MB)' }}</div>
                    </div>
                    <div v-else class="preview-area position-relative">
                        <img :src="imagePreview" alt="Payment Proof" class="preview-img img-fluid rounded-lg">
                        <div class="preview-overlay d-flex align-items-center justify-content-center">
                            <CButton color="light" class="rounded-pill mx-1" @click="$refs.fileInput.click()">{{ $i18n.locale === 'en' ? 'Change' : 'เปลี่ยน' }}</CButton>
                            <CButton color="danger" class="rounded-pill mx-1" @click="removeImage">{{ $i18n.locale === 'en' ? 'Remove' : 'ลบออก' }}</CButton>
                        </div>
                    </div>
                    <input type="file" ref="fileInput" class="d-none" @change="handleImageUpload" accept="image/*">
                </div>
            </div>
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
                    color="primary" 
                    @click="handleSave"
                    class="btn-save-changes"
                    :disabled="form.artworks.length === 0 || !form.contact.name"
                >
                    <CIcon name="cil-save" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Save Changes' : 'บันทึกการเปลี่ยนแปลง' }}
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'OrderEditModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        order: {
            type: Object,
            default: () => null
        }
    },
    data() {
        return {
            artworkSearchQuery: '',
            searchResults: [],
            imagePreview: null,
            imageFile: null,
            form: {
                _id: '',
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
                carrier: 'Thailand Post',
                trackingId: '',
                deliveryDate: '',
                _image: null
            }
        }
    },
    watch: {
        show(val) {
            if (val) {
                this.initForm();
                // Ensure artworks are loaded for the search feature
                this.$store.dispatch('artwork/get');
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
        initForm() {
            if (this.order) {
                this.form = {
                    _id: this.order._id,
                    contact: {
                        name: this.order.contact?.name || '',
                        email: this.order.contact?.email || '',
                        telephone: this.order.contact?.telephone || ''
                    },
                    address: {
                        bill: this.order.address?.bill || '',
                        shipping: this.order.address?.shipping || ''
                    },
                    artworks: Array.isArray(this.order.artwork) ? [...this.order.artwork] : [],
                    carrier: this.order.carrier || 'Thailand Post',
                    trackingId: this.order.trackingId || '',
                    deliveryDate: this.order.deliveryDate ? new Date(this.order.deliveryDate).toISOString().split('T')[0] : '',
                    _image: null
                };
                this.imagePreview = this.order.image || null;
                this.imageFile = null;
                this.artworkSearchQuery = '';
                this.searchResults = [];
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
            if (this.$refs.fileInput) this.$refs.fileInput.value = '';
        },
        handleSave() {
            if (!this.form.contact.name || this.form.artworks.length === 0) {
                return;
            }
            
            const submitData = {
                _id: this.form._id,
                contact: { ...this.form.contact },
                address: { ...this.form.address },
                artwork: this.form.artworks.map(a => a._id),
                carrier: this.form.carrier,
                trackingId: this.form.trackingId,
                deliveryDate: this.form.deliveryDate,
                _image: this.imageFile
            };
            
            this.$emit('save', submitData);
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
    margin-bottom: 0.5rem;
    letter-spacing: 0.05em;
}

.custom-input ::v-deep .form-control,
.custom-input-search ::v-deep .form-control,
.custom-textarea ::v-deep .form-control {
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    padding: 0.8rem 1rem;
    height: auto;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    background-color: #f8fafc;
    color: #1e293b;
}

.custom-input ::v-deep .form-control:focus,
.custom-input-search ::v-deep .form-control:focus,
.custom-textarea ::v-deep .form-control:focus {
    border-color: #3b82f633;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
}

/* Search Dropdown */
.search-input-wrapper-limited {
    max-width: 400px;
}

.search-clear-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
    z-index: 2;
}

.search-clear-btn:hover {
    color: #ef4444;
}

.search-results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-width: 400px;
    background: white;
    z-index: 1000;
    border-radius: 12px;
    margin-top: 8px;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.search-result-item {
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid #f1f5f9;
}

.search-result-item:hover {
    background: #f8fafc;
}

.result-thumb {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
}

/* Selected Artworks */
.bg-light-blue {
    background-color: #f1f5ff;
}

.shadow-sm-inset {
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

.selected-art-item {
    border: 1px solid #e2e8f0;
}

.selected-thumb {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    object-fit: cover;
}

.btn-remove {
    opacity: 0.6;
}
.btn-remove:hover {
    opacity: 1;
}

/* Upload Style */
.upload-area {
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background-color: #f8fafc;
}

.upload-area:hover {
    border-color: #3b82f6;
    background-color: #f0f7ff;
}

.preview-area {
    text-align: center;
}

.preview-img {
    max-height: 200px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity 0.2s;
    border-radius: 12px;
}

.preview-area:hover .preview-overlay {
    opacity: 1;
}

/* Modal Styling */
.icon-square {
    width: 52px;
    height: 52px;
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

.btn-save-changes {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

::v-deep .modal-content {
    border-radius: 20px;
}

.border-dashed {
    border-style: dashed !important;
    border-width: 2px !important;
    border-color: #e2e8f0 !important;
}
</style>
