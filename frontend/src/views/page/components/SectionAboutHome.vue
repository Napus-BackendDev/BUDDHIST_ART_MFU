<template>
    <div class="about-home-section py-5 bg-light border-top">
        <CContainer class="my-4">
            <CRow class="align-items-center">
                <!-- Left: Content Description -->
                <CCol lg="6" class="mb-5 mb-lg-0 pr-lg-5">
                    <span class="badge text-uppercase font-weight-bold px-3 py-2 mb-3" style="color: #612721; background-color: rgba(97,39,33,0.08); border-radius: 50px; font-size: 0.8rem; letter-spacing: 1px;">
                        {{ $i18n.locale === 'en' ? 'Our Legacy & Vision' : 'มรดกทางวัฒนธรรมและวิสัยทัศน์' }}
                    </span>
                    <h2 class="font-weight-bold mb-4" style="color: #2c3e50; font-family: 'Cinzel', serif; font-size: 2.4rem;">
                        {{ $i18n.locale === 'en' ? 'Preserving Buddhist Art' : 'สืบสานและสร้างสรรค์พุทธศิลป์' }}
                    </h2>
                    <p class="lead text-muted mb-4" style="font-family: 'Sarabun', sans-serif; font-size: 1.1rem; line-height: 1.7; font-weight: 500;">
                        {{ $i18n.locale === 'en' 
                            ? 'Our Lanna contemporary art short courses aim to protect traditional Northern Thai art forms while fostering creative modern adaptations.' 
                            : 'หลักสูตรระยะสั้นการสร้างสรรค์พุทธศิลปกรรมร่วมสมัยของเรา มุ่งเน้นการถ่ายทอดองค์ความรู้และสืบสานอัตลักษณ์ความงามทางพุทธศิลป์ล้านนา เพื่อพัฒนาสู่นวัตกรรมทางวัฒนธรรมและความคิดสร้างสรรค์ในโลกสมัยใหม่' }}
                    </p>
                    <p class="text-muted mb-4" style="font-family: 'Sarabun', sans-serif; font-size: 0.95rem; line-height: 1.7;">
                        {{ $i18n.locale === 'en' 
                            ? 'Supported by the Academic Services Division and the Buddhist Art Preservation Fund at Mae Fah Luang University, this digital space displays and sells authentic masterpieces from course students and professional artists. Proceeds directly support traditional arts education.' 
                            : 'ภายใต้การดูแลร่วมกันของศูนย์บริการวิชาการ มหาวิทยาลัยแม่ฟ้าหลวง และโครงการกองทุนพัฒนาพุทธศิลป์ พื้นที่ดิจิทัลนี้ทำหน้าที่จัดแสดงและส่งเสริมงานสะสมงานศิลปกรรมพุทธศิลป์ล้านนาแท้จริงจากฝีมือนักศึกษาและศิลปิน เพื่อนำรายได้กลับไปสนับสนุนการส่งเสริมโอกาสทางการศึกษาด้านวิชาการศิลปวัฒนธรรมอย่างยั่งยืน' }}
                    </p>
                    <div class="mt-4">
                        <a href="https://buddhistart.mfu.ac.th/" target="_blank" rel="noopener noreferrer" class="btn px-4 py-3 font-weight-bold btn-custom-about">
                            {{ $i18n.locale === 'en' ? 'Learn More About Us' : 'ทำความรู้จักเราเพิ่มเติม' }}
                            <CIcon name="cil-external-link" size="sm" class="ml-2" />
                        </a>
                    </div>
                </CCol>

                <!-- Right: Generated Image -->
                <CCol lg="6" class="d-flex justify-content-center">
                    <div class="about-img-wrapper position-relative">
                        <div class="about-img-bg-deco"></div>
                        <img :src="require('@/assets/images/about_us_home.png')" alt="Lanna Art Studio" class="img-fluid about-main-img">
                    </div>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'SectionAboutHome'
}
</script>

<style scoped>
.about-home-section {
    background-color: #fafafa !important;
}

.btn-custom-about {
    background-color: #612721;
    color: white !important;
    border-radius: 50px;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 4px 10px rgba(97, 39, 33, 0.2);
}

.btn-custom-about:hover {
    background-color: #4a1d18;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(97, 39, 33, 0.3);
}

/* Image styling */
.about-img-wrapper {
    max-width: 480px;
    width: 100%;
}

.about-main-img {
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
    border: 8px solid white;
    background-color: white;
    width: 100%;
    height: 380px;
    object-fit: cover;
    transition: transform 0.5s ease;
    z-index: 2;
    position: relative;
}

.about-img-wrapper:hover .about-main-img {
    transform: scale(1.02) rotate(-1deg);
}

/* Decorative background card */
.about-img-bg-deco {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 100%;
    height: 100%;
    background: #612721;
    border-radius: 20px;
    opacity: 0.08;
    z-index: 1;
    transition: transform 0.5s ease;
}

.about-img-wrapper:hover .about-img-bg-deco {
    transform: translate(-10px, -10px);
}

@media (max-width: 991.98px) {
    .about-main-img {
        height: 300px;
        margin-top: 2rem;
    }
}
</style>
