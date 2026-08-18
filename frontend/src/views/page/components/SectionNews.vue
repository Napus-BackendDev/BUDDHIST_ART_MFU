<template>
    <div class="events-section py-5">
        <CContainer>
            <!-- Left-aligned Header with View All Button -->
            <div class="d-flex align-items-center justify-content-between mb-4">
                <h2 class="font-weight-bold mb-0 mr-2 section-title-home">{{ $i18n.locale === 'en' ? 'News & Updates' : 'ข่าวประชาสัมพันธ์' }}</h2>
                <CButton color="danger" variant="outline" shape="pill" class="px-4 py-2 font-weight-bold" @click="$router.push('/news')">
                    {{ $i18n.locale === 'en' ? 'View All News' : 'ดูข่าวทั้งหมด' }}
                </CButton>
            </div>



            <CardNew :newsList="filteredNews.slice(0, 8)" :isHome="true" class="news-grid-row" />
        </CContainer>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import CardNew from '@/components/CardNew.vue';

export default {
    name: 'SectionNews',
    components: {
        CardNew
    },
    data() {
        return {
            loading: false
        }
    },
    async created() {
        this.loading = true;
        try {
            await this.fetchNews({});
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            this.loading = false;
        }
    },
    computed: {
        ...mapGetters({
            newsList: 'news/news'
        }),
        filteredNews() {
            if (!this.newsList) return [];
            
            let list = [...this.newsList];
            
            // Sort by date descending
            list.sort((a, b) => {
                const dateA = a.create ? new Date(a.create.datetime) : 0;
                const dateB = b.create ? new Date(b.create.datetime) : 0;
                return dateB - dateA;
            });

            return list;
        }
    },
    methods: {
        ...mapActions('news', {
            fetchNews: 'get'
        })
    }
}
</script>

<style scoped>
.events-section {
    background-color: #FAF9F6;
    border-top: 1px solid rgba(97, 39, 33, 0.05);
    border-bottom: 1px solid rgba(97, 39, 33, 0.05);
}

.section-title-home {
    color: #612721;
    font-size: 2.2rem;
    position: relative;
    padding-left: 20px;
}

.section-title-home::before {
    content: "";
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 6px;
    background: #612721;
    border-radius: 10px;
}

.news-pill-wrapper {
    overflow-x: auto;
    padding-bottom: 5px;
    scrollbar-width: none;
}

.news-pill-wrapper::-webkit-scrollbar {
    display: none;
}

.news-pill {
    white-space: nowrap;
    transition: all 0.3s ease;
    border: 1px solid #e2e8f0 !important;
}

.news-pill-active {
    background-color: #612721 !important;
    color: white !important;
    border-color: #612721 !important;
}

.news-pill-inactive {
    background-color: #fff !important;
    color: #4a5568 !important;
}

.news-grid-row {
    margin-top: 20px;
}

.news-card {
    border-radius: 20px !important;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    background: #ffffff;
    cursor: pointer;
    border: 1px solid rgba(0,0,0,0.03) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04) !important;
}

.news-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
}

.card-img-wrapper {
    height: 220px;
    overflow: hidden;
    border-radius: 20px 20px 0 0;
}

.card-img-bg {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.news-card:hover .card-img-bg {
    transform: scale(1.08);
}

.card-img-overlay-custom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.news-card:hover .card-img-overlay-custom {
    opacity: 1;
}

.category-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #2d3748;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    z-index: 2;
}

.meta-info {
    font-size: 0.8rem;
    font-weight: 600;
}

.date-text {
    color: #612721;
    font-weight: 700;
}

.author-text {
    color: #888;
}

.meta-divider {
    width: 4px;
    height: 4px;
    background: #ddd;
    border-radius: 50%;
    margin: 0 10px;
}

.news-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2d3436;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.3s ease;
}

.news-card:hover .news-title {
    color: #612721;
}

.news-summary {
    font-size: 0.85rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.read-more-btn {
    display: inline-flex;
    align-items: center;
    color: #612721;
    font-weight: 700;
    text-decoration: none;
    font-size: 0.85rem;
    position: relative;
    padding-bottom: 4px;
}

.read-more-btn::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 20px;
    height: 2px;
    background: #612721;
    transition: width 0.3s ease;
}

.read-more-btn:hover::after {
    width: 100%;
}

.arrow-icon {
    transition: transform 0.3s ease;
}

.read-more-btn:hover .arrow-icon {
    transform: translateX(5px);
}

@media (max-width: 991px) {
    .card-img-wrapper {
        height: 180px;
    }
}
</style>
