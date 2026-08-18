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
import nav from '../_nav'
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
    },
    navs() {
      return [{
        _name: 'CSidebarNav',
        _children: [
          {
            _name: 'CSidebarNavTitle',
            _children: [this.$t('sidebar.main')]
          },
          {
            _name: 'CSidebarNavItem',
            name: this.$t('sidebar.overview'),
            to: '/admin',
            icon: 'cil-window-restore'
          },
          {
            _name: 'CSidebarNavItem',
            name: this.$t('sidebar.analytics'),
            to: '/admin/analytics',
            icon: 'cil-chart'
          },
          {
            _name: 'CSidebarNavTitle',
            _children: [this.$t('sidebar.operations')]
          },
          {
            _name: 'CSidebarNavItem',
            name: this.$t('sidebar.orders'),
            to: '/admin/orders',
            icon: 'cil-cart',
            badge: this.pendingPaymentCount > 0 ? {
              color: 'info',
              text: String(this.pendingPaymentCount)
            } : null
          },
          {
            _name: 'CSidebarNavItem',
            name: this.$t('sidebar.artworks'),
            to: '/admin/artworks',
            icon: 'cil-paint',
            badge: this.pendingArtworkCount > 0 ? {
              color: 'warning',
              text: String(this.pendingArtworkCount)
            } : null
          },
          {
            _name: 'CSidebarNavItem',
            name: this.$t('sidebar.news'),
            to: '/admin/news',
            icon: 'cil-newspaper'
          },
          {
            _name: 'CSidebarNavItem',
            name: this.$t('sidebar.submissions'),
            to: '/admin/submissions',
            icon: 'cil-cloud-upload',
            badge: this.pendingSubmissionCount > 0 ? {
              color: 'success',
              text: String(this.pendingSubmissionCount)
            } : null
          },
          {
            _name: 'CSidebarNavTitle',
            _children: [this.$t('sidebar.dataCenter')]
          },
          {
            _name: 'CSidebarNavItem',
            name: this.$t('sidebar.users'),
            to: '/admin/users-management',
            icon: 'cil-people'
          },
          {
            _name: 'CSidebarNavDivider',
            _classes: 'mt-auto'
          },
          {
            _name: 'CSidebarNavItem',
            name: this.$t('sidebar.returnToWebsite'),
            to: '/',
            icon: 'cil-home'
          },
          {
            _name: 'CSidebarNavItem',
            name: this.$t('sidebar.signOut'),
            href: '#',
            icon: 'cil-account-logout',
            _nativeOn: { click: this.logout }
          }
        ]
      }]
    },
    pendingPaymentCount() {
      const orders = this.$store.getters['order/orders'] || [];
      return orders.filter(item => {
        if (!item.status) return false;
        let statusStr = '';
        if (typeof item.status === 'string') {
          statusStr = item.status.toLowerCase();
        } else if (item.status && Array.isArray(item.status.title)) {
          const enVal = item.status.title.find(t => t.key === 'en')?.value || '';
          const thVal = item.status.title.find(t => t.key === 'th')?.value || '';
          statusStr = (enVal + ' ' + thVal).toLowerCase();
        } else if (item.status && item.status.title) {
          statusStr = String(item.status.title).toLowerCase();
        }
        
        return statusStr.includes('รอชำระเงิน') || 
               statusStr.includes('payment') || 
               statusStr.includes('reserved');
      }).length;
    },
    pendingArtworkCount() {
      const artworks = this.$store.getters['artwork/artworks'] || [];
      return artworks.filter(item => {
        const approval = item.status && item.status.approval;
        let statusName = 'Pending';
        if (approval) {
          if (typeof approval === 'object') {
            const titleField = approval.title || approval.name || '';
            if (typeof titleField === 'string' && titleField) {
              statusName = titleField;
            } else if (Array.isArray(titleField)) {
              statusName = approval.title.find(t => t.key === 'en')?.value || 'Pending';
            }
          } else if (typeof approval === 'string') {
            if (approval === '69677d4de5f76f7a8c42dbf6' || approval.toLowerCase() === 'pending') {
              statusName = 'Pending';
            } else {
              const statuses = this.$store.getters['setting/status/item'] || [];
              const matched = statuses.find(s => s._id === approval);
              if (matched) {
                const titleField = matched.title || matched.name || '';
                if (typeof titleField === 'string' && titleField) {
                  statusName = titleField;
                } else if (Array.isArray(titleField)) {
                  statusName = titleField.find(n => n.key === 'en')?.value || 'Pending';
                }
              }
            }
          }
        }
        return statusName.toLowerCase() === 'pending';
      }).length;
    },
    pendingSubmissionCount() {
      const submissions = this.$store.getters['submission/submissions'] || [];
      const statuses = this.$store.getters['setting/status/item'] || [];
      let count = 0;
      submissions.forEach(sub => {
        if (sub.assignments && Array.isArray(sub.assignments)) {
          sub.assignments.forEach(assign => {
            if (assign.artworks && Array.isArray(assign.artworks)) {
              assign.artworks.forEach(aw => {
                const status = aw.status;
                let statusName = 'Pending';
                if (status) {
                  if (typeof status === 'object') {
                    const titleField = status.title || status.name || '';
                    if (typeof titleField === 'string' && titleField) {
                      statusName = titleField;
                    } else if (Array.isArray(titleField)) {
                      statusName = status.title.find(t => t.key === 'en')?.value || 'Pending';
                    }
                  } else if (typeof status === 'string') {
                    if (status === '69677d4de5f76f7a8c42dbf6' || status.toLowerCase() === 'pending') {
                      statusName = 'Pending';
                    } else {
                      const matched = statuses.find(s => s._id === status);
                      if (matched) {
                        const titleField = matched.title || matched.name || '';
                        if (typeof titleField === 'string' && titleField) {
                          statusName = titleField;
                        } else if (Array.isArray(titleField)) {
                          statusName = titleField.find(n => n.key === 'en')?.value || 'Pending';
                        }
                      }
                    }
                  }
                }
                if (statusName.toLowerCase() === 'pending') {
                  count++;
                }
              });
            }
          });
        }
      });
      return count;
    }
  },
  created() {
    this.$store.dispatch('order/get').catch(err => console.error('Error loading orders in sidebar:', err));
    this.$store.dispatch('artwork/get').catch(err => console.error('Error loading artworks in sidebar:', err));
    this.$store.dispatch('submission/get').catch(err => console.error('Error loading submissions in sidebar:', err));
    this.$store.dispatch('setting/status/get').catch(err => console.error('Error loading statuses in sidebar:', err));
  },
  methods: {
    logout() {
      localStorage.removeItem('objs');
      this.$store.commit('auth/showSignInModal', false);
      window.location.href = '/';
    }
  },
  data: function () {
    return {}
  }
}
</script>

<style>
.bg-style1 {
  background: linear-gradient(30deg, #FEC260 0%, #8c1515 60%);
}
</style>
