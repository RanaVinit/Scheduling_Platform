const bookingService = require("../services/bookingService");
const eventTypeService = require("../services/eventTypeService");
const mailService = require("../services/mailService");
const { HTTP_STATUS } = require("../config/constants");

exports.getAll = async (req, res) => {
    try {
        const status = req.query.status || "upcoming";
        const bookings = await bookingService.getBookings(status);
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

exports.cancel = async (req, res) => {
    try {
        if (req.body.status !== "CANCELLED") {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Only cancellation is supported" });
        }
        const booking = await bookingService.cancelBooking(req.params.id);

        // Send cancellation email
        try {
            await mailService.sendBookingCancellation(
                booking.bookerName,
                booking.bookerEmail,
                booking.eventType.title
            );
        } catch (emailError) {
            console.error("Failed to send cancellation email:", emailError.message);
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
};

exports.getEventBySlug = async (req, res) => {
    try {
        const eventType = await eventTypeService.getEventTypeBySlug(req.params.slug);
        if (!eventType || !eventType.isActive) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Event type not found" });
        }
        res.json({ success: true, data: eventType });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

exports.getSlots = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Date parameter is required" });
        }
        const slots = await bookingService.getAvailableSlots(req.params.slug, date);
        res.json({ success: true, data: slots });
    } catch (error) {
        res.status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const { bookerName, bookerEmail, startTime, endTime } = req.body;
        if (!bookerName || !bookerEmail || !startTime || !endTime) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Name, email, start time, and end time are required" });
        }

        const booking = await bookingService.createBooking(req.params.slug, req.body);

        // Send confirmation email
        try {
            await mailService.sendBookingConfirmation(
                booking.bookerName,
                booking.bookerEmail,
                booking.eventType.title,
                booking.eventType.user.name,
                booking.startTime,
                booking.endTime
            );
        } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError.message);
        }

        res.status(HTTP_STATUS.CREATED).json({ success: true, data: booking });
    } catch (error) {
        res.status(error.status || HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
};
