<template>
    <div class="bill-page bg-white min-vh-100 py-5 d-flex align-items-center justify-content-center">
        <CContainer class="text-center">

            <!-- Success Icon -->
            <div class="mb-4">
                <div class="rounded-circle d-inline-flex align-items-center justify-content-center"
                    style="width: 80px; height: 80px; background-color: #d1fae5;">
                    <CIcon name="cil-check" size="3xl" style="color: #38a169;" />
                </div>
            </div>

            <h2 class="font-weight-bold mb-3" style="color: #2c3e50;">{{ $i18n.locale === 'en' ? 'Order Confirmed!' : 'ยืนยันคำสั่งซื้อสำเร็จ!' }}</h2>
            <p class="text-muted mb-4">
                {{ $i18n.locale === 'en' ? 'Thank you for your purchase. Your order' : 'ขอบคุณสำหรับการสั่งซื้อ หมายเลขคำสั่งซื้อของคุณ' }} {{ order.orderNumber || order._id }} {{ $i18n.locale === 'en' ? 'has been received and is being processed.' : 'ได้รับการยืนยันและกำลังดำเนินการ' }}
            </p>

            <!-- Expiry limit warning block -->
            <div class="p-3 mb-5 mx-auto text-center font-weight-bold rounded-lg border-0 shadow-sm d-inline-flex align-items-center justify-content-center" style="max-width: 500px; background-color: #fff5f5; color: #e55b5b; font-size: 0.95rem; border-radius: 12px; gap: 8px;">
                <CIcon name="cil-warning" size="sm" />
                <span>
                    {{ $i18n.locale === 'en' 
                        ? 'Please upload the payment slip within 24 hours to secure your artwork reservation.' 
                        : 'กรุณาอัปโหลดหลักฐานการชำระเงินภายใน 24 ชั่วโมง เพื่อรักษาสิทธิ์การจองผลงานศิลปะของคุณ' }}
                </span>
            </div>

            <!-- Order Details Card -->
            <CCard class="border-0 shadow-sm mx-auto mb-5 text-left" style="max-width: 500px; border-radius: 12px;">
                <!-- Colored Top Border -->
                <CCardHeader class="p-0 border-0"
                    style="height: 4px; background: linear-gradient(90deg, #E55B5B, #F9D976); border-radius: 12px 12px 0 0;">
                </CCardHeader>
                <CCardHeader
                    class="bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                    <h5 class="font-weight-bold mb-0">{{ $i18n.locale === 'en' ? 'Order Details' : 'รายละเอียดคำสั่งซื้อ' }}</h5>
                    <CLink href="#" class="text-danger small font-weight-bold text-decoration-none">
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
                        <span class="font-weight-bold text-dark small text-capitalize">{{ order.paymentMethod }}</span>
                    </div>

                    <!-- Product Item -->
                    <div v-for="(item, index) in order.items" :key="index"
                        class="rounded mb-4 d-flex align-items-center">
                        <img :src="item.image" class="rounded mr-3"
                            style="width: 50px; height: 50px; object-fit: cover;">
                        <div class="w-100">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <div class="font-weight-bold text-dark small">
                                        {{ getName($i18n.locale, item.title) }}
                                        <span v-if="isReserved(item)" class="badge badge-warning ml-2">{{ $i18n.locale === 'en' ? 'Reserved' : 'จองแล้ว' }}</span>
                                    </div>
                                    <div class="text-muted" style="font-size: 0.75rem;" v-if="item.artist">{{ $i18n.locale === 'en' ? 'by' : 'โดย' }} {{ getName($i18n.locale, item.artist) }}</div>
                                </div>
                                <div class="font-weight-bold text-danger">฿{{ formatPrice(item.price) }} <span
                                        class="text-muted small" v-if="item.quantity > 1">x{{ item.quantity }}</span>
                                </div>
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

                    <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span class="font-weight-bold text-dark">{{ $i18n.locale === 'en' ? 'Total Paid' : 'ยอดสุทธิ' }}</span>
                        <span class="font-weight-bold text-danger h5 mb-0">฿{{ formatPrice(order.total) }}</span>
                    </div>
                </CCardBody>
            </CCard>

            <!-- Action Buttons -->
            <div class="d-flex justify-content-center">
                <CButton color="danger" class="px-4 py-2 font-weight-bold shadow-sm mr-3"
                    style="background-color: #E55B5B; border: none; min-width: 150px;" to="/">
                    {{ $i18n.locale === 'en' ? 'Return to Home' : 'กลับหน้าหลัก' }}
                </CButton>
                <CButton color="white" class="px-4 py-2 font-weight-bold shadow-sm border"
                    style="color: #2c3e50; min-width: 150px;" @click="downloadBilling">
                    <CIcon name="cil-cloud-download" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Download Billing' : 'ดาวน์โหลดใบเสร็จ' }}
                </CButton>
            </div>

        </CContainer>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import i18nMixin from '@/mixins/i18nMixin';

export default {
    name: 'Bill',
    mixins: [i18nMixin],
    computed: {
        ...mapGetters('cart', ['lastOrder']),
        order() {
            return this.lastOrder || {};
        }
    },
    methods: {
        isReserved(item) {
            if (!item || !item.status || !item.status.approval) return false;
            return this.getName('en', item.status.approval) === 'Reserved';
        },
        async downloadBilling() {
            try {
                const response = await this.$store.dispatch('order/getInvoice', this.order._id);
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
        formatPrice(value) {
            if (value === undefined || value === null) return '0';
            return parseFloat(value).toLocaleString('en-US');
        }
    },
    mounted() {
        if (!this.lastOrder) {
            // If no order found (e.g. direct access), redirect to home
            this.$router.push('/');
        }
    }
}
</script>

<style scoped>
.bill-page {
    padding-top: 0 !important;
    margin-top: -2rem !important;
}
</style>
