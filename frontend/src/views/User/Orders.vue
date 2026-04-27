<template>
    <div class="track-order-page bg-light min-vh-100">
        <!-- Modular Hero Header -->
        <div class="orders-hero" :style="{ backgroundImage: `url(${require('@/assets/images/orders_hero_gen.png')})` }">
            <div class="hero-overlay"></div>
            <CContainer class="hero-content-wrapper text-center">
                <div class="reveal-animation">
                    <h1 class="hero-title text-uppercase mb-2">Track <span class="text-highlight">Your Order</span></h1>
                    <div class="title-separator mb-4 mx-auto"></div>
                    <p class="hero-subtitle mb-0">
                        ตรวจสอบสถานะการสั่งซื้อและติดตามการจัดส่ง <br class="d-none d-md-block">
                        พุทธศิลปกรรมจากศูนย์พุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง
                    </p>
                </div>
            </CContainer>
            
            <!-- Subtle decorative element -->
            <div class="decorative-blob"></div>
        </div>

        <CContainer fluid class="pb-5 px-md-5 position-relative" style="z-index: 30; margin-top: -80px;">
            <!-- Search Form Section -->
            <div v-if="!showResult" class="row justify-content-center pt-5">
                <CCol md="10" lg="8" xl="6">
                    <CCard class="border-0 shadow-lg track-card overflow-hidden">
                        <CCardHeader class="border-0 p-0"
                            style="height: 6px; background: linear-gradient(90deg, #E55B5B, #F9D976);"></CCardHeader>
                        <CCardBody class="p-4 p-md-5 bg-white">
                            <div class="text-center mb-4">
                                <h3 class="font-weight-bold text-dark">ค้นหาคำสั่งซื้อ</h3>
                                <p class="text-muted small">กรอกเลขที่ใบสั่งซื้อเพื่อติดตามสถานะปัจจุบัน</p>
                            </div>
                            <div class="mb-4">
                                <label class="font-weight-bold text-dark small mb-2">ORDER NUMBER / เลขที่ใบสั่งซื้อ</label>
                                <CInput placeholder="e.g. 112-345678" class="shadow-none custom-input"
                                    v-model="search.orderNumber">
                                    <template #prepend-content>
                                        <CIcon name="cil-search" class="text-muted" />
                                    </template>
                                </CInput>
                            </div>

                            <CButton @click="trackOrder" block color="danger" size="lg"
                                class="py-3 font-weight-bold shadow-sm btn-track ripple"
                                style="background-color: #E55B5B; border: none; border-radius: 12px;">
                                ติดตามสถานะ
                            </CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
            </div>

            <!-- Result View Section -->
            <div v-else class="row justify-content-center pt-4">
                <CCol lg="12" xl="10">
                    <div class="mb-4 d-flex align-items-center justify-content-between">
                        <CButton color="link" class="pl-0 text-white-50 text-decoration-none d-flex align-items-center hover-light" @click="showResult = false">
                            <CIcon name="cil-arrow-left" class="mr-2" /> Back to Search
                        </CButton>
                        <div class="text-white-50 small">Order placed on Oct 18, 2023</div>
                    </div>

                    <CCard class="border-0 shadow-lg rounded-xl overflow-hidden main-result-card">
                        <CCardHeader class="bg-white border-bottom p-4">
                            <div class="d-flex justify-content-between align-items-center flex-wrap">
                                <div class="mb-3 mb-md-0">
                                    <div class="text-muted small font-weight-bold mb-1">ORDER ID</div>
                                    <h3 class="font-weight-bold mb-0 text-dark">#{{ order ? order._id : (search.orderNumber || 'ORD-2023-8821') }}</h3>
                                </div>
                                <div class="d-flex align-items-center">
                                    <div class="status-badge px-3 py-2 rounded-pill font-weight-bold d-flex align-items-center mr-3"
                                        :class="statusClass">
                                        <span class="pulse-dot mr-2" :class="pulseClass"></span> {{ statusLabel }}
                                    </div>
                                </div>
                            </div>
                        </CCardHeader>
                        
                        <CCardBody class="p-0">
                            <!-- Delivery Estimator -->
                            <div class="p-4 p-md-5 border-bottom" style="background-color: #fcfcfc;">
                                <CRow class="align-items-center">
                                    <CCol md="6" class="mb-4 mb-md-0">
                                        <div class="d-flex align-items-center">
                                            <div class="delivery-icon-box mr-4">
                                                <CIcon name="cil-truck" size="xl" />
                                            </div>
                                            <div>
                                                <div class="text-muted small font-weight-bold">EXPECTED DELIVERY</div>
                                                <div class="h4 font-weight-bold mb-0 text-dark">{{ order.deliveryDate ? formatDate(order.deliveryDate) : 'To be confirmed' }}</div>
                                            </div>
                                        </div>
                                    </CCol>
                                    <CCol md="6">
                                        <div class="tracking-summary p-3 rounded-lg border bg-white shadow-sm">
                                            <div class="d-flex justify-content-between small mb-2">
                                                <span class="text-muted">Carrier:</span>
                                                <span class="font-weight-bold">{{ order.carrier || 'Thailand Post' }}</span>
                                            </div>
                                            <div class="d-flex justify-content-between small">
                                                <span class="text-muted">Tracking ID:</span>
                                                <span class="font-weight-bold">{{ order.trackingId || ('TH' + (order._id.substring(order._id.length - 9))) }}</span>
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </div>

                            <!-- Modern Stepper -->
                            <div class="p-4 p-md-5 bg-white">
                                <div class="stepper-wrapper">
                                    <div class="stepper-item" :class="{ 'completed': currentStep >= 1 }">
                                        <div class="step-counter"><CIcon name="cil-check" v-if="currentStep > 1" /><span v-else>1</span></div>
                                        <div class="step-name">Confirmed</div>
                                        <div class="step-date">{{ formatDateShort(order.createdAt) }}</div>
                                    </div>
                                    <div class="stepper-item" :class="{ 'completed': currentStep >= 2, 'active': currentStep === 2 }">
                                        <div class="step-counter"><CIcon name="cil-check" v-if="currentStep > 2" /><span v-else>2</span></div>
                                        <div class="step-name">Processing</div>
                                    </div>
                                    <div class="stepper-item" :class="{ 'completed': currentStep >= 3, 'current': currentStep === 3 }">
                                        <div class="step-counter"><CIcon name="cil-truck" v-if="currentStep === 3" /><span v-else>3</span></div>
                                        <div class="step-name">Shipped</div>
                                    </div>
                                    <div class="stepper-item" :class="{ 'completed': currentStep >= 4, 'success': statusLabel === 'อนุมัติ' }">
                                        <div class="step-counter"><CIcon name="cil-check" v-if="currentStep >= 4" /><span v-else>4</span></div>
                                        <div class="step-name">{{ statusLabel === 'อนุมัติ' ? 'อนุมัติ' : 'Delivered' }}</div>
                                    </div>
                                </div>
                            </div>

                            <CRow class="p-4 p-md-5">
                                <!-- Documents Sidebar -->
                                <CCol lg="4" class="mb-4 mb-lg-0">
                                    <div class="d-flex align-items-center mb-4">
                                        <h5 class="font-weight-bold mb-0 text-dark">Artwork Doc</h5>
                                        <hr class="flex-grow-1 ml-3 border-light">
                                    </div>

                                    <div class="doc-actions-vertical">
                                        <button class="doc-btn mb-3">
                                            <div class="doc-icon-box mr-3">
                                                <CIcon name="cil-description" />
                                            </div>
                                            <div class="text-left">
                                                <div class="doc-title">สลิปรายจ่ายเงิน</div>
                                                <div class="doc-subtitle">Payment Slip</div>
                                            </div>
                                        </button>

                                        <button class="doc-btn mb-3">
                                            <div class="doc-icon-box mr-3">
                                                <CIcon name="cil-bookmark" />
                                            </div>
                                            <div class="text-left">
                                                <div class="doc-title">ใบจองงานศิลปะ</div>
                                                <div class="doc-subtitle">Reservation Slip</div>
                                            </div>
                                        </button>

                                        <button class="doc-btn">
                                            <div class="doc-icon-box mr-3">
                                                <CIcon name="cil-star" />
                                            </div>
                                            <div class="text-left">
                                                <div class="doc-title">ใบรับรองงานศิลปะ</div>
                                                <div class="doc-subtitle">Certificate of Authenticity</div>
                                            </div>
                                        </button>
                                    </div>
                                </CCol>

                                <!-- Details Main -->
                                <CCol lg="8">
                                    <div class="d-flex align-items-center mb-4">
                                        <h5 class="font-weight-bold mb-0 text-dark">Shipment Information</h5>
                                        <hr class="flex-grow-1 ml-3 border-light">
                                    </div>

                                    <div class="info-card p-4 rounded-xl border bg-light mb-4 shadow-sm">
                                        <CRow>
                                            <CCol md="6">
                                                <div class="d-flex mb-4 mb-md-0">
                                                    <div class="icon-avatar mr-3 bg-white shadow-sm text-danger">
                                                        <CIcon name="cil-location-pin" />
                                                    </div>
                                                    <div>
                                                        <div class="text-muted small font-weight-bold">SHIPPING ADDRESS</div>
                                                        <div class="text-dark small mt-1 font-weight-bold">{{ order.contact ? order.contact.name : 'Unknown Recipient' }}</div>
                                                        <div class="text-muted small mt-1">
                                                            {{ order.address ? order.address.shipping : 'No address provided' }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CCol>
                                            <CCol md="6" class="border-left-md">
                                                <div class="d-flex">
                                                    <div class="icon-avatar mr-3 bg-white shadow-sm text-danger">
                                                        <CIcon name="cil-user" />
                                                    </div>
                                                    <div>
                                                        <div class="text-muted small font-weight-bold">CONTACT INFORMATION</div>
                                                        <div class="text-dark small mt-1 font-weight-bold">{{ order.contact ? order.contact.email : 'N/A' }}</div>
                                                        <div class="text-muted small">{{ order.contact ? order.contact.telephone : 'N/A' }}</div>
                                                    </div>
                                                </div>
                                            </CCol>
                                        </CRow>
                                    </div>
                                    
                                    <div class="p-3 bg-soft-danger rounded-lg d-flex align-items-center">
                                        <CIcon name="cil-warning" class="text-danger mr-3" />
                                        <div class="small text-danger font-weight-bold">Signature required upon delivery. Please ensure someone is available at the address.</div>
                                    </div>
                                </CCol>
                            </CRow>
                        </CCardBody>
                        <CCardFooter class="bg-white border-top p-4 text-center">
                            <span class="text-muted small">Need help with your order? </span>
                            <CLink href="#" class="text-danger font-weight-bold small text-decoration-none">Contact Support</CLink>
                        </CCardFooter>
                    </CCard>
                </CCol>
            </div>

        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'Orders',
    data() {
        return {
            showResult: false,
            loading: false,
            order: null,
            search: {
                orderNumber: ''
            }
        }
    },
    computed: {
        statusLabel() {
            if (!this.order || !this.order.status) return 'รออนุมัติ';
            const label = this.getLang(this.order.status.title).toUpperCase();
            if (label === 'APPROVED' || label === 'SUCCESS' || label === 'COMPLETED') return 'อนุมัติ';
            return label;
        },
        currentStep() {
            const status = this.statusLabel;
            if (status === 'อนุมัติ' || status.toLowerCase().includes('deliver') || status.toLowerCase().includes('complete') || status.toLowerCase().includes('success')) return 4;
            if (status.includes('ส่ง') || status.toLowerCase().includes('ship')) return 3;
            // "รออนุมัติ" or "Pending" now maps to Step 2 (Processing)
            if (status.includes('รอ') || status.toLowerCase().includes('pending') || status.includes('เดิน') || status.toLowerCase().includes('process')) return 2;
            return 1;
        },
        statusClass() {
            if (this.currentStep === 4) return 'bg-soft-success text-success border border-success';
            if (this.currentStep >= 2) return 'bg-soft-primary text-primary border border-primary';
            return 'bg-soft-warning text-warning border border-warning';
        },
        pulseClass() {
            if (this.currentStep === 4) return 'bg-success';
            if (this.currentStep >= 2) return 'bg-primary';
            return 'bg-warning';
        }
    },
    methods: {
        async trackOrder() {
            if (!this.search.orderNumber) return;
            
            this.loading = true;
            try {
                // In this project, _id is used for tracking
                const results = await this.$store.dispatch('order/get', { _id: this.search.orderNumber });
                if (results && results.length > 0) {
                    this.order = results[0];
                    this.showResult = true;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    alert('Order not found. Please check your order number.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while tracking your order.');
            } finally {
                this.loading = false;
            }
        },
        getLang(arr) {
            if (!arr || !Array.isArray(arr)) return arr || '';
            const lang = this.$i18n.locale || 'th';
            const item = arr.find(i => i.key === lang) || arr.find(i => i.key === 'th') || arr[0];
            return item ? item.value : '';
        },
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('th-TH', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        formatDateShort(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
        }
    }
}
</script>

<style scoped>
.track-order-page {
    position: relative;
    overflow-x: hidden;
    padding-top: 0 !important;
    margin-top: -2rem !important;
}

.rounded-xl {
    border-radius: 20px !important;
}

.track-card {
    border-radius: 16px;
}

.custom-input {
    border-radius: 12px !important;
}

::v-deep .custom-input .form-control {
    height: 55px;
    background-color: #fff;
    border: 1px solid #e2e8f0;
    border-left: none;
    border-radius: 0 12px 12px 0 !important;
}

::v-deep .custom-input .input-group-text {
    background-color: #fff;
    border: 1px solid #e2e8f0;
    border-right: none;
    border-radius: 12px 0 0 12px !important;
    padding-left: 20px;
    color: #94a3b8;
}

::v-deep .custom-input .input-group {
    border-radius: 12px;
    overflow: hidden;
}

::v-deep .custom-input .form-control:focus {
    background-color: #fff;
    border-color: #E55B5B;
    box-shadow: 0 0 0 3px rgba(229, 91, 91, 0.1);
}

.btn-track {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-track:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(229, 91, 91, 0.4) !important;
}

.hover-light:hover {
    color: #fff !important;
}

.bg-soft-success {
    background-color: rgba(40, 167, 69, 0.1);
}

.bg-soft-danger {
    background-color: rgba(229, 91, 91, 0.05);
}

.bg-soft-primary {
    background-color: rgba(0, 123, 255, 0.1);
}

.bg-soft-warning {
    background-color: rgba(255, 193, 7, 0.1);
}

.text-primary {
    color: #007bff !important;
}

.text-warning {
    color: #ffc107 !important;
}

.border-primary {
    border-color: #007bff !important;
}

.border-warning {
    border-color: #ffc107 !important;
}

.bg-primary {
    background-color: #007bff !important;
}

.bg-warning {
    background-color: #ffc107 !important;
}

.pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
    animation: pulse 2s infinite;
}

.pulse-dot.bg-success {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4);
    animation: pulse-success 2s infinite;
}

