# ใช้ Node.js 20 เป็น base image
FROM node:20

# กำหนด working directory
WORKDIR /usr/src/app

# The committed lockfile varies across pnpm versions.
# Install from package.json with npm --legacy-peer-deps for reliable container build.
COPY package.json ./
RUN npm install --legacy-peer-deps

# คัดลอก source code ทั้งหมด
COPY . .

# เปิด port ที่ server ใช้
EXPOSE 8081

# คำสั่งเริ่มต้นเมื่อ container รัน
CMD ["node", "-r", "dotenv/config", "server.js"]
