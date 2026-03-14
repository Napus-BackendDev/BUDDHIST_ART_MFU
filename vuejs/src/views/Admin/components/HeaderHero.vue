<template>
  <div class="header-hero mb-4">
    <div class="hero-content d-flex justify-content-between align-items-center flex-wrap">
      <div class="hero-body d-flex align-items-center flex-wrap">
        <div v-if="icon" class="hero-icon-wrapper mr-3">
          <CIcon :name="icon" size="xl" />
        </div>
        <div class="hero-text-group">
          <h1 class="hero-title m-0 mb-1">{{ title }}</h1>
          <p v-if="description || subtitle" class="hero-subtitle m-0 text-muted">
            {{ description || subtitle }}
          </p>
        </div>
      </div>
      <div v-if="showCreateButton" class="header-actions mt-3 mt-sm-0">
        <CButton 
          color="primary" 
          class="px-4 py-2 shadow-sm rounded-pill font-weight-bold d-flex align-items-center"
          @click="$emit('create')"
        >
          <CIcon name="cil-plus" class="mr-2" />
          Create Order
        </CButton>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderHero',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    showCreateButton: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.header-hero {
  position: relative;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem 1.75rem;
  color: #172b4d;
  border: 1px solid #eef0f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: default;
}

.header-hero:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  border-color: #d8dbe0;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-icon-wrapper {
  background: #f8f9fa;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #172b4d;
  border: 1px solid #f0f1f5;
  transition: all 0.3s ease;
}

.header-hero:hover .hero-icon-wrapper {
  background: #172b4d;
  color: #ffffff;
}

.hero-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #172b4d;
}

.hero-subtitle {
  color: #8a93a2 !important;
  font-size: 0.875rem;
  max-width: 800px;
  font-weight: 400;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start !important;
  }
  .header-actions {
    width: 100%;
    margin-top: 1rem;
  }
}
</style>