.pulse-dot.bg-primary {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
    animation: pulse-primary 2s infinite;
}

.pulse-dot.bg-warning {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
    animation: pulse-warning 2s infinite;
}

@keyframes pulse-success {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(40, 167, 69, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
}

@keyframes pulse-primary {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 123, 255, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
}

@keyframes pulse-warning {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 193, 7, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
}

/* Stepper */
.stepper-wrapper {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    position: relative;
}

.stepper-wrapper::before {
    content: '';
    position: absolute;
    top: 16px;
    left: 40px;
    right: 40px;
    height: 4px;
    background-color: #f1f5f9;
    z-index: 0;
}

.stepper-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    z-index: 1;
}

.step-counter {
    position: relative;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #fff;
    border: 4px solid #f1f5f9;
    color: #94a3b8;
    font-weight: bold;
    margin-bottom: 12px;
    transition: all 0.3s ease;
}

.stepper-item.completed .step-counter {
    background-color: #E55B5B;
    border-color: #E55B5B;
    color: #fff;
}

.stepper-item.current .step-counter {
    box-shadow: 0 0 0 4px rgba(229, 91, 91, 0.2);
}

.stepper-item.success .step-counter {
    background-color: #28a745 !important;
    border-color: #28a745 !important;
    color: #fff;
}

