<template>
    <div class="home-hero py-5 d-flex align-items-center position-relative overflow-hidden">
        <HeroGravityVisual variant="home" light />

        <CContainer class="my-4" style="position: relative; z-index: 2;">
            <CRow class="align-items-center">
                <!-- Left-aligned Text Content (Image Removed) -->
                <CCol lg="8" class="hero-text-col mb-5 mb-lg-0">
                    <div class="reveal-animation">
                        <span class="badge text-uppercase font-weight-bold px-3 py-2 mb-3 badge-short-course">
                            {{ $i18n.locale === 'en' ? 'Short Course Program in Buddhist Art, Mae Fah Luang University' : 'หลักสูตรระยะสั้น สาขาวิชาพุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง' }}
                        </span>
                        <h1 class="hero-title text-uppercase mb-3">
                            <span class="hero-title-line">
                                Buddhist <span class="text-highlight">Art Space</span>
                            </span>
                            <span class="hero-title-line hero-title-university">
                                Mae Fah Luang University
                            </span>
                        </h1>
                        <div class="title-separator mb-4"></div>
                        <p class="hero-subtitle mb-4" v-if="$i18n.locale === 'th'">
                            พื้นที่ดิจิทัลสำหรับรวบรวม และเผยแพร่ผลงานพุทธศิลปกรรมของหลักสูตรระยะสั้น<br class="d-none d-md-inline" />
                            สาขาวิชาพุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง เพื่อเชื่อมโยงการเรียนรู้<br class="d-none d-md-inline" />
                            การสร้างสรรค์ และคุณค่าทางศิลปวัฒนธรรมสู่สาธารณะ
                        </p>
                        <p class="hero-subtitle mb-4" v-else>
                            A digital platform for collecting and sharing Buddhist artworks created through<br class="d-none d-md-inline" />
                            Mae Fah Luang University’s Short Course Program in Buddhist Art, connecting<br class="d-none d-md-inline" />
                            learning, creativity, and cultural value with the public.
                        </p>
                        <div class="d-flex align-items-center btn-group-hero">
                            <CButton color="danger" class="px-5 py-3 font-weight-bold shadow-lg mr-3 btn-main" @click="$router.push('/artworks')">
                                {{ $i18n.locale === 'en' ? 'Artworks' : 'ผลงานศิลปะ' }}
                            </CButton>
                            <CButton color="dark" variant="outline" class="px-4 py-3 font-weight-bold btn-outline-custom" @click="$router.push('/news')">
                                {{ $i18n.locale === 'en' ? 'News & Activities' : 'ข่าวสารและกิจกรรม' }}
                            </CButton>
                        </div>
                    </div>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
import HeroGravityVisual from './HeroGravityVisual.vue'
export default {
    name: 'SectionHeroHome',
    components: { HeroGravityVisual }
}
</script>

<style scoped>
.home-hero {
    position: relative;
    min-height: 600px;
    padding: 7rem 0 !important;
    overflow: hidden;
    color: #2c3e50;
    background-color: #FFFFFF !important;
    border-bottom: 1px solid rgba(97, 39, 33, 0.06);
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

.hero-title-line {
    display: block;
    white-space: nowrap;
}

.hero-title-university {
    font-size: 0.72em;
    margin-top: 0.15em;
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
    font-size: 1.22rem;
    font-weight: 600;
    color: #4a5568;
    line-height: 1.75;
    word-break: keep-all;
    max-width: 820px;
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
    .hero-title-university {
        font-size: 0.7em;
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
    .badge-short-course {
        display: inline-flex;
        max-width: 100%;
        white-space: normal;
        line-height: 1.35;
    }
    .hero-title {
        font-size: clamp(1.55rem, 7.4vw, 2.2rem);
        letter-spacing: 0;
    }
    .hero-title-line {
        white-space: normal;
        overflow-wrap: anywhere;
    }
    .hero-title-university {
        font-size: 0.62em;
        margin-top: 0.3em;
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

/* Smooth Gravity Wave Lines */
.gravity-waves {
    position: absolute;
    top: 0;
    right: -5%;
    width: 55%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.wave-path {
    stroke-linecap: round;
    transform-origin: center;
}

.wave-1 {
    animation: waveMotion1 16s infinite ease-in-out alternate;
}

.wave-2 {
    animation: waveMotion2 20s infinite ease-in-out alternate;
}

.wave-3 {
    animation: waveMotion3 24s infinite ease-in-out alternate;
}

@keyframes waveMotion1 {
    0% {
        transform: scaleY(0.9) translateY(0) rotate(-2deg);
    }
    100% {
        transform: scaleY(1.1) translateY(20px) rotate(2deg);
    }
}

@keyframes waveMotion2 {
    0% {
        transform: scaleY(1.15) translateY(-10px) rotate(1deg);
    }
    100% {
        transform: scaleY(0.85) translateY(10px) rotate(-1deg);
    }
}

@keyframes waveMotion3 {
    0% {
        transform: scaleY(0.8) translateY(15px) rotate(-1deg);
    }
    100% {
        transform: scaleY(1.2) translateY(-15px) rotate(1deg);
    }
}
</style>
