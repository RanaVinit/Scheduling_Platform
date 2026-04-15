import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Button from "../components/ui/Button";
import PageHeader from "../components/layout/PageHeader";
import { useToast } from "../hooks/useToast";
import { availabilityApi } from "../services/api";
import { DAYS_OF_WEEK, TIMEZONES, cn } from "../utils/helpers";

export default function Availability() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [activeDays, setActiveDays] = useState(new Set([1, 2, 3, 4, 5]));
  const [dayTimes, setDayTimes] = useState({});

  useEffect(() => {
    availabilityApi.get().then((data) => {
      setTimezone(data.timezone);
      const days = new Set();
      const times = {};
      data.rules.forEach((r) => { days.add(r.dayOfWeek); times[r.dayOfWeek] = { startTime: r.startTime, endTime: r.endTime }; });
      setActiveDays(days);
      setDayTimes(times);
    }).finally(() => setLoading(false));
  }, []);

  const toggleDay = (day) => {
    setActiveDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else { next.add(day); if (!dayTimes[day]) setDayTimes((t) => ({ ...t, [day]: { startTime: "09:00", endTime: "17:00" } })); }
      return next;
    });
  };

  const updateTime = (day, field, value) => {
    setDayTimes((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleSave = async () => {
    const rules = [];
    activeDays.forEach((day) => {
      const t = dayTimes[day] || { startTime: "09:00", endTime: "17:00" };
      rules.push({ dayOfWeek: day, startTime: t.startTime, endTime: t.endTime });
    });
    setSaving(true);
    try {
      await availabilityApi.update({ timezone, rules });
      showToast("Availability saved", "success");
    } catch { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const timeOptions = [];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 30) timeOptions.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

  const fmt12 = (t) => {
    const [h, m] = t.split(":").map(Number);
    return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };

  if (loading) return <><PageHeader title="Availability" /><div className="h-96 bg-white rounded-xl border border-gray-200 animate-pulse-soft" /></>;

  return (
    <>
      <PageHeader title="Availability" subtitle="Configure times when you are available for bookings."
        action={<Button onClick={handleSave} loading={saving}><Save className="w-4 h-4 mr-2" />Save Changes</Button>} />

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 shrink-0">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white">
              {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {DAYS_OF_WEEK.map((day) => {
            const isActive = activeDays.has(day.value);
            const times = dayTimes[day.value] || { startTime: "09:00", endTime: "17:00" };
            return (
              <div key={day.value} className={cn("px-6 py-4 transition-colors", !isActive && "bg-gray-50/30")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleDay(day.value)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer",
                        isActive ? "bg-gray-900" : "bg-gray-300"
                      )}>
                      <span className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                        isActive ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                    <span className={cn("text-sm font-medium min-w-[90px]", isActive ? "text-gray-900" : "text-gray-400")}>{day.label}</span>
                  </div>

                  {isActive ? (
                    <div className="flex items-center gap-2">
                      <select value={times.startTime} onChange={(e) => updateTime(day.value, "startTime", e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none bg-white">
                        {timeOptions.map((t) => <option key={t} value={t}>{fmt12(t)}</option>)}
                      </select>
                      <span className="text-gray-400 text-sm">—</span>
                      <select value={times.endTime} onChange={(e) => updateTime(day.value, "endTime", e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none bg-white">
                        {timeOptions.map((t) => <option key={t} value={t}>{fmt12(t)}</option>)}
                      </select>
                    </div>
                  ) : <span className="text-sm text-gray-400 italic">Unavailable</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