.stepper-item.success .step-name {
    color: #28a745 !important;
}

.stepper-item.completed.active::before {
    content: '';
    position: absolute;
    top: 16px;
    left: -50%;
    width: 100%;
    height: 4px;
    background-color: #E55B5B;
    z-index: -1;
}

.step-name {
    font-size: 14px;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 4px;
}

.stepper-item.completed .step-name {
    color: #1e293b;
}

.step-date {
    font-size: 11px;
    color: #94a3b8;
}

/* Document Actions */
.doc-actions-vertical {
    display: flex;
    flex-direction: column;
}

.doc-btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 1.25rem;
    background-color: #fff;
    border: 1px solid #eef2f6;
    border-radius: 16px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.doc-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
    border-color: #E55B5B;
}

.doc-icon-box {
    width: 48px;
    height: 48px;
    background-color: #f8fafc;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #E55B5B;
    font-size: 1.2rem;
    transition: all 0.2s ease;
}

.doc-btn:hover .doc-icon-box {
    background-color: #E55B5B;
    color: #fff;
}

.doc-title {
    font-weight: 700;
    color: #1e293b;
    font-size: 0.95rem;
    line-height: 1.2;
}

.doc-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

@media (min-width: 768px) {
    .border-left-md {
        border-left: 1px solid #eef2f6;
        padding-left: 2rem;
    }
}

