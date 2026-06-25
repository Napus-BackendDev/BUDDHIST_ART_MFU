<template>
    <div class="catalog-section py-5 bg-white">
        <CContainer class="my-4">
            <CRow class="align-items-center">
                <!-- Left: Catalog Header/Description Column -->
                <CCol lg="4" class="mb-5 mb-lg-0 pr-lg-4">
                    <span class="badge text-uppercase font-weight-bold px-3 py-2 mb-3" style="color: #612721; background-color: rgba(97,39,33,0.08); border-radius: 50px; font-size: 0.8rem; letter-spacing: 1px;">
                        {{ $i18n.locale === 'en' ? 'Categories' : 'หมวดหมู่ผลงาน' }}
                    </span>
                    <h2 class="font-weight-bold mb-3 section-title-left" style="color: #2c3e50; font-family: 'Cinzel', serif; font-size: 2.5rem; line-height: 1.2;">
                        {{ $i18n.locale === 'en' ? 'Catalog' : 'แค็ตตาล็อก' }}
                    </h2>
                    <p class="text-muted mb-4" style="font-family: 'Sarabun', sans-serif; font-size: 1.05rem; line-height: 1.6;">
                        {{ $i18n.locale === 'en' 
                            ? 'Browse Lanna and Lanna contemporary masterpieces grouped by creation styles, mediums, and formats.' 
                            : 'ร่วมค้นหาผลงานพุทธศิลปกรรมร่วมสมัยและล้านนาสร้างสรรค์ โดยคัดแยกตามเทคนิคงานสร้างสื่อศิลปะ รูปแบบสามมิติ ตลาดจนจิตรกรรมจิตวิญญาณ' }}
                    </p>
                    <div>
                        <CButton color="danger" class="px-4 py-2.5 font-weight-bold btn-view-all" @click="$router.push('/artworks')">
                            {{ $i18n.locale === 'en' ? 'View All Masterpieces' : 'ดูผลงานทั้งหมด' }}
                        </CButton>
                    </div>
                </CCol>

                <!-- Right: Categories Grid (3 Columns, 2 Rows on desktop) -->
                <CCol lg="8">
                    <div v-if="loading" class="text-center py-5">
                        <CSpinner color="danger" variant="grow" />
                        <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading categories...' : 'กำลังโหลดประเภทผลงาน...' }}</p>
                    </div>
                    <template v-else>
                        <CRow class="no-gutters-xs">
                            <CCol lg="4" md="4" sm="6" v-for="cat in activeCategories" :key="cat._id" class="mb-4 px-2">
                                <div class="catalog-card position-relative overflow-hidden rounded-xl shadow-sm border" @click="selectCategory(cat)">
                                    <!-- Image overlay cover -->
                                    <div class="catalog-img-container">
                                        <img :src="getCategoryCover(cat)" :alt="getName($i18n.locale, cat.title)" class="catalog-cover-img">
                                        <div class="catalog-gradient-overlay"></div>
                                    </div>
                                    
                                    <!-- Content inside -->
                                    <div class="catalog-content p-3 d-flex flex-column justify-content-end">
                                        <h6 class="catalog-title font-weight-bold text-white mb-1" style="font-size: 1.1rem;">{{ getName($i18n.locale, cat.title) }}</h6>
                                        <p class="catalog-desc text-white-50 small mb-0" style="font-size: 0.72rem; line-height: 1.3;">{{ getName($i18n.locale, cat.description) }}</p>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>
                    </template>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
import i18nMixin from '@/mixins/i18nMixin';

export default {
    name: 'SectionCatalog',
    mixins: [i18nMixin],
    data() {
        return {
            loading: true,
            categories: []
        }
    },
    computed: {
        activeCategories() {
            // Exclude "Others" or "อื่นๆ" to keep it highly curated
            return this.categories.filter(c => {
                const enVal = this.getName('en', c.title);
                return enVal !== 'Others';
            });
        }
    },
    methods: {
        async fetchCategories() {
            this.loading = true;
            try {
                const data = await this.$store.dispatch('artwork/category', { method: 'get' });
                this.categories = data || [];
            } catch (err) {
                console.error("Failed to load catalog categories", err);
            } finally {
                this.loading = false;
            }
        },
        getCategoryCover(cat) {
            const name = this.getName('en', cat.title).toLowerCase().trim();
            if (name.includes('painting')) {
                return require('@/assets/images/category_painting.png');
            } else if (name.includes('sculpture')) {
                return require('@/assets/images/category_sculpture.png');
            } else if (name.includes('mixed media')) {
                return require('@/assets/images/category_mixed_media.png');
            } else if (name.includes('drawing')) {
                return require('@/assets/images/category_drawing.png');
            }
            return require('@/assets/images/category_default.png');
        },
        selectCategory(cat) {
            const catName = this.getName(this.$i18n.locale, cat.title);
            this.$router.push({
                path: '/artworks',
                query: { category: catName }
            });
        }
    },
    mounted() {
        this.fetchCategories();
    }
}
</script>

<style scoped>
.section-title-left {
    position: relative;
    padding-bottom: 15px;
}

.section-title-left::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 50px;
    height: 4px;
    background: #612721;
    border-radius: 10px;
}

.btn-view-all {
    background-color: #612721 !important;
    border-color: #612721 !important;
    color: white !important;
    border-radius: 50px;
    transition: all 0.3s ease;
}

.btn-view-all:hover {
    background-color: #4a1d18 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(97, 39, 33, 0.25) !important;
}

.catalog-card {
    height: 240px;
    cursor: pointer;
    border-radius: 16px !important;
    border: none !important;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.catalog-img-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.catalog-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.catalog-gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, 
        rgba(0, 0, 0, 0.1) 0%, 
        rgba(0, 0, 0, 0.4) 60%, 
        rgba(0, 0, 0, 0.85) 100%);
    z-index: 2;
}

.catalog-content {
    position: relative;
    height: 100%;
    z-index: 3;
    color: white;
}

.catalog-title {
    font-family: 'Cinzel', serif;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    transition: color 0.3s ease;
}

.catalog-desc {
    opacity: 0.8;
    line-height: 1.4;
    transition: transform 0.4s ease, opacity 0.4s ease;
}

/* Hover effects */
.catalog-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 32px rgba(97, 39, 33, 0.2) !important;
}

.catalog-card:hover .catalog-cover-img {
    transform: scale(1.08);
}

.catalog-card:hover .catalog-title {
    color: #FEC260;
}
</style>
