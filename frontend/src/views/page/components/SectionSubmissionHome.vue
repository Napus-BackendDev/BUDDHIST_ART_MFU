<template>
    <div class="submission-section py-5 bg-white">
        <CContainer fluid class="px-md-5">
            <div class="d-flex align-items-end justify-content-between mb-5">
                <div class="text-left">
                    <h2 class="font-weight-bold mb-0 section-title-home">{{ $i18n.locale === 'en' ? 'Opportunities & Activities' : 'โอกาสและกิจกรรม' }}</h2>
                    <p class="text-muted mb-0 mt-2 lead-sub">{{ $i18n.locale === 'en' ? 'Be part of preserving and creating Buddhist art' : 'ร่วมเป็นส่วนหนึ่งของการสืบสานและสร้างสรรค์พุทธศิลปกรรม' }}</p>
                </div>
                <CButton color="danger" variant="outline" shape="pill" class="px-4 py-2 font-weight-bold btn-view-all" @click="$router.push('/artworks')">
                    {{ $i18n.locale === 'en' ? 'View All Artworks' : 'ดูผลงานทั้งหมด' }}
                </CButton>
            </div>

            <div v-if="loading" class="text-center py-5">
                <CSpinner color="danger" variant="grow" />
                <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading activities...' : 'กำลังโหลดข้อมูลกิจกรรม...' }}</p>
            </div>

            <template v-else>
                <div v-if="filteredActivities.length > 0">
                    <CardArtworks :artworks="filteredActivities" />
                </div>
                
                <div v-else class="text-center py-5 bg-white rounded-xl shadow-sm border mt-3 mx-3">
                    <CIcon name="cil-search" size="xl" class="text-muted mb-3" />
                    <p class="text-muted">{{ $i18n.locale === 'en' ? 'No activities found' : 'ไม่พบข้อมูลกิจกรรมในขณะนี้' }}</p>
                </div>
            </template>
        </CContainer>
    </div>
</template>

<script>
import CardArtworks from './card/CardArtworks.vue'

export default {
    name: 'SectionSubmissionHome',
    components: {
        CardArtworks
    },
    data() {
        return {
            loading: true
        }
    },
    computed: {
        allArtworks() {
            return this.$store.getters['artwork/artworks'] || [];
        },
        filteredActivities() {
            // Only show approved artworks
            let result = this.allArtworks.filter(art => {
                const status = this.getStatusLabel(art);
                const isApproved = ['Approved', 'Success', 'In Cart'].includes(status);
                
                // Only show artworks WITH submission provenance (Activities/Opportunities)
                const isActivity = art.submissionArtworkId && art.artworkPiece;
                
                return isApproved && isActivity;
            });
            
            // Limit to top 8
            return result.slice(0, 8);
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
        getStatusLabel(art) {
            if (!art || !art.status || !art.status.approval) return 'Pending';
            return this.getName('en', art.status.approval);
        },
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;
            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            if (Array.isArray(titleField)) {
                const obj = titleField.find(n => n.key === lang);
                return obj ? obj.value : (titleField[0] ? titleField[0].value : '');
            }
            return '';
        }
    },
    mounted() {
        this.fetchArtworks();
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
    top: 8px;
    bottom: 8px;
    width: 6px;
    background: #612721;
    border-radius: 10px;
}

.lead-sub {
    font-size: 1.1rem;
    font-weight: 500;
}

.btn-view-all {
    transition: all 0.3s ease;
}

.btn-view-all:hover {
    background-color: #8c1515 !important;
    color: white !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(140, 21, 21, 0.2);
}

.submission-section {
    padding: 80px 0;
}
</style>
