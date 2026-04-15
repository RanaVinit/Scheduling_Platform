const express = require("express");
const router = express.Router();
const controller = require("../controllers/availabilityController");

/**
 * @route   GET /api/availability
 * @desc    Get the default availability schedule with rules
 * @access  Private
 */
router.get("/", controller.get);

/**
 * @route   PUT /api/availability
 * @desc    Update availability rules and timezone
 * @access  Private
 */
router.put("/", controller.update);

module.exports = router;
