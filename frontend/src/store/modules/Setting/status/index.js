
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
            return Service.settings('get', 'status', data)
                .then((response) => {
                    console.log('--- Setting Status Get Response ---');
                    console.log(response.data.data);
                    commit("item", response.data.data)
                }).catch((err) => {
                    console.error('--- Setting Status Get Error ---');
                    console.error(err);
            });
        },
        post({commit}, data) {
            return Service.settings('post', 'status', data)
                .then((response) => {

                }).catch((err) => {
            });
        },
        put({commit}, data) {
            return Service.settings('put', 'status', data)
                .then((response) => {

                }).catch((err) => {
            });
        },
        delete({commit}, data) {
            return Service.settings('delete', 'status', data)
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
