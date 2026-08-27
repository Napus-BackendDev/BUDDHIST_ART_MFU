<template>
    <footer class="footer-user">
        <div class="footer-main py-5">
            <CContainer>
                <!-- Top Section: 3 Main Columns (Brand, Quick Links, Contact Info) -->
                <CRow class="mb-4 pb-2">
                    <!-- Column 1: Brand & Identity -->
                    <CCol lg="4" class="mb-4 mb-lg-0 pr-lg-3 pr-xl-4">
                        <div class="footer-brand mb-4">
                            <h2 class="brand-title">Buddhist Art <span class="highlight">SPACE</span></h2>
                            <div class="brand-sub">{{ $i18n.locale === 'en' ? 'Mae Fah Luang University' : 'มหาวิทยาลัยแม่ฟ้าหลวง' }}</div>
                        </div>
                        <p class="brand-description mt-4" v-if="$i18n.locale === 'th'">
                            พื้นที่ดิจิทัลสำหรับการเรียนรู้ จัดเก็บ<br />
                            และเผยแพร่ผลงานพุทธศิลปกรรมร่วมสมัย<br />
                            เพื่อสนับสนุนการสร้างสรรค์ ต่อยอดองค์ความรู้<br />
                            และเศรษฐกิจสร้างสรรค์ทางศิลปวัฒนธรรม
                        </p>
                        <p class="brand-description mt-4" v-else>
                            A digital space for learning, archiving,<br />
                            and disseminating contemporary Buddhist artwork<br />
                            to support creativity, knowledge extension,<br />
                            and the cultural creative economy.
                        </p>
                        <!-- Sleek Round Social Media Buttons -->
                        <div class="social-links mt-4">
                            <a href="https://www.facebook.com/BuddhistArtMFU" target="_blank" rel="noopener noreferrer" class="social-btn" title="Facebook" aria-label="Facebook">
                                <CIcon name="cib-facebook" aria-hidden="true" />
                            </a>
                            <a href="https://www.youtube.com/@BuddhistArtMFU" target="_blank" rel="noopener noreferrer" class="social-btn" title="YouTube" aria-label="YouTube">
                                <CIcon name="cib-youtube" aria-hidden="true" />
                            </a>
                            <a href="https://buddhistart.mfu.ac.th" target="_blank" rel="noopener noreferrer" class="social-btn" title="Official Website" aria-label="Official Website">
                                <CIcon name="cil-globe-alt" aria-hidden="true" />
                            </a>
                            <a href="mailto:buddhistart@mfu.ac.th" class="social-btn" title="Email Us" aria-label="Email Us">
                                <CIcon name="cil-envelope-closed" aria-hidden="true" />
                            </a>
                        </div>
                    </CCol>

                    <!-- Column 2: Quick Links -->
                    <CCol md="4" lg="2" class="mb-4 mb-lg-0">
                        <h5 class="footer-heading text-uppercase mb-4">{{ $i18n.locale === 'en' ? 'Quick Links' : 'เมนูแนะนำ' }}</h5>
                        <ul class="footer-nav list-unstyled">
                            <li><router-link to="/">{{ $t('header.home') }}</router-link></li>
                            <li><router-link to="/artworks">{{ $t('header.artworks') }}</router-link></li>
                            <li><router-link to="/news">{{ $t('header.news') }}</router-link></li>
                            <li><router-link to="/contact">{{ $t('header.contact') }}</router-link></li>
                            <li>
                                <a href="https://buddhistart.mfu.ac.th/" target="_blank" rel="noopener noreferrer">
                                    {{ $t('header.about') }}
                                    <CIcon name="cil-external-link" size="sm" class="ml-1" style="vertical-align: middle; opacity: 0.7; width: 11px; height: 11px;" />
                                </a>
                            </li>
                        </ul>
                    </CCol>

                    <!-- Column 3: Contact Info (ติดต่อเรา) -->
                    <CCol md="8" lg="5" class="mb-4 mb-lg-0 ml-lg-auto pl-lg-4">
                        <h5 class="footer-heading text-uppercase mb-4">{{ $i18n.locale === 'en' ? 'Contact Us' : 'ติดต่อเรา' }}</h5>
                        <div class="contact-info">
                            <!-- Combined Address block -->
                            <div class="contact-item d-flex mb-4">
                                <div class="contact-icon mr-3 mt-1">
                                    <CIcon name="cil-location-pin" />
                                </div>
                                <div class="contact-text" style="line-height: 1.6;">
                                    <div class="font-weight-bold mb-1" style="color: #fff;">
                                        {{ $i18n.locale === 'en' ? 'Academic Services Center (Academic Services Division), Mae Fah Luang University' : 'ศูนย์บริการวิชาการ (ฝ่ายบริการวิชาการ) มหาวิทยาลัยแม่ฟ้าหลวง' }}
                                    </div>
                                    <div class="small text-white-50">
                                        {{ $i18n.locale === 'en' ? 'Gen. Sampao Choosri Building (E4), 333 Moo 1, Thasud, Muang, Chiang Rai 57100' : 'อาคารพลเอกสำเภา ชูศรี (E4) เลขที่ 333 หมู่ 1 ต.ท่าสุด อ.เมือง จ.เชียงราย 57100' }}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 2-Column Grid for Phone & Email -->
                            <div class="row no-gutters mt-3 pt-3 border-top border-secondary-light">
                                <!-- Phone -->
                                <div class="col-md-6 mb-3 pr-2">
                                    <div class="d-flex align-items-center">
                                        <div class="contact-icon mr-2 text-warning">
                                            <CIcon name="cil-phone" size="sm" />
                                        </div>
                                        <div class="contact-text small">
                                            <span class="d-block text-white-50 font-weight-bold" style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px;">{{ $i18n.locale === 'en' ? 'Tel' : 'โทรศัพท์' }}</span>
                                            <a href="tel:053917897" class="text-white text-decoration-none">053-917-897 {{ $i18n.locale === 'en' ? 'ext.' : 'ต่อ' }} 8035-6</a>
                                        </div>
                                    </div>
                                </div>
                                <!-- Email -->
                                <div class="col-md-6 mb-3">
                                    <div class="d-flex align-items-center">
                                        <div class="contact-icon mr-2 text-warning">
                                            <CIcon name="cil-envelope-closed" size="sm" />
                                        </div>
                                        <div class="contact-text small">
                                            <span class="d-block text-white-50 font-weight-bold" style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px;">{{ $i18n.locale === 'en' ? 'Email' : 'อีเมล' }}</span>
                                            <a href="mailto:buddhistart@mfu.ac.th" class="text-white text-decoration-none">buddhistart@mfu.ac.th</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Partner / Supporter Logos (Round Social-Icon Style) -->
                            <div class="partner-logos-wrapper mt-2">
                                <div class="partner-logos">
                                    <div 
                                        v-for="partner in partners" 
                                        :key="partner.id" 
                                        class="partner-logo-btn" 
                                        :title="getAltText(partner)"
                                        :aria-label="getAltText(partner)"
                                    >
                                        <img :src="partner.img" :alt="getAltText(partner)" class="partner-logo-img" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CCol>
                </CRow>
            </CContainer>
        </div>

        <!-- Copyright Bar -->
        <div class="footer-bottom py-4 bg-darker text-center border-top border-secondary">
            <CContainer>
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <p class="mb-0 small text-muted">
                        &copy; {{ new Date().getFullYear() }} {{ $i18n.locale === 'en' ? 'Short Course Program in Buddhist Art, Mae Fah Luang University. All rights reserved.' : 'หลักสูตรระยะสั้น สาขาวิชาพุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง สงวนลิขสิทธิ์' }}
                    </p>
                    <div class="footer-policy mt-3 mt-md-0">
                        <router-link to="/privacy" class="small text-muted mr-3">{{ $i18n.locale === 'en' ? 'Privacy Policy' : 'นโยบายความเป็นส่วนตัว' }}</router-link>
                        <router-link to="/terms" class="small text-muted">{{ $i18n.locale === 'en' ? 'Terms of Service' : 'ข้อกำหนดการให้บริการ' }}</router-link>
                    </div>
                </div>
            </CContainer>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'TheFooterUser',
    data() {
        return {
            partners: [
                {
                    id: 'LocalMFU',
                    img: '/img/partner_mfu.png',
                    nameEn: 'Mae Fah Luang<br>University',
                    nameTh: 'มหาวิทยาลัย<br>แม่ฟ้าหลวง',
                    sub: 'MFU'
                },
                {
                    id: 'LocalCAS',
                    img: '/img/partner_cas.png',
                    nameEn: 'Academic Services<br>Center',
                    nameTh: 'ศูนย์บริการ<br>วิชาการ',
                    sub: 'CAS'
                },
                {
                    id: 'LocalEart',
                    img: '/img/partner_museum.png',
                    nameEn: 'Short Course Program<br>in Buddhist Art',
                    nameTh: 'หลักสูตรระยะสั้น<br>สาขาวิชาพุทธศิลปกรรม',
                    sub: 'Buddhist Art'
                },
                {
                    id: 'Museum',
                    img: '/img/partner_eart.png',
                    nameEn: 'Institute for Mekong Basin<br>Civilisation Art & Culture',
                    nameTh: 'สถาบันศิลปวัฒนธรรม<br>อารยธรรมลุ่มน้ำโขง',
                    sub: 'IMAC'
                }
            ]
        }
    },
    methods: {
        getAltText(partner) {
            const raw = this.$i18n.locale === 'en' ? partner.nameEn : partner.nameTh;
            return raw ? raw.replace(/<br\s*[\/]?>/gi, ' ') : '';
        }
    }
}
</script>

