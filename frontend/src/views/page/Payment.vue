<template>
    <div class="payment-page bg-light min-vh-100 py-5">
        <CContainer>
            <!-- AVAILABILITY WARNING -->
            <div class="row" v-if="currentStep !== 3">
                <div class="col-lg-8">
                    <transition name="fade">
                        <div v-if="hasReservedItems" class="alert alert-danger mb-4 shadow-sm border-0 d-flex align-items-center" style="border-radius: 12px; background-color: #fff5f5; color: #e55b5b;">
                            <CIcon name="cil-warning" class="mr-3" size="xl" />
                            <div>
                                <h6 class="font-weight-bold mb-1">{{ $i18n.locale === 'en' ? 'Items Unavailable' : 'สินค้าไม่พร้อมสั่งซื้อ' }}</h6>
                                <p class="small mb-0">{{ $i18n.locale === 'en' ? 'One or more items in your cart have just been reserved by someone else. Please return to cart.' : 'มีสินค้าบางรายการในตะกร้าของคุณถูกจองโดยผู้อื่นแล้วเมื่อสักครู่ กรุณากลับไปที่ตะกร้าสินค้า' }}</p>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>

            <!-- BACK BUTTON AND HEADER -->
            <div class="mb-4 d-flex justify-content-between align-items-center flex-wrap" v-if="currentStep !== 3">
                <div>
                    <CLink href="#" @click.prevent="$router.go(-1)" class="text-muted small text-decoration-none">
                        <CIcon name="cil-arrow-left" size="sm" class="mr-1" /> {{ $i18n.locale === 'en' ? 'Back to Shopping' : 'กลับไปช้อปปิ้ง' }}
                    </CLink>
                    <h2 class="font-weight-bold mt-2" style="color: #2c3e50;">{{ $i18n.locale === 'en' ? 'Checkout' : 'ชำระเงิน' }}</h2>
                </div>
            </div>

            <!-- STEP WIZARD PROGRESS BAR -->
            <div class="wizard-progress-bar bg-white shadow-sm p-4 mb-5 rounded-xl">
                <div class="d-flex align-items-center justify-content-between position-relative px-md-5">
                    <div class="progress-line-track"></div>
                    <div class="progress-line" :style="progressLineStyle"></div>
                    
                    <!-- Step 1 -->
                    <div class="step-item" :class="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
                        <div class="step-icon-circle shadow-sm">
                            <span v-if="currentStep > 1"><CIcon name="cil-check" /></span>
                            <span v-else>1</span>
                        </div>
                        <div class="step-label font-weight-bold mt-2">{{ $i18n.locale === 'en' ? 'Information' : 'ใส่ข้อมูล' }}</div>
                    </div>
                    
                    <!-- Step 2 -->
                    <div class="step-item" :class="{ 'active': currentStep === 2, 'completed': currentStep > 2 }">
                        <div class="step-icon-circle shadow-sm">
                            <span v-if="currentStep > 2"><CIcon name="cil-check" /></span>
                            <span v-else>2</span>
                        </div>
                        <div class="step-label font-weight-bold mt-2">{{ $i18n.locale === 'en' ? 'Payment' : 'จ่ายเงิน' }}</div>
                    </div>
                    
                    <!-- Step 3 -->
                    <div class="step-item" :class="{ 'active': currentStep === 3, 'completed': false }">
                        <div class="step-icon-circle shadow-sm">
                            <span>3</span>
                        </div>
                        <div class="step-label font-weight-bold mt-2">{{ $i18n.locale === 'en' ? 'Confirmation' : 'ได้รับใบจอง' }}</div>
                    </div>
                </div>
            </div>

            <!-- STEP CONTENT -->
            <CRow v-if="currentStep !== 3">
                <!-- Left: Form Steps (Step 1 and Step 2 handled by CardShipping) -->
                <CardShipping 
                    ref="cardShipping" 
                    :loading="loading" 
                    :hasReservedItems="hasReservedItems" 
                    :current-step.sync="currentStep" 
                    @create-order="handleCreateOrder" 
                    @submit-payment="handleSubmitPayment" 
                />
                
                <!-- Right: Order Summary -->
                <CardOrderSummary />
            </CRow>

            <!-- STEP 3: CONFIRMATION / RECEIPT SCREEN -->
            <div v-else class="receipt-step-container py-4">
                <div class="text-center">
                    <!-- Success Icon -->
                    <div class="mb-4 animate-scale-up">
                        <div class="rounded-circle d-inline-flex align-items-center justify-content-center"
                            style="width: 80px; height: 80px; background-color: #d1fae5; border: 2px solid #a7f3d0;">
                            <CIcon name="cil-check" size="3xl" style="color: #38a169;" />
                        </div>
                    </div>

                    <h2 class="font-weight-bold mb-3 text-dark">{{ $i18n.locale === 'en' ? 'Order Confirmed!' : 'ยืนยันคำสั่งซื้อสำเร็จ!' }}</h2>
                    <p class="text-muted mb-5 max-w-md mx-auto">
                        {{ $i18n.locale === 'en' ? 'Thank you for your purchase. Your order' : 'ขอบคุณสำหรับการสั่งซื้อ หมายเลขคำสั่งซื้อของคุณ' }} <span class="font-weight-bold text-dark">{{ order.orderNumber || order._id }}</span> {{ $i18n.locale === 'en' ? 'has been received and is being processed.' : 'ได้รับการยืนยันและกำลังดำเนินการ' }}
                    </p>

                    <!-- Order Details Card -->
                    <CCard class="border-0 shadow-lg mx-auto mb-5 text-left" style="max-width: 550px; border-radius: 16px; overflow: hidden;">
                        <!-- Colored Top Border -->
                        <div style="height: 6px; background: linear-gradient(90deg, #612721, #FEC260); border-radius: 16px 16px 0 0;"></div>
                        <CCardHeader class="bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 class="font-weight-bold mb-0 text-dark">{{ $i18n.locale === 'en' ? 'Order Details' : 'รายละเอียดคำสั่งซื้อ' }}</h5>
                            <CLink href="#" class="text-danger small font-weight-bold text-decoration-none d-flex align-items-center" @click.prevent="downloadBilling">
                                <CIcon name="cil-cloud-download" size="sm" class="mr-1" /> {{ $i18n.locale === 'en' ? 'Download Receipt' : 'ดาวน์โหลดใบเสร็จ' }}
                            </CLink>
                        </CCardHeader>
                        <CCardBody class="p-4">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted small">{{ $i18n.locale === 'en' ? 'Order Number' : 'หมายเลขคำสั่งซื้อ' }}</span>
                                <span class="font-weight-bold text-dark small">{{ order.orderNumber || order._id }}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted small">{{ $i18n.locale === 'en' ? 'Date' : 'วันที่' }}</span>
                                <span class="font-weight-bold text-dark small">{{ order.date }}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-4">
                                <span class="text-muted small">{{ $i18n.locale === 'en' ? 'Payment Method' : 'ช่องทางการชำระเงิน' }}</span>
                                <span class="font-weight-bold text-dark small text-capitalize">{{ order.paymentMethod === 'qrcode' ? ($i18n.locale === 'en' ? 'QR Code' : 'คิวอาร์โค้ด') : ($i18n.locale === 'en' ? 'Bank Transfer' : 'โอนเงินธนาคาร') }}</span>
                            </div>

                            <!-- Product Items -->
                            <div v-for="(item, index) in order.items" :key="index" class="rounded p-2 mb-3 bg-light border d-flex align-items-center">
                                <img :src="item.image" class="rounded mr-3" style="width: 55px; height: 55px; object-fit: cover;">
                                <div class="w-100">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div class="font-weight-bold text-dark small">
                                                {{ getName($i18n.locale, item.title) }}
                                                <span v-if="isReserved(item)" class="badge badge-warning ml-2">{{ $i18n.locale === 'en' ? 'Reserved' : 'จองแล้ว' }}</span>
                                            </div>
                                            <div class="text-muted extra-small mt-1" v-if="item.artist">
                                                {{ $i18n.locale === 'en' ? 'by' : 'โดย' }} {{ getName($i18n.locale, item.artist) }}
                                            </div>
                                        </div>
                                        <div class="font-weight-bold text-danger">฿{{ formatPrice(item.price) }}</div>
                                    </div>
                                </div>
                            </div>

                            <hr class="border-light my-3">

                            <div class="d-flex justify-content-between mb-2 text-muted small">
                                <span>{{ $i18n.locale === 'en' ? 'Subtotal' : 'ยอดรวม' }}</span>
                                <span class="font-weight-bold text-dark">฿{{ formatPrice(order.subtotal) }}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2 text-muted small">
                                <span>{{ $i18n.locale === 'en' ? 'Shipping' : 'ค่าจัดส่ง' }}</span>
                                <span class="font-weight-bold text-dark">฿{{ formatPrice(order.shipping) }}</span>
                            </div>

                            <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-3">
                                <span class="font-weight-bold text-dark">{{ $i18n.locale === 'en' ? 'Total Paid' : 'ยอดสุทธิ' }}</span>
                                <span class="font-weight-bold text-danger h5 mb-0">฿{{ formatPrice(order.total) }}</span>
                            </div>
                        </CCardBody>
                    </CCard>

                    <!-- Action Buttons -->
                    <div class="d-flex justify-content-center">
                        <CButton color="danger" class="px-5 py-2 font-weight-bold shadow hover-lift mr-3 btn-main" style="min-width: 160px; border-radius: 50px;" to="/">
                            {{ $i18n.locale === 'en' ? 'Return to Home' : 'กลับหน้าหลัก' }}
                        </CButton>
                        <CButton color="white" class="px-5 py-2 font-weight-bold shadow-sm border hover-lift btn-outline-dark" style="min-width: 160px; border-radius: 50px;" @click="downloadBilling">
                            <CIcon name="cil-cloud-download" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Download Receipt' : 'ดาวน์โหลดใบเสร็จ' }}
                        </CButton>
                    </div>
                </div>
            </div>
        </CContainer>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CardShipping from './components/card/CardShipping.vue';
