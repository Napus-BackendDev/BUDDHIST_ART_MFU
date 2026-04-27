const state = {
    items: [],
    lastOrder: null,
    showCart: false // Global state for cart visibility
};

const getters = {
    cartItems: state => state.items,
    cartCount: state => state.items.length, // Since each item is unique, count is items.length
    cartTotal: state => state.items.reduce((total, item) => {
        // Remove non-numeric characters then parse float
        if (typeof item.price !== 'string' && typeof item.price !== 'number') return total;
        const priceStr = String(item.price).replace(/[^0-9.-]+/g, "");
        const price = parseFloat(priceStr) || 0;
        return total + price; // quantity is always 1 now
    }, 0),
    lastOrder: state => state.lastOrder,
    isCartOpen: state => state.showCart,
    isInCart: (state) => (id) => {
        return state.items.some(item => item._id === id);
    },
    cartShippingCost: (state, getters) => {
        const subtotal = getters.cartTotal;
        return (subtotal > 1000 || subtotal === 0) ? 0 : 25;
    },
    cartFinalTotal: (state, getters) => {
        return getters.cartTotal + getters.cartShippingCost;
    }
};

const actions = {
    addToCart({ commit, getters }, artwork) {
        if (getters.isInCart(artwork._id)) {
            return; // Don't add if already in cart
        }
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
    },
    setShowCart({ commit }, show) {
        commit('SET_SHOW_CART', show);
    }
};

const mutations = {
    ADD_TO_CART(state, artwork) {
        const id = artwork._id;
        const exists = state.items.some(item => item._id === id);
        if (!exists) {
            state.items.push({ ...artwork, quantity: 1 });
        }
    },
    REMOVE_FROM_CART(state, artworkId) {
        state.items = state.items.filter(item => item._id !== artworkId);
    },
    CLEAR_CART(state) {
        state.items = [];
    },
    SET_LAST_ORDER(state, order) {
        state.lastOrder = order;
    },
    SET_SHOW_CART(state, show) {
        state.showCart = show;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
