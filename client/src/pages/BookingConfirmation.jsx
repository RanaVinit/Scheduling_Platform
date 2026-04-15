import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, User } from "lucide-react";
import Button from "../components/ui/Button";
import { bookingApi } from "../services/api";
import { formatDuration } from "../utils/helpers";

export default function BookingConfirmation() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.getEventBySlug(slug)
      .then((data) => setEventType(data))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md w-full p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-sm text-gray-500 mb-8">You're all set. A calendar invitation has been sent to your email.</p>

        {eventType && (
          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-8">
            <h3 className="font-semibold text-gray-900">{eventType.title}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" />{eventType.user.name}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />{formatDuration(eventType.durationMinutes)}</div>
            </div>
          </div>
        )}

        <Link to={`/${slug}`}>
          <Button variant="secondary" className="w-full"><Calendar className="w-4 h-4 mr-2" />Book Another Time</Button>
        </Link>

        <p className="text-xs text-gray-400 mt-8">Powered by <span className="font-semibold text-gray-500">Cal.clone</span></p>
      </div>
    </div>
  );
}
