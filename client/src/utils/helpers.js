import { format, parseISO } from "date-fns";

export function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export function formatDate(date) {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "EEEE, MMMM d, yyyy");
}

export function formatTime(date) {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "h:mm a");
}

export function formatTimeRange(start, end) {
    return `${formatTime(start)} - ${formatTime(end)}`;
}

export function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
}

export function generateSlug(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-");
}

export const DAYS_OF_WEEK = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
];

export const EVENT_COLORS = [
    "#0069FF", "#FF6B00", "#10B981", "#8B5CF6",
    "#EF4444", "#F59E0B", "#EC4899", "#06B6D4",
];

export const TIMEZONES = [
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "America/New_York", label: "US Eastern (EST)" },
    { value: "America/Los_Angeles", label: "US Pacific (PST)" },
    { value: "Europe/London", label: "UK (GMT)" },
    { value: "Europe/Berlin", label: "Central Europe (CET)" },
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Asia/Singapore", label: "Singapore (SGT)" },
    { value: "Asia/Tokyo", label: "Japan (JST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
];
