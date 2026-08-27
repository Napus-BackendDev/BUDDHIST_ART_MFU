import Service from '@/service/api.js';

const module = {
    namespaced: true,
    state: { items: [] },
    mutations: { items(state, value) { state.items = value || []; } },
    actions: {
        get({ commit }) {
            return Service.settings('get', 'group').then(response => {
                const value = response.data && response.data.data || [];
                commit('items', value);
                return value;
            });
        },
        post(_, data) { return Service.settings('post', 'group', data); },
        put(_, data) { return Service.settings('put', 'group', data); },
        delete(_, data) { return Service.settings('delete', 'group', data); },
        impact(_, data) { return Service.settings('impact', 'group', data); }
    },
    getters: { items: state => state.items }
};

export default module;
