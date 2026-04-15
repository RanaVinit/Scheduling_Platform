const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookingController");

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings with status filter (upcoming|past|cancelled)
 * @access  Private
 */
router.get("/bookings", controller.getAll);

/**
 * @route   PATCH /api/bookings/:id
 * @desc    Cancel a booking
 * @access  Private
 */
router.patch("/bookings/:id", controller.cancel);

/**
 * @route   GET /api/booking/:slug
 * @desc    Get event type details by slug for the public booking page
 * @access  Public
 */
router.get("/booking/:slug", controller.getEventBySlug);

/**
 * @route   GET /api/booking/:slug/slots
 * @desc    Get available time slots for a specific date
 * @access  Public
 */
router.get("/booking/:slug/slots", controller.getSlots);

/**
 * @route   POST /api/booking/:slug
 * @desc    Create a new booking with double-booking prevention
 * @access  Public
 */
router.post("/booking/:slug", controller.createBooking);

module.exports = router;
