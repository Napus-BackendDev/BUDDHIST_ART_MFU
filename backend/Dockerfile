# ใช้ Node.js 20 เป็น base image
FROM node:20

# กำหนด working directory
WORKDIR /usr/src/app

# คัดลอกไฟล์ package.json และ lock file
COPY package*.json ./

# ติดตั้ง pnpm
RUN npm install -g pnpm

# ติดตั้ง dependencies ทั้งหมด (รวม devDependencies ด้วย เพื่อให้ sass ทำงานได้)
RUN pnpm install

# คัดลอก source code ทั้งหมด
COPY . .

# เปิด port ที่ server ใช้
EXPOSE 8081

# คำสั่งเริ่มต้นเมื่อ container รัน
CMD ["node", "-r", "dotenv/config", "server.js"]
