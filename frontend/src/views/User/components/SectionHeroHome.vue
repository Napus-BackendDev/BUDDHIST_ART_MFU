<template>
  <div class="hero-home">
    <CCarousel arrows indicators animate height="600px">
      <CCarouselItem v-for="(item, index) in newsItems" :key="index">
        <div 
          class="hero-slide d-flex align-items-center justify-content-center text-white text-center p-5"
          :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${item.image})` }"
        >
          <div class="hero-content animate-up">
            <h1 class="display-3 font-weight-bold mb-4 slide-title">{{ item.title }}</h1>
            <p class="lead mb-5 slide-desc">{{ item.description }}</p>
            <div class="d-flex justify-content-center gap-3">
              <CButton color="light" shape="pill" class="px-5 py-3 font-weight-bold shadow-lg mr-3" @click="explore(item.id)">
                อ่านรายละเอียด
              </CButton>
              <CButton color="danger" variant="outline" shape="pill" class="px-5 py-3 font-weight-bold slide-btn-outline" @click="$router.push('/artworks')">
                ชมผลงาน
              </CButton>
            </div>
          </div>
        </div>
      </CCarouselItem>
    </CCarousel>
  </div>
</template>

<script>
export default {
  name: 'SectionHeroHome',
  data() {
    return {
      newsItems: [
        {
          id: 1,
          title: 'เปิดรับสมัครพุทธศิลปกรรม รุ่นที่ 6',
          description: 'โอกาสสำหรับผู้สนใจศึกษาพุทธศิลป์แบบเจาะลึก ประจำปีการศึกษา 2569',
          image: 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&w=1920&q=80'
        },
        {
          id: 2,
          title: 'นิทรรศการ "หยั่งรู้" (Before Thought)',
          description: 'โดยกลุ่มศิลปิน INNER Ground ณ หอศิลป์แม่ฟ้าหลวง',
          image: '/picture/A/new.jpg'
        },
        {
          id: 3,
          title: 'กรมสมเด็จพระเทพฯ เสด็จพระราชดำเนินฯ',
          description: 'ทอดพระเนตรนิทรรศการพุทธศิลปกรรม ณ มหาวิทยาลัยแม่ฟ้าหลวง',
          image: '/picture/B/a.jpg'
        }
      ]
    }
  },
  methods: {
    explore(id) {
      this.$router.push({ name: 'NewsDetail', params: { id } });
    }
  }
}
</script>

<style scoped>
.hero-home {
  margin-top: -2rem !important;
}

.hero-slide {
  height: 600px;
  background-size: cover;
  background-position: center;
}

.slide-title {
  text-shadow: 0 4px 15px rgba(0,0,0,0.5);
  font-family: 'Sarabun', sans-serif;
  letter-spacing: -1px;
}

.slide-desc {
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.hero-content {
  max-width: 1000px;
  z-index: 10;
}

.slide-btn-outline {
  border-color: #fff !important;
  color: #fff !important;
}

.slide-btn-outline:hover {
  background: #fff !important;
  color: #612721 !important;
}

.animate-up {
  animation: fadeInUp 1s ease both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero-slide {
    height: 450px;
  }
  .display-3 {
    font-size: 2.5rem;
  }
}
</style>
