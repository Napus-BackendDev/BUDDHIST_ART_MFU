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
        get({ commit }, data) {
            return Service.user('get', data, {})
                .then((response) => {
                    commit("user", response.data.data);
                    return response.data.data;
                });
        },
        explore({ commit }, data) {
            return Service.user('exp', data, {})
                .then((response) => {
                    commit("user", response.data.data);
                    return response.data.data;
                });
        },
        create({ commit }, data) {
            return Service.user('post', data, {})
                .then((response) => {
                    return response.data;
                });
        },
        update({ commit }, data) {
            return Service.user('put', data, {})
                .then((response) => {
                    return response.data;
                });
        },
        delete({ commit }, data) {
            return Service.user('delete', data, {})
                .then((response) => {
                    return response.data;
                });
        },
        upload({ commit }, data) {
            return Service.user('upload', data, {})
                .then((response) => {
                    return response.data;
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