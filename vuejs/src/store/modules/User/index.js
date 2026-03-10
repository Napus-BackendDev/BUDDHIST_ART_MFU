import Vue from "vue";
import Vuex from "vuex";
import store from "@/store/store";
import Service from "@/service/api";

const ServerModule = {
    namespaced: true,
    state: {
        user: [],
    },

    mutations: {
        user(state, obj) {
            state.user = obj;
        }
    },

    actions: {
        explore({ commit }, data) {
            Service.user('exp', data, {})
                .then((response) => {
                    store.commit("user/user", response.data.data);
                }).catch((err) => {
                });
        },
        create({ commit }, data) {
            Service.user('post', data, {})
                .then((response) => {
                    store.commit("user/user", response.data.data);
                }).catch((err) => {
                });
        },
        update({ commit }, data) {
            Service.user('put', data, {})
                .then((response) => {
                    store.commit("user/user", response.data.data);
                }).catch((err) => {
                });
        },
        delete({ commit }, data) {
            Service.user('delete', data, {})
                .then((response) => {
                    store.commit("user/user", response.data.data);
                }).catch((err) => {
                });
        },
        upload({ commit }, data) {
            Service.user('upload', data, {})
                .then((response) => {
                    store.commit("user/user", response.data.data);
                }).catch((err) => {
                });
        }
    },

    getters: {
        user(state) {
            return state.user
        }
    },

}

export default ServerModule