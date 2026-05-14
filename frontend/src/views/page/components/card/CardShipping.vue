<template>
    <CCol lg="8">

        <!-- Step 1: Shipping Information -->
        <CCard class="border-0 shadow-sm mb-4 rounded-lg overflow-hidden">
            <CCardHeader class="bg-white border-bottom-0 p-4" :class="{ 'cursor-pointer': currentStep === 2 }"
                @click.native="currentStep = 1">
                <h5 class="font-weight-bold mb-0 d-flex align-items-center" :class="currentStep === 1 ? 'text-dark' : 'text-muted'">
                    <span class="step-badge mr-3" :class="{ 'bg-success text-white': currentStep === 2 }">1</span>
                    <span>{{ $i18n.locale === 'en' ? 'Shipping Information' : 'ข้อมูลการจัดส่ง' }}</span>
                    <CIcon name="cil-check-circle" v-if="currentStep === 2" class="ml-auto text-success" size="xl" />
                </h5>
            </CCardHeader>
            <CCardBody class="p-4 pt-0" v-show="currentStep === 1">
                <CRow>
                    <CCol md="12" class="mb-3">
                        <label class="font-weight-bold small text-muted">{{ $i18n.locale === 'en' ? 'Full Name' : 'ชื่อ-นามสกุล' }}</label>
                        <CInput v-model="form.name" placeholder="" class="bg-light border-0 shadow-none" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">{{ $i18n.locale === 'en' ? 'Personal Email' : 'อีเมล' }}</label>
                        <CInput v-model="form.email" placeholder="" type="email" class="bg-light border-0 shadow-none" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">{{ $i18n.locale === 'en' ? 'Telephone' : 'เบอร์โทรศัพท์' }}</label>
                        <CInput v-model="form.telephone" placeholder="" class="bg-light border-0 shadow-none" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">{{ $i18n.locale === 'en' ? 'Billing Address' : 'ที่อยู่ออกใบเสร็จ' }}</label>
                        <CTextarea v-model="form.bill" placeholder="" rows="3" class="bg-light border-0 shadow-none" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">{{ $i18n.locale === 'en' ? 'Shipping Address' : 'ที่อยู่จัดส่ง' }}</label>
                        <CTextarea v-model="form.shipping" placeholder="" rows="3" class="bg-light border-0 shadow-none" />
                    </CCol>
                </CRow>

                <CButton block color="dark" size="lg" class="mt-4 py-3 font-weight-bold shadow-sm"
                    style="background-color: #1a1a2e; border: none;" @click="currentStep = 2">
                    {{ $i18n.locale === 'en' ? 'Continue to Payment' : 'ดำเนินการชำระเงิน' }}
                </CButton>
            </CCardBody>
        </CCard>

        <!-- Step 2: Payment Method -->
        <CCard class="border-0 shadow-sm mb-4 rounded-lg">
            <CCardHeader class="bg-white border-bottom-0 p-4">
                <h5 class="font-weight-bold mb-0 d-flex align-items-center" :class="currentStep === 2 ? 'text-dark' : 'text-muted'">
                    <span class="step-badge mr-3" :class="{ 'bg-success text-white': false }">2</span>
                    <span>{{ $i18n.locale === 'en' ? 'Payment Method' : 'ช่องทางการชำระเงิน' }}</span>
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
                            <span class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Scan QR Code' : 'สแกนคิวอาร์โค้ด' }}</span>
                        </div>
                        <CIcon name="cil-qr-code" class="text-danger" />
                    </div>

                    <!-- Bank Transfer -->
                    <div class="payment-option p-3 border rounded mb-3 cursor-pointer d-flex justify-content-between align-items-center"
                        :class="{ 'active-option': paymentMethod === 'bank' }" @click="paymentMethod = 'bank'">
                        <div class="d-flex align-items-center">
                            <div class="radio-circle mr-3" :class="{ 'active': paymentMethod === 'bank' }">
                            </div>
                            <span class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Bank Transfer' : 'โอนเงินผ่านธนาคาร' }}</span>
                        </div>
                        <CIcon name="cil-bank" class="text-muted" />
                    </div>

                </div>

                <!-- QR Code Content -->
                <div v-if="paymentMethod === 'qrcode'" class="mb-4 ">
                    <div class="qr-container border-dashed text-center p-5 rounded-lg bg-white w-100">
                        <h6 class="font-weight-bold mb-4" style="color: #2c3e50;">{{ $i18n.locale === 'en' ? 'Scan this QR Code to pay' : 'สแกนคิวอาร์โค้ดนี้เพื่อชำระเงิน' }}
                        </h6>

                        <div class="qr-wrapper p-2 d-inline-block rounded mb-4 position-relative">
                            <div class="qr-border-dashed position-absolute w-100 h-100"
                                style="top:0; left:0; border: 2px dashed #cbd5e0; border-radius: 12px; pointer-events: none;">
                            </div>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PAYMENT_DEMO_123"
                                width="180" height="180" alt="QR Code" class="d-block p-2">
                        </div>

                        <p class="text-muted mb-0">{{ $i18n.locale === 'en' ? 'Amount to pay:' : 'ยอดที่ต้องชำระ:' }} <span
                                class="text-danger font-weight-bold h5 ml-1">฿{{ formatPrice(total) }}</span></p>
                    </div>
                </div>

                <!-- Bank Transfer Content -->
                <div v-if="paymentMethod === 'bank'" class="mb-4">
                    <div class="bg-white p-4 rounded-lg border">
                        <h6 class="font-weight-bold mb-4 text-dark">{{ $i18n.locale === 'en' ? 'Bank Account Details' : 'รายละเอียดบัญชีธนาคาร' }}</h6>

                        <div class="d-flex align-items-start p-4 mb-4 rounded-lg" style="background-color: #f8fafc;">
                            <div class="mr-4 d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 shadow-sm"
                                style="width: 56px; height: 56px; background-color: #e6fffa;">
                                <CIcon name="cil-bank" size="xl" style="color: #38b2ac;" />
                            </div>
                            <div>
                                <div class="font-weight-bold text-dark h5 mb-1">{{ $i18n.locale === 'en' ? 'Kasikorn Bank (KBank)' : 'ธนาคารกสิกรไทย' }}</div>
                                <div class="text-muted mb-2">Artsy Studio Co., Ltd.</div>
                                <div class="bg-white px-3 py-1 rounded border d-inline-block font-weight-bold text-dark h5 mb-0 shadow-sm"
                                    style="letter-spacing: 0.5px;">
                                    123-4-56789-0
                                </div>
                            </div>
                        </div>

                        <div class="p-3 rounded-lg small border-0" style="background-color: #ebf8ff; color: #4a5568;">
                            {{ $i18n.locale === 'en' ? 'Please transfer the specified amount and' : 'กรุณาโอนเงินตามยอดที่ระบุ และ' }} <strong>{{ $i18n.locale === 'en' ? 'upload the payment slip after transfer.' : 'หลังโอนเงินกรุณาอัพโหลดใบเสร็จด้วยครับ' }}</strong>
                        </div>
                    </div>
                </div>

                <!-- Upload Payment Proof -->
                <h6 class="font-weight-bold mb-3">{{ $i18n.locale === 'en' ? 'Upload Payment Proof' : 'อัพโหลดหลักฐานการชำระเงิน' }}</h6>

                <!-- Hidden File Input -->
                <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" class="d-none">

                <!-- Upload Area (Clickable) -->
                <div v-if="!paymentProofImage" @click="triggerUpload"
                    class="upload-area border-dashed rounded p-5 text-center mb-4 bg-white cursor-pointer position-relative">
                    <CIcon name="cil-cloud-upload" size="xl" class="text-muted mb-3" />
                    <div class="text-danger font-weight-bold">{{ $i18n.locale === 'en' ? 'Upload a file' : 'อัพโหลดไฟล์' }}</div>
                    <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'or drag and drop' : 'หรือลากและวาง' }}</p>
                    <p class="text-muted small">{{ $i18n.locale === 'en' ? 'PNG, JPG, GIF up to 10MB' : 'รองรับ PNG, JPG, GIF ขนาดไม่เกิน 10MB' }}</p>
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
                        <a href="#" @click.prevent="removeImage" class="text-danger small text-decoration-none">{{ $i18n.locale === 'en' ? 'Remove file' : 'ลบไฟล์' }}</a>
                    </div>
                </div>

                <!-- Confirm Button -->
                <CButton block color="danger" size="lg" class="py-3 font-weight-bold shadow-sm"
                    style="background-color: #E55B5B; border: none;" @click="onConfirmPayment"
                    :disabled="loading || hasReservedItems">
                    <CIcon v-if="loading" name="cil-reload" class="mr-2 spinner-animation" />
                    {{ loading ? ($i18n.locale === 'en' ? 'Processing...' : 'กำลังดำเนินการ...') : (hasReservedItems ? ($i18n.locale === 'en' ? 'Unavailable' : 'ไม่พร้อมสั่งซื้อ') : ($i18n.locale === 'en' ? 'Confirm Order' : 'ยืนยันการสั่งซื้อ')) }}
                </CButton>

            </CCardBody>
        </CCard>

    </CCol>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'CardShipping',
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        hasReservedItems: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            currentStep: 1,
            paymentMethod: 'qrcode',
            paymentProofImage: null,
            paymentProofFile: null,
            paymentProofName: '',
            paymentProofSize: '',
            form: {
                name: '',
                email: '',
                telephone: '',
                bill: '',
                shipping: ''
            }
        }
    },
    computed: {
        ...mapGetters('cart', ['cartFinalTotal']),
        ...mapGetters({
            userId: 'auth/userId',
            users: 'user/user'
        }),
        total() {
            return this.cartFinalTotal;
        },
        isLoggedIn() {
            return !!this.userId;
        }
    },
    watch: {
        isLoggedIn(newVal) {
            if (newVal) {
                this.autofillUserData();
            }
        }
    },
    async mounted() {
        if (this.isLoggedIn) {
            await this.autofillUserData();
        }
    },
    methods: {
        async autofillUserData() {
            try {
                // Ensure users are loaded
                let allUsers = this.users;
                if (!allUsers || allUsers.length === 0) {
                    allUsers = await this.$store.dispatch('user/get', {});
                }
                const currentUser = allUsers ? allUsers.find(u => u._id === this.userId) : null;
                if (currentUser) {
                    // Extract name
                    let nameStr = '';
                    if (Array.isArray(currentUser.name)) {
                        const nameTh = currentUser.name.find(n => n.key === 'th');
                        const nameEn = currentUser.name.find(n => n.key === 'en');
                        nameStr = (nameTh ? nameTh.value : '') || (nameEn ? nameEn.value : '');
                    }
                    
                    this.form.name = this.form.name || nameStr;
                    this.form.email = this.form.email || (currentUser.contact ? currentUser.contact.personalEmail : '');
                    this.form.telephone = this.form.telephone || (currentUser.contact ? currentUser.contact.telephone : '');
                    this.form.bill = this.form.bill || (currentUser.address ? currentUser.address.bill : '');
                    this.form.shipping = this.form.shipping || (currentUser.address ? currentUser.address.shipping : '');
                }
            } catch (e) {
                console.error('Error autofilling user data', e);
            }
        },
        triggerUpload() {
            this.$refs.fileInput.click();
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                // Validate file type and size if needed
                if (file.size > 10 * 1024 * 1024) {
                    alert(this.$i18n.locale === 'en' ? 'File size exceeds 10MB limit.' : 'ขนาดไฟล์เกิน 10MB');
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
            // Check Login Status first
            if (!this.isLoggedIn) {
                this.$store.commit('dialog/showToast', { title: 'Authentication Required', message: this.$i18n.locale === 'en' ? 'Please login before confirming the order' : 'กรุณาเข้าสู่ระบบก่อนยืนยันคำสั่งซื้อ', variant: 'warning' });
                this.$store.commit('auth/isSignIn', true);
                return;
            }

            // Basic validation
            if (!this.form.name || !this.form.email || !this.form.shipping) {
                alert(this.$i18n.locale === 'en' ? 'Please fill in all required shipping information.' : 'กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน');
                this.currentStep = 1;
                return;
            }

            // Note: We removed mandatory slip validation to allow "Book now, pay later" logic.
            // But we can show a confirmation if they haven't uploaded yet.
            if (!this.paymentProofFile) {
                const confirmNoSlip = confirm(this.$i18n.locale === 'en' 
                    ? 'You haven\'t uploaded a payment slip. You can still confirm the order and upload it later in your Profile. Continue?' 
                    : 'คุณยังไม่ได้อัปโหลดสลิปชำระเงิน คุณสามารถยืนยันรายการเพื่อจองสินค้าไว้ก่อน แล้วค่อยอัปโหลดภายหลังได้ที่หน้าโปรไฟล์ของคุณ ยืนยันการจองหรือไม่?');
                if (!confirmNoSlip) return;
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

::v-deep .form-control:focus {
    background-color: #fff;
    box-shadow: 0 0 0 0.2rem rgba(229, 91, 91, 0.25);
    border-color: #E55B5B;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner-animation {
  animation: spin 1s linear infinite;
}

.qr-container {
    background-color: #f8fafc;
}

.border-dashed {
    border: 2px dashed #e2e8f0;
}
</style>