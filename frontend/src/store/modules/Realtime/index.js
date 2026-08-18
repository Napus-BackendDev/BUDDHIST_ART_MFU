import { io } from 'socket.io-client';

const REFRESH_ACTIONS = {
    user: [
        { type: 'user/get', payload: {} },
        { type: 'dashboard/getStats' }
    ],
    artwork: [
        { type: 'artwork/get' },
        { type: 'artwork/category', payload: { method: 'get' } },
        { type: 'setting/status/get' },
        { type: 'dashboard/getStats' }
    ],
    order: [
        { type: 'order/get' },
        { type: 'dashboard/getStats' }
    ],
    submission: [
        { type: 'submission/get', payload: {} },
        { type: 'dashboard/getStats' }
    ],
    news: [
        { type: 'news/get' }
    ],
    settings: [
        { type: 'setting/status/get' },
        { type: 'setting/roles/config', payload: {} },
        { type: 'setting/storage/get', payload: {} }
    ]
};

let socket = null;
let fallbackTimer = null;
let refreshTimer = null;
let pendingChanges = [];

function isAdminPage() {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
}

function getSocketUrl() {
    const configuredUrl = process.env.VUE_APP_API_URL;
    if (configuredUrl) return configuredUrl.replace(/\/+$/, '');
    return typeof window !== 'undefined' ? window.location.origin : '';
}

function getResource(change) {
    const resource = String(change && (change.resource || change.scope) || '').toLowerCase();
    if (resource.startsWith('setting')) return 'settings';
    return resource.split('.')[0];
}

function notifyLocalComponents(change) {
    if (typeof window === 'undefined' || typeof window.CustomEvent !== 'function') return;
    window.dispatchEvent(new window.CustomEvent('admin:data-changed', { detail: change }));
}

function startFallback(dispatch) {
    if (fallbackTimer) return;

    fallbackTimer = window.setInterval(() => {
        if (isAdminPage() && (!socket || !socket.connected)) {
            dispatch('refresh', { resource: 'all', source: 'fallback-polling' });
        }
    }, 30000);
}

function stopFallback() {
    if (!fallbackTimer) return;
    window.clearInterval(fallbackTimer);
    fallbackTimer = null;
}

const RealtimeModule = {
    namespaced: true,
    state: {
        connected: false,
        lastChange: null
    },

    mutations: {
        setConnected(state, value) {
            state.connected = value;
        },
        setLastChange(state, change) {
            state.lastChange = change;
        }
    },

    actions: {
        start({ commit, dispatch }) {
            if (socket || typeof window === 'undefined') return;

            socket = io(getSocketUrl(), {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 10000
            });

            socket.on('connect', () => {
                commit('setConnected', true);
                stopFallback();
            });

            socket.on('disconnect', () => {
                commit('setConnected', false);
                startFallback(dispatch);
            });

            socket.on('connect_error', () => {
                commit('setConnected', false);
                startFallback(dispatch);
            });

            socket.on('admin:data-changed', change => {
                commit('setLastChange', change);

                pendingChanges.push(change || {});
                if (refreshTimer) return;

                refreshTimer = window.setTimeout(() => {
                    const changes = pendingChanges;
                    pendingChanges = [];
                    refreshTimer = null;

                    const resources = new Set(changes.map(getResource).filter(Boolean));
                    dispatch('refresh', {
                        resource: resources.size === 1 ? [...resources][0] : 'all',
                        source: 'socket'
                    });
                }, 150);
            });
        },

        refresh({ dispatch }, change = {}) {
            if (!isAdminPage()) return Promise.resolve();

            notifyLocalComponents(change);
            const resource = getResource(change);
            const actions = resource === 'all'
                ? Object.values(REFRESH_ACTIONS).reduce((all, group) => all.concat(group), [])
                : (REFRESH_ACTIONS[resource] || []);

            return Promise.all(actions.map(({ type, payload }) =>
                dispatch(type, payload, { root: true }).catch(() => undefined)
            ));
        }
    },

    getters: {
        connected: state => state.connected,
        lastChange: state => state.lastChange
    }
};

export default RealtimeModule;
