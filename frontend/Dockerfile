FROM node:20-alpine AS build-stage

# ติดตั้ง python3, make, g++, git
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

COPY package*.json ./

# ติดตั้ง dependencies พร้อมแก้ peer dependency conflicts
# Browser-driver postinstall scripts are only needed for end-to-end tests and
# can hang a production image build. The Vue production build does not use them.
RUN npm install --legacy-peer-deps --ignore-scripts

COPY . .

# Public OAuth client ID and API URL must be available during compilation.
ARG VUE_APP_CLIENTID
ARG VUE_APP_API_URL=https://bas.beta.mfu.ac.th

# สร้าง production build
RUN npm run build

# ใช้ Nginx serve static files
FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
