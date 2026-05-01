<template>
    <div class="home-hero" :style="{ backgroundImage: `url(${require('@/assets/images/home_hero_gen.png')})` }">
        <div class="hero-overlay"></div>
        <CContainer class="hero-content-wrapper">
            <div class="hero-text-content">
                <div class="reveal-animation">
                    <h1 class="hero-title text-uppercase mb-2">Buddhist <span class="text-highlight">Art MFU</span></h1>
                    <div class="title-separator mb-4"></div>
                    <p class="hero-subtitle mb-4">
                        {{ $i18n.locale === 'en' ? 'Buddhist Art Center, Mae Fah Luang University' : 'ศูนย์พุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง' }} <br class="d-none d-md-block">
                        {{ $i18n.locale === 'en' ? 'A center for learning and preserving Lanna and contemporary Buddhist art' : 'ร่วมสมัย เป็น หลักสูตรระยะสั้น สาขาวิชาพุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง' }}
                    </p>
                    <div class="d-flex gap-3">
                        <CButton color="danger" shape="pill" class="px-5 py-3 font-weight-bold shadow-lg mr-3 btn-main" @click="$router.push('/artworks')">
                            {{ $i18n.locale === 'en' ? 'View Artworks' : 'ชมผลงานศิลปะ' }}
                        </CButton>
                        <CButton color="light" variant="outline" shape="pill" class="px-5 py-3 font-weight-bold slide-btn-outline" @click="$router.push('/news')">
                            {{ $i18n.locale === 'en' ? 'News & Activities' : 'ข่าวสารและกิจกรรม' }}
                        </CButton>
                    </div>
                </div>
            </div>
        </CContainer>
        
        <!-- Subtle decorative element -->
        <div class="decorative-blob"></div>
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
    height: 650px;
    display: flex;
    align-items: center;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    margin-top: -80px; 
    padding-top: 80px;
    overflow: hidden;
    color: white;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
        rgba(0,0,0,0.85) 0%, 
        rgba(0,0,0,0.6) 40%, 
        rgba(0,0,0,0.2) 100%);
    z-index: 1;
}

.hero-content-wrapper {
    position: relative;
    z-index: 2;
}

.hero-text-content {
    max-width: 850px;
}

.hero-title {
    font-family: 'Cinzel', serif;
    font-size: 4.5rem;
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
    width: 80px;
    height: 5px;
    background: #612721;
    border-radius: 2px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    animation: scaleIn 0.8s ease-out 0.5s both;
}

.hero-subtitle {
    font-family: 'Sarabun', sans-serif;
    font-size: 1.4rem;
    font-weight: 400;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.5px;
    text-shadow: 0 4px 12px rgba(0,0,0,0.6);
    animation: fadeInUp 1s ease-out 0.6s both;
}

.btn-main {
    background-color: #612721 !important;
    border-color: #612721 !important;
    transition: all 0.3s ease;
}

.btn-main:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(97, 39, 33, 0.4) !important;
}

.slide-btn-outline {
    border-color: #fff !important;
    color: #fff !important;
    transition: all 0.3s ease;
}

.slide-btn-outline:hover {
    background: #fff !important;
    color: #612721 !important;
    transform: translateY(-3px);
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

.decorative-blob {
    position: absolute;
    bottom: -50px;
    right: -50px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(97, 39, 33, 0.25) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(40px);
    z-index: 1;
}

@media (max-width: 991.98px) {
    .home-hero {
        height: 500px;
    }
    .hero-title {
        font-size: 3.5rem;
    }
    .hero-subtitle {
        font-size: 1.2rem;
    }
}

@media (max-width: 575.98px) {
    .hero-title {
        font-size: 2.5rem;
    }
    .hero-subtitle {
        font-size: 1rem;
    }
}
</style>
