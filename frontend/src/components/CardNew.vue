<template>
    <CRow>
        <CCol 
            v-for="news in newsList" 
            :key="news._id" 
            col="12"
            md="6" 
            lg="3" 
            class="mb-4"
        >
            <CCard 
                class="news-card border-0 shadow-sm h-100 overflow-hidden cursor-pointer" 
                :class="{ 'home-card': isHome }"
                @click="explore(news._id)"
            >
                <!-- Image Section -->
                <div class="card-img-wrapper position-relative">
                    <div class="card-img-bg h-100 w-100" :style="{ backgroundImage: 'url(' + String.fromCharCode(34) + getNewsImage(news) + String.fromCharCode(34) + ')' }"></div>
                    <div class="card-img-overlay-custom"></div>
                </div>

                <!-- Content Section -->
                <CCardBody class="p-4 d-flex flex-column bg-white">
                    <div class="meta-info d-flex align-items-center mb-3">
                        <span class="meta-item date-text">
                            <CIcon name="cil-calendar" size="sm" /> {{ getNewsDate(news) }}
                        </span>
                    </div>

                    <h4 class="news-title mb-3 cursor-pointer">
                        {{ getName($i18n.locale, news.title) }}
                    </h4>
                    <p class="news-summary text-muted mb-4">{{ getNewsSummary(news) }}</p>

                    <div class="mt-auto">
                        <div class="read-more-btn">
                            <span>{{ isHome ? ($i18n.locale === 'en' ? 'Read More' : 'อ่านต่อ') : ($i18n.locale === 'en' ? 'Read Article' : 'อ่านบทความ') }}</span>
                            <CIcon name="cil-arrow-right" class="ml-2 arrow-icon" />
                        </div>
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
</template>

<script>
export default {
    name: 'CardNew',
    props: {
        newsList: {
            type: Array,
            required: true,
            default: () => []
        },
        isHome: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        explore(id) {
            this.$router.push({ name: 'NewsDetail', params: { id } });
        },
        getNewsImage(news) {
            if (news.images && news.images.length > 0) return news.images[0];
            if (news.image) return news.image;
            return 'https://via.placeholder.com/800x600?text=No+Image';
        },
        getNewsDate(news) {
            const dateVal = news.create ? news.create.datetime : (news.createdAt || null);
            if (!dateVal) return '';
            const date = new Date(dateVal);
            if (this.isHome) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            } else {
                return date.toLocaleDateString('th-TH', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                });
            }
        },
        getNewsSummary(news) {
            const rawDesc = this.getName(this.$i18n.locale, news.description || news.content);
            if (!rawDesc) return '';
            return rawDesc
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"');
        }
    }
}
</script>

<style scoped>
.news-card {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.04) !important;
    cursor: pointer;
}

.news-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(74, 29, 24, 0.06) !important;
    border-color: rgba(74, 29, 24, 0.1) !important;
}

/* Home Card hover tweaks to match original SectionNews */
.news-card.home-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
    border-color: rgba(0, 0, 0, 0.03) !important;
}

.card-img-wrapper {
    height: 200px;
    overflow: hidden;
    position: relative;
    margin-top: -1px;
}

.home-card .card-img-wrapper {
    height: 220px;
    border-radius: 20px 20px 0 0;
}

.card-img-bg {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform 0.8s ease;
}

.news-card:hover .card-img-bg {
    transform: scale(1.05);
}

.news-card.home-card:hover .card-img-bg {
    transform: scale(1.08);
}

.card-img-overlay-custom {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.1) 100%);
}

.home-card .card-img-overlay-custom {
    top: auto;
    bottom: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.news-card.home-card:hover .card-img-overlay-custom {
    opacity: 1;
}

.meta-info {
    font-size: 0.75rem;
    font-weight: 600;
}

.home-card .meta-info {
    font-size: 0.8rem;
}

.date-text {
    font-family: 'Sarabun', sans-serif;
    color: #4a1d18;
    font-weight: 700;
}

.home-card .date-text {
    color: #612721;
}

.news-title {
    font-family: 'Cinzel', serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: #1c1917;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.3s ease;
    min-height: 3rem;
}

.home-card .news-title {
    font-size: 1.1rem;
    color: #2d3436;
    min-height: auto;
}

.news-card:hover .news-title {
    color: #4a1d18;
}

.news-card.home-card:hover .news-title {
    color: #612721;
}

.news-summary {
    font-family: 'Sarabun', sans-serif;
    font-size: 0.82rem;
    line-height: 1.6;
    color: #6b7280;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 1.5rem !important;
}

.home-card .news-summary {
    font-size: 0.85rem;
    line-height: 1.5;
    -webkit-line-clamp: 2;
}

.read-more-btn {
    display: inline-flex;
    align-items: center;
    color: #4a1d18;
    font-weight: 700;
    text-decoration: none;
    font-size: 0.88rem;
    position: relative;
    padding-bottom: 4px;
    font-family: 'Sarabun', sans-serif;
    transition: color 0.3s ease;
}

.home-card .read-more-btn {
    color: #612721;
    font-size: 0.85rem;
}

.read-more-btn::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 30px;
    height: 2px;
    background: #4a1d18;
    transition: width 0.3s ease;
}

.home-card .read-more-btn::after {
    width: 20px;
    background: #612721;
}

.read-more-btn:hover {
    color: #8c3b32;
    text-decoration: none;
}

.home-card .read-more-btn:hover {
    color: #612721;
}

.read-more-btn:hover::after {
    width: 100%;
    background: #8c3b32;
}

.home-card .read-more-btn:hover::after {
    width: 100%;
    background: #612721;
}

.arrow-icon {
    transition: transform 0.3s ease;
}

.read-more-btn:hover .arrow-icon {
    transform: translateX(5px);
}

@media (max-width: 991px) {
    .home-card .card-img-wrapper {
        height: 180px;
    }
}
</style>
