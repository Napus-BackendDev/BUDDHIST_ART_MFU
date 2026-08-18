<template>
  <div class="contact-page min-vh-100 pb-5">
    <SectionPageHero
      variant="contact"
      :title-lead="$i18n.locale === 'en' ? 'Contact' : 'ติดต่อ'"
      :title-highlight="$i18n.locale === 'en' ? 'Us' : 'เรา'"
    />

    <!-- Main Content Section -->
    <CContainer class="pt-4 mt-2">
      <CRow class="justify-content-center">
        <!-- Left Side: Contact Info -->
        <CCol lg="6" class="mb-4">
          <!-- Information Card -->
          <CCard class="contact-card info-card border-0 shadow-sm mb-4 h-100 overflow-hidden">
            <CCardBody class="p-4 p-md-5 d-flex flex-column justify-content-between">
              <div>
                <h3 class="section-title mb-4 font-weight-bold">
                  {{ $i18n.locale === 'en' ? 'Contact Information' : 'ข้อมูลการติดต่อ' }}
                </h3>
                
                <div class="contact-details mt-4">
                  <!-- Location -->
                  <div class="contact-detail-item d-flex align-items-start mb-4">
                    <div class="detail-icon-circle mr-3">
                      <CIcon name="cil-location-pin" class="detail-icon" />
                    </div>
                    <div class="detail-text">
                      <h6 class="detail-label mb-1 font-weight-bold">{{ $i18n.locale === 'en' ? 'Location' : 'ที่อยู่' }}</h6>
                      <p class="detail-value mb-0">
                        {{ $i18n.locale === 'en' ? 'Academic Services Division, Gen. Sampao Choosri Building (E4), Mae Fah Luang University, 333 Moo 1, Thasud, Muang, Chiang Rai 57100' : 'ศูนย์บริการวิชาการ อาคารพลเอกสำเภา ชูศรี (E4) มหาวิทยาลัยแม่ฟ้าหลวง 333 หมู่ 1 ต.ท่าสุด อ.เมือง จ.เชียงราย 57100' }}
                      </p>
                    </div>
                  </div>

                  <!-- Phone -->
                  <div class="contact-detail-item d-flex align-items-start mb-4">
                    <div class="detail-icon-circle mr-3">
                      <CIcon name="cil-phone" class="detail-icon" />
                    </div>
                    <div class="detail-text">
                      <h6 class="detail-label mb-1 font-weight-bold">{{ $i18n.locale === 'en' ? 'Phone Number' : 'เบอร์โทรศัพท์' }}</h6>
                      <p class="detail-value mb-0">
                        053-917-897 {{ $i18n.locale === 'en' ? 'ext.' : 'ต่อ' }} 8035 {{ $i18n.locale === 'en' ? 'to' : 'ถึง' }} 8036
                      </p>
                    </div>
                  </div>

                  <!-- Email -->
                  <div class="contact-detail-item d-flex align-items-start mb-4">
                    <div class="detail-icon-circle mr-3">
                      <CIcon name="cil-envelope-closed" class="detail-icon" />
                    </div>
                    <div class="detail-text">
                      <h6 class="detail-label mb-1 font-weight-bold">{{ $i18n.locale === 'en' ? 'Email Address' : 'อีเมล' }}</h6>
                      <p class="detail-value mb-0">
                        buddhist.art@mfu.ac.th
                      </p>
                    </div>
                  </div>

                  <!-- Office Hours -->
                  <div class="contact-detail-item d-flex align-items-start mb-4">
                    <div class="detail-icon-circle mr-3">
                      <CIcon name="cil-clock" class="detail-icon" />
                    </div>
                    <div class="detail-text">
                      <h6 class="detail-label mb-1 font-weight-bold">{{ $i18n.locale === 'en' ? 'Office Hours' : 'เวลาทำการ' }}</h6>
                      <p class="detail-value mb-0">
                        {{ $i18n.locale === 'en' ? 'Monday - Friday: 08:30 AM - 04:30 PM' : 'จันทร์ - ศุกร์: 08:30 น. - 16:30 น.' }}<br>
                        <span class="text-muted small">({{ $i18n.locale === 'en' ? 'Except public holidays' : 'เว้นวันหยุดนักขัตฤกษ์' }})</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Social Media Section -->
              <div class="social-section mt-5 pt-4 border-top">
                <h6 class="social-title text-uppercase mb-3 font-weight-bold">
                  {{ $i18n.locale === 'en' ? 'Social Channels' : 'ช่องทางโซเชียลมีเดีย' }}
                </h6>
                <div class="d-flex flex-wrap" style="gap: 10px;">
                  <a href="https://www.facebook.com/BuddhistArtMFU" target="_blank" rel="noopener noreferrer" class="social-pill-btn d-flex align-items-center">
                    <CIcon name="cib-facebook" class="mr-2 social-icon-brand" />
                    <span>Facebook</span>
                  </a>
                  <a href="https://www.youtube.com/@BuddhistArtMFU" target="_blank" rel="noopener noreferrer" class="social-pill-btn d-flex align-items-center">
                    <CIcon name="cib-youtube" class="mr-2 social-icon-brand" />
                    <span>YouTube</span>
                  </a>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <!-- Right Side: Contact Form -->
        <CCol lg="6" class="mb-4">
          <CCard class="contact-card form-card border-0 shadow-sm h-100 position-relative overflow-hidden">
            <CCardBody class="p-4 p-md-5 d-flex flex-column justify-content-between">
              <!-- Success State -->
              <div v-if="submitted" class="success-overlay text-center d-flex flex-column align-items-center justify-content-center py-5">
                <div class="success-icon-wrapper mb-4">
                  <CIcon name="cil-check-circle" size="custom" class="success-icon" />
                </div>
                <h3 class="success-title font-weight-bold mb-3">
                  {{ $i18n.locale === 'en' ? 'Thank You!' : 'ขอบคุณที่ติดต่อเรา!' }}
                </h3>
                <p class="success-message text-muted mb-5">
                  {{ $i18n.locale === 'en' ? 'Your inquiry has been successfully sent. We will get back to you shortly.' : 'ระบบได้รับข้อความการติดต่อสอบถามของท่านเรียบร้อยแล้ว ทีมงานจะดำเนินการตอบกลับท่านโดยเร็วที่สุด' }}
                </p>
                <CButton @click="resetForm" color="danger" shape="pill" class="px-5 py-2.5 font-weight-bold btn-premium">
                  {{ $i18n.locale === 'en' ? 'Send Another Message' : 'ส่งข้อความใหม่' }}
                </CButton>
              </div>

              <!-- Contact Form -->
              <div v-else class="h-100 d-flex flex-column justify-content-between">
                <div>
                  <h3 class="section-title mb-4 font-weight-bold">
                    {{ $i18n.locale === 'en' ? 'Send us a Message' : 'ส่งข้อความหาเรา' }}
                  </h3>
                  <p class="text-muted mb-4 small">
                    {{ $i18n.locale === 'en' ? 'Fill out the form below and we will contact you back as soon as possible.' : 'กรอกรายละเอียดข้อสงสัยหรือหัวข้อคำถามของท่าน แล้วเราจะรีบตอบกลับโดยเร็วที่สุด' }}
                  </p>

                  <form @submit.prevent="handleSubmit" class="contact-form mt-4">
                    <!-- Full Name & Email Address Row -->
                    <CRow>
                      <CCol md="6" class="mb-4">
                        <div class="form-group-custom">
                          <label class="form-label-custom">{{ $i18n.locale === 'en' ? 'Full Name' : 'ชื่อ-นามสกุล' }} <span class="required">*</span></label>
                          <input 
                            type="text" 
                            v-model="form.name" 
                            required 
                            class="form-control-custom"
                            :placeholder="$i18n.locale === 'en' ? 'Your full name' : 'กรุณากรอกชื่อ-นามสกุลจริง'"
                          />
                        </div>
                      </CCol>
                      <CCol md="6" class="mb-4">
                        <div class="form-group-custom">
                          <label class="form-label-custom">{{ $i18n.locale === 'en' ? 'Email Address' : 'อีเมล' }} <span class="required">*</span></label>
                          <input 
                            type="email" 
                            v-model="form.email" 
                            required 
                            class="form-control-custom"
                            :placeholder="$i18n.locale === 'en' ? 'Your email address' : 'example@domain.com'"
                          />
                        </div>
                      </CCol>
                    </CRow>

                    <!-- Subject -->
                    <div class="form-group-custom mb-4">
                      <label class="form-label-custom">{{ $i18n.locale === 'en' ? 'Subject' : 'หัวข้อเรื่อง' }} <span class="required">*</span></label>
                      <input 
                            type="text" 
                            v-model="form.subject" 
                            required 
                            class="form-control-custom"
                            :placeholder="$i18n.locale === 'en' ? 'How can we help you?' : 'ระบุหัวข้อที่ต้องการติดต่อสอบถาม'"
                      />
                    </div>

                    <!-- Message -->
                    <div class="form-group-custom mb-4">
                      <label class="form-label-custom">{{ $i18n.locale === 'en' ? 'Message' : 'ข้อความรายละเอียด' }} <span class="required">*</span></label>
                      <textarea 
                        v-model="form.message" 
                        required 
                        rows="4"
                        class="form-control-custom"
                        :placeholder="$i18n.locale === 'en' ? 'Type your message details here...' : 'กรอกรายละเอียดหรือข้อสงสัยเพิ่มเติม...'"
                      ></textarea>
                    </div>
                  </form>
                </div>

                <div class="mt-4">
                  <CButton 
                    @click="handleSubmit"
                    color="danger" 
                    shape="pill" 
                    class="w-100 py-3 font-weight-bold btn-premium d-flex align-items-center justify-content-center"
                    :disabled="submitting"
                  >
                    <CSpinner v-if="submitting" size="sm" class="mr-2" color="white" />
                    <span>
                      {{ submitting ? ($i18n.locale === 'en' ? 'Sending...' : 'กำลังส่งข้อความ...') : ($i18n.locale === 'en' ? 'Send Message' : 'ส่งข้อความ') }}
                    </span>
                  </CButton>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <!-- Large Map Row -->
      <CRow class="mt-4">
        <CCol lg="12" class="mb-4">
          <CCard class="contact-card border-0 shadow-sm overflow-hidden p-0 h-auto">
            <div class="map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3748.243501750697!2d99.8923363!3d20.0461877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30d700346cbbd9ad%3A0x2863920c841c79a8!2sMae%20Fah%20Luang%20University!5e0!3m2!1sen!2sth!4v1717200000000!5m2!1sen!2sth" 
                width="100%" 
                height="450" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import SectionPageHero from './components/SectionPageHero.vue'

