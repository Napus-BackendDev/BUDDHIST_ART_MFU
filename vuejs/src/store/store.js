import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import Cart from "@/store/modules/Cart/index";
import User from "@/store/modules/User/index";



const state = {
  sidebarShow: 'responsive',
  sidebarMinimize: false,
  asideShow: false,
  darkMode: false
}

const mutations = {
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
  }
});
