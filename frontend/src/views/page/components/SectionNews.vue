<template>
    <div class="events-section py-5 bg-white">
        <CContainer fluid class="px-md-5">
            <!-- Left-aligned Header with View All Button -->
            <div class="d-flex align-items-center justify-content-between mb-4">
                <h2 class="font-weight-bold mb-0 mr-2 section-title-home">{{ $i18n.locale === 'en' ? 'News & PR' : 'ข่าวประชาสัมพันธ์' }}</h2>
                <CButton color="danger" variant="outline" shape="pill" class="px-4 py-2 font-weight-bold" @click="$router.push('/news')">
                    {{ $i18n.locale === 'en' ? 'View All News' : 'ดูข่าวทั้งหมด' }}
                </CButton>
            </div>

            <!-- Category Filters (Pills) -->
            <div class="d-flex mb-5 news-pill-wrapper" style="gap: 12px;">
                <CButton 
                    v-for="cat in newsCategories" 
                    :key="cat"
                    :class="['news-pill px-4 font-weight-bold shadow-sm', selectedNewsCategory === cat ? 'news-pill-active' : 'news-pill-inactive']"
                    shape="pill"
                    @click="selectedNewsCategory = cat"
                >
                    {{ cat }}
                </CButton>
            </div>

            <CRow class="news-grid-row">
                <CCol 
                    v-for="news in filteredNews.slice(0, 8)" 
                    :key="news._id" 
                    col="12" 
                    md="6" 
                    lg="3" 
                    class="mb-4"
                >
                    <CCard class="news-card border-0 shadow-sm h-100 overflow-hidden" @click="explore(news._id)">
                        <!-- Image Section -->
                        <div class="card-img-wrapper position-relative">
                            <div class="card-img-bg h-100 w-100" :style="{ backgroundImage: `url(${getNewsImage(news)})` }"></div>
                            <div class="card-img-overlay-custom"></div>
                            <span class="category-badge">{{ getName($i18n.locale, news.category) }}</span>
                        </div>

                        <!-- Content Section -->
                        <CCardBody class="p-4 d-flex flex-column bg-white">
                            <div class="meta-info d-flex align-items-center mb-3">
                                <span class="meta-item date-text">
                                    <CIcon name="cil-calendar" size="sm" /> {{ formatDate(news.create ? news.create.datetime : null) }}
                                </span>
                                <span class="meta-divider"></span>
                                <span class="meta-item author-text">
                                    <CIcon name="cil-user" size="sm" /> PR MFU
                                </span>
                            </div>

                            <h5 class="news-title mb-3 cursor-pointer">
                                {{ getName($i18n.locale, news.title) }}
                            </h5>
                            <p class="news-summary text-muted mb-4">{{ getName($i18n.locale, news.description) }}</p>

                            <div class="mt-auto">
                                <div class="read-more-btn">
                                    <span>{{ $i18n.locale === 'en' ? 'Read More' : 'อ่านต่อ' }}</span>
                                    <CIcon name="cil-arrow-right" class="ml-2 arrow-icon" />
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import moment from 'moment';

export default {
    name: 'SectionNews',
    data() {
        return {
            selectedNewsCategory: 'ล่าสุด', // will adapt via watcher if needed
            loading: false
        }
    },
    watch: {
        '$i18n.locale': function(newVal) {
            if (newVal === 'en' && ['ล่าสุด', 'กิจกรรม', 'นิทรรศการ'].includes(this.selectedNewsCategory)) {
                if (this.selectedNewsCategory === 'ล่าสุด') this.selectedNewsCategory = 'Latest';
                else if (this.selectedNewsCategory === 'กิจกรรม') this.selectedNewsCategory = 'Activities';
                else if (this.selectedNewsCategory === 'นิทรรศการ') this.selectedNewsCategory = 'Exhibitions';
            } else if (newVal === 'th' && ['Latest', 'Activities', 'Exhibitions'].includes(this.selectedNewsCategory)) {
                if (this.selectedNewsCategory === 'Latest') this.selectedNewsCategory = 'ล่าสุด';
                else if (this.selectedNewsCategory === 'Activities') this.selectedNewsCategory = 'กิจกรรม';
                else if (this.selectedNewsCategory === 'Exhibitions') this.selectedNewsCategory = 'นิทรรศการ';
            }
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
        newsCategories() {
            return this.$i18n.locale === 'en' 
                ? ['Latest', 'Activities', 'Exhibitions'] 
                : ['ล่าสุด', 'กิจกรรม', 'นิทรรศการ'];
        },
        filteredNews() {
            if (!this.newsList) return [];
            
            let list = [...this.newsList];
            
            // Sort by date descending
            list.sort((a, b) => {
                const dateA = a.create ? new Date(a.create.datetime) : 0;
                const dateB = b.create ? new Date(b.create.datetime) : 0;
                return dateB - dateA;
            });

            if (this.selectedNewsCategory === 'ล่าสุด' || this.selectedNewsCategory === 'Latest') return list;
            
            return list.filter(item => {
                const categoryNameTh = this.getName('th', item.category);
                const categoryNameEn = this.getName('en', item.category);
                return categoryNameTh === this.selectedNewsCategory || categoryNameEn === this.selectedNewsCategory;
            });
        }
    },
    methods: {
        ...mapActions('news', {
            fetchNews: 'get'
        }),
        explore(id) {
            this.$router.push({ name: 'NewsDetail', params: { id } });
        },
        getNewsImage(news) {
            if (news.images && news.images.length > 0) return news.images[0];
            if (news.image) return news.image;
            return 'https://via.placeholder.com/800x600?text=MFU+News';
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return moment(date).format('DD/MM/YYYY');
        }
    }
}
</script>

<style scoped>
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
    border-radius: 24px !important;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    background: #fff;
    cursor: pointer;
}

.news-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
}

.card-img-wrapper {
    height: 200px;
    overflow: hidden;
    border-radius: 24px 24px 0 0;
}

.card-img-bg {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform 0.8s ease;
}

.news-card:hover .card-img-bg {
    transform: scale(1.1);
}

.card-img-overlay-custom {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%);
}

.category-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    background: rgba(255, 255, 255, 0.95);
    color: #612721;
    padding: 4px 12px;
    border-radius: 50px;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
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
