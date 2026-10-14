<template>
    <div v-if="artworks.length > 0">
        <CRow>
            <CCol class="col-custom-grid mb-5" v-for="(art, index) in artworks" :key="index">
                <CCard class="h-100 border-0 artwork-card cursor-pointer" @click="getDetail(art._id)">
                    <!-- Image Wrapper -->
                    <div class="card-img-wrapper position-relative">
                        <!-- Category Badge -->
                        <div class="position-absolute glass-pill-badge px-3 py-1 m-3 rounded-pill" style="top: 0; left: 0; z-index: 2;">
                            <span class="small font-weight-bold">{{ art.category ? getName($i18n.locale, art.category) : ($i18n.locale === 'en' ? 'Artwork' : 'ผลงาน') }}</span>
                        </div>
                        <!-- Full Cover Image Background -->
                        <div class="card-img-bg h-100 w-100" :style="{ backgroundImage: 'url(' + String.fromCharCode(34) + (artworkImageUrl(art) || 'https://via.placeholder.com/800x800?text=No+Image') + String.fromCharCode(34) + ')' }">
                        </div>
                        <div class="card-img-overlay-soft"></div>
                    </div>

                    <!-- Content Body -->
                    <CCardBody class="p-4 bg-white">
                        <!-- Title, Artist and Technique -->
                        <div class="mb-3">
                            <h4 class="font-weight-bold art-title mb-1 text-truncate">{{ getName($i18n.locale, art) }}</h4>
                            <div class="art-technique text-muted mb-1" v-if="art.technique">
                                <small class="d-flex align-items-center">
                                    {{ getName($i18n.locale, art.technique) }}
                                </small>
                            </div>
                            <p class="text-muted small art-artist mb-0">{{ $i18n.locale === 'en' ? 'By' : 'โดย' }} {{ art.artist ? getName($i18n.locale, art.artist) : ($i18n.locale === 'en' ? 'Anonymous' : 'ศิลปินนิรนาม') }}</p>
                        </div>

                        <hr class="my-3 opacity-50">

                        <!-- Price and Action -->
                        <div class="d-flex justify-content-between align-items-center">
                            <div v-if="!isDisplayOnly(art)" class="price-box">
                                <small class="text-muted d-block" style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">{{ $i18n.locale === 'en' ? 'Current Price' : 'ราคาปัจจุบัน' }}</small>
                                <span class="price-value font-weight-bold text-danger">{{ formatPrice(art.price) }}</span>
                                <small class="price-unit ml-1 font-weight-bold">{{ $i18n.locale === 'en' ? 'THB' : 'บาท' }}</small>
                            </div>
                            
                            <!-- Action Button: Add to Cart / Reserved Status -->
                            <div v-if="isPurchasable(art)" class="action-btn-container" @click.stop="handleCartAction(art)">
                                <div v-if="isInCart(art._id)" class="in-cart-label">
                                    <CIcon name="cil-check-circle" class="mr-1" />
                                    <span>{{ $i18n.locale === 'en' ? 'In Cart' : 'อยู่ในตะกร้าแล้ว' }}</span>
                                </div>
                                <div v-else-if="isApprovalReserved(art)" class="in-cart-label" style="color: #ff9800; border-color: #ff9800; background-color: #fff3e0; cursor: not-allowed;">
                                    <CIcon name="cil-cart" class="mr-1" />
                                    <span>{{ $i18n.locale === 'en' ? 'Reserved' : 'จองแล้ว' }}</span>
                                </div>
                                <div v-else class="action-btn-circle">
                                    <CIcon name="cil-cart" />
                                </div>
                            </div>
                            <span v-else-if="isDisplayOnly(art)" class="display-only-badge">{{ $i18n.locale === 'en' ? 'Display only' : 'แสดงเฉย ๆ' }}</span>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    </div>
    <div v-else class="text-center py-5 no-results-box bg-light rounded-xl mt-4">
        <CIcon name="cil-brush" size="3xl" class="text-muted mb-3 opacity-30" />
        <h4 class="text-muted font-weight-bold">{{ $i18n.locale === 'en' ? 'No Artworks Found' : 'ไม่พบผลงานที่ต้องการ' }}</h4>
        <p class="text-muted max-w-lg mx-auto">{{ $i18n.locale === 'en' ? "Sorry, we couldn't find any artworks matching your criteria at this time." : 'ขออภัย เราไม่พบผลงานที่ตรงตามเงื่อนไขที่คุณเลือกในขณะนี้' }}</p>
    </div>
