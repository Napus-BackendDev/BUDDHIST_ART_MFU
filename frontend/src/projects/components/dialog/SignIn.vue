<template>
    <div>
        <CModal
            add-content-classes="border-0 shadow-premium overflow-hidden rounded-premium"
            :show.sync="isAuthe"
            :centered="true"
            :close-on-backdrop="true"
            size="md"
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
              <div class="mb-5">
                <img src="@/assets/icons/logo.png" height="80" class="brand-logo mb-3">
                <h2 class="brand-main-text mb-0">Buddhist Art MFU</h2>
                <p class="brand-sub-text">พุทธศิลป์</p>
              </div>

              <div class="login-context-msg mb-4">
                <h5 class="font-weight-bold text-dark mb-2">Welcome Back</h5>
                <p class="text-muted small">Sign in with your Google account to continue.</p>
              </div>

              <!-- Google Auth Only -->
              <div class="d-flex justify-content-center mt-4">
                 <button class="google-signin-btn" @click="onAuthenGoogle">
                   <img src="@/assets/icons/logo-google.png" width="24" class="mr-3">
                   <span>Sign in with Google</span>
                 </button>
              </div>
            </div>
          </template>
          <template #footer-wrapper>
            <div class="pb-5 text-center">
               <p class="text-muted x-small">&copy; 2024 Buddhist Art MFU. All rights reserved.</p>
            </div>
          </template>
        </CModal>
    </div>
</template>

<script>
    export default {
        name: 'SignIn',
        data() {
            return {
              oAuth2: true
            }
        },
        methods: {
          async onAuthenGoogle() {
            try {
              console.log("onAuthenGoogle initiated")
              const googleUser = await this.$gAuth.signIn();
              const authResponse = googleUser.getAuthResponse ? googleUser.getAuthResponse() : (googleUser.Gc || googleUser.uc || googleUser);
              const id_token = authResponse.id_token;
              
              if (!id_token) {
                console.error('ID Token missing in Google response');
                this.$toast?.error('Authentication failed: ID Token missing.');
                return;
              }

              this.$store.dispatch("auth/onGoogleLogin", { token: id_token })
            } catch (err) {
              console.error('Google sign-in error:', err);
              this.$toast?.error('Google Sign-In failed. Please try again.');
            }
          }
        },
        computed: {
            isAuthe: {
              get() {
                return this.$store.getters['auth/isSignIn'];
              },
              set(val) {
                this.$store.commit('auth/isSignIn', val);
              }
            }
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

.google-signin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  color: #3c4b64;
  border: 1px solid #e2e8f0;
  border-radius: 50px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 280px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.google-signin-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.google-signin-btn:active {
  transform: translateY(0);
}

.shadow-premium {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
}

.rounded-premium {
  border-radius: 24px !important;
}

.x-small {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}
</style>
