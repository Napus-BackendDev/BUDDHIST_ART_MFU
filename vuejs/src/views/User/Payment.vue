<template>
    <div class="payment-page bg-light min-vh-100 py-5">
        <CContainer>

            <!-- Top Navigation -->
            <div class="mb-4">
                <CLink href="#" @click.native.prevent="$router.go(-1)" class="text-muted small text-decoration-none">
                    <CIcon name="cil-arrow-left" size="sm" class="mr-1" /> Back to Shopping
                </CLink>
                <h2 class="font-weight-bold mt-2" style="color: #2c3e50;">Checkout</h2>
            </div>

            <CRow>
                <!-- Left Column: Steps -->
                <CCol lg="8">

                    <!-- Step 1: Shipping Information -->
                    <CCard class="border-0 shadow-sm mb-4 rounded-lg overflow-hidden">
                        <CCardHeader class="bg-white border-bottom-0 p-4"
                            :class="{ 'cursor-pointer': currentStep === 2 }" @click.native="currentStep = 1">
                            <h5 class="font-weight-bold mb-0" :class="currentStep === 1 ? 'text-dark' : 'text-muted'">
                                <span class="step-badge mr-2" :class="{ 'bg-success': currentStep === 2 }">
                                    <CIcon name="cil-check" v-if="currentStep === 2" size="sm" />
                                    <span v-else>1</span>
                                </span>
                                Shipping Information
                            </h5>
                        </CCardHeader>
                        <CCardBody class="p-4 pt-0" v-show="currentStep === 1">
                            <CRow>
                                <CCol md="6" class="mb-3">
                                    <label class="font-weight-bold small text-muted">First Name</label>
                                    <CInput placeholder="" class="bg-light border-0 shadow-none h-50-px" />
                                </CCol>
                                <CCol md="6" class="mb-3">
                                    <label class="font-weight-bold small text-muted">Last Name</label>
                                    <CInput placeholder="" class="bg-light border-0 shadow-none h-50-px" />
                                </CCol>
                                <CCol md="12" class="mb-3">
                                    <label class="font-weight-bold small text-muted">Email Address</label>
                                    <CInput placeholder="" class="bg-light border-0 shadow-none h-50-px" />
                                </CCol>
                                <CCol md="12" class="mb-3">
                                    <label class="font-weight-bold small text-muted">Address</label>
                                    <CInput placeholder="" class="bg-light border-0 shadow-none h-50-px" />
                                </CCol>
                                <CCol md="6" class="mb-3">
                                    <label class="font-weight-bold small text-muted">City</label>
                                    <CInput placeholder="" class="bg-light border-0 shadow-none h-50-px" />
                                </CCol>
                                <CCol md="6" class="mb-3">
                                    <label class="font-weight-bold small text-muted">Postal Code</label>
                                    <CInput placeholder="" class="bg-light border-0 shadow-none h-50-px" />
                                </CCol>
                            </CRow>

                            <CButton block color="dark" size="lg" class="mt-4 py-3 font-weight-bold shadow-sm"
                                style="background-color: #1a1a2e; border: none;" @click="currentStep = 2">
                                Continue to Payment
                            </CButton>
                        </CCardBody>
                    </CCard>

                    <!-- Step 2: Payment Method -->
                    <CCard class="border-0 shadow-sm mb-4 rounded-lg">
                        <CCardHeader class="bg-white border-bottom-0 p-4">
                            <h5 class="font-weight-bold mb-0" :class="currentStep === 2 ? 'text-dark' : 'text-muted'">
                                <span class="step-badge mr-2"
                                    :class="{ 'bg-light text-muted': currentStep === 1 }">2</span> Payment Method
                            </h5>
                        </CCardHeader>
                        <CCardBody class="p-4 pt-0" v-show="currentStep === 2">

                            <!-- Payment Options -->
                            <div class="payment-options mb-4">
                                <!-- Scan QR Code -->
                                <div class="payment-option p-3 border rounded mb-3 cursor-pointer d-flex justify-content-between align-items-center"
                                    :class="{ 'active-option': paymentMethod === 'qrcode' }"
                                    @click="paymentMethod = 'qrcode'">
                                    <div class="d-flex align-items-center">
                                        <div class="radio-circle mr-3"
                                            :class="{ 'active': paymentMethod === 'qrcode' }">
                                        </div>
                                        <span class="font-weight-bold">Scan QR Code</span>
                                    </div>
                                    <CIcon name="cil-qr-code" class="text-danger" />
                                </div>

                                <!-- Bank Transfer -->
                                <div class="payment-option p-3 border rounded mb-3 cursor-pointer d-flex justify-content-between align-items-center"
                                    :class="{ 'active-option': paymentMethod === 'bank' }"
                                    @click="paymentMethod = 'bank'">
                                    <div class="d-flex align-items-center">
                                        <div class="radio-circle mr-3" :class="{ 'active': paymentMethod === 'bank' }">
                                        </div>
                                        <span class="font-weight-bold">Bank Transfer</span>
                                    </div>
                                    <CIcon name="cil-bank" class="text-muted" />
                                </div>

                            </div>

                            <!-- QR Code Content -->
                            <div v-if="paymentMethod === 'qrcode'" class="mb-4 ">
                                <div class="qr-container border-dashed text-center p-5 rounded-lg bg-white w-100">
                                    <h6 class="font-weight-bold mb-4" style="color: #2c3e50;">Scan this QR Code to pay
                                    </h6>

                                    <div class="qr-wrapper p-2 d-inline-block rounded mb-4 position-relative">
                                        <div class="qr-border-dashed position-absolute w-100 h-100"
                                            style="top:0; left:0; border: 2px dashed #cbd5e0; border-radius: 12px; pointer-events: none;">
                                        </div>
                                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PAYMENT_DEMO_123"
                                            width="180" height="180" alt="QR Code" class="d-block p-2">
                                    </div>

                                    <p class="text-muted mb-0">Amount to pay: <span
                                            class="text-danger font-weight-bold h5 ml-1">$625</span></p>
                                </div>
                            </div>

                            <!-- Bank Transfer Content -->
                            <div v-if="paymentMethod === 'bank'" class="mb-4">
                                <div class="bg-white p-4 rounded-lg border">
                                    <h6 class="font-weight-bold mb-4 text-dark">Bank Account Details</h6>

                                    <div class="d-flex align-items-start p-4 mb-4 rounded-lg"
                                        style="background-color: #f8fafc;">
                                        <div class="mr-4 d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 shadow-sm"
                                            style="width: 56px; height: 56px; background-color: #e6fffa;">
                                            <CIcon name="cil-bank" size="xl" style="color: #38b2ac;" />
                                        </div>
                                        <div>
                                            <div class="font-weight-bold text-dark h5 mb-1">Kasikorn Bank (KBank)</div>
                                            <div class="text-muted mb-2">Artsy Studio Co., Ltd.</div>
                                            <div class="bg-white px-3 py-1 rounded border d-inline-block font-weight-bold text-dark h5 mb-0 shadow-sm"
                                                style="letter-spacing: 0.5px;">
                                                123-4-56789-0
                                            </div>
                                        </div>
                                    </div>

                                    <div class="p-3 rounded-lg small border-0"
                                        style="background-color: #ebf8ff; color: #4a5568;">
                                        Please transfer the exact amount of <span
                                            class="font-weight-bold text-dark">$625</span> and upload your transaction
                                        slip below.
                                    </div>
                                </div>
                            </div>

                            <!-- Upload Payment Proof -->
                            <h6 class="font-weight-bold mb-3">Upload Payment Proof</h6>

                            <!-- Hidden File Input -->
                            <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*"
                                class="d-none">

                            <!-- Upload Area (Clickable) -->
                            <div v-if="!paymentProofImage" @click="triggerUpload"
                                class="upload-area border-dashed rounded p-5 text-center mb-4 bg-white cursor-pointer position-relative">
                                <CIcon name="cil-cloud-upload" size="xl" class="text-muted mb-3" />
                                <div class="text-danger font-weight-bold">Upload a file</div>
                                <p class="text-muted small mb-0">or drag and drop</p>
                                <p class="text-muted small">PNG, JPG, GIF up to 10MB</p>
                            </div>

                            <!-- File Info (Success State) -->
                            <div v-else class="mb-2">
                                <div class="border-dashed rounded p-4 text-center bg-white position-relative d-flex flex-column align-items-center justify-content-center"
                                    style="height: 150px;">
                                    <CIcon name="cil-check" size="xl" class="text-success mb-2" />
                                    <div class="font-weight-bold text-dark">{{ paymentProofName }}</div>
                                    <div class="text-muted small">{{ paymentProofSize }}</div>
                                </div>
                                <div class="mt-2 text-left">
                                    <a href="#" @click.prevent="removeImage"
                                        class="text-danger small text-decoration-none">Remove file</a>
                                </div>
                            </div>

                            <!-- Confirm Button -->
                            <CButton block color="danger" size="lg" class="py-3 font-weight-bold shadow-sm"
                                style="background-color: #E55B5B; border: none;" @click="confirmPayment">
                                Confirm Payment
                            </CButton>

                        </CCardBody>
                    </CCard>

                </CCol>

                <!-- Right Column: Order Summary -->
                <CCol lg="4">
                    <!-- (Summary code remains same as before) -->
                    <CCard class="border-0 shadow-sm rounded-lg">
                        <CCardBody class="p-4">
                            <h5 class="font-weight-bold mb-4">Order Summary</h5>

                            <div v-for="(item, index) in cartItems" :key="index" class="d-flex mb-4">
                                <img :src="item.image" class="rounded mr-3 shadow-sm"
                                    style="width: 80px; height: 80px; object-fit: cover;">
                                <div class="w-100">
                                    <div class="d-flex justify-content-between">
                                        <h6 class="mb-1 font-weight-bold">{{ item.title }}</h6>
                                        <span class="font-weight-bold">{{ item.price }}</span>
                                    </div>
                                    <small class="text-muted d-block mb-2">{{ item.artist }}</small>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">Qty {{ item.quantity }}</small>
                                        <CLink href="#" @click.prevent="removeItem(item.id)"
                                            class="text-danger small text-decoration-none d-flex align-items-center">
                                            <CIcon name="cil-trash" size="sm" class="mr-1" /> Remove
                                        </CLink>
                                    </div>
                                </div>
                            </div>

                            <hr class="border-light my-4">

                            <div class="d-flex justify-content-between mb-2 text-muted small">
                                <span>Subtotal</span>
                                <span class="font-weight-bold text-dark">${{ subtotal }}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2 text-muted small">
                                <span>Shipping</span>
                                <span class="font-weight-bold text-dark">${{ shippingCost }}</span>
                            </div>

                            <div class="d-flex justify-content-between mt-4 mb-4">
                                <span class="font-weight-bold h5 mb-0">Total</span>
                                <span class="font-weight-bold h5 mb-0 text-danger">${{ total }}</span>
                            </div>

                            <div class="bg-light p-3 rounded d-flex align-items-start">
                                <CIcon name="cil-truck" class="text-muted mr-3 mt-1" />
                                <div class="ml-3">
                                    <div class="font-weight-bold small text-dark mb-1">Free Shipping on orders over
                                        $1000</div>
                                    <div class="text-muted small" style="font-size: 0.75rem;">Estimated delivery: 3-5
                                        business days</div>
                                </div>
                            </div>

                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'Payment',
    data() {
        return {
            currentStep: 1,
            paymentMethod: 'qrcode',
            paymentProofImage: null,
            paymentProofFile: null,
            paymentProofName: '',
            paymentProofSize: ''
        }
    },
    computed: {
        ...mapGetters('cart', ['cartItems', 'cartTotal', 'cartCount']),
        subtotal() {
            return this.cartTotal;
        },
        shippingCost() {
            return this.subtotal > 1000 ? 0 : 25;
        },
        total() {
            return this.subtotal + this.shippingCost;
        }
    },
    methods: {
        triggerUpload() {
            this.$refs.fileInput.click();
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                // Validate file type and size if needed
                if (file.size > 10 * 1024 * 1024) {
                    alert('File size exceeds 10MB limit.');
                    return;
                }

                this.paymentProofFile = file;
                this.paymentProofName = file.name;
                this.paymentProofSize = this.formatFileSize(file.size);
                // Create preview URL
                this.paymentProofImage = URL.createObjectURL(file);
            }
        },
        updateFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        formatFileSize(bytes) {
            return this.updateFileSize(bytes);
        },
        removeImage() {
            this.paymentProofImage = null;
            this.paymentProofFile = null;
            this.paymentProofName = '';
            this.paymentProofSize = '';
            // Reset input value so same file can be selected again
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = '';
            }
        },
        removeItem(id) {
            this.$store.dispatch('cart/removeFromCart', id);
        },
        confirmPayment() {
            if (this.cartItems.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            // Create order object
            const order = {
                id: 'ART-' + Math.floor(Math.random() * 10000),
                date: new Date().toLocaleDateString(),
                items: this.cartItems,
                paymentMethod: this.paymentMethod,
                subtotal: this.subtotal,
                shipping: this.shippingCost,
                total: this.total,
                paymentProof: this.paymentProofImage // In real app, upload file first and get URL
            };

            // Save order to store for Bill page
            this.$store.dispatch('cart/setLastOrder', order);

            // Clear Cart
            this.$store.dispatch('cart/clearCart');

            // Redirect to Bill page
            this.$router.push('/bill');
        }
    }
}
</script>

