<template>
    <div class="user-about bg-white min-vh-100">
        <!-- Section 1: Header (Artwork Style) -->
        <section class="about-header mb-5">
            <div class="header-overlay"></div>
            <CContainer class="header-content-wrapper">
                <div class="header-text-content">
                    <div class="reveal-animation">
                        <h1 class="header-title text-uppercase mb-2">About <span class="text-highlight">Us</span></h1>
                        <div class="title-separator mb-4"></div>
                        <p class="header-subtitle mb-0">
                            ศูนย์พุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง <br class="d-none d-md-block">
                            สืบสาน พัฒนา และเผยแพร่คุณค่าแห่งพุทธศิลป์ล้านนาสู่สากล
                        </p>
                    </div>
                </div>
            </CContainer>
            <div class="decorative-blob"></div>
        </section>

        <!-- Section 2: Contact & Description -->
        <CContainer class="pb-5">
            <CRow>
                <!-- Description Card -->
                <CCol lg="12" class="mb-5">
                    <CCard class="contact-card border-0 shadow-sm p-4 overflow-hidden">
                        <div class="card-accent-bar"></div>
                        <CCardBody>
                            <h2 class="section-title mb-4 font-weight-bold">วิสัยทัศน์และพันธกิจ</h2>
                            <p class="lead text-muted line-height-2">
                                ศูนย์พุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง ก่อตั้งขึ้นเพื่อเป็นแหล่งเรียนรู้และรวบรวมมรดกทางวัฒนธรรมพุทธศิลป์ที่ล้ำค่า 
                                โดยมุ่งเน้นการวิจัย การอนุรักษ์ และการต่อยอดศิลปกรรมไทยให้เข้ากับยุคสมัย เพื่อสร้างความเข้าใจที่ลึกซึ้งในจิตวิญญาณแห่งศิลปะและศาสนา
                            </p>
                        </CCardBody>
                    </CCard>
                </CCol>

                <!-- Contact Info Card -->
                <CCol lg="6" class="mb-5">
                    <CCard class="contact-card premium-card border-0 shadow-sm h-100 p-4 position-relative overflow-hidden">
                        <div class="card-accent-bar"></div>
                        <div class="card-watermark"><CIcon name="cil-institution" size="custom-size" style="width: 250px; height: 250px;" /></div>
                        <CCardBody class="position-relative z-index-2">
                            <h3 class="font-weight-bold mb-3 section-title">Contact Information</h3>
                            <div class="title-separator-sm mb-4"></div>
                            <p class="text-muted mb-5">
                                Reach out to us for inquiries regarding exhibitions, collaborations, or educational programs.
                            </p>
                            
                            <div class="contact-item d-flex align-items-center mb-4 premium-hover">
                                <div class="contact-icon-box shadow-sm mr-4">
                                    <CIcon name="cil-location-pin" size="lg" />
                                </div>
                                <div>
                                    <h6 class="font-weight-bold mb-1 text-dark">Address</h6>
                                    <span class="text-muted">333 หมู่ 1 ต.ท่าสุด อ.เมือง จ.เชียงราย 57100</span>
                                </div>
                            </div>
                            
                            <div class="contact-item d-flex align-items-center mb-4 premium-hover">
                                <div class="contact-icon-box shadow-sm mr-4">
                                    <CIcon name="cil-phone" size="lg" />
                                </div>
                                <div>
                                    <h6 class="font-weight-bold mb-1 text-dark">Phone</h6>
                                    <span class="text-muted">0-5391-6000, 0-5391-7034</span>
                                </div>
                            </div>
                            
                            <div class="contact-item d-flex align-items-center mb-4 premium-hover">
                                <div class="contact-icon-box shadow-sm mr-4">
                                    <CIcon name="cil-envelope-closed" size="lg" />
                                </div>
                                <div>
                                    <h6 class="font-weight-bold mb-1 text-dark">Email</h6>
                                    <span class="text-muted">pr@mfu.ac.th</span>
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>

                <!-- Send us a Message Card -->
                <CCol lg="6" class="mb-5">
                    <CCard class="contact-card premium-card border-0 shadow-sm h-100 p-4 position-relative overflow-hidden">
                        <div class="card-accent-bar-right"></div>
                        <CCardBody class="position-relative z-index-2">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h3 class="font-weight-bold mb-2 section-title">Send a Message</h3>
                                    <div class="title-separator-sm"></div>
                                </div>
                                <CButton color="facebook" shape="pill" class="d-flex align-items-center shadow-sm hover-lift btn-sm px-3" href="https://facebook.com" target="_blank">
                                    <CIcon name="cib-facebook" class="mr-2" /> Follow Us
                                </CButton>
                            </div>
                            
                            <CForm @submit.prevent="submitForm" class="mt-4">
                                <CRow>
                                    <CCol md="6" class="mb-3">
                                        <label class="form-label-custom">Full Name</label>
                                        <CInput placeholder="John Doe" class="custom-input-premium" />
                                    </CCol>
                                    <CCol md="6" class="mb-3">
                                        <label class="form-label-custom">Email Address</label>
                                        <CInput placeholder="john@example.com" type="email" class="custom-input-premium" />
                                    </CCol>
                                    <CCol md="12" class="mb-4">
                                        <label class="form-label-custom">Your Message</label>
                                        <CTextarea placeholder="How can we help you?" rows="4" class="custom-input-premium" />
                                    </CCol>
                                </CRow>
                                <CButton class="btn-premium px-5 py-2 font-weight-bold shadow hover-lift w-100 mt-2">
                                    Submit Message <CIcon name="cil-envelope-closed" class="ml-2" />
                                </CButton>
                            </CForm>
                        </CCardBody>
                    </CCard>
                </CCol>

                <!-- Google Map Section -->
                <CCol lg="12">
                    <CCard class="contact-card border-0 shadow-sm overflow-hidden" style="height: 450px;">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3748.455243160867!2d99.8924083154146!3d20.045952925763076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30d7010468903c73%3A0xc38330777e38318b!2sMae%20Fah%20Luang%20University!5e0!3m2!1sen!2sth!4v1650785000000!5m2!1sen!2sth" 
                            width="100%" 
                            height="100%" 
                            style="border:0;" 
                            allowfullscreen="" 
                            loading="lazy">
                        </iframe>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'About',
    methods: {
        submitForm() {
            // Logic for form submission
            alert('Message Sent!');
        }
    }
}
</script>

