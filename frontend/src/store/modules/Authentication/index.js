import Service from "../../../service/api.js";
import router from "../../../router/index.js";
import store from "@/store/store";

const safeRedirect = () => {
    const value = router.currentRoute.query && router.currentRoute.query.redirect;
    return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
        ? value
        : null;
};

const LoginModule = {
    namespaced: true,
    state: {
        showSignInModal: false,
        isSignIn: false,
        is2FA: false,
        userId: null,
        role: null,
        postLoginContext: null

    },

    mutations: {
        showSignInModal(state, obj) {
            state.showSignInModal = obj
            state.isSignIn = obj
        },

        isSignIn(state, obj) {
            state.showSignInModal = obj
            state.isSignIn = obj
        },

        is2FA(state, obj) {
            state.is2FA = obj
        },

        userId(state, obj) {
            state.userId = obj
        },

        postLoginContext(state, context) {
            state.postLoginContext = context
        },

        role(state, value) {
            state.role = value;
        },


    },

    actions: {
        supportReload({ commit }) {
            try {
                const objs = JSON.parse(localStorage.getItem('objs'));
                if (objs && objs.xAccessToken) {
                    store.commit('xAccessToken', objs.xAccessToken);
                    commit('userId', objs.accounts);
                    commit('role', objs.role || null);
                    let pendingCheckout = null;
                    try {
                        pendingCheckout = JSON.parse(localStorage.getItem('pendingCheckout') || 'null');
                    } catch (error) {
                        localStorage.removeItem('pendingCheckout');
                    }
                    if (pendingCheckout && typeof pendingCheckout.redirect === 'string') {
                        commit('postLoginContext', pendingCheckout);
                        localStorage.removeItem('pendingCheckout');
                    }
                    // store.dispatch('personal/config', {}); 
                }
            } catch (e) {
                console.error("Failed to restore session:", e);
            }
        },


        singIn({ commit }, data) {
            store.commit("dialog/loading", true)
            return Service.authen("sign-in", data)
                .then((response) => {
                    store.commit("dialog/loading", false)
                    const user = response.data.data;
                    const role = user.role || 'Customer';

                    if (!user._id) {
                        console.error("CRITICAL ERROR: user._id is missing from backend response!");
                    }

                    // Clear any old corrupted state just to be safe
                    localStorage.removeItem('objs');

                    const token = response.data.token || response.data.data.token;
                    // Store user data properly
                    localStorage.setItem('objs', JSON.stringify({
                        xAccessToken: token,
                        accounts: user._id,
                        role: role
                    }));

                    store.commit('xAccessToken', token); // Update root store immediately
                    store.commit("auth/showSignInModal", false);
                    store.commit("auth/userId", user._id);
                    store.commit("auth/role", role);

                    const postLoginContext = store.getters['auth/postLoginContext'];

                    // Checkout login returns to the artwork page and restores the cart.
                    if (postLoginContext) {
                        const target = postLoginContext.redirect || '/artworks';
                        store.commit('auth/postLoginContext', null);

                        const restoreCart = () => {
                            if (postLoginContext.reopenCart) {
                                store.commit('cart/SET_SHOW_CART', true);
                            }
                        };

                        if (router.currentRoute.fullPath !== target) {
                            router.push(target).then(restoreCart).catch(err => {
                                if (err.name === 'NavigationDuplicated') restoreCart();
                                else throw err;
                            });
                        } else {
                            restoreCart();
                        }
                    } else if (router.currentRoute.path !== '/payment') {
                        const userRole = (role || 'Customer').toLowerCase();
                        let target = safeRedirect() || '/user';

                        if (!safeRedirect()) {
                            if (userRole === 'admin') target = '/admin';
                            else if (userRole === 'artist' || userRole === 'evaluator') target = '/artist/profile';
                        }

                        if (router.currentRoute.path !== target) {
                            router.push(target).catch(err => {
                                if (err.name !== 'NavigationDuplicated') throw err;
                            });
                        }
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
        onDevAdminLogin() {
            store.commit("dialog/loading", true);
            return Service.authen("dev-admin")
                .then((response) => {
                    store.commit("dialog/loading", false);
                    const user = response.data.data;
                    const token = response.data.token || user.token;
                    localStorage.setItem('objs', JSON.stringify({
                        xAccessToken: token,
                        accounts: user._id,
                        role: 'Admin'
                    }));
                    store.commit('xAccessToken', token);
                    store.commit('auth/showSignInModal', false);
                    store.commit('auth/userId', user._id);
                    store.commit('auth/role', 'Admin');
                    return router.push('/admin').catch(err => {
                        if (err.name !== 'NavigationDuplicated') throw err;
                    });
                })
                .catch((err) => {
                    store.commit("dialog/loading", false);
                    throw err;
                });
        },
        onGoogleLogin({ commit }, data) {
            store.commit("dialog/loading", true)
            return Service.authen("google-auth", data)
                .then((response) => {
                    store.commit("dialog/loading", false)
                    const user = response.data.data;
                    const role = user.role || 'Customer';

                    const token = response.data.token || response.data.data.token;
                    // Store user data properly
                    localStorage.setItem('objs', JSON.stringify({
                        xAccessToken: token,
                        accounts: user._id,
                        role: role
                    }));

                    store.commit('xAccessToken', token); // Update root store immediately
                    store.commit("auth/showSignInModal", false);
                    store.commit("auth/userId", user._id);
                    store.commit("auth/role", role);

                    const postLoginContext = store.getters['auth/postLoginContext'];

                    // Checkout login returns to the artwork page and restores the cart.
                    if (postLoginContext) {
                        const target = postLoginContext.redirect || '/artworks';
                        store.commit('auth/postLoginContext', null);

                        const restoreCart = () => {
                            if (postLoginContext.reopenCart) {
                                store.commit('cart/SET_SHOW_CART', true);
                            }
                        };

                        if (router.currentRoute.fullPath !== target) {
                            router.push(target).then(restoreCart).catch(err => {
                                if (err.name === 'NavigationDuplicated') restoreCart();
                                else throw err;
                            });
                        } else {
                            restoreCart();
                        }
                    } else if (router.currentRoute.path !== '/payment') {
                        const userRole = (role || 'Customer').toLowerCase();
                        let target = safeRedirect() || '/user';

                        if (!safeRedirect()) {
                            if (userRole === 'admin') target = '/admin';
                            else if (userRole === 'artist' || userRole === 'evaluator') target = '/artist/profile';
                        }

                        if (router.currentRoute.path !== target) {
                            router.push(target).catch(err => {
                                if (err.name !== 'NavigationDuplicated') throw err;
                            });
                        }
                    }

                    return response;
                })
                .catch((err) => {
                    store.commit("dialog/loading", false)
                    const dialog = {
                        message: err.response?.data?.message || "Google Authentication Failed. Please ensure your email is registered.",
                        code: "40100",
                        number: "1",
                        status: true
                    }
                    store.commit("dialog/dialog", dialog)
                    throw err;
                });
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
        showSignInModal(state) {
            return state.showSignInModal;
        },

        isSignIn(state) {
            return state.showSignInModal;
        },

        is2FA(state) {
            return state.is2FA
        },

        userId(state) {
            return state.userId;
        },
        role(state) {
            return state.role;
        },
        postLoginContext(state) {
            return state.postLoginContext;
        },
    },
};

export default LoginModule;
