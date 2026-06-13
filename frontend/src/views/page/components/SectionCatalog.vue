<template>
    <div class="catalog-section py-5 bg-white">
        <CContainer>
            <div class="d-flex align-items-center justify-content-between mb-5">
                <div>
                    <h2 class="font-weight-bold mb-1 section-title-home">{{ $i18n.locale === 'en' ? 'Art Catalog' : 'แค็ตตาล็อกผลงานศิลปะ' }}</h2>
                    <p class="text-muted mb-0 small">{{ $i18n.locale === 'en' ? 'Explore masterworks categorized by creative techniques' : 'ร่วมค้นหาผลงานชิ้นเอกโดยคัดแยกประเภทตามเทคนิคการสร้างสรรค์' }}</p>
                </div>
            </div>

            <div v-if="loading" class="text-center py-5">
                <CSpinner color="danger" variant="grow" />
                <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading categories...' : 'กำลังโหลดประเภทผลงาน...' }}</p>
            </div>

            <template v-else>
                <CRow>
                    <CCol sm="6" md="4" lg="3" v-for="cat in activeCategories" :key="cat._id" class="mb-4">
                        <div class="catalog-card position-relative overflow-hidden rounded-xl shadow-sm border" @click="selectCategory(cat)">
                            <!-- Image overlay cover -->
                            <div class="catalog-img-container">
                                <img :src="getCategoryCover(cat)" :alt="getName($i18n.locale, cat.title)" class="catalog-cover-img">
                                <div class="catalog-gradient-overlay"></div>
                            </div>
                            
                            <!-- Content inside -->
                            <div class="catalog-content p-4 d-flex flex-column justify-content-end">
                                <h5 class="catalog-title font-weight-bold text-white mb-2">{{ getName($i18n.locale, cat.title) }}</h5>
                                <p class="catalog-desc text-white-50 small mb-0">{{ getName($i18n.locale, cat.description) }}</p>
                            </div>
                        </div>
                    </CCol>
                </CRow>
            </template>
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
            // Exclude "Others" or "อื่นๆ" to keep it highly curated, or show everything
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

.catalog-card {
    height: 320px;
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
    font-size: 1.25rem;
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
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(97, 39, 33, 0.2) !important;
}

.catalog-card:hover .catalog-cover-img {
    transform: scale(1.08);
}

.catalog-card:hover .catalog-title {
    color: #FEC260;
}
</style>