<style scoped>
.about-header {
    position: relative;
    height: 500px;
    display: flex;
    align-items: center;
    background-image: url('../../assets/images/backgrounds/about_hero.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    margin-top: -80px; 
    padding-top: 80px;
    overflow: hidden;
    color: white;
}

.header-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
        rgba(0,0,0,0.85) 0%, 
        rgba(0,0,0,0.6) 40%, 
        rgba(0,0,0,0.3) 100%);
    z-index: 1;
}

.header-content-wrapper {
    position: relative;
    z-index: 2;
}

.header-text-content {
    max-width: 800px;
}

.header-title {
    font-family: 'Cinzel', serif;
    font-size: 3.5rem;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: 2px;
    text-shadow: 0 10px 30px rgba(0,0,0,0.5);
    animation: fadeInLeft 1s ease-out 0.2s both;
}

.text-highlight {
    color: white;
    -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.4);
    font-style: italic;
    text-shadow: 0 0 20px rgba(255,255,255,0.3);
}

.title-separator {
    width: 60px;
    height: 4px;
    background: #612721;
    border-radius: 2px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    animation: scaleIn 0.8s ease-out 0.5s both;
}

.header-subtitle {
    font-family: 'Sarabun', sans-serif;
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.6;
    color: white;
    letter-spacing: 0.5px;
    text-shadow: 0 4px 12px rgba(0,0,0,0.6);
    animation: fadeInUp 1s ease-out 0.6s both;
}

.decorative-blob {
    position: absolute;
    bottom: -50px;
    right: -50px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(97, 39, 33, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(40px);
    z-index: 1;
}

/* Animations */
@keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
    from { opacity: 0; transform: scaleX(0); transform-origin: left; }
    to { opacity: 1; transform: scaleX(1); transform-origin: left; }
}

/* Rest of the styles from previous session */
.contact-card {
    border-radius: 24px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 6px;
    background: #612721;
}

.section-title {
    color: #612721;
    position: relative;
}

.line-height-2 {
    line-height: 2;
}

.contact-icon-box {
    width: 45px;
    height: 45px;
    background: #f8f1f0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #612721;
    font-size: 1.2rem;
}

.custom-input ::v-deep .form-control {
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    padding: 12px 15px;
    height: auto;
    transition: all 0.3s ease;
}

.custom-input ::v-deep .form-control:focus {
    border-color: #612721;
    box-shadow: 0 0 0 0.2rem rgba(97, 39, 33, 0.1);
}

.hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
    transform: translateY(-3px);
}

/* Premium Card Styles */
.premium-card {
    background: linear-gradient(135deg, #ffffff 0%, #fdfcfb 100%);
    border: 1px solid rgba(97, 39, 33, 0.05) !important;
}

.premium-card:hover {
    box-shadow: 0 15px 35px rgba(97, 39, 33, 0.08) !important;
    transform: translateY(-5px);
}

.card-accent-bar-right {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 6px;
    background: linear-gradient(to bottom, #d4af37, #f3e5ab);
}

.card-watermark {
    position: absolute;
    right: -40px;
    bottom: -40px;
    opacity: 0.04;
    color: #612721;
    z-index: 1;
    pointer-events: none;
    transform: rotate(-15deg);
}

.z-index-2 {
    z-index: 2;
}

.title-separator-sm {
    width: 40px;
    height: 3px;
    background: #d4af37;
    border-radius: 2px;
}

.premium-hover {
    transition: all 0.3s ease;
    padding: 10px;
    border-radius: 12px;
    margin-left: -10px;
    margin-right: -10px;
}

.premium-hover:hover {
    background: rgba(97, 39, 33, 0.03);
    transform: translateX(5px);
}

.contact-icon-box {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #612721 0%, #8a3a31 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;
}

.premium-hover:hover .contact-icon-box {
    transform: scale(1.1) rotate(5deg);
    background: linear-gradient(135deg, #d4af37 0%, #b5952f 100%);
    box-shadow: 0 8px 15px rgba(212, 175, 55, 0.3) !important;
}

.form-label-custom {
    font-weight: 600;
    color: #4a5568;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.custom-input-premium ::v-deep .form-control {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 0.75rem 1rem;
    background-color: #f8fafc;
    transition: all 0.3s ease;
    color: #2d3748;
    height: auto;
}

.custom-input-premium ::v-deep .form-control:focus {
    background-color: #ffffff;
    border-color: #d4af37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
}

.btn-premium {
    background: linear-gradient(135deg, #612721 0%, #8a3a31 100%);
    color: white !important;
    border: none;
    border-radius: 50px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.btn-premium:hover {
    background: linear-gradient(135deg, #8a3a31 0%, #612721 100%);
    box-shadow: 0 8px 20px rgba(97, 39, 33, 0.25) !important;
    transform: translateY(-2px);
}

@media (max-width: 991.98px) {
    .about-header { height: 400px; }
    .header-title { font-size: 2.8rem; }
}
</style>
