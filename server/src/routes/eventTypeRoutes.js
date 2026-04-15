const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventTypeController");

/**
 * @route   GET /api/event-types
 * @desc    Get all event types for the current user
 * @access  Private
 */
router.get("/", controller.getAll);

/**
 * @route   POST /api/event-types
 * @desc    Create a new event type
 * @access  Private
 */
router.post("/", controller.create);

/**
 * @route   GET /api/event-types/:id
 * @desc    Get a single event type by ID
 * @access  Private
 */
router.get("/:id", controller.getOne);

/**
 * @route   PUT /api/event-types/:id
 * @desc    Update an event type
 * @access  Private
 */
router.put("/:id", controller.update);

/**
 * @route   DELETE /api/event-types/:id
 * @desc    Delete an event type and its bookings
 * @access  Private
 */
router.delete("/:id", controller.remove);

module.exports = router;
