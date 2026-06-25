<template>
    <div class="artwork-detail-page bg-premium-soft min-vh-100 pb-5">
        <!-- Minimal Top Nav / Back Button Accent -->
        <div class="top-nav-accent"></div>
        
        <CContainer class="pt-4 mt-2">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state-premium">
                <div class="premium-spinner-wrapper">
                    <CSpinner color="danger" variant="grow" style="width: 4.5rem; height: 4.5rem;" />
                    <div class="spinner-shine"></div>
                </div>
                <h3 class="mt-4 text-dark font-weight-light font-serif-thai">{{ $i18n.locale === 'en' ? 'Gathering masterpiece details...' : 'กำลังดึงข้อมูลผลงานศิลปะ...' }}</h3>
            </div>

            <template v-else-if="artwork && artwork._id">
                <!-- Navigation & Breadcrumbs -->
                <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
                    <CLink @click="$router.push({ name: 'Artworks' })" class="back-link-premium">
                        <div class="back-arrow-circle">
                            <CIcon name="cilArrowLeft" size="lg" />
                        </div>
                        <span class="ml-2 font-weight-bold">{{ $i18n.locale === 'en' ? 'Return to Gallery' : 'กลับสู่แกลเลอรี' }}</span>
                    </CLink>
                    
                    <div class="d-flex align-items-center" v-if="isPreview">
                        <span class="preview-tag mr-3">{{ $i18n.locale === 'en' ? 'PREVIEW MODE' : 'โหมดดูตัวอย่าง' }}</span>
                        <CButton color="dark" shape="pill" size="sm" class="px-3" @click="closePreview">{{ $i18n.locale === 'en' ? 'Exit' : 'ออก' }}</CButton>
                    </div>
                </div>

                <CRow class="artwork-detail-grid">
                    <!-- Left Column: Premium Gallery Visual Frame -->
                    <CCol lg="6" class="mb-4 mb-lg-0 visual-column">
                        <div class="gallery-frame-container shadow-premium position-relative">
                            <!-- Outer museum mount/matting style -->
                            <div class="gallery-matting">
                                <div class="artwork-image-wrapper position-relative">
                                    <img :src="artwork.image" :alt="getName($i18n.locale, artwork)" class="img-fluid main-artwork-img">
                                    
                                    <!-- Dynamic Light Overlay Effect on hover -->
                                    <div class="reflection-overlay"></div>
                                    
                                    <!-- Zoom Button with premium styling -->
                                    <button v-if="!showZoomModal" class="btn-zoom-float shadow-lg" @click="zoomImg" title="Zoom Image">
                                        <CIcon name="cilMagnifyingGlass" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CCol>

                    <!-- Right Column: Curated Info & Collector Card -->
                    <CCol lg="6" class="info-column">
                        <div class="artwork-info-card shadow-premium">
                            <div class="artwork-info-content p-4 p-md-5">
                                <!-- Category & Status Tag Row -->
                                <div class="d-flex align-items-center mb-3 flex-wrap gap-2">
                                    <span class="info-pill category-pill">
                                        <CIcon name="cil-tag" class="mr-1" size="sm" />
                                        {{ artwork.category ? getName($i18n.locale, artwork.category) : ($i18n.locale === 'en' ? 'Artwork' : 'ผลงานศิลปะ') }}
                                    </span>
                                    <span v-if="artwork.status && artwork.status.approval && getName('en', artwork.status.approval) !== 'Approved'" class="info-pill status-pill ml-2" :style="getStatusBadgeStyle()">
                                        <CIcon name="cil-info" class="mr-1" size="sm" />
                                        {{ getName($i18n.locale, artwork.status.approval) }}
                                    </span>
                                </div>

                                <!-- Title & Fine Art Label -->
                                <div class="title-header-block mb-3">
                                    <h1 class="artwork-master-title mb-2 text-dark">{{ getName($i18n.locale, artwork) }}</h1>
                                    <div class="title-divider"></div>
                                </div>

                                <!-- Artist Profile Widget -->
                                <div class="artist-profile-widget p-3 mb-4 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center">
                                        <div class="artist-avatar-wrapper mr-3">
                                            <img v-if="artwork.artist && artwork.artist.image" 
                                                 :src="artwork.artist.image" 
                                                 class="artist-avatar-image" 
                                                 :alt="artwork.artist ? getName($i18n.locale, artwork.artist) : ''" />
                                            <div v-else class="artist-avatar-placeholder">
                                                <span>{{ artwork.artist ? (getName($i18n.locale, artwork.artist) ? getName($i18n.locale, artwork.artist).charAt(0).toUpperCase() : 'A') : 'A' }}</span>
                                            </div>
                                        </div>
                                        <div class="artist-info-meta">
                                            <span class="label">{{ $i18n.locale === 'en' ? 'Master Creator' : 'ศิลปินผู้สร้างสรรค์' }}</span>
                                            <h4 class="artist-name mb-0">
                                                {{ artwork.artist ? getName($i18n.locale, artwork.artist) : ($i18n.locale === 'en' ? 'Unknown Artist' : 'ศิลปินนิรนาม') }}
                                            </h4>
                                        </div>
                                    </div>
                                    <CButton v-if="artwork.artist" 
                                             color="outline-danger" 
                                             shape="pill" 
                                             size="sm" 
                                             class="btn-view-profile-premium px-3 d-flex align-items-center" 
                                             @click="goToArtistProfile">
                                        <span class="mr-1">{{ $i18n.locale === 'en' ? 'View Profile' : 'ดูโปรไฟล์' }}</span>
                                        <CIcon name="cil-user" size="sm" />
                                    </CButton>
                                </div>

                                <!-- Exhibition Only / Display Only Block -->
                                <div v-if="!isPurchasable" class="exhibition-display-block mb-4">
                                    <div class="d-flex align-items-center mb-2">
                                        <div class="exhibition-dot mr-2" :style="{ backgroundColor: isSoldOut ? '#ef4444' : '#8c3b32' }"></div>
                                        <span class="label">
                                            <span v-if="isSoldOut">{{ $i18n.locale === 'en' ? "Artwork Status" : 'สถานะผลงาน' }}</span>
                                            <span v-else-if="isExhibitionDetail">{{ $i18n.locale === 'en' ? "Gallery Exhibition" : 'ผลงานเพื่อการจัดแสดง' }}</span>
                                            <span v-else>{{ $i18n.locale === 'en' ? "Artwork Status" : 'สถานะผลงาน' }}</span>
                                        </span>
                                    </div>
                                    <div class="exhibition-text">
                                        <span v-if="isSoldOut">{{ $i18n.locale === 'en' ? 'Sold Out' : 'ขายแล้ว' }}</span>
                                        <span v-else-if="isExhibitionDetail">{{ $i18n.locale === 'en' ? 'Exhibition Only' : 'โชว์เท่านั้น' }}</span>
                                        <span v-else>{{ $i18n.locale === 'en' ? 'Not for Sale' : 'ไม่ขาย' }}</span>
                                    </div>
                                    <p class="exhibition-desc mb-0">
                                        <span v-if="isSoldOut">{{ $i18n.locale === 'en' ? 'This artwork has been sold and is no longer available.' : 'ผลงานชิ้นนี้ขายไปแล้วและไม่มีจำหน่ายในขณะนี้' }}</span>
                                        <span v-else-if="isExhibitionDetail">{{ $i18n.locale === 'en' ? 'This artwork is curated for exhibition and is currently not available for purchase.' : 'ผลงานศิลปะชิ้นนี้ได้รับการจัดสรรเพื่อร่วมแสดงนิทรรศการและไม่ได้เปิดให้สั่งซื้อในขณะนี้' }}</span>
                                        <span v-else>{{ $i18n.locale === 'en' ? 'This artwork is currently not available for purchase.' : 'ผลงานชิ้นนี้ไม่มีจำหน่ายหรือเพื่อการสะสมในขณะนี้' }}</span>
                                    </p>
                                </div>
                                <div v-else class="valuation-block mb-4">
                                    <div class="valuation-label-row d-flex justify-content-between align-items-center mb-2">
                                        <span class="label">{{ $i18n.locale === 'en' ? "Collector's Value" : 'มูลค่าการสะสมผลงาน' }}</span>
                                        <span class="verified-label-badge"><CIcon name="cil-check-circle" class="mr-1" size="sm"/>{{ $i18n.locale === 'en' ? 'Verified Value' : 'ประเมินแล้ว' }}</span>
                                    </div>
                                    <div class="valuation-price">
                                        <span class="currency">฿</span>
                                        <span class="amount">{{ formatPrice(artwork.price) }}</span>
                                        <span class="currency-code">THB</span>
                                    </div>
                                </div>

                                <!-- Specs Grid (Curated details layout) -->
                                <div class="specs-grid-premium mb-4">
                                    <div class="spec-card">
                                        <div class="spec-icon"><CIcon name="cil-brush" /></div>
                                        <div class="spec-info">
                                            <label>{{ $i18n.locale === 'en' ? 'Technique' : 'เทคนิค' }}</label>
                                            <span :title="getName($i18n.locale, artwork, 'technique')">{{ getName($i18n.locale, artwork, 'technique') || ($i18n.locale === 'en' ? 'Mixed Media' : 'สื่อผสม') }}</span>
                                        </div>
                                    </div>
                                    <div class="spec-card">
                                        <div class="spec-icon"><CIcon name="cil-resize-both" /></div>
                                        <div class="spec-info">
                                            <label>{{ $i18n.locale === 'en' ? 'Dimension' : 'ขนาดผลงาน' }}</label>
                                            <span :title="getName($i18n.locale, artwork, 'size')">{{ getName($i18n.locale, artwork, 'size') || 'N/A' }}</span>
                                        </div>
                                    </div>
                                    <div class="spec-card spec-card-full">
                                        <div class="spec-icon"><CIcon name="cil-chart-line" /></div>
                                        <div class="spec-info">
                                            <label>{{ $i18n.locale === 'en' ? 'Views' : 'ยอดเข้าชม' }}</label>
                                            <span>{{ artwork.views || 0 }} {{ $i18n.locale === 'en' ? 'views' : 'ครั้ง' }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Curated Concept & Narrative Section -->
                                <div class="curator-description mb-4">
                                    <div class="description-header d-flex align-items-center mb-3">
                                        <div class="header-accent-mark"></div>
                                        <h6 class="mb-0 text-uppercase font-weight-bold tracking-wider">{{ $i18n.locale === 'en' ? 'Concept & Narrative' : 'แนวคิดและแรงบันดาลใจในการสร้างสรรค์' }}</h6>
                                    </div>
                                    <div class="description-body-container">
                                        <p class="description-body">
                                            {{ getName($i18n.locale, artwork, 'description') || ($i18n.locale === 'en' ? 'No description provided for this artwork.' : 'ไม่มีรายละเอียดสำหรับผลงานชิ้นนี้') }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Collector Actions Interface -->
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
                                        {{ isAddingToCart ? ($i18n.locale === 'en' ? 'Checking status...' : 'กำลังตรวจสอบสถานะ...') : getButtonText }}
                                    </CButton>
                                    
                                    <div class="d-flex align-items-center justify-content-between action-buttons-row">
                                        <CButton color="outline-dark" shape="pill" class="btn-action-secondary px-4 flex-grow-1 d-flex align-items-center justify-content-center" @click="shareArtwork">
                                            <CIcon name="cilShare" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Share Artwork' : 'แชร์ผลงานนี้' }}
                                        </CButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CCol>
                </CRow>

                <!-- View More Artworks / Related Artworks Section -->
                <div v-if="relatedArtworks.length > 0" class="related-artworks-section mt-5 pt-4">
                    <div class="d-flex justify-content-between align-items-center mb-4 section-header-box">
                        <h3 class="related-title mb-0">{{ $i18n.locale === 'en' ? 'View More Artworks' : 'ดูภาพเพิ่มเติม' }}</h3>
                        <span class="related-category-badge" v-if="artwork.category">
                            {{ getName($i18n.locale, artwork.category) }}
                        </span>
                    </div>
                    <ArtworkCard :artworks="relatedArtworks" :cols="4" />
                </div>
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
import ArtworkCard from '@/components/CardArtwork.vue';

export default {
    name: 'ArtworkDetail',
    components: {
        ArtworkCard
    },
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
        isExhibitionDetail() {
            if (!this.artwork || !this.artwork.status || !this.artwork.status.sale) return false;
            const statusEn = this.getName('en', this.artwork.status.sale).toLowerCase();
            const statusTh = this.getName('th', this.artwork.status.sale).toLowerCase();
            return statusEn.includes('exhibition') || 
                   statusTh.includes('โชว์ผลงาน') || 
                   statusTh.includes('ร่วมแสดงงาน') ||
                   statusEn.includes('show');
        },
        getButtonText() {
            if (this.isPreview) return this.$i18n.locale === 'en' ? 'Preview Mode' : 'โหมดดูตัวอย่าง';
            if (this.isSoldOut) return this.$i18n.locale === 'en' ? 'Already Sold Out' : 'ขายแล้ว';
            
            // If it's in SOMEONE ELSE'S cart (Reserved)
            if (this.isApprovalReserved && !this.isInCart) return this.$i18n.locale === 'en' ? 'Being Ordered' : 'จองแล้ว';

            if (!this.isPurchasable) return this.$i18n.locale === 'en' ? 'Not for Sale' : 'ไม่ได้มีไว้เพื่อขาย';
            if (this.isInCart) return this.$i18n.locale === 'en' ? 'In Collection (Remove?)' : 'อยู่ในตะกร้า (นำออก?)';
            return this.$i18n.locale === 'en' ? 'Add in cart' : 'หยิบใส่ตะกร้า';
        },
        allArtworks() {
            return this.$store.getters['artwork/artworks'] || [];
        },
        approvedArtworks() {
            return this.allArtworks.filter(art => {
                const status = this.getStatusLabel(art);
                return ['Approved', 'Success', 'Reserved'].includes(status);
            });
        },
        relatedArtworks() {
            if (!this.artwork || !this.artwork._id || !this.artwork.category) return [];
            const currentCategoryId = typeof this.artwork.category === 'object' 
                ? this.artwork.category._id 
                : this.artwork.category;
            const currentArtworkId = this.artwork._id;

            return this.approvedArtworks.filter(art => {
                if (art._id === currentArtworkId) return false;
                const artCategoryId = art.category 
                    ? (typeof art.category === 'object' ? art.category._id : art.category) 
                    : null;
                return artCategoryId === currentCategoryId;
            }).slice(0, 4);
        }
    },
    watch: {
        '$route.params.id': {
            handler() {
                this.fetchArtwork();
            }
        }
    },
    methods: {
        getStatusLabel(art) {
            if (!art || !art.status || !art.status.approval) return 'Pending';
            return this.getName('en', art.status.approval);
        },
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
                let resolvedId = id;
                const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
                
                if (!isObjectId) {
                    // Slug match: check loaded store list first
                    let list = this.allArtworks;
                    if (!list || list.length === 0) {
                        const response = await this.$store.dispatch('artwork/get');
                        list = response || [];
                    }
                    
                    const match = list.find(art => {
                        const titleEn = this.getName('en', art);
                        const titleTh = this.getName('th', art);
                        const slugEn = titleEn ? titleEn.replace(/\s+/g, '-').toLowerCase() : '';
                        const slugTh = titleTh ? titleTh.replace(/\s+/g, '-') : '';
                        return slugEn === id.toLowerCase() || slugTh === id;
                    });
                    
                    if (match) {
                        resolvedId = match._id;
                    }
                }

                const result = await this.$store.dispatch('artwork/explore', { _id: resolvedId });
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
            return moment(date).format('DD/MM/YYYY');
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
                }).catch(err => {
                    console.log('Share canceled or failed:', err);
                });
            } else {
                navigator.clipboard.writeText(window.location.href)
                    .then(() => {
                        this.$store.commit('dialog/showToast', {
                            title: this.$i18n.locale === 'en' ? 'Link Copied' : 'คัดลอกลิงก์แล้ว',
                            message: this.$i18n.locale === 'en' ? 'Artwork URL copied to clipboard.' : 'คัดลอกลิงก์ผลงานศิลปะไปยังคลิปบอร์ดแล้ว',
                            variant: 'success'
                        });
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                        alert(this.$i18n.locale === 'en' ? 'URL copied: ' + window.location.href : 'คัดลอกลิงก์แล้ว: ' + window.location.href);
                    });
            }
        },
        goToArtistProfile() {
            if (this.artwork && this.artwork.artist) {
                const artist = this.artwork.artist;
                const artistId = typeof artist === 'object' ? artist._id : artist;
                
                if (typeof artist === 'object') {
                    // Try to get English name for routing slug
                    const nameEn = this.getName('en', artist);
                    if (nameEn) {
                        const slug = nameEn.replace(/\s+/g, '-').toLowerCase();
                        this.$router.push({ name: 'ArtistPublicProfile', params: { id: slug } });
                        return;
                    }
                }
                
                if (artistId) {
                    this.$router.push({ name: 'ArtistPublicProfile', params: { id: artistId } });
                }
            }
        }
    },
    mounted() {
        this.fetchArtwork();
        this.$store.dispatch('artwork/get');
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
/* Premium Buddhist Art Detail Styles */

.artwork-detail-page {
    background-color: #FAF9F6; /* Classic warm gallery background */
    padding-top: 0 !important;
    margin-top: -2rem !important;
    font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, sans-serif;
}

.top-nav-accent {
    height: 5px;
    background: linear-gradient(90deg, #4a1d18, #8c3b32, #4a1d18);
    width: 100%;
}

/* Back navigation */
.back-link-premium {
    text-decoration: none !important;
    color: #57534e;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 6px 12px;
    border-radius: 50px;
    font-family: 'Sarabun', sans-serif;
}

.back-link-premium:hover {
    color: #4a1d18;
    background: rgba(74, 29, 24, 0.05);
}

.back-arrow-circle {
    width: 36px;
    height: 36px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
    transition: transform 0.3s ease;
}

.back-link-premium:hover .back-arrow-circle {
    transform: translateX(-4px);
    background: #4a1d18;
    color: white;
}

/* Spinner design */
.loading-state-premium {
    height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.premium-spinner-wrapper {
    position: relative;
    display: inline-block;
}

.spinner-shine {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 150%;
    height: 150%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(74, 29, 24, 0.1) 0%, rgba(255,255,255,0) 70%);
    pointer-events: none;
}

/* Visual Frame - Museum Matting & Framing */
.visual-column {
    display: flex;
    justify-content: center;
}

.gallery-frame-container {
    background: #ffffff;
    border-radius: 24px;
    padding: 24px;
    border: 1px solid rgba(74, 29, 24, 0.06);
    width: 100%;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.gallery-frame-container:hover {
    transform: translateY(-4px);
    box-shadow: 0 30px 60px rgba(74, 29, 24, 0.08);
}

.gallery-matting {
    border: 1px solid #eae6df;
    padding: 20px;
    background: #fbfbfa;
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: inset 0 0 30px rgba(74, 29, 24, 0.02);
}

.artwork-image-wrapper {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    border: 2px solid #eae6df; /* Mat board inner line */
    position: relative;
}

.artwork-image-wrapper::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border: 1px solid #C5A880; /* Elegant gold accent line */
    pointer-events: none;
    opacity: 0.8;
}

.main-artwork-img {
    width: 100%;
    height: auto;
    object-fit: contain;
    max-height: 70vh;
    display: block;
    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.gallery-frame-container:hover .main-artwork-img {
    transform: scale(1.02);
}

.btn-zoom-float {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a1d18;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 5;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.btn-zoom-float:hover {
    transform: scale(1.1);
    background: #4a1d18;
    color: white;
}

/* Info Column card */
.artwork-info-card {
    background: #ffffff;
    border-radius: 32px;
    border: 1px solid rgba(0, 0, 0, 0.03);
}

.shadow-premium {
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.03);
}

/* Category & Status Pills */
.info-pill {
    padding: 8px 18px;
    border-radius: 50px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
}

.category-pill {
    background: #FAF7F2;
    color: #4a1d18;
    border: 1px solid rgba(74, 29, 24, 0.1);
}

/* Title header */
.artwork-master-title {
    font-family: 'Cinzel', serif; /* MFU Brand Serif font */
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.25;
    color: #1c1917;
}

.title-divider {
    width: 60px;
    height: 3px;
    background: #4a1d18;
    margin-top: 12px;
    border-radius: 2px;
}

/* Artist Widget */
.artist-profile-widget {
    background: #FAF9F6;
    border-radius: 20px;
    border: 1px solid rgba(74, 29, 24, 0.04);
}

.artist-avatar-wrapper {
    flex-shrink: 0;
}

.artist-avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #4a1d18;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
    box-shadow: 0 4px 10px rgba(74, 29, 24, 0.2);
}

.artist-avatar-image {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 10px rgba(74, 29, 24, 0.2);
    border: 1.5px solid #C5A880;
}

.artist-info-meta .label {
    font-size: 0.65rem;
    font-weight: 800;
    color: #78716c;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    display: block;
    margin-bottom: 2px;
}

.artist-info-meta .artist-name {
    font-size: 1.15rem;
    font-weight: 700;
    color: #4a1d18;
    transition: all 0.2s ease;
}

.artist-info-meta .artist-name.clickable:hover {
    color: #8c3b32;
    text-decoration: none;
}

.btn-view-profile-premium {
    font-family: 'Sarabun', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    border-color: rgba(74, 29, 24, 0.2);
    color: #4a1d18;
    background: transparent;
    transition: all 0.3s ease;
    border-width: 1.5px;
}

.btn-view-profile-premium:hover {
    background: #4a1d18 !important;
    border-color: #4a1d18 !important;
    color: #ffffff !important;
    transform: translateY(-1px);
}

/* Exhibition/Display Only Block */
.exhibition-display-block {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    padding: 24px;
    border-radius: 24px;
}

.exhibition-display-block .label {
    font-size: 0.72rem;
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}

.exhibition-dot {
    width: 8px;
    height: 8px;
    background-color: #8c3b32;
    border-radius: 50%;
}

.exhibition-text {
    font-family: 'Cinzel', serif;
    font-size: 1.85rem;
    font-weight: 700;
    color: #4a1d18;
    line-height: 1.2;
    margin-top: 6px;
    margin-bottom: 6px;
}

.exhibition-desc {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
}

/* Valuation Block */
.valuation-block {
    background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 100%);
    border: 1px solid rgba(197, 168, 128, 0.25); /* Thin gold border */
    padding: 24px;
    border-radius: 24px;
}

.valuation-block .label {
    font-size: 0.72rem;
    font-weight: 800;
    color: #78716c;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}

.verified-label-badge {
    font-size: 0.68rem;
    font-weight: 700;
    color: #4a1d18;
    background: rgba(74, 29, 24, 0.06);
    padding: 4px 10px;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
}

.valuation-price {
    display: flex;
    align-items: baseline;
    color: #4a1d18;
    margin-top: 6px;
}

.valuation-price .currency {
    font-size: 1.4rem;
    font-weight: 400;
    margin-right: 6px;
}

.valuation-price .amount {
    font-family: 'Cinzel', serif; /* Gold serif amount */
    font-size: 2.6rem;
    font-weight: 700;
    line-height: 1;
}

.valuation-price .currency-code {
    font-size: 0.8rem;
    font-weight: 700;
    color: #78716c;
    margin-left: 8px;
    letter-spacing: 1px;
}

/* Specs Grid */
.specs-grid-premium {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.spec-card-full {
    grid-column: span 2;
}

.spec-card {
    background: #ffffff;
    border: 1px solid #f1f0ec;
    padding: 14px 12px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
}

.spec-card:hover {
    border-color: #C5A880; /* Gold highlight border */
    background: #fafaf9;
}

.spec-icon {
    width: 34px;
    height: 34px;
    background: #FAF7F2;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a1d18;
    margin-right: 10px;
    font-size: 0.85rem;
    flex-shrink: 0;
}

.spec-info {
    min-width: 0; /* Prevents text overflow */
}

.spec-info label {
    display: block;
    font-size: 0.6rem;
    font-weight: 800;
    color: #78716c;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2px;
}

.spec-info span {
    font-size: 0.8rem;
    font-weight: 700;
    color: #292524;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Concept Section */
.curator-description {
    background: #ffffff;
    border-radius: 20px;
}

.header-accent-mark {
    width: 6px;
    height: 18px;
    background: #4a1d18;
    border-radius: 3px;
    margin-right: 10px;
}

.curator-description h6 {
    font-family: 'Cinzel', serif; /* MFU Brand Serif font for headings */
    font-size: 0.88rem;
    color: #4a1d18;
    letter-spacing: 1px;
}

.description-body-container {
    background: #FAF9F6;
    padding: 20px;
    border-radius: 16px;
    border-left: 3px solid #4a1d18; /* MFU Crimson accent line */
}

.description-body {
    line-height: 1.8;
    color: #44403c;
    font-size: 0.95rem;
    margin-bottom: 0;
}

/* Buttons Stack */
.btn-purchase-premium {
    border: none;
    padding: 16px;
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: 0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.btn-purchase-premium:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(74, 29, 24, 0.2) !important;
}

.action-buttons-row {
    display: flex;
}

.btn-action-secondary {
    border-width: 1.5px;
    border-color: #d6d3d1;
    color: #44403c;
    padding: 11px 20px;
    font-weight: 600;
    font-size: 0.9rem;
    background: white;
    transition: all 0.3s ease;
}

.btn-action-secondary:hover {
    background: #FAF9F6;
    border-color: #4a1d18;
    color: #4a1d18;
}

.btn-action-icon {
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-width: 1.5px;
    border-color: #d6d3d1;
    color: #44403c;
    background: white;
    transition: all 0.3s ease;
}

.btn-action-icon:hover {
    background: #FAF9F6;
    border-color: #4a1d18;
    color: #4a1d18;
}

/* Lightbox styles */
.lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.97);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
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
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
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

/* Not Found styling */
.not-found-premium {
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 32px;
    border: 1px solid rgba(0, 0, 0, 0.03);
    padding: 40px !important;
}

.text-muted-soft {
    color: #d6d3d1;
}

/* Responsiveness */
@media (max-width: 991.98px) {
    .artwork-master-title {
        font-size: 2rem;
    }
    .specs-grid-premium {
        grid-template-columns: repeat(2, 1fr);
    }
    .valuation-price .amount {
        font-size: 2.2rem;
    }
}

@media (max-width: 575.98px) {
    .specs-grid-premium {
        grid-template-columns: 1fr;
    }
    .spec-card-full {
        grid-column: span 1;
    }
    .action-buttons-row {
        flex-direction: column;
        gap: 10px;
    }
    .btn-action-icon {
        width: 100%;
        border-radius: 50px;
    }
    .gallery-frame-container {
        padding: 12px;
    }
    .gallery-matting {
        padding: 8px;
    }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner-animation {
  animation: spin 1s linear infinite;
}

/* Related Artworks Section */
.related-artworks-section {
    border-top: 1px solid #f1f0ec !important;
}

.related-title {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    font-size: 1.6rem;
    color: #4a1d18;
}

.related-category-badge {
    font-family: 'Sarabun', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    color: #8c3b32;
    background: rgba(74, 29, 24, 0.05);
    padding: 6px 14px;
    border-radius: 50px;
    letter-spacing: 0.5px;
    border: 1px solid rgba(74, 29, 24, 0.1);
}
</style>
