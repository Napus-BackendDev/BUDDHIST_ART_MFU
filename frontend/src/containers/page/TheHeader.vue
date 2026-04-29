<template>
    <CHeader fixed with-subheader class="p-0 border-0 main-app-header">
        <!-- Tier 1: Main Header (White) -->
        <div class="header-top-tier bg-white w-100 d-flex align-items-center px-3" style="height: 75px; z-index: 1030; position: relative;">
            <CHeaderBrand class="d-flex align-items-center text-decoration-none brand-link-custom" to="/">
                <img src="@/assets/icons/logo.png" height="55" class="mr-3 brand-logo-img">
                <div class="brand-text-wrapper d-flex flex-column justify-content-center">
                    <span class="brand-main-title">Buddhist Art MFU</span>
                    <span class="brand-subtitle">พุทธศิลป์</span>
                </div>
            </CHeaderBrand>

            <CHeaderNav class="ml-auto d-flex align-items-center">
                <!-- User Login Icon / Dropdown (Top Right) -->
                <CHeaderNavItem class="px-3" v-if="!isLoggedIn">
                    <div class="user-login-trigger text-dark d-flex align-items-center" @click="openLoginModal" style="cursor: pointer;">
                        <CIcon name="cil-user" size="xl" />
                    </div>
                </CHeaderNavItem>
                <CDropdown
                    v-else
                    inNav
                    class="c-header-nav-items px-3"
                    placement="bottom-end"
                    add-menu-classes="pt-0 mt-2 shadow-sm rounded-lg premium-dropdown-menu"
                >
                    <template #toggler>
                        <CHeaderNavLink class="px-0">
                            <div class="user-login-trigger text-dark d-flex align-items-center" style="cursor: pointer;">
                                <CIcon name="cil-user" size="xl" />
                            </div>
                        </CHeaderNavLink>
                    </template>

                    <!-- User Role Links -->
                    <template v-if="userRole === 'customer' || userRole === 'user'">
                        <CDropdownItem @click="$router.push('/user/profile')" class="font-weight-bold">
                            <CIcon name="cil-user" class="mr-3" /> Profile
                        </CDropdownItem>
                        <CDropdownItem @click="$router.push('/user/order')" class="font-weight-bold">
                            <CIcon name="cil-history" class="mr-3" /> History
                        </CDropdownItem>
                    </template>
                    <!-- Artist Role Links -->
                    <template v-else-if="userRole === 'artist'">
                        <CDropdownItem @click="$router.push('/artist/profile')" class="font-weight-bold">
                            <CIcon name="cil-user" class="mr-3" /> Profile
                        </CDropdownItem>
                        <CDropdownItem @click="$router.push('/artist/submissions')" class="font-weight-bold">
                            <CIcon name="cil-brush" class="mr-3" /> Submissions
                        </CDropdownItem>
                    </template>
                    <!-- Admin Role Links -->
                    <template v-else-if="userRole === 'admin'">
                        <CDropdownItem @click="$router.push('/admin')" class="font-weight-bold">
                            <CIcon name="cil-speedometer" class="mr-3" /> Dashboard
                        </CDropdownItem>
                    </template>

                    <CDropdownDivider/>
                    <CDropdownItem @click="logout" class="text-danger font-weight-bold">
                        <CIcon name="cil-lock-locked" class="mr-3" /> Logout
                    </CDropdownItem>
                </CDropdown>

                <CHeaderNavItem class="px-3 border-right language-switcher d-md-down-none">
                    <div class="d-flex align-items-center text-dark" style="cursor: pointer;" @click="toggleLang">
                        <CIcon name="cil-globe-alt" size="lg" class="mr-2" />
                        <span class="font-weight-bold">{{ $i18n.locale === 'th' ? 'EN' : 'TH' }}</span>
                    </div>
                </CHeaderNavItem>
                
                <CHeaderNavItem class="px-3">
                    <div class="position-relative cart-trigger text-dark" style="cursor: pointer;" @click="setShowCart(true)">
                        <CIcon name="cil-basket" size="xl" />
                        <span v-if="cartCount > 0" class="badge badge-pill badge-danger cart-count-badge">
                            {{ cartCount }}
                        </span>
                    </div>
                </CHeaderNavItem>

                <CHeaderNavItem class="px-2 d-lg-none">
                    <CToggler in-header @click="mobileMenu = !mobileMenu">
                        <CIcon name="cil-menu" size="xl" class="text-dark" />
                    </CToggler>
                </CHeaderNavItem>
            </CHeaderNav>
        </div>

        <!-- Tier 2: Subheader (Burgundy Bar) -->
        <div class="header-nav-tier w-100 d-none d-lg-flex" style="height: 50px; background-color: #612721;">
            <CContainer fluid class="d-flex justify-content-center align-items-center h-100">
                <CHeaderNav class="nav-links-container">
                    <CHeaderNavItem class="px-4">
                        <CHeaderNavLink to="/" exact class="nav-link-custom">{{ $t('header.home') }}</CHeaderNavLink>
                    </CHeaderNavItem>
                    <CHeaderNavItem class="px-4">
                        <CHeaderNavLink to="/artworks" class="nav-link-custom">{{ $t('header.artworks') }}</CHeaderNavLink>
                    </CHeaderNavItem>
                    <CHeaderNavItem class="px-4">
                        <CHeaderNavLink to="/news" class="nav-link-custom">{{ $t('header.news') }}</CHeaderNavLink>
                    </CHeaderNavItem>
                    <CHeaderNavItem class="px-4">
                        <CHeaderNavLink to="/about" class="nav-link-custom">{{ $t('header.about') }}</CHeaderNavLink>
                    </CHeaderNavItem>
                </CHeaderNav>
            </CContainer>
        </div>

        <!-- Mobile Navigation Overlay (Moved outside for cleaner DOM but stays in component) -->
        <transition name="fade">
            <div v-if="mobileMenu" class="mobile-nav-overlay d-lg-none" @click="mobileMenu = false">
                <div class="mobile-menu-content bg-white p-4 h-100" @click.stop>
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="m-0 font-weight-bold">Menu</h5>
                        <button type="button" class="close" @click="mobileMenu = false">
                            <CIcon name="cil-x" size="lg" />
                        </button>
                    </div>
                    <ul class="list-unstyled">
                        <li class="mb-4">
                            <CHeaderNavLink to="/" exact class="text-dark h5 p-0" @click.native="mobileMenu = false">{{ $t('header.home') }}</CHeaderNavLink>
                        </li>
                        <li class="mb-4">
                            <CHeaderNavLink to="/artworks" class="text-dark h5 p-0" @click.native="mobileMenu = false">{{ $t('header.artworks') }}</CHeaderNavLink>
                        </li>
                        <li class="mb-4">
                            <CHeaderNavLink to="/news" class="text-dark h5 p-0" @click.native="mobileMenu = false">{{ $t('header.news') }}</CHeaderNavLink>
                        </li>
                        <li class="mb-4">
                            <CHeaderNavLink to="/about" class="text-dark h5 p-0" @click.native="mobileMenu = false">{{ $t('header.about') }}</CHeaderNavLink>
                        </li>

                    </ul>
                </div>
            </div>
        </transition>

        <!-- Cart Sidebar Overlay/Content -->
        <div class="cart-backdrop" v-if="isCartOpen" @click="setShowCart(false)"></div>
        <div class="cart-sidebar bg-white shadow-lg" :class="{ 'open': isCartOpen }">
            <div class="d-flex justify-content-between align-items-center p-4 border-bottom">
                <h5 class="font-weight-bold m-0">{{ $i18n.locale === 'en' ? 'Your Cart' : 'ตะกร้าสินค้า' }} ({{ cartCount || 0 }})</h5>
                <button type="button" class="close" @click="setShowCart(false)" style="outline: none;">
                    <span aria-hidden="true" style="font-size: 1.5rem;">&times;</span>
                </button>
            </div>

            <div v-if="!cartItems || cartItems.length === 0"
                class="cart-body d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                <div class="mb-4">
                    <CIcon name="cil-basket" size="xl" class="text-muted" style="transform: scale(2);" />
                </div>
                <h5 class="font-weight-bold mb-2">{{ $i18n.locale === 'en' ? 'Cart is empty' : 'ตะกร้าสินค้าว่างเปล่า' }}</h5>
                <CButton color="danger" shape="pill" class="mt-3 px-4 font-weight-bold" @click="startShopping">
                    {{ $i18n.locale === 'en' ? 'Shop Now' : 'ช้อปเลย' }}
                </CButton>
            </div>

            <div v-else class="cart-body d-flex flex-column h-100">
                <div class="flex-grow-1 overflow-auto p-3">
                    <div v-for="item in cartItems" :key="item._id"
                        class="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <div class="mr-3"
                            style="width: 70px; height: 70px; background-size: cover; background-position: center; border-radius: 8px;"
                            :style="{ backgroundImage: `url(${item.image})` }">
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="font-weight-bold mb-0">{{ getName($i18n.locale, item.title) }}</h6>
                            <div class="text-muted small mb-1" v-if="item.artist">{{ $i18n.locale === 'th' ? 'โดย' : 'By' }} {{ getName($i18n.locale, item.artist) }}</div>
                            <div class="font-weight-bold text-danger h6 mb-0">฿{{ formatPrice(item.price) }}</div>
                        </div>
                        <div class="text-right">
                            <CButton size="sm" color="link" class="text-danger" @click="removeFromCart(item._id)">
                                <CIcon name="cil-trash" />
                            </CButton>
                        </div>
                    </div>
                </div>
                <div class="p-4 bg-light border-top pb-5 mb-5">
                    <div class="d-flex justify-content-between mb-3 text-dark align-items-center">
                        <span class="h6 mb-0 font-weight-bold">{{ $i18n.locale === 'en' ? 'Total' : 'ยอดรวม' }}</span>
                        <span class="font-weight-bold h4 mb-0 text-danger">฿{{ (cartTotal || 0).toLocaleString() }}</span>
                    </div>
                    <CButton block color="danger" size="lg" class="py-2 font-weight-bold shadow-sm mb-2" @click="$router.push('/payment'); setShowCart(false);">
                        {{ $i18n.locale === 'en' ? 'Checkout' : 'สั่งซื้อสินค้า' }}
                    </CButton>
                </div>
            </div>
        </div>
    </CHeader>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'TheHeaderUser',
    data() {
        return {
            mobileMenu: false,
            isLoggedIn: false,
            userRole: ''
        }
    },
    computed: {
        ...mapGetters('cart', ['cartItems', 'cartCount', 'cartTotal', 'isCartOpen']),
        // Re-calculate auth state dynamically based on localStorage changes when route changes
    },
    watch: {
        $route() {
            this.checkLoginStatus();
        }
    },
    created() {
        this.checkLoginStatus();
    },
    methods: {
        ...mapActions('cart', ['removeFromCart', 'setShowCart']),
        checkLoginStatus() {
            try {
                const objs = JSON.parse(localStorage.getItem('objs'));
                if (objs && objs.xAccessToken) {
                    this.isLoggedIn = true;
                    this.userRole = (objs.role || 'customer').toLowerCase();
                } else {
                    this.isLoggedIn = false;
                    this.userRole = '';
                }
            } catch (e) {
                this.isLoggedIn = false;
                this.userRole = '';
            }
        },
        logout() {
            localStorage.removeItem('objs');
            this.checkLoginStatus();
            this.$store.commit('auth/isSignIn', false);
            if (this.$route.path !== '/') {
                this.$router.push('/');
            }
            window.location.reload(); // Force full reload to reset all states securely
        },
        startShopping() {
            this.setShowCart(false);
            this.$router.push('/artworks');
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0';
            return parseFloat(value).toLocaleString('en-US');
        },
        openLoginModal() {
            this.$store.commit('auth/isSignIn', true);
        },
        toggleLang() {
            const newLang = this.$i18n.locale === 'th' ? 'en' : 'th';
            this.$i18n.locale = newLang;
            this.$store.commit("setting/lang", newLang);
            localStorage.setItem('lang', newLang);
        }
    }
}
</script>

