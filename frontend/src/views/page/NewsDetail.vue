<template>
    <div class="news-detail-wrapper bg-white min-vh-100">
        <div v-if="currentNews" class="news-detail-page">
            <CContainer class="pt-4 pt-md-5 pb-5">
                <CRow>
                    <CCol lg="10" class="mx-auto">
                        <!-- Header -->
                        <div class="news-header-simple mb-4">
                            <h1 class="font-weight-bold mb-3">{{ getName($i18n.locale, currentNews.title) }}</h1>
                            <hr class="my-3">
                        </div>

                        <!-- Content -->
                        <div class="article-content mb-5" v-html="safeDescription">
                        </div>

                        <!-- Gallery (All images moved here) -->
                        <div v-if="currentNews.images && currentNews.images.length > 0" class="mt-4 mb-5">
                            <CRow>
                                <CCol md="4" sm="6" v-for="(img, index) in currentNews.images" :key="index" class="mb-4 px-2">
                                    <button type="button" class="gallery-open gallery-item shadow-sm rounded overflow-hidden h-100 bg-light p-0 border-0 w-100" :aria-label="`${$i18n.locale === 'en' ? 'View image' : 'ดูภาพที่'} ${index + 1}: ${getName($i18n.locale, currentNews.title)}`" @click="zoomImage(index, $event)">
                                        <img :src="img" :alt="`${getName($i18n.locale, currentNews.title)} ${index + 1}`" class="img-fluid cursor-pointer transition-all w-100" style="height: 250px; object-fit: cover;">
                                    </button>
                                </CCol>
                            </CRow>
                        </div>

                        <!-- Date Info (Moved to bottom) with Facebook Share -->
                        <div class="text-muted small border-top pt-3 d-flex justify-content-between align-items-center flex-wrap">
                            <div class="mb-2">
                                <span class="mr-3"><CIcon name="cil-calendar" /> {{ $i18n.locale === 'en' ? 'Published:' : 'เผยแพร่เมื่อ:' }} {{ formatDate(currentNews.create ? currentNews.create.datetime : null) }}</span>
                                <span class="mr-3"><CIcon name="cil-eye" /> {{ currentNews.views || 0 }} {{ $i18n.locale === 'en' ? 'Views' : 'เข้าชม' }}</span>
                            </div>
                            <div class="mb-2">
                                <span class="mr-2">{{ $i18n.locale === 'en' ? 'Follow for more news:' : 'ติดตามข่าวสารเพิ่มเติม:' }}</span>
                                <CButton color="link" class="p-0" @click="goToFacebook" :aria-label="$i18n.locale === 'en' ? 'Follow Buddhist Art MFU on Facebook' : 'ติดตามพุทธศิลป์ มฟล. บน Facebook'">
                                    <CIcon name="cib-facebook" size="xl" style="color: #1877F2;" />
                                </CButton>
                            </div>
                        </div>

                        <div class="text-center mt-3 pt-5 border-top">
                            <CButton color="outline-dark" shape="pill" class="px-5" @click="$router.push('/news')">
                                {{ $i18n.locale === 'en' ? 'Back to News' : 'กลับหน้าหลักข่าวสาร' }}
                            </CButton>
                        </div>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
        
        <div v-else-if="loading" class="text-center py-5">
            <CSpinner color="danger" />
        </div>
        <div v-else-if="loadError" class="container text-center py-5" role="alert">
            <h1>{{ $i18n.locale === 'en' ? 'Unable to load news' : 'โหลดข่าวสารไม่สำเร็จ' }}</h1>
            <p>{{ $i18n.locale === 'en' ? 'Please try again.' : 'กรุณาลองใหม่อีกครั้ง' }}</p>
            <CButton color="outline-dark" shape="pill" @click="fetchNewsDetail">{{ $i18n.locale === 'en' ? 'Retry' : 'ลองใหม่' }}</CButton>
        </div>
        <div v-else class="container text-center py-5">
            <h1>{{ $i18n.locale === 'en' ? 'News not found' : 'ไม่พบข่าวสาร' }}</h1>
            <p>{{ $i18n.locale === 'en' ? 'This article may have been removed.' : 'ข่าวสารนี้อาจถูกลบแล้ว' }}</p>
            <CButton color="outline-dark" shape="pill" @click="$router.push('/news')">{{ $i18n.locale === 'en' ? 'Back to News' : 'กลับหน้าหลักข่าวสาร' }}</CButton>
        </div>

        <!-- Lightbox -->
        <div
            v-if="showZoom"
            ref="lightbox"
            class="lightbox-overlay"
            role="dialog"
            aria-modal="true"
            :aria-label="$i18n.locale === 'en' ? 'News image gallery' : 'แกลเลอรีภาพข่าว'"
            @click.self="closeZoom"
            @touchstart.passive="onTouchStart"
            @touchend.passive="onTouchEnd"
        >
            <button ref="lightboxClose" type="button" class="lightbox-close" :aria-label="$i18n.locale === 'en' ? 'Close' : 'ปิด'" @click="closeZoom">&times;</button>
            <button v-if="galleryImages.length > 1" type="button" class="lightbox-nav lightbox-prev" :aria-label="$i18n.locale === 'en' ? 'Previous image' : 'ภาพก่อนหน้า'" @click.stop="previousImage">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <div class="lightbox-stage" @click.stop>
                <transition name="lightbox-fade" mode="out-in">
                    <img :key="selectedImg" :src="selectedImg" class="lightbox-image" :alt="`${getName($i18n.locale, currentNews.title)} ${selectedIndex + 1}`">
                </transition>
                <div class="lightbox-counter">{{ selectedIndex + 1 }} / {{ galleryImages.length }}</div>
            </div>
            <button v-if="galleryImages.length > 1" type="button" class="lightbox-nav lightbox-next" :aria-label="$i18n.locale === 'en' ? 'Next image' : 'ภาพถัดไป'" @click.stop="nextImage">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    </div>
