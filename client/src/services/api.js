const API_BASE = "/api";

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config = {
        headers: { "Content-Type": "application/json" },
        ...options,
    };

    if (config.body && typeof config.body === "object") {
        config.body = JSON.stringify(config.body);
    }

    const res = await fetch(url, config);
    const data = await res.json();

    if (!data.success) {
        throw new Error(data.error || "Something went wrong");
    }

    return data.data;
}

// Event Types
export const eventTypeApi = {
    getAll: () => request("/event-types"),
    getOne: (id) => request(`/event-types/${id}`),
    create: (data) => request("/event-types", { method: "POST", body: data }),
    update: (id, data) => request(`/event-types/${id}`, { method: "PUT", body: data }),
    delete: (id) => request(`/event-types/${id}`, { method: "DELETE" }),
};

// Availability
export const availabilityApi = {
    get: () => request("/availability"),
    update: (data) => request("/availability", { method: "PUT", body: data }),
};

// Public Booking
export const bookingApi = {
    getEventBySlug: (slug) => request(`/booking/${slug}`),
    getSlots: (slug, date) => request(`/booking/${slug}/slots?date=${date}`),
    create: (slug, data) => request(`/booking/${slug}`, { method: "POST", body: data }),
};

// Admin Bookings
export const bookingsApi = {
    getAll: (status) => request(`/bookings?status=${status}`),
    cancel: (id) => request(`/bookings/${id}`, { method: "PATCH", body: { status: "CANCELLED" } }),
};