<style scoped>
.payment-page {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.step-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: #E55B5B;
    color: white;
    border-radius: 50%;
    font-size: 0.85rem;
    font-weight: bold;
}

.cursor-pointer {
    cursor: pointer;
}

/* Custom Input Styling */
::v-deep .h-50-px {
    height: 48px;
}

::v-deep .form-control {
    background-color: #f8f9fa;
}

::v-deep .form-control:focus {
    background-color: #fff;
    box-shadow: 0 0 0 0.2rem rgba(229, 91, 91, 0.15);
    border-color: #f8f9fa;
}

.card {
    transition: transform 0.2s;
}

/* Payment Option Styling */
.payment-option {
    transition: all 0.2s;
}

.active-option {
    border-color: #E55B5B !important;
    background-color: #fff5f5;
}

.radio-circle {
    width: 20px;
    height: 20px;
    border: 2px solid #adb5bd;
    border-radius: 50%;
    position: relative;
}

.radio-circle.active {
    border-color: #E55B5B;
}

.radio-circle.active::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background-color: #E55B5B;
    border-radius: 50%;
}

.border-dashed {
    border: 2px dashed #dee2e6;
}

.qr-container {
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.upload-area:hover {
    background-color: #fff;
    border-color: #E55B5B;
}
</style>
