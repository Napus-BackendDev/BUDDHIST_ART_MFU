import Service from "@/service/api";

const OrderModule = {
    namespaced: true,
    state: {
        orders: [],
        currentOrder: null,
    },

    mutations: {
        orders(state, obj) {
            state.orders = obj;
        },
        currentOrder(state, obj) {
            state.currentOrder = obj;
        }
    },

    actions: {
        get({ commit }, data) {
            return Service.order('get', data, {})
                .then((response) => {
                    commit("orders", response.data.data);
                    return response.data.data;
                });
        },
        explore({ commit }, data) {
            return Service.order('exp', data, {})
                .then((response) => {
                    commit("orders", response.data.data);
                    return response.data.data;
                });
        },
        create({ commit }, data) {
            return Service.order('post', data, {});
        },
        update({ commit }, data) {
            return Service.order('put', data, {});
        },
        delete({ commit }, data) {
            return Service.order('delete', data, {});
        },
        upload({ commit }, data) {
            const formData = new FormData();
            formData.append('_id', data._id);
            formData.append('image', data.image);
            return Service.order('upload', formData, {});
        },
        // Administrator swaps the payment slip of a pending order (the old one stays in slipHistory).
        replaceSlip({ commit }, data) {
            const formData = new FormData();
            formData.append('_id', data._id);
            formData.append('image', data.image);
            return Service.order('replace-slip', formData, {});
        },
        // Buyer cancels their own unpaid (Reserved) order; the server releases the artwork.
        async cancel({ dispatch, rootGetters }, orderId) {
            await dispatch('setting/status/get', null, { root: true });
            const statuses = rootGetters['setting/status/item'] || [];
            const cancelled = statuses.find(item => String(item.code || '').toUpperCase() === 'CANCELLED');
            if (!cancelled) throw new Error('CANCELLED_STATUS_MISSING');
            return Service.order('put', { _id: orderId, status: cancelled._id }, {});
        },
        getInvoice({ commit }, orderId) {
            return Service.order('invoice', orderId, {});
        }
    },

    getters: {
        orders: state => state.orders,
        currentOrder: state => state.currentOrder,
    },
};

export default OrderModule;
