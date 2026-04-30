<template>
  <span class="cart-item-timer">
    {{ remainingTime }}
  </span>
</template>

<script>
export default {
  name: 'CartItemTimer',
  props: {
    addedAt: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      currentTime: Date.now(),
      timer: null
    }
  },
  computed: {
    remainingTime() {
      const expiry = this.addedAt + 15 * 60 * 1000;
      const diff = expiry - this.currentTime;
      if (diff <= 0) return '00:00';
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.currentTime = Date.now();
    }, 1000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
</script>

<style scoped>
.cart-item-timer {
  font-family: monospace;
  font-size: 1.1em;
}
</style>