/* Icons & Avatars */
.delivery-icon-box {
    width: 60px;
    height: 60px;
    background: #E55B5B;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 8px 16px rgba(229, 91, 91, 0.2);
}

.icon-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-action {
    width: 40px;
    height: 40px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px !important;
}

/* Hero Section Styles */
.orders-hero {
    position: relative;
    height: 480px;
    display: flex;
    align-items: center;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    margin-top: -80px; 
    padding-top: 80px;
    overflow: hidden;
    color: white;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
        rgba(0,0,0,0.8) 0%, 
        rgba(0,0,0,0.6) 50%, 
        rgba(0,0,0,0.3) 100%);
    z-index: 1;
}

.hero-content-wrapper {
    position: relative;
    z-index: 2;
}

.hero-title {
    font-family: 'Cinzel', serif;
    font-size: 3.5rem;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: 2px;
    text-shadow: 0 10px 30px rgba(0,0,0,0.5);
    animation: fadeInLeft 1s ease-out 0.2s both;
}

.text-highlight {
    color: white;
    -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.4);
    font-style: italic;
}

.title-separator {
    width: 60px;
    height: 4px;
    background: #E55B5B;
    border-radius: 2px;
    animation: scaleIn 0.8s ease-out 0.5s both;
}

.hero-subtitle {
    font-family: 'Sarabun', sans-serif;
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
    text-shadow: 0 4px 12px rgba(0,0,0,0.6);
    animation: fadeInUp 1s ease-out 0.6s both;
}

