<template>
    <div class="news-hero mb-5">
        <div class="hero-overlay"></div>
        <CContainer class="hero-content-wrapper">
            <div class="hero-text-content">
                <div class="reveal-animation">
                    <h1 v-if="$i18n.locale === 'en'" class="hero-title text-uppercase mb-2">News <span class="text-highlight">& Events</span></h1>
                    <h1 v-else class="hero-title text-uppercase mb-2">ข่าวสาร <span class="text-highlight">& กิจกรรม</span></h1>
                    <div class="title-separator mb-4"></div>
                    <p class="hero-subtitle mb-0">
                        {{ $i18n.locale === 'en' ? 'Follow news, activities, and updates' : 'ติดตามข่าวสาร กิจกรรม และความเคลื่อนไหว' }} <br class="d-none d-md-block">
                        {{ $i18n.locale === 'en' ? 'from the Buddhist Art Center, Mae Fah Luang University' : 'จากศูนย์พุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง' }}
                    </p>
                </div>
            </div>
        </CContainer>
        
        <!-- Subtle decorative element -->
        <div class="decorative-blob"></div>
    </div>
</template>

<script>
export default {
    name: 'SectionHeaderNews'
}
</script>

<style scoped>
.news-hero {
    position: relative;
    height: 520px;
    display: flex;
    align-items: center;
    background-image: url('~@/assets/images/backgrounds/news_hero.png');
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
        rgba(0,0,0,0.3) 100%);
    z-index: 1;
}

.hero-content-wrapper {
    position: relative;
    z-index: 2;
}

.hero-text-content {
    max-width: 800px;
}

.hero-title {
    font-family: 'Cinzel', serif;
    font-size: 4rem;
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

.hero-subtitle {
    font-family: 'Sarabun', sans-serif;
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.6;
    color: white;
    letter-spacing: 0.5px;
    text-shadow: 0 4px 12px rgba(0,0,0,0.6);
    animation: fadeInUp 1s ease-out 0.6s both;
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
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(97, 39, 33, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(40px);
    z-index: 1;
}

@media (max-width: 991.98px) {
    .news-hero {
        height: 400px;
    }
    .hero-title {
        font-size: 3rem;
    }
    .hero-subtitle {
        font-size: 1.1rem;
    }
}

@media (max-width: 575.98px) {
    .hero-title {
        font-size: 2.25rem;
    }
    .hero-subtitle {
        font-size: 1rem;
    }
}
</style>
