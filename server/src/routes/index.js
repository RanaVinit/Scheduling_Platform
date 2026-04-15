const eventTypeRoutes = require("./eventTypeRoutes");
const availabilityRoutes = require("./availabilityRoutes");
const bookingRoutes = require("./bookingRoutes");

module.exports = (app) => {
  // Admin routes
  app.use("/api/event-types", eventTypeRoutes);
  app.use("/api/availability", availabilityRoutes);

  // Booking routes (public + admin are in the same router)
  app.use("/api", bookingRoutes);
};
