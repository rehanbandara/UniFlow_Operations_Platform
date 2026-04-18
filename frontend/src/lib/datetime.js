/**
 * Converts API LocalDateTime string (e.g. "2026-04-18T13:30:00") to a nice label.
 * Keeps it timezone-agnostic (treats it as local/time-only).
 */
export function formatLocalDateTime(value) {
  if (!value) return "-";
  const s = String(value).replace("T", " ");
  // show yyyy-mm-dd hh:mm
  return s.length >= 16 ? s.slice(0, 16) : s;
}

/**
 * datetimeLocal: "YYYY-MM-DDTHH:mm"
 * returns string "YYYY-MM-DDTHH:mm" with minutes added
 */
export function addMinutes(datetimeLocal, minutes) {
  if (!datetimeLocal) return "";
  const d = new Date(datetimeLocal);
  if (Number.isNaN(d.getTime())) return "";
  d.setMinutes(d.getMinutes() + minutes);

  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function isPast(datetimeLocal) {
  if (!datetimeLocal) return false;
  const d = new Date(datetimeLocal);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}