<template>
    <div class="home-hero bg-white py-5 d-flex align-items-center">
        <CContainer class="my-4">
            <CRow class="align-items-center">
                <!-- Left: Text Content -->
                <CCol lg="6" class="hero-text-col mb-5 mb-lg-0">
                    <div class="reveal-animation">
                        <span class="badge text-uppercase font-weight-bold px-3 py-2 mb-3 badge-short-course">
                            {{ $i18n.locale === 'en' ? 'Short Course Program' : 'หลักสูตรระยะสั้นพุทธศิลปกรรม' }}
                        </span>
                        <h1 class="hero-title text-uppercase mb-3">
                            Buddhist <span class="text-highlight">Art MFU</span>
                        </h1>
                        <div class="title-separator mb-4"></div>
                        <p class="hero-subtitle mb-4">
                            {{ $i18n.locale === 'en' ? 'Buddhist Art Center, Mae Fah Luang University' : 'ศูนย์พุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง' }} <br>
                            <span class="sub-description mt-2 d-block">
                                {{ $i18n.locale === 'en' ? 'A center for learning and preserving Lanna and Lanna contemporary Buddhist art' : 'หลักสูตรระยะสั้นที่จะเปิดโลกจินตนาการและการสร้างสรรค์ทางพุทธศิลปกรรมร่วมสมัยและล้านนา' }}
                            </span>
                        </p>
                        <div class="d-flex align-items-center btn-group-hero">
                            <CButton color="danger" class="px-5 py-3 font-weight-bold shadow-lg mr-3 btn-main" @click="$router.push('/artworks')">
                                {{ $i18n.locale === 'en' ? 'Expo Art' : 'ชมนิทรรศการ Expo Art' }}
                            </CButton>
                            <CButton color="dark" variant="outline" class="px-4 py-3 font-weight-bold btn-outline-custom" @click="$router.push('/news')">
                                {{ $i18n.locale === 'en' ? 'News & Activities' : 'ข่าวสารและกิจกรรม' }}
                            </CButton>
                        </div>
                    </div>
                </CCol>
                
                <!-- Right: Image -->
                <CCol lg="6" class="hero-img-col d-flex justify-content-center">
                    <div class="hero-img-wrapper position-relative">
                        <div class="hero-img-bg-deco"></div>
                        <img :src="require('@/assets/images/art_student_hero.png')" alt="Art Students" class="img-fluid hero-main-img">
                    </div>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'SectionHeroHome'
}
</script>

<style scoped>
.home-hero {
    position: relative;
    min-height: 580px;
    overflow: hidden;
    color: #2c3e50;
    background-color: #fafafa !important;
}

.badge-short-course {
    color: #612721; 
    background-color: rgba(97,39,33,0.08); 
    border-radius: 50px; 
    font-size: 0.8rem; 
    letter-spacing: 1px;
}

.hero-title {
    font-family: 'Cinzel', serif;
    font-size: 3.6rem;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: 1px;
    animation: fadeInLeft 1s ease-out both;
}

.text-highlight {
    color: #612721;
}

.title-separator {
    width: 80px;
    height: 5px;
    background: #612721;
    border-radius: 2px;
    animation: scaleIn 0.8s ease-out 0.2s both;
}

.hero-subtitle {
    font-family: 'Sarabun', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #4a5568;
    line-height: 1.5;
    animation: fadeInUp 1s ease-out 0.3s both;
}

.sub-description {
    font-size: 1.05rem;
    font-weight: 400;
    color: #718096;
    line-height: 1.6;
}

.btn-main {
    background-color: #612721 !important;
    border-color: #612721 !important;
    color: white !important;
    border-radius: 50px;
    font-size: 1.05rem;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.btn-main:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(97, 39, 33, 0.35) !important;
}

.btn-outline-custom {
    border-radius: 50px;
    border-color: #718096 !important;
    color: #4a5568 !important;
    font-size: 1.05rem;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.btn-outline-custom:hover {
    background-color: #4a5568 !important;
    color: white !important;
    border-color: #4a5568 !important;
    transform: translateY(-3px);
}

/* Image styling with Gallery frame */
.hero-img-wrapper {
    max-width: 480px;
    width: 100%;
    animation: fadeInRight 1s ease-out 0.2s both;
}

.hero-main-img {
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    border: 10px solid white;
    background-color: white;
    width: 100%;
    height: 400px;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.hero-img-wrapper:hover .hero-main-img {
    transform: scale(1.02) rotate(1deg);
}

/* Decorative backdrop glow */
.hero-img-bg-deco {
    position: absolute;
    top: -20px;
    left: -20px;
    width: 100%;
    height: 100%;
    background: #FEC260;
    border-radius: 24px;
    opacity: 0.15;
    z-index: -1;
    transition: transform 0.5s ease;
}

.hero-img-wrapper:hover .hero-img-bg-deco {
    transform: translate(10px, 10px);
}

/* Animations */
@keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
    from { transform: scaleX(0); transform-origin: left; }
    to { transform: scaleX(1); transform-origin: left; }
}

@media (max-width: 991.98px) {
    .home-hero {
        padding: 4rem 0 !important;
    }
    .hero-title {
        font-size: 2.8rem;
    }
    .hero-subtitle {
        font-size: 1.15rem;
    }
    .hero-main-img {
        height: 320px;
        margin-top: 2rem;
    }
}

@media (max-width: 575.98px) {
    .hero-title {
        font-size: 2.2rem;
    }
    .btn-group-hero {
        flex-direction: column;
        align-items: stretch !important;
        width: 100%;
    }
    .btn-group-hero button, .btn-group-hero a {
        margin-right: 0 !important;
        margin-bottom: 1rem;
        width: 100%;
    }
}
</style>
