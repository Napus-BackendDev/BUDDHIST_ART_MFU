import router from "@/router";
import store from "@/store/store";

const DialogModule = {
    namespaced: true,
    state: {
        dialog: {
            message: "asdsadsad",
            code: "20000",
            number: "1",
            status: false,
            button: [{
                label: "CANCEL",
                icon: "cil-ban",
                color: "danger",
                code: "cancel"

            }]
        },

        isCode: null,
        loading: false,
        message: 0,

    },

    mutations: {

        loading(state, data) {
            state.loading = data
        },

        message(state, data) {
            state.message = data
        },

        dialog(state, data) {
            console.log("dialog", data)
            state.dialog = data
        },

        isCode(state, data) {
            state.isCode = data
        },

        showToast(state, data) {
            // This can be used by a global Toast component or just to prevent Vuex errors
            console.log("Toast:", data);
            state.message = data.message;
            // If the project uses a specific toast plugin, we could trigger it here
        }

    },

    actions: {},

    getters: {

        loading(state) {
            return state.loading
        },

        message(state) {
            return state.message
        },

        dialog(state) {
            return state.dialog
        },

        isCode(state) {
            return state.isCode
        },


    },
};

export default DialogModule;
