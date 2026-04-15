const prisma = require("../config/db");
const { DEFAULT_USER_EMAIL } = require("../config/constants");

// Helper to get the single user
const getUser = async () => {
    let user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
    if (!user) user = await prisma.user.findFirst();
    return user;
};

exports.getAvailability = async () => {
    const user = await getUser();
    if (!user) throw new Error("No user found");

    let schedule = await prisma.availabilitySchedule.findFirst({
        where: { userId: user.id, isDefault: true },
        include: { rules: true },
    });

    if (!schedule) {
        // Create default schedule if none exists (9 AM to 5 PM, Mon-Fri)
        schedule = await prisma.availabilitySchedule.create({
            data: {
                userId: user.id,
                name: "Working Hours",
                timezone: user.timezone || "Asia/Kolkata",
                isDefault: true,
                rules: {
                    create: [1, 2, 3, 4, 5].map((day) => ({
                        dayOfWeek: day,
                        startTime: "09:00",
                        endTime: "17:00",
                    })),
                },
            },
            include: { rules: true },
        });
    }

    return schedule;
};

exports.updateAvailability = async (data) => {
    const user = await getUser();
    if (!user) throw new Error("No user found");

    const { timezone, rules } = data;

    const schedule = await prisma.availabilitySchedule.findFirst({
        where: { userId: user.id, isDefault: true },
    });

    if (!schedule) throw new Error("Default schedule not found");

    // Update timezone and replace all rules in a transaction
    return await prisma.$transaction([
        prisma.availabilitySchedule.update({
            where: { id: schedule.id },
            data: { timezone },
        }),
        prisma.availabilityRule.deleteMany({
            where: { scheduleId: schedule.id },
        }),
        prisma.availabilityRule.createMany({
            data: rules.map((r) => ({
                scheduleId: schedule.id,
                dayOfWeek: r.dayOfWeek,
                startTime: r.startTime,
                endTime: r.endTime,
            })),
        }),
    ]);
};
