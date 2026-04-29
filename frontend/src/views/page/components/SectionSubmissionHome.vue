<template>
    <div class="submission-section py-5 bg-white">
        <CContainer fluid class="px-md-5">
            <div class="text-center mb-5">
                <h2 class="font-weight-bold section-title-center">{{ $i18n.locale === 'en' ? 'Opportunities & Activities' : 'โอกาสและกิจกรรม' }}</h2>
                <p class="text-muted lead mt-3">{{ $i18n.locale === 'en' ? 'Be part of preserving and creating Buddhist art' : 'ร่วมเป็นส่วนหนึ่งของการสืบสานและสร้างสรรค์พุทธศิลปกรรม' }}</p>
            </div>

            <div v-if="loading" class="text-center py-5">
                <CSpinner color="danger" variant="grow" />
                <p class="mt-3 text-muted">{{ $i18n.locale === 'en' ? 'Loading activities...' : 'กำลังโหลดข้อมูลกิจกรรม...' }}</p>
            </div>

            <template v-else>
                <CardArtworks :artworks="submissionsMock" />
                
                <div v-if="submissionsMock.length === 0" class="text-center py-5">
                    <CIcon name="cil-search" size="xl" class="text-muted mb-3" />
                    <p class="text-muted">{{ $i18n.locale === 'en' ? 'No activities available at the moment' : 'ไม่พบข้อมูลกิจกรรมในขณะนี้' }}</p>
                </div>
            </template>
        </CContainer>
    </div>
</template>

<script>
import CardArtworks from './card/CardArtworks.vue'

export default {
    name: 'SectionSubmissionHome',
    components: {
        CardArtworks
    },
    data() {
        return {
            loading: false,
            submissionsMock: [
                {
                    _id: 'sub1',
                    title: [
                        { key: 'th', value: 'เปิดรับสมัครพุทธศิลปกรรม รุ่นที่ 6' },
                        { key: 'en', value: 'Buddhist Art Admission Batch 6' }
                    ],
                    description: [
                        { key: 'th', value: 'โอกาสสำหรับผู้ที่สนใจศึกษาพุทธศิลป์แบบเจาะลึก ประจำปีการศึกษา 2569' },
                        { key: 'en', value: 'An opportunity for those interested in deep studying Buddhist art. Academic year 2026' }
                    ],
                    image: 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&w=800&q=80',
                    status: { approval: 'Approved' },
                    artist: [
                        { key: 'th', value: 'สถาบันพุทธศิลปกรรม มฟล.' },
                        { key: 'en', value: 'Buddhist Art Institute MFU' }
                    ],
                    price: 0,
                    category: { title: [ { key: 'th', value: 'การรับเข้าศึกษา' }, { key: 'en', value: 'Admission' } ] }
                },
                {
                    _id: 'sub2',
                    title: [
                        { key: 'th', value: 'ประกวดจิตรกรรมพุทธศิลป์ประยุกต์' },
                        { key: 'en', value: 'Applied Buddhist Art Painting Competition' }
                    ],
                    description: [
                        { key: 'th', value: 'เชิญชวนศิลปินรุ่นใหม่ส่งผลงานเข้าประกวดชิงเงินรางวัลและเกียรติบัตร' },
                        { key: 'en', value: 'Calling all young artists to submit artworks for cash prizes and certificates' }
                    ],
                    image: 'https://images.unsplash.com/photo-1460666819451-7410f5893962?auto=format&fit=crop&w=800&q=80',
                    status: { approval: 'Approved' },
                    artist: [
                        { key: 'th', value: 'ศูนย์บริการวิชาการ มฟล.' },
                        { key: 'en', value: 'Academic Service Center MFU' }
                    ],
                    price: 0,
                    category: { title: [ { key: 'th', value: 'การประกวด' }, { key: 'en', value: 'Competition' } ] }
                }
            ]
        }
    }
}
</script>

<style scoped>
.section-title-center {
    color: #612721;
    font-size: 2.8rem;
    position: relative;
    display: inline-block;
}

.section-title-center::after {
    content: "";
    position: absolute;
    bottom: -15px;
    left: 20%;
    right: 20%;
    height: 4px;
    background: #612721;
    border-radius: 10px;
}

.submission-section {
    padding: 80px 0;
}
</style>
