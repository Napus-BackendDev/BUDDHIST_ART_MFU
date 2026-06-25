<template>
  <CDropdown
    inNav
    class="c-header-nav-items"
    placement="bottom-end"
    add-menu-classes="pt-0 mt-2 shadow-sm rounded-lg premium-dropdown-menu"
  >
    <template #toggler>
      <CHeaderNavLink class="px-0">
        <div class="user-avatar-trigger d-flex align-items-center" style="cursor: pointer;">
          <img v-if="userImage" :src="userImage" class="rounded-circle border" style="width: 35px; height: 35px; object-fit: cover;" />
          <div v-else class="avatar-fallback rounded-circle bg-danger text-white d-flex align-items-center justify-content-center font-weight-bold" style="width: 35px; height: 35px;">
            {{ userInitial }}
          </div>
        </div>
      </CHeaderNavLink>
    </template>

    <CDropdownHeader tag="div" class="text-center bg-light font-weight-bold py-2 rounded-top">
      {{ $i18n.locale === 'en' ? 'Account' : 'บัญชีผู้ใช้' }}
    </CDropdownHeader>

    <CDropdownItem disabled class="d-flex align-items-center py-2 px-3">
      <div>
        <div class="font-weight-bold text-dark">{{ userName }}</div>
        <div class="text-muted small text-capitalize">{{ userRole }}</div>
      </div>
    </CDropdownItem>

    <CDropdownDivider class="my-0" />

    <CDropdownItem @click="logout" class="text-danger font-weight-bold py-2 px-3">
      <CIcon name="cil-lock-locked" class="mr-3" /> {{ $i18n.locale === 'en' ? 'Logout' : 'ออกจากระบบ' }}
    </CDropdownItem>
  </CDropdown>
</template>

<script>
export default {
  name: 'TheHeaderDropdownAccnt',
  data() {
    return {
      userImage: '',
      userName: 'Administrator',
      userRole: 'admin',
      userInitial: 'A'
    }
  },
  created() {
    this.checkLoginStatus();
  },
  methods: {
    async checkLoginStatus() {
      try {
        const objs = JSON.parse(localStorage.getItem('objs'));
        if (objs && objs.xAccessToken) {
          this.userRole = (objs.role || 'admin').toLowerCase();
          const userId = objs.accounts;
          
          if (userId) {
            const users = await this.$store.dispatch('user/get', {});
            const currentUser = users ? users.find(u => u._id === userId) : null;
            if (currentUser) {
              if (currentUser.image) {
                this.userImage = currentUser.image;
              }
              
              const firstName = currentUser.firstName || '';
              const lastName = currentUser.lastName || '';
              if (firstName || lastName) {
                this.userName = `${firstName} ${lastName}`.trim();
              } else if (currentUser.username) {
                this.userName = currentUser.username;
              }
              
              this.userInitial = this.userName.charAt(0).toUpperCase();
            }
          }
        }
      } catch (e) {
        console.error('Error fetching admin header info:', e);
      }
    },
    logout() {
      localStorage.removeItem('objs');
      this.$store.commit('auth/showSignInModal', false);
      this.$router.push('/');
      window.location.reload();
    }
  }
}
</script>

<style scoped>
.user-avatar-trigger {
  transition: transform 0.2s ease;
}
.user-avatar-trigger:hover {
  transform: scale(1.05);
}
.avatar-fallback {
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  background-color: #8c1515 !important; /* Burgundy theme */
}
</style>
