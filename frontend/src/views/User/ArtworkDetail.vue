<template>
    <div class="artwork-detail-page bg-light-soft min-vh-100 pb-5">
        <!-- Minimal Top Nav / Back Button -->
        <div class="top-nav-accent"></div>
        
        <CContainer fluid class="px-md-5 pt-3 mt-1">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state-premium">
                <CSpinner color="danger" variant="grow" style="width: 4rem; height: 4rem;" />
                <h3 class="mt-4 text-dark font-weight-light">Gathering masterpiece details...</h3>
            </div>

            <template v-else-if="artwork && artwork._id">
                <!-- Navigation -->
                <div class="d-flex justify-content-between align-items-center mb-1 mt-3">
                    <CLink @click="$router.push({ name: 'Artworks' })" class="back-link-premium">
                        <CIcon name="cil-arrow-left" class="mr-2" />
                        <span>Return to Gallery</span>
                    </CLink>
                    
                    <div class="d-flex align-items-center" v-if="isPreview">
                        <span class="preview-tag mr-3">PREVIEW MODE</span>
                        <CButton color="dark" shape="pill" size="sm" @click="closePreview">Exit</CButton>
                    </div>
                </div>

                <CRow>
                    <!-- Right Column: Curated Info -->
                    <CCol lg="6" class="mb-4 mb-lg-0">
                        <div class="artwork-visual-container shadow-premium position-relative">
                            <!-- Category & Status -->
                            <div class="artwork-image-wrapper">
                                <img :src="artwork.image" :alt="getName('en', artwork)" class="img-fluid main-artwork-img">
                            </div>
                            <div v-if="isSoldOut" class="sold-out-badge-premium">
                                <span>PRIVATE COLLECTION</span>
                            </div>
                        </div>
                    </CCol>

                    <!-- Right Column: Curated Info -->
                    <CCol lg="6">
                        <div class="artwork-info-card shadow-premium">
                            <div class="artwork-info-content p-4 p-md-5">
                                <!-- Category & Status -->
                                <div class="d-flex align-items-center mb-3">
                                    <span class="info-pill category-pill">{{ artwork.category ? getName('en', artwork.category) : 'Artwork' }}</span>
                                    <span v-if="artwork.status && artwork.status.approval" class="info-pill status-pill ml-2" :style="getStatusBadgeStyle()">
                                        {{ getName('en', artwork.status.approval) }}
                                    </span>
                                </div>

                                <!-- Title & Artist -->
                                <h1 class="artwork-master-title text-dark mb-2">{{ getName('en', artwork) }}</h1>
                                <div class="artist-signature-block mb-4">
                                    <span class="label">Artist</span>
                                    <h4 class="artist-name">{{ artwork.artist ? getName('en', artwork.artist) : 'Unknown Artist' }}</h4>
                                </div>

                                <!-- Price Display -->
                                <div class="valuation-block mb-5">
                                    <div class="valuation-label">Collector's Value</div>
                                    <div class="valuation-price">
                                        <span class="currency">฿</span>
                                        <span class="amount">{{ formatPrice(artwork.price) }}</span>
                                    </div>
                                </div>

                                <!-- Specs Grid (3 Column) -->
                                <div class="specs-grid-premium mb-5">
                                    <div class="spec-item">
                                        <div class="spec-icon"><CIcon name="cil-brush" /></div>
                                        <div class="spec-text">
                                            <label>Technique</label>
                                            <span>{{ getName('en', artwork, 'technique') || 'Mixed Media' }}</span>
                                        </div>
                                    </div>
                                    <div class="spec-item">
                                        <div class="spec-icon"><CIcon name="cil-resize-both" /></div>
                                        <div class="spec-text">
                                            <label>Size</label>
                                            <span>{{ artwork.dimension || 'N/A' }}</span>
                                        </div>
                                    </div>
                                    <div class="spec-item">
                                        <div class="spec-icon"><CIcon name="cil-history" /></div>
                                        <div class="spec-text">
                                            <label>Created</label>
                                            <span>{{ formatDate(artwork.createdAt) }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Description Block -->
                                <div class="curator-description mb-5">
                                    <div class="description-header d-flex align-items-center mb-3">
                                        <span class="dot mr-2"></span>
                                        <h6>Concept & Narrative</h6>
                                    </div>
                                    <p class="description-body">
                                        {{ getName('en', artwork, 'description') || 'No description provided for this artwork.' }}
                                    </p>
                                </div>

                                <!-- Purchase Actions -->
                                <div class="action-stack-premium pt-4 border-top">
                                    <CButton block :color="isSoldOut || isPreview ? 'secondary' : (isInCart ? 'dark' : 'danger')" size="lg" shape="pill"
                                        :disabled="isSoldOut || isPreview"
                                        class="btn-purchase-premium shadow-lg mb-3"
                                        :style="isSoldOut || isPreview || isInCart ? 'background: #e2e8f0 !important; color: #94a3b8 !important;' : 'background: linear-gradient(135deg, #4a1d18, #612721); color: white !important;'"
                                        @click="addToCart">
                                        <CIcon v-if="!isSoldOut && !isPreview && !isInCart" name="cil-cart" class="mr-2" />
                                        <CIcon v-else-if="isSoldOut" name="cil-lock-locked" class="mr-2" />
                                        <CIcon v-else-if="isInCart" name="cil-check" class="mr-2" />
                                        {{ getButtonText }}
                                    </CButton>
                                    
                                    <div class="d-flex align-items-center justify-content-between">
                                        <CButton color="outline-dark" shape="pill" class="btn-action-secondary px-4 mr-2 flex-grow-1" @click="contactInquiry">
                                            <CIcon name="cil-chat-bubble" class="mr-2" /> Inquiry
                                        </CButton>
                                        <CButton color="outline-secondary" shape="pill" class="btn-action-icon" @click="shareArtwork">
                                            <CIcon name="cil-share" />
                                        </CButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CCol>
                </CRow>
            </template>

            <!-- Not Found State -->
            <div v-else class="not-found-premium text-center py-5">
                <CIcon name="cil-mood-bad" size="4xl" class="text-muted mb-4" />
                <h2>Artwork Missing</h2>
                <p class="text-muted">The piece you're seeking is currently not in our catalog.</p>
                <CButton color="danger" variant="outline" shape="pill" class="mt-4 px-5 py-2" @click="$router.push({ name: 'Artworks' })">
                    Discover More Artworks
                </CButton>
            </div>
        </CContainer>
    </div>
</template>

<script>
import moment from 'moment';

export default {
    name: 'ArtworkDetail',
    data() {
        return {
            loading: true,
            isPreview: false,
            artwork: {}
        }
    },
    computed: {
        isSoldOut() {
            if (!this.artwork || !this.artwork.status || !this.artwork.status.sale) return false;
            return this.getName('en', this.artwork.status.sale) === 'Sold Out';
        },
        isInCart() {
            if (!this.artwork || !this.artwork._id) return false;
            return this.$store.getters['cart/isInCart'](this.artwork._id);
        },
        getButtonText() {
            if (this.isPreview) return 'Preview Mode';
            if (this.isSoldOut) return 'Already Sold Out';
            if (this.isInCart) return 'In Collection (Remove?)';
            return 'Add in cart';
        }
    },
    methods: {
        async fetchArtwork() {
            const id = this.$route.params.id;
            if (id === 'preview') {
                const previewData = sessionStorage.getItem('artwork_preview');
                if (previewData) {
                    this.artwork = JSON.parse(previewData);
                    this.isPreview = true;
                    this.loading = false;
                }
                return;
            }

            this.loading = true;
            try {
                const result = await this.$store.dispatch('artwork/explore', { _id: id });
                if (result) {
                    this.artwork = result;
                }
            } catch (error) {
                console.error('Error fetching artwork details:', error);
            } finally {
                this.loading = false;
            }
        },
        formatPrice(price) {
            return price ? price.toLocaleString() : '0';
        },
        formatDate(date) {
            return moment(date).format('MMMM D, YYYY');
        },
        getStatusBadgeStyle() {
            if (!this.artwork || !this.artwork.status || !this.artwork.status.approval) return '';
            const status = this.getName('en', this.artwork.status.approval);
            if (status === 'Approved') return 'background: rgba(46, 213, 115, 0.1); color: #2ed573;';
            if (status === 'Pending') return 'background: rgba(255, 165, 2, 0.1); color: #ffa502;';
            return 'background: rgba(255, 71, 87, 0.1); color: #ff4757;';
        },
        addToCart() {
            if (this.isPreview || this.isSoldOut) return;
            if (this.isInCart) {
                this.$store.dispatch('cart/removeFromCart', this.artwork._id);
            } else {
                this.$store.dispatch('cart/addToCart', this.artwork);

                // Automatically open the cart sidebar (A-side)
                this.$store.dispatch('cart/setShowCart', true);
            }
        },
        getName(lang, item, field = null) {
            if (!item) return '';
            if (typeof item === 'string') return item;

            const target = field ? item[field] : (item.title || item.name || item.description || item.technique);
            if (!target) return '';
            if (typeof target === 'string') return target;
            
            if (Array.isArray(target)) {
                const nameObj = target.find(n => n.key === lang);
                if (nameObj) return nameObj.value;
                if (target[0] && target[0].value) return target[0].value;
                if (typeof target[0] === 'string') return target.join(', ');
            }
            if (typeof target === 'object') {
                return target[lang] || target['en'] || target['th'] || '';
            }
            return '';
        },
        closePreview() {
            window.close();
        },
        contactInquiry() {
            alert('Opening contact inquiry for: ' + this.getName('en', this.artwork));
        },
        shareArtwork() {
            if (navigator.share) {
                navigator.share({
                    title: this.getName('en', this.artwork),
                    url: window.location.href
                });
            } else {
                alert('URL copied to clipboard: ' + window.location.href);
            }
        }
    },
    mounted() {
        this.fetchArtwork();
    }
}
</script>

<style scoped>

.artwork-detail-page {
    padding-top: 0 !important;
    margin-top: -2rem !important;
}

.bg-light-soft {
    background-color: #fcfcfc;
}

.top-nav-accent {
    height: 4px;
    background: linear-gradient(90deg, #4a1d18, #612721);
    width: 100%;
}

.loading-state-premium {
    height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.back-link-premium {
    text-decoration: none !important;
    color: #64748b;
    font-weight: 700;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    transition: color 0.3s ease;
}

.back-link-premium:hover {
    color: #4a1d18;
}

.preview-tag {
    background: #1e293b;
    color: white;
    font-size: 0.65rem;
    font-weight: 900;
    padding: 4px 12px;
    border-radius: 50px;
    letter-spacing: 1px;
}

.artwork-info-card {
    background: white;
    border-radius: 32px;
    overflow: hidden;
}

.artwork-visual-container {
    background: white;
    border-radius: 32px;
    overflow: hidden;
}

.shadow-premium {
    box-shadow: 0 30px 60px rgba(0,0,0,0.06);
}

.artwork-image-wrapper {
    width: 100%;
    height: auto;
    overflow: hidden;
}

.main-artwork-img {
    width: 100%;
    height: auto;
    display: block;
}

/* Hover effect removed per user request */
/* .artwork-visual-container:hover .main-artwork-img { transform: scale(1.05); } */

.sold-out-badge-premium {
    position: absolute;
    top: 40px;
    right: 40px;
    background: rgba(0,0,0,0.85);
    color: white;
    padding: 10px 24px;
    border-radius: 50px;
    font-size: 0.7rem;
    font-weight: 900;
    letter-spacing: 2px;
    backdrop-filter: blur(10px);
    z-index: 5;
}

.info-pill {
    padding: 6px 16px;
    border-radius: 50px;
    font-size: 0.7rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.category-pill {
    background: #f1f5f9;
    color: #475569;
}

.artwork-master-title {
    font-size: 3.5rem;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -2px;
}

.artist-signature-block {
    display: flex;
    flex-direction: column;
}

.artist-signature-block .label {
    font-size: 0.7rem;
    font-weight: 800;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 4px;
}

.artist-signature-block .artist-name {
    font-size: 1.5rem;
    font-weight: 400;
    color: #4a1d18;
}

.valuation-block {
    background: white;
    padding: 24px;
    border-radius: 24px;
    border: 1px solid #f1f5f9;
}

.valuation-label {
    font-size: 0.7rem;
    font-weight: 800;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 8px;
}

.valuation-price {
    display: flex;
    align-items: baseline;
    color: #1e293b;
}

.valuation-price .currency {
    font-size: 1.5rem;
    font-weight: 400;
    margin-right: 8px;
}

.valuation-price .amount {
    font-size: 2.8rem;
    font-weight: 900;
}

.specs-grid-premium {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.spec-item {
    background: #f8fafc;
    padding: 16px;
    border-radius: 20px;
    display: flex;
    align-items: center;
}

.spec-icon {
    width: 36px;
    height: 36px;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a1d18;
    margin-right: 12px;
    font-size: 0.9rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.spec-text label {
    display: block;
    font-size: 0.6rem;
    font-weight: 800;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0;
}

.spec-text span {
    font-size: 0.85rem;
    font-weight: 700;
    color: #1e293b;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.curator-description .dot {
    width: 8px;
    height: 8px;
    background: #4a1d18;
    border-radius: 50%;
}

.curator-description h6 {
    font-size: 0.8rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #1e293b;
    margin-bottom: 0;
}

.description-body {
    line-height: 2;
    color: #475569;
    font-size: 1.05rem;
    white-space: pre-line;
}

.btn-purchase-premium {
    border: none;
    padding: 20px;
    font-weight: 800;
    font-size: 1.1rem;
}

/* Hover effect removed per user request */
/* .btn-purchase-premium:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(74, 29, 24, 0.2) !important;
} */

.btn-action-secondary {
    border-width: 2px;
    padding: 12px;
}

.btn-action-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-width: 2px;
}

@media (max-width: 991.98px) {
    .artwork-master-title { font-size: 2.5rem; }
    .pl-lg-5 { padding-left: 15px !important; }
    .specs-grid-premium { grid-template-columns: 1fr; }
    .valuation-price .amount { font-size: 2.2rem; }
}
</style>
