<template>
    <div class="artworks-page min-vh-100 pb-5">
        <!-- Modular Hero Header -->
        <SectionHeaderArtworks
            :variant="archiveMode ? 'archive' : 'artworks'"
            :badge="archiveMode ? ($i18n.locale === 'en' ? 'BUDDHIST ART ARCHIVE' : 'คลังผลงานย้อนหลัง') : 'BUDDHIST ART SPACE'"
            :title-lead="archiveMode ? ($i18n.locale === 'en' ? 'Art' : 'คลังผลงาน') : ($i18n.locale === 'en' ? 'Artwork' : 'ผลงาน')"
            :title-highlight="archiveMode ? ($i18n.locale === 'en' ? 'Archive' : 'Art Archive') : ($i18n.locale === 'en' ? 'Collection' : 'ศิลปะ')"
            :description="heroDescription"
        />

        <CContainer class="pt-5 mt-2" ref="artworksContainer">
            <div class="row">
                <!-- Left Column: Classic Sidebar Filters (Matching Image 2) -->
                <div class="col-lg-3 col-md-4 mb-5">
                    <aside class="sidebar-filter-wrapper">
                        <!-- 1. Search Box -->
                        <div class="sidebar-search-box mb-5">
                            <div class="search-input-group">
                                <input 
                                    type="text" 
                                    v-model="filters.searchQuery"
                                    :aria-label="$i18n.locale === 'en' ? 'Search artworks' : 'ค้นหาผลงาน'"
                                    :placeholder="$i18n.locale === 'en' ? 'Search...' : 'ค้นหาผลงาน...'"
                                    class="sidebar-search-input"
                                />
                                <button type="button" class="sidebar-search-btn" :aria-label="$i18n.locale === 'en' ? 'Search artworks' : 'ค้นหาผลงาน'">
                                    <CIcon name="cil-magnifying-glass" />
                                </button>
                            </div>
                        </div>

                        <!-- 2. FILTER BY PRICE -->
                        <div v-if="!archiveMode" class="sidebar-filter-section mb-4" :class="{ 'is-collapsed': collapsedSections.priceSlider }">
                            <button type="button" class="filter-section-header" :aria-expanded="!collapsedSections.priceSlider" @click="toggleSection('priceSlider')">
                                <span class="filter-section-heading mb-0">{{ $i18n.locale === 'en' ? 'FILTER BY PRICE' : 'กรองตามราคา' }}</span>
                                <div class="filter-toggle-btn" :title="collapsedSections.priceSlider ? ($i18n.locale === 'en' ? 'Expand' : 'ขยาย') : ($i18n.locale === 'en' ? 'Collapse' : 'ย่อ')">
                                    <svg class="filter-collapse-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </button>
                            <div class="filter-heading-divider"></div>

                            <div v-show="!collapsedSections.priceSlider" class="filter-content-wrapper">
                                <div class="price-slider-box">
                                    <div class="slider-wrapper">
                                        <input 
                                            type="range" 
                                            :min="0" 
                                            :max="maxAvailablePrice" 
                                            step="100" 
                                            v-model.number="tempMinPrice"
                                            :aria-label="$i18n.locale === 'en' ? 'Minimum price' : 'ราคาต่ำสุด'"
                                            class="slider min-slider"
                                        />
                                        <input 
                                            type="range" 
                                            :min="0" 
                                            :max="maxAvailablePrice" 
                                            step="100" 
                                            v-model.number="tempMaxPrice"
                                            :aria-label="$i18n.locale === 'en' ? 'Maximum price' : 'ราคาสูงสุด'"
                                            class="slider max-slider"
                                        />
                                        <div class="slider-track" :style="trackStyle"></div>
                                    </div>

                                    <div class="price-action-row d-flex align-items-center justify-content-between mt-3 pt-1">
                                        <button type="button" class="btn-filter-action" @click="applyPriceFilter">
                                            {{ $i18n.locale === 'en' ? 'FILTER' : 'กรองราคา' }}
                                        </button>
                                        <div class="price-display-text">
                                            <span class="price-label">{{ $i18n.locale === 'en' ? 'Price:' : 'ราคา:' }}</span>
                                            <strong>฿{{ formatPrice(tempMinPrice) }} — ฿{{ formatPrice(tempMaxPrice) }}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 3. FILTER BY RANGE -->
                        <div v-if="!archiveMode" class="sidebar-filter-section mb-4" :class="{ 'is-collapsed': collapsedSections.priceRange }">
                            <button type="button" class="filter-section-header" :aria-expanded="!collapsedSections.priceRange" @click="toggleSection('priceRange')">
                                <span class="filter-section-heading mb-0">{{ $i18n.locale === 'en' ? 'FILTER BY RANGE' : 'ช่วงราคา' }}</span>
                                <div class="filter-toggle-btn" :title="collapsedSections.priceRange ? ($i18n.locale === 'en' ? 'Expand' : 'ขยาย') : ($i18n.locale === 'en' ? 'Collapse' : 'ย่อ')">
                                    <svg class="filter-collapse-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </button>
                            <div class="filter-heading-divider"></div>

                            <div v-show="!collapsedSections.priceRange" class="filter-content-wrapper">
                                <div class="filter-list-items">
                                    <button type="button"
                                        v-for="bracket in priceBrackets" 
                                        :key="bracket.key"
                                        class="filter-list-item"
                                        :class="{ 'active': activePriceBracket === bracket.key }"
                                        @click="selectPriceBracket(bracket)"
                                    >
                                        <span class="item-title">฿ {{ bracket.label }}</span>
                                        <span class="item-count">({{ bracket.count }})</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 4. ARTWORKS BY STYLE (Categories) -->
                        <div class="sidebar-filter-section mb-4" :class="{ 'is-collapsed': collapsedSections.style }">
                            <button type="button" class="filter-section-header" :aria-expanded="!collapsedSections.style" @click="toggleSection('style')">
                                <span class="filter-section-heading mb-0">{{ $i18n.locale === 'en' ? 'ARTWORKS BY STYLE' : 'หมวดหมู่ผลงาน' }}</span>
                                <div class="filter-toggle-btn" :title="collapsedSections.style ? ($i18n.locale === 'en' ? 'Expand' : 'ขยาย') : ($i18n.locale === 'en' ? 'Collapse' : 'ย่อ')">
                                    <svg class="filter-collapse-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </button>
                            <div class="filter-heading-divider"></div>

                            <div v-show="!collapsedSections.style" class="filter-content-wrapper">
                                <div class="filter-list-items">
                                    <button type="button"
                                        class="filter-list-item"
                                        :class="{ 'active': filters.category === 'All Categories' }"
                                        @click="filters.category = 'All Categories'"
                                    >
                                        <span class="item-title">{{ $i18n.locale === 'en' ? 'All Styles' : 'ทั้งหมด' }}</span>
                                        <span class="item-count">({{ approvedArtworks.length }})</span>
                                    </button>
                                    <button type="button"
                                        v-for="cat in categories" 
                                        v-if="getCategoryCount(getName($i18n.locale, cat)) > 0" 
                                        :key="cat._id"
                                        class="filter-list-item"
                                        :class="{ 'active': filters.category === getName($i18n.locale, cat) }"
                                        @click="toggleCategory(getName($i18n.locale, cat))"
                                    >
                                        <span class="item-title">{{ getName($i18n.locale, cat) }}</span>
                                        <span class="item-count">({{ getCategoryCount(getName($i18n.locale, cat)) }})</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 5. FILTER BY COHORT (รุ่น / รอบส่งผลงาน) -->
                        <div class="sidebar-filter-section mb-4" v-if="cohortOptions.length > 0" :class="{ 'is-collapsed': collapsedSections.cohort }">
                            <button type="button" class="filter-section-header" :aria-expanded="!collapsedSections.cohort" @click="toggleSection('cohort')">
                                <span class="filter-section-heading mb-0">{{ $i18n.locale === 'en' ? 'FILTER BY COHORT' : 'รุ่น / รอบส่งผลงาน' }}</span>
                                <div class="filter-toggle-btn" :title="collapsedSections.cohort ? ($i18n.locale === 'en' ? 'Expand' : 'ขยาย') : ($i18n.locale === 'en' ? 'Collapse' : 'ย่อ')">
                                    <svg class="filter-collapse-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </button>
                            <div class="filter-heading-divider"></div>

                            <div v-show="!collapsedSections.cohort" class="filter-content-wrapper">
                                <div class="filter-list-items">
                                    <button type="button"
                                        class="filter-list-item"
                                        :class="{ 'active': filters.cohort === 'all' }"
                                        @click="filters.cohort = 'all'"
                                    >
                                        <span class="item-title">{{ $i18n.locale === 'en' ? 'All Cohorts' : 'ทุกรุ่น' }}</span>
                                        <span class="item-count">({{ approvedArtworks.length }})</span>
                                    </button>
                                    <button type="button"
                                        v-for="cohort in cohortOptions" 
                                        :key="cohort.key"
                                        class="filter-list-item"
                                        :class="{ 'active': filters.cohort === cohort.key }"
                                        @click="toggleCohort(cohort.key)"
                                    >
                                        <span class="item-title">{{ formatCohortLabel(cohort) }}</span>
                                        <span class="item-count">({{ cohort.artworkCount }})</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Reset All Filters Button -->
                        <div class="sidebar-reset-block mt-4" v-if="hasActiveFilters">
                            <button type="button" class="btn-reset-all w-100" @click="resetAllFilters">
                                <CIcon name="cil-reload" size="sm" class="mr-2" />
                                {{ $i18n.locale === 'en' ? 'Reset All Filters' : 'ล้างตัวกรองทั้งหมด' }}
                            </button>
                        </div>
                    </aside>
                </div>

                <!-- Right Column: Artworks Grid, Toolbar & Pagination -->
                <div class="col-lg-9 col-md-8">
                    <!-- Top Toolbar for Sort & Active Badges -->
                    <div class="catalog-top-bar d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <!-- Result Count -->
                        <div class="results-meta mb-2 mb-sm-0">
                            <span class="results-count-text">
                                {{ $i18n.locale === 'en' ? 'Showing ' : 'แสดง ' }}
                                <strong class="text-dark">{{ filteredArtworks.length ? (currentPage - 1) * itemsPerPage + 1 : 0 }}-{{ Math.min(currentPage * itemsPerPage, filteredArtworks.length) }}</strong>
                                {{ $i18n.locale === 'en' ? ' of ' : ' จากทั้งหมด ' }}
                                <strong class="text-dark">{{ filteredArtworks.length }}</strong>
                                {{ $i18n.locale === 'en' ? ' artworks' : ' ผลงาน' }}
                            </span>
                        </div>

                        <!-- Sort Dropdown -->
                        <div class="sort-selector-wrapper d-flex align-items-center">
                            <span class="sort-label mr-2 text-muted small text-uppercase font-weight-bold">
                                {{ $i18n.locale === 'en' ? 'Sort by:' : 'เรียงลำดับ:' }}
                            </span>
                            <select v-model="filters.sort" class="custom-sort-select" :aria-label="$i18n.locale === 'en' ? 'Sort artworks' : 'เรียงลำดับผลงาน'">
                                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                                    {{ $i18n.locale === 'en' ? option.en : option.th }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Artworks Content Area -->
                    <div class="artworks-content-area">
                        <div v-if="loading" class="text-center py-5">
                            <CSpinner color="danger" variant="grow" style="width: 3.5rem; height: 3.5rem;" />
                            <p class="mt-3 text-muted font-weight-light">{{ $i18n.locale === 'en' ? 'Loading artworks...' : 'กำลังโหลดผลงาน...' }}</p>
                        </div>
                        <div v-else-if="loadError" class="text-center py-5 bg-white rounded-xl border" role="alert">
                            <h4>{{ $i18n.locale === 'en' ? 'Unable to load artworks' : 'โหลดข้อมูลผลงานไม่สำเร็จ' }}</h4>
                            <p>{{ loadErrorMessage }}</p>
                            <button type="button" class="btn-reset-all px-4 py-2" :disabled="retryAt > retryNow" @click="fetchInitialData">
                                {{ retryAt > retryNow ? ($i18n.locale === 'en' ? 'Please wait before retrying' : 'กรุณารอก่อนลองใหม่') : ($i18n.locale === 'en' ? 'Try again' : 'ลองใหม่') }}
                            </button>
                        </div>
                        <div v-else>
                            <div v-if="paginatedArtworks.length > 0">
                                <ArtworkCard :artworks="paginatedArtworks" :cols="3" :archive-mode="archiveMode" />

                                <!-- Pagination Component -->
                                <div v-if="totalPages > 1" class="pagination-wrapper mt-5 pt-3 d-flex flex-column flex-sm-row justify-content-between align-items-center">
                                    <div class="pagination-info text-muted small mb-3 mb-sm-0">
                                        {{ $i18n.locale === 'en' ? 'Page' : 'หน้า' }} 
                                        <strong class="text-dark">{{ currentPage }}</strong> / <strong class="text-dark">{{ totalPages }}</strong>
                                        ({{ filteredArtworks.length }} {{ $i18n.locale === 'en' ? 'artworks in total' : 'ผลงานทั้งหมด' }})
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
                            <div v-else class="text-center py-5 no-results-box bg-white mt-3 rounded-xl border p-5">
                                <CIcon name="cil-magnifying-glass" size="xl" class="text-muted-soft mb-3" />
                                <h4 class="text-dark font-weight-bold mb-2">
                                    {{ archiveMode && !hasActiveFilters
                                        ? ($i18n.locale === 'en' ? 'No archived artworks yet' : 'ยังไม่มีผลงานในคลัง Archive')
                                        : ($i18n.locale === 'en' ? 'No artworks found' : 'ไม่พบผลงานศิลปะ') }}
                                </h4>
                                <p class="text-muted small max-w-sm mx-auto mb-4">
                                    {{ archiveMode && !hasActiveFilters
                                        ? ($i18n.locale === 'en' ? 'Artworks from closed submissions appear here automatically 1 year after submission closing.' : 'ผลงานจากระบบส่งงานที่ปิดครบ 1 ปีจะย้ายมาจัดเก็บที่หน้านี้โดยอัตโนมัติ')
                                        : ($i18n.locale === 'en' ? 'Try adjusting your search criteria or resetting filters.' : 'ลองเปลี่ยนคำค้นหาหรือรีเซ็ตตัวกรองเพื่อค้นหาผลงาน') }}
                                </p>
                                <router-link v-if="archiveMode && !hasActiveFilters" to="/artworks" class="btn-reset-all px-4 py-2 d-inline-block text-decoration-none">
                                    {{ $i18n.locale === 'en' ? 'Browse Active Artworks' : 'กลับสู่หน้าผลงานศิลปะ' }}
                                </router-link>
                                <button v-else type="button" class="btn-reset-all px-4 py-2" @click="resetAllFilters">
                                    {{ $i18n.locale === 'en' ? 'Reset All Filters' : 'ล้างตัวกรองทั้งหมด' }}
                                </button>
                            </div>
                        </div>
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
import { retryAtFromHeaders } from '@/utils/rateLimit'
import { getArtworkCohortLevel, isArtworkArchived } from '@/utils/artworkPurchase'

export default {
    name: 'Artworks',
    components: {
        ArtworkCard,
        SectionHeaderArtworks
    },
    props: {
        archiveMode: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            loading: false,
            loadError: '',
            retryAt: 0,
            retryNow: 0,
            retryTimer: null,
            showBackToTop: false,
            activePriceBracket: null,
            tempMinPrice: 0,
            tempMaxPrice: 50000,
            currentPage: 1,
            itemsPerPage: 15,
            filters: {
                searchQuery: '',
                category: 'All Categories',
                cohort: 'all',
                minPrice: 0,
                maxPrice: 50000,
                sort: 'newest'
            },
            categories: [],
            submissions: [],
            sortOptions: [
                { value: 'newest', th: 'ใหม่ล่าสุด', en: 'Newest first', icon: 'cil-arrow-top' },
                { value: 'oldest', th: 'เก่าที่สุด', en: 'Oldest first', icon: 'cil-arrow-bottom' },
                { value: 'mostPeople', th: 'คนเยอะสุด', en: 'Most participants', icon: 'cil-people' },
                { value: 'fewestPeople', th: 'คนน้อยสุด', en: 'Fewest participants', icon: 'cil-user' }
            ],
            maxAvailablePrice: 50000,
            polling: null,
            collapsedSections: {
                priceSlider: false,
                priceRange: false,
                style: false,
                cohort: false
            }
        }
    },
    created() {
        this.fetchInitialData();
        this.checkMobileCollapse();
    },
    mounted() {
        this.polling = setInterval(() => {
            this.refreshArtworks();
        }, 5000);
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.onWindowResize);
    },
    beforeDestroy() {
        clearTimeout(this.retryTimer);
        if (this.polling) {
            clearInterval(this.polling);
        }
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.onWindowResize);
    },
    watch: {
        'tempMinPrice'(val) {
            if (val > this.tempMaxPrice) {
                this.tempMaxPrice = val;
            }
        },
        'tempMaxPrice'(val) {
            if (val < this.tempMinPrice) {
                this.tempMinPrice = val;
            }
        },
        'filters.searchQuery'() {
            this.currentPage = 1;
        },
        'filters.category'() {
            this.currentPage = 1;
        },
        'filters.cohort'() {
            this.currentPage = 1;
        },
        'filters.minPrice'() {
            this.currentPage = 1;
        },
        'filters.maxPrice'() {
            this.currentPage = 1;
        },
        'filters.sort'() {
            this.currentPage = 1;
        },
        activePriceBracket() {
            this.currentPage = 1;
        },
        totalPages(newTotal) {
            if (this.currentPage > newTotal && newTotal > 0) {
                this.currentPage = newTotal;
            }
        },
        approvedArtworks: {
            handler(val) {
                if (val && val.length > 0) {
                    const max = Math.max(...val.map(art => parseFloat(art.price) || 0), 1000);
                    this.maxAvailablePrice = Math.ceil(max / 1000) * 1000;
                    if (this.filters.maxPrice > this.maxAvailablePrice || this.filters.maxPrice === 50000) {
                        this.filters.maxPrice = this.maxAvailablePrice;
                        this.tempMaxPrice = this.maxAvailablePrice;
                    }
                }
            },
            immediate: true
        },
        '$route.query': {
            handler(query) {
                if (query.search !== undefined) {
                    this.filters.searchQuery = query.search || '';
                } else {
                    this.filters.searchQuery = '';
                }
                if (query.category !== undefined) {
                    this.filters.category = query.category || 'All Categories';
                } else {
                    this.filters.category = 'All Categories';
                }
                if (query.cohort !== undefined) {
                    this.filters.cohort = query.cohort || 'all';
                } else {
                    this.filters.cohort = 'all';
                }
                if (query.sort !== undefined && this.sortOptions.some(option => option.value === query.sort)) {
                    this.filters.sort = query.sort;
                } else if (query.sort === undefined) {
                    this.filters.sort = 'newest';
                }
            },
            deep: true,
            immediate: true
        }
    },
    computed: {
        heroDescription() {
            const isEn = this.$i18n && this.$i18n.locale === 'en';
            if (this.archiveMode) {
                return isEn
                    ? 'Certified artwork archive of graduates from MFU’s Buddhist Art short-course program, from Cohort 1 to the present.'
                    : 'ฐานข้อมูลผลงานรับรองของผู้สำเร็จการศึกษาหลักสูตรระยะสั้น พุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง ตั้งแต่รุ่นที่ 1 ถึงรุ่นปัจจุบัน';
            }
            return isEn
                ? 'Current Buddhist Art short-course cohort works held as joint IP between learners and Mae Fah Luang University (1 year post-graduation). Net proceeds support creators (60%) and the Program Fund for future learners (40%).'
                : 'ผลงานสร้างสรรค์หลักสูตรระยะสั้น พุทธศิลปกรรม รุ่นปัจจุบัน ทรัพย์สินทางปัญญาร่วมผู้เรียนและมหาวิทยาลัยแม่ฟ้าหลวง (ต่อเนื่อง 1 ปีหลังสำเร็จการศึกษา) จัดสรรสุทธิผู้สร้างสรรค์ 60% และกองทุนหลักสูตรฯ 40% เพื่อทุนรุ่นต่อไป';
        },
        loadErrorMessage() {
            if (this.loadError === 'rateLimit') {
                return this.$i18n.locale === 'en' ? 'Too many requests. Please wait before retrying.' : 'มีคำขอถี่เกินกำหนด กรุณารอก่อนลองใหม่';
            }
            return this.$i18n.locale === 'en'
                ? 'The server could not load the data. Please try again later.'
                : 'ระบบไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่ภายหลัง';
        },
        allArtworks() {
            return this.$store.getters['artwork/artworks'] || [];
        },
        approvedArtworks() {
            return this.allArtworks.filter(art => {
                const status = this.getStatusLabel(art);
                if (!['Approved', 'Success', 'Reserved'].includes(status)) return false;
                const archived = isArtworkArchived(art, this.getName);
                return this.archiveMode ? archived : !archived;
            });
        },
        priceBrackets() {
            const brackets = [
                { key: '0-5000', min: 0, max: 5000, label: '0 – 5,000' },
                { key: '5001-10000', min: 5001, max: 10000, label: '5,001 – 10,000' },
                { key: '10001-30000', min: 10001, max: 30000, label: '10,001 – 30,000' },
                { key: '30001-50000', min: 30001, max: 50000, label: '30,001 – 50,000' },
                { key: '50001-100000', min: 50001, max: 100000, label: '50,001 – 100,000' },
                { key: '100001+', min: 100001, max: 99999999, label: '100,001 +' }
            ];

            return brackets.map(b => {
                const count = this.approvedArtworks.filter(art => {
                    const p = parseFloat(art.price) || 0;
                    return p >= b.min && p <= b.max;
                }).length;
                return {
                    ...b,
                    count
                };
            });
        },
        cohortOptions() {
            const cohorts = new Map();

            this.approvedArtworks.forEach(artwork => {
                const key = this.getCohortKey(artwork);
                if (!cohorts.has(key)) {
                    cohorts.set(key, {
                        key,
                        academicYear: this.getAcademicYear(artwork),
                        courseLevel: this.getCourseLevel(artwork),
                        artworkCount: 0,
                        participantIds: new Set(),
                        participantCount: 0,
                        sortValue: this.getCohortSortValue(artwork)
                    });
                }
                const cohortEntry = cohorts.get(key);
                cohortEntry.artworkCount += 1;
                cohortEntry.sortValue = Math.max(cohortEntry.sortValue, this.getCohortSortValue(artwork));
            });

            this.submissions.forEach(submission => {
                const cohort = cohorts.get(this.getCohortKey(submission));
                if (!cohort) return;

                this.getParticipantIds(submission).forEach(id => cohort.participantIds.add(id));
                cohort.sortValue = Math.max(cohort.sortValue, this.getCohortSortValue(submission));
            });

            return Array.from(cohorts.values())
                .map(cohort => ({
                    ...cohort,
                    participantCount: cohort.participantIds.size
                }))
                .sort((a, b) => {
                    if (a.key === 'independent' && b.key !== 'independent') return 1;
                    if (b.key === 'independent' && a.key !== 'independent') return -1;
                    return b.sortValue - a.sortValue;
                });
        },
        cohortMap() {
            return this.cohortOptions.reduce((map, cohort) => {
                map[cohort.key] = cohort;
                return map;
            }, {});
        },
        trackStyle() {
            const minPercent = (this.tempMinPrice / this.maxAvailablePrice) * 100;
            const maxPercent = (this.tempMaxPrice / this.maxAvailablePrice) * 100;
            return {
                left: Math.max(0, minPercent) + '%',
                width: Math.max(0, maxPercent - minPercent) + '%'
            };
        },
        hasActiveFilters() {
            return (
                (this.filters.searchQuery && this.filters.searchQuery.trim() !== '') ||
                this.filters.category !== 'All Categories' ||
                this.filters.cohort !== 'all' ||
                (!this.archiveMode && (
                    this.filters.minPrice > 0 ||
                    this.filters.maxPrice < this.maxAvailablePrice ||
                    this.activePriceBracket !== null
                ))
            );
        },
        filteredArtworks() {
            let result = [...this.approvedArtworks];

            // Search Filter
            if (this.filters.searchQuery) {
                const query = this.filters.searchQuery.trim().toLowerCase();
                result = result.filter(art => {
                    const labels = ['th', 'en'].flatMap(locale => [this.getName(locale, art), art.artist ? this.getName(locale, art.artist) : '']);
                    return [...labels, art.artworkPiece, art.artworkCode].some(value => String(value || '').toLowerCase().includes(query));
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

            // Submission cohort filter
            if (this.filters.cohort && this.filters.cohort !== 'all') {
                result = result.filter(art => this.getCohortKey(art) === this.filters.cohort);
            }

            // Price Filter (Dynamic Slider) - skipped in Archive mode
            if (!this.archiveMode) {
                result = result.filter(art => {
                    const price = parseFloat(art.price) || 0;
                    return price >= this.filters.minPrice && price <= this.filters.maxPrice;
                });
            }

            // Sort by cohort age or participant count
            result.sort((a, b) => {
                const cohortA = this.cohortMap[this.getCohortKey(a)] || {};
                const cohortB = this.cohortMap[this.getCohortKey(b)] || {};

                if (this.filters.sort === 'oldest') {
                    return this.getCohortSortValue(a) - this.getCohortSortValue(b);
                }
                if (this.filters.sort === 'mostPeople' || this.filters.sort === 'fewestPeople') {
                    const peopleDifference = (cohortB.participantCount || 0) - (cohortA.participantCount || 0);
                    if (peopleDifference !== 0) {
                        return this.filters.sort === 'mostPeople' ? peopleDifference : -peopleDifference;
                    }
                } else {
                    const dateDifference = this.getCohortSortValue(b) - this.getCohortSortValue(a);
                    if (dateDifference !== 0) return dateDifference;
                }

                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });

            return result;
        },
        totalPages() {
            return Math.ceil(this.filteredArtworks.length / this.itemsPerPage) || 1;
        },
        paginatedArtworks() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredArtworks.slice(start, end);
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
        async fetchInitialData() {
            if (this.loading || Date.now() < this.retryAt) return;
            this.loading = true;
            this.loadError = '';
            try {
                await this.$store.dispatch('artwork/get');
                const [cats, submissions] = await Promise.all([
                    this.$store.dispatch('artwork/category', { method: 'get' }),
                    this.$store.dispatch('submission/get')
                ]);
                this.categories = cats || [];
                this.submissions = submissions || [];
                
                if (this.$route.query.category) {
                    this.filters.category = this.$route.query.category;
                }
                if (this.$route.query.search) {
                    this.filters.searchQuery = this.$route.query.search;
                }
            } catch (error) {
                this.handleLoadError(error);
            } finally {
                this.loading = false;
            }
        },
        handleLoadError(error) {
            const response = error.response || {};
            this.loadError = 'server';
            if (response.status === 429) {
                this.retryAt = retryAtFromHeaders(response.headers);
                this.loadError = 'rateLimit';
                clearTimeout(this.retryTimer);
                this.retryNow = Date.now();
                this.retryTimer = setTimeout(() => { this.retryNow = Date.now(); }, Math.max(0, this.retryAt - Date.now()));
            }
        },
        async refreshArtworks() {
            if (this.loading || this.loadError || Date.now() < this.retryAt || document.hidden) return;
            try {
                await this.$store.dispatch('artwork/get');
            } catch (error) {
                this.handleLoadError(error);
            }
        },
        goToPage(page) {
            if (page < 1 || page > this.totalPages || page === this.currentPage) return;
            this.currentPage = page;
            this.scrollToArtworksTop();
        },
        scrollToArtworksTop() {
            const container = this.$refs.artworksContainer;
            if (container && container.$el) {
                container.$el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (container) {
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 350, behavior: 'smooth' });
            }
        },
        toggleCategory(categoryName) {
            if (this.filters.category === categoryName) {
                this.filters.category = 'All Categories';
            } else {
                this.filters.category = categoryName;
            }
        },
        toggleCohort(cohortKey) {
            if (this.filters.cohort === cohortKey) {
                this.filters.cohort = 'all';
            } else {
                this.filters.cohort = cohortKey;
            }
        },
        selectPriceBracket(bracket) {
            if (this.activePriceBracket === bracket.key) {
                this.activePriceBracket = null;
                this.filters.minPrice = 0;
                this.filters.maxPrice = this.maxAvailablePrice;
                this.tempMinPrice = 0;
                this.tempMaxPrice = this.maxAvailablePrice;
            } else {
                this.activePriceBracket = bracket.key;
                this.filters.minPrice = bracket.min;
                this.filters.maxPrice = Math.min(bracket.max, this.maxAvailablePrice);
                this.tempMinPrice = bracket.min;
                this.tempMaxPrice = Math.min(bracket.max, this.maxAvailablePrice);
            }
        },
        applyPriceFilter() {
            this.activePriceBracket = null;
            this.filters.minPrice = this.tempMinPrice;
            this.filters.maxPrice = this.tempMaxPrice;
        },
        resetPriceFilter() {
            this.activePriceBracket = null;
            this.filters.minPrice = 0;
            this.filters.maxPrice = this.maxAvailablePrice;
            this.tempMinPrice = 0;
            this.tempMaxPrice = this.maxAvailablePrice;
        },
        resetAllFilters() {
            this.filters.searchQuery = '';
            this.filters.category = 'All Categories';
            this.filters.cohort = 'all';
            this.filters.sort = 'newest';
            this.resetPriceFilter();
        },
        getBracketLabel(key) {
            const bracket = this.priceBrackets.find(b => b.key === key);
            return bracket ? bracket.label : '';
        },
        getCategoryCount(categoryName) {
            return this.approvedArtworks.filter(art => {
                const catName = art.category ? this.getName(this.$i18n.locale, art.category) : '';
                return catName === categoryName;
            }).length;
        },
        getAcademicYear(item) {
            return String(item && item.academicYear || '').trim();
        },
        getCourseLevel(item) {
            return getArtworkCohortLevel(item);
        },
        getCohortKey(item) {
            const academicYear = this.getAcademicYear(item);
            const courseLevel = this.getCourseLevel(item);
            if (!courseLevel) return 'independent';
            return `${academicYear || 'unknown'}|${courseLevel}`;
        },
        getParticipantIds(submission) {
            const participants = [
                ...(Array.isArray(submission && submission.artist) ? submission.artist : []),
                ...((submission && submission.assignments) || []).reduce((ids, assignment) => {
                    return ids.concat(Array.isArray(assignment.artist) ? assignment.artist : []);
                }, [])
            ];

            return participants
                .map(participant => {
                    if (participant && typeof participant === 'object') {
                        return participant._id || participant.id;
                    }
                    return participant;
                })
                .filter(Boolean)
                .map(String);
        },
        getCohortSortValue(item) {
            const academicYear = parseInt(this.getAcademicYear(item), 10);
            const courseLevel = parseInt(this.getCourseLevel(item), 10);
            if (!Number.isNaN(academicYear)) {
                return (academicYear * 1000) + (Number.isNaN(courseLevel) ? 0 : courseLevel);
            }

            const date = item && (item.createdAt || (item.create && item.create.at));
            const timestamp = date ? new Date(date).getTime() : 0;
            if (Number.isNaN(timestamp) || !timestamp) return 0;

            const createdAt = new Date(timestamp);
            return ((createdAt.getFullYear() + 543) * 1000) + (createdAt.getMonth() * 31) + createdAt.getDate();
        },
        formatCohortLabel(cohort) {
            if (cohort.key === 'independent' || cohort.key === 'general' || !cohort.courseLevel) {
                return this.$i18n.locale === 'en' ? 'Independent Artwork' : 'งานศิลปะ อิสระ';
            }

            const levelLabel = this.$i18n.locale === 'en'
                ? `Cohort ${cohort.courseLevel}`
                : `รุ่น ${cohort.courseLevel}`;
            return [levelLabel, cohort.academicYear].filter(Boolean).join(' · ');
        },
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;

            if (Array.isArray(item)) {
                const target = item.find(n => n.key === lang) || item[0];
                return target ? target.value : '';
            }

            const field = item.title || item.name || item.key;
            if (field) {
                if (typeof field === 'string') return field;
                if (Array.isArray(field)) {
                    const target = field.find(n => n.key === lang) || field[0];
                    return target ? target.value : '';
                }
            }

            if (typeof item === 'object') {
                return item.value || '';
            }

            return '';
        },
        formatPrice(val) {
            return new Intl.NumberFormat('th-TH').format(val || 0);
        },
        getStatusLabel(art) {
            if (!art || !art.status || !art.status.approval) return 'Pending';
            return this.getName('en', art.status.approval);
        },
        handleScroll() {
            this.showBackToTop = window.scrollY > 400;
        },
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        },
        checkMobileCollapse() {
            if (typeof window !== 'undefined') {
                const isMobile = window.innerWidth < 768;
                this.collapsedSections = {
                    priceSlider: isMobile,
                    priceRange: isMobile,
                    style: isMobile,
                    cohort: isMobile
                };
            }
        },
        toggleSection(sectionKey) {
            this.collapsedSections[sectionKey] = !this.collapsedSections[sectionKey];
        },
        onWindowResize() {
            // handle responsive transitions if needed
        }
    }
}
</script>

