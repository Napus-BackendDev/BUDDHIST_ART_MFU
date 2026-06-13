import Service from "@/service/api";
import store from "@/store/store";

const ArtworkModule = {
    namespaced: true,
    state: {
        artworks: [],
        currentArtwork: null,
    },

    mutations: {
        artworks(state, obj) {
            state.artworks = obj;
        },
        currentArtwork(state, obj) {
            state.currentArtwork = obj;
        }
    },

    actions: {
        get({ commit }, data) {
            return Service.artwork('get', data, {})
                .then((response) => {
                    commit("artworks", response.data.data);
                    return response.data.data;
                });
        },
        explore({ commit }, data) {
            return Service.artwork('exp', data, {})
                .then((response) => {
                    return response.data.data;
                });
        },
        create({ commit }, data) {
            return Service.artwork('post', data, {});
        },
        update({ commit }, data) {
            return Service.artwork('put', data, {});
        },
        delete({ commit }, data) {
            return Service.artwork('delete', data, {});
        },
        upload({ commit }, data) {
            return Service.artwork('upload', data, {});
        },
        // Category and Presentation management
        category({ commit }, payload) {
            return Service.artwork('category', payload, {})
                .then(response => response.data.data);
        },
        presentation({ commit }, payload) {
            return Service.artwork('presentation', payload, {})
                .then(response => response.data.data);
        }
    },

    getters: {
        artworks: state => state.artworks,
        currentArtwork: state => state.currentArtwork,
    },
};

export default ArtworkModule;
