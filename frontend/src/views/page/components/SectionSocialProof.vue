<template>
    <div class="social-proof-section py-5 bg-white border-bottom">
        <CContainer>
            <!-- Stat metrics row -->
            <CRow class="text-center py-3">
                <CCol md="4" class="mb-4 mb-md-0 border-right-md">
                    <div class="stat-card">
                        <h2 class="stat-number font-weight-bold">150+</h2>
                        <p class="stat-label text-muted font-weight-bold mb-0">
                            {{ $i18n.locale === 'en' ? 'Artworks Created' : 'ผลงานสร้างสรรค์ในระบบ' }}
                        </p>
                    </div>
                </CCol>
                <CCol md="4" class="mb-4 mb-md-0 border-right-md">
                    <div class="stat-card">
                        <h2 class="stat-number font-weight-bold">80+</h2>
                        <p class="stat-label text-muted font-weight-bold mb-0">
                            {{ $i18n.locale === 'en' ? 'Professional Artists' : 'ศิลปินและนักเรียนสร้างสรรค์' }}
                        </p>
                    </div>
                </CCol>
                <CCol md="4">
                    <div class="stat-card">
                        <h2 class="stat-number font-weight-bold">30+</h2>
                        <p class="stat-label text-muted font-weight-bold mb-0">
                            {{ $i18n.locale === 'en' ? 'Specialized Courses' : 'หลักสูตรเฉพาะทางพุทธศิลป์' }}
                        </p>
                    </div>
                </CCol>
            </CRow>

            <hr class="my-5 border-light">

            <!-- Partner logos row -->
            <div class="partners-wrapper text-center">
                <h6 class="text-uppercase text-muted font-weight-bold mb-4" style="letter-spacing: 2px; font-size: 0.75rem;">
                    {{ $i18n.locale === 'en' ? 'Supported & Endorsed by' : 'สนับสนุนและดูแลโดยคณะกรรมการร่วม' }}
                </h6>
                <div class="d-flex flex-wrap justify-content-center align-items-center gap-5 partner-badges">
                    <div class="partner-badge px-4 py-2 mx-3 my-2 shadow-sm border rounded">
                        <span class="font-weight-bold text-dark" style="font-family: 'Cinzel', serif;">MFU</span>
                        <span class="small text-muted ml-2">{{ $i18n.locale === 'en' ? 'Mae Fah Luang University' : 'มหาวิทยาลัยแม่ฟ้าหลวง' }}</span>
                    </div>
                    <div class="partner-badge px-4 py-2 mx-3 my-2 shadow-sm border rounded">
                        <span class="font-weight-bold text-danger" style="font-family: 'Cinzel', serif; color: #612721 !important;">ASD</span>
                        <span class="small text-muted ml-2">{{ $i18n.locale === 'en' ? 'Academic Services Division' : 'ศูนย์บริการวิชาการ' }}</span>
                    </div>
                    <div class="partner-badge px-4 py-2 mx-3 my-2 shadow-sm border rounded">
                        <span class="font-weight-bold text-warning" style="font-family: 'Cinzel', serif; color: #FEC260 !important;">BAC</span>
                        <span class="small text-muted ml-2">{{ $i18n.locale === 'en' ? 'Buddhist Art Center' : 'โครงการกองทุนอนุรักษ์พุทธศิลป์' }}</span>
                    </div>
                </div>
            </div>
        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'SectionSocialProof'
}
</script>

<style scoped>
.social-proof-section {
    position: relative;
    z-index: 10;
}

.stat-number {
    font-family: 'Cinzel', serif;
    font-size: 3rem;
    color: #612721;
    margin-bottom: 5px;
    background: linear-gradient(135deg, #612721, #FEC260);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.stat-label {
    font-family: 'Sarabun', sans-serif;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.partner-badge {
    background-color: #fbfbfb;
    border-color: rgba(0,0,0,0.06) !important;
    display: inline-flex;
    align-items: center;
    border-radius: 8px !important;
    transition: all 0.3s ease;
}

.partner-badge:hover {
    transform: translateY(-2px);
    border-color: #FEC260 !important;
    box-shadow: 0 8px 16px rgba(0,0,0,0.06) !important;
}

@media (min-width: 768px) {
    .border-right-md {
        border-right: 1px solid rgba(0, 0, 0, 0.08);
    }
}

@media (max-width: 767.98px) {
    .stat-card {
        padding: 1rem 0;
    }
}
</style>