import CardOrderSummary from './components/card/CardOrderSummary.vue';
import i18nMixin from '@/mixins/i18nMixin';

export default {
    name: 'Payment',
    mixins: [i18nMixin],
    components: {
        CardShipping,
        CardOrderSummary
    },
    data() {
        return {
            loading: false,
            createdOrder: null,
            currentStep: 1,
            syncTimer: null
        }
    },
    created() {
        const userId = this.$store.getters['auth/userId'];
        if (!userId) {
            this.$store.commit('dialog/showToast', {
                title: 'Authentication Required',
                message: this.$i18n.locale === 'en' ? 'Please login before checking out' : 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า',
                variant: 'warning'
            });
            this.$store.commit('auth/isSignIn', true);
            this.$router.push('/');
            return;
        }

        // Load initial step from query param if available
        if (this.$route.query.step) {
            const stepNum = parseInt(this.$route.query.step);
            if (stepNum === 3 && this.lastOrder) {
                this.currentStep = 3;
            }
        }
        this.fetchInitialData();
    },
    computed: {
        ...mapGetters('cart', ['cartItems', 'cartTotal', 'cartShippingCost', 'cartFinalTotal', 'lastOrder']),
        order() {
            return this.lastOrder || this.createdOrder || {};
        },
        subtotal() {
            return this.cartTotal || 0;
        },
        shippingCost() {
            return (this.subtotal > 1000 || this.subtotal === 0) ? 0 : 25;
        },
        total() {
            return this.subtotal + this.shippingCost;
        },
        progressLineStyle() {
            let widthPercent = '0%';
            if (this.currentStep === 2) widthPercent = '50%';
            if (this.currentStep === 3) widthPercent = '100%';
            return {
                width: widthPercent
            };
        },
        hasReservedItems() {
            // If the order has already been successfully created for THIS user in Step 1,
            // the items are "Reserved" for us! So we don't show the warning.
            if (this.createdOrder) return false;

            return this.cartItems.some(item => {
                if (!item.status) return false;
                const appEn = this.getName('en', item.status.approval);
                const appTh = this.getName('th', item.status.approval);
                const saleEn = this.getName('en', item.status.sale);
                const saleTh = this.getName('th', item.status.sale);
                return appEn === 'Reserved' || appTh === 'รอชำระเงิน' || saleEn === 'Sold Out' || saleTh === 'ขายแล้ว';
            });
        }
    },
    methods: {
        async fetchInitialData() {
            this.refreshStatuses();
        },
        async handleCreateOrder(shippingForm) {
            console.log(`[Checkout Flow] Creating Order...`, shippingForm);
            if (this.cartItems.length === 0) {
                alert(this.$i18n.locale === 'en' ? 'Your cart is empty!' : 'ตะกร้าสินค้าของคุณว่างเปล่า!');
                return;
            }

            try {
                this.loading = true;
                // Final check for Reserved status
                for (let item of this.cartItems) {
                    const latest = await this.$store.dispatch('artwork/explore', { _id: item._id });
                    if (latest && latest.status && latest.status.approval) {
                        const status = this.getName('en', latest.status.approval);
                        if (status === 'Reserved') {
                            alert(this.$i18n.locale === 'en' ? `Artwork "${item.title[0].value}" has just been reserved by someone else. Please return to cart.` : `ผลงาน "${item.title[0].value}" เพิ่งถูกจองโดยผู้อื่น กรุณากลับไปที่ตะกร้าสินค้า`);
                            this.loading = false;
                            return;
                        }
                    }
                }

                // Prepare order details
                const userId = this.$store.getters['auth/userId'];
                const orderData = {
                    artwork: this.cartItems.map(item => item._id),
                    user: userId || null,
                    contact: {
                        name: shippingForm.name,
                        telephone: shippingForm.telephone,
                        email: shippingForm.email
                    },
                    address: {
                        shipping: shippingForm.shipping,
                        bill: shippingForm.bill || shippingForm.shipping
                    }
                };

                const response = await this.$store.dispatch('order/create', orderData);
                this.createdOrder = response.data.data;

                // Update local status representation
                for (let item of this.cartItems) {
                    await this.$store.dispatch('cart/updateItemStatusLocal', {
                        id: item._id,
                        status: {
                            approval: [
                                { key: 'en', value: 'Reserved' },
                                { key: 'th', value: 'จองแล้ว' }
                            ]
                        }
                    });
                }

                // Proceed to Step 2 in wizard
                this.currentStep = 2;

            } catch (error) {
                console.error('Order creation failed:', error);
                const msg = error.response?.data?.message || error.message || '';
                if (msg.includes('RESERVED_ALREADY') || msg.includes('Reserved') || msg.includes('Sold Out')) {
                    alert(this.$i18n.locale === 'en' ? 'One of your items has just been reserved by someone else. Returning to cart.' : 'ขออภัย สินค้าบางรายการในตะกร้าของคุณเพิ่งถูกผู้อื่นจองตัดหน้าไป ระบบจะพากลับไปที่ตะกร้าสินค้า');
                    this.$router.push('/');
                } else {
                    alert(this.$i18n.locale === 'en' ? 'Error creating order. Please try again.' : 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
                }
            } finally {
                this.loading = false;
            }
        },
        async handleSubmitPayment(payload) {
            console.log(`[Checkout Flow] Submitting Payment Slip...`);
            if (!this.createdOrder) {
                alert(this.$i18n.locale === 'en' ? 'Order not found. Please try again.' : 'ไม่พบข้อมูลคำสั่งซื้อ กรุณาทำรายการใหม่');
                return;
            }

            try {
                this.loading = true;

                // Upload payment slip if attached
                if (payload.paymentProofFile && this.createdOrder._id) {
                    await this.$store.dispatch('order/upload', {
                        _id: this.createdOrder._id,
                        image: payload.paymentProofFile
                    });
                }

                // Construct finalized order details for receipt display
                const finalOrder = {
                    ...this.createdOrder,
                    _id: this.createdOrder._id || 'ART-' + Math.floor(Math.random() * 10000),
                    date: new Date().toLocaleDateString(),
                    items: [...this.cartItems],
                    paymentMethod: payload.paymentMethod,
                    subtotal: this.subtotal,
                    shipping: this.shippingCost,
                    total: this.total
                };
                
                await this.$store.dispatch('cart/setLastOrder', finalOrder);
                
                // Clear cart
                await this.$store.dispatch('cart/clearCart');
                
                // Switch wizard step to Step 3 Receipt
                this.currentStep = 3;

            } catch (error) {
                console.error('Slip upload failed:', error);
                alert(this.$i18n.locale === 'en' ? 'Error uploading payment slip. Please check your profile.' : 'เกิดข้อผิดพลาดในการอัปโหลดสลิปชำระเงิน กรุณาตรวจสอบในหน้าโปรไฟล์ของคุณ');
                this.currentStep = 3;
            } finally {
                this.loading = false;
            }
        },
        async downloadBilling() {
            try {
                const orderId = this.order._id || this.order.orderNumber;
                const response = await this.$store.dispatch('order/getInvoice', orderId);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Invoice_${this.order.orderNumber || this.order._id}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Download failed:', error);
                alert('Could not download invoice. Please try again.');
            }
        },
        isReserved(item) {
            if (!item || !item.status || !item.status.approval) return false;
            return this.getName('en', item.status.approval) === 'Reserved';
        },
        async refreshStatuses() {
            if (this.cartItems.length === 0) return;
            try {
                const promises = this.cartItems.map(item => 
                    this.$store.dispatch('artwork/explore', { _id: item._id })
                );
                const results = await Promise.all(promises);
                results.forEach((latest) => {
                    if (latest) {
                        const artwork = Array.isArray(latest) ? latest[0] : latest;
                        if (artwork) this.$store.dispatch('cart/updateCartItem', artwork);
                    }
                });
            } catch (e) {
                console.error('Sync failed', e);
            }
        },
        formatPrice(val) {
            return new Intl.NumberFormat('th-TH').format(val);
        }
    },
    mounted() {
        this.syncTimer = setInterval(this.refreshStatuses, 5000);
    },
    beforeDestroy() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
    }
}
</script>

