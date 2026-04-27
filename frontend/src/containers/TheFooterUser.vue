<template>
    <footer class="footer-user">
        <div class="footer-main py-5">
            <CContainer>
                <CRow>
                    <!-- Column 1: Brand & Identity -->
                    <CCol lg="4" class="mb-4 mb-lg-0 pr-lg-5">
                        <div class="footer-brand mb-4">
                            <h2 class="brand-title">BUDDHIST <span class="highlight">ART MFU</span></h2>
                            <div class="brand-sub">ศูนย์พุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง</div>
                        </div>
                        <p class="brand-description">
                            แหล่งเรียนรู้และอนุรักษ์พุทธศิลปกรรมล้านนาและร่วมสมัย 
                            มุ่งเน้นการเผยแพร่ สืบทอด และสร้างสรรค์ผลงานพุทธศิลป์ 
                            เพื่อสืบสานมรดกทางวัฒนธรรมอันล้ำค่าของชาติ
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
                        <h5 class="footer-heading text-uppercase mb-4">เมนูแนะนำ</h5>
                        <ul class="footer-nav list-unstyled">
                            <li><router-link to="/">หน้าหลัก</router-link></li>
                            <li><router-link to="/artworks">ผลงานพุทธศิลป์</router-link></li>
                            <li><router-link to="/news">ข่าวสารและกิจกรรม</router-link></li>
                            <li><router-link to="/track-order">เช็คสถานะคำสั่งซื้อ</router-link></li>
                            <li><router-link to="/login">เข้าสู่ระบบ (ศิลปิน/แอดมิน)</router-link></li>
                        </ul>
                    </CCol>

                    <!-- Column 3: Contact Info -->
                    <CCol md="8" lg="6" class="mb-4 mb-lg-0 pl-lg-5">
                        <h5 class="footer-heading text-uppercase mb-4">ติดต่อเรา</h5>
                        <div class="contact-info">
                            <div class="contact-item d-flex mb-3">
                                <div class="contact-icon mr-3">
                                    <CIcon name="cil-location-pin" />
                                </div>
                                <div class="contact-text">
                                    มหาวิทยาลัยแม่ฟ้าหลวง 333 หมู่ 1 ต.ท่าสุด อ.เมือง จ.เชียงราย 57100
                                </div>
                            </div>
                            <div class="contact-item d-flex mb-3">
                                <div class="contact-icon mr-3">
                                    <CIcon name="cil-phone" />
                                </div>
                                <div class="contact-text">
                                    โทรศัพท์: 0-5391-6000, 0-5391-7034
                                </div>
                            </div>
                            <div class="contact-item d-flex">
                                <div class="contact-icon mr-3">
                                    <CIcon name="cil-clock" />
                                </div>
                                <div class="contact-text">
                                    เวลาทำการ: จันทร์ - ศุกร์ | 08:00 - 16:00 น.
                                </div>
                            </div>
                        </div>
                        
                        <!-- Map Placeholder / Decorative element -->
                        <div class="footer-map-deco mt-4 rounded-lg overflow-hidden border border-secondary shadow-sm">
                            <div class="map-overlay d-flex align-items-center justify-content-center">
                                <CIcon name="cil-map" size="xl" class="mr-2" />
                                <span>แผนที่มหาวิทยาลัยแม่ฟ้าหลวง</span>
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
                        <a href="#" class="small text-muted mr-3">Privacy Policy</a>
                        <a href="#" class="small text-muted">Terms of Service</a>
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
.footer-user {
    background-color: #12141a;
    color: #cbd5e0;
    font-family: 'Sarabun', sans-serif;
    position: relative;
    z-index: 100;
}

.footer-main {
    border-top: 4px solid #612721;
}

.bg-darker {
    background-color: #0a0c10;
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
    color: #612721;
}

.brand-sub {
    font-size: 0.9rem;
    font-weight: 600;
    color: #a0aec0;
    letter-spacing: 0.5px;
}

.brand-description {
    line-height: 1.7;
    color: #718096;
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
    background: #612721;
    border-radius: 2px;
}

.footer-nav li {
    margin-bottom: 12px;
}

.footer-nav a {
    color: #a0aec0;
    text-decoration: none;
    transition: all 0.25s ease;
    font-weight: 500;
}

.footer-nav a:hover {
    color: #fff;
    padding-left: 8px;
}

.contact-icon {
    color: #612721;
    min-width: 24px;
}

.contact-text {
    font-size: 0.95rem;
}

.social-links {
    display: flex;
    gap: 15px;
}

.social-btn {
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a0aec0;
    transition: all 0.3s ease;
    text-decoration: none !important;
}

.social-btn:hover {
    background: #612721;
    color: #fff;
    transform: translateY(-3px);
}

.footer-map-deco {
    height: 100px;
    background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('~@/assets/images/backgrounds/news_hero.png');
    background-size: cover;
    background-position: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.footer-map-deco:hover {
    filter: brightness(1.2);
}

.map-overlay {
    height: 100%;
    color: #fff;
    font-weight: 600;
    font-size: 0.9rem;
}

.border-secondary {
    border-color: rgba(255,255,255,0.05) !important;
}

@media (max-width: 991.98px) {
    .footer-heading {
        margin-top: 20px;
    }
}
</style>
