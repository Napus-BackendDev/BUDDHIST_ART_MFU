<template>
    <div class="artwork-detail-page bg-premium-soft min-vh-100 pb-5">
        <!-- Minimal Top Nav / Back Button Accent -->
        <div class="top-nav-accent"></div>
        
        <CContainer class="pt-4 mt-2">
            <div v-if="loadError && !loading" ref="artworkLoadNotice" role="alert" tabindex="-1" class="alert alert-danger">
                <p>{{ $i18n.locale === 'en' ? 'Unable to load artwork information. Please try again.' : 'โหลดข้อมูลผลงานไม่สำเร็จ กรุณาลองใหม่' }}</p>
                <button type="button" class="btn btn-outline-danger" :disabled="fetchingId !== null" @click="fetchArtwork(false)">{{ $i18n.locale === 'en' ? 'Try again' : 'ลองใหม่' }}</button>
            </div>
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
                    <!-- Left Column: Premium Gallery Visual Frame & Specifications -->
                    <CCol lg="6" class="mb-4 mb-lg-0 visual-column">
                        <div class="gallery-frame-container shadow-premium position-relative mb-4">
                            <div class="artwork-canvas-stage position-relative">
                                <img :src="artworkImageUrl(artwork)" :alt="getName($i18n.locale, artwork)" class="main-artwork-img">
                                
                                <!-- Zoom Button with premium styling -->
                                <button v-if="!showZoomModal" ref="zoomTrigger" class="btn-zoom-float shadow-lg" @click="zoomImg" :title="$i18n.locale === 'en' ? 'Zoom image' : 'ขยายภาพ'" :aria-label="$i18n.locale === 'en' ? 'Zoom image' : 'ขยายภาพ'">
                                    <CIcon name="cilMagnifyingGlass" />
                                </button>
                            </div>
                        </div>

                        <!-- Artist Profile Widget (Desktop Only: under Image) -->
                        <div class="d-none d-lg-block">
                            <div class="artist-profile-widget p-4 w-100 shadow-sm"
                                 :class="{ 'clickable-profile': artwork.artist }"
                                 @click="artwork.artist ? goToArtistProfile() : null">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="artist-avatar-wrapper mr-3">
                                        <img v-if="artwork.artist && artwork.artist.image" 
                                             :src="artwork.artist.image" 
                                             class="artist-avatar-image" 
                                             :alt="artwork.artist ? getName($i18n.locale, artwork.artist) : ''" />
                                        <div v-else class="artist-avatar-placeholder">
                                            <CIcon name="cil-user" />
                                        </div>
                                    </div>
                                    <div class="artist-info-meta">
                                        <span class="label">{{ $i18n.locale === 'en' ? 'Master Creator' : 'ศิลปินผู้สร้างสรรค์' }}</span>
                                        <h4 class="artist-name mb-0">
                                            <router-link v-if="artistProfileRoute" :to="artistProfileRoute" @click.native.stop>{{ getName($i18n.locale, artwork.artist) }}</router-link>
                                            <span v-else>{{ $i18n.locale === 'en' ? 'Unknown Artist' : 'ศิลปินนิรนาม' }}</span>
                                        </h4>
                                    </div>
                                </div>

                                <!-- Artist Bio Description -->
                                <div v-if="artistBio" class="artist-bio-wrapper pt-3">
                                    <p class="artist-bio-text mb-0">
                                        {{ artistBio }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CCol>

                    <!-- Right Column: Curated Info & Collector Card -->
                    <CCol lg="6" class="info-column">
                        <div class="artwork-info-card shadow-premium">
                            <div class="artwork-info-content p-4 p-md-5">
                                <!-- Title & Fine Art Label -->
                                <div class="title-header-block mb-3">
                                    <h1 class="artwork-master-title mb-2 text-dark">{{ getName($i18n.locale, artwork) }}</h1>
                                    <div class="title-divider"></div>
                                </div>

                                <!-- Curated Concept & Narrative Section -->
                                <div class="curator-description mb-4">
                                    <div class="description-header d-flex align-items-center mb-2">
                                        <div class="header-accent-mark"></div>
                                        <h6 class="mb-0 text-uppercase font-weight-bold tracking-wider">{{ $i18n.locale === 'en' ? 'Concept & Narrative' : 'แนวคิดและแรงบันดาลใจในการสร้างสรรค์' }}</h6>
                                    </div>
                                    <p class="description-body">
                                        {{ getName($i18n.locale, artwork, 'description') || ($i18n.locale === 'en' ? 'No description provided for this artwork.' : 'ไม่มีรายละเอียดสำหรับผลงานชิ้นนี้') }}
                                    </p>
                                </div>

                                <!-- Status Tag if not approved -->
                                <div v-if="artwork.status && artwork.status.approval && getName('en', artwork.status.approval) !== 'Approved'" class="d-flex align-items-center mb-3">
                                    <span class="info-pill status-pill" :style="getStatusBadgeStyle()">
                                        <CIcon name="cil-info" class="mr-1" size="sm" />
                                        {{ getName($i18n.locale, artwork.status.approval) }}
                                    </span>
                                </div>

                                <!-- Specs Grid (Category, Views, Technique, Dimension) -->
                                <div class="artwork-specs-wrapper w-100 mb-4">
                                    <div class="specs-grid-premium">
                                        <!-- Row 1: Category & Views -->
                                        <div class="spec-card">
                                            <div class="spec-icon"><CIcon name="cil-tag" /></div>
                                            <div class="spec-info">
                                                <label>{{ $i18n.locale === 'en' ? 'Category' : 'หมวดหมู่' }}</label>
                                                <span :title="artwork.category ? getName($i18n.locale, artwork.category) : ''">
                                                    {{ artwork.category ? getName($i18n.locale, artwork.category) : ($i18n.locale === 'en' ? 'Artwork' : 'ผลงานศิลปะ') }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="spec-card">
                                            <div class="spec-icon"><CIcon name="cil-chart-line" /></div>
                                            <div class="spec-info">
                                                <label>{{ $i18n.locale === 'en' ? 'Views' : 'ยอดเข้าชม' }}</label>
                                                <span>{{ artwork.views || 0 }} {{ $i18n.locale === 'en' ? 'views' : 'ครั้ง' }}</span>
                                            </div>
                                        </div>

                                        <!-- Row 2: Technique & Dimension -->
                                        <div class="spec-card">
                                            <div class="spec-icon"><CIcon name="cil-brush" /></div>
                                            <div class="spec-info">
                                                <label>{{ $i18n.locale === 'en' ? 'Technique' : 'เทคนิค' }}</label>
                                                <span :title="getName($i18n.locale, artwork, 'technique')">
                                                    {{ getName($i18n.locale, artwork, 'technique') || ($i18n.locale === 'en' ? 'Mixed Media' : 'สื่อผสม') }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="spec-card">
                                            <div class="spec-icon"><CIcon name="cil-resize-both" /></div>
                                            <div class="spec-info">
                                                <label>{{ $i18n.locale === 'en' ? 'Dimension' : 'ขนาดผลงาน' }}</label>
                                                <span :title="getName($i18n.locale, artwork, 'size')">
                                                    {{ getName($i18n.locale, artwork, 'size') || 'N/A' }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Exhibition Only / Display Only Block -->
                                <div v-if="!isPurchasable" class="exhibition-display-block mb-4">
                                    <div class="d-flex align-items-center mb-2">
                                        <div class="exhibition-dot mr-2" :style="{ backgroundColor: isSoldOut ? '#ef4444' : '#8c3b32' }"></div>
                                        <span class="label">
                                            <span v-if="isSoldOut">{{ $i18n.locale === 'en' ? "Artwork Status" : 'สถานะผลงาน' }}</span>
                                            <span v-else-if="isPostTermDisplayOnly">{{ $i18n.locale === 'en' ? "Display only" : 'แสดงเฉย ๆ' }}</span>
                                            <span v-else-if="isExhibitionDetail">{{ $i18n.locale === 'en' ? "Gallery Exhibition" : 'ผลงานเพื่อการจัดแสดง' }}</span>
                                            <span v-else>{{ $i18n.locale === 'en' ? "Artwork Status" : 'สถานะผลงาน' }}</span>
                                        </span>
                                    </div>
                                    <div class="exhibition-text">
                                        <span v-if="isSoldOut">{{ $i18n.locale === 'en' ? 'Sold Out' : 'จำหน่ายแล้ว' }}</span>
                                        <span v-else-if="isPostTermDisplayOnly">{{ $i18n.locale === 'en' ? 'Display only' : 'แสดงเฉย ๆ' }}</span>
                                        <span v-else-if="isExhibitionDetail">{{ $i18n.locale === 'en' ? 'Exhibition Only' : 'โชว์เท่านั้น' }}</span>
                                        <span v-else>{{ $i18n.locale === 'en' ? 'Not for Sale' : 'ไม่ขาย' }}</span>
                                    </div>
                                    <p class="exhibition-desc mb-0">
                                        <span v-if="isSoldOut">{{ $i18n.locale === 'en' ? 'This artwork has been sold and is no longer available.' : 'ผลงานชิ้นนี้ขายไปแล้วและไม่มีจำหน่ายในขณะนี้' }}</span>
                                        <span v-else-if="isPostTermDisplayOnly">{{ $i18n.locale === 'en' ? 'This artwork remains in the public portfolio but is not available for purchase.' : 'ผลงานชิ้นนี้ยังแสดงในพอร์ต แต่ไม่เปิดให้ซื้อ' }}</span>
                                        <span v-else-if="isExhibitionDetail">{{ $i18n.locale === 'en' ? 'This artwork is curated for exhibition and is currently not available for purchase.' : 'ผลงานศิลปะชิ้นนี้ได้รับการจัดสรรเพื่อร่วมแสดงนิทรรศการและไม่ได้เปิดให้สั่งซื้อในขณะนี้' }}</span>
                                        <span v-else>{{ $i18n.locale === 'en' ? 'This artwork is currently not available for purchase.' : 'ผลงานชิ้นนี้ไม่มีจำหน่ายหรือเพื่อการสะสมในขณะนี้' }}</span>
                                    </p>
                                </div>
                                <div v-else class="valuation-block mb-4">
                                    <div class="valuation-label-row d-flex justify-content-between align-items-center mb-2">
                                        <span class="label">{{ $i18n.locale === 'en' ? "Collector's Value" : 'มูลค่าการสะสมผลงาน' }}</span>
                                    </div>
                                    <div class="valuation-price">
                                        <span class="currency">฿</span>
                                        <span class="amount">{{ formatPrice(artwork.price) }}</span>
                                        <span class="currency-code">THB</span>
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
                                    <div v-if="shareUrl" class="artwork-share-panel mt-3">
                                        <label for="artwork-share-url">{{ $i18n.locale === 'en' ? 'Artwork link' : 'ลิงก์ผลงาน' }}</label>
                                        <input id="artwork-share-url" class="form-control" type="url" :value="shareUrl" readonly>
                                        <button type="button" class="btn btn-outline-dark mt-2" :disabled="isCopying" @click="copyArtworkLink">
                                            {{ $i18n.locale === 'en' ? 'Copy link' : 'คัดลอกลิงก์' }}
                                        </button>
                                        <p class="small mt-2 mb-0" role="status" aria-live="polite">
                                            <template v-if="shareStatus === 'copied'">{{ $i18n.locale === 'en' ? 'Link copied.' : 'คัดลอกลิงก์แล้ว' }}</template>
                                            <template v-else-if="shareStatus === 'shared'">{{ $i18n.locale === 'en' ? 'Sharing completed.' : 'แชร์เรียบร้อยแล้ว' }}</template>
                                            <template v-else-if="shareStatus === 'manual'">{{ $i18n.locale === 'en' ? 'Automatic copying is unavailable. Select and copy the link above.' : 'คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกและคัดลอกลิงก์ด้านบน' }}</template>
                                            <template v-else>{{ $i18n.locale === 'en' ? 'You can also copy this link to share.' : 'สามารถคัดลอกลิงก์นี้เพื่อนำไปแชร์ได้' }}</template>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Artist Profile Widget (Mobile Only: under Info Card) -->
                        <div class="d-block d-lg-none mt-4">
                            <div class="artist-profile-widget p-4 w-100 shadow-sm"
                                 :class="{ 'clickable-profile': artwork.artist }"
                                 @click="artwork.artist ? goToArtistProfile() : null">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="artist-avatar-wrapper mr-3">
                                        <img v-if="artwork.artist && artwork.artist.image" 
                                             :src="artwork.artist.image" 
                                             class="artist-avatar-image" 
                                             :alt="artwork.artist ? getName($i18n.locale, artwork.artist) : ''" />
                                        <div v-else class="artist-avatar-placeholder">
                                            <CIcon name="cil-user" />
                                        </div>
                                    </div>
                                    <div class="artist-info-meta">
                                        <span class="label">{{ $i18n.locale === 'en' ? 'Master Creator' : 'ศิลปินผู้สร้างสรรค์' }}</span>
                                        <h4 class="artist-name mb-0">
                                            <router-link v-if="artistProfileRoute" :to="artistProfileRoute" @click.native.stop>{{ getName($i18n.locale, artwork.artist) }}</router-link>
                                            <span v-else>{{ $i18n.locale === 'en' ? 'Unknown Artist' : 'ศิลปินนิรนาม' }}</span>
                                        </h4>
                                    </div>
                                </div>

                                <!-- Artist Bio Description -->
                                <div class="artist-bio-wrapper pt-3">
                                    <p class="artist-bio-text mb-0">
                                        {{ artistBio }}
                                    </p>
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
            <div v-else-if="!loadError" class="not-found-premium text-center py-5">
                <CIcon name="cil-mood-bad" size="4xl" class="text-muted mb-4" />
                <h2>{{ $i18n.locale === 'en' ? 'Artwork Missing' : 'ไม่พบผลงานศิลปะ' }}</h2>
                <p class="text-muted">{{ $i18n.locale === 'en' ? "The piece you're seeking is currently not in our catalog." : 'ไม่พบผลงานศิลปะที่คุณกำลังค้นหาในขณะนี้' }}</p>
                <CButton color="danger" variant="outline" shape="pill" class="mt-4 px-5 py-2" @click="$router.push({ name: 'Artworks' })">
                    {{ $i18n.locale === 'en' ? 'Discover More Artworks' : 'ค้นหาผลงานศิลปะอื่นๆ' }}
                </CButton>
            </div>

            <!-- Image Zoom Lightbox (Same style as NewsDetail.vue) -->
            <div v-if="showZoomModal" class="lightbox-overlay" role="dialog" aria-modal="true" :aria-label="$i18n.locale === 'en' ? 'Artwork image' : 'ภาพขยายผลงาน'" @click.self="closeZoom" @keydown.esc.stop.prevent="closeZoom" @keydown.tab.prevent="$refs.zoomClose.focus()">
                <div class="lightbox-content" @click.stop>
                    <img :src="artworkImageUrl(artwork)" :alt="getName($i18n.locale, artwork)" class="img-fluid zoom-img-main shadow-lg">
                    <div class="lightbox-caption text-center py-3">
                        <h4 class="mb-1 text-white font-weight-bold">{{ getName($i18n.locale, artwork) }}</h4>
                        <p class="text-white-50 mb-0">{{ artwork.artist ? getName($i18n.locale, artwork.artist) : ($i18n.locale === 'en' ? 'Artist' : 'ศิลปิน') }}</p>
                    </div>
                    <button ref="zoomClose" class="lightbox-close-btn" :aria-label="$i18n.locale === 'en' ? 'Close image' : 'ปิดภาพขยาย'" @click="closeZoom">
                        <CIcon name="cilX" size="xl" />
                    </button>
                </div>
            </div>

            <!-- Clean & Prominent Added to Cart Success Modal -->
            <CModal
                :show.sync="showAddedModal"
                centered
                class="cart-alert-modal"
                :closeOnBackdrop="true"
            >
                <div class="cart-alert-card p-4 p-md-5 text-center position-relative">
                    <!-- Top Right Close Button -->
                    <button type="button" class="alert-close-btn position-absolute" @click="showAddedModal = false" title="ปิด">
                        <CIcon name="cil-x" size="lg" />
                    </button>

                    <!-- Big Success Icon -->
                    <div class="alert-icon-wrapper mx-auto mb-4">
                        <div class="alert-icon-pulse"></div>
                        <div class="alert-icon-circle">
                            <CIcon name="cil-check" size="2xl" class="text-white" />
                        </div>
                    </div>

                    <!-- Title & Message -->
                    <h3 class="alert-modal-title font-weight-bold mb-2">
                        {{ $i18n.locale === 'en' ? 'Added to Cart Successfully!' : 'เพิ่มลงในตะกร้าเรียบร้อยแล้ว' }}
                    </h3>
                    <p class="alert-modal-subtitle text-muted mb-4">
                        {{ $i18n.locale === 'en' ? 'Artwork has been added to your shopping cart.' : 'ผลงานศิลปะชิ้นนี้ได้ถูกเพิ่มลงในตะกร้าของคุณเรียบร้อยแล้ว' }}
                    </p>

                    <!-- Bottom Dismiss Button -->
                    <button type="button" class="btn-alert-dismiss px-5 py-2" @click="showAddedModal = false">
                        {{ $i18n.locale === 'en' ? 'Close' : 'ตกลง' }}
                    </button>
                </div>
            </CModal>
        </CContainer>
    </div>
</template>

<script>
import moment from 'moment';
import { isArtworkPurchasable } from '@/utils/artworkPurchase';
import { artworkImageUrl } from '@/utils/submissionArtworkImport';
import ArtworkCard from '@/components/CardArtwork.vue';

export default {
    name: 'ArtworkDetail',
    components: {
        ArtworkCard
    },
    data() {
        return {
            loading: true,
            loadError: false,
            catalogueLoadError: false,
            fetchSequence: 0,
            fetchingId: null,
            isPreview: false,
            showZoomModal: false,
            showAddedModal: false,
            shareUrl: '',
            shareStatus: '',
            isCopying: false,
            artwork: {},
            polling: null,
            isAddingToCart: false
        }
    },
    computed: {
        artistProfileRoute() {
            const artist = this.artwork && this.artwork.artist;
            if (!artist) return null;
            const name = typeof artist === 'object' ? this.getName('en', artist) : '';
            const id = name ? name.replace(/\s+/g, '-').toLowerCase() : (typeof artist === 'object' ? artist._id : artist);
            return id ? { name: 'ArtistPublicProfile', params: { id } } : null;
        },
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
            return isArtworkPurchasable(this.artwork, this.getName);
        },
        isPostTermDisplayOnly() {
            const lifecycle = this.artwork && this.artwork.postTermSale;
            if (!lifecycle || !lifecycle.applicable) return false;
            if (lifecycle.needsReview || !lifecycle.initialSaleEndsAt) return true;
            if (lifecycle.mode === 'standard_sale') return false;
            return new Date(lifecycle.initialSaleEndsAt).getTime() <= Date.now();
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
            if (this.isSoldOut) return this.$i18n.locale === 'en' ? 'Already Sold Out' : 'จำหน่ายแล้ว';
            
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
            if (!this.artwork || !this.artwork._id || !this.artwork.artist) return [];
            const currentArtistId = typeof this.artwork.artist === 'object'
                ? this.artwork.artist._id
                : this.artwork.artist;
            const currentArtworkId = this.artwork._id;

            return this.approvedArtworks.filter(art => {
                if (String(art._id) === String(currentArtworkId) || !art.artist) return false;
                const artistId = typeof art.artist === 'object' ? art.artist._id : art.artist;
                return String(artistId) === String(currentArtistId);
            }).slice(0, 4);
        },
        artistBio() {
            if (this.artwork && this.artwork.artist) {
                const artist = this.artwork.artist;
                if (typeof artist === 'object') {
                    if (artist.bio && this.getName(this.$i18n.locale, artist, 'bio')) {
                        return this.getName(this.$i18n.locale, artist, 'bio');
                    }
                    if (artist.about && this.getName(this.$i18n.locale, artist, 'about')) {
                        return this.getName(this.$i18n.locale, artist, 'about');
                    }
                }
            }
            return '';
        }
    },
    watch: {
        '$route.params.id': {
            handler() {
                this.shareUrl = '';
                this.shareStatus = '';
                this.fetchArtwork();
            }
        }
    },
    methods: {
        artworkImageUrl,
        getStatusLabel(art) {
            if (!art || !art.status || !art.status.approval) return 'Pending';
            return this.getName('en', art.status.approval);
        },
        async fetchArtwork(silent = false) {
            const id = this.$route.params.id;
            if (this.fetchingId === id) return;
            const sequence = this.fetchSequence = (this.fetchSequence || 0) + 1;
            this.fetchingId = id;
            this.isPreview = id === 'preview';
            if (!silent) this.loading = true;
            if (!silent) {
                this.loadError = false;
                this.catalogueLoadError = false;
                this.showZoomModal = false;
                this.artwork = null;
            }
            let readingDetail = false;
            let readingCatalogue = false;
            try {
                if (this.isPreview) {
                    const previewData = sessionStorage.getItem('artwork_preview');
                    const preview = previewData ? JSON.parse(previewData) : null;
                    this.artwork = preview && preview._id ? preview : null;
                    return;
                }
                let catalogueLoaded = false;
                let resolvedId = id;
                const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
                
                if (!isObjectId) {
                    let list = this.allArtworks;
                    if (!list || list.length === 0) {
                        readingCatalogue = true;
                        const response = await this.$store.dispatch('artwork/get');
                        if (sequence !== this.fetchSequence) return;
                        readingCatalogue = false;
                        this.catalogueLoadError = false;
                        catalogueLoaded = true;
                        list = response || [];
                    }
                    
                    const matches = list.filter(art => {
                        const titleEn = this.getName('en', art);
                        const titleTh = this.getName('th', art);
                        const slugEn = titleEn ? titleEn.replace(/\s+/g, '-').toLowerCase() : '';
                        const slugTh = titleTh ? titleTh.replace(/\s+/g, '-') : '';
                        return slugEn === id.toLowerCase() || slugTh === id;
                    });
                    
                    // Legacy title URLs are safe only when they identify one artwork.
                    if (matches.length !== 1) {
                        this.artwork = null;
                        return;
                    }
                    resolvedId = matches[0]._id;
                }

                if (!silent) {
                    try {
                        await this.$store.dispatch('artwork/updateView', resolvedId);
                    } catch (viewError) {
                        console.error('Error updating artwork view:', viewError);
                    }
                    if (sequence !== this.fetchSequence) return;
                }

                readingDetail = true;
                const result = await this.$store.dispatch('artwork/explore', { _id: resolvedId });
                if (sequence !== this.fetchSequence) return;
                readingDetail = false;
                this.artwork = result && result._id ? result : null;
                this.loadError = !!this.catalogueLoadError;
                if (!silent && !catalogueLoaded && this.artwork) {
                    readingCatalogue = true;
                    await this.$store.dispatch('artwork/get');
                    if (sequence !== this.fetchSequence) return;
                    this.catalogueLoadError = false;
                    this.loadError = false;
                }
            } catch (error) {
                if (sequence !== this.fetchSequence) return;
                if (readingDetail && error.response && error.response.status === 404) {
                    this.artwork = null;
                    this.showZoomModal = false;
                    this.loadError = false;
                } else {
                    if (readingCatalogue) this.catalogueLoadError = true;
                    this.loadError = true;
                }
            } finally {
                if (sequence === this.fetchSequence) {
                    this.fetchingId = null;
                    if (!silent) this.loading = false;
                    if (!silent && this.loadError) this.$nextTick(() => {
                        if (sequence === this.fetchSequence && this.$refs.artworkLoadNotice) this.$refs.artworkLoadNotice.focus();
                    });
                }
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
                this.$nextTick(() => this.$refs.zoomClose?.focus());
            }
        },
        closeZoom() {
            this.showZoomModal = false;
            this.$nextTick(() => this.$refs.zoomTrigger?.focus());
        },
        async addToCart() {
            if (this.isPreview || this.isSoldOut || !this.isPurchasable || (this.isApprovalReserved && !this.isInCart) || this.isAddingToCart) return;
            
            try {
                this.isAddingToCart = true;
                
                if (!this.isInCart) {
                    const result = await this.$store.dispatch('artwork/explore', { _id: this.artwork._id });
                    if (!isArtworkPurchasable(result, this.getName)) {
                        if (result) this.artwork = result;
                        return;
                    }
                    this.$store.dispatch('cart/addToCart', result);
                    this.showAddedModal = true;
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
        async shareArtwork() {
            this.shareUrl = window.location.href;
            this.shareStatus = '';
            if (typeof navigator.share === 'function') {
                try {
                    await navigator.share({ title: this.getName(this.$i18n.locale, this.artwork), url: this.shareUrl });
                    this.shareStatus = 'shared';
                } catch (err) {
                    if (err.name !== 'AbortError') await this.copyArtworkLink();
                }
            } else {
                await this.copyArtworkLink();
            }
        },
        async copyArtworkLink() {
            if (this.isCopying) return;
            this.isCopying = true;
            try {
                await navigator.clipboard.writeText(this.shareUrl);
                this.shareStatus = 'copied';
            } catch (_) {
                this.shareStatus = 'manual';
            } finally {
                this.isCopying = false;
            }
        },
        goToArtistProfile() {
            if (this.artistProfileRoute) this.$router.push(this.artistProfileRoute);
        },
        getName(lang, obj, key) {
            if (!obj) return '';
            if (key) {
                if (Array.isArray(obj[key])) {
                    const found = obj[key].find(item => item.key === lang);
                    return found ? found.value : (obj[key][0] ? obj[key][0].value : '');
                }
                return obj[key] || '';
            }
            if (Array.isArray(obj.title)) {
                const found = obj.title.find(item => item.key === lang);
                return found ? found.value : (obj.title[0] ? obj.title[0].value : '');
            }
            if (Array.isArray(obj.name)) {
                const found = obj.name.find(item => item.key === lang);
                return found ? found.value : (obj.name[0] ? obj.name[0].value : '');
            }
            return obj.title || obj.name || '';
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
        this.fetchSequence++;
        if (this.polling) {
            clearInterval(this.polling);
        }
    }
}
</script>

<style scoped>
/* Premium Buddhist Art Detail Styles */

.artwork-detail-page {
    background-color: #FAF9F6;
    padding-top: 0 !important;
    margin-top: -2rem !important;
    font-family: var(--app-font-family);
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
    font-family: var(--app-font-family);
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

/* Visual Frame - Clean Showcase Canvas */
.visual-column {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.gallery-frame-container {
    background: #ffffff;
    border-radius: 24px;
    padding: 16px;
    border: 1px solid rgba(74, 29, 24, 0.08);
    width: 100%;
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
}

.gallery-frame-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(74, 29, 24, 0.07);
}

.artwork-canvas-stage {
    width: 100%;
    height: 540px;
    background: #faf8f5;
    border-radius: 16px;
    border: 1px solid #eae6df;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;
    padding: 16px;
}

@media (max-width: 992px) {
    .artwork-canvas-stage {
        height: 440px;
    }
}

@media (max-width: 576px) {
    .artwork-canvas-stage {
        height: 340px;
        padding: 10px;
    }
}

.main-artwork-img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    display: block;
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
    border-radius: 24px;
    border: 1px solid rgba(74, 29, 24, 0.08);
    overflow: hidden;
}

.artwork-info-content {
    border-radius: 24px;
}

.shadow-premium {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
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
    font-family: var(--app-font-family);
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
.artist-name a { color: inherit; text-decoration: none; }
.artist-name a:focus-visible { outline: 2px solid #8b633b; outline-offset: 4px; border-radius: 2px; }
.artist-profile-widget {
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #f1f0ec;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.artist-profile-widget.clickable-profile {
    cursor: pointer;
}

.artist-profile-widget.clickable-profile:hover {
    border-color: #C5A880;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08) !important;
}

.artist-avatar-wrapper {
    flex-shrink: 0;
}

.artist-avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #FAF7F2;
    color: #4a1d18;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    box-shadow: 0 4px 10px rgba(74, 29, 24, 0.08);
    border: 1.5px solid #C5A880;
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
    font-family: var(--app-font-family);
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

.artist-bio-wrapper {
    border-top: 1px solid rgba(74, 29, 24, 0.08) !important;
}

.artist-bio-text {
    font-size: 0.88rem;
    line-height: 1.7;
    color: #57534e;
    font-weight: 400;
    word-break: keep-all;
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
    font-family: var(--app-font-family);
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
    border: 1px solid rgba(197, 168, 128, 0.25);
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
    font-family: var(--app-font-family);
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
    border-color: #C5A880;
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
    min-width: 0;
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
    background: transparent;
}

.header-accent-mark {
    width: 4px;
    height: 18px;
    background: #4a1d18;
    border-radius: 2px;
    margin-right: 10px;
}

.curator-description h6 {
    font-family: var(--app-font-family);
    font-size: 0.88rem;
    color: #4a1d18;
    letter-spacing: 1px;
}

.description-body {
    line-height: 1.8;
    color: #44403c;
    font-size: 0.95rem;
    margin-bottom: 0;
    padding-left: 14px;
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
    opacity: 0.8;
}

.lightbox-close-btn:hover {
    opacity: 1;
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

/* Clean & Prominent Cart Alert Modal */
.cart-alert-modal ::v-deep .modal-dialog {
    max-width: 460px;
    margin: 1.75rem auto;
}

.cart-alert-modal ::v-deep .modal-content {
    border-radius: 28px;
    border: none;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
    background: #ffffff;
    overflow: hidden;
}

.cart-alert-modal ::v-deep .modal-header,
.cart-alert-modal ::v-deep .modal-footer {
    display: none !important;
}

.cart-alert-card {
    background: #ffffff;
}

.alert-close-btn {
    top: 18px;
    right: 18px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f1f5f9;
    border: none;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
}

.alert-close-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
    transform: scale(1.05);
}

.alert-icon-wrapper {
    position: relative;
    width: 84px;
    height: 84px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.alert-icon-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 24px rgba(16, 185, 129, 0.35);
    z-index: 2;
    animation: alertPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.alert-icon-pulse {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.2);
    animation: alertPulse 1.8s infinite;
    z-index: 1;
}

@keyframes alertPop {
    0% { transform: scale(0.3); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes alertPulse {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.2); opacity: 0; }
    100% { transform: scale(0.95); opacity: 0; }
}

.alert-modal-title {
    font-size: 1.45rem;
    color: #1e293b;
    line-height: 1.3;
}

.alert-modal-subtitle {
    font-size: 0.95rem;
    color: #64748b;
    line-height: 1.5;
}

.btn-alert-dismiss {
    background: linear-gradient(135deg, #4a1d18, #612721);
    color: #ffffff;
    border: none;
    border-radius: 30px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(74, 29, 24, 0.25);
    transition: all 0.2s ease;
    min-width: 130px;
}

.btn-alert-dismiss:hover {
    background: linear-gradient(135deg, #612721, #7a312a);
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(74, 29, 24, 0.35);
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
    font-family: var(--app-font-family);
    font-weight: 700;
    font-size: 1.6rem;
    color: #4a1d18;
}

.related-category-badge {
    font-family: var(--app-font-family);
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
