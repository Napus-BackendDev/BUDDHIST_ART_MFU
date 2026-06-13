<template>
    <CCol lg="4">
        <!-- (Summary code remains same as before) -->
        <CCard class="border-0 shadow-sm rounded-lg">
            <CCardBody class="p-4">
                <h5 class="font-weight-bold mb-4">{{ $i18n.locale === 'en' ? 'Order Summary' : 'สรุปคำสั่งซื้อ' }}</h5>

                <div v-for="(item, index) in cartItems" :key="item._id" class="d-flex mb-4 align-items-center">
                    <img :src="item.image" class="rounded mr-3 shadow-sm"
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
                            <div class="text-warning small font-weight-bold" v-if="item.addedAt">
                                <CIcon name="cil-clock" size="sm" class="mr-1"/> 
                                <CartItemTimer :addedAt="item.addedAt" />
                            </div>
                            <div v-else></div>
                            <CLink href="#" @click.prevent="removeItem(item._id)"
                                class="text-danger small text-decoration-none d-flex align-items-center">
                                <CIcon name="cil-trash" size="sm" class="mr-1" /> {{ $i18n.locale === 'en' ? 'Remove' : 'ลบ' }}
                            </CLink>
                        </div>
                    </div>
                </div>

                <hr class="border-light my-4">

                <div class="d-flex justify-content-between mb-2 text-muted small">
                    <span>{{ $i18n.locale === 'en' ? 'Subtotal' : 'ยอดรวม' }}</span>
                    <span class="font-weight-bold text-dark">฿{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2 text-muted small">
                    <span>{{ $i18n.locale === 'en' ? 'Shipping' : 'ค่าจัดส่ง' }}</span>
                    <span class="font-weight-bold text-dark">฿{{ formatPrice(shippingCost) }}</span>
                </div>

                <div class="d-flex justify-content-between mt-4 mb-4">
                    <span class="font-weight-bold h5 mb-0">{{ $i18n.locale === 'en' ? 'Total' : 'ยอดสุทธิ' }}</span>
                    <span class="font-weight-bold h4 mb-0 text-danger">฿{{ formatPrice(total) }}</span>
                </div>

                <div class="bg-light p-3 rounded d-flex align-items-start">
                    <CIcon name="cil-truck" class="text-muted mr-3 mt-1" />
                    <div class="ml-3">
                        <div class="font-weight-bold small text-dark mb-1">{{ $i18n.locale === 'en' ? 'Free Shipping on orders over ฿1,000' : 'จัดส่งฟรีเมื่อสั่งซื้อเกิน 1,000 บาท' }}</div>
                        <div class="text-muted small" style="font-size: 0.75rem;">{{ $i18n.locale === 'en' ? 'Estimated delivery: 3-5 business days' : 'เวลาจัดส่งโดยประมาณ: 3-5 วันทำการ' }}</div>
                    </div>
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
    computed: {
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