<template>
    <div>
        <CHeader fixed with-subheader class="px-3 glass-morphism" style="height: 64px; align-items: center;">
            <CHeaderBrand class="mr-auto d-flex align-items-center text-decoration-none" to="/">
                <img src="@/assets/logo.svg" height="40" class="mr-3 brand-logo-img">
                <div class="d-flex flex-column brand-text-container">
                    <span class="brand-main-text">Buddhist Art MFU</span>
                    <span class="brand-sub-text">พุทธศิลป์</span>
                </div>
            </CHeaderBrand>

            <CHeaderNav class="d-md-down-none mx-auto">
                <CHeaderNavItem class="px-3">
                    <CHeaderNavLink to="/artworks" class="text-dark font-weight-bold">Artwork</CHeaderNavLink>
                </CHeaderNavItem>
                <CHeaderNavItem class="px-3">
                    <CHeaderNavLink to="/news" class="text-dark font-weight-bold">New</CHeaderNavLink>
                </CHeaderNavItem>
                <CHeaderNavItem class="px-3">
                    <CHeaderNavLink to="/orders" class="text-dark font-weight-bold">Order</CHeaderNavLink>
                </CHeaderNavItem>
                <CHeaderNavItem class="px-3">
                    <CHeaderNavLink to="/about" class="text-dark font-weight-bold">About Us</CHeaderNavLink>
                </CHeaderNavItem>
            </CHeaderNav>

            <CHeaderNav class="ml-auto">
                <CHeaderNavItem class="px-3 d-flex align-items-center d-md-down-none">
                    <span class="font-weight-bold text-muted" style="cursor: pointer;">TH</span>
                    <span class="mx-2 text-muted">/</span>
                    <span class="font-weight-bold" style="color: #E55B5B; cursor: pointer;">EN</span>
                </CHeaderNavItem>
                <CHeaderNavItem class="px-3">
                    <div class="position-relative" style="cursor: pointer;" @click="setShowCart(true)">
                        <CIcon name="cil-basket" size="xl" style="color: #2c3e50;" />
                        <!-- Badge (Optional, hidden if 0 or dependent on state) -->
                        <span v-if="cartCount > 0" class="badge badge-pill badge-danger position-absolute"
                            style="top: -5px; right: -5px;">{{ cartCount }}</span>
                    </div>
                </CHeaderNavItem>
                <CHeaderNavItem class="px-3 d-lg-none">
                    <CToggler in-header class="d-lg-none ml-0" @click="$store.commit('toggleSidebarMobile')">
                        <CIcon name="cil-menu" size="xl" style="color: #2c3e50;" />
                    </CToggler>
                </CHeaderNavItem>
            </CHeaderNav>
        </CHeader>

        <!-- Cart Sidebar Overlay -->
        <div class="cart-backdrop" v-if="isCartOpen" @click="setShowCart(false)"></div>

        <!-- Cart Sidebar -->
        <div class="cart-sidebar bg-white shadow-lg" :class="{ 'open': isCartOpen }">
            <div class="d-flex justify-content-between align-items-center p-4 border-bottom">
                <h5 class="font-weight-bold m-0">Your Cart ({{ cartCount }})</h5>
                <button type="button" class="close" @click="setShowCart(false)" style="outline: none;">
                    <span aria-hidden="true" style="font-size: 1.5rem;">&times;</span>
                </button>
            </div>

            <div v-if="cartItems.length === 0"
                class="cart-body d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                <div class="mb-3 p-3 bg-light rounded"
                    style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                    <CIcon name="cil-basket" size="xl" class="text-muted"
                        style="transform: scale(1.5); color: #adb5bd !important;" />
                </div>
                <h5 class="font-weight-bold mb-2">Your cart is empty</h5>
                <p class="text-muted small mb-4">Looks like you haven't added any art yet.</p>
                <button class="btn btn-link text-danger font-weight-bold text-decoration-none p-0"
                    @click="startShopping">
                    Start Shopping
                </button>
            </div>

            <div v-else class="cart-body d-flex flex-column h-100">
                <div class="flex-grow-1 overflow-auto p-3">
                    <div v-for="item in cartItems" :key="item._id"
                        class="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <div class="mr-3"
                            style="width: 60px; height: 60px; background-size: cover; background-position: center; border-radius: 8px;"
                            :style="{ backgroundImage: `url(${item.image})` }">
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="font-weight-bold mb-0 text-truncate" style="max-width: 180px;">{{ item.title }}
                            </h6>
                            <p class="text-muted small mb-0">{{ item.price }} x {{ item.quantity }}</p>
                        </div>
                        <div class="text-right">
                            <button class="btn btn-sm text-danger" @click="removeFromCart(item._id)">
                                <CIcon name="cil-trash" />
                            </button>
                        </div>
                    </div>
                </div>
                <div class="p-4 bg-light border-top">
                    <div class="d-flex justify-content-between mb-3">
                        <span class="text-muted">Total</span>
                        <span class="font-weight-bold h5 mb-0">${{ cartTotal.toLocaleString() }}</span>
                    </div>
                    <CButton block color="danger" shape="pill" class="font-weight-bold py-2 shadow-sm"
                        @click="$router.push('/payment'); setShowCart(false);">
                        Checkout
                    </CButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'TheHeaderUser',
    computed: {
        ...mapGetters('cart', ['cartItems', 'cartCount', 'cartTotal', 'isCartOpen'])
    },
    methods: {
        ...mapActions('cart', ['removeFromCart', 'setShowCart']),
        startShopping() {
            this.setShowCart(false);
            this.$router.push('/artworks');
        }
    }
}
</script>

<style scoped>
.cart-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1040;
    backdrop-filter: blur(2px);
}

.cart-sidebar {
    position: fixed;
    top: 0;
    right: -400px;
    /* Start off-screen */
    width: 400px;
    height: 100vh;
    z-index: 1050;
    transition: right 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
}

.cart-sidebar.open {
    right: 0;
}

@media (max-width: 576px) {
    .cart-sidebar {
        width: 100%;
        right: -100%;
    }
}

.brand-main-text {
    color: #3c4b64; 
    font-weight: 800; 
    font-size: 1.25rem; 
    line-height: 1.1;
    letter-spacing: -0.2px;
}

.brand-sub-text {
    color: #ac1515; 
    font-weight: 700; 
    font-size: 0.85rem;
    margin-top: -1px;
}

.brand-logo-img {
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}
</style>
