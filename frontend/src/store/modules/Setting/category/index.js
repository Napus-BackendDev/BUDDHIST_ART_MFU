import Service from "@/service/api";

const module = {
    namespaced: true,
    state: {
        categories: [],
    },
    mutations: {
        setCategories(state, data) {
            state.categories = data;
        },
    },
    actions: {
        async get({ commit }) {
            try {
                const response = await Service.settings('get', 'category', {});
                if (response && response.data && response.data.data) {
                    commit('setCategories', response.data.data);
                    return response.data.data;
                }
            } catch (error) {
                console.error("Error fetching news categories:", error);
                throw error;
            }
        },
    },
    getters: {
        categories: (state) => state.categories,
    },
};

export default module;
