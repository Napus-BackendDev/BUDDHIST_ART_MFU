<template>
  <SectionPageHero
    variant="artworks"
    :title-lead="$i18n.locale === 'en' ? 'Artwork' : 'ผลงาน'"
    :title-highlight="$i18n.locale === 'en' ? 'Gallery' : 'ศิลปะ'"
  />
</template>

<script>
import SectionPageHero from './SectionPageHero.vue'

export default {
  name: 'SectionHeaderArtworks',
  components: {
    SectionPageHero,
  }
}
</script>
