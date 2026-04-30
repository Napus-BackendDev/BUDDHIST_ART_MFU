import Service from "@/service/api";

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
    async addToCart({ commit, getters, dispatch }, artwork) {
        if (getters.isInCart(artwork._id)) {
            return; // Don't add if already in cart
        }
        
        try {
            const res = await Service.settings('get', 'status', {});
            const statuses = res.data.data;
            const inCartStatus = statuses.find(s => s.title && s.title.some(t => t.value === 'In Cart'));
            
            if (inCartStatus) {
                // clone artwork to prevent mutating vuex state directly here
                const updatedStatus = { ...artwork.status, approval: inCartStatus._id };
                
                // Keep track of what we thought the previous status was
                const previousApprovalId = typeof artwork.status.approval === 'object' ? artwork.status.approval._id : artwork.status.approval;

                try {
                    await dispatch('artwork/update', { 
                        _id: artwork._id, 
                        status: updatedStatus,
                        previousApprovalId: previousApprovalId
                    }, { root: true });
                    
                    // Refresh artworks to hide it from others and the gallery
                    dispatch('artwork/get', null, { root: true });
                    
                    // Only commit if successful
                    commit('ADD_TO_CART', artwork);

                    // Set timeout to automatically remove from cart after 15 minutes (15 * 60 * 1000 ms)
                    setTimeout(() => {
                        if (getters.isInCart(artwork._id)) {
                            alert('หมดเวลาการสั่งซื้อ (15 นาที) ผลงาน ' + (artwork.title && artwork.title.find ? artwork.title.find(t=>t.key==='en')?.value : 'ศิลปะ') + ' ถูกนำออกจากตะกร้าของคุณแล้ว');
                            dispatch('removeFromCart', artwork._id);
                        }
                    }, 15 * 60 * 1000);
                } catch (apiError) {
                    // API returned error (e.g., 400 Bad Request because someone else took it)
                    alert('ขออภัย ผลงานชิ้นนี้ถูกผู้อื่นหยิบใส่ตะกร้าไปแล้วเมื่อสักครู่นี้');
                    dispatch('artwork/get', null, { root: true });
                    return; // exit without committing to cart
                }
            }
        } catch (e) {
            console.error('Failed to reserve artwork in backend', e);
        }
    },
    async removeFromCart({ commit, state, dispatch }, artworkId) {
        const item = state.items.find(i => i._id === artworkId);
        if (item) {
            try {
                const res = await Service.settings('get', 'status', {});
                const statuses = res.data.data;
                const approvedStatus = statuses.find(s => s.title && s.title.some(t => t.value === 'Approved'));
                
                if (approvedStatus) {
                    const updatedStatus = { ...item.status, approval: approvedStatus._id };
                    await dispatch('artwork/update', { _id: item._id, status: updatedStatus }, { root: true });
                    
                    // Refresh artworks to show it back in the gallery
                    dispatch('artwork/get', null, { root: true });
                }
            } catch (e) {
                console.error('Failed to release artwork in backend', e);
            }
        }
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
            state.items.push({ ...artwork, quantity: 1, addedAt: Date.now() });
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
