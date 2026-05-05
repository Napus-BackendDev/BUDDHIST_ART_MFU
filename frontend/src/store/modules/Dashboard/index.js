import Service from "@/service/api";
import moment from 'moment';

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
                orders: []
            },
            latestPending: []
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
        async getStats({ commit }) {
            commit("SET_LOADING", true);
            try {
                // 1. Fetch all required data in parallel
                const [artworksRes, usersRes, ordersRes, submissionsRes] = await Promise.all([
                    Service.artwork('get'),
                    Service.user('get'),
                    Service.order('get'),
                    Service.submission('get')
                ]);

                const artworks = artworksRes.data.data || [];
                const users = usersRes.data.data || [];
                const orders = ordersRes.data.data || [];
                const submissions = submissionsRes.data.data || [];

                // 2. Helper to get nested values
                const getNestedValue = (obj, path) => {
                    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
                };

                const getLabel = (status) => {
                    if (!status) return 'Pending';
                    return Array.isArray(status) 
                        ? (status.find(s => s.key === 'en')?.value || status[0]?.value) 
                        : (status.value || status);
                };

                // 3. Aggregate Artworks by Status (from main collection)
                const statusCounts = {};
                artworks.forEach(art => {
                    const status = getNestedValue(art, 'status.approval.title') || 'Approved';
                    const statusLabel = getLabel(status);
                    statusCounts[statusLabel] = (statusCounts[statusLabel] || 0) + 1;
                });
                const statusChart = Object.keys(statusCounts).map(key => ({ _id: key, count: statusCounts[key] }));

                // 4. Aggregate Artworks by Category
                const categoryCounts = {};
                artworks.forEach(art => {
                    const cat = art.category?.title || 'Uncategorized';
                    const catLabel = getLabel(cat);
                    categoryCounts[catLabel] = (categoryCounts[catLabel] || 0) + 1;
                });
                const categoryChart = Object.keys(categoryCounts).map(key => ({ _id: key, count: categoryCounts[key] }));

                // 5. Aggregate Orders by Date (Last 30 Days)
                const orderChart = [];
                const last30Days = {};
                for (let i = 29; i >= 0; i--) {
                    const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
                    last30Days[date] = 0;
                }

                orders.forEach(order => {
                    const date = moment(order.createdAt).format('YYYY-MM-DD');
                    if (last30Days[date] !== undefined) {
                        last30Days[date]++;
                    }
                });

                Object.keys(last30Days).sort().forEach(date => {
                    orderChart.push({ _id: date, count: last30Days[date] });
                });

                // 6. Latest Pending Items from SUBMISSIONS
                const pendingSubmissions = [];
                submissions.forEach(sub => {
                    (sub.assignments || []).forEach((assign, assignIdx) => {
                        (assign.artworks || []).forEach((aw, awIdx) => {
                            const status = getNestedValue(aw, 'status.title');
                            const statusLabel = getLabel(status);
                            
                            if (statusLabel === 'Pending' || statusLabel === 'รออนุมัติ' || !status) {
                                pendingSubmissions.push({
                                    ...aw,
                                    artist: assign.artist?.[0] || sub.artist?.[0] || aw.owner,
                                    submissionTitle: sub.title,
                                    createdAt: aw.create?.at || sub.createdAt,
                                    submissionId: sub._id,
                                    assignIdx: assignIdx,
                                    awIdx: awIdx
                                });
                            }
                        });
                    });
                });

                const latestPending = pendingSubmissions
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);

                const finalStats = {
                    summary: {
                        artworks: artworks.length,
                        users: users.length,
                        orders: orders.length
                    },
                    charts: {
                        status: statusChart,
                        category: categoryChart,
                        orders: orderChart
                    },
                    latestPending: latestPending
                };

                commit("SET_STATS", finalStats);
                commit("SET_LOADING", false);
                return finalStats;

            } catch (err) {
                console.error('Dashboard Aggregation Error:', err);
                commit("SET_LOADING", false);
                return null;
            }
        },

        async approveArtwork({ dispatch }, item) {
            try {
                // 1. Get the "Approved" status ID
                const statusRes = await Service.settings('get', 'status', { "title.value": "Approved" });
                const approvedStatus = statusRes.data.data.find(s => 
                    s.title.some(t => t.key === 'en' && t.value === 'Approved')
                );
                
                if (!approvedStatus) throw new Error('Approved status not found');

                // 2. Fetch the latest submission document
                const submissionRes = await Service.submission('exp', { _id: item.submissionId });
                const submission = submissionRes.data.data;
                
                if (!submission) throw new Error('Submission not found');

                // 3. Update the specific artwork status using indices
                const assignment = submission.assignments[item.assignIdx];
                if (assignment && assignment.artworks[item.awIdx]) {
                    assignment.artworks[item.awIdx].status = approvedStatus._id;
                } else {
                    throw new Error('Artwork position mismatch');
                }

                // 4. Save the submission
                await Service.submission('put', submission);

                // 5. Refresh dashboard stats
                await dispatch('getStats');
                
                return true;
            } catch (err) {
                console.error('Approve Artwork Error:', err);
                throw err;
            }
        }
    },

    getters: {
        stats: state => state.stats,
        loading: state => state.loading
    }
};

export default DashboardModule;


