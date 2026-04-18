import React, { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button.jsx";
import { SelectInput, TextArea, TextInput } from "../../components/ui/Input.jsx";

export default function FacilityForm({ initialData, onSubmit, onCancel, loading = false }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("LAB");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setName(initialData?.name ?? "");
    setType((initialData?.type ?? "LAB").toString().toUpperCase());
    setCapacity(initialData?.capacity ?? "");
    setLocation(initialData?.location ?? "");
    setDescription(initialData?.description ?? "");
    setTouched(false);
  }, [initialData]);

  const errors = useMemo(() => {
    const e = {};
    if (!name.trim()) e.name = "Name is required.";
    const cap = Number(capacity);
    if (capacity === "" || Number.isNaN(cap)) e.capacity = "Capacity must be a number.";
    else if (cap < 0) e.capacity = "Capacity cannot be negative.";
    if (!location.trim()) e.location = "Location is required.";
    if (!type) e.type = "Type is required.";
    return e;
  }, [name, type, capacity, location]);

  const isValid = Object.keys(errors).length === 0;

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    onSubmit?.({
      name: name.trim(),
      type: type.toUpperCase(),
      capacity: Number(capacity),
      location: location.trim(),
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={submit} style={styles.form}>
      <div style={styles.grid}>
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Computer Lab A"
          error={touched ? errors.name : ""}
        />

        <SelectInput
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          error={touched ? errors.type : ""}
        >
          <option value="LAB">LAB</option>
          <option value="ROOM">ROOM</option>
        </SelectInput>

        <TextInput
          label="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="e.g., 40"
          error={touched ? errors.capacity : ""}
          inputMode="numeric"
        />

        <TextInput
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Building B - Floor 2"
          error={touched ? errors.location : ""}
        />
      </div>

      <TextArea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional details…"
        rows={4}
      />

      <div style={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          Save
        </Button>
      </div>
    </form>
  );
}

const styles = {
  form: { display: "flex", flexDirection: "column", gap: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" },
};