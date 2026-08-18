import Service from "@/service/api";

const DashboardModule = {
    namespaced: true,
    state: {
        stats: {
            summary: {
                artworks: 0,
                users: 0,
                orders: 0
            },
            charts: {
                status: [],
                category: [],
                orderAnalytics: {
                    year: new Array(12).fill(0),
                    month: new Array(31).fill(0),
                    day: new Array(24).fill(0)
                }
            },
            pendingArtworks: []
        },
        loading: false
    },

    mutations: {
        SET_STATS(state, stats) {
            state.stats = stats;
        },
        SET_LOADING(state, loading) {
            state.loading = loading;
        }
    },

    actions: {
        getStats({ commit }) {
            commit("SET_LOADING", true);
            return Service.dashboard('stats', {}, {})
                .then((response) => {
                    commit("SET_STATS", response.data.data);
                    commit("SET_LOADING", false);
                    return response.data.data;
                })
                .catch((error) => {
                    console.error("Error fetching dashboard stats:", error);
                    commit("SET_LOADING", false);
                    throw error;
                });
        }
    },

    getters: {
        stats: state => state.stats,
        loading: state => state.loading
    }
};

export default DashboardModule;

