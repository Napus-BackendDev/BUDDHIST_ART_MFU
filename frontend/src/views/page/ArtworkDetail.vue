<template>
    <div class="artwork-detail-page bg-light-soft min-vh-100 pb-5">
        <!-- Minimal Top Nav / Back Button -->
        <div class="top-nav-accent"></div>
        
        <CContainer fluid class="px-md-5 pt-3 mt-1">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state-premium">
                <CSpinner color="danger" variant="grow" style="width: 4rem; height: 4rem;" />
                <h3 class="mt-4 text-dark font-weight-light">{{ $i18n.locale === 'en' ? 'Gathering masterpiece details...' : 'กำลังดึงข้อมูลผลงาน...' }}</h3>
            </div>

            <template v-else-if="artwork && artwork._id">
                <!-- Navigation -->
                <div class="d-flex justify-content-between align-items-center mb-4 mt-3">
                    <CLink @click="$router.push({ name: 'Artworks' })" class="back-link-premium">
                        <CIcon name="cilArrowLeft" size="lg" class="mr-2" />
                        <span>{{ $i18n.locale === 'en' ? 'Return to Gallery' : 'กลับไปหน้ารวมผลงาน' }}</span>
                    </CLink>
                    
                    <div class="d-flex align-items-center" v-if="isPreview">
                        <span class="preview-tag mr-3">{{ $i18n.locale === 'en' ? 'PREVIEW MODE' : 'โหมดดูตัวอย่าง' }}</span>
                        <CButton color="dark" shape="pill" size="sm" @click="closePreview">{{ $i18n.locale === 'en' ? 'Exit' : 'ออก' }}</CButton>
                    </div>
                </div>

                <CRow>
                    <!-- Right Column: Curated Info -->
                    <CCol lg="6" class="mb-4 mb-lg-0">
                        <div class="artwork-visual-container shadow-premium position-relative">
                            <!-- Category & Status -->
                            <div class="artwork-image-wrapper position-relative">
                                <img :src="artwork.image" :alt="getName($i18n.locale, artwork)" class="img-fluid main-artwork-img">
                                
                                <!-- Zoom Button -->
                                <button v-if="!showZoomModal" class="btn-zoom-float shadow-lg" @click="zoomImg" title="Zoom Image">
                                    <CIcon name="cilMagnifyingGlass" />
                                </button>
                            </div>
                            <!-- <div v-if="isSoldOut" class="sold-out-badge-premium">
                                <span>{{ $i18n.locale === 'en' ? 'PRIVATE COLLECTION' : 'เก็บเข้าคอลเลกชันส่วนตัว' }}</span>
                            </div> -->
                        </div>
                    </CCol>

                    <!-- Right Column: Curated Info -->
                    <CCol lg="6">
                        <div class="artwork-info-card shadow-premium">
                            <div class="artwork-info-content p-4 p-md-5">
                                <!-- Category & Status -->
                                <div class="d-flex align-items-center mb-3">
                                    <span class="info-pill category-pill">{{ artwork.category ? getName($i18n.locale, artwork.category) : ($i18n.locale === 'en' ? 'Artwork' : 'ผลงานศิลปะ') }}</span>
                                    <span v-if="artwork.status && artwork.status.approval && getName('en', artwork.status.approval) !== 'Approved'" class="info-pill status-pill ml-2" :style="getStatusBadgeStyle()">
                                        {{ getName($i18n.locale, artwork.status.approval) }}
                                    </span>
                                </div>

                                <!-- Title & Artist -->
                                <h1 class="artwork-master-title text-dark mb-2">{{ getName($i18n.locale, artwork) }}</h1>
                                <div class="artist-signature-block mb-4">
                                    <span class="label">{{ $i18n.locale === 'en' ? 'Artist' : 'ศิลปิน' }}</span>
                                    <h4 class="artist-name clickable" @click="goToArtistProfile">
                                        {{ artwork.artist ? getName($i18n.locale, artwork.artist) : ($i18n.locale === 'en' ? 'Unknown Artist' : 'ศิลปินนิรนาม') }}
                                    </h4>
                                </div>

                                <!-- Price Display -->
                                <div class="valuation-block mb-5">
                                    <div class="valuation-label">{{ $i18n.locale === 'en' ? "Collector's Value" : 'มูลค่าของผลงาน' }}</div>
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
                                            <label>{{ $i18n.locale === 'en' ? 'Technique' : 'เทคนิค' }}</label>
                                            <span>{{ getName($i18n.locale, artwork, 'technique') || ($i18n.locale === 'en' ? 'Mixed Media' : 'สื่อผสม') }}</span>
                                        </div>
                                    </div>
                                    <div class="spec-item">
                                        <div class="spec-icon"><CIcon name="cil-resize-both" /></div>
                                        <div class="spec-text">
                                            <label>{{ $i18n.locale === 'en' ? 'Size' : 'ขนาด' }}</label>
                                            <span>{{ getName($i18n.locale, artwork, 'size') || 'N/A' }}</span>
                                        </div>
                                    </div>
                                    <div class="spec-item">
                                        <div class="spec-icon"><CIcon name="cil-history" /></div>
                                        <div class="spec-text">
                                            <label>{{ $i18n.locale === 'en' ? 'Created' : 'สร้างเมื่อ' }}</label>
                                            <span>{{ formatDate(artwork.createdAt) }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Description Block -->
                                <div class="curator-description mb-5">
                                    <div class="description-header d-flex align-items-center mb-3">
                                        <span class="dot mr-2"></span>
                                        <h6>{{ $i18n.locale === 'en' ? 'Concept & Narrative' : 'แนวความคิด' }}</h6>
                                    </div>
                                    <p class="description-body">
                                        {{ getName($i18n.locale, artwork, 'description') || ($i18n.locale === 'en' ? 'No description provided for this artwork.' : 'ไม่มีรายละเอียดสำหรับผลงานชิ้นนี้') }}
                                    </p>
                                </div>

                                <!-- Purchase Actions -->
                                <div class="action-stack-premium pt-4 border-top">
                                    <CButton block :color="isSoldOut || isPreview || !isPurchasable || (isApprovalReserved && !isInCart) ? 'secondary' : (isInCart ? 'dark' : 'danger')" size="lg" shape="pill"
                                        :disabled="isSoldOut || isPreview || !isPurchasable || (isApprovalReserved && !isInCart) || isAddingToCart"
                                        class="btn-purchase-premium shadow-lg mb-3"
                                        :style="isSoldOut || isPreview || !isPurchasable || (isApprovalReserved && !isInCart) || isInCart ? 'background: #e2e8f0 !important; color: #94a3b8 !important;' : 'background: linear-gradient(135deg, #4a1d18, #612721); color: white !important;'"
                                        @click="addToCart">
                                        <CIcon v-if="isAddingToCart" name="cil-reload" size="xl" class="mr-3 spinner-animation" />
                                        <template v-else>
                                            <CIcon v-if="!isSoldOut && !isPreview && isPurchasable && !isInCart && !isApprovalReserved" name="cilCart" size="xl" class="mr-3" />
                                            <CIcon v-else-if="isSoldOut" name="cilLockLocked" size="xl" class="mr-3" />
                                            <CIcon v-else-if="isApprovalReserved && !isInCart" name="cilCart" size="xl" class="mr-3" />
                                            <CIcon v-else-if="!isPurchasable && !isSoldOut" name="cilLockLocked" size="xl" class="mr-3" />
                                            <CIcon v-else-if="isInCart" name="cilCheck" size="xl" class="mr-3" />
                                        </template>
                                        {{ isAddingToCart ? ($i18n.locale === 'en' ? 'Checking status...' : 'กำลังตรวจสอบ...') : getButtonText }}
                                    </CButton>
                                    
                                    <div class="d-flex align-items-center justify-content-between">
                                        <CButton color="outline-dark" shape="pill" class="btn-action-secondary px-4 mr-2 flex-grow-1 d-flex align-items-center justify-content-center" @click="contactInquiry">
                                            <CIcon name="cilChatBubble" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Inquiry' : 'สอบถาม' }}
                                        </CButton>
                                        <CButton color="outline-secondary" shape="pill" class="btn-action-icon d-flex align-items-center justify-content-center" @click="shareArtwork">
                                            <CIcon name="cilShare" />
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
                <h2>{{ $i18n.locale === 'en' ? 'Artwork Missing' : 'ไม่พบผลงานศิลปะ' }}</h2>
                <p class="text-muted">{{ $i18n.locale === 'en' ? "The piece you're seeking is currently not in our catalog." : 'ไม่พบผลงานศิลปะที่คุณกำลังค้นหาในขณะนี้' }}</p>
                <CButton color="danger" variant="outline" shape="pill" class="mt-4 px-5 py-2" @click="$router.push({ name: 'Artworks' })">
                    {{ $i18n.locale === 'en' ? 'Discover More Artworks' : 'ค้นหาผลงานศิลปะอื่นๆ' }}
                </CButton>
            </div>

            <!-- Image Zoom Lightbox (Same style as NewsDetail.vue) -->
            <div v-if="showZoomModal" class="lightbox-overlay" @click="showZoomModal = false">
                <div class="lightbox-content" @click.stop>
                    <img :src="artwork.image" :alt="getName($i18n.locale, artwork)" class="img-fluid zoom-img-main shadow-lg">
                    <div class="lightbox-caption text-center py-3">
                        <h4 class="mb-1 text-white font-weight-bold">{{ getName($i18n.locale, artwork) }}</h4>
                        <p class="text-white-50 mb-0">{{ artwork.artist ? getName($i18n.locale, artwork.artist) : ($i18n.locale === 'en' ? 'Artist' : 'ศิลปิน') }}</p>
                    </div>
                    <button class="lightbox-close-btn" @click="showZoomModal = false">
                        <CIcon name="cilX" size="xl" />
                    </button>
                </div>
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
            showZoomModal: false,
            artwork: {},
            polling: null,
            isAddingToCart: false
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
        isPurchasable() {
            if (this.isPreview) return false;
            if (!this.artwork || !this.artwork.status || !this.artwork.status.sale) return false;
            const status = this.getName('en', this.artwork.status.sale);
            // ONLY 'Available' status is purchasable.
            return status === 'Available';
        },
        isApprovalReserved() {
            if (!this.artwork || !this.artwork.status || !this.artwork.status.approval) return false;
            return this.getName('en', this.artwork.status.approval) === 'Reserved';
        },
        getButtonText() {
            if (this.isPreview) return this.$i18n.locale === 'en' ? 'Preview Mode' : 'โหมดดูตัวอย่าง';
            if (this.isSoldOut) return this.$i18n.locale === 'en' ? 'Already Sold Out' : 'ขายแล้ว';
            
            // If it's in SOMEONE ELSE'S cart (Reserved)
            if (this.isApprovalReserved && !this.isInCart) return this.$i18n.locale === 'en' ? 'Being Ordered' : 'จองแล้ว';

            if (!this.isPurchasable) return this.$i18n.locale === 'en' ? 'Not for Sale' : 'ไม่ได้มีไว้เพื่อขาย';
            if (this.isInCart) return this.$i18n.locale === 'en' ? 'In Collection (Remove?)' : 'อยู่ในตะกร้า (นำออก?)';
            return this.$i18n.locale === 'en' ? 'Add in cart' : 'หยิบใส่ตะกร้า';
        }
    },
    methods: {
        async fetchArtwork(silent = false) {
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

            if (!silent) this.loading = true;
            try {
                const result = await this.$store.dispatch('artwork/explore', { _id: id });
                if (result) {
                    this.artwork = result;
                }
            } catch (error) {
                console.error('Error fetching artwork details:', error);
            } finally {
                if (!silent) this.loading = false;
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
        zoomImg() {
            if (this.artwork && this.artwork.image) {
                this.showZoomModal = true;
            }
        },
        async addToCart() {
            if (this.isPreview || this.isSoldOut || !this.isPurchasable || (this.isApprovalReserved && !this.isInCart) || this.isAddingToCart) return;
            
            try {
                this.isAddingToCart = true;
                
                if (!this.isInCart) {
                    // Check latest status before adding
                    const result = await this.$store.dispatch('artwork/explore', { _id: this.artwork._id });
                    if (result && this.getName('en', result.status.approval) === 'Reserved') {
                        alert(this.$i18n.locale === 'en' ? 'Sorry, this artwork was just reserved.' : 'ขออภัย ผลงานนี้เพิ่งถูกจองไป');
                        return;
                    }
                    this.$store.dispatch('cart/addToCart', result || this.artwork);
                    this.$store.dispatch('cart/setShowCart', true);
                } else {
                    this.$store.dispatch('cart/removeFromCart', this.artwork._id);
                }
            } catch (error) {
                console.error('Add to cart failed:', error);
            } finally {
                this.isAddingToCart = false;
            }
        },
        closePreview() {
            window.close();
        },
        contactInquiry() {
            alert('Opening contact inquiry for: ' + this.getName(this.$i18n.locale, this.artwork));
        },
        shareArtwork() {
            if (navigator.share) {
                navigator.share({
                    title: this.getName(this.$i18n.locale, this.artwork),
                    url: window.location.href
                });
            } else {
                alert('URL copied to clipboard: ' + window.location.href);
            }
        },
        goToArtistProfile() {
            if (this.artwork && this.artwork.artist) {
                const artistId = typeof this.artwork.artist === 'object' ? this.artwork.artist._id : this.artwork.artist;
                if (artistId) {
                    this.$router.push({ name: 'ArtistPublicProfile', params: { id: artistId } });
                }
            }
        }
    },
    mounted() {
        this.fetchArtwork();
        this.polling = setInterval(() => {
            if (!this.isPreview) {
                this.fetchArtwork(true);
            }
        }, 5000);
    },
    beforeDestroy() {
        if (this.polling) {
            clearInterval(this.polling);
        }
    }
}
</script>

<style scoped>
.btn-zoom-float {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a1d18;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 5;
    opacity: 0.8;
}

.btn-zoom-float:hover {
    opacity: 1;
    transform: scale(1.1);
    background: #4a1d18;
    color: white;
}

/* Lightbox Styles (NewsDetail.vue style) */
.lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: fadeInOverlay 0.3s ease;
}

@keyframes fadeInOverlay {
    from { opacity: 0; }
    to { opacity: 1; }
}

.lightbox-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.zoom-img-main {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.lightbox-caption {
    width: 100%;
    margin-top: 15px;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.lightbox-close-btn {
    position: fixed;
    top: 30px;
    right: 30px;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.3s ease;
}

.lightbox-close-btn:hover {
    opacity: 1;
    transform: rotate(90deg) scale(1.1);
}

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
    transition: all 0.2s ease;
}

.artist-signature-block .artist-name.clickable {
    cursor: pointer;
}

.artist-signature-block .artist-name.clickable:hover {
    color: #612721;
    text-decoration: underline;
}

.valuation-block {
    background: #f8fafc;
    padding: 24px;
    border-radius: 24px;
    border: 1px solid #f8fafc;
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
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner-animation {
  animation: spin 1s linear infinite;
}
</style>
