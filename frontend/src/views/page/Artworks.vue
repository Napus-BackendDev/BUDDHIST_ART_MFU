<template>
    <div class="artworks-page bg-white min-vh-100 pb-5">
        <!-- Modular Hero Header -->
        <SectionHeaderArtworks />

        <CContainer class="pt-4 mt-2">
            <!-- Filter Toolbar -->
            <div class="filter-toolbar mb-4">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <!-- Search Widget -->
                    <div class="search-widget-wrapper">
                        <div class="search-box-modern">
                            <CIcon name="cil-magnifying-glass" class="search-icon" />
                            <input 
                                type="text" 
                                v-model="filters.searchQuery"
                                :placeholder="$i18n.locale === 'en' ? 'Search artworks or artists...' : 'ค้นหาผลงานหรือศิลปิน...'"
                                class="search-input"
                            />
                        </div>
                    </div>

                    <!-- Price Filter Toggle Button -->
                    <button 
                        @click="showPriceFilter = !showPriceFilter" 
                        class="btn-filter-toggle d-flex align-items-center"
                        :class="{ 'active': showPriceFilter }"
                    >
                        <CIcon name="cil-filter" class="mr-2" />
                        <span>{{ $i18n.locale === 'en' ? 'Price Filter' : 'กรองช่วงราคา' }}</span>
                        <span v-if="filters.minPrice > 0 || filters.maxPrice < maxAvailablePrice" class="active-dot"></span>
                    </button>
                </div>

                <!-- Expandable Price Slider Panel -->
                <transition name="slide-fade">
                    <div v-show="showPriceFilter" class="expandable-filter-panel mt-3 p-4 rounded-xl border">
                        <div class="row align-items-center">
                            <div class="col-md-8 col-sm-12">
                                <div class="price-slider-container">
                                    <div class="price-display d-flex justify-content-between mb-3">
                                        <div class="price-box">
                                            <span class="label">{{ $i18n.locale === 'en' ? 'Min Value' : 'ราคาเริ่มต้น' }}</span>
                                            <span class="value">{{ formatPrice(filters.minPrice) }} ฿</span>
                                        </div>
                                        <div class="price-box text-right">
                                            <span class="label">{{ $i18n.locale === 'en' ? 'Max Value' : 'ราคาสูงสุด' }}</span>
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
                            </div>
                            <div class="col-md-4 col-sm-12 text-md-right mt-3 mt-md-0">
                                <button 
                                    class="btn-clear-price" 
                                    @click="resetPriceFilter"
                                    :disabled="filters.minPrice === 0 && filters.maxPrice === maxAvailablePrice"
                                >
                                    {{ $i18n.locale === 'en' ? 'Reset Range' : 'รีเซ็ตช่วงราคา' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>

            <!-- Horizontal Category Chips -->
            <div class="category-chips-wrapper mb-5">
                <div class="d-flex flex-wrap gap-2 py-2 horizontal-scroll-chips">
                    <!-- "All Categories" chip -->
                    <button 
                        class="chip-item"
                        :class="{ 'active': filters.category === 'All Categories' }"
                        @click="filters.category = 'All Categories'"
                    >
                        <span class="chip-name">{{ $i18n.locale === 'en' ? 'All Categories' : 'ทั้งหมด' }}</span>
                        <span class="chip-count">{{ approvedArtworks.length }}</span>
                    </button>

                    <!-- Dynamic category chips -->
                    <button 
                        v-for="cat in categories" 
                        :key="cat._id"
                        v-if="getCategoryCount(getName($i18n.locale, cat)) > 0"
                        class="chip-item"
                        :class="{ 'active': filters.category === getName($i18n.locale, cat) }"
                        @click="filters.category = getName($i18n.locale, cat)"
                    >
                        <span class="chip-name">{{ getName($i18n.locale, cat) }}</span>
                        <span class="chip-count">{{ getCategoryCount(getName($i18n.locale, cat)) }}</span>
                    </button>
                </div>
            </div>

            <!-- Artwork Content (Full-width Column) -->
            <div class="artworks-content-area">
                <div v-if="loading" class="text-center py-5">
                    <CSpinner color="danger" variant="grow" style="width: 3.5rem; height: 3.5rem;" />
                    <p class="mt-3 text-muted-soft font-weight-light">{{ $i18n.locale === 'en' ? 'Loading artworks...' : 'กำลังโหลดผลงาน...' }}</p>
                </div>
                <div v-else>
                    <div v-if="filteredArtworks.length > 0">
                        <ArtworkCard :artworks="filteredArtworks" :cols="4" />
                    </div>
                    <div v-else class="text-center py-5 no-results-box bg-white mt-3">
                        <CIcon name="cil-magnifying-glass" size="xl" class="text-muted-soft mb-3" />
                        <h4 class="text-dark font-weight-light mb-2">{{ $i18n.locale === 'en' ? 'No artworks found' : 'ไม่พบผลงานศิลปะ' }}</h4>
                        <p class="text-muted small max-w-sm mx-auto">
                            {{ $i18n.locale === 'en' ? 'Try changing your search keywords or resetting price filter.' : 'ลองเปลี่ยนคำค้นหาหรือรีเซ็ตการกรองราคาเพื่อค้นหาผลงาน' }}
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Quick Back to Top Button -->
            <button 
                v-show="showBackToTop" 
                @click="scrollToTop" 
                class="btn-back-to-top shadow-lg d-flex align-items-center justify-content-center"
                title="Back to Top"
            >
                <CIcon name="cil-arrow-top" size="lg" />
            </button>
        </CContainer>
    </div>
</template>

<script>
import ArtworkCard from '@/components/CardArtwork.vue'
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
            showPriceFilter: false,
            showBackToTop: false,
            filters: {
                searchQuery: '',
                category: 'All Categories',
                minPrice: 0,
                maxPrice: 50000,
                sort: 'Newest'
            },
            categories: [],
            maxAvailablePrice: 50000, // Default, will be updated from data
            polling: null
        }
    },
    created() {
        this.fetchInitialData();
    },
    mounted() {
        this.polling = setInterval(() => {
            this.$store.dispatch('artwork/get');
        }, 5000);
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeDestroy() {
        if (this.polling) {
            clearInterval(this.polling);
        }
        window.removeEventListener('scroll', this.handleScroll);
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
                return ['Approved', 'Success', 'Reserved'].includes(status);
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
                
                if (this.$route.query.category) {
                    this.filters.category = this.$route.query.category;
                }
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
        },
        handleScroll() {
            this.showBackToTop = window.scrollY > 400;
        },
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
}
</script>