<style scoped>
/* Reset CHeader for custom branding height */
.main-app-header {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
    z-index: 1030 !important;
}

.c-header-brand.brand-link-custom {
    text-decoration: none !important;
    color: inherit !important;
}

.brand-main-title {
    color: #3c4b64 !important; /* Charcoal */
    text-decoration: none !important;
    font-weight: 800;
    font-size: 1.4rem;
    line-height: 1;
    border-bottom: 2px solid #3c4b64;
    display: inline-block;
}

.brand-subtitle {
    color: #612721 !important; /* Burgundy */
    text-decoration: none !important;
    font-weight: 700;
    font-size: 0.95rem;
    margin-top: 4px;
}

.brand-logo-img {
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

/* Burgundy Navigation Bar */
.header-nav-tier {
    z-index: 1020;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.nav-link-custom {
    color: rgba(255, 255, 255, 0.9) !important;
    font-weight: 600 !important;
    font-size: 1.05rem !important;
    padding: 0 !important;
    position: relative;
    transition: all 0.3s ease;
}

.nav-link-custom:hover {
    color: #f0c24d !important; 
    text-decoration: none !important;
}

.nav-link-custom.c-active {
    color: #ffffff !important;
}

.nav-link-custom::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 0;
    height: 3px;
    background-color: #f0c24d;
    border-radius: 2px;
    transition: all 0.3s ease;
    opacity: 0;
}

.nav-link-custom:hover::after, .nav-link-custom.c-active::after {
    width: 100%;
    opacity: 1;
}

.nav-link-custom.c-active::after {
    background-color: #ffffff;
}

/* Utility styles */
.user-login-trigger {
    transition: all 0.2s ease;
    opacity: 0.8;
}

.user-login-trigger:hover {
    transform: scale(1.1);
    color: #612721 !important;
    opacity: 1;
}

.cart-trigger {
    transition: transform 0.2s ease;
}

.cart-trigger:hover {
    transform: scale(1.1);
}

.cart-count-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #612721;
    font-size: 0.75rem;
    padding: 3px 6px;
}

.cart-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 2040;
    backdrop-filter: blur(2px);
}

.cart-sidebar {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    z-index: 2050;
    transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-sidebar.open {
    right: 0;
}

.mobile-nav-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 3000;
}

.mobile-menu-content {
    width: 300px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter, .fade-leave-to { opacity: 0; }

@media (max-width: 991.98px) {
    .brand-main-title {
        font-size: 1.25rem;
    }
    .brand-logo-img {
        height: 55px;
    }
}
</style>