<template>
    <div class="c-app" :class="{ 'c-dark-theme': $store.state.darkMode }">
        <CWrapper>
            <TheHeaderUser />
            <div class="c-body">
                <main>
                    <transition name="fade">
                        <router-view></router-view>
                    </transition>
                </main>
                <TheFooterUser />
            </div>

        </CWrapper>
        <CenterLoading />
        <SignIn />
        <TwoFA />

    </div>
</template>

<script>
import TheHeaderUser from './TheHeaderUser'
import TheFooterUser from './TheFooterUser'
import CenterLoading from "@/projects/components/dialog/CenterLoading.vue";
import SignIn from "@/projects/components/dialog/SignIn.vue";
import TwoFA from "@/projects/components/dialog/TwoFA.vue";

export default {
    name: 'TheContainerUser',
    components: {
        TwoFA,
        SignIn,
        CenterLoading,
        TheHeaderUser,
        TheFooterUser
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
