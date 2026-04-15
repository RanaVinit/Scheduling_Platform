import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Clock, ExternalLink, Copy, MoreVertical, Pencil, Trash2, Check } from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/layout/PageHeader";
import { useToast } from "../hooks/useToast";
import { eventTypeApi } from "../services/api";
import { formatDuration } from "../utils/helpers";

export default function EventTypes() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const data = await eventTypeApi.getAll();
      setEventTypes(data);
    } catch { showToast("Failed to load event types", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    try {
      await eventTypeApi.delete(deleteId);
      setEventTypes((prev) => prev.filter((et) => et.id !== deleteId));
      showToast("Event type deleted", "success");
    } catch { showToast("Failed to delete", "error"); }
    setDeleteId(null);
  };

  const handleToggle = async (id, isActive) => {
    try {
      await eventTypeApi.update(id, { isActive: !isActive });
      setEventTypes((prev) => prev.map((et) => et.id === id ? { ...et, isActive: !isActive } : et));
      showToast(`Event type ${!isActive ? "enabled" : "disabled"}`, "success");
    } catch { showToast("Failed to update", "error"); }
    setMenuOpen(null);
  };

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
    showToast("Link copied!", "success");
  };

  return (
    <>
      <PageHeader title="Event Types" subtitle="Create events to share for people to book on your calendar."
        action={<Link to="/event-types/new"><Button><Plus className="w-4 h-4 mr-2" />New</Button></Link>} />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse-soft" />)}
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No event types yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Create your first event type to let people book time on your calendar.</p>
          <Link to="/event-types/new"><Button><Plus className="w-4 h-4 mr-2" />Create Event Type</Button></Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 stagger-children">
          {eventTypes.map((et) => (
            <div key={et.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors group first:rounded-t-xl last:rounded-b-xl">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: et.color }} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{et.title}</h3>
                    {!et.isActive && <Badge variant="warning">Disabled</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">/{et.slug} · {formatDuration(et.durationMinutes)}{et.bufferMinutes > 0 && ` · ${et.bufferMinutes}m buffer`}</p>
                  {et.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-md">{et.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => copyLink(et.slug)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer" title="Copy link">
                  {copiedSlug === et.slug ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <Link to={`/${et.slug}`} target="_blank" className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Preview">
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === et.id ? null : et.id)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === et.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 animate-scale-in">
                        <Link to={`/event-types/${et.id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(null)}>
                          <Pencil className="w-4 h-4" />Edit
                        </Link>
                        <button onClick={() => handleToggle(et.id, et.isActive)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left cursor-pointer">
                          <Clock className="w-4 h-4" />{et.isActive ? "Disable" : "Enable"}
                        </button>
                        <button onClick={() => { setDeleteId(et.id); setMenuOpen(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left cursor-pointer">
                          <Trash2 className="w-4 h-4" />Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Event Type">
        <p className="text-sm text-gray-600 mb-6">Are you sure? All associated bookings will also be deleted.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </>
  );
}
