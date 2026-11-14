<template>
  <div class="page-hero py-5 d-flex align-items-center position-relative overflow-hidden">
    <HeroGravityVisual :variant="variant" light />
    <CContainer class="my-4 page-hero__container">
      <CRow class="align-items-center">
        <CCol lg="8" class="hero-text-col mb-5 mb-lg-0">
          <div class="reveal-animation">
            <span class="badge bg-light text-dark mb-3 py-2 px-3 badge-short-course">
              {{ badge }}
            </span>
            <h1 class="hero-title text-uppercase mb-0">
              <span class="hero-title-line">
                {{ titleLead }} <span class="text-highlight">{{ titleHighlight }}</span>
              </span>
              <span v-if="titleSubline" class="hero-title-line hero-title-university">
                {{ titleSubline }}
              </span>
            </h1>
            <div class="title-separator mt-3 mb-0"></div>
            <p v-if="description" class="hero-description mt-4 mb-0">
              {{ description }}
            </p>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import HeroGravityVisual from './HeroGravityVisual.vue'

export default {
  name: 'SectionPageHero',
  components: {
    HeroGravityVisual,
  },
  props: {
    variant: {
      type: String,
      default: 'home',
    },
    badge: {
      type: String,
      default: 'BUDDHIST ART SPACE',
    },
    titleLead: {
      type: String,
      required: true,
    },
    titleHighlight: {
      type: String,
      required: true,
    },
    titleSubline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
}
</script>

<style scoped>
.page-hero {
  background-color: #ffffff;
  border-bottom: 1px solid rgba(97, 39, 33, 0.06);
  color: #1f2937;
  min-height: 520px;
  padding: 6rem 0;
  overflow: hidden;
}

.page-hero__container {
  position: relative;
  z-index: 2;
}

.hero-text-col {
  position: relative;
  z-index: 3;
}

.badge-short-course {
  color: #6b2f28 !important;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  box-shadow: 0 8px 18px rgba(120, 55, 45, 0.12);
  border: 1px solid rgba(120, 55, 45, 0.14);
}

.hero-title {
  font-family: var(--app-font-family);
  font-size: 3.6rem;
  font-weight: 700;
  line-height: 1.08;
  color: #1f2937;
  letter-spacing: 0;
}

.hero-title-line {
  display: block;
}

.hero-title-university {
  font-size: 0.72em;
  margin-top: 0.15em;
  color: #374151;
}

.text-highlight {
  color: #4a1d18;
}

.title-separator {
  width: 70px;
  height: 4px;
  background: #612721;
  border-radius: 2px;
}

.hero-description {
  font-family: var(--app-font-family);
  font-size: 1.04rem;
  font-weight: 400;
  line-height: 1.75;
  color: #4b5563;
  max-width: 64ch;
}

.reveal-animation {
  animation: heroTextReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes heroTextReveal {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 991.98px) {
  .page-hero {
    min-height: 420px;
    padding: 4.5rem 0;
  }

  .hero-title {
    font-size: 2.8rem;
  }
}

@media (max-width: 575.98px) {
  .page-hero {
    min-height: 360px;
    padding: 3.5rem 0;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-description {
    font-size: 0.96rem;
    line-height: 1.7;
  }
}
</style>
