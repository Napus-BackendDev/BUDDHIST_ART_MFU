<template>
    <div class="news-page min-vh-100">
        <!-- Modular Hero Header -->
        <SectionHeaderNews />

        <CContainer class="pb-5 position-relative pt-4 mt-2" style="z-index: 30;">
            <CRow>
                <!-- News Content -->
                <CCol lg="12" class="mb-4">
                    <div v-if="loading" class="text-center py-5">
                         <CSpinner color="danger" variant="grow" />
                         <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading news...' : 'กำลังโหลดข่าวสาร...' }}</p>
                    </div>
                    <div v-else>
                        <div v-if="displayNews.length > 0">
                            <!-- Search Section -->
                            <div class="search-section mb-5 d-flex justify-content-start">
                                <div class="search-box-modern">
                                    <CIcon name="cil-magnifying-glass" class="search-icon" />
                                    <input 
                                        type="text" 
                                        v-model="searchQuery"
                                        :placeholder="$i18n.locale === 'en' ? 'Search news articles...' : 'ค้นหาข่าวสาร...'"
                                        class="search-input"
                                        @input="resetVisibleCount"
                                    />
                                </div>
                            </div>
                            
                            <CardNew :newsList="displayNews" />
                            
                            <!-- Load More -->
                            <div v-if="visibleCount < filteredNews.length" class="text-center mt-5 pt-4">
                                <CButton @click="loadMore" color="outline-dark" shape="pill" class="px-5 py-2 font-weight-bold btn-load-more">
                                    {{ $i18n.locale === 'en' ? 'Load More' : 'ดูข่าวสารเพิ่มเติม' }}
                                </CButton>
                            </div>
                        </div>
                        <div v-else class="text-center py-5 bg-white rounded-xl shadow-sm border mt-3">
                            <CIcon name="cil-find-in-page" size="xl" class="text-muted mb-3" />
                            <h5 class="text-muted">{{ $i18n.locale === 'en' ? 'No news found' : 'ไม่พบข้อมูลข่าวสาร' }}</h5>
                            <p class="text-muted small">{{ $i18n.locale === 'en' ? 'Try changing the search keyword' : 'ลองเปลี่ยนคำค้นหา' }}</p>
                        </div>
                    </div>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
import CardNew from '@/components/CardNew.vue'
import SectionHeaderNews from './components/SectionHeaderNews.vue'

export default {
    name: 'UserNews',
    components: {
        CardNew,
        SectionHeaderNews
    },
    data() {
        return {
            loading: false,
            searchQuery: '',
            visibleCount: 8
        }
    },
    created() {
        this.fetchNews();
    },
    computed: {
        newsData() {
            return this.$store.getters['news/news'] || [];
        },
        filteredNews() {
            let list = [...this.newsData];
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                list = list.filter(item => 
                    this.getName(this.$i18n.locale, item.title).toLowerCase().includes(query) ||
                    this.getName(this.$i18n.locale, item.description).toLowerCase().includes(query)
                );
            }
            return list;
        },
        displayNews() {
            return this.filteredNews.slice(0, this.visibleCount);
        }
    },
    methods: {
        async fetchNews() {
            this.loading = true;
            try {
                await this.$store.dispatch('news/get');
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        resetVisibleCount() {
            this.visibleCount = 8;
        },
        loadMore() {
            this.visibleCount += 4;
        }
    }
}
</script>

<style scoped>
.news-page {
    background-color: #FAF9F6 !important;
}

.section-title {
    font-weight: 800;
    color: #4a1d18;
    position: relative;
    padding-left: 20px;
    font-family: 'Sarabun', sans-serif;
    font-size: 1.5rem;
}

.section-title::before {
    content: "";
    position: absolute;
    left: 0;
    top: 4px;
    bottom: 4px;
    width: 5px;
    background-color: #612721;
    border-radius: 10px;
}

.search-box-modern {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 600px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 50px;
    padding: 0 20px;
    height: 52px;
    transition: all 0.3s ease;
}

.search-box-modern:focus-within {
    border-color: #4a1d18;
    box-shadow: 0 4px 20px rgba(74, 29, 24, 0.05);
}

.search-icon {
    color: #9ca3af;
    margin-right: 12px;
    width: 18px;
    height: 18px;
}

.search-input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.95rem;
    color: #1f2937;
    font-family: 'Sarabun', sans-serif;
}

.search-input::placeholder {
    color: #9ca3af;
}

.category-item {
    cursor: pointer;
    background-color: transparent;
    color: #555;
    transition: all 0.25s ease;
    border: 1px solid transparent;
}

.category-item:hover {
    background-color: #fff;
    color: #612721;
    padding-left: 2rem !important;
}

.category-item.active {
    background-color: #4a1d18;
    color: white !important;
    border-color: #4a1d18;
}

.cat-name {
    font-weight: 600;
    font-size: 1.05rem;
}

.cat-count {
    font-size: 0.9rem;
    font-weight: 700;
    min-width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.category-item:not(.active) .cat-count {
    background: #612721;
    color: #fff;
}

.category-item.active .cat-count {
    background: #fff;
    color: #4a1d18;
}

.rounded-xl {
    border-radius: 24px !important;
}

.rounded-xl-sm {
    border-radius: 14px !important;
}

.transition-all {
    transition: all 0.3s ease;
}

.cursor-pointer {
    cursor: pointer;
}

.btn-load-more {
    border-width: 2px;
    transition: all 0.3s ease;
}

.btn-load-more:hover {
    background-color: #2d3436;
    color: #fff;
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
</style>