export default {
  name: 'Contact',
  components: { SectionPageHero },
  data() {
    return {
      form: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      submitting: false,
      submitted: false
    }
  },
  computed: {
    heroDescription() {
      return this.$i18n.locale === 'en'
        ? 'Contact us for more information about the Buddhist Art Short Course Program at Mae Fah Luang University.'
        : 'ติดต่อสอบถามข้อมูลเพิ่มเติมเกี่ยวกับหลักสูตรระยะสั้นพุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง'
    },
  },
  methods: {
    handleSubmit() {
      // Basic validation check
      if (!this.form.name || !this.form.email || !this.form.subject || !this.form.message) {
        return;
      }
      
      this.submitting = true;
      
      // Simulate API submit delay
      setTimeout(() => {
        this.submitting = false;
        this.submitted = true;
      }, 1200);
    },
    resetForm() {
      this.form = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
      this.submitted = false;
    }
  }
}
</script>

<style scoped>
.contact-page {
  background-color: #FAF9F6 !important;
}

/* Card Styling */
.contact-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  transition: all 0.3s ease;
}

.contact-card:hover {
  box-shadow: 0 15px 35px rgba(74, 29, 24, 0.04) !important;
}

.section-title {
  font-family: 'Cinzel', serif;
  font-weight: 800;
  color: #4a1d18;
  position: relative;
  padding-left: 20px;
  font-size: 1.6rem;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 5px;
  background-color: #612721;
  border-radius: 10px;
}

