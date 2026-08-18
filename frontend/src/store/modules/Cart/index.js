import Service from "@/service/api";

const readPersistedItems = () => {
    if (typeof localStorage === 'undefined') return [];
    try {
        const value = JSON.parse(localStorage.getItem('cartItems') || '[]');
        return Array.isArray(value) ? value : [];
    } catch (error) {
        localStorage.removeItem('cartItems');
        return [];
    }
};

const persistItems = (items) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cartItems', JSON.stringify(items));
    }
};

const state = {
    items: readPersistedItems(),
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
        console.log(`[Checkout Flow 2] Store: Received addToCart action for ID: ${artwork._id}`);
        if (getters.isInCart(artwork._id)) {
            console.log(`[Checkout Flow 2] Store: Item already in cart, updating...`);
            commit('UPDATE_CART_ITEM', artwork);
            return;
        }
        console.log(`[Checkout Flow 2] Store: Adding new item to cart state.`);
        commit('ADD_TO_CART', artwork);
    },
    updateCartItem({ commit }, artwork) {
        commit('UPDATE_CART_ITEM', artwork);
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
    },
    updateItemStatusLocal({ commit }, payload) {
        commit('UPDATE_ITEM_STATUS', payload);
    }
};

const mutations = {
    ADD_TO_CART(state, artwork) {
        const id = String(artwork._id);
        const index = state.items.findIndex(item => String(item._id) === id);
        if (index === -1) {
            state.items.push({ ...artwork, quantity: 1, addedAt: Date.now() });
        } else {
            // Update existing item with latest data
            const existingItem = state.items[index];
            state.items.splice(index, 1, { ...artwork, quantity: 1, addedAt: existingItem.addedAt });
        }
        persistItems(state.items);
    },
    UPDATE_CART_ITEM(state, artwork) {
        const id = String(artwork._id);
        const index = state.items.findIndex(item => String(item._id) === id);
        if (index !== -1) {
            const existingItem = state.items[index];
            state.items.splice(index, 1, { ...artwork, quantity: 1, addedAt: existingItem.addedAt });
            persistItems(state.items);
        }
    },
    UPDATE_ITEM_STATUS(state, { id, status }) {
        const strId = String(id);
        const index = state.items.findIndex(item => String(item._id) === strId);
        if (index !== -1) {
            const item = state.items[index];
            item.status = { ...item.status, ...status };
            state.items.splice(index, 1, item);
            persistItems(state.items);
        }
    },
    REMOVE_FROM_CART(state, artworkId) {
        const id = String(artworkId);
        state.items = state.items.filter(item => String(item._id) !== id);
        persistItems(state.items);
    },
    CLEAR_CART(state) {
        state.items = [];
        persistItems(state.items);
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
