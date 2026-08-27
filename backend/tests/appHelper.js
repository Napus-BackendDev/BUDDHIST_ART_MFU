const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Message = require('../server/Project/Settings/models/message.model');

let mongod = null;
let appInstance = null;

// Some test files import config before getApp() is called. Refresh the modules
// that capture cfg.mongoURI so the express app always connects to MongoMemoryServer,
// never the developer's local database.
const refreshDatabaseConfig = () => {
  ['../config/config', '../helpers/initialize', '../config/express'].forEach((modulePath) => {
    try { delete require.cache[require.resolve(modulePath)]; } catch (error) { /* not loaded yet */ }
  });
};

// The response envelope (ResMessage.sendResponse -> onMessage_Response) resolves its
// code/message by looking up the Setting_Messages collection. Production seeds these;
// the in-memory test DB starts empty, so without this seed every success/fail body is
// missing its `code` field. Seed the codes the API actually returns.
const seedResponseMessages = async () => {
  if (await Message.countDocuments() > 0) return;
  await Message.insertMany([
    { number: 0, code: 20000, message: [{ key: 'th', value: 'ทำรายการเรียบร้อย' }, { key: 'en', value: 'Success' }] },
    { number: 0, code: 40400, message: [{ key: 'th', value: 'ไม่พบข้อมูล' }, { key: 'en', value: 'Not Found' }] },
  ]);
};

const getApp = async () => {
  if (appInstance) return appInstance;

  // Start in-memory MongoDB server
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB = uri;
  }

  refreshDatabaseConfig();
  // Load express configuration, which will require config and initialize with process.env.MONGODB
  const expressConfig = require('../config/express');

  return new Promise((resolve, reject) => {
    const app = expressConfig();

    const finish = async () => {
      try {
        await seedResponseMessages();
        appInstance = app;
        resolve(app);
      } catch (err) {
        reject(err);
      }
    };
    const checkReady = () => {
      if (mongoose.connection.readyState === 1) {
        // Yield to allow routes to be configured inside callback
        const finishTimer = setTimeout(finish, 100);
        if (finishTimer.unref) finishTimer.unref();
      } else {
        mongoose.connection.once('open', () => {
          const finishTimer = setTimeout(finish, 100);
          if (finishTimer.unref) finishTimer.unref();
        });
        mongoose.connection.once('error', (err) => {
          reject(err);
        });
      }
    };

    checkReady();
  });
};

const closeDatabase = async () => {
  const orderServicePath = require.resolve('../server/Project/Order/service/order');
  const orderService = require.cache[orderServicePath]?.exports;
  if (orderService?.waitForPostCreateTasks) {
    await orderService.waitForPostCreateTasks();
  }
  await mongoose.connection.close(true);
  if (mongod) {
    await mongod.stop({ doCleanup: true, force: true });
  }
  appInstance = null;
  mongod = null;
};

module.exports = { getApp, closeDatabase };
