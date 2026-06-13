<template>
    <footer class="footer-user">
        <div class="footer-main py-5">
            <CContainer>
                <CRow>
                    <!-- Column 1: Brand & Identity -->
                    <CCol lg="4" class="mb-4 mb-lg-0 pr-lg-5">
                        <div class="footer-brand mb-4">
                            <h2 class="brand-title">Buddhist Art <span class="highlight">SPACE</span></h2>
                            <div class="brand-sub">{{ $i18n.locale === 'en' ? 'Mae Fah Luang University' : 'มหาวิทยาลัยแม่ฟ้าหลวง' }}</div>
                        </div>
                        <p class="brand-description mt-4">
                            {{ $i18n.locale === 'en' ? 'A digital space for learning, archiving, and disseminating contemporary Buddhist artwork to support creativity, knowledge extension, and the cultural creative economy.' : 'พื้นที่ดิจิทัลสำหรับการเรียนรู้ จัดเก็บ และเผยแพร่ผลงานพุทธศิลปกรรมร่วมสมัย เพื่อสนับสนุนการสร้างสรรค์ ต่อยอดองค์ความรู้ และเศรษฐกิจสร้างสรรค์ทางศิลปวัฒนธรรม' }}
                        </p>
                    </CCol>

                    <!-- Column 2: Quick Links -->
                    <CCol md="4" lg="2" class="mb-4 mb-lg-0">
                        <h5 class="footer-heading text-uppercase mb-4">{{ $i18n.locale === 'en' ? 'Quick Links' : 'เมนูแนะนำ' }}</h5>
                        <ul class="footer-nav list-unstyled">
                            <li><router-link to="/">{{ $t('header.home') }}</router-link></li>
                            <li><router-link to="/artworks">{{ $t('header.artworks') }}</router-link></li>
                            <li><router-link to="/news">{{ $t('header.news') }}</router-link></li>
                            <li><a href="https://buddhistart.mfu.ac.th/" target="_blank" rel="noopener noreferrer">{{ $t('header.about') }}</a></li>
                            <li><router-link to="/contact">{{ $t('header.contact') }}</router-link></li>
                        </ul>
                    </CCol>

                    <!-- Column 3: Contact Info -->
                    <CCol md="8" lg="5" class="mb-4 mb-lg-0 ml-lg-auto pl-lg-4">
                        <h5 class="footer-heading text-uppercase mb-4">{{ $i18n.locale === 'en' ? 'Contact Us' : 'ติดต่อเรา' }}</h5>
                        <div class="contact-info">
                            <div class="contact-item d-flex mb-4">
                                <div class="contact-icon mr-3 mt-1">
                                    <CIcon name="cil-institution" />
                                </div>
                                <div class="contact-text" style="line-height: 1.6;">
                                    <div class="mb-1">{{ $i18n.locale === 'en' ? 'Academic Services Division, Mae Fah Luang University,' : 'ศูนย์บริการวิชาการ (ฝ่ายบริการวิชาการ) มหาวิทยาลัยแม่ฟ้าหลวง' }}</div>
                                    <div>{{ $i18n.locale === 'en' ? 'Gen. Sampao Choosri Building (E4)' : 'อาคารพลเอกสำเภา ชูศรี (E4)' }}</div>
                                </div>
                            </div>
                            <div class="contact-item d-flex mb-4">
                                <div class="contact-icon mr-3 mt-1">
                                    <CIcon name="cil-location-pin" />
                                </div>
                                <div class="contact-text" style="line-height: 1.6;">
                                    {{ $i18n.locale === 'en' ? '333 Moo 1, Thasud, Muang, Chiang Rai 57100' : 'ที่อยู่ 333 หมู่ 1 ต.ท่าสุด อ.เมือง จ.เชียงราย 57100' }}
                                </div>
                            </div>
                            <div class="contact-item d-flex mb-4">
                                <div class="contact-icon mr-3 mt-1">
                                    <CIcon name="cil-phone" />
                                </div>
                                <div class="contact-text" style="line-height: 1.6;">
                                    {{ $i18n.locale === 'en' ? 'Tel:' : 'โทรศัพท์:' }} 053-917-897 {{ $i18n.locale === 'en' ? 'ext.' : 'ต่อ' }} 8035 {{ $i18n.locale === 'en' ? 'to' : 'ถึง' }} 8036
                                </div>
                            </div>
                            <div class="contact-item d-flex mb-4">
                                <div class="contact-icon mr-3 mt-1">
                                    <CIcon name="cil-envelope-closed" />
                                </div>
                                <div class="contact-text" style="line-height: 1.6;">
                                    {{ $i18n.locale === 'en' ? 'Email:' : 'อีเมล:' }} <a href="mailto:buddhistart@mfu.ac.th" class="text-white text-decoration-none">buddhistart@mfu.ac.th</a>
                                </div>
                            </div>
                            <div class="contact-item d-flex mb-4">
                                <div class="contact-icon mr-3 mt-1">
                                    <CIcon name="cil-globe-alt" />
                                </div>
                                <div class="contact-text" style="line-height: 1.6;">
                                    {{ $i18n.locale === 'en' ? 'Website:' : 'เว็บไซต์:' }} <a href="https://buddhistart.mfu.ac.th" target="_blank" class="text-white text-decoration-none">Buddhistart.mfu.ac.th</a>
                                </div>
                            </div>
                            <div class="contact-item d-flex mb-4">
                                <div class="contact-icon mr-3 mt-1">
                                    <CIcon name="cib-facebook" />
                                </div>
                                <div class="contact-text" style="line-height: 1.6;">
                                    {{ $i18n.locale === 'en' ? 'Facebook:' : 'เฟสบุ๊ก:' }} <a href="https://facebook.com/BuddhistArtMFU" target="_blank" class="text-white text-decoration-none">Buddhist Art MFU</a>
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
                        &copy; {{ new Date().getFullYear() }} Center for Buddhist Art, Mae Fah Luang University. All rights reserved.
                    </p>
                    <div class="footer-policy mt-3 mt-md-0">
                        <a href="#" class="small text-muted mr-3">{{ $i18n.locale === 'en' ? 'Privacy Policy' : 'นโยบายความเป็นส่วนตัว' }}</a>
                        <a href="#" class="small text-muted">{{ $i18n.locale === 'en' ? 'Terms of Service' : 'ข้อกำหนดการให้บริการ' }}</a>
                    </div>
                </div>
            </CContainer>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'TheFooterUser'
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
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
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

.social-links {
    display: flex;
    gap: 15px;
}

.social-btn {
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
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

.footer-map-deco {
    height: 100px;
    background: linear-gradient(rgba(74, 29, 24, 0.8), rgba(74, 29, 24, 0.8)), url('~@/assets/images/backgrounds/news_hero.png');
    background-size: cover;
    background-position: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.footer-map-deco:hover {
    filter: brightness(1.2);
    border-color: #f0c24d !important;
}

.map-overlay {
    height: 100%;
    color: #fff;
    font-weight: 600;
    font-size: 0.9rem;
}

.border-secondary {
    border-color: rgba(255,255,255,0.1) !important;
}

@media (max-width: 991.98px) {
    .footer-heading {
        margin-top: 20px;
    }
}
</style>
