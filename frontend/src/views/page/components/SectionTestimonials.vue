<template>
    <div class="testimonials-section py-5" style="background-color: #fcfbf9;">
        <CContainer class="my-4">
            <div class="text-center mb-5">
                <span class="badge text-uppercase font-weight-bold px-3 py-2 mb-3" style="color: #612721; background-color: rgba(97,39,33,0.08); border-radius: 50px; font-size: 0.8rem; letter-spacing: 1px;">
                    {{ $i18n.locale === 'en' ? 'Reviews & Feedback' : 'เสียงตอบรับจากผู้ใช้งาน' }}
                </span>
                <h2 class="font-weight-bold mb-3" style="color: #2c3e50; font-family: var(--app-font-family); font-size: 2.2rem;">
                    {{ $i18n.locale === 'en' ? 'What Our Visitors Say' : 'ความคิดเห็นต่อระบบซื้อขายผลงาน' }}
                </h2>
                <div class="mx-auto" style="width: 60px; height: 3px; background-color: #612721; border-radius: 2px;"></div>
            </div>

            <CRow class="justify-content-center">
                <!-- Card 1 -->
                <CCol md="4" class="mb-4">
                    <div class="review-card h-100 p-4 bg-white rounded-xl shadow-sm border position-relative d-flex flex-column justify-content-between">
                        <div class="quote-icon-wrapper mb-3">
                            <span class="quote-icon" style="font-family: var(--app-font-family); color: rgba(97,39,33,0.15); font-size: 4rem; line-height: 0.8; position: absolute; top: 15px; left: 20px; font-weight: bold;">“</span>
                        </div>
                        <div class="review-body pt-3">
                            <p class="text-muted style-quote" style="font-family: var(--app-font-family); font-size: 0.98rem; line-height: 1.6; font-style: italic;">
                                {{ $i18n.locale === 'en' 
                                    ? '"The system is incredibly easy to use. The process of buying artworks and connecting with student artists is seamless, transparent, and supports university creativity."' 
                                    : '"ระบบใช้งานง่ายมาก ขั้นตอนการสั่งซื้อภาพและติดต่อกับศิลปินนักศึกษาทำได้สะดวกและมีความโปร่งใส ได้สนับสนุนผลงานสร้างสรรค์ของมหาวิทยาลัยโดยตรง"' }}
                            </p>
                        </div>
                        <div class="rating-stars mt-3" style="color: #FEC260; font-size: 0.9rem;">
                            ★★★★★
                        </div>
                    </div>
                </CCol>

                <!-- Card 2 -->
                <CCol md="4" class="mb-4">
                    <div class="review-card h-100 p-4 bg-white rounded-xl shadow-sm border position-relative d-flex flex-column justify-content-between">
                        <div class="quote-icon-wrapper mb-3">
                            <span class="quote-icon" style="font-family: var(--app-font-family); color: rgba(97,39,33,0.15); font-size: 4rem; line-height: 0.8; position: absolute; top: 15px; left: 20px; font-weight: bold;">“</span>
                        </div>
                        <div class="review-body pt-3">
                            <p class="text-muted style-quote" style="font-family: var(--app-font-family); font-size: 0.98rem; line-height: 1.6; font-style: italic;">
                                {{ $i18n.locale === 'en' 
                                    ? '"I love the variety of Buddhist artworks and clear categories. The payment and ownership verification process is fast, secure, and reliable."' 
                                    : '"ชอบความหลากหลายของผลงานพุทธศิลป์และการแบ่งหมวดหมู่ที่ชัดเจน การชำระเงินและการยืนยันสิทธิ์ในผลงานทำได้รวดเร็วและน่าเชื่อถือ"' }}
                            </p>
                        </div>
                        <div class="rating-stars mt-3" style="color: #FEC260; font-size: 0.9rem;">
                            ★★★★★
                        </div>
                    </div>
                </CCol>

                <!-- Card 3 -->
                <CCol md="4" class="mb-4">
                    <div class="review-card h-100 p-4 bg-white rounded-xl shadow-sm border position-relative d-flex flex-column justify-content-between">
                        <div class="quote-icon-wrapper mb-3">
                            <span class="quote-icon" style="font-family: var(--app-font-family); color: rgba(97,39,33,0.15); font-size: 4rem; line-height: 0.8; position: absolute; top: 15px; left: 20px; font-weight: bold;">“</span>
                        </div>
                        <div class="review-body pt-3">
                            <p class="text-muted style-quote" style="font-family: var(--app-font-family); font-size: 0.98rem; line-height: 1.6; font-style: italic;">
                                {{ $i18n.locale === 'en' 
                                    ? '"An excellent platform connecting buyers with contemporary Lanna masterpieces. Every piece comes with high quality and complete creation background stories."' 
                                    : '"เป็นแพลตฟอร์มที่ดีเยี่ยมในการเชื่อมโยงผู้ซื้อกับผลงานล้านนาสร้างสรรค์ ได้ผลงานคุณภาพสูงพร้อมรายละเอียดประวัติและเรื่องราวการสร้างสรรค์ครบถ้วน"' }}
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
    name: 'SectionTestimonials'
}
</script>

<style scoped>
.testimonials-section {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.review-card {
    border-radius: 16px !important;
    border-color: rgba(97, 39, 33, 0.08) !important;
    transition: all 0.3s ease;
}

.review-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(97, 39, 33, 0.06) !important;
    border-color: rgba(97, 39, 33, 0.2) !important;
}

.style-quote {
    color: #4a5568 !important;
}
</style>
