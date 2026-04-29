<template>
    <div class="news-detail-wrapper pb-5">
        <div v-if="currentNews" class="news-detail-page bg-white min-vh-100">
            <CContainer class="py-5">
                <CRow>
                    <CCol lg="10" class="mx-auto">
                        <!-- Header -->
                        <div class="news-header-simple mb-5">
                            <CBadge v-if="currentNews.category" color="danger" shape="pill" class="px-3 py-2 mb-3">
                                {{ getLang(currentNews.category.title) }}
                            </CBadge>
                            <h1 class="font-weight-bold mb-4">{{ getLang(currentNews.title) }}</h1>
                            <hr class="my-4">
                        </div>

                        <!-- Content -->
                        <div class="article-content mb-5" v-html="getLang(currentNews.description)">
                        </div>

                        <!-- Gallery (All images moved here) -->
                        <div v-if="currentNews.images && currentNews.images.length > 0" class="mt-4 mb-5">
                            <CRow>
                                <CCol md="4" sm="6" v-for="(img, index) in currentNews.images" :key="index" class="mb-4 px-2">
                                    <div class="gallery-item shadow-sm rounded overflow-hidden h-100 bg-light">
                                        <img :src="img" class="img-fluid cursor-pointer transition-all w-100" style="height: 250px; object-fit: cover;" @click="zoomImage(img)">
                                    </div>
                                </CCol>
                            </CRow>
                        </div>

                        <!-- Date Info (Moved to bottom) with Facebook Share -->
                        <div class="text-muted small border-top pt-3 d-flex justify-content-between align-items-center flex-wrap">
                            <div class="mb-2">
                                <span class="mr-3"><CIcon name="cil-calendar" /> เผยแพร่เมื่อ: {{ formatDate(currentNews.create ? currentNews.create.datetime : null) }}</span>
                                <span class="mr-3"><CIcon name="cil-eye" /> {{ currentNews.views || 0 }} เข้าชม</span>
                            </div>
                            <div class="mb-2">
                                <span class="mr-2">ติดตามข่าวสารเพิ่มเติม:</span>
                                <CButton color="link" class="p-0" @click="goToFacebook">
                                    <CIcon name="cib-facebook" size="xl" style="color: #1877F2;" />
                                </CButton>
                            </div>
                        </div>

                        <div class="text-center mt-3 pt-5 border-top">
                            <CButton color="outline-dark" shape="pill" class="px-5" @click="$router.push('/news')">
                                กลับหน้าหลักข่าวสาร
                            </CButton>
                        </div>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
        
        <div v-else-if="loading" class="text-center py-5">
            <CSpinner color="danger" />
        </div>

        <!-- Lightbox -->
        <div v-if="showZoom" class="lightbox-overlay" @click="showZoom = false">
            <img :src="selectedImg" class="img-fluid">
        </div>
    </div>
</template>

<script>
export default {
    name: 'NewsDetail',
    data() {
        return {
            showZoom: false,
            selectedImg: '',
            loading: true,
            currentNews: null
        }
    },
    async created() {
        await this.fetchNewsDetail();
    },
    methods: {
        async fetchNewsDetail() {
            this.loading = true;
            
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
                this.loading = false;
                return;
            }

            const id = this.$route.params.id;
            try {
                // Increment view count
                await this.$store.dispatch('news/updateView', id);
                
                const news = await this.$store.dispatch('news/get');
                this.currentNews = news.find(n => n._id === id);
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        getLang(arr) {
            if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
            const lang = this.$i18n.locale || 'th';
            const item = arr.find(i => i.key === lang) || arr.find(i => i.key === 'th') || arr[0];
            return item ? item.value : '';
        },
        getFirstImage(item) {
            return (item && item.images && item.images.length > 0) ? item.images[0] : null;
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' });
        },
        zoomImage(img) {
            this.selectedImg = img;
            this.showZoom = true;
        },
        goToFacebook() {
            window.open('https://www.facebook.com/BuddhistArtMFU', '_blank');
        }
    }
}
</script>

<style scoped>
.article-content {
    font-size: 1.2rem;
    line-height: 1.8;
}

.gallery-item img:hover {
    transform: scale(1.05);
    filter: brightness(0.9);
}

.transition-all {
    transition: all 0.3s ease;
}

.cursor-pointer {
    cursor: pointer;
}

.lightbox-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
}
.lightbox-overlay img { max-width: 90%; max-height: 90%; }
</style>