</template>

<script>
import DOMPurify from 'dompurify';
import { trapFocusTab } from '@/utils/modalKeyboard';

export default {
    name: 'NewsDetail',
    data() {
        return {
            showZoom: false,
            selectedIndex: 0,
            touchStartX: 0,
            loading: true,
            loadError: false,
            fetchSequence: 0,
            currentNews: null,
            zoomOpener: null,
            previousOverflow: null
        }
    },
    async created() {
        await this.fetchNewsDetail();
    },
    watch: {
        '$route.fullPath'() { this.fetchNewsDetail(); }
    },
    mounted() {
        window.addEventListener('keydown', this.handleLightboxKeydown);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleLightboxKeydown);
        this.closeZoom();
    },
    computed: {
        safeDescription() {
            return DOMPurify.sanitize(
                this.getName(this.$i18n.locale, this.currentNews && this.currentNews.description) || ''
            );
        },
        galleryImages() {
            return this.currentNews && Array.isArray(this.currentNews.images) ? this.currentNews.images : [];
        },
        selectedImg() {
            return this.galleryImages[this.selectedIndex] || '';
        }
    },
    methods: {
        async fetchNewsDetail() {
            const sequence = ++this.fetchSequence;
            this.loading = true;
            this.loadError = false;
            this.currentNews = null;
            this.closeZoom();
            try {
              // Check if we are in preview mode
              if (this.$route.query.preview === 'true') {
                let previewData = this.$store.getters['news/previewData'];
                
                // If store is empty (e.g. page refresh or new tab), try localStorage
                if (!previewData) {
                    const localData = localStorage.getItem('news_preview_data');
                    if (localData) {
                        previewData = JSON.parse(localData);
                        this.$store.commit('news/setPreviewData', previewData);
                    }
                }

                this.currentNews = previewData;
                return;
              }
                const id = this.$route.params.id;
                const news = await this.$store.dispatch('news/get');
                if (sequence !== this.fetchSequence) return;
                this.currentNews = (Array.isArray(news) ? news.find(n => n._id === id) : null) || null;
                if (this.currentNews) {
                    // View tracking must not hide an article when that request fails.
                    try {
                        const res = await this.$store.dispatch('news/updateView', id);
                        const views = res && res.data && res.data.data && res.data.data.views;
                        if (sequence === this.fetchSequence && typeof views === 'number') this.currentNews = { ...this.currentNews, views };
                    } catch (_) { /* Reading remains available. */ }
                }
            } catch (error) {
                if (sequence === this.fetchSequence) this.loadError = true;
            } finally {
                if (sequence === this.fetchSequence) this.loading = false;
            }
        },
        getFirstImage(item) {
            return (item && item.images && item.images.length > 0) ? item.images[0] : null;
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const locale = this.$i18n.locale === 'en' ? 'en-GB' : 'th-TH';
            return date.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
        },
        zoomImage(index, event) {
            if (!this.galleryImages[index]) return;
            if (!this.showZoom) {
                this.zoomOpener = event && event.currentTarget || document.activeElement;
                this.previousOverflow = document.body.style.overflow;
            }
            this.selectedIndex = index;
            this.showZoom = true;
            document.body.style.overflow = 'hidden';
            this.$nextTick(() => {
                if (this.showZoom && this.$refs.lightboxClose) this.$refs.lightboxClose.focus();
            });
        },
        closeZoom() {
            if (!this.showZoom) return;
            this.showZoom = false;
            document.body.style.overflow = this.previousOverflow || '';
            const opener = this.zoomOpener;
            this.zoomOpener = null;
            this.previousOverflow = null;
            this.$nextTick(() => {
                if (opener && opener.isConnected && !this.showZoom) opener.focus();
            });
        },
        previousImage() {
            if (!this.galleryImages.length) return;
            this.selectedIndex = (this.selectedIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        },
        nextImage() {
            if (!this.galleryImages.length) return;
            this.selectedIndex = (this.selectedIndex + 1) % this.galleryImages.length;
        },
        handleLightboxKeydown(event) {
            if (!this.showZoom) return;
            if (event.key === 'Tab') {
                trapFocusTab(event, this.$refs.lightbox);
                return;
            }
            if (['ArrowLeft', 'ArrowRight', 'Escape'].includes(event.key)) event.preventDefault();
            if (event.key === 'ArrowLeft') this.previousImage();
            if (event.key === 'ArrowRight') this.nextImage();
            if (event.key === 'Escape') this.closeZoom();
        },
        onTouchStart(event) {
            this.touchStartX = event.changedTouches[0].clientX;
        },
        onTouchEnd(event) {
            const distance = event.changedTouches[0].clientX - this.touchStartX;
            if (Math.abs(distance) < 50) return;
            distance > 0 ? this.previousImage() : this.nextImage();
        },
        goToFacebook() {
            window.open('https://www.facebook.com/BuddhistArtMFU', '_blank');
        }
    }
}
</script>