/* Contact Detail Items */
.detail-icon-circle {
  width: 44px;
  height: 44px;
  background-color: #faf7f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
  border: 1px solid rgba(74, 29, 24, 0.05);
}

.contact-detail-item:hover .detail-icon-circle {
  background-color: #4a1d18;
}

.contact-detail-item:hover .detail-icon-circle .detail-icon {
  color: #ffffff;
}

.detail-icon {
  color: #4a1d18;
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

.detail-label {
  font-family: 'Sarabun', sans-serif;
  color: #4a1d18;
  font-size: 0.95rem;
}

.detail-value {
  font-family: 'Sarabun', sans-serif;
  color: #4b5563;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Social media channels */
.social-title {
  font-family: 'Sarabun', sans-serif;
  font-size: 0.8rem;
  color: #9ca3af;
  letter-spacing: 1px;
}

.social-pill-btn {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 30px;
  padding: 8px 18px;
  font-family: 'Sarabun', sans-serif;
  font-size: 0.9rem;
  color: #4b5563;
  text-decoration: none;
  transition: all 0.25s ease;
}

.social-pill-btn:hover {
  background-color: #4a1d18;
  color: #ffffff;
  border-color: #4a1d18;
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 29, 24, 0.15);
}

.social-icon-brand {
  width: 18px;
  height: 18px;
}

/* Map */
.map-container {
  border-radius: 20px;
  overflow: hidden;
  line-height: 0;
}

/* Forms */
.form-group-custom {
  display: flex;
  flex-direction: column;
}

.form-label-custom {
  font-family: 'Sarabun', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a1d18;
  margin-bottom: 8px;
}

.form-label-custom .required {
  color: #dc2626;
}

.form-control-custom {
  font-family: 'Sarabun', sans-serif;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.95rem;
  color: #1f2937;
  outline: none;
  background-color: #faf9f6;
  transition: all 0.3s ease;
  width: 100%;
}

.form-control-custom:focus {
  border-color: #4a1d18;
  background-color: #ffffff;
  box-shadow: 0 4px 15px rgba(74, 29, 24, 0.05);
}

textarea.form-control-custom {
  resize: none;
}

.btn-premium {
  background: linear-gradient(135deg, #4a1d18 0%, #612721 100%);
  color: #ffffff;
  border: none;
  border-radius: 30px;
  transition: all 0.3s ease;
  font-family: 'Sarabun', sans-serif;
  letter-spacing: 0.5px;
}

.btn-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 29, 24, 0.25);
  background: linear-gradient(135deg, #612721 0%, #7d332a 100%);
}

.btn-premium:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Success Overlay */
.success-overlay {
  animation: fadeIn 0.6s ease;
}

.success-icon-wrapper {
  width: 80px;
  height: 80px;
  background-color: #f0fdf4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  color: #16a34a;
  width: 48px;
  height: 48px;
}

.success-title {
  font-family: 'Cinzel', serif;
  color: #16a34a;
  font-size: 1.8rem;
}

.success-message {
  font-family: 'Sarabun', sans-serif;
  font-size: 1rem;
  max-width: 400px;
  line-height: 1.6;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 575.98px) {
  .p-5 {
    padding: 1.5rem !important;
  }
}
</style>
