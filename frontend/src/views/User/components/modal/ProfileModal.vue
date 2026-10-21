<template>
  <CModal
    :title="$i18n.locale === 'en' ? 'Edit Profile' : 'แก้ไขโปรไฟล์'"
    :show.sync="localShow"
    :close-on-backdrop="!saving"
    :close-on-esc="!saving"
    size="lg"
    :centered="true"
  >
    <template #header>
      <h5 class="modal-title">{{ $i18n.locale === 'en' ? 'Edit Profile' : 'แก้ไขโปรไฟล์' }}</h5>
      <button type="button" class="close" :disabled="saving" :aria-label="$i18n.locale === 'en' ? 'Close' : 'ปิด'" @click="localShow = false"><span aria-hidden="true">×</span></button>
    </template>
    <div class="p-4" :aria-busy="saving ? 'true' : 'false'">
      <p v-if="saveError" ref="saveErrorNotice" tabindex="-1" role="alert" class="alert alert-danger">{{ $i18n.locale === 'en' ? 'Could not save your profile. Your changes are still here. Please try again.' : 'บันทึกโปรไฟล์ไม่สำเร็จ ข้อมูลที่แก้ไขยังอยู่ กรุณาลองใหม่' }}</p>
      <div v-if="validationError" class="alert alert-danger" role="alert">{{ validationError }}</div>
      <CRow>
        <CCol md="6" class="mb-4">
          <label for="buyer-profile-nameth" class="form-label-custom">{{ $i18n.locale === 'en' ? 'Full Name (Thai)' : 'ชื่อ-นามสกุล (ภาษาไทย)' }}</label>
          <CInput :disabled="saving" id="buyer-profile-nameth" v-model="localForm.nameTh" :placeholder="$i18n.locale === 'en' ? 'Full name in Thai' : 'ชื่อ-นามสกุลภาษาไทย'" class="custom-input-premium shadow-none" />
        </CCol>
        <CCol md="6" class="mb-4">
          <label for="buyer-profile-nameen" class="form-label-custom">{{ $i18n.locale === 'en' ? 'Full Name (English)' : 'ชื่อ-นามสกุล (ภาษาอังกฤษ)' }}</label>
          <CInput :disabled="saving" id="buyer-profile-nameen" v-model="localForm.nameEn" :placeholder="$i18n.locale === 'en' ? 'Full name in English' : 'ชื่อ-นามสกุลภาษาอังกฤษ'" class="custom-input-premium shadow-none" />
        </CCol>

        <CCol md="6" class="mb-4">
          <label for="buyer-personal-email" class="form-label-custom">{{ $i18n.locale === 'en' ? 'Personal Email' : 'อีเมลส่วนตัว' }}</label>
          <CInput :disabled="saving" id="buyer-personal-email" v-model="localForm.personalEmail" placeholder="example@gmail.com" type="email" maxlength="254" class="custom-input-premium shadow-none" />
        </CCol>
        <CCol md="6" class="mb-4">
          <label for="buyer-profile-telephone" class="form-label-custom">{{ $i18n.locale === 'en' ? 'Telephone' : 'เบอร์โทรศัพท์' }}</label>
          <CInput :disabled="saving" id="buyer-profile-telephone" v-model="localForm.telephone" placeholder="08x-xxx-xxxx" class="custom-input-premium shadow-none" />
        </CCol>
        <CCol md="6" class="mb-4">
          <label for="buyer-profile-bill" class="form-label-custom">{{ $i18n.locale === 'en' ? 'Billing Address' : 'ที่อยู่ออกใบเสร็จ' }}</label>
          <CTextarea :disabled="saving" id="buyer-profile-bill" v-model="localForm.bill" :placeholder="$i18n.locale === 'en' ? 'Enter your billing address' : 'กรอกที่อยู่สำหรับออกใบเสร็จ'" rows="3" class="custom-input-premium shadow-none" />
        </CCol>
        <CCol md="6" class="mb-4">
          <label for="buyer-profile-shipping" class="form-label-custom">{{ $i18n.locale === 'en' ? 'Shipping Address' : 'ที่อยู่จัดส่ง' }}</label>
          <CTextarea :disabled="saving" id="buyer-profile-shipping" v-model="localForm.shipping" :placeholder="$i18n.locale === 'en' ? 'Enter your shipping address' : 'กรอกที่อยู่สำหรับจัดส่ง'" rows="3" class="custom-input-premium shadow-none" />
        </CCol>
      </CRow>
    </div>
    <template #footer>
      <div class="d-flex w-100 justify-content-end p-3 rounded-bottom">
        <CButton @click="handleCancel" :disabled="saving" variant="outline" shape="pill" class="mr-3 hover-lift px-4">
          {{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
        </CButton>
        <CButton color="dark" :disabled="saving" shape="pill" class="px-5 font-weight-bold shadow-sm hover-lift btn-premium" @click="handleSave">
          {{ saving ? ($i18n.locale === 'en' ? 'Saving...' : 'กำลังบันทึก...') : ($i18n.locale === 'en' ? 'Save Changes' : 'บันทึกการเปลี่ยนแปลง') }}
        </CButton>
      </div>
    </template>
  </CModal>
</template>

<script>
import { isValidPersonalEmail } from '@/utils/profileEmail'
export default {
  name: 'ProfileModal',
  props: {
    saving: { type: Boolean, default: false },
    saveError: { type: Boolean, default: false },
    show: {
      type: Boolean,
      default: false
    },
    form: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      localForm: { ...this.form },
      validationError: ''
    }
  },
  watch: {
    saveError(value) {
      if (value) this.$nextTick(() => this.$refs.saveErrorNotice && this.$refs.saveErrorNotice.focus());
    },
    show(val) {
      if (val) {
        this.localForm = { ...this.form };
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
        if (!val && this.saving) return;
        this.$emit('update:show', val);
        if (!val) this.$emit('cancel');
      }
    }
  },
  methods: {
    handleCancel() {
      if (this.saving) return;
      this.localShow = false;
    },
    handleSave() {
      if (this.saving) return;
      this.validationError = '';
      if (!isValidPersonalEmail(this.localForm.personalEmail)) {
        this.validationError = this.$i18n.locale === 'en' ? 'Enter a valid personal email address.' : 'กรุณากรอกอีเมลส่วนตัวให้ถูกต้อง';
        return;
      }
      this.$emit('save', this.localForm);
    }
  }
}
</script>

<style scoped>
.form-label-custom {
    font-weight: 600;
    color: #4a5568;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    display: block;
}

.custom-input-premium ::v-deep .form-control {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 0.75rem 1rem;
    background-color: #f8fafc;
    transition: all 0.3s ease;
    color: #2d3748;
    height: auto;
}

.custom-input-premium ::v-deep .form-control:focus {
    background-color: #ffffff;
    border-color: #d4af37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
}

.btn-premium {
    background: linear-gradient(135deg, #612721 0%, #8a3a31 100%);
    color: white !important;
    border: none;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.btn-premium:hover {
    background: linear-gradient(135deg, #8a3a31 0%, #612721 100%);
    box-shadow: 0 8px 20px rgba(97, 39, 33, 0.25) !important;
    transform: translateY(-2px);
}

.hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
    transform: translateY(-3px);
}
</style>
