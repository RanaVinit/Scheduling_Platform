import { useEffect, useState } from "react";
import { Calendar, Clock, Mail, User, XCircle } from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/layout/PageHeader";
import { useToast } from "../hooks/useToast";
import { bookingsApi } from "../services/api";
import { formatDate, formatTimeRange } from "../utils/helpers";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const { showToast } = useToast();

  const fetchBookings = async (tab) => {
    setLoading(true);
    try { setBookings(await bookingsApi.getAll(tab)); }
    catch { showToast("Failed to load bookings", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(activeTab); }, [activeTab]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingsApi.cancel(cancelId);
      showToast("Booking cancelled", "success");
      fetchBookings(activeTab);
    } catch { showToast("Failed to cancel", "error"); }
    finally { setCancelling(false); setCancelId(null); }
  };

  const tabs = [{ key: "upcoming", label: "Upcoming" }, { key: "past", label: "Past" }, { key: "cancelled", label: "Cancelled" }];

  return (
    <>
      <PageHeader title="Bookings" subtitle="See upcoming and past events booked through your event type links." />

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse-soft" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} bookings</h3>
          <p className="text-sm text-gray-500">{activeTab === "upcoming" ? "Share your event links to get booked!" : `No ${activeTab} bookings to show.`}</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-1 rounded-full shrink-0 self-stretch" style={{ backgroundColor: b.eventType.color }} />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">{b.eventType.title}</h3>
                      <Badge variant={b.status === "CONFIRMED" ? "success" : "danger"}>{b.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{formatDate(b.startTime)}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" />{formatTimeRange(b.startTime, b.endTime)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" />{b.bookerName}</span>
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />{b.bookerEmail}</span>
                    </div>
                  </div>
                </div>
                {activeTab === "upcoming" && b.status === "CONFIRMED" && (
                  <Button variant="ghost" size="sm" onClick={() => setCancelId(b.id)} className="text-gray-400 hover:text-red-600 shrink-0">
                    <XCircle className="w-4 h-4 mr-1.5" />Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={cancelId !== null} onClose={() => setCancelId(null)} title="Cancel Booking">
        <p className="text-sm text-gray-600 mb-6">Are you sure you want to cancel this booking?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setCancelId(null)}>Keep</Button>
          <Button variant="danger" onClick={handleCancel} loading={cancelling}>Cancel Booking</Button>
        </div>
      </Modal>
    </>
  );
}
