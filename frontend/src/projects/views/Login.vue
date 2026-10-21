<template>
  <section class="container py-5" aria-labelledby="login-title">
    <h1 id="login-title">{{ $i18n.locale === 'en' ? 'Sign in' : 'เข้าสู่ระบบ' }}</h1>
    <p class="my-4">{{ $i18n.locale === 'en' ? 'Sign in with your Google account to continue.' : 'เข้าสู่ระบบด้วยบัญชี Google เพื่อดำเนินการต่อ' }}</p>
    <div class="d-flex flex-wrap align-items-center">
      <button type="button" class="btn btn-primary mr-3 mb-3" @click="onInit">
        {{ $i18n.locale === 'en' ? 'Continue with Google' : 'เข้าสู่ระบบด้วย Google' }}
      </button>
      <router-link to="/" class="btn btn-outline-secondary mb-3">
        {{ $i18n.locale === 'en' ? 'Back to Home' : 'กลับหน้าหลัก' }}
      </router-link>
    </div>
  </section>
</template>
<script>
export default {
  name: 'index',
  props: {
    icon: {
      type: String,
      default: 'cil-user'
    },
    caption: {
      type: String,
      default: 'Create / Update'
    },

  },
  data() {
    return {


    }
  },

  mounted() {

  },

  created() {
    this.onInit();
  },

  beforeDestroy() {

  },

  methods: {
    onInit() {
      this.$store.commit('auth/showSignInModal', true);
    },


  },

  watch: {

  }
}

</script>
