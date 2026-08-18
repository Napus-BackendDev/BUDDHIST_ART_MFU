<template>
    <div>
        <CModal
            add-content-classes="border-0 shadow-premium overflow-hidden rounded-premium"
            :show.sync="isAuthe"
            :centered="true"
            :close-on-backdrop="true"
        >
          <template #header-wrapper>
            <div class="px-4 pt-4 text-right">
              <button type="button" class="close" @click="isAuthe = false" aria-label="Close sign in dialog">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </template>
          <template #body-wrapper>
            <div class="p-4 p-md-5 text-center">
              <div class="mb-5">
                <img src="@/assets/icons/logo.png" height="80" class="brand-logo mb-3" alt="Buddhist Art MFU">
                <h2 class="brand-main-text mb-0">Buddhist Art MFU</h2>
                <p class="brand-sub-text">พุทธศิลป์</p>
              </div>

              <div class="login-context-msg mb-4">
                <h5 class="font-weight-bold text-dark mb-2">Welcome Back</h5>
                <p class="text-muted small">Sign in with your Google account to continue.</p>
              </div>

              <div class="d-flex justify-content-center mt-4">
                <div ref="googleSignInButton" class="google-signin-button" aria-label="Sign in with Google"></div>
              </div>
              <p v-if="googleError" class="text-danger small mt-3 mb-0">{{ googleError }}</p>
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
              googleError: '',
              googleInitialized: false
            }
        },
        mounted() {
          this.initializeGoogleSignIn();
        },
        methods: {
          async loadGoogleIdentity() {
            if (window.google && window.google.accounts && window.google.accounts.id) return;

            if (!window.__googleIdentityScriptPromise) {
              window.__googleIdentityScriptPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = resolve;
                script.onerror = () => reject(new Error('Unable to load Google Identity Services'));
                document.head.appendChild(script);
              });
            }

            await window.__googleIdentityScriptPromise;
          },
          async initializeGoogleSignIn() {
            if (this.googleInitialized) return;

            try {
              const clientId = process.env.VUE_APP_CLIENTID;
              if (!clientId) throw new Error('Google Client ID is not configured');

              await this.loadGoogleIdentity();
              if (!window.google || !window.google.accounts || !window.google.accounts.id) {
                throw new Error('Google Identity Services is unavailable');
              }

                window.google.accounts.id.initialize({
                client_id: clientId,
                callback: this.onGoogleCredential,
                auto_select: false,
                cancel_on_tap_outside: true,
                  context: 'signin'
                });
                this.googleInitialized = true;

              if (this.$refs.googleSignInButton) {
                this.$refs.googleSignInButton.innerHTML = '';
                window.google.accounts.id.renderButton(this.$refs.googleSignInButton, {
                  type: 'standard',
                  theme: 'outline',
                  size: 'large',
                  text: 'signin_with',
                  shape: 'pill',
                  logo_alignment: 'left',
                  width: 280,
                  locale: this.$i18n.locale === 'th' ? 'th' : 'en'
                });
              }
            } catch (err) {
              console.error('Google Identity initialization error:', err);
              this.googleError = this.$i18n.locale === 'en'
                ? 'Google Sign-In is unavailable. Please refresh and try again.'
                : 'ไม่สามารถเปิด Google Sign-In ได้ กรุณารีเฟรชและลองใหม่';
            }
          },
          async onGoogleCredential(response) {
            if (!response || !response.credential) {
              this.googleError = this.$i18n.locale === 'en'
                ? 'Google did not return an identity token. Please try again.'
                : 'Google ไม่ได้ส่งข้อมูลยืนยันตัวตน กรุณาลองใหม่';
              return;
            }

            this.googleError = '';
            try {
              await this.$store.dispatch('auth/onGoogleLogin', { token: response.credential });
            } catch (err) {
              console.error('Google sign-in error:', err);
            }
          }
        },
        watch: {
          '$i18n.locale'() {
            this.initializeGoogleSignIn();
          },
          isAuthe(value) {
            if (value) this.$nextTick(() => this.initializeGoogleSignIn());
          }
        },
        computed: {
            isAuthe: {
              get() {
                return this.$store.getters['auth/showSignInModal'];
              },
              set(val) {
                this.$store.commit('auth/showSignInModal', val);
                if (!val) {
                  this.$store.commit('auth/postLoginContext', null);
                }
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

.google-signin-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 280px;
  min-height: 44px;
}

.google-signin-button > div,
.google-signin-button [role="button"] {
  min-height: 44px;
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
