import axios from 'axios';
import store from '@/store/store'

const instance = axios.create();

// instance.defaults.baseURL = 'https://api.example.com';
// instance.defaults.baseURL = 'https://api.competency.mfu.ac.th';
instance.defaults.baseURL = process.env.VUE_APP_API_URL;
// instance.defaults.timeout = 5000;

instance.defaults.headers = {
    "Content-Type": "application/json",
}

// Add request interceptor
instance.interceptors.request.use(
    (config) => {
      const token = store.state.xAccessToken;
      if (token) {
        config.headers["X-Access-Token"] = token;
        // Also add Authorization header if backend needs it
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add language if available
      try {
        const lang = store.getters['setting/lang'];
        if (lang) config.headers.lang = lang;
      } catch (e) {
        // Ignore if store not ready
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// Add response interceptor
instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
          // Clear local storage and redirect to login on unauthorized
          localStorage.removeItem('objs');
          window.location.href = '/#/pages/login';
      }
      return Promise.reject(error);
    }
);

export default {

    user(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("/api/v1/user/explorers", data);
            case 'get':
                return instance.get("/api/v1/user");
            case 'post':
                return instance.post("/api/v1/user", data);
            case 'put':
                return instance.put("/api/v1/user", data);
            case 'delete':
                return instance.delete("/api/v1/user", { data: data });
            case 'get-by-id':
                return instance.get("/api/v1/user", { params: data });
            case 'upload':
                return instance.put("/api/v1/user/upload", data, {
                    headers: { 'Content-Type': undefined }
                });
            default:
                break;
        }
    },

    dashboard(method, data, configs) {
        switch (method) {
            case 'stats':
                return instance.get("/api/v1/dashboard/stats");
            default:
                break;
        }
    },

    artwork(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("/api/v1/artwork/explore", data);
            case 'get':
                return instance.get("/api/v1/artwork");
            case 'post':
                return instance.post("/api/v1/artwork", data);
            case 'put':
                return instance.put("/api/v1/artwork", data);
            case 'delete':
                return instance.delete("/api/v1/artwork", { data: data });
            case 'get-by-id':
                return instance.post("/api/v1/artwork/explore", { _id: data });
            case 'category':
                return instance[data.method]("/api/v1/artwork/category", data.data);
            case 'presentation':
                return instance[data.method]("/api/v1/artwork/presentation", data.data);
            case 'upload':
                return instance.put("/api/v1/artwork/upload", data, {
                    headers: { 'Content-Type': undefined }
                });
            default:
                break;
        }
    },

    order(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/api/v1/order");
            case 'post':
                return instance.post("/api/v1/order", data);
            case 'put':
                return instance.put("/api/v1/order", data);
            case 'delete':
                return instance.delete("/api/v1/order", { data: data });
            case 'exp':
                return instance.post("/api/v1/order/explore", data);
            case 'upload':
                return instance.put("/api/v1/order/upload", data, {
                    headers: { 'Content-Type': undefined }
                });
            case 'invoice':
                return instance.get(`/api/v1/order/invoice/${data}`, {
                    responseType: 'blob'
                });
            case 'certificate':
                return instance.get(`/api/v1/order/certificate/${data}`, {
                    responseType: 'blob'
                });
            default:
                break;
        }
    },


    news(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/api/v1/news");
            case 'view':
                return instance.get(`/api/v1/news/view/${data}`);
            case 'exp':
                return instance.post("/api/v1/news/explore", data);
            case 'post':
                return instance.post("/api/v1/news", data);
            case 'put':
                return instance.put("/api/v1/news", data);
            case 'delete':
                return instance.delete("/api/v1/news", { data: data });
            case 'upload':
                return instance.post("/api/v1/news/upload", data, {
                    headers: { 'Content-Type': undefined }
                });
            default:
                break;
        }
    },

    submission(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/api/v1/submission", { params: data });
            case 'exp':
                return instance.post("/api/v1/submission/explore", data);
            case 'post':
                return instance.post("/api/v1/submission", data);
            case 'put':
                return instance.put("/api/v1/submission", data);
            case 'delete':
                return instance.delete("/api/v1/submission", { data: data });
            case 'upload':
                return instance.post("/api/v1/submission/upload", data, {
                    headers: { 'Content-Type': undefined }
                });
            default:
                break;
        }
    },

    settings(method, service, data) {
        // service can be: message, group, status, verification, role
        const path = `/api/v1/settings/${service}`;
        switch (method) {
            case 'get':
                return instance.get(path, { params: data });
            case 'post':
                return instance.post(path, data);
            case 'put':
                return instance.put(path, data);
            case 'delete':
                return instance.delete(path, { data: data });
            case 'exp':
                return instance.post(`${path}/explore`, data);
            default:
                break;
        }
    },

    roles(method, data, configs) {
        return this.settings(method, 'role', data);
    },


    members(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("/api/v1/user/explorers", data);
            default:
                break;
        }
    },

    organization(method, data, configs) {
        switch (method) {
            case 'explorers':
                return instance.post("/api/v1/organization/explorers", data);
            default:
                break;
        }
    },

    agencies(method, data, configs) {
        switch (method) {
            case 'explorers':
                return instance.post("/api/v1/agencies/explorers", data);
            default:
                break;
        }
    },

    department(method, data, configs) {
        switch (method) {
            case 'explorers':
                return instance.post("/api/v1/department/explorers", data);
            default:
                break;
        }
    },

    authen(method, data, configs) {
        switch (method) {
            case 'sign-in':
                return instance.post("/api/v1/user/auth/sign-in", data);
            case '2fa':
                return instance.post("/api/v1/user/auth/2fa", data);
            case '2fa-send':
                return instance.post("/api/v1/user/auth/2fa-send", data);
            case 'google-auth':
                return instance.post("/api/v1/google/auth", data);
            default:
                break;
        }
    }
}
