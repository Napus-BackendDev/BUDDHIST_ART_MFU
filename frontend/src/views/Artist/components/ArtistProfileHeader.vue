<template>
  <div>
    <!-- Main Card with Glass effect -->
    <div class="profile-header-card shadow-premium overflow-hidden">
      
      <!-- Premium Multi-Layer Banner -->
      <div class="header-banner">
        <div class="banner-mesh"></div>
        <div class="banner-gradient"></div>
        <div class="banner-overlay"></div>
      </div>
      
      <!-- Content Section -->
      <div class="header-content px-4 px-md-5 pb-4 pt-0">
        <div class="d-flex flex-column flex-md-row align-items-center align-items-md-end">
          
          <!-- Avatar Section -->
          <div class="avatar-outer-wrapper mb-3 mb-md-0 mr-md-4">
            <div class="avatar-ring">
              <div 
                class="avatar-main shadow-sm"
                :style="{ backgroundColor: getAvatarColor(nameEn) }"
              >
                <img v-if="user && user.image" :src="user.image" class="avatar-image" />
                <span v-else class="avatar-initials text-white">{{ initials }}</span>
                
              </div>
            </div>
          </div>
          
          <!-- User Details Section -->
          <div class="user-details-wrapper flex-grow-1 text-center text-md-left mt-2 mb-3 mb-md-0 pb-1">
            <div class="d-flex flex-column flex-md-row align-items-center mb-1 ">
              <h2 class="display-name font-weight-bold mb-0 mr-md-3">{{ nameEn }}</h2>
              <div class="status-pill-modern" :class="statusClass">
                <span class="dot"></span>
                <span class="status-text">{{ statusName }}</span>
              </div>
            </div>
            
            <p class="profile-bio text-muted mb-0">
              {{ bio || 'No biography provided yet. Express your unique artistic vision in your profile.' }}
            </p>
          </div>
          
          <!-- Actions Section -->
          <div v-if="!isPublic" class="header-actions-wrapper ml-md-auto pb-2">
            <CButton 
              class="btn-edit-premium px-4 py-2 font-weight-bold d-flex align-items-center shadow-sm"
              @click="$emit('edit')"
            >
              <CIcon name="cil-pencil" class="mr-2 icon-pulse" /> Edit Profile
            </CButton>
          </div>
        </div>
        
        <!-- Bottom Divider -->
         <div class="header-divider my-4"></div>

        <!-- Meta Information Row -->
        <div class="meta-info-grid d-flex flex-wrap justify-content-center justify-content-md-start">
          <div class="meta-pill mr-md-4 mb-2">
            <div class="pill-icon-box">
              <CIcon name="cil-envelope-closed" />
            </div>
            <span class="pill-text">{{ email || 'No email provided' }}</span>
          </div>
          
          <div class="meta-pill mr-md-4 mb-2">
            <div class="pill-icon-box">
              <CIcon name="cil-phone" />
            </div>
            <span class="pill-text">{{ telephone || 'No phone number' }}</span>
          </div>
          
          <div class="meta-pill mb-2">
            <div class="pill-icon-box">
              <CIcon name="cil-calendar" />
            </div>
            <span class="pill-text">Artist since {{ joinedDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArtistProfileHeader',
  props: {
    user: {
      type: Object,
      default: () => null
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    nameEn() {
      if (!this.user) return 'Loading...';
      const getName = (lang) => {
        if (Array.isArray(this.user.name)) {
          const obj = this.user.name.find(n => n.key === lang);
          return obj ? obj.value : '';
        }
        return '';
      };
      return getName('en') || getName('th') || 'Artist Name';
    },
    username() {
      if (!this.nameEn || this.nameEn === 'Loading...') return 'artist';
      return this.nameEn.toLowerCase().replace(/\s+/g, '').substring(0, 15);
    },
    initials() {
      if (!this.nameEn || this.nameEn === 'Loading...') return 'A';
      return this.nameEn.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },
    statusName() {
      if (!this.user || !this.user.status) return 'New Student';
      const status = this.user.status;
      if (typeof status === 'string') return status;
      if (typeof status === 'object' && status.title && Array.isArray(status.title)) {
        const titleEn = status.title.find(t => t.key === 'en');
        return titleEn ? titleEn.value : (status.title[0] ? status.title[0].value : 'Status');
      }
      return 'Student';
    },
    statusClass() {
      const name = this.statusName.toLowerCase();
      if (name.includes('new')) return 'status-new';
      if (name.includes('active')) return 'status-active';
      return 'status-default';
    },
    bio() {
      return this.user ? this.user.bio : '';
    },
    email() {
      return this.user && this.user.contact ? (this.user.contact.personalEmail || this.user.contact.studentEmail) : '';
    },
    telephone() {
      return this.user && this.user.contact ? this.user.contact.telephone : '';
    },
    joinedDate() {
      return 'January 2024';
    }
  },
  methods: {
    getAvatarColor(name) {
      const colors = ['#fec260', '#8c1515', '#10b981', '#ef4444', '#321fdb'];
      if (!name) return colors[0];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    }
  }
}
</script>

<style scoped>
/* Main Container & Card */
.profile-header-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.shadow-premium {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.02);
}

/* Banner Design */
.header-banner {
  height: 240px;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #8c1515; /* Base color */
}

.banner-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fec260 0%, #8c1515 100%);
  opacity: 0.9;
}

