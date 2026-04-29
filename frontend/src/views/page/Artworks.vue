<template>
    <div class="artworks-page bg-light min-vh-100">
        <!-- Modular Hero Header -->
        <SectionHeaderArtworks />

        <CContainer fluid class="pb-5 px-md-5 position-relative" style="z-index: 30; margin-top: -30px;">
            <CRow>
                <!-- Artwork Content -->
                <CCol lg="9" class="mb-4">
                    <div v-if="loading" class="text-center py-5">
                        <CSpinner color="danger" variant="grow" />
                        <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading artworks...' : 'กำลังโหลดผลงาน...' }}</p>
                    </div>
                    <div v-else>
                        <div v-if="filteredArtworks.length > 0">
                            <ArtworkCard :artworks="filteredArtworks" />
                        </div>
                        <div v-else class="text-center py-5 bg-white rounded-xl shadow-sm border mt-3">
                            <CIcon name="cil-search" size="xl" class="text-muted mb-3" />
                            <h5 class="text-muted">{{ $i18n.locale === 'en' ? 'No artworks found in this category' : 'ไม่พบผลงานในหมวดหมู่นี้' }}</h5>
                            <p class="text-muted small">{{ $i18n.locale === 'en' ? 'Try changing the search keyword or selecting a different category' : 'ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น' }}</p>
                        </div>
                    </div>
                </CCol>

                <!-- Sidebar Filter (Now on the Right) -->
                <CCol lg="3" class="mb-4">
                    <div class="sidebar-filter sticky-top bg-white p-4 rounded-xl shadow-sm border" style="top: 100px;">
                        <!-- Search Section -->
                        <div class="filter-section mb-5">
                            <h5 class="section-title mb-4">{{ $i18n.locale === 'en' ? 'Search Artworks' : 'ค้นหาผลงาน' }}</h5>
                            <div class="search-box">
                                <input 
                                    type="text" 
                                    v-model="filters.searchQuery"
                                    :placeholder="$i18n.locale === 'en' ? 'Type keyword...' : 'พิมพ์คำค้นหา...'"
                                    class="form-control rounded-pill border-0 shadow-sm px-4 py-3"
                                />
                            </div>
                        </div>

                        <!-- Categories Section -->
                        <div class="filter-section mb-5">
                            <h5 class="section-title mb-4">{{ $i18n.locale === 'en' ? 'Categories' : 'หมวดหมู่' }}</h5>
                            <div class="category-list">
                                <div 
                                    class="category-item d-flex justify-content-between align-items-center p-3 rounded-lg mb-2 transition-all cursor-pointer"
                                    :class="{ 'active shadow': filters.category === 'All Categories' }"
                                    @click="filters.category = 'All Categories'"
                                >
                                    <span class="cat-name">{{ $i18n.locale === 'en' ? 'All Categories' : 'ทั้งหมด' }}</span>
                                    <span class="cat-count">{{ approvedArtworks.length }}</span>
                                </div>
                                
                                <div 
                                    v-for="cat in categories" :key="cat._id"
                                    class="category-item d-flex justify-content-between align-items-center p-3 rounded-xl-sm mb-2 transition-all cursor-pointer"
                                    :class="{ 'active shadow': filters.category === getName($i18n.locale, cat) }"
                                    @click="filters.category = getName($i18n.locale, cat)"
                                >
                                    <span class="cat-name">{{ getName($i18n.locale, cat) }}</span>
                                    <span class="cat-count">{{ getCategoryCount(getName($i18n.locale, cat)) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Price Filter Section (Dynamic Slider) -->
                        <div class="filter-section">
                            <h5 class="section-title mb-4">{{ $i18n.locale === 'en' ? 'Price Range' : 'ช่วงราคา' }}</h5>
                            
                            <div class="price-slider-container px-2">
                                <div class="price-display d-flex justify-content-between mb-3">
                                    <div class="price-box">
                                        <span class="label">{{ $i18n.locale === 'en' ? 'Min' : 'เริ่มต้น' }}</span>
                                        <span class="value">{{ formatPrice(filters.minPrice) }} ฿</span>
                                    </div>
                                    <div class="price-box text-right">
                                        <span class="label">{{ $i18n.locale === 'en' ? 'Max' : 'สูงสุด' }}</span>
                                        <span class="value">{{ formatPrice(filters.maxPrice) }} ฿</span>
                                    </div>
                                </div>

                                <div class="slider-wrapper">
                                    <input 
                                        type="range" 
                                        :min="0" 
                                        :max="maxAvailablePrice" 
                                        step="100" 
                                        v-model.number="filters.minPrice"
                                        class="slider min-slider"
                                    />
                                    <input 
                                        type="range" 
                                        :min="0" 
                                        :max="maxAvailablePrice" 
                                        step="100" 
                                        v-model.number="filters.maxPrice"
                                        class="slider max-slider"
                                    />
                                    <div class="slider-track" :style="trackStyle"></div>
                                </div>
                            </div>

                            <CButton 
                                block 
                                color="light" 
                                variant="outline" 
                                size="sm" 
                                class="mt-4 border-0 text-muted"
                                @click="resetPriceFilter"
                            >
                                {{ $i18n.locale === 'en' ? 'Clear Price Filter' : 'ล้างตัวกรองราคา' }}
                            </CButton>
                        </div>
                    </div>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
import ArtworkCard from './components/card/CardArtworks.vue'
import SectionHeaderArtworks from './components/SectionHeaderArtworks.vue'

export default {
    name: 'Artworks',
    components: {
        ArtworkCard,
        SectionHeaderArtworks
    },
    data() {
        return {
            loading: false,
            filters: {
                searchQuery: '',
                category: 'All Categories',
                minPrice: 0,
                maxPrice: 50000,
                sort: 'Newest'
            },
            categories: [],
            maxAvailablePrice: 50000 // Default, will be updated from data
        }
    },
    created() {
        this.fetchInitialData();
    },
    watch: {
        'filters.minPrice'(val) {
            if (val > this.filters.maxPrice) {
                this.filters.maxPrice = val;
            }
        },
        'filters.maxPrice'(val) {
            if (val < this.filters.minPrice) {
                this.filters.minPrice = val;
            }
        },
        approvedArtworks: {
            handler(val) {
                if (val && val.length > 0) {
                    const max = Math.max(...val.map(art => parseFloat(art.price) || 0), 1000);
                    this.maxAvailablePrice = Math.ceil(max / 1000) * 1000;
                    if (this.filters.maxPrice > this.maxAvailablePrice || this.filters.maxPrice === 50000) {
                        this.filters.maxPrice = this.maxAvailablePrice;
                    }
                }
            },
            immediate: true
        }
    },
    computed: {
        allArtworks() {
            return this.$store.getters['artwork/artworks'] || [];
        },
        approvedArtworks() {
            return this.allArtworks.filter(art => {
                const status = this.getStatusLabel(art);
                return ['Approved', 'Success'].includes(status);
            });
        },
        trackStyle() {
            const minPercent = (this.filters.minPrice / this.maxAvailablePrice) * 100;
            const maxPercent = (this.filters.maxPrice / this.maxAvailablePrice) * 100;
            return {
                left: minPercent + '%',
                width: (maxPercent - minPercent) + '%'
            };
        },
        filteredArtworks() {
            let result = [...this.approvedArtworks];

            // Search Filter
            if (this.filters.searchQuery) {
                const query = this.filters.searchQuery.toLowerCase();
                result = result.filter(art => {
                    const title = this.getName(this.$i18n.locale, art).toLowerCase();
                    const artist = art.artist ? this.getName(this.$i18n.locale, art.artist).toLowerCase() : '';
                    return title.includes(query) || artist.includes(query);
                });
            }

            // Category Filter
            if (this.filters.category && this.filters.category !== 'All Categories') {
                result = result.filter(art => {
                    if (!art.category) return false;
                    const catName = this.getName(this.$i18n.locale, art.category);
                    return catName === this.filters.category;
                });
            }

            // Price Filter (Dynamic Slider)
            result = result.filter(art => {
                const price = parseFloat(art.price) || 0;
                return price >= this.filters.minPrice && price <= this.filters.maxPrice;
            });

            // Sort
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return result;
        }
    },
    methods: {
        async fetchInitialData() {
            this.loading = true;
            try {
                await this.$store.dispatch('artwork/get');
                const cats = await this.$store.dispatch('artwork/category', { method: 'get' });
                this.categories = cats || [];
            } finally {
                this.loading = false;
            }
        },
        getCategoryCount(categoryName) {
            return this.approvedArtworks.filter(art => {
                const catName = art.category ? this.getName(this.$i18n.locale, art.category) : '';
                return catName === categoryName;
            }).length;
        },
        resetPriceFilter() {
            this.filters.minPrice = 0;
            this.filters.maxPrice = this.maxAvailablePrice;
        },
        formatPrice(val) {
            return new Intl.NumberFormat('th-TH').format(val);
        },
        getStatusLabel(art) {
            if (!art || !art.status || !art.status.approval) return 'Pending';
            return this.getName('en', art.status.approval); // Keep EN for internal filtering logic
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

/* Price Slider Styles */
.price-slider-container {
    padding: 10px 0;
}

.price-box {
    flex: 1;
}

.price-box .label {
    display: block;
    font-size: 0.75rem;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 2px;
}

.price-box .value {
    font-size: 1.1rem;
    font-weight: 800;
    color: #4a1d18;
}

.slider-wrapper {
    position: relative;
    height: 30px;
    margin-top: 10px;
}

.slider-track {
    position: absolute;
    height: 6px;
    background: #612721;
    border-radius: 5px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
}

.slider-wrapper::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 6px;
    background: #e9ecef;
    border-radius: 5px;
    top: 50%;
    transform: translateY(-50%);
}

.slider {
    position: absolute;
    width: 100%;
    height: 6px;
    background: none;
    pointer-events: none;
    -webkit-appearance: none;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    margin: 0;
}

/* Chrome, Safari, Opera, Edge */
.slider::-webkit-slider-thumb {
    height: 22px;
    width: 22px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #612721;
    cursor: pointer;
    pointer-events: auto;
    -webkit-appearance: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 15px rgba(0,0,0,0.2);
}

.slider::-webkit-slider-thumb:active {
    background: #612721;
}

/* Firefox */
.slider::-moz-range-thumb {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #612721;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
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
</style>
