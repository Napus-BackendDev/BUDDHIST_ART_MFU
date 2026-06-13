<template>
  <CHeader with-subheader class="px-3 px-md-4">
<!--    <CToggler-->
<!--      in-header-->
<!--      class="ml-3 d-lg-none"-->
<!--      @click="$store.commit('toggleSidebarMobile')"-->
<!--    />-->
    <CToggler
      in-header
      class="ml-0 d-md-down-none"
      @click="$store.commit('toggleSidebarDesktop')"
    />
    <CHeaderBrand class="mx-auto d-lg-none w-100 bg-danger d-flex align-items-center justify-content-center" to="/">
      <img src="@/assets/logo.svg" height="35" class="mr-2">
      <label class="font-weight-bold h5 mt-2 text-white">Buddhist Art MFU</label>
    </CHeaderBrand>
    <CHeaderNav class="d-md-down-none mr-auto">
<!--      <CHeaderNavItem class="px-3">-->
<!--        <CHeaderNavLink to="/dashboard">-->
<!--          Dashboard-->
<!--        </CHeaderNavLink>-->
<!--      </CHeaderNavItem>-->
<!--      <CHeaderNavItem class="px-3">-->
<!--        <CHeaderNavLink to="/users" exact>-->
<!--          Users-->
<!--        </CHeaderNavLink>-->
<!--      </CHeaderNavItem>-->
<!--      <CHeaderNavItem class="px-3">-->
<!--        <CHeaderNavLink>-->
<!--          Settings-->
<!--        </CHeaderNavLink>-->
<!--      </CHeaderNavItem>-->
    </CHeaderNav>
    <CHeaderNav>
<!--      <CHeaderNavItem class="px-3">-->
<!--        <button-->
<!--          @click="() => $store.commit('toggle', 'darkMode')"-->
<!--          class="c-header-nav-btn"-->
<!--        >-->
<!--          <CIcon v-if="$store.state.darkMode" name="cil-sun"/>-->
<!--          <CIcon v-else name="cil-moon"/>-->
<!--        </button>-->
<!--      </CHeaderNavItem>-->
<!--      <TheHeaderDropdownNotif/>-->
<!--      <TheHeaderDropdownTasks/>-->
<!--      <TheHeaderDropdownMssgs/>-->
<!--      <TheHeaderDropdownAccnt/>-->
<!--      <CHeaderNavItem class="px-3">-->
<!--        <button-->
<!--          in-header-->
<!--          class="c-header-nav-btn"-->
<!--          @click="$store.commit('toggle', 'asideShow')"-->
<!--        >-->
<!--          <CIcon size="lg" name="cil-applications-settings" class="mr-2"/>-->
<!--        </button>-->
<!--      </CHeaderNavItem>-->
      <CHeaderNavItem class="px-3 d-flex align-items-center">
        <div class="lang-switcher-pill d-flex align-items-center" @click="onSwitchLang" style="cursor: pointer;">
          <CIcon name="cil-globe-alt" class="mr-2 text-secondary" />
          <span class="font-weight-bold text-dark" style="font-size: 0.85rem;">
            {{lang === 'th' ? 'EN' : 'TH'}}
          </span>
        </div>
      </CHeaderNavItem>

      <TheHeaderDropdownAccnt class="ml-2 border-left pl-3" />
    </CHeaderNav>
  </CHeader>
</template>

<script>
import TheHeaderDropdownAccnt from '../TheHeaderDropdownAccnt'
import TheHeaderDropdownNotif from '../TheHeaderDropdownNotif'
import TheHeaderDropdownTasks from '../TheHeaderDropdownTasks'
import TheHeaderDropdownMssgs from '../TheHeaderDropdownMssgs'
import {mapGetters} from "vuex";

export default {
  name: 'TheHeader',
  components: {
    TheHeaderDropdownAccnt,
    TheHeaderDropdownNotif,
    TheHeaderDropdownTasks,
    TheHeaderDropdownMssgs
  },

  methods: {
    onSwitchLang(){
      const newLang = this.lang === 'th' ? 'en' : 'th';
      this.$store.commit("setting/lang", newLang);
      this.$i18n.locale = newLang;
      localStorage.setItem('lang', newLang);
    }
  },

  computed: {
    ...mapGetters({
      lang: "setting/lang",
    })
  },
}
</script>

<style scoped>
.lang-switcher-pill {
  padding: 6px 14px;
  background-color: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  transition: all 0.2s ease;
}
.lang-switcher-pill:hover {
  background-color: #f1f3f5;
  border-color: #cbd5e0;
}
</style>