.banner-mesh {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(at 10% 20%, #fec260aa 0px, transparent 50%),
    radial-gradient(at 90% 10%, #8c1515aa 0px, transparent 50%),
    radial-gradient(at 50% 50%, #ffffff33 0px, transparent 50%);
  filter: blur(20px);
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png'); /* Subtle texture */
  opacity: 0.05;
}

/* Content Layout */
.header-content {
  position: relative;
  z-index: 2;
}

/* Avatar Section */
.avatar-outer-wrapper {
  margin-top: -85px; /* Significant overlap */
  position: relative;
}

.avatar-ring {
  padding: 6px;
  background: #ffffff;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.avatar-main {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  border: 4px solid #ffffff;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -2px;
}

.verified-icon-floating {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background-color: #3b82f6;
  border-radius: 50%;
  border: 4px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

/* User Text Section */
.display-name {
  font-size: 1.85rem;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.username-handle {
  font-size: 1rem;
}

.profile-bio {
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 800px;
  font-weight: 400;
}

/* Status Pill */
.status-pill-modern {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid transparent;
}

.status-new {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}

.status-active {
  background: #eff6ff;
  color: #2563eb;
  border-color: #dbeafe;
}

.status-pill-modern .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  margin-right: 8px;
  box-shadow: 0 0 8px currentColor;
}

/* Actions Section */
.btn-edit-premium {
  background: linear-gradient(135deg, #8c1515 0%, #701111 100%);
  border: none;
  color: white;
  border-radius: 50px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-edit-premium:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 10px 20px -5px rgba(140, 21, 21, 0.4);
  color: white;
}

.icon-pulse:hover {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Horizontal Divider */
.header-divider {
  height: 1px;
  width: 100%;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
}

/* Meta Information Grid */
.meta-pill {
  display: flex;
  align-items: center;
  padding: 6px 14px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.meta-pill:hover {
  background: #ffffff;
  border-color: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.pill-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  margin-right: 10px;
  width: 16px;
  height: 16px;
}

.pill-text {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-banner {
    height: 140px;
  }
  .avatar-main {
    width: 120px;
    height: 120px;
  }
  .avatar-outer-wrapper {
    margin-top: -65px;
  }
  .display-name {
    font-size: 1.5rem;
  }
  .btn-edit-premium {
    width: 100%;
    margin-top: 1rem;
  }
  .status-pill-modern {
    margin-top: 0.5rem;
  }
}
</style>