<style scoped>
/* Updated Footer Color Scheme */
.footer-user {
    background-color: #612721; /* Main Burgundy */
    color: #f8f9fa;
    font-family: 'Sarabun', sans-serif;
    position: relative;
    z-index: 100;
}

.footer-main {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.bg-darker {
    background-color: #4a1d18; /* Darker Burgundy */
}

.brand-title {
    font-family: 'Cinzel', serif;
    font-size: 1.75rem;
    font-weight: 900;
    color: #fff;
    letter-spacing: 1px;
    margin-bottom: 5px;
}

.brand-title .highlight {
    color: #f0c24d; /* Gold highlight for contrast on burgundy */
}

.brand-sub {
    font-size: 0.9rem;
    font-weight: 600;
    color: #e2e8f0;
    letter-spacing: 0.5px;
}

.brand-description {
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.92rem;
    word-break: keep-all;
}

.footer-heading {
    font-family: 'Cinzel', serif;
    color: #fff;
    font-weight: 700;
    letter-spacing: 1.5px;
    position: relative;
    padding-bottom: 15px;
}

.footer-heading::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 3px;
    background: #f0c24d; /* Gold accent */
    border-radius: 2px;
}

.footer-nav li {
    margin-bottom: 12px;
}

.footer-nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: all 0.25s ease;
    font-weight: 500;
}

.footer-nav a:hover {
    color: #f0c24d;
    padding-left: 8px;
}

.contact-icon {
    color: #f0c24d; /* Gold icons */
    min-width: 24px;
}

.contact-text {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.9);
}

.footer-policy a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
}

.social-links {
    display: flex;
    gap: 15px;
}

.social-btn {
    width: 44px;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: all 0.3s ease;
    text-decoration: none !important;
}

.social-btn:hover {
    background: #f0c24d;
    color: #4a1d18;
    transform: translateY(-3px);
}

/* Partner / Supporter Logos (Circular Social-Icon Style) */
.partner-logos-wrapper {
    display: flex;
    align-items: center;
}

.partner-logos {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

.partner-logo-btn {
    width: 44px;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
    background: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

.partner-logo-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 14px rgba(240, 194, 77, 0.5);
    border-color: #f0c24d;
}

.partner-logo-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.border-secondary {
    border-color: rgba(255,255,255,0.1) !important;
}

.border-secondary-light {
    border-color: rgba(255,255,255,0.12) !important;
}

@media (max-width: 991.98px) {
    .footer-heading {
        margin-top: 20px;
    }
}
</style>
