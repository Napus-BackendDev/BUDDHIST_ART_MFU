import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import Cart from "@/store/modules/Cart/index";
import User from "@/store/modules/User/index";
import Artwork from "@/store/modules/Artwork/index";
import Submission from "@/store/modules/Submission/index";
import Order from "@/store/modules/Order/index";
import News from "@/store/modules/News/index";
import Setting from "@/store/modules/Setting/index";
import organization from "@/store/modules/organization/index";
import Authentication from "@/store/modules/Authentication/index";
import Accounts from "@/store/modules/Accounts/index";
import Dialog from "@/store/modules/Dialog/index";
import Payments from "@/store/modules/Payments/index";
import Dashboard from "@/store/modules/Dashboard/index";



const state = {
  sidebarShow: 'responsive',
  sidebarMinimize: false,
  asideShow: false,
  darkMode: false,
  xAccessToken: null
}

const mutations = {
  xAccessToken(state, token) {
    state.xAccessToken = token
  },
  toggleSidebarDesktop(state) {
    const sidebarOpened = [true, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarOpened ? false : 'responsive'
  },
  toggleSidebarMobile(state) {
    const sidebarClosed = [false, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarClosed ? true : 'responsive'
  },
  set(state, [variable, value]) {
    state[variable] = value
  },
  toggle(state, variable) {
    state[variable] = !state[variable]
  }
}


export default new Vuex.Store({
  state,
  mutations,
  modules: {
    cart: Cart,
    user: User,
    artwork: Artwork,
    submission: Submission,
    order: Order,
    news: News,
    setting: Setting,
    organization: organization,
    auth: Authentication,
    account: Accounts,
    dialog: Dialog,
    payment: Payments,
    dashboard: Dashboard
  }
});
