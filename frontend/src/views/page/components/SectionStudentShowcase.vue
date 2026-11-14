<template>
    <div class="student-showcase-section py-5 bg-white border-bottom">
        <CContainer>
            <div class="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-5">
                <div class="text-left mb-3 mb-md-0">
                    <span class="badge text-uppercase font-weight-bold px-3 py-2 mb-3" style="color: #612721; background-color: rgba(97,39,33,0.08); border-radius: 50px; font-size: 0.8rem; letter-spacing: 1px;">
                        {{ $i18n.locale === 'en' ? 'Artworks' : 'ผลงานศิลปะ' }}
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
                <div class="d-flex flex-wrap align-items-center" style="gap: 10px;">
                    <CButton v-if="hasArchivedArtworks" color="secondary" variant="outline" shape="pill" class="px-4 py-2 font-weight-bold btn-view-archive align-self-start align-self-md-end" @click="$router.push('/archive')">
                        {{ $i18n.locale === 'en' ? 'Past Cohort Archive' : 'คลังผลงาน' }}
                    </CButton>
                    <CButton color="danger" variant="outline" shape="pill" class="px-4 py-2 font-weight-bold btn-view-all align-self-start align-self-md-end" @click="$router.push('/artworks')">
                        {{ $i18n.locale === 'en' ? 'Explore Learner Works' : 'ดูผลงานผู้เรียนทั้งหมด' }}
                    </CButton>
                </div>
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
import {
    isArtworkArchived,
    getArtworkCohortLevel,
    getArtworkCohortRank,
    getArtworkTimestamp,
    isLearnerArtwork,
    getDailyVisitSeed,
    prioritizePurchasableWithShuffle
} from '@/utils/artworkPurchase'

function collectSubmissionArtworkIds(sub) {
    const ids = [];
    if (sub && sub.assignments) {
        sub.assignments.forEach(assign => {
            if (assign.artworks) {
                assign.artworks.forEach(art => {
                    if (art && art._id) ids.push(art._id.toString());
                });
            }
        });
    }
    return ids;
}

export default {
    name: 'SectionStudentShowcase',
    components: {
        CardArtworks
    },
    data() {
        return {
            loading: true,
            loadError: false,
            submissions: [],
            visitSeed: getDailyVisitSeed()
        }
    },
    computed: {
        allArtworks() {
            return this.$store.getters['artwork/artworks'] || [];
        },
        hasArchivedArtworks() {
            return this.allArtworks.some(art => {
                const status = this.getStatusLabel(art);
                return ['Approved', 'Success', 'Reserved'].includes(status) && isArtworkArchived(art, this.getName);
            });
        },
        filteredStudentWorks() {
            const approved = this.allArtworks.filter(art => {
                return ['Approved', 'Success', 'Reserved'].includes(this.getStatusLabel(art)) && !isArtworkArchived(art, this.getName);
            });

            let result = [];
            const sortedSubmissions = [...this.submissions].sort((a, b) => {
                return (getArtworkCohortRank(b) - getArtworkCohortRank(a)) || (getArtworkTimestamp(b) - getArtworkTimestamp(a));
            });

            const matchedSub = sortedSubmissions.find(sub => {
                const ids = collectSubmissionArtworkIds(sub);
                return approved.some(art => art.submissionArtworkId && ids.includes(art.submissionArtworkId.toString()));
            });

            if (matchedSub) {
                const targetRank = getArtworkCohortRank(matchedSub);
                const cohortIds = new Set();
                sortedSubmissions
                    .filter(sub => getArtworkCohortRank(sub) === targetRank)
                    .forEach(sub => collectSubmissionArtworkIds(sub).forEach(id => cohortIds.add(id)));
                result = approved.filter(art => art.submissionArtworkId && cohortIds.has(art.submissionArtworkId.toString()));
            }

            if (result.length === 0) {
                const learnerWorks = approved.filter(isLearnerArtwork);
                const rankedWorks = learnerWorks.filter(art => getArtworkCohortLevel(art));
                if (rankedWorks.length > 0) {
                    const topRank = Math.max(...rankedWorks.map(getArtworkCohortRank));
                    result = rankedWorks.filter(art => getArtworkCohortRank(art) === topRank);
                } else {
                    result = learnerWorks;
                }
            }

            return prioritizePurchasableWithShuffle(
                result,
                this.getName,
                `${this.visitSeed || 'default'}:showcase`
            ).slice(0, 12);
        }
    },
    methods: {
        async fetchArtworks() {
            this.loading = true;
            this.loadError = false;
            this.submissions = [];
            try {
                await this.$store.dispatch('artwork/get');
                this.submissions = await this.$store.dispatch('submission/get') || [];
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
