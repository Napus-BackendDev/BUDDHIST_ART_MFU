<template>
  <section class="legal-page">
    <CContainer>
      <article class="legal-card">
        <span class="legal-label">BUDDHIST ART MFU</span>
        <h1>{{ content.title }}</h1>
        <p>{{ content.message }}</p>
        <p>
          {{ $i18n.locale === 'en' ? 'For questions, contact' : 'หากมีคำถาม กรุณาติดต่อ' }}
          <a href="mailto:buddhistart@mfu.ac.th">buddhistart@mfu.ac.th</a>
        </p>
      </article>
    </CContainer>
  </section>
</template>

<script>
export default {
  name: 'LegalNotice',
  computed: {
    content() {
      const privacy = this.$route.meta && this.$route.meta.legal === 'privacy';
      if (this.$i18n.locale === 'en') return privacy
        ? { title: 'Privacy Policy', message: 'The official privacy policy is being prepared for publication.' }
        : { title: 'Terms of Service', message: 'The official terms of service are being prepared for publication.' };
      return privacy
        ? { title: 'นโยบายความเป็นส่วนตัว', message: 'นโยบายความเป็นส่วนตัวฉบับทางการอยู่ระหว่างจัดทำเพื่อเผยแพร่' }
        : { title: 'ข้อกำหนดการให้บริการ', message: 'ข้อกำหนดการให้บริการฉบับทางการอยู่ระหว่างจัดทำเพื่อเผยแพร่' };
    }
  }
};
</script>

<style scoped>
.legal-page { min-height: 65vh; padding: 10rem 0 5rem; background: #fffaf7; }
.legal-card { max-width: 760px; margin: auto; padding: 3rem; border-radius: 22px; background: #fff; border: 1px solid rgba(97,39,33,.12); box-shadow: 0 20px 50px rgba(74,29,24,.08); }
.legal-label { color: #a76d2a; font-weight: 800; letter-spacing: .12em; }
h1 { color: #612721; margin: .75rem 0 1.5rem; }
p { color: #5f5552; line-height: 1.8; }
a { color: #8c3b32; font-weight: 700; }
</style>
