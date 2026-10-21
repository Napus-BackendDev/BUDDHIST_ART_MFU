<template>
    <div class="student-batches-section py-5" style="background-color: #FAF8F5; border-bottom: 1px solid rgba(0,0,0,0.05);">
        <CContainer class="my-4">
            <div class="text-center mb-5">
                <span class="badge text-uppercase font-weight-bold px-3 py-2 mb-3" style="color: #612721; background-color: rgba(97,39,33,0.08); border-radius: 50px; font-size: 0.8rem; letter-spacing: 1px;">
                    {{ $i18n.locale === 'en' ? 'Academic Cohort Directory' : 'ทำเนียบรุ่นวิชาการ' }}
                </span>
                <h2 class="font-weight-bold mb-3" style="color: #2c3e50; font-family: var(--app-font-family); font-size: 2.2rem; letter-spacing: 0.5px;">
                    {{ $i18n.locale === 'en' ? 'Cohort and Student Artwork Exhibition Registry' : 'ทะเบียนรุ่นและนิทรรศการผลงานศึกษา' }}
                </h2>
                <div class="mx-auto" style="width: 50px; height: 3px; background-color: #612721; border-radius: 2px;"></div>
            </div>

            <div v-if="loading" class="text-center py-5">
                <CSpinner color="danger" variant="grow" />
                <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading registry...' : 'กำลังโหลดทำเนียบรุ่น...' }}</p>
            </div>

            <template v-else>
                <CRow v-if="latestBatches.length > 0" class="justify-content-center">
                    <CCol lg="4" md="6" sm="12" v-for="batch in latestBatches" :key="batch._id" class="mb-4 px-3">
                        <div class="exhibition-plaque p-4 bg-white position-relative d-flex flex-column justify-content-between" @click="selectBatch(batch)">
                            <!-- Plaque Top Info -->
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="plaque-batch-name font-weight-bold">
                                    {{ $i18n.locale === 'en' ? `Cohort ${batch.courseLevel}` : `ผู้เรียนรุ่นที่ ${batch.courseLevel}` }}
                                </span>
                                <span class="plaque-year">{{ getBatchYear(batch) }}</span>
                            </div>
                            
                            <!-- Plaque Body -->
                            <div class="plaque-body py-2">
                                <div class="plaque-divider mb-3"></div>
                                <h5 class="plaque-title font-weight-bold mb-2 text-dark">
                                    {{ getName($i18n.locale, batch.title) }}
                                </h5>
                                <p class="plaque-subtitle text-muted small mb-0">
                                    {{ getBatchDescription(batch) }}
                                </p>
                            </div>
                            
                            <!-- Plaque Footer -->
                            <div class="d-flex justify-content-end align-items-center mt-3 pt-3 border-top border-light-custom">
                                <span class="badge font-weight-bold count-badge px-3 py-2">
                                    {{ batch.approvedCount }} {{ $i18n.locale === 'en' ? 'Completed Artworks' : 'ผลงานที่สำเร็จ' }}
                                </span>
                            </div>
                        </div>
                    </CCol>
                </CRow>
                
                <div v-else class="text-center py-5 bg-white rounded-xl shadow-sm border mt-3">
                    <CIcon name="cil-search" size="xl" class="text-muted mb-3" />
                    <p class="text-muted">{{ $i18n.locale === 'en' ? 'No registry found' : 'ไม่พบข้อมูลรุ่นส่งงานในขณะนี้' }}</p>
                </div>
            </template>
        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'SectionStudentBatches',
    data() {
        return {
            loading: true,
            submissions: []
        }
    },
    computed: {
        latestBatches() {
            const processed = this.submissions.map(sub => {
                let approvedCount = 0;
                if (sub.assignments) {
                    sub.assignments.forEach(assign => {
                        if (assign.artworks) {
                            assign.artworks.forEach(art => {
                                const statusEn = this.getName('en', art.status);
                                if (['Approved', 'Success', 'Reserved'].includes(statusEn) || statusEn === 'Approved') {
                                    approvedCount++;
                                }
                            });
                        }
                    });
                }
                return {
                    ...sub,
                    approvedCount
                };
            });

            let sorted = processed.sort((a, b) => {
                const levelA = parseInt(a.courseLevel) || 0;
                const levelB = parseInt(b.courseLevel) || 0;
                return levelB - levelA;
            });

            return sorted.slice(0, 6);
        }
    },
    methods: {
        async fetchSubmissions() {
            this.loading = true;
            try {
                const data = await this.$store.dispatch('submission/get');
                this.submissions = data || [];
            } catch (err) {
                console.error("Failed to load submissions for batches", err);
            } finally {
                this.loading = false;
            }
        },
        selectBatch(batch) {
            const subTitle = this.getName('th', batch.title);
            this.$router.push({
                path: '/artworks',
                query: { search: subTitle }
            });
        },
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;
            if (Array.isArray(item)) {
                const obj = item.find(n => n.key === lang);
                return obj ? obj.value : (item[0] ? item[0].value : '');
            }
            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            if (Array.isArray(titleField)) {
                const obj = titleField.find(n => n.key === lang);
                return obj ? obj.value : (titleField[0] ? titleField[0].value : '');
            }
            return '';
        },
        getBatchDescription(batch) {
            const description = this.getName(this.$i18n.locale, batch.description);
            if (description) return description;

            const fallbackLanguage = this.$i18n.locale === 'en' ? 'th' : 'en';
            const fallback = this.getName(fallbackLanguage, batch.description);
            if (fallback) return fallback;

            return this.$i18n.locale === 'en'
                ? 'No cohort description available'
                : 'ยังไม่มีคำบรรยายรุ่น';
        },
        getBatchYear(batch) {
            const level = parseInt(batch.courseLevel) || 1;
            const mockYearBE = 2563 + level;
            
            if (batch.createdAt && !String(batch._id).startsWith('mock')) {
                const yearAD = new Date(batch.createdAt).getFullYear();
                return this.$i18n.locale === 'en' ? `${yearAD} AD` : `${yearAD + 543} พ.ศ.`;
            }
            return this.$i18n.locale === 'en' ? `${mockYearBE - 543} AD` : `${mockYearBE} พ.ศ.`;
        }
    },
    mounted() {
        this.fetchSubmissions();
    }
}
</script>

