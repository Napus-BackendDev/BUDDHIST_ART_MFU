import Service from "@/service/api";
import store from "@/store/store";

const SubmissionModule = {
    namespaced: true,
    state: {
        submissions: [],
        currentSubmission: null,
    },

    mutations: {
        submissions(state, obj) {
            state.submissions = obj;
        },
        currentSubmission(state, obj) {
            state.currentSubmission = obj;
        }
    },

    actions: {
        get({ commit }, data) {
            return Service.submission('get', data, {})
                .then((response) => {
                    commit("submissions", response.data.data);
                    return response.data.data;
                });
        },
        explore({ commit }, data) {
            return Service.submission('exp', data, {})
                .then((response) => {
                    commit("submissions", response.data.data);
                    return response.data.data;
                });
        },
        create({ commit }, data) {
            return Service.submission('post', data, {});
        },
        update({ commit }, data) {
            return Service.submission('put', data, {});
        },
        delete({ commit }, data) {
            return Service.submission('delete', data, {});
        },
        upload({ commit }, data) {
            return Service.submission('upload', data, {});
        },
        async submitWork({ dispatch, state, rootGetters }, payload) {
            const { submissionId, assignmentId, artwork } = payload;
            
            let imageUrl = '';
            if (artwork._image) {
                const formData = new FormData();
                formData.append('image', artwork._image);
                const uploadRes = await Service.submission('upload', formData);
                imageUrl = uploadRes.data.data.url;
            }

            const submission = state.submissions.find(s => s._id === submissionId);
            if (!submission) throw new Error('Submission not found');

            const assignments = JSON.parse(JSON.stringify(submission.assignments));
            const assignment = assignments.find(a => a._id === assignmentId);
            if (!assignment) throw new Error('Assignment not found');

            if (!assignment.artworks) assignment.artworks = [];

            const currentUserId = rootGetters['auth/userId'];
            
            const newArtwork = {
                title: artwork.title,
                description: artwork.description,
                category: artwork.category,
                technique: artwork.technique,
                size: artwork.size,
                price: artwork.price,
                status: artwork.status.approval,
                image: imageUrl,
                owner: currentUserId,
                create: {
                    at: new Date()
                }
            };

            assignment.artworks.push(newArtwork);

            return dispatch('update', { _id: submissionId, assignments });
        }
    },

    getters: {
        submissions: state => state.submissions,
        currentSubmission: state => state.currentSubmission,
    },
};

export default SubmissionModule;
