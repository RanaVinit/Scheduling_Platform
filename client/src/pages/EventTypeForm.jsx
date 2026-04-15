import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import { Input, Textarea, Select } from "../components/ui/Input";
import PageHeader from "../components/layout/PageHeader";
import { useToast } from "../hooks/useToast";
import { eventTypeApi } from "../services/api";
import { generateSlug, EVENT_COLORS } from "../utils/helpers";

export default function EventTypeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", durationMinutes: "30",
    slug: "", color: "#0069FF", bufferMinutes: "0",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      eventTypeApi.getOne(id).then((data) => {
        setForm({
          title: data.title, description: data.description || "",
          durationMinutes: String(data.durationMinutes), slug: data.slug,
          color: data.color, bufferMinutes: String(data.bufferMinutes),
        });
      });
    }
  }, [id, isEditing]);

  const handleTitleChange = (title) => {
    setForm((prev) => ({ ...prev, title, ...(!isEditing ? { slug: generateSlug(title) } : {}) }));
    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.slug.trim()) e.slug = "URL slug is required";
    if (!form.durationMinutes || parseInt(form.durationMinutes) < 5) e.durationMinutes = "Min 5 minutes";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(), description: form.description.trim() || null,
        durationMinutes: parseInt(form.durationMinutes), slug: form.slug.trim(),
        color: form.color, bufferMinutes: parseInt(form.bufferMinutes) || 0,
      };
      if (isEditing) await eventTypeApi.update(id, payload);
      else await eventTypeApi.create(payload);
      showToast(isEditing ? "Event type updated" : "Event type created", "success");
      navigate("/event-types");
    } catch (err) {
      showToast(err.message, "error");
      if (err.message.includes("URL")) setErrors((prev) => ({ ...prev, slug: err.message }));
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="mb-6">
        <Link to="/event-types" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />Back to Event Types
        </Link>
      </div>
      <PageHeader title={isEditing ? "Edit Event Type" : "New Event Type"}
        subtitle={isEditing ? "Update your event type settings" : "Create a new event type for people to book"} />
      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <Input label="Title" placeholder="e.g., 30 Min Meeting" value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)} error={errors.title} />
          <Input label="URL" placeholder="30-min-meeting" value={form.slug}
            onChange={(e) => { setForm((p) => ({ ...p, slug: e.target.value })); if (errors.slug) setErrors((p) => ({ ...p, slug: "" })); }}
            error={errors.slug} helperText={`Booking page: /${form.slug || "..."}`} />
          <Textarea label="Description" placeholder="A brief description" value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Duration" value={form.durationMinutes}
              onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))} error={errors.durationMinutes}
              options={[{ value: "15", label: "15 minutes" }, { value: "30", label: "30 minutes" },
                { value: "45", label: "45 minutes" }, { value: "60", label: "60 minutes" },
                { value: "90", label: "90 minutes" }, { value: "120", label: "2 hours" }]} />
            <Select label="Buffer Time" value={form.bufferMinutes}
              onChange={(e) => setForm((p) => ({ ...p, bufferMinutes: e.target.value }))}
              options={[{ value: "0", label: "No buffer" }, { value: "5", label: "5 minutes" },
                { value: "10", label: "10 minutes" }, { value: "15", label: "15 minutes" },
                { value: "30", label: "30 minutes" }]} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer ${form.color === c ? "ring-2 ring-offset-2 ring-gray-900 scale-110" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Link to="/event-types"><Button variant="secondary" type="button">Cancel</Button></Link>
          <Button type="submit" loading={saving}>{isEditing ? "Save Changes" : "Create Event Type"}</Button>
        </div>
      </form>
    </>
  );
}
