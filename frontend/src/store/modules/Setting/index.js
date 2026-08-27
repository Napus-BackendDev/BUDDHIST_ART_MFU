import messages from "@/store/modules/Setting/messages/index";
import status from "@/store/modules/Setting/status/index";
import verification from  "@/store/modules/Setting/verification/index";
import authen from  "@/store/modules/Setting/authen/index";
import roles from "@/store/modules/Setting/roles";
import storage from "@/store/modules/Setting/storage/index";
import groups from "@/store/modules/Setting/groups";


const module = {
    namespaced: true,
    modules: {
        messages,
        status,
        verification,
        authen,
        roles,
        storage,
        groups
    },
    state: {
        lang : localStorage.getItem('lang') || 'th',
    },



    mutations: {
        lang(state, obj) {
            state.lang = obj;
        },
    },

    actions: {

    },

    getters: {
        lang(state, obj) {
            return state.lang;
        },

    },
};
export default module;
