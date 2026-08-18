<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="order-view-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-cart" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Order Details' : 'รายละเอียดคำสั่งซื้อ' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Order ID' : 'รหัสคำสั่งซื้อ' }}: #{{ displayOrderId }} · {{ formatDate(order ? order.createdAt : null) }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="wizard-body px-3 py-2" v-if="order">
            <div class="wizard-content-grid">
                <!-- Left Column: Customer & Order Information -->
                <div class="wizard-form-column">
                    <div class="wizard-panel">
                        <div class="step-heading">
                            <span>01</span>
                            <div>
                                <h6>{{ $i18n.locale === 'en' ? 'Order & Customer Information' : 'ข้อมูลคำสั่งซื้อและลูกค้า' }}</h6>
                                <p>{{ $i18n.locale === 'en' ? 'Delivery address and customer contact.' : 'ข้อมูลการติดต่อและที่อยู่จัดส่ง' }}</p>
                            </div>
                        </div>

                        <!-- Row 1: Customer Name & Phone -->
                        <CRow>
                            <CCol md="6">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Customer Name' : 'ชื่อลูกค้า' }}</label>
                                    <div class="custom-display-box with-icon-left">
                                        <CIcon name="cil-user" class="input-icon-left" />
                                        <span class="font-weight-500 text-dark">{{ (order.contact && order.contact.name) || (order.user ? getName($i18n.locale, order.user) : 'N/A') }}</span>
                                    </div>
                                </div>
                            </CCol>
                            <CCol md="6">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Phone Number' : 'เบอร์โทรศัพท์' }}</label>
                                    <div class="custom-display-box with-icon-left">
                                        <CIcon name="cil-phone" class="input-icon-left" />
                                        <span class="font-weight-500 text-dark">{{ (order.contact && order.contact.telephone) || 'N/A' }}</span>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 2: Email -->
                        <CRow>
                            <CCol md="12">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Email Address' : 'ที่อยู่อีเมล' }}</label>
                                    <div class="custom-display-box with-icon-left">
                                        <CIcon name="cil-envelope-closed" class="input-icon-left" />
                                        <span class="font-weight-500 text-dark">{{ (order.contact && order.contact.email) || (order.user && order.user.email) || 'N/A' }}</span>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 3: Addresses -->
                        <CRow v-if="order.address">
                            <CCol md="6">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Billing Address' : 'ที่อยู่ออกใบเสร็จ' }}</label>
                                    <div class="custom-display-box custom-textarea-box">
                                        <span :class="order.address.bill ? 'text-dark' : 'text-muted font-italic'">
                                            {{ order.address.bill || ($i18n.locale === 'en' ? 'Not specified' : 'ไม่ได้ระบุ') }}
                                        </span>
                                    </div>
                                </div>
                            </CCol>
                            <CCol md="6">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Shipping Address' : 'ที่อยู่จัดส่ง' }}</label>
                                    <div class="custom-display-box custom-textarea-box">
                                        <span :class="order.address.shipping ? 'text-dark' : 'text-muted font-italic'">
                                            {{ order.address.shipping || ($i18n.locale === 'en' ? 'Not specified' : 'ไม่ได้ระบุ') }}
                                        </span>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Row 4: Purchased Artworks List -->
                        <div class="order-items-section mt-3">
                            <label class="form-label mb-2">{{ $i18n.locale === 'en' ? 'Purchased Artworks' : 'รายการผลงานที่สั่งซื้อ' }}</label>
                            <div v-if="order.artwork && order.artwork.length > 0" class="order-items-list">
                                <div 
                                    v-for="art in order.artwork" 
                                    :key="art._id" 
                                    class="order-item-card d-flex align-items-center p-3 mb-2 rounded-xl bg-white border shadow-sm"
                                >
                                    <div class="art-thumb-wrapper mr-3 rounded-lg overflow-hidden flex-shrink-0">
                                        <img 
                                            :src="art.image || `https://via.placeholder.com/60/eee/888?text=Art`" 
                                            class="w-100 h-100 object-fit-cover" 
                                            :alt="getName($i18n.locale, art)"
                                        />
                                    </div>
                                    <div class="flex-grow-1 min-w-0 pr-3">
                                        <h6 class="font-weight-bold text-dark mb-1 text-truncate">{{ getName($i18n.locale, art) || '-' }}</h6>
                                        <div class="small text-muted d-flex flex-wrap align-items-center">
                                            <span v-if="art.artist" class="mr-2">{{ $i18n.locale === 'en' ? 'by' : 'โดย' }} {{ getName($i18n.locale, art.artist) }}</span>
                                            <span v-if="art.category" class="badge badge-light border">{{ getName($i18n.locale, art.category) }}</span>
                                        </div>
                                    </div>
                                    <div class="text-right flex-shrink-0">
                                        <span class="font-weight-bold text-primary h6 mb-0">฿ {{ formatPrice(art.price) }}</span>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="custom-display-box text-muted font-italic">
                                {{ $i18n.locale === 'en' ? 'No items in this order' : 'ไม่มีรายการในคำสั่งซื้อนี้' }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Artwork Preview & Order Documents/Summary -->
                <aside class="wizard-image-column">
                    <div class="image-column-heading">
                        <span><CIcon name="cil-description" size="lg" /></span>
                        <div>
                            <h6>{{ $i18n.locale === 'en' ? 'Documents & Summary' : 'เอกสารและสรุปคำสั่งซื้อ' }}</h6>
                            <p>{{ $i18n.locale === 'en' ? 'Artwork preview and downloadable documents.' : 'ภาพผลงานและเอกสารที่เกี่ยวข้อง' }}</p>
                        </div>
                    </div>

                    <!-- Primary Artwork Preview Image -->
                    <div class="image-upload-block">
                        <div class="file-upload-container">
                            <div class="preview-container">
                                <img 
                                    :src="primaryArtworkImage || `https://via.placeholder.com/600/e2e8f0/808080?text=Order`" 
                                    class="upload-preview" 
                                    :alt="displayOrderId"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Status & Order Summary Under Image -->
                    <div class="sale-settings-under-image">
                        <CRow>
                            <!-- Order Status -->
                            <CCol md="6">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Order Status' : 'สถานะคำสั่งซื้อ' }}</label>
                                    <div class="custom-display-box bg-white">
                                        <div class="d-flex align-items-center">
                                            <CIcon :name="getStatusInfo(order).icon" class="mr-2" :class="getStatusInfo(order).textColor" />
                                            <span class="font-weight-500" :class="getStatusInfo(order).textColor">
                                                {{ getStatusInfo(order).label }}
                                            </span>
                                        </div>
                                        <CBadge :class="['px-3 py-1 font-weight-bold', getStatusInfo(order).class]">
                                            {{ getStatusInfo(order).label }}
                                        </CBadge>
                                    </div>
                                </div>
                            </CCol>

                            <!-- Order Date -->
                            <CCol md="6">
                                <div class="form-group-custom">
                                    <label class="form-label">{{ $i18n.locale === 'en' ? 'Order Date' : 'วันที่สั่งซื้อ' }}</label>
                                    <div class="custom-display-box bg-white">
                                        <span class="text-dark font-weight-500">{{ formatDate(order.createdAt) }}</span>
                                        <CIcon name="cil-calendar" class="dropdown-icon text-muted" />
                                    </div>
                                </div>
                            </CCol>
                        </CRow>
                    </div>

                    <!-- Documents Downloads & Total Amount -->
                    <div class="storage-location-row">
                        <!-- Documents Download Buttons -->
                        <div class="form-group-custom">
                            <label class="form-label">{{ $i18n.locale === 'en' ? 'Documents' : 'เอกสารที่เกี่ยวข้อง' }}</label>
                            <div class="document-buttons-grid">
                                <!-- Receipt / Slip -->
                                <button 
                                    type="button" 
                                    class="doc-pill-btn" 
                                    :disabled="!order.image"
                                    @click="openSlip"
                                    :title="order.image ? ($i18n.locale === 'en' ? 'View Payment Slip' : 'ดูหลักฐานการชำระเงิน') : ($i18n.locale === 'en' ? 'No slip uploaded' : 'ไม่มีหลักฐานการชำระเงิน')"
                                >
                                    <CIcon name="cil-file" class="mr-2 doc-icon" />
                                    <span>{{ $i18n.locale === 'en' ? 'Receipt' : 'ใบเสร็จ (สลิป)' }}</span>
                                </button>

                                <!-- Certificate -->
                                <button 
                                    type="button" 
                                    class="doc-pill-btn" 
                                    @click="downloadCertificate"
                                    :disabled="!!downloading"
                                    :title="$i18n.locale === 'en' ? 'Download Certificate' : 'ดาวน์โหลดใบรับรองผลงาน'"
                                >
                                    <CSpinner v-if="downloading === 'certificate'" size="sm" class="mr-2" />
                                    <CIcon v-else name="cil-description" class="mr-2 doc-icon" />
                                    <span>{{ downloading === 'certificate' ? ($i18n.locale === 'en' ? 'Downloading...' : 'กำลังดาวน์โหลด...') : ($i18n.locale === 'en' ? 'Certificate' : 'ใบรับรอง') }}</span>
                                </button>

                                <!-- Invoice -->
                                <button 
                                    type="button" 
                                    class="doc-pill-btn" 
                                    @click="downloadInvoice"
                                    :disabled="!!downloading"
                                    :title="$i18n.locale === 'en' ? 'Download Invoice' : 'ดาวน์โหลดใบแจ้งหนี้'"
                                >
                                    <CSpinner v-if="downloading === 'invoice'" size="sm" class="mr-2" />
                                    <CIcon v-else name="cil-cloud-download" class="mr-2 doc-icon" />
                                    <span>{{ downloading === 'invoice' ? ($i18n.locale === 'en' ? 'Downloading...' : 'กำลังดาวน์โหลด...') : ($i18n.locale === 'en' ? 'Invoice' : 'ใบแจ้งหนี้') }}</span>
                                </button>
                            </div>
                        </div>

                        <!-- Total Amount Card -->
                        <div class="form-group-custom mt-3">
                            <label class="form-label">{{ $i18n.locale === 'en' ? 'Total Amount' : 'ยอดรวมทั้งสิ้น' }}</label>
                            <div class="custom-display-box bg-white total-amount-box justify-content-between">
                                <span class="text-muted font-weight-500">{{ $i18n.locale === 'en' ? 'Total Price' : 'ราคารวม' }}</span>
                                <div class="d-flex align-items-center">
                                    <span class="currency-prefix">฿</span>
                                    <span class="font-weight-bold text-primary h4 mb-0">{{ totalAmount }}</span>
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
                    {{ $i18n.locale === 'en' ? 'Order #' + displayOrderId : 'คำสั่งซื้อ #' + displayOrderId }}
                </div>
                <div class="wizard-actions d-flex align-items-center">
                    <CButton 
                        color="secondary" 
                        variant="ghost"
                        @click="$emit('update:show', false)"
                        class="btn-close-modal"
                    >
                        {{ $i18n.locale === 'en' ? 'Close' : 'ปิด' }}
                    </CButton>
                </div>
            </div>
        </template>
    </CModal>
</template>

<script>
import moment from 'moment';
import Service from '@/service/api';

export default {
    name: 'OrderViewModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        order: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            downloading: null
        };
    },
    computed: {
        displayOrderId() {
            if (!this.order) return '';
            return this.order.orderNumber || (this.order._id ? this.order._id.substring(this.order._id.length - 8).toUpperCase() : '');
        },
        primaryArtworkImage() {
            if (!this.order) return null;
            if (this.order.artwork && this.order.artwork.length > 0) {
                return this.order.artwork[0].image || null;
            }
            return this.order.image || null;
        },
        totalAmount() {
            if (!this.order || !this.order.artwork) return '0.00';
            const total = this.order.artwork.reduce((sum, art) => sum + (parseFloat(art.price) || 0), 0);
            return this.formatPrice(total);
        }
    },
    methods: {
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
            return item.value || '';
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return moment(date).format('DD/MM/YYYY HH:mm');
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0.00';
            const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
            return isNaN(num) ? '0.00' : num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        getStatusInfo(order) {
            if (!order || !order.status) return { label: this.$i18n.locale === 'en' ? 'Pending' : 'รอดำเนินการ', class: 'status-pending', textColor: 'text-warning', icon: 'cil-clock' };
            const statusEn = this.getName('en', order.status);
            const statusDisplay = this.getName(this.$i18n.locale, order.status);
            
            switch (statusEn) {
                case 'Completed':
                case 'Success':
                case 'Approved':
                    return { label: statusDisplay, class: 'status-completed', textColor: 'text-success', icon: 'cil-check-circle' };
                case 'Cancelled':
                case 'Rejected':
                    return { label: statusDisplay, class: 'status-cancelled', textColor: 'text-danger', icon: 'cil-ban' };
                case 'Reserved':
                case 'Pending Payment':
                    return { label: statusDisplay, class: 'status-pending', textColor: 'text-warning', icon: 'cil-clock' };
                default:
                    return { label: statusDisplay || (this.$i18n.locale === 'en' ? 'Pending' : 'รอดำเนินการ'), class: 'status-pending', textColor: 'text-warning', icon: 'cil-clock' };
            }
        },
        openSlip() {
            if (this.order && this.order.image) {
                window.open(this.order.image, '_blank');
            }
        },
        async downloadInvoice() {
            if (!this.order || !this.order._id) return;
            if (this.downloading) return;
            this.downloading = 'invoice';
            try {
                const res = await Service.order('invoice', this.order._id);
                this.downloadFile(res.data, `Invoice_${this.displayOrderId}.pdf`);
            } catch (error) {
                console.error('Download Invoice Error:', error);
            } finally {
                this.downloading = null;
            }
        },
        async downloadCertificate() {
            if (!this.order || !this.order._id) return;
            if (this.downloading) return;
            this.downloading = 'certificate';
            try {
                const res = await Service.order('certificate', this.order._id);
                this.downloadFile(res.data, `Certificate_${this.displayOrderId}.pdf`);
            } catch (error) {
                console.error('Download Certificate Error:', error);
            } finally {
                this.downloading = null;
            }
        },
        downloadFile(data, fileName) {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
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
    min-height: 80px;
    align-items: flex-start;
    line-height: 1.6;
    white-space: pre-wrap;
    color: #0f172a;
}

.dropdown-icon {
    color: #94a3b8;
    width: 14px;
}

/* Purchased Items Card */
.art-thumb-wrapper {
    width: 54px;
    height: 54px;
    background-color: #f1f5f9;
}

.object-fit-cover {
    object-fit: cover;
}

.order-item-card {
    border-color: #e8edf5 !important;
    transition: all 0.2s ease;
}

.order-item-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
    border-color: #cbd5e1 !important;
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

/* Documents Grid Buttons */
.document-buttons-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.doc-pill-btn {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 8px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    outline: none;
    cursor: pointer;
}

.doc-pill-btn:hover:not(:disabled) {
    background-color: #3b82f6;
    color: #ffffff;
    border-color: #3b82f6;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.doc-pill-btn:hover:not(:disabled) .doc-icon {
    color: #ffffff;
}

.doc-pill-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    background: #f8fafc;
}

.doc-icon {
    width: 15px;
    height: 15px;
    color: #64748b;
    transition: color 0.2s ease;
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

/* Footer Styling */
.wizard-footer {
    gap: 1rem;
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

    .document-buttons-grid {
        grid-template-columns: 1fr;
    }
}
</style>
