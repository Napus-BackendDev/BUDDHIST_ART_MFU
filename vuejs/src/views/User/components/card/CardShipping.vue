<template>
    <CCol lg="8">

        <!-- Step 1: Shipping Information -->
        <CCard class="border-0 shadow-sm mb-4 rounded-lg overflow-hidden">
            <CCardHeader class="bg-white border-bottom-0 p-4" :class="{ 'cursor-pointer': currentStep === 2 }"
                @click.native="currentStep = 1">
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
                    <span class="step-badge mr-2" :class="{ 'bg-light text-muted': currentStep === 1 }">2</span> Payment
                    Method
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
                                class="text-danger font-weight-bold h5 ml-1">$625</span></p>
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
                            Please transfer the exact amount of <span class="font-weight-bold text-dark">$625</span> and
                            upload your transaction
                            slip below.
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
export default {
    name: 'CardShipping',
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
        onConfirmPayment() {
            this.$emit('confirm-payment', {
                paymentMethod: this.paymentMethod,
                paymentProofImage: this.paymentProofImage
            });
        }
    }
}
</script>