<style scoped>
.exhibition-plaque {
    min-height: 220px;
    cursor: pointer;
    border-radius: 4px !important;
    border: 1px solid #e5dec9 !important;
    border-top: 4px solid #612721 !important;
    box-shadow: 0 4px 10px rgba(97, 39, 33, 0.03) !important;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.plaque-code {
    font-family: var(--app-font-family);
    font-size: 0.78rem;
    color: #a6845e;
    letter-spacing: 2px;
    font-weight: 600;
}

.plaque-year {
    font-family: var(--app-font-family);
    font-size: 0.78rem;
    color: #bfa081;
}

.plaque-divider {
    width: 35px;
    height: 2px;
    background-color: #612721;
}

.plaque-title {
    font-family: var(--app-font-family);
    font-size: 1.15rem;
    line-height: 1.4;
    color: #1a1a1a !important;
}

.plaque-subtitle {
    font-family: var(--app-font-family);
    font-size: 0.82rem;
    letter-spacing: 0.5px;
}

.plaque-batch-name {
    font-family: var(--app-font-family);
    font-size: 0.88rem;
    color: #612721;
    letter-spacing: 0.5px;
}

.border-top-custom {
    border-top: 1px solid #f2edd9 !important;
}

.count-badge {
    background-color: #612721 !important;
    color: #ffffff !important;
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: var(--app-font-family);
    letter-spacing: 0.5px;
    font-weight: 500;
}

/* Hover effects mimicking physical plaque lighting */
.exhibition-plaque:hover {
    transform: translateY(-5px);
    border-color: #cbb47e !important;
    border-top-color: #c48b26 !important;
    box-shadow: 0 16px 28px rgba(97, 39, 33, 0.08) !important;
}

.exhibition-plaque:hover .plaque-title {
    color: #612721 !important;
}

.exhibition-plaque:hover .count-badge {
    background-color: #FEC260 !important;
    color: #612721 !important;
}

.border-light-custom {
    border-top: 1px solid rgba(97, 39, 33, 0.07) !important;
}
</style>
