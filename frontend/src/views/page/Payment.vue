<template>
    <div class="payment-page bg-light min-vh-100 py-5">
        <CContainer>
            <div class="row">
                <div class="col-lg-8">
                    <!-- AVAILABILITY WARNING -->
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

            <div class="mb-4">
                <CLink href="#" @click.native.prevent="$router.go(-1)" class="text-muted small text-decoration-none">
                    <CIcon name="cil-arrow-left" size="sm" class="mr-1" /> {{ $i18n.locale === 'en' ? 'Back to Shopping' : 'กลับไปช้อปปิ้ง' }}
                </CLink>
                <h2 class="font-weight-bold mt-2" style="color: #2c3e50;">{{ $i18n.locale === 'en' ? 'Checkout' : 'ชำระเงิน' }}</h2>
            </div>

            <CRow>
                <CardShipping :loading="loading" :hasReservedItems="hasReservedItems" @confirm-payment="handleConfirmPayment" />
                <CardOrderSummary />
            </CRow>
        </CContainer>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CardShipping from './components/card/CardShipping.vue';
import CardOrderSummary from './components/card/CardOrderSummary.vue';

export default {
    name: 'Payment',
    components: {
        CardShipping,
        CardOrderSummary
    },
    data() {
        return {
            loading: false
        }
    },
    computed: {
        ...mapGetters('cart', ['cartItems', 'cartTotal']),
        subtotal() {
            return this.cartTotal || 0;
        },
        shippingCost() {
            return (this.subtotal > 1000 || this.subtotal === 0) ? 0 : 25;
        },
        total() {
            return this.subtotal + this.shippingCost;
        }
    },
    methods: {
        async handleConfirmPayment(payload) {
            if (this.cartItems.length === 0) {
                alert(this.$i18n.locale === 'en' ? 'Your cart is empty!' : 'ตะกร้าสินค้าของคุณว่างเปล่า!');
                return;
            }

            try {
                this.loading = true;
                // 1. Final check for Reserved status (someone might have bought it while you were filling the form)
                for (let item of this.cartItems) {
                    const latest = await this.$store.dispatch('artwork/explore', { _id: item._id });
                    if (latest && latest.status && latest.status.approval) {
                        const status = latest.status.approval.title.find(t => t.key === 'en')?.value;
                        if (status === 'Reserved') {
                            alert(this.$i18n.locale === 'en' ? `Artwork "${item.title[0].value}" has just been reserved by someone else. Please return to cart.` : `ผลงาน "${item.title[0].value}" เพิ่งถูกจองโดยผู้อื่น กรุณากลับไปที่ตะกร้าสินค้า`);
                            this.loading = false;
                            return;
                        }
                    }
                }

                // 2. Prepare order data for backend (matching Order model)
                const userId = this.$store.getters['auth/userId'];
                const orderData = {
                    artwork: this.cartItems.map(item => item._id),
                    user: userId || null,
                    contact: {
                        name: payload.shippingForm.name,
                        telephone: payload.shippingForm.telephone,
                        email: payload.shippingForm.email
                    },
                    address: {
                        shipping: payload.shippingForm.shipping,
                        bill: payload.shippingForm.bill || payload.shippingForm.shipping
                    }
                };

                // 2. Create Order in Backend
                const response = await this.$store.dispatch('order/create', orderData);
                const createdOrder = response.data.data;

                // 3. Upload Payment Slip if provided
                if (payload.paymentProofFile && createdOrder && createdOrder._id) {
                    await this.$store.dispatch('order/upload', {
                        _id: createdOrder._id,
                        image: payload.paymentProofFile
                    });
                }

                // 4. Save to lastOrder for local Bill page display
                const finalOrder = {
                    ...createdOrder,
                    _id: createdOrder._id || 'ART-' + Math.floor(Math.random() * 10000),
                    date: new Date().toLocaleDateString(),
                    items: this.cartItems,
                    paymentMethod: payload.paymentMethod,
                    subtotal: this.subtotal,
                    shipping: this.shippingCost,
                    total: this.total
                };
                this.$store.dispatch('cart/setLastOrder', finalOrder);

                // 5. Clear Cart and Redirect
                this.$store.dispatch('cart/clearCart');
                this.$router.push('/bill');

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
        }
    },
    computed: {
        ...mapGetters('cart', ['cartItems', 'cartTotal', 'cartShippingCost', 'cartFinalTotal']),
        hasReservedItems() {
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
    mounted() {
        // Refresh once on entry and then every 5 seconds for visual updates
        this.refreshStatuses();
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
    padding-top: 0 !important;
    margin-top: -2rem !important;
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