<style scoped>
/* Minimalist Grid Redesign Styles */

.artworks-page {
    background-color: #ffffff; /* Pure white background */
    font-family: 'Outfit', 'Inter', 'Sarabun', sans-serif;
}

/* Toolbar Layout */
.filter-toolbar {
    position: relative;
    z-index: 100;
}

.search-widget-wrapper {
    flex-grow: 1;
    max-width: 450px;
    min-width: 280px;
}

.search-box-modern {
    display: flex;
    align-items: center;
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
}

.search-input::placeholder {
    color: #9ca3af;
}

/* Filter Toggle Button */
.btn-filter-toggle {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    padding: 10px 24px;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #4b5563;
    height: 52px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.btn-filter-toggle:hover {
    border-color: #4a1d18;
    color: #4a1d18;
    background: rgba(74, 29, 24, 0.02);
}

.btn-filter-toggle.active {
    background: #4a1d18;
    border-color: #4a1d18;
    color: #ffffff;
}

.active-dot {
    position: absolute;
    top: 6px;
    right: 12px;
    width: 8px;
    height: 8px;
    background-color: #ea580c;
    border-radius: 50%;
    border: 1.5px solid #ffffff;
}

.btn-filter-toggle.active .active-dot {
    border-color: #4a1d18;
}

/* Expandable filter panel */
.expandable-filter-panel {
    background: #ffffff;
    border: 1px solid #f1f5f9;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.03);
    border-radius: 20px;
    animation: slideDown 0.3s ease;
}

.btn-clear-price {
    background: transparent;
    border: 1px solid #e5e7eb;
    padding: 10px 24px;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-clear-price:hover:not(:disabled) {
    border-color: #dc2626;
    color: #dc2626;
    background: rgba(220, 38, 38, 0.02);
}

.btn-clear-price:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Price Slider Styles */
.price-slider-container {
    padding: 5px 0;
}

.price-box .label {
    display: block;
    font-size: 0.72rem;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
}

.price-box .value {
    font-size: 1.15rem;
    font-weight: 700;
    color: #4a1d18;
}

.slider-wrapper {
    position: relative;
    height: 24px;
    margin-top: 8px;
}

.slider-track {
    position: absolute;
    height: 4px;
    background: #4a1d18;
    border-radius: 5px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
}

.slider-wrapper::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 4px;
    background: #f3f4f6;
    border-radius: 5px;
    top: 50%;
    transform: translateY(-50%);
}

.slider {
    position: absolute;
    width: 100%;
    height: 4px;
    background: none;
    pointer-events: none;
    -webkit-appearance: none;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    margin: 0;
}

.slider::-webkit-slider-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #4a1d18;
    cursor: pointer;
    pointer-events: auto;
    -webkit-appearance: none;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    background: #4a1d18;
}

.slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #4a1d18;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

/* Category Chips Styles */
.category-chips-wrapper {
    overflow-x: auto;
    scrollbar-width: none; /* Hide scrollbar for Firefox */
}

.category-chips-wrapper::-webkit-scrollbar {
    display: none; /* Hide scrollbar for Chrome/Safari */
}

.horizontal-scroll-chips {
    flex-wrap: nowrap !important;
    display: flex;
}

.chip-item {
    display: inline-flex;
    align-items: center;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    padding: 8px 20px;
    border-radius: 50px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #4b5563;
    font-weight: 500;
    font-size: 0.9rem;
    height: 40px;
    outline: none;
}

.chip-item:hover {
    border-color: #4a1d18;
    color: #4a1d18;
}

.chip-item.active {
    background: #4a1d18;
    border-color: #4a1d18;
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(74, 29, 24, 0.15);
}

.chip-count {
    font-size: 0.72rem;
    font-weight: 700;
    background: #f3f4f6;
    color: #6b7280;
    border-radius: 50px;
    padding: 2px 8px;
    margin-left: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.chip-item.active .chip-count {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
}

/* No Results */
.no-results-box {
    border: 1px dashed #e5e7eb;
    border-radius: 24px;
    padding: 60px 20px;
}

.text-muted-soft {
    color: #d1d5db;
}

/* Animations */
.slide-fade-enter-active {
    transition: all 0.3s ease;
}
.slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 1rem; }

@media (max-width: 768px) {
    .search-widget-wrapper {
        max-width: 100%;
    }
}

/* Quick Back to Top Button */
.btn-back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #4a1d18;
    color: #ffffff;
    border: none;
    cursor: pointer;
    z-index: 1000;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}

.btn-back-to-top:hover {
    background-color: #612721;
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(74, 29, 24, 0.3) !important;
}

.btn-back-to-top:active {
    transform: translateY(-1px);
}
</style>
