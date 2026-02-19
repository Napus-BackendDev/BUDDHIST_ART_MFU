const state = {
    items: [],
    lastOrder: null
};

const getters = {
    cartItems: state => state.items,
    cartCount: state => state.items.reduce((total, item) => total + item.quantity, 0),
    cartTotal: state => state.items.reduce((total, item) => {
        // Remove '$' and ',' then parse float
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
        return total + (price * item.quantity);
    }, 0),
    lastOrder: state => state.lastOrder
};

const actions = {
    addToCart({ commit }, artwork) {
        commit('ADD_TO_CART', artwork);
    },
    removeFromCart({ commit }, artworkId) {
        commit('REMOVE_FROM_CART', artworkId);
    },
    clearCart({ commit }) {
        commit('CLEAR_CART');
    },
    setLastOrder({ commit }, order) {
        commit('SET_LAST_ORDER', order);
    }
};

const mutations = {
    ADD_TO_CART(state, artwork) {
        const existingItem = state.items.find(item => item.id === artwork.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            state.items.push({ ...artwork, quantity: 1 });
        }
    },
    REMOVE_FROM_CART(state, artworkId) {
        state.items = state.items.filter(item => item.id !== artworkId);
    },
    CLEAR_CART(state) {
        state.items = [];
    },
    SET_LAST_ORDER(state, order) {
        state.lastOrder = order;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
