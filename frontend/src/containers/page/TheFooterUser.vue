<template>
    <footer class="footer-user">
        <div class="footer-main py-5">
            <CContainer>
                <CRow>
                    <!-- Column 1: Brand & Identity -->
                    <CCol lg="4" class="mb-4 mb-lg-0 pr-lg-5">
                        <div class="footer-brand mb-4">
                            <h2 class="brand-title">BUDDHIST <span class="highlight">ART MFU</span></h2>
                            <div class="brand-sub">{{ $i18n.locale === 'en' ? 'Center for Buddhist Art, Mae Fah Luang University' : 'ศูนย์พุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง' }}</div>
                        </div>
                        <p class="brand-description">
                            {{ $i18n.locale === 'en' ? 'A center for learning and preserving Lanna and contemporary Buddhist art. Dedicated to the dissemination, inheritance, and creation of Buddhist artworks to sustain the nation\'s invaluable cultural heritage.' : 'แหล่งเรียนรู้และอนุรักษ์พุทธศิลปกรรมล้านนาและร่วมสมัย มุ่งเน้นการเผยแพร่ สืบทอด และสร้างสรรค์ผลงานพุทธศิลป์ เพื่อสืบสานมรดกทางวัฒนธรรมอันล้ำค่าของชาติ' }}
                        </p>
                        <div class="social-links mt-4">
                            <a href="#" class="social-btn"><CIcon name="cib-facebook" /></a>
                            <a href="#" class="social-btn"><CIcon name="cib-instagram" /></a>
                            <a href="#" class="social-btn"><CIcon name="cib-youtube" /></a>
                            <a href="#" class="social-btn"><CIcon name="cil-envelope-closed" /></a>
                        </div>
                    </CCol>

                    <!-- Column 2: Quick Links -->
                    <CCol md="4" lg="2" class="mb-4 mb-lg-0">
                        <h5 class="footer-heading text-uppercase mb-4">{{ $i18n.locale === 'en' ? 'Quick Links' : 'เมนูแนะนำ' }}</h5>
                        <ul class="footer-nav list-unstyled">
                            <li><router-link to="/">{{ $i18n.locale === 'en' ? 'Home' : 'หน้าหลัก' }}</router-link></li>
                            <li><router-link to="/artworks">{{ $i18n.locale === 'en' ? 'Artworks' : 'ผลงานพุทธศิลป์' }}</router-link></li>
                            <li><router-link to="/news">{{ $i18n.locale === 'en' ? 'News & Events' : 'ข่าวสารและกิจกรรม' }}</router-link></li>
                            <li><router-link to="/track-order">{{ $i18n.locale === 'en' ? 'Track Order' : 'เช็คสถานะคำสั่งซื้อ' }}</router-link></li>
                            <li><router-link to="/login">{{ $i18n.locale === 'en' ? 'Login (Artist/Admin)' : 'เข้าสู่ระบบ (ศิลปิน/แอดมิน)' }}</router-link></li>
                        </ul>
                    </CCol>

                    <!-- Column 3: Contact Info -->
                    <CCol md="8" lg="6" class="mb-4 mb-lg-0 pl-lg-5">
                        <h5 class="footer-heading text-uppercase mb-4">{{ $i18n.locale === 'en' ? 'Contact Us' : 'ติดต่อเรา' }}</h5>
                        <div class="contact-info">
                            <div class="contact-item d-flex mb-3">
                                <div class="contact-icon mr-3">
                                    <CIcon name="cil-location-pin" />
                                </div>
                                <div class="contact-text">
                                    {{ $i18n.locale === 'en' ? 'Mae Fah Luang University 333 Moo 1, Thasud, Muang, Chiang Rai 57100' : 'มหาวิทยาลัยแม่ฟ้าหลวง 333 หมู่ 1 ต.ท่าสุด อ.เมือง จ.เชียงราย 57100' }}
                                </div>
                            </div>
                            <div class="contact-item d-flex mb-3">
                                <div class="contact-icon mr-3">
                                    <CIcon name="cil-phone" />
                                </div>
                                <div class="contact-text">
                                    {{ $i18n.locale === 'en' ? 'Tel:' : 'โทรศัพท์:' }} 0-5391-6000, 0-5391-7034
                                </div>
                            </div>
                            <div class="contact-item d-flex">
                                <div class="contact-icon mr-3">
                                    <CIcon name="cil-clock" />
                                </div>
                                <div class="contact-text">
                                    {{ $i18n.locale === 'en' ? 'Office Hours: Mon - Fri | 08:00 - 16:00' : 'เวลาทำการ: จันทร์ - ศุกร์ | 08:00 - 16:00 น.' }}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Map Placeholder / Decorative element -->
                        <div class="footer-map-deco mt-4 rounded-lg overflow-hidden border border-secondary shadow-sm">
                            <div class="map-overlay d-flex align-items-center justify-content-center">
                                <CIcon name="cil-map" size="xl" class="mr-2" />
                                <span>{{ $i18n.locale === 'en' ? 'Mae Fah Luang University Map' : 'แผนที่มหาวิทยาลัยแม่ฟ้าหลวง' }}</span>
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
