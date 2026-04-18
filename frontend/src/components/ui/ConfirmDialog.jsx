import React from "react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      subtitle={message}
      onClose={loading ? undefined : onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{ color: "#a9b7d5", fontSize: 13, lineHeight: 1.6 }}>
        This action cannot be undone.
      </div>
    </Modal>
  );
}