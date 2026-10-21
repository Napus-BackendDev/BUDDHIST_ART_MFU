<template>
    <div class="news-page min-vh-100 pb-5">
        <!-- Modular Hero Header -->
        <SectionHeaderNews />

        <CContainer class="pb-5 position-relative pt-4 mt-2" style="z-index: 30;" ref="newsContainer">
            <CRow>
                <!-- News Content -->
                <CCol lg="12" class="mb-4">
                    <div v-if="loading" class="text-center py-5">
                         <CSpinner color="danger" variant="grow" />
                         <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading news...' : 'กำลังโหลดข่าวสาร...' }}</p>
                    </div>
                    <div v-else-if="loadError" role="alert" class="alert alert-danger">
                        <p>{{ $i18n.locale === 'en' ? 'Unable to load news. Please try again.' : 'โหลดข่าวสารไม่สำเร็จ กรุณาลองใหม่' }}</p>
                        <button type="button" class="btn btn-outline-danger" @click="fetchNews">{{ $i18n.locale === 'en' ? 'Try again' : 'ลองใหม่' }}</button>
                    </div>
                    <div v-else>
                        <div>
                            <!-- Search & Display Controls Toolbar (Matching Artworks Design) -->
                            <div class="news-toolbar mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                <!-- Left: Search Box (Matching Artworks Design) -->
                                <div class="news-search-box">
                                    <div class="search-input-group">
                                        <input 
                                            type="text" 
                                            v-model="searchQuery" 
                                            :aria-label="$i18n.locale === 'en' ? 'Search news' : 'ค้นหาข่าวสาร'"
                                            :placeholder="$i18n.locale === 'en' ? 'Search news...' : 'ค้นหาข่าวสาร...'"
                                            class="sidebar-search-input"
                                            @input="onSearchChange"
                                        />
                                        <button v-if="searchQuery" type="button" class="btn-clear-search-box" @click="searchQuery = ''; onSearchChange()" :title="$i18n.locale === 'en' ? 'Clear search' : 'ล้างคำค้นหา'" :aria-label="$i18n.locale === 'en' ? 'Clear search' : 'ล้างคำค้นหา'">
                                            <CIcon name="cil-x" size="sm" />
                                        </button>
                                        <button type="button" class="sidebar-search-btn" :title="$i18n.locale === 'en' ? 'Search' : 'ค้นหา'" :aria-label="$i18n.locale === 'en' ? 'Search' : 'ค้นหา'">
                                            <CIcon name="cil-magnifying-glass" />
                                        </button>
                                    </div>
                                </div>

                                <!-- Right: Select Display & Sort Options (Matching Image 1 & Artworks Design) -->
                                <div class="news-controls-right d-flex align-items-center flex-wrap mt-3 mt-md-0">
                                    <!-- Items Per Page Selector -->
                                    <div class="d-flex align-items-center mr-3">
                                        <span class="sort-label mr-2 text-muted small text-uppercase font-weight-bold">
                                            {{ $i18n.locale === 'en' ? 'Show:' : 'แสดง:' }}
                                        </span>
                                        <select v-model.number="itemsPerPage" @change="currentPage = 1" class="custom-sort-select" :aria-label="$i18n.locale === 'en' ? 'News per page' : 'จำนวนข่าวต่อหน้า'">
                                            <option :value="4">4 {{ $i18n.locale === 'en' ? 'items' : 'ข่าว' }}</option>
                                            <option :value="8">8 {{ $i18n.locale === 'en' ? 'items' : 'ข่าว' }}</option>
                                            <option :value="12">12 {{ $i18n.locale === 'en' ? 'items' : 'ข่าว' }}</option>
                                            <option :value="16">16 {{ $i18n.locale === 'en' ? 'items' : 'ข่าว' }}</option>
                                            <option :value="24">24 {{ $i18n.locale === 'en' ? 'items' : 'ข่าว' }}</option>
                                        </select>
                                    </div>

                                    <!-- Sort Selector -->
                                    <div class="d-flex align-items-center">
                                        <span class="sort-label mr-2 text-muted small text-uppercase font-weight-bold">
                                            {{ $i18n.locale === 'en' ? 'Sort by:' : 'เรียงลำดับ:' }}
                                        </span>
                                        <select v-model="sortOrder" @change="currentPage = 1" class="custom-sort-select" :aria-label="$i18n.locale === 'en' ? 'Sort news' : 'เรียงลำดับข่าว'">
                                            <option value="newest">{{ $i18n.locale === 'en' ? 'Newest' : 'ใหม่ล่าสุด' }}</option>
                                            <option value="oldest">{{ $i18n.locale === 'en' ? 'Oldest' : 'เก่าที่สุด' }}</option>
                                            <option value="mostViewed">{{ $i18n.locale === 'en' ? 'Most Viewed' : 'ยอดเข้าชม' }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                        <div v-if="filteredNews.length > 0">
                            <CardNew :newsList="paginatedNews" />
                            
                            <!-- Pagination Controls (Matching Artworks Page) -->
                            <div v-if="totalPages > 1" class="pagination-wrapper mt-5 pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center">
                                <div class="pagination-info text-muted small mb-3 mb-sm-0">
                                    {{ $i18n.locale === 'en' ? 'Page' : 'หน้า' }} 
                                    <strong class="text-dark">{{ currentPage }}</strong> / <strong class="text-dark">{{ totalPages }}</strong>
                                    ({{ filteredNews.length }} {{ $i18n.locale === 'en' ? 'news articles in total' : 'ข่าวสารทั้งหมด' }})
                                </div>

                                <div class="pagination-controls d-flex align-items-center">
                                    <!-- Previous Page Button -->
                                    <button 
                                        type="button" 
                                        class="pagination-btn pagination-nav-btn"
                                        :disabled="currentPage === 1"
                                        @click="goToPage(currentPage - 1)"
                                        :title="$i18n.locale === 'en' ? 'Previous' : 'หน้าก่อนหน้า'"
                                    >
                                        <CIcon name="cil-chevron-left" size="sm" />
                                    </button>

                                    <!-- Page Numbers -->
                                    <template v-for="(p, idx) in displayedPages">
                                        <span v-if="p === '...'" :key="'ellipsis-' + idx" class="pagination-ellipsis">...</span>
                                        <button 
                                            v-else 
                                            :key="'page-' + p"
                                            type="button"
                                            class="pagination-btn pagination-num-btn"
                                            :class="{ 'active': currentPage === p }"
                                            @click="goToPage(p)"
                                        >
                                            {{ p }}
                                        </button>
                                    </template>

                                    <!-- Next Page Button -->
                                    <button 
                                        type="button" 
                                        class="pagination-btn pagination-nav-btn"
                                        :disabled="currentPage === totalPages"
                                        @click="goToPage(currentPage + 1)"
                                        :title="$i18n.locale === 'en' ? 'Next' : 'หน้าถัดไป'"
                                    >
                                        <CIcon name="cil-chevron-right" size="sm" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-5 bg-white rounded-xl shadow-sm border mt-3 p-5">
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
            loadError: false,
            searchQuery: '',
            sortOrder: 'newest',
            currentPage: 1,
            itemsPerPage: 8
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

            // Sorting logic
            if (this.sortOrder === 'newest') {
                list.sort((a, b) => new Date(b.createdAt || (b.create && b.create.datetime) || 0) - new Date(a.createdAt || (a.create && a.create.datetime) || 0));
            } else if (this.sortOrder === 'oldest') {
                list.sort((a, b) => new Date(a.createdAt || (a.create && a.create.datetime) || 0) - new Date(b.createdAt || (b.create && b.create.datetime) || 0));
            } else if (this.sortOrder === 'mostViewed') {
                list.sort((a, b) => (b.views || 0) - (a.views || 0));
            }

            return list;
        },
        totalPages() {
            return Math.ceil(this.filteredNews.length / this.itemsPerPage) || 1;
        },
        paginatedNews() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredNews.slice(start, end);
        },
        displayedPages() {
            const total = this.totalPages;
            const current = this.currentPage;
            if (total <= 7) {
                return Array.from({ length: total }, (_, i) => i + 1);
            }

            const pages = [];
            if (current <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', total);
            } else if (current >= total - 3) {
                pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
            } else {
                pages.push(1, '...', current - 1, current, current + 1, '...', total);
            }
            return pages;
        }
    },
    methods: {
        async fetchNews() {
            if (this.loading) return;
            this.loading = true;
            this.loadError = false;
            try {
                await this.$store.dispatch('news/get');
            } catch (error) {
                this.loadError = true;
            } finally {
                this.loading = false;
            }
        },
        onSearchChange() {
            this.currentPage = 1;
        },
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                if (this.$refs.newsContainer) {
                    this.$refs.newsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                }
            }
        }
    }
}
</script>