</template>

<script>
import { artworkImageUrl } from '@/utils/submissionArtworkImport';
export default {
    name: 'CardArtworks',
    props: {
        artworks: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        artworkImageUrl,
        getDetail(id) {
            this.$router.push(`/artwork/${id}`);
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0';
            return parseFloat(value).toLocaleString('en-US');
        },
        isInCart(id) {
            const cartItems = this.$store.getters['cart/cartItems'] || [];
            return cartItems.some(item => item._id === id);
        },
        handleCartAction(art) {
            if (!this.isPurchasable(art)) return;
            // Prevent adding to cart if it's already in someone else's cart (Reserved)
            if (this.isApprovalReserved(art) && !this.isInCart(art._id)) {
                return;
            }
            if (this.isInCart(art._id)) {
                // If already in cart, remove it
                this.$store.dispatch('cart/removeFromCart', art._id);
            } else {
                // If not in cart, add it
                this.$store.dispatch('cart/addToCart', art);
                
                // Automatically open the cart sidebar (A-side)
                this.$store.dispatch('cart/setShowCart', true);
            }
        },
        isApprovalReserved(art) {
            if (!art || !art.status || !art.status.approval) return false;
            return this.getName('en', art.status.approval) === 'Reserved';
        },
        isPurchasable(art) {
            if (!art || !art.status || !art.status.sale) return false;
            if (this.isDisplayOnly(art)) return false;
            const status = this.getName('en', art.status.sale);
            // ONLY 'Available' status is purchasable.
            return status === 'Available';
        },
        isDisplayOnly(art) {
            const lifecycle = art && art.postTermSale;
            if (!lifecycle || !lifecycle.applicable) return false;
            if (lifecycle.needsReview || !lifecycle.initialSaleEndsAt) return true;
            if (lifecycle.mode === 'standard_sale') return false;
            return new Date(lifecycle.initialSaleEndsAt).getTime() <= Date.now();
        }
    }
}
</script>

<style scoped>
.artwork-card {
    border-radius: 24px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
    border: none !important;
}

.artwork-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
}

.card-img-wrapper {
    height: 280px;
    overflow: hidden;
    position: relative;
    margin-top: -1px; /* Bleed up */
}

.card-img-bg {
    background-size: cover;
    background-position: center;
    transition: transform 0.8s ease;
}

.artwork-card:hover .card-img-bg {
    transform: scale(1.1);
}

.card-img-overlay-soft {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
}

.glass-pill-badge {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #612721;
    font-size: 0.7rem;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.art-title {
    color: #1a202c;
    font-size: 1.15rem;
    line-height: 1.3;
}

.art-artist {
    font-size: 0.85rem;
    letter-spacing: 0.2px;
}

.price-value {
    font-size: 1.4rem;
    line-height: 1;
}

.price-unit {
    font-size: 0.9rem;
    color: #dc3545;
}

.action-btn-container {
    cursor: pointer;
    display: flex;
    align-items: center;
}

.in-cart-label {
    display: flex;
    align-items: center;
    background-color: #f8f9fa;
    color: #28a745;
    padding: 6px 12px;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px solid #28a745;
    transition: all 0.3s ease;
}

.in-cart-label:hover {
    background-color: #e8f5e9;
}

.action-btn-circle {
    width: 42px;
    height: 42px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a202c;
    transition: all 0.3s ease;
    border: 1px solid #eee;
}

.action-btn-circle:hover {
    background: #612721;
    color: #fff;
    transform: scale(1.1);
    }

.col-custom-grid {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0 12px;
}

@media (min-width: 576px) {
    .col-custom-grid { flex: 0 0 50%; max-width: 50%; }
}

@media (min-width: 992px) {
    .col-custom-grid { flex: 0 0 25%; max-width: 25%; }
}

.no-results-box {
    border: 2px dashed #e2e8f0;
    border-radius: 24px;
}

.display-only-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    color: #475569;
    background: #e2e8f0;
    font-size: .75rem;
    font-weight: 700;
}
</style>
