<template>
    <div class="featured-section py-5">
        <CContainer>
            <div class="text-center mb-5">
                <h2 class="font-weight-bold mb-3 section-title-home-centered" style="color: #612721; font-family: var(--app-font-family); font-size: 2.2rem;">
                    {{ $i18n.locale === 'en' ? 'Latest Popular Artworks' : 'ผลงานยอดนิยมล่าสุด' }}
                </h2>
                <div class="mx-auto" style="width: 60px; height: 3px; background-color: #612721; border-radius: 2px;"></div>
            </div>

            <div v-if="loading" class="text-center py-5">
                <CSpinner color="danger" variant="grow" />
                <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading masterpieces...' : 'กำลังโหลดผลงานยอดนิยม...' }}</p>
            </div>

            <div v-else-if="loadError" role="alert" class="alert alert-danger">
                <p>{{ $i18n.locale === 'en' ? 'Unable to load popular artworks. Please try again.' : 'โหลดผลงานยอดนิยมไม่สำเร็จ กรุณาลองใหม่' }}</p>
                <button type="button" class="btn btn-outline-danger" :disabled="fetching" @click="fetchArtworks(false)">{{ $i18n.locale === 'en' ? 'Try again' : 'ลองใหม่' }}</button>
            </div>
            <template v-else>
                <div v-if="filteredArtworks.length > 0">
                    <CardArtworks :artworks="filteredArtworks" />
                </div>
                
                <div v-else class="text-center py-5 bg-white rounded-xl shadow-sm border mt-3">
                    <CIcon name="cil-search" size="xl" class="text-muted mb-3" />
                    <p class="text-muted">{{ $i18n.locale === 'en' ? 'No artworks found' : 'ยังไม่มีผลงานยอดนิยมในขณะนี้' }}</p>
                </div>
            </template>
        </CContainer>
    </div>
</template>

<script>
import CardArtworks from '@/components/CardArtwork.vue'

export default {
    name: 'SectionFeaturedHome',
    components: {
        CardArtworks
    },
    data() {
        return {
            loading: true,
            loadError: false,
            fetching: false,
            polling: null
        }
    },
    computed: {
        allArtworks() {
            return this.$store.getters['artwork/artworks'] || [];
        },
        filteredArtworks() {
            // Popular artworks can come from direct uploads or student submissions.
            // Filter only publicly visible approval states; do not exclude submission provenance.
            const result = this.allArtworks.filter(art => {
                const status = this.getStatusLabel(art);
                return ['Approved', 'Success', 'Reserved'].includes(status);
            });

            // Sort by views count descending to get the most viewed artworks.
            const sorted = [...result].sort((a, b) => {
                return (b.views || 0) - (a.views || 0);
            });
            
            // Limit to top 4
            return sorted.slice(0, 4);
        }
    },
    methods: {
        async fetchArtworks(silent = false) {
            if (this.fetching) return;
            this.fetching = true;
            if (!silent) this.loading = true;
            if (!silent) this.loadError = false;
            try {
                await this.$store.dispatch('artwork/get');
                this.loadError = false;
            } catch (error) {
                this.loadError = true;
            } finally {
                this.fetching = false;
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
    background-color: #FAF9F6;
    border-top: 1px solid rgba(97, 39, 33, 0.05);
    border-bottom: 1px solid rgba(97, 39, 33, 0.05);
}
</style>
