<template>
    <CCol lg="8">

        <!-- Step 1: Shipping Information -->
        <CCard class="border-0 shadow-sm mb-4 rounded-lg overflow-hidden" v-if="currentStep === 1">
            <CCardHeader class="bg-white border-bottom-0 p-4 pb-2">
                <h5 class="font-weight-bold mb-0 text-dark d-flex align-items-center">
                    <span class="step-badge bg-main text-white mr-3">1</span>
                    <span>{{ $i18n.locale === 'en' ? 'Shipping & Billing Information' : 'ข้อมูลผู้จองและสถานที่จัดส่ง' }}</span>
                </h5>
            </CCardHeader>
            <CCardBody class="p-4 pt-3">
                <CRow>
                    <CCol md="12" class="mb-3">
                        <label class="font-weight-bold small text-muted">{{ $i18n.locale === 'en' ? 'Full Name' : 'ชื่อ-นามสกุล' }}</label>
                        <CInput v-model="form.name" placeholder="" class="bg-light border-0 shadow-none rounded-lg" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">{{ $i18n.locale === 'en' ? 'Personal Email' : 'อีเมล' }}</label>
                        <CInput v-model="form.email" placeholder="" type="email" class="bg-light border-0 shadow-none rounded-lg" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">{{ $i18n.locale === 'en' ? 'Telephone' : 'เบอร์โทรศัพท์' }}</label>
                        <CInput v-model="form.telephone" placeholder="" class="bg-light border-0 shadow-none rounded-lg" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">{{ $i18n.locale === 'en' ? 'Billing Address' : 'ที่อยู่ออกใบเสร็จ' }}</label>
                        <CTextarea v-model="form.bill" placeholder="" rows="3" class="bg-light border-0 shadow-none rounded-lg" />
                    </CCol>
                    <CCol md="6" class="mb-3">
                        <label class="font-weight-bold small text-muted">{{ $i18n.locale === 'en' ? 'Shipping Address' : 'ที่อยู่จัดส่ง' }}</label>
                        <CTextarea v-model="form.shipping" placeholder="" rows="3" class="bg-light border-0 shadow-none rounded-lg" />
                    </CCol>
                </CRow>

                <CButton block color="danger" size="lg" class="mt-4 py-3 font-weight-bold shadow-sm btn-main"
                    style="border: none; border-radius: 50px;" @click="handleProceedToPayment" :disabled="loading">
                    <CSpinner v-if="loading" size="sm" class="mr-2" />
                    {{ $i18n.locale === 'en' ? 'Confirm & Proceed to Payment' : 'ยืนยันและดำเนินการชำระเงิน' }}
                </CButton>
            </CCardBody>
        </CCard>

        <!-- Step 2: Payment Method -->
        <CCard class="border-0 shadow-sm mb-4 rounded-lg overflow-hidden" v-if="currentStep === 2">
            <CCardHeader class="bg-white border-bottom-0 p-4 pb-2">
                <h5 class="font-weight-bold mb-0 text-dark d-flex align-items-center">
                    <span class="step-badge bg-main text-white mr-3">2</span>
                    <span>{{ $i18n.locale === 'en' ? 'Select Payment Method' : 'ช่องทางการชำระเงิน' }}</span>
                </h5>
            </CCardHeader>
            <CCardBody class="p-4 pt-3">
                <!-- Reservation Expiry Notice -->
                <div class="alert alert-warning mb-4 shadow-sm border-0 d-flex align-items-start" style="border-radius: 12px; background-color: #fffaf0; border: 1px solid #ffe8cc; color: #d97706;">
                    <CIcon name="cil-clock" class="mr-3 mt-1 flex-shrink-0" size="lg" style="color: #f59e0b;" />
                    <div class="small">
                        <span class="font-weight-bold d-block mb-1" style="font-size: 0.95rem;">
                            {{ $i18n.locale === 'en' ? '24-Hour Payment Limit' : 'กำหนดเวลาชำระเงิน 24 ชั่วโมง' }}
                        </span>
                        <span>
                            {{ $i18n.locale === 'en' 
                                ? 'Your reserved artwork is held for 24 hours only. Please complete the transfer and upload the slip before the deadline, otherwise your reservation will be auto-cancelled.' 
                                : 'ผลงานชิ้นนี้จะถูกล็อกจองให้คุณเป็นเวลา 24 ชั่วโมงเท่านั้น กรุณาโอนเงินและส่งหลักฐานก่อนหมดเวลา มิฉะนั้นคำสั่งซื้อจะถูกยกเลิกโดยอัตโนมัติ' }}
                        </span>
                    </div>
                </div>

                <!-- Payment Options -->
                <div class="payment-options mb-4">
                    <!-- Scan QR Code -->
                    <div class="payment-option p-3 border rounded-lg mb-3 cursor-pointer d-flex justify-content-between align-items-center"
                        :class="{ 'active-option': paymentMethod === 'qrcode' }" @click="paymentMethod = 'qrcode'">
                        <div class="d-flex align-items-center">
                            <div class="radio-circle mr-3" :class="{ 'active': paymentMethod === 'qrcode' }">
                            </div>
                            <span class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Scan QR Code' : 'สแกนคิวอาร์โค้ด' }}</span>
                        </div>
                        <CIcon name="cil-qr-code" class="text-danger" />
                    </div>

                    <!-- Bank Transfer -->
                    <div class="payment-option p-3 border rounded-lg mb-3 cursor-pointer d-flex justify-content-between align-items-center"
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
                <div v-if="paymentMethod === 'qrcode'" class="mb-4">
                    <div class="qr-container border-dashed text-center p-4 rounded-lg bg-light w-100">
                        <h6 class="font-weight-bold mb-4" style="color: #2c3e50;">{{ $i18n.locale === 'en' ? 'Scan this QR Code to pay' : 'สแกนคิวอาร์โค้ดนี้เพื่อชำระเงิน' }}
                        </h6>

                        <div class="qr-wrapper p-2 d-inline-block rounded bg-white mb-4 position-relative shadow-sm">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PAYMENT_DEMO_123"
                                width="180" height="180" alt="QR Code" class="d-block p-1">
                        </div>

                        <p class="text-muted mb-0">{{ $i18n.locale === 'en' ? 'Amount to pay:' : 'ยอดที่ต้องชำระ:' }} <span
                                class="text-danger font-weight-bold h5 ml-1">฿{{ formatPrice(total) }}</span></p>
                    </div>
                </div>

                <!-- Bank Transfer Content -->
                <div v-if="paymentMethod === 'bank'" class="mb-4">
                    <div class="bg-light p-4 rounded-lg border">
                        <h6 class="font-weight-bold mb-4 text-dark">{{ $i18n.locale === 'en' ? 'Bank Account Details' : 'รายละเอียดบัญชีธนาคาร' }}</h6>

                        <div class="d-flex align-items-start p-3 mb-3 rounded-lg bg-white border">
                            <div class="mr-3 d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 shadow-sm"
                                style="width: 48px; height: 48px; background-color: #e6fffa;">
                                <CIcon name="cil-bank" size="lg" style="color: #38b2ac;" />
                            </div>
                            <div>
                                <div class="font-weight-bold text-dark mb-1" style="font-size: 0.95rem;">{{ $i18n.locale === 'en' ? 'Kasikorn Bank (KBank)' : 'ธนาคารกสิกรไทย' }}</div>
                                <div class="text-muted small mb-2">Artsy Studio Co., Ltd.</div>
                                <div class="bg-light px-3 py-1 rounded border d-inline-block font-weight-bold text-dark shadow-sm"
                                    style="letter-spacing: 0.5px; font-size: 1.1rem;">
                                    123-4-56789-0
                                </div>
                            </div>
                        </div>

                        <div class="p-3 rounded-lg small border-0" style="background-color: #ebf8ff; color: #2b6cb0;">
                            {{ $i18n.locale === 'en' ? 'Please transfer the specified amount and' : 'กรุณาโอนเงินตามยอดที่ระบุ และ' }} <strong>{{ $i18n.locale === 'en' ? 'upload the payment slip after transfer.' : 'หลังโอนเงินกรุณาอัพโหลดใบเสร็จด้วยครับ' }}</strong>
                        </div>
                    </div>
                </div>

                <!-- Upload Payment Proof -->
                <h6 class="font-weight-bold mb-3 text-dark">{{ $i18n.locale === 'en' ? 'Upload Payment Proof' : 'อัพโหลดหลักฐานการชำระเงิน' }}</h6>

                <!-- Hidden File Input -->
                <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" class="d-none">

                <!-- Upload Area (Clickable) -->
                <div v-if="!paymentProofImage" @click="triggerUpload"
                    class="upload-area border-dashed rounded-lg p-5 text-center mb-4 bg-light cursor-pointer position-relative">
                    <CIcon name="cil-cloud-upload" size="xl" class="text-muted mb-3" />
                    <div class="text-danger font-weight-bold">{{ $i18n.locale === 'en' ? 'Upload a file' : 'อัพโหลดไฟล์' }}</div>
                    <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'or drag and drop' : 'หรือลากและวาง' }}</p>
                    <p class="text-muted small">{{ $i18n.locale === 'en' ? 'PNG, JPG, GIF up to 10MB' : 'รองรับ PNG, JPG, GIF ขนาดไม่เกิน 10MB' }}</p>
                </div>

                <!-- File Info (Success State) -->
                <div v-else class="mb-4">
                    <div class="border-dashed rounded-lg p-4 text-center bg-light position-relative d-flex flex-column align-items-center justify-content-center"
                        style="height: 150px;">
                        <CIcon name="cil-check-circle" size="xl" class="text-success mb-2" />
                        <div class="font-weight-bold text-dark">{{ paymentProofName }}</div>
                        <div class="text-muted small">{{ paymentProofSize }}</div>
                    </div>
                    <div class="mt-2 text-left">
                        <a href="#" @click.prevent="removeImage" class="text-danger small text-decoration-none font-weight-bold">{{ $i18n.locale === 'en' ? 'Remove file' : 'ลบไฟล์' }}</a>
                    </div>
                </div>

                <!-- Confirm Button -->
                <CButton block color="danger" size="lg" class="py-3 font-weight-bold shadow btn-main"
                    style="border: none; border-radius: 50px;" @click="onConfirmPayment"
                    :disabled="loading || hasReservedItems">
                    <CIcon v-if="loading" name="cil-reload" class="mr-2 spinner-animation" />
                    {{ loading ? ($i18n.locale === 'en' ? 'Processing...' : 'กำลังดำเนินการ...') : (hasReservedItems ? ($i18n.locale === 'en' ? 'Unavailable' : 'ไม่พร้อมสั่งซื้อ') : ($i18n.locale === 'en' ? 'Submit Payment & Finish' : 'บันทึกและเสร็จสิ้น')) }}
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
        },
        currentStep: {
            type: Number,
            default: 1
        },
        createdOrder: {
            type: Object,
            default: () => null
        }
    },
    data() {
        return {
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
        },
        createdOrder: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.form.name = newVal.contact?.name || '';
                    this.form.email = newVal.contact?.email || '';
                    this.form.telephone = newVal.contact?.telephone || '';
                    this.form.bill = newVal.address?.bill || '';
                    this.form.shipping = newVal.address?.shipping || '';
                }
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
                let allUsers = this.users;
                if (!allUsers || allUsers.length === 0) {
                    allUsers = await this.$store.dispatch('user/get', {});
                }
                const currentUser = allUsers ? allUsers.find(u => u._id === this.userId) : null;
                if (currentUser) {
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
                if (file.size > 10 * 1024 * 1024) {
                    alert(this.$i18n.locale === 'en' ? 'File size exceeds 10MB limit.' : 'ขนาดไฟล์เกิน 10MB');
                    return;
                }

                this.paymentProofFile = file;
                this.paymentProofName = file.name;
                this.paymentProofSize = this.formatFileSize(file.size);
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
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = '';
            }
        },
        handleProceedToPayment() {
            const userId = this.$store.getters['auth/userId'];
            if (!userId) {
                this.$store.commit('dialog/showToast', { title: 'Authentication Required', message: this.$i18n.locale === 'en' ? 'Please login before confirming the order' : 'กรุณาเข้าสู่ระบบก่อนยืนยันคำสั่งซื้อ', variant: 'warning' });
                this.$store.commit('auth/showSignInModal', true);
                return;
            }

            if (!this.form.name || !this.form.email || !this.form.shipping) {
                alert(this.$i18n.locale === 'en' ? 'Please fill in all required shipping information.' : 'กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน');
                return;
            }

            this.$emit('create-order', this.form);
        },
        onConfirmPayment() {
            if (!this.paymentProofFile) {
                const confirmNoSlip = confirm(this.$i18n.locale === 'en' 
                    ? 'You haven\'t uploaded a payment slip. You can finish the order and upload it later in your Profile. Continue?' 
                    : 'คุณยังไม่ได้อัปโหลดสลิปชำระเงิน คุณสามารถดำเนินการต่อเพื่อปิดรายการและไปอัปโหลดภายหลังได้ ยืนยันหรือไม่?');
                if (!confirmNoSlip) {
                    return;
                }
            }

            this.$emit('submit-payment', {
                paymentMethod: this.paymentMethod,
                paymentProofFile: this.paymentProofFile
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
    width: 28px;
    height: 28px;
    border-radius: 50% !important;
    font-size: 0.85rem;
    font-weight: bold;
}

.bg-main {
    background-color: #612721 !important;
}

.btn-main {
    background-color: #612721 !important;
    border-color: #612721 !important;
    color: white !important;
    transition: all 0.3s ease;
}

.btn-main:hover {
    background-color: #4a1d18 !important;
    transform: translateY(-2px);
}

.cursor-pointer {
    cursor: pointer;
}

.active-option {
    border-color: #FEC260 !important;
    background-color: #fffaf0 !important;
}

.radio-circle {
    width: 20px;
    height: 20px;
    border: 2px solid #adb5bd;
    border-radius: 50%;
    position: relative;
}

.radio-circle.active {
    border-color: #612721;
}

.radio-circle.active::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background-color: #612721;
    border-radius: 50%;
}

.upload-area {
    border: 2px dashed #dee2e6;
    transition: all 0.2s;
}

.upload-area:hover {
    border-color: #612721;
    background-color: #f8fafc;
}

::v-deep .form-control:focus {
    background-color: #fff;
    box-shadow: 0 0 0 0.2rem rgba(97, 39, 33, 0.15);
    border-color: #612721;
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

.rounded-lg {
    border-radius: 12px !important;
}
</style>