<template>
  <!-- Main Container -->
  <CCard class="profile-card border-0 shadow-sm mx-3 mb-4 mt-4 overflow-hidden">
    
    <!-- Gradient Banner (Contained within the card) -->
    <div class="profile-banner"></div>
    
    <!-- Profile Card Content -->
    <CCardBody class="p-4 d-flex flex-column flex-md-row position-relative">
      
      <!-- Avatar (Overlapping banner internally) -->
      <div class="avatar-wrapper mr-md-4 mb-3 mb-md-0 d-flex justify-content-center">
        <div class="avatar-container position-relative">
          <div 
            class="avatar-img-circle shadow-sm"
            :style="{ backgroundColor: getAvatarColor(nameEn) }"
          >
            <img v-if="user && user.image" :src="user.image" class="w-100 h-100" style="object-fit: cover; border-radius: 50%;" />
            <span v-else class="avatar-initials">{{ initials }}</span>
          </div>
          <!-- Verified Icon overlay -->
          <div class="verified-badge d-flex align-items-center justify-content-center shadow-sm">
            <CIcon name="cil-check-circle" size="sm" class="text-white bg-transparent" />
          </div>
        </div>
      </div>
      
      <!-- User Info -->
      <div class="info-wrapper flex-grow-1 d-flex flex-column justify-content-center mt-3 mt-md-0">
        <!-- Name Row -->
        <div class="d-flex flex-wrap align-items-center mb-2 name-row justify-content-center justify-content-md-start">
          <h3 class="font-weight-bold mb-0 mr-3 text-dark">{{ nameEn }}</h3>
          <span class="text-muted font-weight-medium mr-3 username">@{{ username }}</span>
          <span class="status-badge px-2 py-1 font-weight-bold" :class="statusClass">
            {{ statusName }}
          </span>
        </div>
        
        <!-- Bio -->
        <p class="text-muted mb-3 bio-text text-center text-md-left">
          {{ bio || 'No biography provided yet. Edit your profile to add a bio.' }}
        </p>
        
        <!-- Meta Info (Email, Phone, Joined) -->
        <div class="meta-info d-flex flex-wrap text-muted small justify-content-center justify-content-md-start">
          <div class="meta-item mr-4 mb-2 mb-md-0 d-flex align-items-center">
            <CIcon name="cil-envelope-closed" class="meta-icon mr-2" />
            {{ email || 'No email' }}
          </div>
          <div class="meta-item mr-4 mb-2 mb-md-0 d-flex align-items-center">
            <CIcon name="cil-phone" class="meta-icon mr-2" />
            {{ telephone || 'No phone' }}
          </div>
          <div class="meta-item mb-2 mb-md-0 d-flex align-items-center">
            <CIcon name="cil-calendar" class="meta-icon mr-2" />
            Joined {{ joinedDate }}
          </div>
        </div>
      </div>
      
      <!-- Edit Button (Right aligned) -->
      <div class="action-wrapper ml-md-auto mt-3 mt-md-0 d-flex align-items-center justify-content-center justify-content-md-end">
        <CButton 
          class="btn-edit-profile px-4 py-2 font-weight-bold d-flex align-items-center shadow-sm"
          @click="$emit('edit')"
        >
          <CIcon name="cil-pencil" class="mr-2" /> Edit Profile
        </CButton>
      </div>
      
    </CCardBody>
  </CCard>
</template>

<script>
export default {
  name: 'ArtistProfileHeader',
  props: {
    user: {
      type: Object,
      default: () => null
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
      if (!this.nameEn) return 'artist';
      return this.nameEn.toLowerCase().replace(/\s+/g, '').substring(0, 15);
    },
    initials() {
      if (!this.nameEn) return 'A';
      return this.nameEn.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },
    statusName() {
      if (!this.user || !this.user.status) return 'New Member';
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
      if (name.includes('old')) return 'status-old';
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
      // In a real app we would use user.createdAt
      return 'January 2024';
    }
  },
  methods: {
    getAvatarColor(name) {
      const colors = ['#321fdb', '#f97316', '#10b981', '#ef4444', '#8b5cf6'];
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
.profile-card {
  border-radius: 16px;
  background-color: #ffffff;
}

.profile-banner {
  height: 120px;
  width: 100%;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  /* Banner sits inside the card, filling the top part naturally */
}

.avatar-container {
  margin-top: -65px; /* Pull the avatar up so it overlaps the banner inside the card */
}

.avatar-img-circle {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 4px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #e2e8f0;
}

.avatar-initials {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
}

.verified-badge {
  position: absolute;
  bottom: 0px;
  right: 5px;
  width: 28px;
  height: 28px;
  background-color: #3b82f6; /* Blue check */
  border-radius: 50%;
  border: 3px solid #ffffff;
}

.username {
  font-size: 1rem;
  color: #64748b;
}

.status-badge {
  border-radius: 12px;
  font-size: 0.75rem;
  letter-spacing: 0.2px;
}

.status-new {
  background-color: #d1fae5;
  color: #059669;
}

.status-old {
  background-color: #e0f2fe;
  color: #0284c7;
}

.status-active {
  background-color: #dcfce7;
  color: #16a34a;
}

.status-default {
  background-color: #f1f5f9;
  color: #475569;
}

.bio-text {
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 750px;
}

.meta-icon {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.meta-item {
  color: #64748b;
  font-weight: 500;
}

.btn-edit-profile {
  background-color: #ef4444; /* Soft red as per design */
  border: none;
  color: white;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-edit-profile:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}
</style>
