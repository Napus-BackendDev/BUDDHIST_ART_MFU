<template>
    <div class="submission-reviews-section py-5" style="background-color: #faf8f5; border-bottom: 1px solid rgba(0,0,0,0.05);">
        <CContainer class="my-4">
            <div class="text-center mb-5">
                <span class="badge text-uppercase font-weight-bold px-3 py-2 mb-3" style="color: #612721; background-color: rgba(97,39,33,0.08); border-radius: 50px; font-size: 0.8rem; letter-spacing: 1px;">
                    {{ $i18n.locale === 'en' ? 'Learner Experiences' : 'ประสบการณ์จากผู้เรียน' }}
                </span>
                <h2 class="font-weight-bold mb-3" style="color: #2c3e50; font-family: 'Cinzel', serif; font-size: 2.2rem;">
                    {{ $i18n.locale === 'en' ? 'Syllabus & Submission Feedback' : 'เสียงสะท้อนจากระบบประเมินผลงาน' }}
                </h2>
                <div class="mx-auto" style="width: 60px; height: 3px; background-color: #612721; border-radius: 2px;"></div>
            </div>

            <CRow class="justify-content-center">
                <!-- Card 1 -->
                <CCol md="4" class="mb-4">
                    <div class="student-review-card h-100 p-4 bg-white rounded-xl shadow-sm border position-relative d-flex flex-column justify-content-between">
                        <div class="quote-icon-wrapper mb-3">
                            <span class="quote-icon" style="font-family: 'Cinzel', serif; color: rgba(97,39,33,0.12); font-size: 4rem; line-height: 0.8; position: absolute; top: 15px; left: 20px; font-weight: bold;">“</span>
                        </div>
                        <div class="review-body pt-3">
                            <p class="text-muted style-quote" style="font-family: 'Sarabun', sans-serif; font-size: 0.98rem; line-height: 1.6; font-style: italic;">
                                {{ $i18n.locale === 'en' 
                                    ? '"The submission system allowed me to get direct feedback from experts. It accelerated my Lanna painting skills and helped me build an authentic academic portfolio."' 
                                    : '"ระบบส่งผลงานวิชาการช่วยให้ได้รับคำแนะนำโดยตรงจากผู้เชี่ยวชาญ ทำให้ฝีมือจิตรกรรมล้านนาของผมพัฒนาขึ้นอย่างรวดเร็วและสามารถสะสมเป็นพอร์ตโฟลิโอวิชาการได้จริง"' }}
                            </p>
                        </div>
                        <div class="rating-stars mt-3" style="color: #FEC260; font-size: 0.9rem;">
                            ★★★★★
                        </div>
                    </div>
                </CCol>

                <!-- Card 2 -->
                <CCol md="4" class="mb-4">
                    <div class="student-review-card h-100 p-4 bg-white rounded-xl shadow-sm border position-relative d-flex flex-column justify-content-between">
                        <div class="quote-icon-wrapper mb-3">
                            <span class="quote-icon" style="font-family: 'Cinzel', serif; color: rgba(97,39,33,0.12); font-size: 4rem; line-height: 0.8; position: absolute; top: 15px; left: 20px; font-weight: bold;">“</span>
                        </div>
                        <div class="review-body pt-3">
                            <p class="text-muted style-quote" style="font-family: 'Sarabun', sans-serif; font-size: 0.98rem; line-height: 1.6; font-style: italic;">
                                {{ $i18n.locale === 'en' 
                                    ? '"Submitting creative research online is extremely convenient. It systematically structures the evaluation and revision phases of our Buddhist Art coursework."' 
                                    : '"การส่งงานวิจัยสร้างสรรค์ผ่านช่องทางออนไลน์นี้สะดวกมาก ทำให้สามารถปรับปรุงและส่งมอบงานพุทธศิลปกรรมได้อย่างเป็นระบบในทุกขั้นตอนของการประเมินรายวิชา"' }}
                            </p>
                        </div>
                        <div class="rating-stars mt-3" style="color: #FEC260; font-size: 0.9rem;">
                            ★★★★★
                        </div>
                    </div>
                </CCol>

                <!-- Card 3 -->
                <CCol md="4" class="mb-4">
                    <div class="student-review-card h-100 p-4 bg-white rounded-xl shadow-sm border position-relative d-flex flex-column justify-content-between">
                        <div class="quote-icon-wrapper mb-3">
                            <span class="quote-icon" style="font-family: 'Cinzel', serif; color: rgba(97,39,33,0.12); font-size: 4rem; line-height: 0.8; position: absolute; top: 15px; left: 20px; font-weight: bold;">“</span>
                        </div>
                        <div class="review-body pt-3">
                            <p class="text-muted style-quote" style="font-family: 'Sarabun', sans-serif; font-size: 0.98rem; line-height: 1.6; font-style: italic;">
                                {{ $i18n.locale === 'en' 
                                    ? '"I am proud to see my course submissions approved and showcased. Getting my creation certified has boosted my confidence to step forward as a professional artist."' 
                                    : '"ภูมิใจมากที่ผลงานเรียนของตัวเองได้รับการอนุมัติและนำมาจัดแสดงในหอศิลป์จำลอง การได้ใบรับรองผลงานสร้างสรรค์เพิ่มความมั่นใจในการก้าวสู่ศิลปินมืออาชีพ"' }}
                            </p>
                        </div>
                        <div class="rating-stars mt-3" style="color: #FEC260; font-size: 0.9rem;">
                            ★★★★★
                        </div>
                    </div>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'SectionSubmissionReviews'
}
</script>

<style scoped>
.submission-reviews-section {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.student-review-card {
    border-radius: 16px !important;
    border-color: rgba(97, 39, 33, 0.08) !important;
    transition: all 0.3s ease;
}

.student-review-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(97, 39, 33, 0.06) !important;
    border-color: rgba(97, 39, 33, 0.2) !important;
}

.style-quote {
    color: #4a5568 !important;
}
</style>
