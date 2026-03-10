import axios from 'axios';
import store from '@/store/store'

const instance = axios.create();

// instance.defaults.baseURL = 'https://api.example.com';
// instance.defaults.baseURL = 'https://api.competency.mfu.ac.th';
instance.defaults.baseURL = process.env.VUE_APP_API_URL;
// instance.defaults.timeout = 5000;

instance.defaults.headers = {
    "Content-Type": "application/json",
    // "Api-version": "1.0",
    "X-Access-Token": "1a661eec9bf358b8567c3dc022146d19c69d2ceafe92f503e89391e5d9f9f739",
}

//
// // เพิ่ม request interceptor
// instance.interceptors.request.use(
//     (config) => {
//       const token = `${store.state.XAccessToken}`;
//       if (token) {
//         config.headers.Authorization = `Bearer ${store.state.XAccessToken}`;
//       }
//
//       config.headers.lang  = `${store.getters['setting/lang']}`;
//       return config;
//     },
//     (error) => {
//       return Promise.reject(error);
//     }
// );
//
// // เพิ่ม Interceptor สำหรับ Response
// instance.interceptors.response.use(
//     (response) => {
//       // คืนค่าปกติหาก response สำเร็จ
//       return response;
//     },
//     (error) => {
//       // ตรวจสอบสถานะ 401
//       if (error.response && error.response.status === 401) {
//         // แสดง Dialog หรือ Popup
//         router.push('/login');
//       }
//       return Promise.reject(error);
//     }
// );

export default {

    user(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("/api/v1/user/explorers", data);
            case 'get':
                return instance.get("/api/v1/user", { params: data });
            case 'post':
                return instance.post("/api/v1/user", data);
            case 'put':
                return instance.put("/api/v1/user", data);
            case 'delete':
                return instance.delete("/api/v1/user", { data });
            case 'get-by-id':
                return instance.get("/api/v1/user", { params: data });
            case 'upload':
                return instance.put("/api/v1/user/upload", data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            default:
                break;
        }
    },

    artwork(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("/api/v1/artwork/explorers", data);
            case 'get':
                return instance.get("/api/v1/artwork", { params: data });
            case 'post':
                return instance.post("/api/v1/artwork", data);
            case 'put':
                return instance.put("/api/v1/artwork", data);
            case 'delete':
                return instance.delete("/api/v1/artwork/" + data._id);
            case 'get-by-id':
                return instance.get("/api/v1/artwork/" + data);
            case 'upload':
                return instance.put("/api/v1/artwork/upload", data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            default:
                break;
        }
    },

    order(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/api/v1/order", { params: data });
            case 'post':
                return instance.post("/api/v1/order", data);
            case 'put':
                return instance.put("/api/v1/order", data);
            case 'delete':
                return instance.delete("/api/v1/order", { data: data });
            default:
                break;
        }
    },

    donation(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/api/v1/donation", { params: data });
            case 'post':
                return instance.post("/api/v1/donation", data);
            case 'put':
                return instance.put("/api/v1/donation", data);
            case 'delete':
                return instance.delete("/api/v1/donation", { data: data });
            default:
                break;
        }
    },

    news(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/api/v1/new", { params: data });
            case 'post':
                return instance.post("/api/v1/new", data);
            case 'put':
                return instance.put("/api/v1/new", data);
            case 'delete':
                return instance.delete("/api/v1/new", { data: data });
            case 'upload':
                return instance.put("/api/v1/new/upload", data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            default:
                break;
        }
    },

    submission(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/api/v1/submission", { params: data });
            case 'post':
                return instance.post("/api/v1/submission", data);
            case 'put':
                return instance.put("/api/v1/submission", data);
            case 'delete':
                return instance.delete("/api/v1/submission", { data: data });
            default:
                break;
        }
    },
}
