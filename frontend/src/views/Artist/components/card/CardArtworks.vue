<template>
    <div v-if="artworks.length > 0">
        <CRow>
            <CCol class="col-custom-grid mb-5" v-for="(art, index) in artworks" :key="index">
                <CCard class="h-100 border-0 shadow-sm artwork-card cursor-pointer"
                    style="border-radius: 20px; overflow: hidden;" @click="getDetail(art._id)">
                    <div class="card-img-wrapper position-relative">
                        <!-- Badge Container (Top-Left Stack) -->
                        <div class="position-absolute d-flex flex-column align-items-start m-4" style="top: 0; left: 0; z-index: 1; gap: 8px;">
                            <!-- Category Badge -->
                            <div class="px-3 py-1 bg-white rounded-pill shadow-sm text-uppercase font-weight-bold cat-badge"
                                style="font-size: 0.7rem; letter-spacing: 0.5px; color: #3b82f6;">
                                {{ art.category ? getName(currentLocale, art.category) : 'Artwork' }}
                            </div>
                            
                            <!-- Status Badge -->
                            <div v-if="art.status && getStatusLabel(art)" 
                                class="px-3 py-1 bg-white rounded-pill shadow-sm text-uppercase font-weight-bold status-badge"
                                :class="getStatusClass(art)"
                                style="font-size: 0.7rem; letter-spacing: 0.5px;">
                                {{ getStatusLabel(art) }}
                            </div>
                        </div>

                        <div class="card-img-bg h-100 w-100" :style="{ backgroundImage: `url(${art.image || 'https://via.placeholder.com/800x800?text=No+Image'})` }">
                        </div>
                    </div>
                    <CCardBody class="p-4 bg-white position-relative card-body-custom">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="font-weight-bold art-title mb-0">{{ getName(currentLocale, art) }}</h5>
                        </div>
                        <p class="text-muted art-subtitle mb-3">by {{ art.artist ? getName(currentLocale, art.artist) : 'Unknown Artist' }}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <h4 class="font-weight-bold price-text mb-0">฿ {{ formatPrice(art.price) }}</h4>
                            <div v-if="art.status && art.status.sale" class="sale-status-dot" :title="getName(currentLocale, art.status.sale)">
                                <span :class="['dot', art.status.sale.title === 'Sold Out' ? 'dot-sold' : 'dot-available']"></span>
                                <span class="small text-muted ml-1">{{ getName(currentLocale, art.status.sale) }}</span>
                            </div>
                        </div>

                        <!-- Hover Add/Remove Button (Only if available) -->
                        <div v-if="isAvailable(art) && !isInCart(art._id)" class="add-cart-btn shadow-sm" @click.stop="addToCart(art)">
                            <CIcon name="cil-plus" size="lg" />
                        </div>
                        <div v-else-if="isInCart(art._id)" class="add-cart-btn shadow-sm bg-danger" style="opacity: 1; transform: translateY(0); cursor: pointer;" 
                            title="Remove from collection" @click.stop="addToCart(art)">
                            <CIcon name="cil-check" size="lg" />
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    </div>
    <div v-else class="text-center py-5 no-results-box bg-light rounded-xl mt-4">
        <CIcon name="cil-brush" size="3xl" class="text-muted mb-3 opacity-30" />
        <h4 class="text-muted font-weight-bold">No Artworks Found</h4>
        <p class="text-muted max-w-lg mx-auto">We couldn't find any artworks matching your current criteria. Try resetting your search or adjusting the filters.</p>
    </div>
</template>

