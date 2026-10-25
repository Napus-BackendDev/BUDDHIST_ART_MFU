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
              <button type="button" class="close" @click="isAuthe = false" :aria-label="$i18n.locale === 'en' ? 'Close sign in dialog' : 'ปิดหน้าต่างเข้าสู่ระบบ'">
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
                <h5 class="font-weight-bold text-dark mb-2">{{ $i18n.locale === 'en' ? 'Welcome Back' : 'ยินดีต้อนรับ' }}</h5>
                <p class="text-muted small">{{ $i18n.locale === 'en' ? 'Sign in with your Google account to continue.' : 'เข้าสู่ระบบด้วยบัญชี Google เพื่อดำเนินการต่อ' }}</p>
              </div>

              <div class="d-flex justify-content-center mt-4">
                <div ref="googleSignInButton" class="google-signin-button" :aria-label="$i18n.locale === 'en' ? 'Sign in with Google' : 'เข้าสู่ระบบด้วย Google'"></div>
              </div>
              <p v-if="googleError" role="alert" class="text-danger small mt-3 mb-0">{{ googleError }}</p>
              <button v-if="googleIssue === 'unavailable'" type="button" class="btn btn-outline-secondary mt-3"
                :disabled="googleInitializing" @click="initializeGoogleSignIn">
                {{ $i18n.locale === 'en' ? 'Try again' : 'ลองอีกครั้ง' }}
              </button>
              <div v-if="qaAccounts" class="mt-4 pt-3 border-top" data-qa="qa-login">
                <p class="text-muted small mb-2">QA local login</p>
                <button v-for="account in qaAccounts" :key="account.email" type="button"
                  class="btn btn-outline-dark btn-sm m-1" @click="qaLogin(account.email)">{{ account.label }}</button>
              </div>
            </div>
          </template>
          <template #footer-wrapper>
            <div class="pb-5 text-center">
               <p class="text-muted x-small">&copy; {{ currentYear }} Buddhist Art MFU. {{ $i18n.locale === 'en' ? 'All rights reserved.' : 'สงวนลิขสิทธิ์' }}</p>
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
              googleIssue: '',
              googleInitialized: false,
              googleInitializing: false,
              googleDisposed: false,
              // Dev-only QA accounts; the production build compiles this to null.
              qaAccounts: process.env.NODE_ENV !== 'production' && process.env.VUE_APP_QA_LOGIN === 'true'
                ? [{ label: 'Customer', email: 'qa-customer@local.test' }, { label: 'Artist', email: 'qa-artist@local.test' }, { label: 'Admin', email: 'qa-admin@local.test' }]
                : null
            }
        },
        mounted() {
          if (this.isAuthe) this.initializeGoogleSignIn();
        },
        beforeDestroy() {
          this.googleDisposed = true;
        },
        methods: {
          qaLogin(email) {
            return this.$store.dispatch('auth/onGoogleLogin', { qaEmail: email }).catch(() => {});
          },
          async loadGoogleIdentity() {
            if (window.google && window.google.accounts && window.google.accounts.id) return;

            if (!window.__googleIdentityScriptPromise) {
              const pending = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `https://accounts.google.com/gsi/client?hl=${this.$i18n.locale === 'th' ? 'th' : 'en'}`;
                script.async = true;
                script.defer = true;
                let settled = false;
                const finish = error => {
                  if (settled) return;
                  settled = true;
                  clearTimeout(timeout);
                  script.onload = script.onerror = null;
                  if (error) {
                    script.remove();
                    reject(error);
                  } else resolve();
                };
                const timeout = setTimeout(() => finish(new Error('Google Identity Services loading timed out')), 15000);
                script.onload = () => finish();
                script.onerror = () => finish(new Error('Unable to load Google Identity Services'));
                document.head.appendChild(script);
              }).catch(error => {
                if (window.__googleIdentityScriptPromise === pending) delete window.__googleIdentityScriptPromise;
                throw error;
              });
              window.__googleIdentityScriptPromise = pending;
            }

            await window.__googleIdentityScriptPromise;
          },
          async initializeGoogleSignIn() {
            if (!this.isAuthe || this.googleDisposed || this.googleInitializing) return;
            if (this.googleInitialized) {
              this.renderGoogleButton();
              return;
            }
            this.googleInitializing = true;

            try {
              const clientId = process.env.VUE_APP_CLIENTID;
              if (!clientId) throw new Error('Google Client ID is not configured');

              await this.loadGoogleIdentity();
              if (!this.isAuthe || this.googleDisposed) return;
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

              this.renderGoogleButton();
              this.googleIssue = '';
            } catch (err) {
              if (!this.isAuthe || this.googleDisposed) return;
              console.error('Google Identity initialization error:', err);
              this.googleIssue = 'unavailable';
            } finally {
              this.googleInitializing = false;
            }
          },
          renderGoogleButton() {
              if (!this.isAuthe || this.googleDisposed) return;
              if (this.googleInitialized && this.$refs.googleSignInButton) {
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
          },
          async onGoogleCredential(response) {
            if (!response || !response.credential) {
              this.googleIssue = 'credential';
              return;
            }

            this.googleIssue = '';
            try {
              await this.$store.dispatch('auth/onGoogleLogin', { token: response.credential });
            } catch (err) {
              console.error('Google sign-in error:', err);
            }
          }
        },
        watch: {
          '$i18n.locale'() {
            this.renderGoogleButton();
          },
          isAuthe(value) {
            if (value) this.$nextTick(() => this.initializeGoogleSignIn());
          }
        },
        computed: {
            currentYear() { return new Date().getFullYear(); },
            googleError() {
              if (this.googleIssue === 'unavailable') return this.$i18n.locale === 'en'
                ? 'Google Sign-In is unavailable. Please refresh and try again.'
                : 'ไม่สามารถเปิด Google Sign-In ได้ กรุณารีเฟรชและลองใหม่';
              if (this.googleIssue === 'credential') return this.$i18n.locale === 'en'
                ? 'Google did not return an identity token. Please try again.'
                : 'Google ไม่ได้ส่งข้อมูลยืนยันตัวตน กรุณาลองใหม่';
              return '';
            },
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
