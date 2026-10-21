import Service from "@/service/api";

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
        update({ state }, data) {
            const existing = Array.isArray(state.submissions) ? state.submissions.find(item => item._id === data._id) : state.submissions;
            const payload = data.assignments && !data.updatedAt && existing?._id === data._id && existing.updatedAt
                ? { ...data, updatedAt: existing.updatedAt } : data;
            return Service.submission('put', payload, {});
        },
        delete({ commit }, data) {
            return Service.submission('delete', data, {});
        },
        upload({ commit }, data) {
            return Service.submission('upload', data, {});
        },
        importExcel({ commit }, data) {
            return Service.submission('import-excel', data, {});
        },
        async submitWork({ dispatch, state }, payload) {
            const { submissionId, assignmentId, artwork } = payload;
            const submission = state.submissions.find(s => s._id === submissionId);
            if (!submission) throw new Error('Submission not found');
            const assignment = submission.assignments?.find(a => a._id === assignmentId);
            if (!assignment) throw new Error('Assignment not found');
            const previous = assignment.artworks?.find(item => item._id === artwork._id);
            let imageUrl = artwork.image !== undefined ? artwork.image : (previous?.image || '');
            if (artwork._image instanceof File) {
                const formData = new FormData();

                // หาชื่อ Assignment และ Artwork เพื่อส่งไปเป็นชื่อโฟลเดอร์/ไฟล์
                const getVal = (field) => {
                    if (!field) return '';
                    if (typeof field === 'string') return field;
                    if (Array.isArray(field)) return field[0]?.value || '';
                    return field.en || field.th || '';
                };

                // --- ใส่ข้อมูลข้อความก่อนเพื่อให้ Multer อ่านเจอตอนทำ Destination ---
                formData.append('_id', submissionId);
                formData.append('assignmentId', assignmentId);
                if (artwork._id) formData.append('artworkId', artwork._id);
                formData.append('assignmentTitle', getVal(assignment?.title));
                formData.append('artworkTitle', getVal(artwork.title));

                // --- รูปต้องอยู่บรรทัดสุดท้ายเสมอ ---
                formData.append('image', artwork._image);
                // --------------------------------------------------

                const uploadRes = await Service.submission('upload', formData);
                imageUrl = uploadRes.data.data.url;
            }

            const fields = ['_id', 'title', 'description', 'category', 'storage', 'storageDetail', 'technique', 'size', 'price', 'remark'];
            const item = Object.fromEntries(fields.filter(key => artwork[key] !== undefined).map(key => [key, artwork[key]]));
            item.image = imageUrl;
            return dispatch('update', { _id: submissionId, assignmentId, artwork: item });
        }
    },

    getters: {
        submissions: state => state.submissions,
        currentSubmission: state => state.currentSubmission,
    },
};

export default SubmissionModule;
