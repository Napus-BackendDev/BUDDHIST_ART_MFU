<template>
    <div class="catalog-section py-5 bg-white">
        <CContainer class="my-4">
            <div class="catalog-heading text-center mb-5">
                <h2 class="font-weight-bold mb-3">
                    {{ $i18n.locale === 'en' ? 'Artwork Categories' : 'หมวดหมู่ผลงาน' }}
                </h2>
                <div class="catalog-heading-line mx-auto"></div>
            </div>

            <div v-if="loading" class="text-center py-5">
                <CSpinner color="danger" variant="grow" />
                <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading categories...' : 'กำลังโหลดประเภทผลงาน...' }}</p>
            </div>
            <template v-else>
                <CRow>
                    <CCol lg="4" md="6" v-for="cat in activeCategories" :key="cat._id" class="mb-4 px-3">
                        <button type="button" class="catalog-card" @click="selectCategory(cat)">
                            <span class="catalog-ornament" aria-hidden="true"></span>
                            <span class="catalog-title">{{ getName($i18n.locale, cat.title) }}</span>
                        </button>
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
.catalog-section {
    background: linear-gradient(180deg, #ffffff 0%, #faf7f3 100%) !important;
}

.catalog-heading h2 {
    color: #612721;
    font-family: var(--app-font-family);
    font-size: 2.2rem;
    line-height: 1.25;
}

.catalog-heading-line {
    width: 60px;
    height: 3px;
    background: #612721;
    border-radius: 999px;
}

.catalog-card {
    position: relative;
    isolation: isolate;
    width: 100%;
    min-height: 164px;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    cursor: pointer;
    overflow: hidden;
    color: #3b2b28;
    background: linear-gradient(145deg, #fffdf8 0%, #f7efe6 100%);
    border: 1px solid rgba(97, 39, 33, 0.16);
    border-radius: 18px;
    box-shadow: 0 8px 24px rgba(76, 49, 43, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.catalog-title {
    position: relative;
    z-index: 2;
    font-family: var(--app-font-family);
    font-size: 1.3rem;
    font-weight: 700;
    line-height: 1.35;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.catalog-ornament {
    width: 38px;
    height: 3px;
    background: linear-gradient(90deg, #c69a4b, #612721, #c69a4b);
    border-radius: 999px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.catalog-card::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    background: linear-gradient(135deg, #612721 0%, #7c342b 100%);
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.catalog-card:hover,
.catalog-card:focus-visible {
    transform: translateY(-6px);
    color: #fffaf0;
    border-color: rgba(198, 154, 75, 0.7);
    box-shadow: 0 16px 32px rgba(97, 39, 33, 0.2);
    outline: none;
}

.catalog-card:hover::before,
.catalog-card:focus-visible::before {
    opacity: 1;
}

.catalog-card:hover .catalog-ornament,
.catalog-card:focus-visible .catalog-ornament {
    width: 58px;
    background: #e8c77e;
}

@media (max-width: 575.98px) {
    .catalog-heading h2 {
        font-size: 1.8rem;
    }

    .catalog-card {
        min-height: 112px;
        padding: 1.35rem 1rem;
    }

    .catalog-title {
        font-size: 1.05rem;
    }
}
</style>
