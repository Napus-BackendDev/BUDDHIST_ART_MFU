<template>
    <section class="supporters-section">
        <CContainer>
            <div class="supporters-header text-center">
                <span class="supporters-eyebrow">
                    {{ $i18n.locale === 'en' ? 'Partnerships & Collaboration' : 'ความร่วมมือทางวิชาการและศิลปวัฒนธรรม' }}
                </span>
                <h2 class="supporters-title">
                    {{ $i18n.locale === 'en' ? 'Our Supporters' : 'ผู้สนับสนุน' }}
                </h2>
                <div class="supporters-divider"></div>
                <p class="supporters-subtitle">
                    {{ $i18n.locale === 'en'
                        ? 'Collaborating institutions supporting the Buddhist Art Short Course Program'
                        : 'หน่วยงานและภาคีความร่วมมือในการขับเคลื่อนหลักสูตรระยะสั้น สาขาวิชาพุทธศิลปกรรม' }}
                </p>
            </div>

            <div class="supporters-grid">
                <div
                    v-for="partner in partners"
                    :key="partner.id"
                    class="supporter-card"
                >
                    <div class="supporter-icon-wrapper">
                        <img
                            :src="partner.img"
                            :alt="getAltText(partner)"
                            class="supporter-icon"
                            loading="lazy"
                        />
                    </div>
                    
                    <div class="supporter-badge">
                        {{ partner.sub }}
                    </div>

                    <h3
                        class="supporter-name"
                        v-html="$i18n.locale === 'en' ? partner.nameEn : partner.nameTh"
                    ></h3>
                </div>
            </div>
        </CContainer>
    </section>
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
                    nameEn: 'Mae Fah Luang<br>University',
                    nameTh: 'มหาวิทยาลัยแม่ฟ้าหลวง',
                    sub: 'MFU'
                },
                {
                    id: 'LocalCAS',
                    img: '/img/partner_cas.png',
                    nameEn: 'Academic Services<br>Center',
                    nameTh: 'ศูนย์บริการวิชาการ',
                    sub: 'CAS'
                },
                {
                    id: 'LocalEart',
                    img: '/img/partner_museum.png',
                    nameEn: 'Short Course Program<br>in Buddhist Art',
                    nameTh: 'หลักสูตรระยะสั้น<br>สาขาวิชาพุทธศิลปกรรม',
                    sub: 'Buddhist Art MFU'
                },
                {
                    id: 'Museum',
                    img: '/img/partner_eart.png',
                    nameEn: 'Institute for Mekong Basin<br>Civilisation Art and Culture',
                    nameTh: 'สถาบันศิลปวัฒนธรรม<br>อารยธรรมลุ่มน้ำโขง',
                    sub: 'IMAC'
                }
            ]
        }
    },
    methods: {
        getAltText(partner) {
            const raw = this.$i18n.locale === 'en' ? partner.nameEn : partner.nameTh;
            return raw ? raw.replace(/<br\s*[\/]?>/gi, ' ') : '';
        }
    }
}
</script>

<style scoped>
.supporters-section {
    position: relative;
    padding: 5rem 0 5.5rem;
    background: linear-gradient(180deg, #FAF8F5 0%, #F5EFEB 100%);
    border-top: 1px solid rgba(97, 39, 33, 0.06);
    border-bottom: 1px solid rgba(97, 39, 33, 0.08);
}

.supporters-header {
    margin-bottom: 3.5rem;
}

.supporters-eyebrow {
    display: inline-block;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c58d35;
    margin-bottom: 0.5rem;
}

.supporters-title {
    margin: 0 0 0.75rem;
    color: #612721;
    font-family: 'Cinzel', 'Sarabun', serif;
    font-size: clamp(1.85rem, 3.5vw, 2.35rem);
    font-weight: 800;
    letter-spacing: 0.02em;
}

.supporters-divider {
    width: 60px;
    height: 3px;
    margin: 0 auto 1.25rem;
    border-radius: 999px;
    background: linear-gradient(90deg, #c58d35, #efc46f);
}

.supporters-subtitle {
    max-width: 620px;
    margin: 0 auto;
    font-family: 'Sarabun', sans-serif;
    font-size: 1rem;
    line-height: 1.6;
    color: #7a6b68;
}

.supporters-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.75rem;
    max-width: 1140px;
    margin: 0 auto;
}

.supporter-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 100%;
    padding: 2.25rem 1.5rem 2rem;
    background: #ffffff;
    border: 1px solid rgba(97, 39, 33, 0.08);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(97, 39, 33, 0.04);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.supporter-card:hover {
    transform: translateY(-6px);
    border-color: rgba(197, 141, 53, 0.45);
    box-shadow: 0 20px 40px rgba(97, 39, 33, 0.1);
}

.supporter-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 104px;
    height: 104px;
    padding: 1rem;
    margin-bottom: 1.25rem;
    border-radius: 50%;
    background: linear-gradient(145deg, #FAF8F5, #F2ECE4);
    border: 1px solid rgba(197, 141, 53, 0.22);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(97, 39, 33, 0.04);
    transition: transform 0.35s ease;
}

.supporter-card:hover .supporter-icon-wrapper {
    transform: scale(1.06);
    border-color: rgba(197, 141, 53, 0.5);
    box-shadow: 0 6px 16px rgba(197, 141, 53, 0.15);
}

.supporter-icon {
    width: 100%;
    height: 100%;
    max-width: 68px;
    max-height: 68px;
    object-fit: contain;
}

.supporter-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    margin-bottom: 0.85rem;
    font-family: 'Sarabun', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #612721;
    background: rgba(97, 39, 33, 0.06);
    border: 1px solid rgba(97, 39, 33, 0.1);
    border-radius: 999px;
}

.supporter-name {
    margin: 0;
    font-family: 'Sarabun', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    line-height: 1.5;
    color: #2D2D2D;
    min-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    word-break: keep-all;
    overflow-wrap: break-word;
    text-align: center;
}

@media (max-width: 991.98px) {
    .supporters-section {
        padding: 4rem 0 4.5rem;
    }
    .supporters-header {
        margin-bottom: 2.5rem;
    }
    .supporters-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        max-width: 640px;
        gap: 1.25rem;
    }
    .supporter-card {
        padding: 1.75rem 1.25rem;
    }
    .supporter-icon-wrapper {
        width: 92px;
        height: 92px;
    }
    .supporter-icon {
        max-width: 58px;
        max-height: 58px;
    }
    .supporter-name {
        min-height: 2.8rem;
    }
}

@media (max-width: 575.98px) {
    .supporters-section {
        padding: 3.25rem 0 3.75rem;
    }
    .supporters-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
    }
    .supporter-card {
        padding: 1.25rem 0.85rem 1.1rem;
        border-radius: 16px;
    }
    .supporter-icon-wrapper {
        width: 76px;
        height: 76px;
        margin-bottom: 0.85rem;
    }
    .supporter-icon {
        max-width: 48px;
        max-height: 48px;
    }
    .supporter-badge {
        font-size: 0.7rem;
        padding: 0.18rem 0.55rem;
        margin-bottom: 0.5rem;
    }
    .supporter-name {
        font-size: 0.82rem;
        line-height: 1.35;
        min-height: 2.4rem;
    }
}
</style>
