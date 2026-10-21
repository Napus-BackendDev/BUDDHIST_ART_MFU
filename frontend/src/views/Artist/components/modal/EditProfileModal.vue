<template>
  <CModal
    :title="$i18n.locale === 'en' ? 'Edit Artist Profile' : 'แก้ไขโปรไฟล์ศิลปิน'"
    :show.sync="localShow"
    size="xl"
    :centered="true"
  >
    <div class="modal-bg-wrapper">
      <CRow v-if="localForm">
        <!-- Left Column: Avatar & Bio -->
        <CCol lg="4" class="mb-4 mb-lg-0">
          <CCard class="border-0 shadow-sm rounded-xl h-100 mb-0">
            <CCardBody class="text-center p-4 p-md-5">
              <div class="avatar-upload-wrapper mb-4">
                <div 
                  class="avatar-preview shadow-lg"
                  :style="{ backgroundColor: getAvatarColor(localForm.nameEn) }"
                >
                  <img v-if="localForm.image" :src="localForm.image" class="avatar-img" />
                  <span v-else class="avatar-initials">{{ initials }}</span>
                </div>
                <CButton variant="outline" shape="pill" class="btn-sm btn-upload mt-3 shadow-sm" @click="triggerUpload">
                  <CIcon name="cil-camera" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Change Photo' : 'เปลี่ยนรูปโปรไฟล์' }}
                </CButton>
                <input type="file" ref="fileInput" class="d-none" @change="onFileChange" accept="image/*" />
              </div>

              <h4 class="font-weight-bold mb-1">{{ displayName }}</h4>
              <p class="text-muted small mb-4">{{ localForm.studentId }}</p>
              
              <div class="text-left mt-4 border-top pt-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label for="artist-profile-bio" class="section-label mb-0">{{ $i18n.locale === 'en' ? 'Biography' : 'ประวัติส่วนตัว' }}</label>
                  <small class="text-muted">{{ localForm.bio ? localForm.bio.length : 0 }} / 200</small>
                </div>
                <CTextarea 
                  id="artist-profile-bio" v-model="localForm.bio"
                  :placeholder="$i18n.locale === 'en' ? 'Tell us about yourself and your artistic style...' : 'บอกเล่าเกี่ยวกับตัวคุณและสไตล์ศิลปะของคุณ...'"
                  class="bio-textarea"
                  rows="4"
                  maxlength="200"
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <!-- Right Column: Personal Information -->
        <CCol lg="8">
          <CCard class="border-0 shadow-sm rounded-xl h-100 mb-0">
            <CCardHeader class="bg-white border-bottom py-3 px-4 px-md-5">
              <h5 class="mb-0 font-weight-bold text-dark">{{ $i18n.locale === 'en' ? 'Personal Information' : 'ข้อมูลส่วนตัว' }}</h5>
            </CCardHeader>
            <CCardBody class="p-4 p-md-5">
              <CRow>
                <!-- Name Fields -->
                <CCol md="6" class="mb-4">
                  <label for="artist-profile-nameth" class="form-label">{{ $i18n.locale === 'en' ? 'Full Name (Thai)' : 'ชื่อ-นามสกุล (ภาษาไทย)' }}</label>
                  <CInput id="artist-profile-nameth" v-model="localForm.nameTh" placeholder="ชื่อ-นามสกุล" class="custom-input shadow-none" />
                </CCol>
                <CCol md="6" class="mb-4">
                  <label for="artist-profile-nameen" class="form-label">{{ $i18n.locale === 'en' ? 'Full Name (English)' : 'ชื่อ-นามสกุล (ภาษาอังกฤษ)' }}</label>
                  <CInput id="artist-profile-nameen" v-model="localForm.nameEn" placeholder="Full Name" class="custom-input shadow-none" />
                </CCol>

                <!-- Email Fields -->
                <CCol md="6" class="mb-4">
                  <label for="artist-profile-email" class="form-label">{{ $i18n.locale === 'en' ? 'University Email' : 'อีเมลมหาวิทยาลัย' }}</label>
                  <CInput id="artist-profile-email" v-model="localForm.email" placeholder="student@lamduan.mfu.ac.th" disabled class="custom-input shadow-none bg-light" />
                  <small class="text-muted">{{ $i18n.locale === 'en' ? 'Cannot be changed' : 'ไม่สามารถแก้ไขได้' }}</small>
                </CCol>
                <CCol md="6" class="mb-4">
                  <label for="artist-personal-email" class="form-label">{{ $i18n.locale === 'en' ? 'Personal Email' : 'อีเมลส่วนตัว' }}</label>
                  <CInput id="artist-personal-email" v-model="localForm.personalEmail" placeholder="example@gmail.com" type="email" maxlength="254" class="custom-input shadow-none" />
                  <div v-if="validationError" class="text-danger mt-2" role="alert">{{ validationError }}</div>
                </CCol>

                <!-- Phone & ID -->
                <CCol md="6" class="mb-4">
                  <label for="artist-profile-telephone" class="form-label">{{ $i18n.locale === 'en' ? 'Telephone' : 'เบอร์โทรศัพท์' }}</label>
                  <CInput id="artist-profile-telephone" v-model="localForm.telephone" placeholder="08x-xxx-xxxx" class="custom-input shadow-none" />
                </CCol>
                <CCol md="6" class="mb-4">
                  <label for="artist-profile-studentid" class="form-label">{{ $i18n.locale === 'en' ? 'Artist ID / Student ID' : 'รหัสศิลปิน / รหัสนักศึกษา' }}</label>
                  <CInput id="artist-profile-studentid" v-model="localForm.studentId" placeholder="64xxxxxxx" disabled class="custom-input shadow-none bg-light" />
                </CCol>

                <!-- Address Fields -->
                <CCol md="6" class="mb-4">
                  <label for="artist-profile-addressbill" class="form-label">{{ $i18n.locale === 'en' ? 'Billing Address' : 'ที่อยู่สำหรับออกใบเสร็จ' }}</label>
                  <CTextarea id="artist-profile-addressbill"
                    v-model="localForm.addressBill" 
                    :placeholder="$i18n.locale === 'en' ? 'Your billing address...' : 'ที่อยู่สำหรับออกใบเสร็จของคุณ...'" 
                    class="bio-textarea shadow-none" 
                    rows="3" 
                  />
                </CCol>
                <CCol md="6" class="mb-4">
                  <label for="artist-profile-addressshipping" class="form-label">{{ $i18n.locale === 'en' ? 'Shipping Address' : 'ที่อยู่สำหรับจัดส่ง' }}</label>
                  <CTextarea id="artist-profile-addressshipping"
                    v-model="localForm.addressShipping" 
                    :placeholder="$i18n.locale === 'en' ? 'Your shipping address...' : 'ที่อยู่สำหรับจัดส่งของคุณ...'" 
                    class="bio-textarea shadow-none" 
                    rows="3" 
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>

    <template #footer>
      <div class="d-flex w-100 justify-content-end p-2">
        <CButton @click="cancelEdit" variant="outline" shape="pill" class="btn-modal-action mr-3">
          {{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
        </CButton>
        <CButton @click="handleSave" :disabled="loading" shape="pill" class="btn-modal-action btn-save-action font-weight-bold">
          <CIcon v-if="!loading" name="cil-save" class="mr-2" />
          <CSpinner v-else size="sm" class="mr-2" />
          {{ $i18n.locale === 'en' ? 'Save Changes' : 'บันทึกการเปลี่ยนแปลง' }}
        </CButton>
      </div>
    </template>
  </CModal>
</template>

<script>
import { isValidPersonalEmail } from '@/utils/profileEmail'
export default {
  name: 'EditProfileModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    initialData: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localForm: null,
      selectedFile: null,
      validationError: ''
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.localForm = JSON.parse(JSON.stringify(this.initialData));
        this.selectedFile = null;
        this.validationError = '';
      }
    }
  },
  computed: {
    localShow: {
      get() {
        return this.show;
      },
      set(val) {
        this.$emit('update:show', val);
      }
    },
    displayName() {
      if (!this.localForm) return '';
      return this.$i18n.locale === 'th' && this.localForm.nameTh 
        ? this.localForm.nameTh 
        : this.localForm.nameEn;
    },
    initials() {
      if (!this.localForm) return '';
      const name = this.displayName || 'A';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
  },
  methods: {
    getAvatarColor(name) {
      const colors = ['#321fdb', '#f97316', '#10b981', '#ef4444', '#8b5cf6'];
      if (!name) return colors[0];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    },
    triggerUpload() {
      this.$refs.fileInput.click();
    },
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.localForm.image = URL.createObjectURL(file);
        this.selectedFile = file;
        this.$refs.fileInput.value = '';
      }
    },
    cancelEdit() {
      this.localShow = false;
      this.$emit('cancel');
    },
    handleSave() {
      this.validationError = '';
      if (!isValidPersonalEmail(this.localForm.personalEmail)) {
        this.validationError = this.$i18n.locale === 'en' ? 'Enter a valid personal email address.' : 'กรุณากรอกอีเมลส่วนตัวให้ถูกต้อง';
        return;
      }
      this.$emit('save', {
        form: this.localForm,
        file: this.selectedFile
      });
    }
  }
}
</script>

