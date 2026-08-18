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

                <!-- One payment channel with both QR and bank details -->
                <div class="payment-method-combined mb-4">
                    <div class="payment-method-heading d-flex align-items-center mb-4">
                        <div class="payment-method-icon mr-3">
                            <CIcon name="cil-bank" size="lg" />
                        </div>
                        <div>
                            <h6 class="font-weight-bold text-dark mb-1">{{ $i18n.locale === 'en' ? 'QR Code / Bank Transfer' : 'ชำระเงินด้วย QR Code หรือโอนผ่านบัญชีธนาคาร' }}</h6>
                            <div class="text-muted small">{{ $i18n.locale === 'en' ? 'Choose either method below using the same bank account.' : 'เลือกชำระได้ตามสะดวก โดยใช้บัญชีธนาคารเดียวกัน' }}</div>
                        </div>
                    </div>

                    <div class="payment-method-grid">
                        <div class="payment-column qr-container text-center">
                            <h6 class="font-weight-bold mb-3 text-dark">{{ $i18n.locale === 'en' ? 'Scan QR Code' : 'สแกน QR Code' }}</h6>
                            <div class="qr-wrapper p-2 d-inline-block rounded bg-white mb-3 position-relative shadow-sm">
                                <img src="/payment-qr-code.png"
                                    width="180" height="180" alt="QR Code สำหรับชำระเงิน" class="d-block p-1 qr-image">
                            </div>
                            <p class="text-muted mb-0">{{ $i18n.locale === 'en' ? 'Amount:' : 'ยอดชำระ:' }}
                                <span class="text-danger font-weight-bold h5 ml-1">฿{{ formatPrice(total) }}</span>
                            </p>
                        </div>

                        <div class="payment-column bank-container">
                            <h6 class="font-weight-bold mb-3 text-dark">{{ $i18n.locale === 'en' ? 'Bank Account Details' : 'ข้อมูลบัญชีธนาคาร' }}</h6>
                            <div class="bank-detail-row mb-3">
                                <span class="bank-detail-label">{{ $i18n.locale === 'en' ? 'Bank' : 'ธนาคาร' }}</span>
                                <strong>{{ $i18n.locale === 'en' ? 'Bangkok Bank, Mae Fah Luang Branch' : 'ธนาคารกรุงเทพฯ สาขาแม่ฟ้าหลวงฯ' }}</strong>
                            </div>
                            <div class="bank-detail-row mb-3">
                                <span class="bank-detail-label">{{ $i18n.locale === 'en' ? 'Account Name' : 'ชื่อบัญชี' }}</span>
                                <strong>{{ $i18n.locale === 'en' ? 'Mae Fah Luang University (Mae Fah Luang University Buddhist Art Fund)' : 'มหาวิทยาลัยแม่ฟ้าหลวง (กองทุนพุทธศิลปกรรมแห่งมหาวิทยาลัยแม่ฟ้าหลวง)' }}</strong>
                            </div>
                            <div class="bank-detail-row">
                                <span class="bank-detail-label">{{ $i18n.locale === 'en' ? 'Account Number' : 'เลขบัญชี' }}</span>
                                <div class="account-number">672-0-50576-4</div>
                            </div>
                        </div>
                    </div>

                    <div class="payment-note mt-3">
                        {{ $i18n.locale === 'en' ? 'After payment, please upload your payment slip below.' : 'หลังชำระเงิน กรุณาอัปโหลดหลักฐานการชำระเงินด้านล่าง' }}
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
            paymentMethod: 'bank',
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

.payment-method-combined {
    padding: 1.25rem;
    border: 1px solid rgba(97, 39, 33, 0.14);
    border-radius: 16px;
    background: linear-gradient(145deg, #fffdf9 0%, #faf7f2 100%);
    box-shadow: 0 10px 28px rgba(97, 39, 33, 0.07);
}

.payment-method-icon {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    color: #fff;
    background: linear-gradient(135deg, #612721, #8b4337);
}

.payment-method-grid {
    display: grid;
    grid-template-columns: minmax(210px, 0.8fr) minmax(280px, 1.2fr);
    gap: 1rem;
}

.payment-column {
    padding: 1.25rem;
    border: 1px solid rgba(97, 39, 33, 0.1);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.9);
}

.qr-image {
    width: 150px;
    height: 150px;
}

.bank-detail-row {
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #eee7df;
}

.bank-detail-row:last-child {
    padding-bottom: 0;
    border-bottom: 0;
}

.bank-detail-label {
    display: block;
    margin-bottom: 0.3rem;
    color: #8a7c78;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
}

.account-number {
    display: inline-block;
    padding: 0.45rem 0.8rem;
    border: 1px solid rgba(97, 39, 33, 0.16);
    border-radius: 8px;
    background: #f8f3ed;
    color: #612721;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: 1px;
}

.payment-note {
    padding: 0.8rem 1rem;
    border-radius: 10px;
    background: #fff5df;
    color: #96611f;
    font-size: 0.85rem;
    font-weight: 600;
}

@media (max-width: 767.98px) {
    .payment-method-combined {
        padding: 1rem;
    }

    .payment-method-grid {
        grid-template-columns: 1fr;
    }

    .payment-column {
        padding: 1rem;
    }

    .qr-image {
        width: 140px;
        height: 140px;
    }

    .payment-method-heading {
        align-items: flex-start !important;
    }
}

.border-dashed {
    border: 2px dashed #e2e8f0;
}

.rounded-lg {
    border-radius: 12px !important;
}
</style>
