<template>
    <CCol lg="4">
        <!-- (Summary code remains same as before) -->
        <CCard class="border-0 shadow-sm rounded-lg">
            <CCardBody class="p-4">
                <h5 class="font-weight-bold mb-4">{{ $i18n.locale === 'en' ? 'Order Summary' : 'สรุปคำสั่งซื้อ' }}</h5>

                <div v-for="(item, index) in cartItems" :key="item._id" class="d-flex mb-4 align-items-center">
                    <img :src="item.image" :alt="getName($i18n.locale, item.title)" class="rounded mr-3 shadow-sm"
                        style="width: 80px; height: 80px; object-fit: cover;">
                    <div class="w-100">
                        <div class="d-flex justify-content-between">
                            <h6 class="mb-0 font-weight-bold">
                                {{ getName($i18n.locale, item.title) }}
                                <span v-if="isReserved(item)" class="badge badge-warning ml-2">{{ $i18n.locale === 'en' ? 'Reserved' : 'จองแล้ว' }}</span>
                            </h6>
                            <span class="font-weight-bold text-danger">฿{{ formatPrice(item.price) }}</span>
                        </div>
                        <small class="text-muted d-block mb-2" v-if="item.artist">{{ $i18n.locale === 'en' ? 'by' : 'โดย' }} {{ getName($i18n.locale, item.artist) }}</small>
                        <div class="d-flex justify-content-between align-items-center mt-1">
                            <div class="text-danger small font-weight-bold" v-if="reservationStart !== null">
                                <CIcon name="cil-clock" size="sm" class="mr-1"/> 
                                <span>{{ $i18n.locale === 'en' ? 'Payment time remaining: ' : 'เวลาชำระเงินที่เหลือ: ' }}</span>
                                <CartItemTimer :addedAt="reservationStart" />
                            </div>
                            <div v-else></div>
                            <button type="button" @click="removeItem(item._id)"
                                :aria-label="($i18n.locale === 'en' ? 'Remove from cart: ' : 'ลบออกจากตะกร้า: ') + getName($i18n.locale, item.title)"
                                class="btn btn-link p-0 text-danger small text-decoration-none d-flex align-items-center">
                                <CIcon name="cil-trash" size="sm" class="mr-1" /> {{ $i18n.locale === 'en' ? 'Remove' : 'ลบ' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Web Disconnection Note -->
                <div class="alert p-3 mt-3 d-flex align-items-start" style="border-radius: 8px; background-color: #fff9f0; border: 1px solid #ffe8cc; color: #d97706;">
                    <CIcon name="cil-info" class="mr-2 mt-1 flex-shrink-0" style="color: #f59e0b;" size="sm" />
                    <div class="small" style="line-height: 1.45; font-size: 0.8rem; font-weight: 500;">
                        {{ $i18n.locale === 'en' 
                            ? '*Note: If you experience any system disconnection or the page closes unexpectedly, please verify your order status in your Purchase History page.' 
                            : '*หมายเหตุ: หากหน้าต่างระบบปิดตัวลงหรือขาดการเชื่อมต่อในระหว่างชำระเงิน กรุณาตรวจสอบสถานะการจองได้ที่หน้าประวัติการสั่งซื้อของคุณ' }}
                    </div>
                </div>

                <hr class="border-light my-4">

                <div class="d-flex justify-content-between mb-2 text-muted small">
                    <span>{{ $i18n.locale === 'en' ? 'Subtotal' : 'ยอดรวม' }}</span>
                    <span class="font-weight-bold text-dark">฿{{ formatPrice(subtotal) }}</span>
                </div>

                <div class="d-flex justify-content-between mt-4 mb-4">
                    <span class="font-weight-bold h5 mb-0">{{ $i18n.locale === 'en' ? 'Total' : 'ยอดสุทธิ' }}</span>
                    <span class="font-weight-bold h4 mb-0 text-danger">฿{{ formatPrice(total) }}</span>
                </div>
            </CCardBody>
        </CCard>
    </CCol>
</template>

<script>
import { mapGetters } from 'vuex';
import CartItemTimer from '@/components/CartItemTimer.vue';
import i18nMixin from '@/mixins/i18nMixin';

export default {
    name: 'CardOrderSummary',
    mixins: [i18nMixin],
    components: {
        CartItemTimer
    },
    props: {
        createdOrder: { type: Object, default: null }
    },
    computed: {
        reservationStart() {
            if (!this.createdOrder?._id || !this.createdOrder.createdAt) return null;
            const start = new Date(this.createdOrder.createdAt).getTime();
            return Number.isFinite(start) ? start : null;
        },
        ...mapGetters('cart', ['cartItems', 'cartTotal', 'cartShippingCost', 'cartFinalTotal']),
        subtotal() {
            return this.cartTotal || 0;
        },
        total() {
            return this.cartFinalTotal;
        },
        shippingCost() {
            return this.cartShippingCost;
        }
    },
    methods: {
        isReserved(item) {
            if (!item || !item.status || !item.status.approval) return false;
            return this.getName('en', item.status.approval) === 'Reserved';
        },
        removeItem(id) {
            this.$store.dispatch('cart/removeFromCart', id);
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0';
            return parseFloat(value).toLocaleString('en-US');
        }
    }
}
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.step-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 0.75rem;
    transition: all 0.3s ease;
}

.step-badge.bg-success {
    background-color: #28a745 !important;
    color: white;
}

.step-badge.bg-light {
    background-color: #f8f9fa !important;
    color: #6c757d;
}

.h-50-px {
    height: 50px;
}

.active-option {
    border-color: #28a745 !important;
    background-color: #f0fff4 !important;
}

.radio-circle {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid #cbd5e0;
    transition: all 0.3s ease;
}

.radio-circle.active {
    border-color: #28a745;
    background-color: #28a745;
    position: relative;
}

.radio-circle.active::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: white;
}

.qr-wrapper {
    background: white;
    border: 2px dashed #cbd5e0;
    border-radius: 12px;
}

.qr-border-dashed {
    border: 2px dashed #cbd5e0;
    border-radius: 12px;
    pointer-events: none;
}
</style>
