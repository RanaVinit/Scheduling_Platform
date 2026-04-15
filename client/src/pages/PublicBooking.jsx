import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Globe, ChevronLeft, ChevronRight, Calendar, User } from "lucide-react";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { bookingApi } from "../services/api";
import { formatDuration, cn } from "../utils/helpers";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
  isSameDay, isToday, isBefore, startOfDay, parseISO,
} from "date-fns";

export default function PublicBooking() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState("calendar"); // calendar | time | form
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [formErrors, setFormErrors] = useState({});
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    bookingApi.getEventBySlug(slug)
      .then((data) => setEventType(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    bookingApi.getSlots(slug, format(selectedDate, "yyyy-MM-dd"))
      .then((data) => setSlots(data))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, slug]);

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const handleDateSelect = (date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    setSelectedDate(date);
    setStep("time");
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep("form");
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Invalid email";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0 || !selectedSlot) return;

    setBooking(true);
    try {
      const data = await bookingApi.create(slug, {
        bookerName: formData.name.trim(),
        bookerEmail: formData.email.trim(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      navigate(`/${slug}/confirmation?bookingId=${data.id}`);
    } catch (err) {
      setFormErrors({ submit: err.message });
    } finally { setBooking(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );

  if (notFound || !eventType) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
        <p className="text-gray-500">This event type doesn't exist or has been disabled.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-4xl w-full overflow-hidden animate-fade-in">
        <div className="flex flex-col md:flex-row">
          {/* Left: Event info */}
          <div className="w-full md:w-72 p-6 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold mb-3">
              {eventType.user.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm text-gray-500 mb-1">{eventType.user.name}</p>
            <h1 className="text-xl font-bold text-gray-900 mb-3">{eventType.title}</h1>
            {eventType.description && <p className="text-sm text-gray-500 mb-4">{eventType.description}</p>}
            <div className="space-y-2.5 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />{formatDuration(eventType.durationMinutes)}</div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" />{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
              {selectedDate && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" />{format(selectedDate, "EEEE, MMMM d")}</div>}
              {selectedSlot && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />{format(parseISO(selectedSlot.startTime), "h:mm a")} - {format(parseISO(selectedSlot.endTime), "h:mm a")}</div>}
            </div>
          </div>

          {/* Right: Calendar / Slots / Form */}
          <div className="flex-1 p-6">
            {(step === "calendar" || step === "time") && (
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-900">{format(currentMonth, "MMMM yyyy")}</h2>
                    <div className="flex gap-1">
                      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-0 mb-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0">
                    {calDays.map((day) => {
                      const isPast = isBefore(day, startOfDay(new Date()));
                      const isCurrent = isSameMonth(day, currentMonth);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      return (
                        <button key={day.toISOString()} onClick={() => handleDateSelect(day)}
                          disabled={isPast || !isCurrent}
                          className={cn(
                            "aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-150 cursor-pointer",
                            !isCurrent && "invisible",
                            isPast && "text-gray-300 cursor-not-allowed",
                            !isPast && isCurrent && !isSelected && "text-gray-900 hover:bg-gray-100 font-medium",
                            isSelected && "bg-gray-900 text-white font-semibold",
                            isToday(day) && !isSelected && "ring-1 ring-gray-900"
                          )}>
                          {format(day, "d")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {step === "time" && selectedDate && (
                  <div className="sm:w-48 animate-fade-in">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{format(selectedDate, "EEE, MMM d")}</h3>
                    {slotsLoading ? (
                      <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse-soft" />)}</div>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4">No available slots.</p>
                    ) : (
                      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                        {slots.map((slot) => (
                          <button key={slot.startTime} onClick={() => handleSlotSelect(slot)}
                            className={cn(
                              "w-full py-2.5 px-3 text-sm font-medium rounded-lg border transition-all duration-150 cursor-pointer",
                              selectedSlot?.startTime === slot.startTime
                                ? "bg-gray-900 text-white border-gray-900"
                                : "text-gray-900 border-gray-300 hover:border-gray-900 hover:bg-gray-50"
                            )}>
                            {format(parseISO(slot.startTime), "h:mm a")}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === "form" && selectedSlot && (
              <div className="max-w-sm animate-fade-in">
                <button onClick={() => setStep("time")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />Back
                </button>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Enter your details</h2>
                <form onSubmit={handleBooking} className="space-y-4">
                  <Input label="Your Name" placeholder="John Doe" value={formData.name}
                    onChange={(e) => { setFormData((p) => ({ ...p, name: e.target.value })); if (formErrors.name) setFormErrors((p) => ({ ...p, name: "" })); }}
                    error={formErrors.name} />
                  <Input label="Your Email" type="email" placeholder="john@example.com" value={formData.email}
                    onChange={(e) => { setFormData((p) => ({ ...p, email: e.target.value })); if (formErrors.email) setFormErrors((p) => ({ ...p, email: "" })); }}
                    error={formErrors.email} />
                  {formErrors.submit && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formErrors.submit}</p>}
                  <Button type="submit" loading={booking} className="w-full" size="lg"><User className="w-4 h-4 mr-2" />Confirm Booking</Button>
                </form>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-gray-100 px-6 py-3 text-center">
          <p className="text-xs text-gray-400">Powered by <span className="font-semibold text-gray-500">Cal.clone</span></p>
        </div>
      </div>
    </div>
  );
}
