import Service from "@/service/api.js";

const module = {
    namespaced: true,
    state: {
        item : []
    },

    mutations: {
        item(state, obj) {
            state.item = obj;
        }
    },

    actions: {
        get({commit}, data) {
            return Service.settings('get', 'storage', data)
                .then((response) => {
                    console.log('--- Setting Storage Get Response ---');
                    console.log(response.data.data);
                    commit("item", response.data.data)
                }).catch((err) => {
                    console.error('--- Setting Storage Get Error ---');
                    console.error(err);
            });
        },
        post({commit}, data) {
            return Service.settings('post', 'storage', data)
                .then((response) => {

                }).catch((err) => {
            });
        },
        put({commit}, data) {
            return Service.settings('put', 'storage', data)
                .then((response) => {

                }).catch((err) => {
            });
        },
        delete({commit}, data) {
            return Service.settings('delete', 'storage', data)
                .then((response) => {

                }).catch((err) => {
            });
        },
    },

    getters: {
        item(state, obj) {
            return state.item;
        },
    },
};

export default module;
