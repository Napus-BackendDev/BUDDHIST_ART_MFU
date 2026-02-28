<template>
    <div class="payment-page bg-light min-vh-100 py-5">
        <CContainer>

            <!-- Top Navigation -->
            <div class="mb-4">
                <CLink href="#" @click.native.prevent="$router.go(-1)" class="text-muted small text-decoration-none">
                    <CIcon name="cil-arrow-left" size="sm" class="mr-1" /> Back to Shopping
                </CLink>
                <h2 class="font-weight-bold mt-2" style="color: #2c3e50;">Checkout</h2>
            </div>

            <CRow>
                <CardShipping @confirm-payment="handleConfirmPayment" />
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
        return {}
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
        handleConfirmPayment(payload) {
            if (this.cartItems.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            // Create order object
            const order = {
                id: 'ART-' + Math.floor(Math.random() * 10000),
                date: new Date().toLocaleDateString(),
                items: this.cartItems,
                paymentMethod: payload.paymentMethod,
                subtotal: this.subtotal,
                shipping: this.shippingCost,
                total: this.total,
                paymentProof: payload.paymentProofImage // In real app, upload file first and get URL
            };

            // Save order to store for Bill page
            this.$store.dispatch('cart/setLastOrder', order);

            // Clear Cart
            this.$store.dispatch('cart/clearCart');

            // Redirect to Bill page
            this.$router.push('/bill');
        }
    }
}
</script>

<style scoped>
.payment-page {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
::v-deep .h-50-px {
    height: 48px;
}

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
