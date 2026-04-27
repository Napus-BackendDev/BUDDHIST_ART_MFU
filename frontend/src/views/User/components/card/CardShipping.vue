<template>
    <CCol lg="8">

        <!-- Step 1: Shipping Information -->
        <CCard class="border-0 shadow-sm mb-4 rounded-lg overflow-hidden">
            <CCardHeader class="bg-white border-bottom-0 p-4" :class="{ 'cursor-pointer': currentStep === 2 }"
                @click.native="currentStep = 1">
                <h5 class="font-weight-bold mb-0 d-flex align-items-center" :class="currentStep === 1 ? 'text-dark' : 'text-muted'">
                    <span class="step-badge mr-3" :class="{ 'bg-success text-white': currentStep === 2 }">1</span>
                    <span>Shipping Information</span>
                    <CIcon name="cil-check-circle" v-if="currentStep === 2" class="ml-auto text-success" size="xl" />
                </h5>
            </CCardHeader>
            <CCardBody class="p-4 pt-0" v-show="currentStep === 1">
                <CRow>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">First Name</label>
                        <CInput v-model="form.firstName" placeholder="" class="bg-light border-0 shadow-none" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">Last Name</label>
                        <CInput v-model="form.lastName" placeholder="" class="bg-light border-0 shadow-none" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">Email Address</label>
                        <CInput v-model="form.email" placeholder="" class="bg-light border-0 shadow-none" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">Phone Number</label>
                        <CInput v-model="form.phone" placeholder="" class="bg-light border-0 shadow-none" />
                    </CCol>
                    <CCol md="12" class="mb-3">
                        <label class="font-weight-bold small text-muted">Address</label>
                        <CInput v-model="form.address" placeholder="" class="bg-light border-0 shadow-none" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">City</label>
                        <CInput v-model="form.city" placeholder="" class="bg-light border-0 shadow-none" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">Postal Code</label>
                        <CInput v-model="form.postalCode" placeholder="" class="bg-light border-0 shadow-none" />
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
                <h5 class="font-weight-bold mb-0 d-flex align-items-center" :class="currentStep === 2 ? 'text-dark' : 'text-muted'">
                    <span class="step-badge mr-3" :class="{ 'bg-success text-white': false }">2</span>
                    <span>Payment Method</span>
                </h5>
            </CCardHeader>
            <CCardBody class="p-4 pt-0" v-show="currentStep === 2">

                <!-- Payment Options -->
                <div class="payment-options mb-4">
                    <!-- Scan QR Code -->
                    <div class="payment-option p-3 border rounded mb-3 cursor-pointer d-flex justify-content-between align-items-center"
                        :class="{ 'active-option': paymentMethod === 'qrcode' }" @click="paymentMethod = 'qrcode'">
                        <div class="d-flex align-items-center">
                            <div class="radio-circle mr-3" :class="{ 'active': paymentMethod === 'qrcode' }">
                            </div>
                            <span class="font-weight-bold">Scan QR Code</span>
                        </div>
                        <CIcon name="cil-qr-code" class="text-danger" />
                    </div>

                    <!-- Bank Transfer -->
                    <div class="payment-option p-3 border rounded mb-3 cursor-pointer d-flex justify-content-between align-items-center"
                        :class="{ 'active-option': paymentMethod === 'bank' }" @click="paymentMethod = 'bank'">
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
                                class="text-danger font-weight-bold h5 ml-1">฿{{ formatPrice(total) }}</span></p>
                    </div>
                </div>

                <!-- Bank Transfer Content -->
                <div v-if="paymentMethod === 'bank'" class="mb-4">
                    <div class="bg-white p-4 rounded-lg border">
                        <h6 class="font-weight-bold mb-4 text-dark">Bank Account Details</h6>

                        <div class="d-flex align-items-start p-4 mb-4 rounded-lg" style="background-color: #f8fafc;">
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

                        <div class="p-3 rounded-lg small border-0" style="background-color: #ebf8ff; color: #4a5568;">
                            กรุณาโอนเงินตามยอดที่ระบุ และ <strong>หลังโอนเงินกรุณา อัพ ใบเสร็จด้วยครับ</strong>
                        </div>
                    </div>
                </div>

                <!-- Upload Payment Proof -->
                <h6 class="font-weight-bold mb-3">Upload Payment Proof</h6>

                <!-- Hidden File Input -->
                <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" class="d-none">

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
                        <a href="#" @click.prevent="removeImage" class="text-danger small text-decoration-none">Remove
                            file</a>
                    </div>
                </div>

                <!-- Confirm Button -->
                <CButton block color="danger" size="lg" class="py-3 font-weight-bold shadow-sm"
                    style="background-color: #E55B5B; border: none;" @click="onConfirmPayment">
                    Confirm Payment
                </CButton>

            </CCardBody>
        </CCard>

    </CCol>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'CardShipping',
    data() {
        return {
            currentStep: 1,
            paymentMethod: 'qrcode',
            paymentProofImage: null,
            paymentProofFile: null,
            paymentProofName: '',
            paymentProofSize: '',
            form: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                postalCode: ''
            }
        }
    },
    computed: {
        ...mapGetters('cart', ['cartFinalTotal']),
        total() {
            return this.cartFinalTotal;
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
        formatPrice(value) {
            if (value === undefined || value === null) return '0';
            return parseFloat(value).toLocaleString('en-US');
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
        onConfirmPayment() {
            // Basic validation
            if (!this.form.firstName || !this.form.email || !this.form.address) {
                alert('Please fill in all required shipping information.');
                this.currentStep = 1;
                return;
            }

            this.$emit('confirm-payment', {
                paymentMethod: this.paymentMethod,
                paymentProofImage: this.paymentProofImage,
                paymentProofFile: this.paymentProofFile,
                shippingForm: this.form
            });
        }
    }
}
</script>

<style scoped>
.step-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50% !important;
    font-size: 0.8rem;
    font-weight: bold;
    transition: all 0.3s ease;
}

.cursor-pointer {
    cursor: pointer;
}

.active-option {
    border-color: #E55B5B !important;
    background-color: #fff5f5 !important;
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

.upload-area {
    border: 2px dashed #dee2e6;
    transition: all 0.2s;
}

.upload-area:hover {
    border-color: #E55B5B;
    background-color: #fcfcfc;
}

.qr-container {
    background-color: #f8fafc;
}

.border-dashed {
    border: 2px dashed #e2e8f0;
}
</style>