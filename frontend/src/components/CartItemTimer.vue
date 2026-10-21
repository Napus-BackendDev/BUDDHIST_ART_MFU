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
      const expiry = this.addedAt + 24 * 60 * 60 * 1000;
      const diff = expiry - this.currentTime;
      if (diff <= 0) return '00:00:00';
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
  font-family: var(--app-font-family);
  font-size: 1.1em;
  color: #dc3545;
}
</style>
