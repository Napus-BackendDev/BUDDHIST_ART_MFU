import Service from "@/service/api";

const ServerModule = {
    namespaced: true,
    state: {
        isReload: false,
        item: []
    },

    mutations: {
        isReload(state, obj) {
            state.isReload = obj;
        },
        item(state, obj) {
            state.item = Array.isArray(obj) ? obj : [];
        }
    },

    actions: {
        config({ commit }, data = {}) {
            return Service.roles('exp', data, {})
                .then((response) => {
                    const list = response?.data?.data || [];
                    commit("item", list);
                    return list;
                });
        },
        create({ commit }, data) {
            return Service.roles('post', data, {})
                .then((response) => {
                    commit("isReload", true);
                    return response?.data?.data;
                });
        },
        update({ commit }, data) {
            return Service.roles('put', data, {})
                .then((response) => {
                    commit("isReload", true);
                    return response?.data?.data;
                });
        },
        remove({ commit }, data) {
            return Service.roles('delete', data, {})
                .then((response) => {
                    commit("isReload", true);
                    return response?.data?.data;
                });
        },
    },

    getters: {
        item(state) {
            return state.item;
        },
        isReload(state) {
            return state.isReload;
        }
    },
};

export default ServerModule;
