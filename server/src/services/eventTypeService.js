const prisma = require("../config/db");
const { DEFAULT_USER_EMAIL } = require("../config/constants");

// Helper to get the single user
const getUser = async () => {
    let user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
    if (!user) user = await prisma.user.findFirst(); // Fallback if email changed
    return user;
};

exports.getAllEventTypes = async () => {
    const user = await getUser();
    if (!user) return [];

    return await prisma.eventType.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { bookings: true } } },
    });
};

exports.getEventTypeById = async (id) => {
    return await prisma.eventType.findUnique({
        where: { id: parseInt(id) },
    });
};

exports.getEventTypeBySlug = async (slug) => {
    return await prisma.eventType.findUnique({
        where: { slug },
        include: {
            user: { select: { name: true, email: true, timezone: true } },
        },
    });
};

exports.createEventType = async (data) => {
    const user = await getUser();
    if (!user) throw new Error("No user found in database");

    // Check if slug is already taken
    const existing = await prisma.eventType.findUnique({ where: { slug: data.slug } });
    if (existing) {
        const error = new Error("This URL slug is already taken");
        error.status = 409;
        throw error;
    }

    return await prisma.eventType.create({
        data: {
            userId: user.id,
            title: data.title,
            description: data.description || null,
            durationMinutes: data.durationMinutes,
            slug: data.slug,
            color: data.color || "#0069FF",
            bufferMinutes: data.bufferMinutes || 0,
        },
    });
};

exports.updateEventType = async (id, data) => {
    // If slug is being changed, check for conflicts
    if (data.slug) {
        const existing = await prisma.eventType.findUnique({ where: { slug: data.slug } });
        if (existing && existing.id !== parseInt(id)) {
            const error = new Error("This URL slug is already taken");
            error.status = 409;
            throw error;
        }
    }

    return await prisma.eventType.update({
        where: { id: parseInt(id) },
        data,
    });
};

exports.deleteEventType = async (id) => {
    return await prisma.eventType.delete({
        where: { id: parseInt(id) },
    });
};
