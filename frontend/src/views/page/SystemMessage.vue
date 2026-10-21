<template>
  <section class="system-state-page">
    <div class="system-state-card text-center">
      <div class="state-code">{{ state.code }}</div>
      <h1>{{ state.title }}</h1>
      <p>{{ state.message }}</p>
      <CButton class="state-action" @click="$router.push('/')">
        {{ $i18n.locale === 'en' ? 'Back to Home' : 'กลับหน้าหลัก' }}
      </CButton>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SystemMessage',
  computed: {
    state() {
      const forbidden = this.$route.meta && this.$route.meta.state === 'forbidden';
      if (forbidden) {
        return this.$i18n.locale === 'en'
          ? { code: '403', title: 'Access denied', message: 'Your account does not have permission to open this page.' }
          : { code: '403', title: 'ไม่มีสิทธิ์เข้าถึง', message: 'บัญชีของคุณไม่มีสิทธิ์เปิดหน้านี้' };
      }
      return this.$i18n.locale === 'en'
        ? { code: '404', title: 'Page not found', message: 'The page may have moved or the address may be incorrect.' }
        : { code: '404', title: 'ไม่พบหน้าที่ต้องการ', message: 'หน้าอาจถูกย้าย หรือลิงก์ไม่ถูกต้อง' };
    }
  }
};
</script>

<style scoped>
.system-state-page { min-height: 70vh; display: grid; place-items: center; padding: 8rem 1.5rem 4rem; background: linear-gradient(145deg, #fffaf7, #f4e9e4); }
.system-state-card { width: min(560px, 100%); padding: 3rem; border: 1px solid rgba(97,39,33,.14); border-radius: 24px; background: rgba(255,255,255,.9); box-shadow: 0 24px 60px rgba(74,29,24,.12); backdrop-filter: blur(10px); }
.state-code { color: #8c3b32; font: 800 4.5rem/1 var(--app-font-family); }
h1 { color: #3c2a28; margin: 1rem 0; }
p { color: #6f625f; margin-bottom: 2rem; }
.state-action { color: #fff; background: linear-gradient(135deg, #612721, #8c3b32); border: 0; padding: .8rem 1.6rem; transition: all .3s cubic-bezier(.4,0,.2,1); }
.state-action:hover, .state-action:focus { color: #fff; transform: translateY(-2px); box-shadow: 0 10px 24px rgba(97,39,33,.25); }
</style>
