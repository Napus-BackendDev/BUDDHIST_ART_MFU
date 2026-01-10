const settingsRoutes = require("../Project/Settings/settings.routes");
const artworkRoutes = require("../Project/Artwork/artwort.routes");
const newRoutes = require("../Project/New/new.routes");
const orderRoutes = require("../Project/Order/order.routes");
// const organizationRoutes = require("../Project/Organization/organization.routes");

// const sync = require("../sync/mis");
module.exports = function (app) {

  var path = "/api/v1";
  // app.use(path, googleRoutes.onDistance )

  // app.use(path + '/organization', organizationRoutes); // complete

  app.use(path + '/new', newRoutes); // inprogress
  app.use(path + '/order', orderRoutes); // inprogress
  app.use(path + '/artwork', artworkRoutes); // inprogress
  app.use(path + '/setting', settingsRoutes); // inprogress

  // app.use(path + '/address', addressRoutes); // complete

  //
  // app.use(path , accountRoutes);

  // hr service
  // app.use(path + '', hrAccountRoutes);
  // app.use(path + '/system', accountAdminRoutes);
  //
  // app.use(path + '/application', applicationRoutes);


};