<script>
export default {
    name: 'CardArtworks',
    props: {
        artworks: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        currentLocale() {
            return this.$i18n ? this.$i18n.locale : 'en';
        }
    },
    methods: {
        getDetail(id) {
            this.$router.push(`/artwork/${id}`);
        },
        addToCart(art) {
            if (this.isInCart(art._id)) {
                // Toggle OFF: Remove from cart
                this.$store.dispatch('cart/removeFromCart', art._id);
                this.$store.commit('dialog/showToast', {
                    title: 'Removed',
                    message: `${this.getName('en', art)} removed from cart`,
                    variant: 'info'
                });
                return;
            }

            // Toggle ON: Add to cart
            this.$store.dispatch('cart/addToCart', {
                _id: art._id,
                title: this.getName('en', art),
                price: art.price,
                image: art.image,
                artist: art.artist ? this.getName('en', art.artist) : 'N/A'
            });
            
            // Show toast
            this.$store.commit('dialog/showToast', {
                title: 'Success',
                message: `${this.getName('en', art)} added to cart`,
                variant: 'success'
            });

            // Open the cart sidebar globally via Vuex
            this.$store.dispatch('cart/setShowCart', true);
        },
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;
            
            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            
            if (Array.isArray(titleField)) {
                const nameObj = titleField.find(n => n.key === lang);
                return nameObj ? nameObj.value : (titleField[0] ? titleField[0].value : '');
            }
            return '';
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0.00';
            return parseFloat(value).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        isAvailable(art) {
            if (!art || !art.status || !art.status.sale) return true;
            return this.getName('en', art.status.sale) !== 'Sold Out';
        },
        isInCart(id) {
            return this.$store.getters['cart/isInCart'](id);
        },
        getStatusLabel(art) {
            if (!art.status) return '';
            
            // Priority 1: Randomized status.approval object (localized)
            if (art.status.approval) {
                return this.getName(this.currentLocale, art.status.approval);
            }
            
            // Priority 2: Simple top-level status string
            if (typeof art.status === 'string') return art.status;
            if (art.status.artworkStatus) return art.status.artworkStatus;
            
            return '';
        },
        getStatusClass(art) {
            // Use fallback to English for class mapping logic if needed
            // By getting the label in 'en' specifically for logic
            const statusEn = art.status && art.status.approval 
                ? this.getName('en', art.status.approval).toLowerCase() 
                : (typeof art.status === 'string' ? art.status.toLowerCase() : '');

            if (statusEn.includes('pending')) return 'badge-pending';
            if (statusEn.includes('approve') || statusEn.includes('accept')) return 'badge-approved';
            if (statusEn.includes('reject')) return 'badge-rejected';
            if (statusEn.includes('draft')) return 'badge-draft';
            return 'badge-info';
        }
    }
}
</script>

<style scoped>
.artwork-card {
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    transform-origin: center;
}

.artwork-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15) !important;
}

.card-img-wrapper {
    height: 420px;
}

@media (min-width: 992px) {
    .card-img-wrapper {
        height: 380px;
    }
}

.col-custom-grid {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0 10px;
}

@media (min-width: 576px) {
    .col-custom-grid {
        flex: 0 0 50%;
        max-width: 50%;
    }
}

@media (min-width: 768px) {
    .col-custom-grid {
        flex: 0 0 33.333333%;
        max-width: 33.333333%;
    }
}

@media (min-width: 992px) {
    .col-custom-grid {
        flex: 0 0 25%;
        max-width: 25%;
    }
}

.card-img-bg {
    background-size: cover;
    background-position: center;
    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.artwork-card:hover .card-img-bg {
    transform: scale(1.05);
}

.art-title {
    color: #1e293b;
    font-size: 1.15rem;
}

.art-subtitle {
    font-size: 0.9rem;
}

.price-text {
    color: #3b82f6;
    letter-spacing: -0.5px;
}

.cat-badge {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.add-cart-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 24px;
    bottom: 24px;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    color: white;
    z-index: 2;
}

.add-cart-btn:hover {
    background-color: #2563eb;
    transform: scale(1.1);
}

.artwork-card:hover .add-cart-btn {
    opacity: 1;
    transform: translateY(0);
}

.sale-status-dot {
    display: flex;
    align-items: center;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.dot-available {
    background-color: #10b981;
}

.dot-sold {
    background-color: #ef4444;
}

.no-results-box {
    border: 2px dashed #e2e8f0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.rounded-xl {
    border-radius: 24px;
}

.max-w-lg {
    max-width: 32rem;
}

/* Status Badge Themes */
.status-badge {
    background-color: #ffffff !important;
    border: 1px solid #f1f5f9;
}

.badge-pending {
    color: #f59e0b !important; /* Amber */
    border-color: #fef3c7 !important;
}

.badge-approved {
    color: #10b981 !important; /* Green */
    border-color: #d1fae5 !important;
}

.badge-rejected {
    color: #8c1515 !important; /* MFU Red */
    border-color: #fee2e2 !important;
}

.badge-draft {
    color: #64748b !important; /* Slate */
    border-color: #f1f5f9 !important;
}

.badge-info {
    color: #3b82f6 !important; /* Blue */
    border-color: #dbeafe !important;
}
</style>