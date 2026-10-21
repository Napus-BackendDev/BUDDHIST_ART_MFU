<template>
    <div class="student-showcase-section py-5 bg-white border-bottom">
        <CContainer>
            <div class="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-5">
                <div class="text-left mb-3 mb-md-0">
                    <span class="badge text-uppercase font-weight-bold px-3 py-2 mb-3" style="color: #612721; background-color: rgba(97,39,33,0.08); border-radius: 50px; font-size: 0.8rem; letter-spacing: 1px;">
                        {{ $i18n.locale === 'en' ? 'Artwork Gallery' : 'ผลงานศิลปะ' }}
                    </span>
                    <!-- hidden per client 2026-07: showcase H2 + description hidden; badge & artworks grid kept -->
                    <!--
                    <h2 class="font-weight-bold mb-2 section-title-home" style="color: #612721; font-family: var(--app-font-family); font-size: 2.2rem;">
                        {{ $i18n.locale === 'en' ? 'Student Creative Showcase' : 'หอศิลป์ผลงานสร้างสรรค์โดยผู้เรียน' }}
                    </h2>
                    <p class="text-muted mb-0 lead-sub" style="font-family: var(--app-font-family); font-size: 1.05rem;">
                        {{ $i18n.locale === 'en'
                            ? 'Masterpieces submitted as course assignments and approved by our Buddhist Art curators.'
                            : 'ผลงานพุทธศิลปกรรมและล้านนาสร้างสรรค์ที่ผ่านการคัดสรรจากรายวิชาเรียนของนักศึกษา' }}
                    </p>
                    -->
                </div>
                <CButton color="danger" variant="outline" shape="pill" class="px-4 py-2 font-weight-bold btn-view-all align-self-start align-self-md-end" @click="$router.push('/artworks')">
                    {{ $i18n.locale === 'en' ? 'Explore Learner Works' : 'ดูผลงานผู้เรียนทั้งหมด' }}
                </CButton>
            </div>

            <div v-if="loading" class="text-center py-5">
                <CSpinner color="danger" variant="grow" />
                <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading learner artworks...' : 'กำลังโหลดผลงานผู้เรียน...' }}</p>
            </div>

            <div v-else-if="loadError" role="alert" class="alert alert-danger">
                <p>{{ $i18n.locale === 'en' ? 'Unable to load learner artworks. Please try again.' : 'โหลดผลงานผู้เรียนไม่สำเร็จ กรุณาลองใหม่' }}</p>
                <button type="button" class="btn btn-outline-danger" @click="fetchArtworks">{{ $i18n.locale === 'en' ? 'Try again' : 'ลองใหม่' }}</button>
            </div>
            <template v-else>
                <div v-if="filteredStudentWorks.length > 0">
                    <CardArtworks :artworks="filteredStudentWorks" />
                </div>
                
                <div v-else class="text-center py-5 bg-light rounded-xl shadow-sm border mt-3">
                    <CIcon name="cil-search" size="xl" class="text-muted mb-3" />
                    <p class="text-muted">{{ $i18n.locale === 'en' ? 'No learner artworks are available at this time' : 'ยังไม่มีผลงานของผู้เรียนในระบบในขณะนี้' }}</p>
                </div>
            </template>
        </CContainer>
    </div>
</template>

<script>
import CardArtworks from '@/components/CardArtwork.vue'

export default {
    name: 'SectionStudentShowcase',
    components: {
        CardArtworks
    },
    data() {
        return {
            loading: true,
            loadError: false,
            latestArtworkIds: []
        }
    },
    computed: {
        allArtworks() {
            return this.$store.getters['artwork/artworks'] || [];
        },
        filteredStudentWorks() {
            // Only show approved artworks
            let result = this.allArtworks.filter(art => {
                const status = this.getStatusLabel(art);
                const isApproved = ['Approved', 'Success', 'Reserved'].includes(status);
                
                // Show artworks belonging to the latest student batch
                const isLatestBatch = art.submissionArtworkId && this.latestArtworkIds.includes(art.submissionArtworkId.toString());
                
                return isApproved && isLatestBatch;
            });
            
            // Fallback: if latest batch has no approved works yet, show any student work
            if (result.length === 0) {
                result = this.allArtworks.filter(art => {
                    const status = this.getStatusLabel(art);
                    const isApproved = ['Approved', 'Success', 'Reserved'].includes(status);
                    const isStudentWork = art.submissionArtworkId || art.artworkPiece;
                    return isApproved && isStudentWork;
                });
            }
            
            // Sort by views count descending (most viewed first)
            let sorted = [...result].sort((a, b) => {
                return (b.views || 0) - (a.views || 0);
            });
            
            // Limit to top 8 (2 rows of 4 on standard grids)
            return sorted.slice(0, 8);
        }
    },
    methods: {
        async fetchArtworks() {
            this.loading = true;
            this.loadError = false;
            this.latestArtworkIds = [];
            try {
                await this.$store.dispatch('artwork/get');
                // Fetch submissions to identify the latest batch
                const submissions = await this.$store.dispatch('submission/get') || [];
                const finishedSubmissions = submissions.filter(sub => {
                    if (!sub.create || !sub.create.endAt) return true; // fallback if no date is set (mock/old data)
                    return new Date(sub.create.endAt) < new Date();
                });
                
                if (finishedSubmissions.length > 0) {
                    const sortedSubmissions = [...finishedSubmissions].sort((a, b) => {
                        return (parseInt(b.courseLevel) || 0) - (parseInt(a.courseLevel) || 0);
                    });
                    const latestSubmission = sortedSubmissions[0];
                    const ids = [];
                    if (latestSubmission && latestSubmission.assignments) {
                        latestSubmission.assignments.forEach(assign => {
                            if (assign.artworks) {
                                assign.artworks.forEach(art => {
                                    if (art._id) {
                                        ids.push(art._id.toString());
                                    }
                                });
                            }
                        });
                    }
                    this.latestArtworkIds = ids;
                }
            } catch (err) {
                this.loadError = true;
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
    font-size: 1.05rem;
}

.btn-view-all {
    transition: all 0.3s ease;
    border-color: #612721 !important;
    color: #612721 !important;
}

.btn-view-all:hover {
    background-color: #612721 !important;
    color: white !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(97, 39, 33, 0.15) !important;
}

.student-showcase-section {
    padding: 80px 0;
}
</style>