.decorative-blob {
    position: absolute;
    bottom: -50px;
    right: -50px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(229, 91, 91, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(40px);
    z-index: 1;
}

/* Animations */
@keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
    from { opacity: 0; transform: scaleX(0); transform-origin: left; }
    to { opacity: 1; transform: scaleX(1); transform-origin: left; }
}

@media (max-width: 768px) {
    .orders-hero { height: 400px; }
    .hero-title { font-size: 2.5rem; }
    .hero-subtitle { font-size: 1rem; }
}

.track-card {
    border-radius: 24px;
    transform: translateY(0);
    transition: all 0.3s ease;
}

.track-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
}

.custom-input input {
    height: 60px;
    border-radius: 12px;
    border: 1.5px solid #eee !important;
    font-size: 1.1rem;
    padding-left: 1rem;
    transition: all 0.3s ease;
}

.custom-input input:focus {
    border-color: #E55B5B !important;
    box-shadow: 0 0 0 4px rgba(229, 91, 91, 0.1) !important;
}

.btn-track {
    border-radius: 12px;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

.btn-track:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(229, 91, 91, 0.3) !important;
    opacity: 0.9;
}

@media (max-width: 768px) {
    .stepper-wrapper::before { display: none; }
    .stepper-item.completed.active::before { display: none; }
    .step-name { font-size: 12px; }
}

.main-result-card {
    transition: transform 0.3s ease;
}
</style>
