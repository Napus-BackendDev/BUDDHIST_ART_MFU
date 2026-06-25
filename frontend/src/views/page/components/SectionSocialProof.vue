<template>
    <div class="social-proof-section py-4" style="background-color: #612721; border-bottom: 1px solid rgba(0,0,0,0.1);">
        <CContainer fluid class="px-0">

            <!-- Marquee container wrapper -->
            <div class="marquee-wrapper">
                <div class="marquee-track">
                    <!-- Group 1: Primary set of logos (spans full viewport width) -->
                    <div class="marquee-group">
                        <div v-for="(partner, index) in [...partners, ...partners]" :key="'g1-' + index" class="partner-logo-item mx-4">
                            <div class="partner-logo-img-wrapper">
                                <img :src="partner.img" :alt="partner.id" class="partner-logo-img" />
                            </div>
                            <div class="logo-divider"></div>
                            <div class="logo-desc d-flex flex-column text-left">
                                <span class="desc-main">{{ $i18n.locale === 'en' ? partner.nameEn : partner.nameTh }}</span>
                                <span class="desc-sub">{{ partner.sub }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Group 2: Identical Duplicate set of logos (for seamless loop) -->
                    <div class="marquee-group">
                        <div v-for="(partner, index) in [...partners, ...partners]" :key="'g2-' + index" class="partner-logo-item mx-4">
                            <div class="partner-logo-img-wrapper">
                                <img :src="partner.img" :alt="partner.id" class="partner-logo-img" />
                            </div>
                            <div class="logo-divider"></div>
                            <div class="logo-desc d-flex flex-column text-left">
                                <span class="desc-main">{{ $i18n.locale === 'en' ? partner.nameEn : partner.nameTh }}</span>
                                <span class="desc-sub">{{ partner.sub }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'SectionSocialProof',
    data() {
        return {
            partners: [
                {
                    id: 'LocalMFU',
                    img: '/img/partner_mfu.png',
                    nameEn: 'Mae Fah Luang University',
                    nameTh: 'มหาวิทยาลัยแม่ฟ้าหลวง',
                    sub: 'MFU'
                },
                {
                    id: 'LocalCAS',
                    img: '/img/partner_cas.png',
                    nameEn: 'Academic Services Division',
                    nameTh: 'ศูนย์บริการวิชาการ มหาวิทยาลัยแม่ฟ้าหลวง',
                    sub: 'CAS'
                },
                {
                    id: 'LocalEart',
                    img: '/img/partner_museum.png',
                    nameEn: 'Buddhist Art Center',
                    nameTh: 'พุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง',
                    sub: 'Buddhist Art MFU'
                },
                {
                    id: 'Museum',
                    img: '/img/partner_eart.png',
                    nameEn: 'Institute for Mekong Basin Civilisation Art and Culture',
                    nameTh: 'สถาบันศิลปวัฒนธรรมและอารยธรรมลุ่มน้ำโขง',
                    sub: 'IMAC'
                }
            ]
        }
    }
}
</script>

<style scoped>
.social-proof-section {
    position: relative;
    z-index: 10;
    overflow: hidden;
}

.marquee-wrapper {
    width: 100%;
    overflow: hidden;
    position: relative;
    padding: 15px 0;
    display: flex;
}

.marquee-track {
    display: flex;
    width: max-content;
    align-items: center;
    animation: scroll-marquee 30s linear infinite;
}

@keyframes scroll-marquee {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-50%);
    }
}

.marquee-group {
    display: flex;
    align-items: center;
    justify-content: space-around;
    min-width: 100vw;
    flex-shrink: 0;
}

.partner-logo-item {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
}

.partner-logo-img-wrapper {
    width: 50px;
    height: 50px;
    background-color: #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    padding: 5px;
    flex-shrink: 0;
}

.partner-logo-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.logo-divider {
    width: 2px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.2);
    margin: 0 18px;
}

.logo-desc {
    color: #ffffff;
    font-family: 'Sarabun', sans-serif;
}

.desc-main {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
}

.desc-sub {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 2px;
}

.font-cinzel {
    font-family: 'Cinzel', serif;
}
</style>
