import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Badge from "../../components/ui/Badge.jsx";

import FacilityForm from "./FacilityForm.jsx";
import { createFacility, deleteFacility, getAllFacilities, updateFacility } from "./facilityService.js";

function hasRole(user, roleName) {
  const roles = user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some((r) => r?.name === roleName);
}

export default function Facilities() {
  const { token, user, loading, logout } = useAuth();
  const toast = useToast();
  const isAdmin = useMemo(() => hasRole(user, "ROLE_ADMIN"), [user]);

  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("name");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    if (!token) return;
    setFetching(true);
    setError("");
    try {
      const data = await getAllFacilities(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e?.status === 401) {
        toast.push({ variant: "error", title: "Session expired", message: "Please sign in again." });
        logout();
        return;
      }
      setError(e?.message || "Failed to load facilities.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((f) => {
      const type = String(f?.type || "").toUpperCase();
      const matchesType = typeFilter === "ALL" ? true : type === typeFilter;
      if (!matchesType) return false;

      if (!q) return true;
      const hay = `${f?.name || ""} ${f?.location || ""} ${f?.description || ""}`.toLowerCase();
      return hay.includes(q);
    });

    return [...list].sort((a, b) => {
      if (sortKey === "capacity") return (Number(a?.capacity) || 0) - (Number(b?.capacity) || 0);
      if (sortKey === "location") return String(a?.location || "").localeCompare(String(b?.location || ""));
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
  }, [items, query, typeFilter, sortKey]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setModalOpen(true);
  };

  const askDelete = (f) => {
    setToDelete(f);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete?.id) return;
    setDeleting(true);
    try {
      await deleteFacility(token, toDelete.id);
      toast.push({ variant: "success", title: "Deleted", message: "Facility removed successfully." });
      setConfirmOpen(false);
      setToDelete(null);
      await load();
    } catch (e) {
      toast.push({ variant: "error", title: "Delete failed", message: e?.message || "Unable to delete facility." });
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (formData) => {
    if (!isAdmin) return;

    setSaving(true);
    try {
      if (editing?.id) {
        await updateFacility(token, editing.id, formData);
        toast.push({ variant: "success", title: "Updated", message: "Facility updated successfully." });
      } else {
        await createFacility(token, formData);
        toast.push({ variant: "success", title: "Created", message: "Facility created successfully." });
      }
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      toast.push({ variant: "error", title: "Save failed", message: e?.message || "Unable to save facility." });
    } finally {
      setSaving(false);
    }
  };

  if (!loading && !token) return <Navigate to="/landing" replace />;

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontWeight: 900 }}>{r?.name || "-"}</span>
          <Link
            to={`/facilities/${encodeURIComponent(r.id)}`}
            style={{ color: "#cfe3ff", fontWeight: 900, fontSize: 12, textDecoration: "none" }}
          >
            View details →
          </Link>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (r) => {
        const t = String(r?.type || "").toUpperCase();
        return <Badge variant={t === "LAB" ? "info" : "neutral"}>{t || "-"}</Badge>;
      },
    },
    { key: "capacity", header: "Capacity", render: (r) => (Number.isFinite(Number(r?.capacity)) ? r.capacity : "-") },
    { key: "location", header: "Location", render: (r) => r?.location || "-" },
    { key: "description", header: "Description", render: (r) => <span style={{ color: "#a9b7d5" }}>{r?.description || "-"}</span> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) =>
        isAdmin ? (
          <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => askDelete(r)}>
              Delete
            </Button>
          </div>
        ) : (
          <span style={{ color: "#7f90b4", fontWeight: 900, fontSize: 12 }}>—</span>
        ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <PageHeader
        kicker="Facility Directory"
        title="Facilities"
        subtitle={isAdmin ? "Manage facilities used by the university." : "Browse university facilities (read-only)."}
        right={
          <>
            <Button variant="secondary" onClick={load} loading={fetching}>
              Refresh
            </Button>
            {isAdmin && (
              <Button variant="primary" onClick={openCreate}>
                + Add Facility
              </Button>
            )}
          </>
        }
      />

      <Card style={{ padding: 14 }}>
        <div style={styles.filters}>
          <div style={styles.field}>
            <div style={styles.label}>Search</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, location, description…"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <div style={styles.label}>Type</div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={styles.input}>
              <option value="ALL">All</option>
              <option value="LAB">LAB</option>
              <option value="ROOM">ROOM</option>
            </select>
          </div>

          <div style={styles.field}>
            <div style={styles.label}>Sort</div>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={styles.input}>
              <option value="name">Name</option>
              <option value="location">Location</option>
              <option value="capacity">Capacity</option>
            </select>
          </div>
        </div>
      </Card>

      {error ? (
        <Card style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)" }}>
          <EmptyState title="Couldn’t load facilities" description={error} actionLabel="Retry" onAction={load} />
        </Card>
      ) : fetching ? (
        <Card>Loading facilities…</Card>
      ) : (
        <Card style={{ padding: 0 }}>
          <DataTable columns={columns} rows={filtered} emptyText="No facilities found" />
        </Card>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Edit Facility" : "Add Facility"}
        subtitle={editing ? "Update facility information." : "Create a new facility record."}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setEditing(null);
          }
        }}
      >
        <FacilityForm
          initialData={editing || {}}
          onSubmit={handleSave}
          loading={saving}
          onCancel={() => {
            if (!saving) {
              setModalOpen(false);
              setEditing(null);
            }
          }}
        />
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete facility?"
        message={`Delete "${toDelete?.name || "this facility"}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onCancel={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setToDelete(null);
          }
        }}
        onConfirm={doDelete}
      />
    </div>
  );
}

const styles = {
  filters: {
    display: "grid",
    gridTemplateColumns: "1.8fr 0.6fr 0.6fr",
    gap: 12,
    alignItems: "end",
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { color: "#7f90b4", fontWeight: 900, fontSize: 12 },
  input: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "#e8eefc",
    borderRadius: 12,
    padding: "10px 12px",
    outline: "none",
    fontWeight: 800,
  },
};