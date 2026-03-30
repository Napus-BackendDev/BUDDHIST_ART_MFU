<template>
  <div class="c-app flex-row align-items-center login-bg">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol md="10" lg="8" xl="6">
          <CCard class="mx-4 mb-0 shadow-premium border-0 overflow-hidden glass-morphism">
            <CCardBody class="p-0">
              <CRow class="no-gutters">
                <!-- Branding Section (Optional or internal) -->
                <CCol md="12" class="p-5 text-center">
                  <div class="mb-4">
                    <img src="@/assets/logo.svg" height="80" class="brand-logo mb-3">
                    <h2 class="brand-main-text mb-0">Buddhist Art MFU</h2>
                    <p class="brand-sub-text">พุทธศิลป์</p>
                  </div>

                  <!-- Role Selection Tabs -->
                  <div class="role-selector mb-4">
                    <div 
                      v-for="role in roles" 
                      :key="role.id"
                      class="role-tab"
                      :class="{ 'active': activeRole === role.id }"
                      @click="activeRole = role.id"
                    >
                      <CIcon :name="role.icon" class="mr-2" />
                      {{ role.label }}
                    </div>
                  </div>

                  <CForm @submit.prevent="handleLogin">
                    <div class="login-context-msg mb-4">
                      <p class="text-muted small">{{ currentRoleData.description }}</p>
                    </div>

                    <CInput
                      v-model="form.username"
                      :placeholder="currentRoleData.placeholder"
                      autocomplete="username"
                      class="custom-input mb-3"
                    >
                      <template #prepend-content><CIcon name="cil-user"/></template>
                    </CInput>

                    <CInput
                      v-model="form.password"
                      placeholder="Password"
                      type="password"
                      autocomplete="current-password"
                      class="custom-input mb-4"
                    >
                      <template #prepend-content><CIcon name="cil-lock-locked"/></template>
                    </CInput>

                    <CRow>
                      <CCol col="12">
                        <CButton 
                          type="submit"
                          color="danger" 
                          block 
                          class="premium-button py-2 mb-3"
                          style="background-color: #ac1515; border: none;"
                        >
                          Login as {{ currentRoleData.label }}
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <div class="text-center mt-4">
            <p class="text-muted small">&copy; 2024 Buddhist Art MFU. All rights reserved.</p>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      activeRole: 'artist',
      roles: [
        { id: 'artist', label: 'Artist', icon: 'cil-brush', description: 'Sign in to manage your submissions.', placeholder: 'Username' },
        { id: 'admin', label: 'Admin', icon: 'cil-shield-check', description: 'Access backend management and overview.', placeholder: 'Admin Username' }
      ],
      form: {
        username: '',
        password: ''
      }
    }
  },
  computed: {
    currentRoleData() {
      return this.roles.find(r => r.id === this.activeRole);
    }
  },
  methods: {
    async handleLogin() {
      const payload = {
        username: this.form.username,
        password: this.form.password,
        role: this.activeRole === 'artist' ? 'Artist' : 'Admin'
      };
      
      try {
        await this.$store.dispatch('auth/onLogin', payload);
      } catch (err) {
        // Error is handled in store via dialog
        console.error('Login error:', err);
      }
    }
  }
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.brand-main-text {
  color: #3c4b64; 
  font-weight: 800; 
  font-size: 1.8rem; 
  line-height: 1.1;
}

.brand-sub-text {
  color: #ac1515; 
  font-weight: 700; 
  font-size: 1.1rem;
}

.role-selector {
  display: flex;
  background: rgba(0,0,0,0.05);
  padding: 5px;
  border-radius: 50px;
  justify-content: space-between;
}

.role-tab {
  flex: 1;
  padding: 10px 15px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-tab.active {
  background: white;
  color: #ac1515;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.custom-input ::v-deep .form-control {
  border-radius: 12px;
  padding: 1.2rem 1rem;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(0,0,0,0.05);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider:not(:empty)::before {
  margin-right: 1.5em;
}

.divider:not(:empty)::after {
  margin-left: 1.5em;
}

.shadow-premium {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
}
</style>
