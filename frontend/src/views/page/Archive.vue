<template>
  <Artworks :archive-mode="true" />
</template>

<script>
import Artworks from './Artworks.vue'

export default {
  name: 'Archive',
  components: { Artworks }
}
</script>