<style scoped>
.news-detail-wrapper {
    background-color: #ffffff;
    min-height: 100vh;
    padding-top: 0;
    margin-top: 0;
}

.article-content {
    font-size: 1.2rem;
    line-height: 1.8;
}

.gallery-item img:hover {
    transform: scale(1.05);
    filter: brightness(0.9);
}

.gallery-open:focus-visible {
    outline: 3px solid #8a3a30;
    outline-offset: 4px;
}

.transition-all {
    transition: all 0.3s ease;
}

.cursor-pointer {
    cursor: pointer;
}

.lightbox-overlay {
    position: fixed;
    inset: 0;
    padding: 2rem 5rem;
    background: rgba(14, 10, 9, 0.96);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.lightbox-stage {
    position: relative;
    max-width: min(1200px, 100%);
    max-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lightbox-image {
    display: block;
    max-width: 100%;
    max-height: 86vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
}

.lightbox-close,
.lightbox-nav {
    position: absolute;
    z-index: 2;
    width: 48px;
    height: 48px;
    box-sizing: border-box;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(97, 39, 33, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;
}

.lightbox-close:hover,
.lightbox-close:focus-visible,
.lightbox-nav:hover,
.lightbox-nav:focus-visible {
    background: #8a3a30;
    border-color: rgba(255, 255, 255, 0.5);
    outline: none;
}

.lightbox-close {
    top: 1.25rem;
    right: 1.25rem;
    font-size: 0;
}

.lightbox-close::before,
.lightbox-close::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 22px;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
    transform-origin: center;
}

.lightbox-close::before {
    transform: translate(-50%, -50%) rotate(45deg);
}

.lightbox-close::after {
    transform: translate(-50%, -50%) rotate(-45deg);
}

.lightbox-nav {
    top: 50%;
    transform: translateY(-50%);
}

.lightbox-nav svg {
    display: block;
    width: 24px;
    height: 24px;
    stroke: currentColor;
    fill: none;
}

.lightbox-prev { left: 1.25rem; }
.lightbox-next { right: 1.25rem; }

.lightbox-counter {
    position: absolute;
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    padding: 0.4rem 0.85rem;
    color: #fff;
    background: rgba(20, 14, 12, 0.72);
    border-radius: 999px;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
}

.lightbox-fade-enter,
.lightbox-fade-leave-to {
    opacity: 0;
    transform: scale(0.98);
}

@media (max-width: 767.98px) {
    .lightbox-overlay { padding: 4.5rem 0.75rem 5rem; }
    .lightbox-image { max-height: 78vh; border-radius: 8px; }
    .lightbox-nav { top: auto; bottom: 1rem; transform: none; }
    .lightbox-prev { left: calc(50% - 64px); }
    .lightbox-next { right: calc(50% - 64px); }
    .lightbox-counter { bottom: -2.7rem; }
}
</style>
