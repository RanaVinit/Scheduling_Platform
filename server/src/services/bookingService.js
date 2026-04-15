const prisma = require("../config/db");
const slotService = require("./slotService");
const { BOOKING_STATUS } = require("../config/constants");

exports.getAvailableSlots = async (slug, date) => {
    const eventType = await prisma.eventType.findUnique({
        where: { slug },
        include: {
            user: {
                include: {
                    availabilitySchedules: {
                        where: { isDefault: true },
                        include: { rules: true },
                    },
                },
            },
        },
    });

    if (!eventType || !eventType.isActive) {
        const error = new Error("Event type not found or inactive");
        error.status = 404;
        throw error;
    }

    // Fetch confirmed bookings for the requested date
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const existingBookings = await prisma.booking.findMany({
        where: {
            eventType: { userId: eventType.userId },
            status: BOOKING_STATUS.CONFIRMED,
            startTime: { gte: dayStart },
            endTime: { lte: dayEnd },
        },
    });

    const schedule = eventType.user.availabilitySchedules[0];
    if (!schedule) return [];

    return slotService.generateAvailableSlots(date, eventType, schedule.rules, existingBookings);
};

exports.createBooking = async (slug, data) => {
    const eventType = await prisma.eventType.findUnique({
        where: { slug },
        include: { user: { select: { name: true } } },
    });

    if (!eventType || !eventType.isActive) {
        const error = new Error("Event type not found or inactive");
        error.status = 404;
        throw error;
    }

    // Use a transaction to prevent double-booking (race condition safe)
    return await prisma.$transaction(async (tx) => {
        // Check for overlapping confirmed bookings
        const conflict = await tx.booking.findFirst({
            where: {
                eventType: { userId: eventType.userId },
                status: BOOKING_STATUS.CONFIRMED,
                startTime: { lt: new Date(data.endTime) },
                endTime: { gt: new Date(data.startTime) },
            },
        });

        if (conflict) {
            const error = new Error("This time slot is no longer available");
            error.status = 409;
            throw error;
        }

        return await tx.booking.create({
            data: {
                eventTypeId: eventType.id,
                bookerName: data.bookerName,
                bookerEmail: data.bookerEmail,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                status: BOOKING_STATUS.CONFIRMED,
            },
            include: {
                eventType: {
                    include: { user: { select: { name: true } } },
                },
            },
        });
    });
};

exports.getBookings = async (status) => {
    const now = new Date();
    let where = {};

    if (status === "upcoming") {
        where = { status: BOOKING_STATUS.CONFIRMED, startTime: { gte: now } };
    } else if (status === "past") {
        where = { status: BOOKING_STATUS.CONFIRMED, endTime: { lt: now } };
    } else if (status === "cancelled") {
        where = { status: BOOKING_STATUS.CANCELLED };
    }

    return await prisma.booking.findMany({
        where,
        include: { eventType: true },
        orderBy: { startTime: status === "past" ? "desc" : "asc" },
    });
};

exports.cancelBooking = async (id) => {
    return await prisma.booking.update({
        where: { id: parseInt(id) },
        data: {
            status: BOOKING_STATUS.CANCELLED,
            cancelledAt: new Date(),
        },
        include: { eventType: true },
    });
};