<style scoped>
.payment-page {
    padding-top: 2rem !important;
    background-color: #f8fafc !important;
}

.rounded-xl {
    border-radius: 16px !important;
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
    box-shadow: 0 8px 16px rgba(97, 39, 33, 0.2) !important;
}

.btn-outline-dark {
    border-color: #2c3e50 !important;
    color: #2c3e50 !important;
    background-color: transparent !important;
    transition: all 0.3s ease;
}

.btn-outline-dark:hover {
    background-color: #2c3e50 !important;
    color: white !important;
    transform: translateY(-2px);
}

.hover-lift {
    transition: transform 0.2s, box-shadow 0.2s;
}

.hover-lift:hover {
    transform: translateY(-2px);
}

/* Step Wizard Styles */
.wizard-progress-bar {
    position: relative;
    z-index: 10;
}

.progress-line-track {
    position: absolute;
    top: 24px;
    left: 10%;
    right: 10%;
    height: 4px;
    background-color: #e2e8f0;
    z-index: 1;
}

.progress-line {
    position: absolute;
    top: 24px;
    left: 10%;
    height: 4px;
    background: linear-gradient(90deg, #612721, #FEC260);
    z-index: 2;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-item {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
}

.step-icon-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #ffffff;
    border: 3px solid #cbd5e0;
    color: #718096;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

.step-label {
    font-size: 0.85rem;
    color: #718096;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.step-item.active .step-icon-circle {
    border-color: #FEC260;
    background-color: #612721;
    color: #ffffff;
    box-shadow: 0 0 0 4px rgba(97, 39, 33, 0.15);
}

.step-item.active .step-label {
    color: #612721;
}

.step-item.completed .step-icon-circle {
    border-color: #38a169;
    background-color: #38a169;
    color: #ffffff;
}

.step-item.completed .step-label {
    color: #2f855a;
}

/* Receipt Animations */
.animate-scale-up {
    animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes scaleUp {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.extra-small {
    font-size: 0.75rem;
}
</style>
