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

            <h2 class="font-weight-bold mb-3" style="color: #2c3e50;">Order Confirmed!</h2>
            <p class="text-muted mb-5">
                Thank you for your purchase. Your order {{ order._id }} has been received and is being processed.
            </p>

            <!-- Order Details Card -->
            <CCard class="border-0 shadow-sm mx-auto mb-5 text-left" style="max-width: 500px; border-radius: 12px;">
                <!-- Colored Top Border -->
                <CCardHeader class="p-0 border-0"
                    style="height: 4px; background: linear-gradient(90deg, #E55B5B, #F9D976); border-radius: 12px 12px 0 0;">
                </CCardHeader>
                <CCardHeader
                    class="bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                    <h5 class="font-weight-bold mb-0">Order Details</h5>
                    <CLink href="#" class="text-danger small font-weight-bold text-decoration-none">
                        <CIcon name="cil-cloud-download" size="sm" class="mr-1" /> Download Receipt
                    </CLink>
                </CCardHeader>
                <CCardBody class="p-4">

                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted small">Order Number</span>
                        <span class="font-weight-bold text-dark small">{{ order._id }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted small">Date</span>
                        <span class="font-weight-bold text-dark small">{{ order.date }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-4">
                        <span class="text-muted small">Payment Method</span>
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
                                    <div class="font-weight-bold text-dark small">{{ item.title }}</div>
                                    <div class="text-muted" style="font-size: 0.75rem;">{{ item.artist }}</div>
                                </div>
                                <div class="font-weight-bold text-danger">{{ item.price }} <span
                                        class="text-muted small" v-if="item.quantity > 1">x{{ item.quantity }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr class="border-light my-3">

                    <div class="d-flex justify-content-between mb-2 text-muted small">
                        <span>Subtotal</span>
                        <span class="font-weight-bold text-dark">${{ order.subtotal }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2 text-muted small">
                        <span>Shipping</span>
                        <span class="font-weight-bold text-dark">${{ order.shipping }}</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span class="font-weight-bold text-dark">Total Paid</span>
                        <span class="font-weight-bold text-danger h5 mb-0">${{ order.total }}</span>
                    </div>
                </CCardBody>
            </CCard>

            <!-- Action Buttons -->
            <div class="d-flex justify-content-center">
                <CButton color="danger" class="px-4 py-2 font-weight-bold shadow-sm mr-3"
                    style="background-color: #E55B5B; border: none; min-width: 150px;" to="/">
                    Return to Home
                </CButton>
                <CButton color="white" class="px-4 py-2 font-weight-bold shadow-sm border"
                    style="color: #2c3e50; min-width: 150px;" @click="downloadBilling">
                    <CIcon name="cil-cloud-download" class="mr-2" /> Download Billing
                </CButton>
            </div>

        </CContainer>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'Bill',
    computed: {
        ...mapGetters('cart', ['lastOrder']),
        order() {
            return this.lastOrder || {};
        }
    },
    methods: {
        downloadBilling() {
            // Logic for downloading billing
            console.log('Download Billing');
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
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
