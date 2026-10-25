import Service from "@/service/api";
import store from "@/store/store";

let getArtworksInFlight = null;

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
            const hasQuery = data && typeof data === 'object' && Object.keys(data).length > 0;
            if (!hasQuery && getArtworksInFlight) {
                return getArtworksInFlight;
            }

            const reqPromise = Service.artwork('get', data, {})
                .then((response) => {
                    commit("artworks", response.data.data);
                    return response.data.data;
                })
                .finally(() => {
                    if (!hasQuery) getArtworksInFlight = null;
                });

            if (!hasQuery) getArtworksInFlight = reqPromise;
            return reqPromise;
        },
        explore({ commit }, data) {
            return Service.artwork('exp', data, {})
                .then((response) => {
                    return response.data.data;
                });
        },
        updateView({ commit }, id) {
            return Service.artwork('view', id, {});
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
        categoryCreate({ commit }, payload) {
            return Service.categorySettings('post', payload).then(response => response.data.data);
        },
        categoryUpdate({ commit }, payload) {
            return Service.categorySettings('put', payload).then(response => response.data.data);
        },
        categoryDelete({ commit }, payload) {
            return Service.categorySettings('delete', payload).then(response => response.data.data);
        },
        categoryImpact({ commit }, payload) {
            return Service.categorySettings('impact', payload).then(response => response.data.data);
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
