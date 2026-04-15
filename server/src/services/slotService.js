const { addMinutes, parseISO, format, isBefore } = require("date-fns");

/**
 * Generate available time slots for a given date.
 *
 * Algorithm:
 * 1. Find availability rules matching the day of the week
 * 2. Generate slots at durationMinutes intervals within each rule
 * 3. Filter out slots that overlap with existing bookings (including buffer)
 * 4. Filter out past slots
 */
exports.generateAvailableSlots = (dateStr, eventType, rules, existingBookings) => {
    const date = parseISO(dateStr);
    const dayOfWeek = date.getDay();
    const now = new Date();

    // Find rules for this day of the week
    const dayRules = rules.filter((r) => r.dayOfWeek === dayOfWeek);
    if (dayRules.length === 0) return [];

    const slots = [];

    for (const rule of dayRules) {
        // Parse rule start and end times
        const [startH, startM] = rule.startTime.split(":").map(Number);
        const [endH, endM] = rule.endTime.split(":").map(Number);

        let slotStart = new Date(date);
        slotStart.setHours(startH, startM, 0, 0);

        const ruleEnd = new Date(date);
        ruleEnd.setHours(endH, endM, 0, 0);

        while (slotStart < ruleEnd) {
            const slotEnd = addMinutes(slotStart, eventType.durationMinutes);

            // Slot must fit within the availability window
            if (slotEnd > ruleEnd) break;

            // Skip slots that are in the past
            if (!isBefore(slotStart, now)) {
                // Check overlap: A.start < B.end AND A.end > B.start
                const bufferStart = addMinutes(slotStart, -eventType.bufferMinutes);
                const bufferEnd = addMinutes(slotEnd, eventType.bufferMinutes);

                const hasConflict = existingBookings.some((booking) => {
                    return bufferStart < booking.endTime && bufferEnd > booking.startTime;
                });

                if (!hasConflict) {
                    slots.push({
                        startTime: slotStart.toISOString(),
                        endTime: slotEnd.toISOString(),
                    });
                }
            }

            slotStart = addMinutes(slotStart, eventType.durationMinutes);
        }
    }

    return slots;
};
