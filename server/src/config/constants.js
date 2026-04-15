/**
 * Centralized Application Constants
 * Extracted to avoid "magic numbers" in controllers.
 */
module.exports = {
  DEFAULT_USER_EMAIL: "ranavinit74@gmail.com",

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },

  BOOKING_STATUS: {
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
  },
};