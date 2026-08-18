<template>
  <SectionPageHero
    variant="news"
    :title-lead="$i18n.locale === 'en' ? 'News' : 'ข่าวสาร'"
    :title-highlight="$i18n.locale === 'en' ? '& Events' : '& กิจกรรม'"
  />
</template>

<script>
import SectionPageHero from './SectionPageHero.vue'

export default {
  name: 'SectionHeaderNews',
  components: {
    SectionPageHero,
  }
}
</script>
