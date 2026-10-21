import { readArtworkImage } from '@/utils/artworkImage'

export default {
  data: () => ({ imageError: '', isProcessingImage: false, imageInputVersion: 0 }),
  watch: {
    show() {
      this.imageInputVersion++
      this.imageError = ''
      this.isProcessingImage = false
    }
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files && event.target.files[0]
      if (!file || this.isProcessingImage) return
      const version = ++this.imageInputVersion
      this.imageError = ''
      this.isProcessingImage = true
      try {
        const preview = await readArtworkImage(file, this.$i18n.locale)
        if (version !== this.imageInputVersion) return
        this.form.image = file
        this.imagePreview = preview
      } catch (error) {
        if (version === this.imageInputVersion) {
          this.imageError = error.message
          event.target.value = ''
        }
      } finally {
        if (version === this.imageInputVersion) this.isProcessingImage = false
      }
    }
  }
}
