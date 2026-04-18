import React, { useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";

export default function UiTest() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>UI Test</div>
        <div style={{ color: "#a9b7d5", fontWeight: 800, fontSize: 13, lineHeight: 1.6 }}>
          If this page loads, your Modal + ConfirmDialog imports are correct.
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="primary" onClick={() => setOpen(true)}>
            Open Modal
          </Button>
          <Button variant="danger" onClick={() => setConfirm(true)}>
            Open Confirm
          </Button>
        </div>
      </Card>

      <Modal open={open} title="Modal works" subtitle="This is a test modal." onClose={() => setOpen(false)}>
        <div style={{ color: "#a9b7d5", fontSize: 13, lineHeight: 1.6 }}>
          Great — the Modal component exists and is resolvable by Vite.
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm}
        title="Confirm works"
        message="This is a test confirm dialog."
        confirmText="OK"
        cancelText="Cancel"
        danger={false}
        onCancel={() => setConfirm(false)}
        onConfirm={() => setConfirm(false)}
      />
    </div>
  );
}