# Scheduling Platform (Cal.com Clone)

A full-stack scheduling/booking web application that replicates Cal.com's design and user experience. Built with **React**, **Express.js**, **Prisma**, and **PostgreSQL**.

---

## Live Demo

- **Frontend**: [Deployed URL]
- **Backend API**: [Deployed URL]

---

## Features

### Core Features
- **Event Type Management** — Create, edit, delete, and toggle event types with custom durations, colors, buffer times, and URL slugs
- **Availability Settings** — Set available days and time ranges with timezone support
- **Public Booking Page** — Cal.com-style two-panel layout with calendar, time slot selection, and booking form
- **Bookings Dashboard** — View upcoming, past, and cancelled bookings with tabbed navigation
- **Booking Confirmation** — Clean confirmation page after successful booking

### Technical Highlights
- **Double-Booking Prevention** — Uses Prisma transactions with overlap detection to prevent race conditions
- **Slot Generation Algorithm** — Dynamically generates available time slots considering availability rules, existing bookings, and buffer times
- **Clean MVC Architecture** — Proper separation of Routes → Controllers → Services → Models
- **Centralized Error Handling** — Global error middleware with consistent error response format
- **Responsive Design** — Mobile-first with sidebar drawer navigation

---

## Architecture

```
Scheduling_Platform_ScalerAssignment/
├── server/                          ← Express.js Backend (MVC)
│   ├── src/
│   │   ├── app.js                   ← Entry point
│   │   ├── config/
│   │   │   ├── db.js                ← Prisma singleton
│   │   │   └── constants.js
│   │   ├── services/                ← Business Logic
│   │   │   ├── slotService.js       ← Slot generation algorithm
│   │   │   ├── eventTypeService.js
│   │   │   ├── availabilityService.js
│   │   │   └── bookingService.js
│   │   ├── controllers/             ← Request/Response handling
│   │   ├── routes/                  ← HTTP method mapping
│   │   └── middlewares/
│   │       └── errorHandler.js
│   └── prisma/
│       ├── schema.prisma            ← Database schema
│       └── seed.js                  ← Sample data
│
├── client/                          ← React + Vite Frontend
│   ├── src/
│   │   ├── components/              ← Reusable UI components
│   │   ├── pages/                   ← Page components
│   │   ├── services/api.js          ← Centralized API calls
│   │   ├── hooks/useToast.jsx       ← Toast notification system
│   │   └── utils/helpers.js         ← Utility functions
│   └── vite.config.js
└── README.md
```

### Data Flow (MVC Pattern)
```
Client Request → Route → Controller → Service → Prisma (DB) → Response
                  ↑          ↑            ↑
              (routing)  (validation)  (business logic)
```

---

## Database Schema

```
┌─────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│    users     │     │ availability_schedules│     │ availability_rules│
├─────────────┤     ├──────────────────────┤     ├───────────────────┤
│ id (PK)     │────→│ id (PK)              │────→│ id (PK)           │
│ name        │     │ user_id (FK)         │     │ schedule_id (FK)  │
│ email       │     │ name                 │     │ day_of_week       │
│ timezone    │     │ timezone             │     │ start_time        │
└─────────────┘     │ is_default           │     │ end_time          │
       │            └──────────────────────┘     └───────────────────┘
       │
       ▼
┌─────────────────┐     ┌─────────────────┐
│  event_types    │     │    bookings      │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │────→│ id (PK)         │
│ user_id (FK)    │     │ event_type_id   │
│ title           │     │ booker_name     │
│ slug (UNIQUE)   │     │ booker_email    │
│ duration_minutes│     │ start_time      │
│ color           │     │ end_time        │
│ buffer_minutes  │     │ status          │
│ is_active       │     │ cancelled_at    │
└─────────────────┘     └─────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/event-types` | List all event types |
| `POST` | `/api/event-types` | Create new event type |
| `GET` | `/api/event-types/:id` | Get single event type |
| `PUT` | `/api/event-types/:id` | Update event type |
| `DELETE` | `/api/event-types/:id` | Delete event type |
| `GET` | `/api/availability` | Get availability schedule |
| `PUT` | `/api/availability` | Update availability rules |
| `GET` | `/api/booking/:slug` | Get event type by slug (public) |
| `GET` | `/api/booking/:slug/slots?date=YYYY-MM-DD` | Get available slots |
| `POST` | `/api/booking/:slug` | Create a booking (public) |
| `GET` | `/api/bookings?status=upcoming\|past\|cancelled` | List bookings |
| `PATCH` | `/api/bookings/:id` | Cancel a booking |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Vite, React Router, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL, Prisma ORM |
| **Architecture** | MVC (Model-View-Controller) |

---

## Setup & Installation

### Prerequisites
- Node.js
- PostgreSQL database (Neon recommended)

### 1. Clone the repository
```bash
git clone <repo-url>
cd Scheduling_Platform_ScalerAssignment
```

### 2. Setup Backend
```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Add your DATABASE_URL in .env

# Push schema to database
npx prisma db push

# Seed sample data
node prisma/seed.js

# Start server
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open in browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## Key Technical Decisions

### 1. Double-Booking Prevention
Uses a **Prisma transaction** to atomically check for overlapping bookings before creating a new one. This prevents race conditions where two users book the same slot simultaneously.

```javascript
// Overlap check: A.start < B.end AND A.end > B.start
const conflict = await tx.booking.findFirst({
  where: {
    status: "CONFIRMED",
    startTime: { lt: new Date(endTime) },
    endTime: { gt: new Date(startTime) },
  },
});
```

### 2. Slot Generation Algorithm
The `slotService.js` generates available slots by:
1. Finding availability rules for the selected day
2. Generating slots at `durationMinutes` intervals
3. Filtering out slots that overlap with existing bookings (including buffer time)
4. Filtering out past slots

### 3. MVC Architecture
- **Routes** — Map HTTP methods to controllers (thinnest layer)
- **Controllers** — Handle request validation and response formatting
- **Services** — Contain all business logic (thickest layer)
- **Models** — Prisma handles the data layer

### 4. Prisma Singleton Pattern
Prevents connection pool exhaustion during development by reusing the same PrismaClient instance across hot-reloads.

---

### Made by Vinit Rana