<style scoped>
.artworks-page {
    background-color: #FAF9F6 !important;
    font-family: var(--app-font-family);
}

/* Sidebar Filter Container */
.sidebar-filter-wrapper {
    position: sticky;
    top: 90px;
    padding-right: 1.5rem;
}

/* 1. Search Box */
.sidebar-search-box {
    width: 100%;
}

.search-input-group {
    display: flex;
    align-items: stretch;
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
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
    padding: 10px 14px;
    font-size: 0.95rem;
    color: #1f2937;
    background: transparent;
}

.sidebar-search-input::placeholder {
    color: #94a3b8;
}

.sidebar-search-btn {
    width: 46px;
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

/* 2. Headings, Collapsible Header & Divider */
.filter-section-header {
    width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
    padding: 3px 0;
    transition: all 0.2s ease;
}

.filter-section-header:hover {
    opacity: 0.85;
}

.filter-section-heading {
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: #4a1d18;
    margin: 0;
    text-transform: uppercase;
}

.filter-toggle-btn {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #FAF7F2;
    border: 1px solid rgba(196, 139, 38, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a1d18;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
}

.filter-section-header:hover .filter-toggle-btn {
    background: #4a1d18;
    border-color: #4a1d18;
    color: #ffffff;
    transform: scale(1.08);
}

.filter-collapse-svg {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-filter-section.is-collapsed .filter-collapse-svg {
    transform: rotate(-90deg);
}

.filter-heading-divider {
    width: 32px;
    height: 2px;
    background-color: #c48b26;
    margin: 8px 0 16px;
    transition: margin-bottom 0.2s ease;
}

.sidebar-filter-section.is-collapsed .filter-heading-divider {
    margin-bottom: 0;
}

.filter-content-wrapper {
    animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Price Slider Box */
.price-slider-box {
    padding-top: 4px;
}

.slider-wrapper {
    position: relative;
    height: 20px;
    display: flex;
    align-items: center;
}

.slider-wrapper::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 5px;
    background: #e8e1da;
    border-radius: 4px;
    top: 50%;
    transform: translateY(-50%);
}

.slider-track {
    position: absolute;
    height: 5px;
    background: #4a1d18;
    border-radius: 4px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
}

.slider {
    position: absolute;
    width: 100%;
    height: 5px;
    background: none;
    pointer-events: none;
    -webkit-appearance: none;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    margin: 0;
}

.slider::-webkit-slider-thumb {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: #4a1d18;
    border: 2px solid #ffffff;
    cursor: pointer;
    pointer-events: auto;
    -webkit-appearance: none;
    box-shadow: 0 2px 5px rgba(74, 29, 24, 0.3);
    transition: transform 0.15s ease, background-color 0.15s ease;
}

.slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    background: #612721;
}

.slider::-moz-range-thumb {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: #4a1d18;
    border: 2px solid #ffffff;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 2px 5px rgba(74, 29, 24, 0.3);
}

.btn-filter-action {
    background-color: #4a1d18;
    color: #ffffff;
    border: none;
    border-radius: 20px;
    padding: 6px 18px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-filter-action:hover {
    background-color: #612721;
    transform: translateY(-1px);
}

.price-display-text {
    font-size: 0.85rem;
    color: #334155;
}

.price-display-text .price-label {
    color: #64748b;
    margin-right: 4px;
}

/* 3. Filter List Items */
.filter-list-items {
    list-style: none;
    padding: 0;
    margin: 0;
}

.filter-list-item {
    width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 8px;
    border-bottom: 1px solid rgba(74, 29, 24, 0.05);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    margin-bottom: 3px;
}

.filter-list-item:last-child {
    border-bottom: none;
}

.filter-list-item .item-title {
    font-size: 0.92rem;
    font-weight: 600;
    color: #334155;
    transition: all 0.2s ease;
}

.filter-list-item .item-count {
    font-size: 0.82rem;
    color: #78716c;
    font-weight: 600;
    transition: all 0.2s ease;
}

.filter-list-item:hover:not(.active) {
    background-color: rgba(74, 29, 24, 0.06);
}

.filter-list-item:hover:not(.active) .item-title {
    color: #4a1d18;
    transform: translateX(3px);
}

.filter-list-item:hover:not(.active) .item-count {
    color: #4a1d18;
}

.filter-list-item.active {
    background-color: #4a1d18 !important;
    border-radius: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid transparent;
    box-shadow: 0 4px 12px rgba(74, 29, 24, 0.25);
}

.filter-list-item.active .item-title {
    color: #ffffff !important;
    font-weight: 700;
    transform: none;
}

.filter-list-item.active .item-count {
    color: #fde68a !important;
    font-weight: 700;
}

/* Reset All Filters Button */
.btn-reset-all {
    background: #f8fafc;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.btn-reset-all:hover {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fca5a5;
}

/* Top Toolbar */
.catalog-top-bar {
    padding-bottom: 1rem;
}

.results-count-text {
    font-size: 0.95rem;
    color: #64748b;
}

.active-filter-badge {
    display: inline-flex;
    align-items: center;
    background: #4a1d18;
    color: #ffffff;
    border: 1px solid #4a1d18;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.8rem;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(74, 29, 24, 0.15);
}

.custom-sort-select {
    border: 1px solid #e2e8f0;
    background-color: #ffffff;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.88rem;
    font-weight: 600;
    color: #1e293b;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.custom-sort-select:focus {
    border-color: #4a1d18;
}

/* Pagination Styles */
.pagination-wrapper {
    border-top: 1px solid #f1f5f9;
}

.pagination-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    max-width: 100%;
}

@media (max-width: 575.98px) {
    .pagination-wrapper {
        flex-direction: column !important;
        align-items: center !important;
        gap: 1rem;
        text-align: center;
    }
    .pagination-btn {
        min-width: 44px;
        height: 44px;
        padding: 0 6px;
        font-size: 0.82rem;
    }
}

.pagination-btn {
    min-width: 44px;
    height: 44px;
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

/* No Results */
.no-results-box {
    border: 1px dashed #e2e8f0;
}

.text-muted-soft {
    color: #cbd5e1;
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
    box-shadow: 0 4px 15px rgba(74, 29, 24, 0.25) !important;
}

.btn-back-to-top:hover {
    background-color: #612721;
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(74, 29, 24, 0.35) !important;
}

@media (max-width: 768px) {
    .sidebar-filter-wrapper {
        position: static;
        padding-right: 0;
    }
}
</style>