<style scoped>
.news-page {
    background-color: #FAF9F6 !important;
}

/* Toolbar & Layout */
.news-toolbar {
    gap: 1rem;
}

/* Search Box - Matching Artworks Design */
.news-search-box {
    width: 100%;
    max-width: 380px;
}

.search-input-group {
    display: flex;
    align-items: stretch;
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.search-input-group:focus-within {
    border-color: #4a1d18;
    box-shadow: 0 0 0 3px rgba(74, 29, 24, 0.12);
}

.sidebar-search-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 8px 14px;
    font-size: 0.92rem;
    color: #1f2937;
    background: transparent;
    min-width: 0;
    font-family: var(--app-font-family);
}

.sidebar-search-input::placeholder {
    color: #94a3b8;
}

.btn-clear-search-box {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
}

.btn-clear-search-box:hover {
    color: #4a1d18;
}

.sidebar-search-btn {
    width: 44px;
    border: none;
    outline: none;
    background-color: #4a1d18;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.sidebar-search-btn:hover {
    background-color: #612721;
}

/* Select Controls - Matching Image 1 & Artworks Design */
.news-controls-right {
    gap: 0.75rem;
}

.sort-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: #64748b;
    white-space: nowrap;
    letter-spacing: 0.03em;
}

.custom-sort-select {
    appearance: none;
    -webkit-appearance: none;
    border: 1px solid #e2e8f0;
    background-color: #ffffff;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    border-radius: 8px;
    padding: 6px 28px 6px 12px;
    font-size: 0.88rem;
    font-weight: 600;
    color: #1e293b;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.custom-sort-select:focus {
    border-color: #4a1d18;
    box-shadow: 0 0 0 3px rgba(74, 29, 24, 0.1);
}

.custom-sort-select:hover {
    border-color: #cbd5e1;
}

.rounded-xl {
    border-radius: 24px !important;
}

/* Pagination Styles - Matching Artworks Page */
.pagination-wrapper {
    border-top: 1px solid #e2e8f0;
}

.pagination-controls {
    gap: 6px;
}

.pagination-btn {
    min-width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background-color: #ffffff;
    color: #334155;
    font-size: 0.9rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
    padding: 0 10px;
}

.pagination-btn:hover:not(:disabled):not(.active) {
    border-color: #4a1d18;
    color: #4a1d18;
    background-color: #fbf7f1;
    transform: translateY(-1px);
}

.pagination-btn.active {
    background-color: #4a1d18;
    border-color: #4a1d18;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(74, 29, 24, 0.25);
}

.pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background-color: #f8fafc;
}

.pagination-ellipsis {
    padding: 0 6px;
    color: #94a3b8;
    font-weight: 600;
}
</style>
