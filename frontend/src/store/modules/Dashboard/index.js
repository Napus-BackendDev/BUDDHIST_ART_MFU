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
                category: []
            }
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
            // Use mock data — swap to API call once backend endpoint is ready:
            // return Service.dashboard('stats', {}, {})
            //     .then((response) => { commit("SET_STATS", response.data.data); ... })
            return new Promise((resolve) => {
                setTimeout(() => {
                    commit("SET_STATS", MOCK_STATS);
                    commit("SET_LOADING", false);
                    resolve(MOCK_STATS);
                }, 300);
            });
        }
    },

    getters: {
        stats: state => state.stats,
        loading: state => state.loading
    }
};

export default DashboardModule;

