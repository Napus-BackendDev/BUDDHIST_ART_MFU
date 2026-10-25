<template>
  <p v-if="text" role="status" class="missing-fields-hint small text-muted mb-0">{{ text }}</p>
</template>

<script>
import { missingText } from '@/utils/missingFields'

export default {
  name: 'MissingFieldsHint',
  props: { labels: { type: Array, default: () => [] } },
  computed: {
    text() {
      return missingText(this.labels, this.$i18n.locale)
    }
  }
}
</script>

<style scoped>
.missing-fields-hint { color: #8a3b12 !important; text-align: right; }
</style>
