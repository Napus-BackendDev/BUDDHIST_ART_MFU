<template>
  <div class="c-app" :class="{ 'c-dark-theme': $store.state.darkMode }">
    <TheSidebar/>
    <CWrapper>
      <TheHeader/>
      <div class="c-body">
        <main class="c-main">
          <CContainer fluid>
            <transition name="fade">
              <router-view></router-view>
            </transition>
          </CContainer>
        </main>
        <TheFooter/>
      </div>

    </CWrapper>
    <CenterLoading/>
    <SignIn/>
    <TwoFA/>

  </div>
</template>

<script>
import TheSidebar from './TheSidebar'
import TheHeader from './TheHeader'
import TheFooter from './TheFooter'
import {mapGetters} from "vuex";
import store from "@/store/store";
//
import { io } from "socket.io-client";
import DialogMessage from "@/projects/components/dialog/DialogMessage.vue";
import CenterLoading from "@/projects/components/dialog/CenterLoading.vue";
import SignIn from "@/projects/components/dialog/SignIn.vue";
import TwoFA from "@/projects/components/dialog/TwoFA.vue";
import { extractRoleTitleEn, firstAllowedAdminRoute, hasTabPermission, normalizePermissions, readSession, saveSessionPermissions } from "@/utils/permissions";

//
export default {
  name: 'TheContainer',
  components: {
    TwoFA,
    SignIn,
    CenterLoading,
    DialogMessage,
    TheSidebar,
    TheHeader,
    TheFooter
  },

  mounted() {
    this.showNotification();
    this.syncLivePermissions();




//     const socket = io("127.0.0.1:8082",{
//       transports: ["websocket", "polling"],
//       withCredentials: true,
//       extraHeaders: {
//         "my-custom-header": "abcd"
//       }
//     });
//     socket.on("connect", () => {
//       socket.emit('campus',{"sos":1122});
//
//       socket.on("campus", (reason) => {
//         console.log(reason)
//       })
//
//
//     });
//
//
//
// // กรณีการเชื่อมต่อถูกตัดขาด
//     socket.on("disconnect", (reason) => {
//       console.log("[socket disconnected]: ", reason);
//     });
// // กรณีการเชื่อมต่อเกิดความผิดพลาด
//     socket.on("connect_error", (error) => {
//       console.error("[connect error]: ", error);
//     });


    // localStorage.setItem('test','123444')

    // socket.on("connect", () => {
    //   console.log(12)
    // });
    //
    // socket.on("disconnect", () => {
    //   console.log(13)
    //
    // });
  },

  methods: {
    notifyUser() {
      // Check if the browser supports notifications
      if (!('Notification' in window)) {
        alert('This browser does not support desktop notifications');
        return;
      }

      // Check whether notification permissions have already been granted
      if (Notification.permission === 'granted') {
        // If it's okay let's create a notification
        this.showNotification();
      } else if (Notification.permission !== 'denied') {
        // Otherwise, we need to ask the user for permission
        Notification.requestPermission().then(permission => {
          // If the user accepts, let's create a notification
          if (permission === 'granted') {
            this.showNotification();
          }
        });
      }
    },
    showNotification() {
      const title = 'Hello from Vue.js!';
      const options = {
        body: 'This is a simple notification example.',
        icon: 'https://via.placeholder.com/100', // Optional: Path to icon image
        vibrate: [200, 100, 200], // Optional: Vibration pattern
      };

      new Notification(title, options);
    },
    async syncLivePermissions() {
      try {
        const session = readSession();
        if (!session || !session.xAccessToken || !session.accounts) return;
        const users = await this.$store.dispatch('user/get', {});
        const me = Array.isArray(users) ? users.find(u => String(u._id) === String(session.accounts)) : null;
        if (!me || !me.role || typeof me.role !== 'object') return;
        const roleName = extractRoleTitleEn(me.role) || session.role;
        const nextPermissions = normalizePermissions(me.role.permissions, roleName);
        this.$store.commit('auth/role', roleName);
        this.$store.commit('auth/permissions', nextPermissions);
        saveSessionPermissions(roleName, nextPermissions);

        const tabRecord = [...this.$route.matched].reverse().find(r => r.meta && r.meta.tab);
        const tab = tabRecord ? tabRecord.meta.tab : null;
        if (tab && !hasTabPermission({ role: roleName, permissions: nextPermissions }, tab, 'view')) {
          const fallback = firstAllowedAdminRoute({ role: roleName, permissions: nextPermissions });
          this.$router.replace(fallback === '/' ? '/forbidden' : fallback).catch(() => {});
        }
      } catch (e) {
        // Ignore transient sync errors; backend RBAC remains authoritative.
      }
    }
  },
  computed: {
    ...mapGetters({
    })
  },

  watch: {

  }

}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
