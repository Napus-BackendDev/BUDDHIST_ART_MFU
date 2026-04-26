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
        }
    },

    getters: {
        submissions: state => state.submissions,
        currentSubmission: state => state.currentSubmission,
    },
};

export default SubmissionModule;
