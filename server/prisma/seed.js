require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // 1. Create default user
  const user = await prisma.user.upsert({
    where: { email: "ranavinit74@gmail.com" },
    update: {},
    create: {
      name: "Vinit Rana",
      email: "ranavinit74@gmail.com",
      timezone: "Asia/Kolkata",
    },
  });
  console.log(`User: ${user.name} (${user.email})`);

  // 2. Create availability schedule (Mon-Fri, 9 AM - 5 PM)
  const schedule = await prisma.availabilitySchedule.create({
    data: {
      userId: user.id,
      name: "Working Hours",
      timezone: "Asia/Kolkata",
      isDefault: true,
      rules: {
        create: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
        ],
      },
    },
  });
  console.log(`Availability: ${schedule.name}`);

  // 3. Create event types
  const eventTypes = await Promise.all([
    prisma.eventType.create({
      data: {
        userId: user.id,
        title: "Quick Chat",
        description: "A brief 15-minute call for quick questions or introductions.",
        durationMinutes: 15,
        slug: "quick-chat",
        color: "#0069FF",
        bufferMinutes: 5,
      },
    }),
    prisma.eventType.create({
      data: {
        userId: user.id,
        title: "30 Min Meeting",
        description: "A standard 30-minute meeting for discussions or catch-ups.",
        durationMinutes: 30,
        slug: "30-min-meeting",
        color: "#10B981",
        bufferMinutes: 10,
      },
    }),
    prisma.eventType.create({
      data: {
        userId: user.id,
        title: "Technical Interview",
        description: "60-minute technical discussion covering system design and coding.",
        durationMinutes: 60,
        slug: "technical-interview",
        color: "#8B5CF6",
        bufferMinutes: 15,
      },
    }),
    prisma.eventType.create({
      data: {
        userId: user.id,
        title: "Coffee Chat",
        description: "An informal 20-minute conversation. No agenda needed!",
        durationMinutes: 20,
        slug: "coffee-chat",
        color: "#FF6B00",
        bufferMinutes: 0,
        isActive: false,
      },
    }),
    // New Event Types added
    prisma.eventType.create({
      data: {
        userId: user.id,
        title: "Sprint Planning",
        description: "Bi-weekly sprint planning meeting to align on deliverables.",
        durationMinutes: 45,
        slug: "sprint-planning",
        color: "#EC4899", // Pink
        bufferMinutes: 10,
      },
    }),
    prisma.eventType.create({
      data: {
        userId: user.id,
        title: "1-on-1 Mentorship",
        description: "Monthly 1-on-1 mentorship session for career growth and feedback.",
        durationMinutes: 60,
        slug: "mentorship-session",
        color: "#06B6D4", // Cyan
        bufferMinutes: 15,
      },
    }),
    prisma.eventType.create({
      data: {
        userId: user.id,
        title: "Code Review Sync",
        description: "Synchronous pairing session to go over complex PRs together.",
        durationMinutes: 30,
        slug: "code-review",
        color: "#EF4444", // Red
        bufferMinutes: 5,
      },
    }),
  ]);
  console.log(`${eventTypes.length} event types created`);

  // 4. Create sample bookings ... (Rest remains the same)
  const future = (days, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const past = (days, hour) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const addMin = (date, mins) => new Date(date.getTime() + mins * 60000);

  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[1].id,
        bookerName: "Arjun Mehta",
        bookerEmail: "arjun.mehta@company.com",
        startTime: future(1, 10),
        endTime: addMin(future(1, 10), 30),
        status: "CONFIRMED",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[0].id,
        bookerName: "Sneha Kapoor",
        bookerEmail: "sneha.k@startup.io",
        startTime: future(2, 14),
        endTime: addMin(future(2, 14), 15),
        status: "CONFIRMED",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[2].id,
        bookerName: "Rahul Sharma",
        bookerEmail: "rahul.s@techcorp.dev",
        startTime: future(3, 11),
        endTime: addMin(future(3, 11), 60),
        status: "CONFIRMED",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[1].id,
        bookerName: "Priya Nair",
        bookerEmail: "priya.n@design.co",
        startTime: future(5, 15),
        endTime: addMin(future(5, 15), 30),
        status: "CONFIRMED",
      },
    }),
    // New Bookings based on new event types
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[4].id, // Sprint Planning
        bookerName: "Vikram Singh",
        bookerEmail: "vikram.s@agile.teams",
        startTime: future(2, 9),
        endTime: addMin(future(2, 9), 45),
        status: "CONFIRMED",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[6].id, // Code Review
        bookerName: "Pooja Desai",
        bookerEmail: "pooja.d@devs.net",
        startTime: past(1, 11),
        endTime: addMin(past(1, 11), 30),
        status: "CONFIRMED",
      },
    }),
    // Original past ones
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[1].id,
        bookerName: "Karan Gupta",
        bookerEmail: "karan.g@agency.com",
        startTime: past(2, 10),
        endTime: addMin(past(2, 10), 30),
        status: "CONFIRMED",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[0].id,
        bookerName: "Neha Verma",
        bookerEmail: "neha.v@freelance.io",
        startTime: past(5, 16),
        endTime: addMin(past(5, 16), 15),
        status: "CONFIRMED",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[2].id,
        bookerName: "Ankit Patel",
        bookerEmail: "ankit.p@university.edu",
        startTime: future(4, 9),
        endTime: addMin(future(4, 9), 60),
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    }),
  ]);
  console.log(`${bookings.length} bookings created`);

  console.log("\nSeed completed!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
