import React, { useMemo, useState } from "react";
import Button from "../../components/ui/Button.jsx";
import { TextArea, TextInput } from "../../components/ui/Input.jsx";

export default function BookingRequestForm({ facilityId, facilityName, onSubmit, onCancel, loading = false }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!date) e.date = "Date is required.";
    if (!startTime) e.startTime = "Start time is required.";
    if (!endTime) e.endTime = "End time is required.";
    if (!purpose.trim()) e.purpose = "Purpose is required.";
    return e;
  }, [date, startTime, endTime, purpose]);

  const isValid = Object.keys(errors).length === 0;

  const submit = (ev) => {
    ev.preventDefault();
    setTouched(true);
    if (!isValid) return;

    onSubmit?.({
      facilityId,
      date,
      startTime,
      endTime,
      purpose: purpose.trim(),
    });
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontWeight: 900 }}>
        Booking request for: <span style={{ color: "#cfe3ff" }}>{facilityName || facilityId}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <TextInput
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={touched ? errors.date : ""}
        />
        <TextInput
          label="Start time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          error={touched ? errors.startTime : ""}
        />
        <TextInput
          label="End time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          error={touched ? errors.endTime : ""}
        />
      </div>

      <TextArea
        label="Purpose"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        rows={4}
        placeholder="e.g., Final year project meeting / tutorial / lab session…"
        error={touched ? errors.purpose : ""}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          Submit request
        </Button>
      </div>
    </form>
  );
}