<style scoped>
.avatar-upload-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-preview {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  margin: 0 auto;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -2px;
}

.btn-upload {
  color: #8c1515 !important;
  border-color: #8c1515 !important;
  background-color: transparent !important;
  font-weight: 600 !important;
}

.btn-upload:hover {
  background-color: #fff1f1 !important;
  color: #701111 !important;
  border-color: #701111 !important;
}

.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.custom-input ::v-deep .form-control {
  padding: 0.85rem 1.25rem;
  height: auto;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  color: #1e293b;
}

.custom-input ::v-deep .form-control:focus {
  border-color: #321fdb33;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(50, 31, 219, 0.05);
}

.bio-textarea ::v-deep .form-control {
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  background-color: #f8fafc;
  padding: 1rem;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: none;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
}

.btn-modal-action {
  padding: 0.75rem 2.5rem !important;
  font-size: 0.95rem !important;
  min-width: 180px;
  transition: all 0.3s ease;
  border-width: 2px !important;
}

.btn-modal-action:not(.btn-save-action) {
  color: #8c1515 !important;
  border-color: #8c1515 !important;
  background-color: transparent !important;
}

.btn-modal-action:not(.btn-save-action):hover {
  background-color: #fff1f1 !important;
  transform: translateY(-2px);
}

.btn-save-action {
  background-color: #8c1515 !important;
  border: 2px solid #8c1515 !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(140, 21, 21, 0.2) !important;
}

.btn-save-action:hover {
  background-color: #701111 !important;
  border-color: #701111 !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(140, 21, 21, 0.3) !important;
}

::v-deep .modal-body {
  padding: 0 !important;
}

.modal-bg-wrapper {
  background-color: #f8fafc;
  padding: 2rem;
}

@media (max-width: 992px) {
  .modal-bg-wrapper {
    padding: 1rem;
  }
}

.rounded-xl {
  border-radius: 1rem !important;
}
</style>
