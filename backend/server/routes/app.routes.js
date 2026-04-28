const settingsRoutes = require("../Project/Settings/settings.routes");
const artworkRoutes = require("../Project/Artwork/artwort.routes");
const newRoutes = require("../Project/New/new.routes");
const orderRoutes = require("../Project/Order/order.routes");
const userRoutes = require("../Project/User/user.routes");
const submissionRoutes = require("../Project/Submission/submission.routes");
const googleRoutes = require("../Project/Settings/google.routes");

// const sync = require("../sync/mis");
module.exports = function (app) {

  var path = "/api/v1";
  // app.use(path, googleRoutes.onDistance )

  // app.use(path + '/organization', organizationRoutes); // complete

  app.use(path + '/news', newRoutes); // complete
  app.use(path + '/order', orderRoutes); // inprogress
  app.use(path + '/artwork', artworkRoutes); // inprogress
  app.use(path + '/settings', settingsRoutes); // inprogress
  app.use(path + '/user', userRoutes); // inprogress
  app.use(path + '/submission', submissionRoutes); // inprogress
  app.use(path + '/google', googleRoutes);

  // app.use(path + '/address', addressRoutes); // complete

  //
  // app.use(path , accountRoutes);

  // hr service
  // app.use(path + '', hrAccountRoutes);
  // app.use(path + '/system', accountAdminRoutes);
  //
  // app.use(path + '/application', applicationRoutes);


};




