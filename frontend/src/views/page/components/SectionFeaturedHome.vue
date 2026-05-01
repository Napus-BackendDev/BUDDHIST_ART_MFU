<template>
    <div class="featured-section py-5 bg-light">
        <CContainer fluid class="px-md-5">
            <div class="d-flex align-items-center justify-content-between mb-5">
                <h2 class="font-weight-bold mb-0 section-title-home">{{ $i18n.locale === 'en' ? 'Featured Artworks' : 'ผลงาน' }}</h2>
                <CButton color="danger" variant="outline" shape="pill" class="px-4 py-2 font-weight-bold" @click="$router.push('/artworks')">
                    {{ $i18n.locale === 'en' ? 'View All Artworks' : 'ดูผลงานทั้งหมด' }}
                </CButton>
            </div>

            <div v-if="loading" class="text-center py-5">
                <CSpinner color="danger" variant="grow" />
                <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading masterpieces...' : 'กำลังโหลดผลงานชิ้นเอก...' }}</p>
            </div>

            <template v-else>
                <div v-if="filteredArtworks.length > 0">
                    <CardArtworks :artworks="filteredArtworks" />
                </div>
                
                <div v-else class="text-center py-5 bg-white rounded-xl shadow-sm border mt-3">
                    <CIcon name="cil-search" size="xl" class="text-muted mb-3" />
                    <p class="text-muted">{{ $i18n.locale === 'en' ? 'No artworks found' : 'ยังไม่มีผลงานในหมวดหมู่นี้' }}</p>
                </div>
            </template>
        </CContainer>
    </div>
</template>

<script>
import CardArtworks from './card/CardArtworks.vue'

export default {
    name: 'SectionFeaturedHome',
    components: {
        CardArtworks
    },
    data() {
        return {
            loading: true,
            polling: null
        }
    },
    computed: {
        allArtworks() {
            return this.$store.getters['artwork/artworks'] || [];
        },
        filteredArtworks() {
            // Only show approved/in cart artworks
            let result = this.allArtworks.filter(art => {
                const status = this.getStatusLabel(art);
                const isApproved = ['Approved', 'Success', 'In Cart'].includes(status);
                
                // Only show artworks WITHOUT submission provenance (Direct uploads/Featured)
                const isFeatured = !art.submissionArtworkId && !art.artworkPiece;
                
                return isApproved && isFeatured;
            });
            
            // Limit to top 8 (2 rows)
            return result.slice(0, 8);
        }
    },
    methods: {
        async fetchArtworks(silent = false) {
            if (!silent) this.loading = true;
            try {
                await this.$store.dispatch('artwork/get');
            } finally {
                if (!silent) this.loading = false;
            }
        },
        getStatusLabel(art) {
            if (!art || !art.status || !art.status.approval) return 'Pending';
            return this.getName('en', art.status.approval);
        }
    },
    mounted() {
        this.fetchArtworks();
        this.polling = setInterval(() => {
            this.fetchArtworks(true);
        }, 5000);
    },
    beforeDestroy() {
        if (this.polling) {
            clearInterval(this.polling);
        }
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

.featured-section {
    background-color: #f8f9fa;
}
</style>
