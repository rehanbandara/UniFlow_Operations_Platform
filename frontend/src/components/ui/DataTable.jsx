import React from "react";

/**
 * Lightweight table wrapper for consistent styling.
 * Usage:
 * <DataTable columns={[...]} rows={[...]} />
 *
 * columns: [{ key, header, render?: (row) => ReactNode, align?: 'left'|'right' }]
 */
export default function DataTable({ columns, rows, emptyText = "No data", rowKey = "id" }) {
  if (!rows || rows.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontWeight: 900 }}>{emptyText}</div>
        <div style={{ color: "#a9b7d5", marginTop: 6, fontSize: 13 }}>Try adjusting your search/filter.</div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={c.align === "right" ? styles.thRight : styles.th}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r?.[rowKey] ?? JSON.stringify(r)}>
              {columns.map((c) => (
                <td key={c.key} style={c.align === "right" ? styles.tdRight : styles.td}>
                  {c.render ? c.render(r) : r?.[c.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  wrap: { padding: 0, overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: {
    textAlign: "left",
    padding: "12px 12px",
    color: "#a9b7d5",
    fontSize: 12,
    fontWeight: 900,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.12)",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  thRight: {
    textAlign: "right",
    padding: "12px 12px",
    color: "#a9b7d5",
    fontSize: 12,
    fontWeight: 900,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.12)",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  td: {
    padding: "12px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontWeight: 800,
    fontSize: 13,
    verticalAlign: "top",
  },
  tdRight: {
    padding: "12px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    textAlign: "right",
    fontWeight: 800,
    fontSize: 13,
    verticalAlign: "top",
  },
  empty: {
    padding: 18,
    borderRadius: 18,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.14)",
  },
};