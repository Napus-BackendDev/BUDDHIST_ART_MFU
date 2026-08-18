import 'core-js/stable'
import Vue from 'vue'
import CoreuiVuePro from '@coreui/vue-pro'
// import CoreuiVuePro from '../node_modules/@coreui/vue-pro/src/index.js'
// import CoreuiVue from '@coreui/vue'
import App from './App'
import router from './router/index'
import { iconsSet as icons } from './assets/icons/icons.js'
import i18n from './i18n.js'
import store from "@/store/store";
import i18nMixin from './mixins/i18nMixin.js';
import LoadingButton from './components/LoadingButton.vue';

import OtpInput from "@bachdgvn/vue-otp-input";
Vue.component("v-otp-input", OtpInput);
Vue.mixin(i18nMixin);
Vue.component('LoadingButton', LoadingButton);

import VueKonva from 'vue-konva'
Vue.use(VueKonva)

Vue.use(CoreuiVuePro)
Vue.prototype.$log = console.log.bind(console)

import VueQRCodeComponent from 'vue-qrcode-component'
Vue.component('qr-code', VueQRCodeComponent)

import moment from 'moment'
Vue.prototype.moment = moment


// Restore session on load
store.dispatch('auth/supportReload');
store.dispatch('realtime/start');

new Vue({
  el: '#app',
  router,
  store,
  //CIcon component documentation: https://coreui.io/vue/docs/components/icon
  icons,
  i18n,
  template: '<App/>',
  components: {
    App
  }
})
