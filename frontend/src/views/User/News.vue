<template>
    <div class="news-page bg-light min-vh-100">
        <!-- Modular Hero Header -->
        <SectionHeaderNews />

        <CContainer fluid class="pb-5 px-md-5 position-relative" style="z-index: 30; margin-top: -30px;">
            <CRow>
                <!-- News Content -->
                <CCol lg="9" class="mb-4">
                    <div v-if="loading" class="text-center py-5">
                        <CSpinner color="danger" variant="grow" />
                        <p class="mt-3 text-muted">กำลังโหลดข่าวสาร...</p>
                    </div>
                    <div v-else>
                        <div v-if="displayNews.length > 0">
                            <CardNew :newsList="formattedNewsList" />
                            
                            <!-- Load More -->
                            <div v-if="visibleCount < filteredNews.length" class="text-center mt-5 pt-4">
                                <CButton @click="loadMore" color="outline-dark" shape="pill" class="px-5 py-2 font-weight-bold btn-load-more">
                                    ดูข่าวสารเพิ่มเติม
                                </CButton>
                            </div>
                        </div>
                        <div v-else class="text-center py-5 bg-white rounded-xl shadow-sm border mt-3">
                            <CIcon name="cil-find-in-page" size="xl" class="text-muted mb-3" />
                            <h5 class="text-muted">ไม่พบข้อมูลข่าวสาร</h5>
                            <p class="text-muted small">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
                        </div>
                    </div>
                </CCol>

                <!-- Sidebar Filter -->
                <CCol lg="3" class="mb-4">
                    <div class="sidebar-filter sticky-top bg-white p-4 rounded-xl shadow-sm border" style="top: 100px;">
                        <!-- Search Section -->
                        <div class="filter-section mb-5">
                            <h5 class="section-title mb-4">ค้นหาข่าวสาร</h5>
                            <div class="search-box">
                                <input 
                                    type="text" 
                                    v-model="searchQuery"
                                    placeholder="พิมพ์คำค้นหา..."
                                    class="form-control rounded-pill border-0 shadow-sm px-4 py-3"
                                    @input="resetVisibleCount"
                                />
                            </div>
                        </div>

                        <!-- Categories Section -->
                        <div class="filter-section">
                            <h5 class="section-title mb-4">หมวดหมู่</h5>
                            <div class="category-list">
                                <div 
                                    class="category-item d-flex justify-content-between align-items-center p-3 rounded-lg mb-2 transition-all cursor-pointer"
                                    :class="{ 'active shadow': selectedCategory === 'ทั้งหมด' }"
                                    @click="selectCategory('ทั้งหมด')"
                                >
                                    <span class="cat-name">ทั้งหมด</span>
                                    <span class="cat-count">{{ newsData.length }}</span>
                                </div>
                                
                                <div 
                                    v-for="cat in categoriesList" :key="cat._id"
                                    class="category-item d-flex justify-content-between align-items-center p-3 rounded-xl-sm mb-2 transition-all cursor-pointer"
                                    :class="{ 'active shadow': selectedCategory._id === cat._id }"
                                    @click="selectCategory(cat)"
                                >
                                    <span class="cat-name">{{ getLang(cat.title) }}</span>
                                    <span class="cat-count">{{ getCategoryCount(cat) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
import CardNew from './components/card/CardNew.vue'
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
            selectedCategory: 'ทั้งหมด',
            visibleCount: 8,
            categoriesList: []
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
                    this.getLang(item.title).toLowerCase().includes(query) ||
                    this.getLang(item.description).toLowerCase().includes(query)
                );
            }
            if (this.selectedCategory !== 'ทั้งหมด') {
                list = list.filter(item => {
                    if (typeof this.selectedCategory === 'string') return true; // fallback
                    return item.category && item.category._id === this.selectedCategory._id;
                });
            }
            return list;
        },
        displayNews() {
            return this.filteredNews.slice(0, this.visibleCount);
        },
        formattedNewsList() {
            return this.displayNews.map(item => ({
                _id: item._id,
                image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/800x600?text=No+Image',
                category: item.category ? this.getLang(item.category.title) : 'ทั่วไป',
                date: this.formatDate(item.create ? item.create.datetime : null),
                title: this.getLang(item.title),
                summary: this.getLang(item.description)
            }));
        }
    },
    methods: {
        async fetchNews() {
            this.loading = true;
            try {
                // Fetch categories
                const cats = await this.$store.dispatch('setting/category/get');
                this.categoriesList = cats || [];
                
                // Fetch news
                await this.$store.dispatch('news/get');
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
        formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('th-TH', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
        },
        getCategoryCount(cat) {
            if (cat === 'ทั้งหมด') return this.newsData.length;
            return this.newsData.filter(item => item.category && item.category._id === cat._id).length;
        },
        selectCategory(cat) {
            this.selectedCategory = cat;
            this.resetVisibleCount();
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

.search-box input {
    height: 60px;
    font-size: 1rem;
    transition: all 0.3s ease;
    border: 1px solid #eee !important;
    background-color: #fff !important;
}

.search-box input:focus {
    box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
    border-color: #612721 !important;
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
