import Service from "@/service/api";

const MOCK_STATS = {
    summary: {
        artworks: 142,
        users: 58,
        orders: 27
    },
    charts: {
        status: [
            { _id: 'อนุมัติ', count: 89 },
            { _id: 'รออนุมัติ', count: 35 },
            { _id: 'ปฏิเสธ', count: 18 }
        ],
        category: [
            { _id: 'จิตรกรรม', count: 54 },
            { _id: 'ประติมากรรม', count: 31 },
            { _id: 'ลายเส้น', count: 27 },
            { _id: 'ศิลปะดิจิทัล', count: 18 },
            { _id: 'อื่นๆ', count: 12 }
        ]
    }
};

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

