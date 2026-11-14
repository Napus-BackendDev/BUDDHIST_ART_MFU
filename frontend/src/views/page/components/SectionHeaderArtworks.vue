<template>
  <SectionPageHero
    :variant="variant"
    :badge="badge"
    :title-lead="resolvedTitleLead"
    :title-highlight="resolvedTitleHighlight"
    :description="description"
  />
</template>

<script>
import SectionPageHero from './SectionPageHero.vue'

export default {
  name: 'SectionHeaderArtworks',
  components: {
    SectionPageHero,
  },
  props: {
    variant: {
      type: String,
      default: 'artworks',
    },
    badge: {
      type: String,
      default: 'BUDDHIST ART SPACE',
    },
    titleLead: {
      type: String,
      default: '',
    },
    titleHighlight: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  computed: {
    resolvedTitleLead() {
      if (this.titleLead) return this.titleLead
      return this.$i18n && this.$i18n.locale === 'en' ? 'Artwork' : 'ผลงาน'
    },
    resolvedTitleHighlight() {
      if (this.titleHighlight) return this.titleHighlight
      return this.$i18n && this.$i18n.locale === 'en' ? 'Collection' : 'ศิลปะ'
    },
  },
}
</script>
