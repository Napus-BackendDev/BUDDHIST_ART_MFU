<template>
  <div class="news-preview-panel" role="region" :aria-label="$i18n.locale === 'en' ? 'News preview' : 'ตัวอย่างข่าว'">
    <p class="small text-muted mb-3">{{ $i18n.locale === 'en' ? 'Preview — this is how the article will look on the website. Nothing is saved yet.' : 'ตัวอย่าง — หน้าข่าวบนเว็บไซต์จะแสดงแบบนี้ ยังไม่ได้บันทึก' }}</p>
    <article class="news-preview-article bg-white p-3 border rounded">
      <h1 class="font-weight-bold mb-3 news-preview-title">{{ title || ($i18n.locale === 'en' ? '(no title)' : '(ยังไม่มีหัวข้อ)') }}</h1>
      <hr class="my-3">
      <div class="article-content mb-4 news-preview-content" v-html="safeHtml"></div>
      <div v-if="ordered.length" class="row news-preview-gallery">
        <div v-for="(img, index) in ordered" :key="index" class="col-6 col-md-4 mb-3">
          <div class="position-relative rounded overflow-hidden bg-light">
            <img :src="img" alt="" class="img-fluid w-100">
            <span v-if="index === 0" class="badge badge-dark position-absolute" style="top: 8px; left: 8px;">{{ $i18n.locale === 'en' ? 'Cover' : 'หน้าปก' }}</span>
          </div>
        </div>
      </div>
      <p v-else class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'No images added.' : 'ยังไม่มีรูปภาพ' }}</p>
    </article>
  </div>
</template>

<script>
import DOMPurify from 'dompurify'

export default {
  name: 'NewsPreviewPanel',
  props: {
    title: { type: String, default: '' },
    html: { type: String, default: '' },
    images: { type: Array, default: () => [] },
    coverIndex: { type: Number, default: 0 }
  },
  computed: {
    // Same sanitising as the public page, so the preview cannot show markup the site would strip.
    safeHtml() {
      return DOMPurify.sanitize(this.html || '')
    },
    // The chosen cover comes first, the rest keep their order.
    ordered() {
      const list = this.images.filter(Boolean)
      if (!list.length) return []
      const cover = list[this.coverIndex] ? this.coverIndex : 0
      return [list[cover], ...list.filter((_, index) => index !== cover)]
    }
  }
}
</script>

<style scoped>
.news-preview-content ::v-deep img { max-width: 100%; height: auto; }
</style>
