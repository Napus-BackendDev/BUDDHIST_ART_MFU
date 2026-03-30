<template>
    <div class="artworks-page bg-white min-vh-100">
        <!-- Page Header -->
        <CContainer>
            <PageHeader title="Explore Artworks"
                description="Discover a curated selection of contemporary art from emerging and established artists worldwide."
                titleFontFamily="'Playfair Display', serif" />
        </CContainer>

        <CContainer class="pb-5">
            <FilterArtworks @filter-update="handleFilterUpdate" />
            
            <div v-if="loading" class="text-center py-5">
                <CSpinner color="primary" variant="grow" />
                <p class="mt-3 text-muted">Loading artworks...</p>
            </div>
            <ArtworkCard v-else :artworks="filteredArtworks" />
        </CContainer>
    </div>
</template>

<script>
import ArtworkCard from './components/card/CardArtworks.vue'
import FilterArtworks from './components/filter/FilterArtworks.vue'
import PageHeader from './components/Util/Header.vue'

export default {
    name: 'Artworks',
    components: {
        ArtworkCard,
        FilterArtworks,
        PageHeader
    },
    data() {
        return {
            loading: false,
            filters: {
                searchQuery: '',
                category: 'All Categories',
                price: 'All Prices',
                sort: 'Newest'
            }
        }
    },
    created() {
        this.fetchArtworks();
    },
    computed: {
        allArtworks() {
            const artworks = this.$store.getters['artwork/artworks'] || [];
            console.log('User Artworks - Total fetched:', artworks.length);
            return artworks;
        },
        filteredArtworks() {
            // Only show approved artworks on user side
            let result = this.allArtworks.filter(art => {
                const status = this.getStatusLabel(art);
                // On user side, we only show 'Approved' or 'Success' artworks
                return ['Approved', 'Success'].includes(status);
            });

            console.log('User Artworks - Total approved:', result.length);
            if (this.allArtworks.length > 0 && result.length === 0) {
                console.warn('Items exist but none are "Approved". Check status.approval content.');
            }

            // Search Filter
            if (this.filters.searchQuery) {
                const query = this.filters.searchQuery.toLowerCase();
                result = result.filter(art => {
                    const title = this.getName('en', art).toLowerCase();
                    const artist = art.artist ? this.getName('en', art.artist).toLowerCase() : '';
                    return title.includes(query) || artist.includes(query);
                });
            }

            // Category Filter
            if (this.filters.category && this.filters.category !== 'All Categories') {
                result = result.filter(art => {
                    const catName = art.category ? this.getName('en', art.category) : '';
                    return catName === this.filters.category;
                });
            }

            // Price Filter
            if (this.filters.price && this.filters.price !== 'All Prices') {
                result = result.filter(art => {
                    const price = parseFloat(art.price) || 0;
                    if (this.filters.price === 'Under $500' || this.filters.price === 'Under ฿500') return price < 500;
                    if (this.filters.price === '$500 - $1000' || this.filters.price === '฿500 - ฿1000') return price >= 500 && price <= 1000;
                    if (this.filters.price === 'Over $1000' || this.filters.price === 'Over ฿1000') return price > 1000;
                    return true;
                });
            }

            // Sort
            if (this.filters.sort) {
                result = [...result].sort((a, b) => {
                    const priceA = parseFloat(a.price) || 0;
                    const priceB = parseFloat(b.price) || 0;

                    if (this.filters.sort === 'Price: Low to High') return priceA - priceB;
                    if (this.filters.sort === 'Price: High to Low') return priceB - priceA;
                    if (this.filters.sort === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
                    if (this.filters.sort === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
                    return 0;
                });
            }

            return result;
        }
    },
    methods: {
        async fetchArtworks() {
            this.loading = true;
            try {
                await this.$store.dispatch('artwork/get');
            } finally {
                this.loading = false;
            }
        },
        handleFilterUpdate(newFilters) {
            this.filters = { ...newFilters };
        },
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;
            
            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            
            if (Array.isArray(titleField)) {
                const nameObj = titleField.find(n => n.key === lang);
                return nameObj ? nameObj.value : (titleField[0] ? titleField[0].value : '');
            }
            return '';
        },
        getStatusLabel(art) {
            if (!art || !art.status || !art.status.approval) return 'Pending';
            return this.getName('en', art.status.approval);
        }
    }
}
</script>

<style scoped>
.artworks-page {
    padding-top: 80px;
}
</style>
