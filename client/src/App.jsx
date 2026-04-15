import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./hooks/useToast";
import DashboardLayout from "./components/layout/DashboardLayout";
import EventTypes from "./pages/EventTypes";
import EventTypeForm from "./pages/EventTypeForm";
import Availability from "./pages/Availability";
import Bookings from "./pages/Bookings";
import PublicBooking from "./pages/PublicBooking";
import BookingConfirmation from "./pages/BookingConfirmation";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Dashboard routes — with sidebar layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/event-types" element={<EventTypes />} />
            <Route path="/event-types/new" element={<EventTypeForm />} />
            <Route path="/event-types/:id/edit" element={<EventTypeForm />} />
            <Route path="/availability" element={<Availability />} />
            <Route path="/bookings" element={<Bookings />} />
          </Route>

          {/* Public routes — no sidebar */}
          <Route path="/:slug" element={<PublicBooking />} />
          <Route path="/:slug/confirmation" element={<BookingConfirmation />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/event-types" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
