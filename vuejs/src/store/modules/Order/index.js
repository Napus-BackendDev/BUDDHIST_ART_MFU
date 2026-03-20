import Service from "@/service/api";
import store from "@/store/store";

const OrderModule = {
    namespaced: true,
    state: {
        orders: [],
        currentOrder: null,
    },

    mutations: {
        orders(state, obj) {
            state.orders = obj;
        },
        currentOrder(state, obj) {
            state.currentOrder = obj;
        }
    },

    actions: {
        get({ commit }, data) {
            return Service.order('get', data, {})
                .then((response) => {
                    commit("orders", response.data.data);
                    return response.data.data;
                });
        },
        explore({ commit }, data) {
            return Service.order('exp', data, {})
                .then((response) => {
                    commit("orders", response.data.data);
                    return response.data.data;
                });
        },
        create({ commit }, data) {
            return Service.order('post', data, {});
        },
        update({ commit }, data) {
            return Service.order('put', data, {});
        },
        delete({ commit }, data) {
            return Service.order('delete', data, {});
        }
    },

    getters: {
        orders: state => state.orders,
        currentOrder: state => state.currentOrder,
    },
};

export default OrderModule;
