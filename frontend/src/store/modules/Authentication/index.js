import Service from "../../../service/api.js";
import router from "../../../router/index.js";
import store from "@/store/store";

const LoginModule = {
    namespaced: true,
    state: {
        isSignIn: false,
        is2FA: false,
        userId: "69b6fa8106450177a0874a87"

    },

    mutations: {
        isSignIn(state, obj) {
            state.isSignIn = obj
        },

        is2FA(state, obj) {
            state.is2FA = obj
        },

        userId(state, obj) {
            state.userId = obj
        },


    },

    actions: {
        supportReload({ commit }, data) {

            var objs = JSON.parse(localStorage.getItem('objs'));

            store.commit('xAccessToken', objs.xAccessToken)
            // store.commit('accounts',objs.accounts)
            store.commit('auth/userId', objs.accounts)
            store.dispatch('personal/config', {})

        },


        singIn({ commit }, data) {
            store.commit("dialog/loading", true)
            return Service.authen("sign-in", data)
                .then((response) => {
                    store.commit("dialog/loading", false)
                    const user = response.data.data;
                    const role = user.role || 'Customer';

                    console.log("LOGIN SUCCESS! Received User:", user);

                    if (!user._id) {
                        console.error("CRITICAL ERROR: user._id is missing from backend response!");
                    }

                    // Clear any old corrupted state just to be safe
                    localStorage.removeItem('objs');

                    // Store user data properly
                    localStorage.setItem('objs', JSON.stringify({
                        xAccessToken: response.data.token || response.data.data.token,
                        accounts: user._id,
                        role: role
                    }));

                    store.commit("auth/isSignIn", false); // Close modal if used as modal
                    store.commit("auth/userId", user._id);

                    // Redirection Logic
                    const userRole = (role || 'Customer').toLowerCase();
                    if (userRole === 'admin') {
                        router.push('/admin');
                    } else if (userRole === 'artist' || userRole === 'evaluator') {
                        router.push('/artist/profile');
                    } else {
                        router.push('/artworks');
                    }

                    return response;
                })
                .catch((err) => {
                    store.commit("dialog/loading", false)
                    var dialog = {
                        message: "Username หรือ Password ไม่ถูกต้อง",
                        code: "40100",
                        number: "1",
                        status: true
                    }
                    store.commit("dialog/dialog", dialog)
                    throw err;
                });
        },
        onLogin({ dispatch }, data) {
            return dispatch('singIn', data);
        },


        twofa({ commit }, data) {
            store.commit("dialog/loading", true)
            Service.authen("2fa", data)
                .then((response) => {
                    store.commit("dialog/loading", false)
                    // store.commit("auth/is2FA",true)

                })
                .catch((err) => {
                    store.commit("dialog/loading", false)

                    var dialog = {
                        message: "Username และ Password ไม่ถูกต้อง",
                        code: "40100",
                        number: "1",
                        status: true
                    }
                    store.commit("dialog/dialog", dialog)
                });
        },

        twofaSend({ commit }, data) {
            store.commit("dialog/loading", true)
            Service.authen("2fa-send", data)
                .then((response) => {
                    store.commit("dialog/loading", false)
                    store.commit("auth/is2FA", false)

                })
                .catch((err) => {
                    store.commit("dialog/loading", false)

                    var dialog = {
                        message: "Username และ Password ไม่ถูกต้อง",
                        code: "40100",
                        number: "1",
                        status: true
                    }
                    store.commit("dialog/dialog", dialog)
                });
        }

    },

    getters: {
        isSignIn(state) {
            return state.isSignIn;
        },

        is2FA(state) {
            return state.is2FA
        },

        userId(state) {
            return state.userId;
        },
    },
};

export default LoginModule;
