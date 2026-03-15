<template>
  <CSidebar class="bg-style1" :minimize="minimize" unfoldable :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])">
    <CSidebarBrand class="d-md-down-none">
      <!--      <CIcon-->
      <!--          class="c-sidebar-brand-full"-->
      <!--          name="logo"-->
      <!--          size="custom-size"-->
      <!--          :height="35"-->
      <!--          viewBox="0 0 556 134"-->
      <!--      />-->
      <div class="c-sidebar-brand-full">
        <a href="/">
          <CRow>
            <img class="pt-2 pb-2" src="@/assets/logo.svg" height="60px">
            <CCol class="text-white">
              <p class="font-weight-bold mb-0 mt-2 h5">MFU</p>
              <p class="font-weight-bold">Dashboard System</p>
            </CCol>
          </CRow>
        </a>

      </div>


      <!--      <img src="@/assets/logo.svg" height="48"/>-->
      <CIcon class="c-sidebar-brand-minimized" name="logo" size="custom-size" :height="35" viewBox="0 0 110 134" />
    </CSidebarBrand>
    <CRenderFunction flat :contentToRender="navs" />
    <!--    <CSidebarMinimizer-->
    <!--        class="c-d-md-down-none"-->
    <!--        @click.native="$store.commit('toggle', 'sidebarMinimize')"-->
    <!--    />-->
  </CSidebar>
</template>

<script>
import nav from './_nav'
// import TheSidebarProfile from "@/projects/components/Util/TheSidebarProfile";
export default {
  name: 'TheSidebar',
  components: {},


  // nav,
  computed: {
    show() {
      return this.$store.state.sidebarShow
    },
    minimize() {
      return this.$store.state.sidebarMinimize
    }
  },
  data: function () {
    return {
      navs: [{
        _name: 'CSidebarNav',
        _children: [
          {
            _name: 'CSidebarNavTitle',
            _children: ['Main']
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Overview',
            to: '/admin',
            icon: 'cil-window-restore'
          },
          {
            _name: 'CSidebarNavTitle',
            _children: ['Operations']
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Orders',
            to: '/admin/orders',
            icon: 'cil-cart'
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Artworks',
            to: '/admin/artworks',
            icon: 'cil-paint' // Defaulting to generic art-like or use cil-notes if it's missing
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Submissions',
            to: '/admin/submissions',
            icon: 'cil-cloud-upload'
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Certification',
            to: '/admin/certification',
            icon: 'cil-task'
          },
          {
            _name: 'CSidebarNavTitle',
            _children: ['Data Center']
          },
          {
            _name: 'CSidebarNavItem',
            name: 'User Management',
            to: '/admin/users-management',
            icon: 'cil-people'
          },
          {
            _name: 'CSidebarNavDivider',
            _classes: 'mt-auto' // This pushes everything below it to the bottom if the flex container allows
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Sign Out',
            to: '/', // Assuming /login is the path
            icon: 'cil-account-logout'
          }
        ]
      }]
    }
  }
}
</script>

<style>
.bg-style1 {
  background: linear-gradient(30deg, #FEC260 0%, #8c1515 60%);
}
</style>
