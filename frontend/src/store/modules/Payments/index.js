
import Service from "@/service/api";
import store from "@/store/store";
import method from './method'


const ServerModule = {
    namespaced: true,
    modules: {
        method,
    },

    state: {
        item : []
    },

    mutations: {
        item(state, obj) {
            state.item = obj;
        }
    },

    actions: {
    },

    getters: {
        item(state, obj) {
            return state.item;
        },
    },
};

export default ServerModule;
