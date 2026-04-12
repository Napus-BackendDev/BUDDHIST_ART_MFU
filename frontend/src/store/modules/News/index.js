import Service from "@/service/api";
import store from "@/store/store";

const NewsModule = {
    namespaced: true,
    state: {
        news: [],
        currentNews: null,
    },

    mutations: {
        news(state, obj) {
            state.news = obj;
        },
        currentNews(state, obj) {
            state.currentNews = obj;
        }
    },

    actions: {
        get({ commit }, data) {
            return Service.news('get', data, {})
                .then((response) => {
                    commit("news", response.data.data);
                    return response.data.data;
                });
        },
        explore({ commit }, data) {
            return Service.news('exp', data, {})
                .then((response) => {
                    commit("news", response.data.data);
                    return response.data.data;
                });
        },
        create({ commit }, data) {
            return Service.news('post', data, {});
        },
        update({ commit }, data) {
            return Service.news('put', data, {});
        },
        delete({ commit }, data) {
            return Service.news('delete', data, {});
        },
        upload({ commit }, data) {
            return Service.news('upload', data, {});
        }
    },

    getters: {
        news: state => state.news,
        currentNews: state => state.currentNews,
    },
};

export default NewsModule;
