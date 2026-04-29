<template>
    <div>
        <CModal
            add-content-classes="border-0 shadow-premium overflow-hidden rounded-premium"
            :show.sync="isAuthe"
            :centered="true"
            :close-on-backdrop="true"
            size="lg"
        >
          <template #header-wrapper>
            <div class="px-4 pt-4 text-right">
              <button type="button" class="close" @click="isAuthe = false">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </template>
          <template #body-wrapper>
            <div class="p-4 p-md-5 text-center">
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
                      class="premium-button py-2 mb-4 font-weight-bold"
                      style="background-color: #ac1515; border: none; border-radius: 50px;"
                    >
                      Login as {{ currentRoleData.label }}
                    </CButton>
                  </CCol>
                </CRow>

                <!-- OAuth Divider -->
                <div class="divider mb-4">OR SIGN IN WITH SOCIAL</div>

                <div class="d-flex justify-content-center">
                   <div class="oauth-btn" @click="onAuthenGoogle">
                     <img src="@/assets/icons/logo-google.png" width="40" class="zoom">
                   </div>
                </div>
              </CForm>
            </div>
          </template>
          <template #footer-wrapper>
            <div class="pb-4 text-center">
               <p class="text-muted small mb-0">&copy; 2024 Buddhist Art MFU. All rights reserved.</p>
            </div>
          </template>
        </CModal>
    </div>
</template>

<script>

    import {mapGetters} from 'vuex'

    export default {
        name: 'SignIn',
        data: function () {
            return {
              activeRole: 'user',
              roles: [
                { id: 'user', label: 'User', icon: 'cil-user', description: 'Sign in to browse and purchase artworks.', placeholder: 'Username' },
                { id: 'artist', label: 'Artist', icon: 'cil-brush', description: 'Sign in to manage your submissions.', placeholder: 'Username' },
                { id: 'admin', label: 'Admin', icon: 'cil-shield-check', description: 'Access backend management and overview.', placeholder: 'Admin Username' }
              ],
              form: {
                username: '',
                password: ''
              },
              oAuth2: true,
              typePassword:"password",
              onOpenForgotPassword:true,
            }
        },
        mounted() {

        },

        created() {
        },

        beforeDestroy() {

        },

        methods: {

          onViewPassword(){
            if(this.typePassword == "password"){
              this.typePassword = "text";
            }else{
              this.typePassword = "password";
            }
          },

          async handleLogin() {
            let roleValue = 'Customer';
            if (this.activeRole === 'artist') roleValue = 'Artist';
            if (this.activeRole === 'admin') roleValue = 'Admin';

            const payload = {
              username: this.form.username,
              password: this.form.password,
              role: roleValue
            };
            
            try {
              await this.$store.dispatch('auth/onLogin', payload);
            } catch (err) {
              console.error('Login error:', err);
            }
          },
          onOpenSignIn(){
            this.handleLogin();
          },

          async onAuthenGoogle() {
            try {
              console.log("onAuthenGoogle")
              const googleUser = await this.$gAuth.signIn();
              // const profile = googleUser.getBasicProfile();
              const authResponse = googleUser.getAuthResponse ? googleUser.getAuthResponse() : (googleUser.Gc || googleUser.uc || googleUser);
              const id_token = authResponse.id_token;
              
              console.log('ID TOKEN extracted:', id_token ? 'YES (Length: ' + id_token.length + ')' : 'NO (Undefined)');

              if (!id_token) {
                console.error('Could not find ID Token in Google response:', googleUser);
                this.$toast?.error('Authentication failed: ID Token missing.');
                return;
              }

              var body = {}
              body.token = id_token
              this.$store.dispatch("auth/onGoogleLogin", body)

            } catch (err) {
              console.error('Google sign-in error:', err);
              this.$toast?.error('Google Sign-In failed. Please try again.');
            }
          },

          onOpenSignUp(){
            this.$store.commit("auth/isSignIn", false);
          },

          handleOnComplete(value) {
            console.log('OTP completed: ', value);
          },
          handleOnChange(value) {
            console.log('OTP changed: ', value);
          },
          handleClearInput() {
            this.$refs.otpInput.clearInput();
          },

        },

        computed: {
            currentRoleData() {
              return this.roles.find(r => r.id === this.activeRole);
            },
            isAuthe: {
              get() {
                return this.$store.getters['auth/isSignIn'];
              },
              set(val) {
                this.$store.commit('auth/isSignIn', val);
              }
            }
        },

        watch: {


          // isAuthe: function (value) {
          //   this.onOpenForgotPassword =true;
          //   this.$store.commit("auth/isSignIn", value)
          // },
        }
    }
</script>

<style scoped>
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

.rounded-premium {
  border-radius: 24px !important;
}

.zoom {
  transition: transform 0.2s;
  cursor: pointer;
}

.zoom:hover {
  transform: scale(1.1);
}

.oauth-btn {
  display: inline-block;
}
</style>
