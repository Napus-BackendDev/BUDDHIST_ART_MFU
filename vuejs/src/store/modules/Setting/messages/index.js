
import Service from "@/service/api.js";
import store from "@/store/store";

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


    // router.get("/message", message.onQuerys);
    // router.post("/message", message.onCreate);
    // router.put("/message", message.onUpdate);
    // router.delete("/message", message.onDelete);

    actions: {
        get({commit}, data) {
            return Service.settings('get', 'message', data)
                .then((response) => {
                    commit("item", response.data.data)
                }).catch((err) => {
            });
        },
        post({commit}, data) {
            return Service.settings('post', 'message', data)
                .then((response) => {

                }).catch((err) => {
            });
        },
        put({commit}, data) {
            return Service.settings('put', 'message', data)
                .then((response) => {

                }).catch((err) => {
            });
        },
        delete({commit}, data) {
            return Service.settings('delete', 'message', data)
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
