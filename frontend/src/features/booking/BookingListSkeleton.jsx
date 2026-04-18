import React from "react";
import Card from "../../components/ui/Card.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

/**
 * Simple skeleton grid for bookings list pages.
 * Use in MyBookings and AdminBookings while loading.
 */
export default function BookingListSkeleton({ count = 6 }) {
  return (
    <div style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Skeleton height={14} width="70%" />
              <div style={{ height: 8 }} />
              <Skeleton height={12} width="55%" />
            </div>
            <Skeleton height={26} width={90} style={{ borderRadius: 999 }} />
          </div>

          <div style={{ height: 12 }} />
          <Skeleton height={10} width="45%" />
          <div style={{ height: 12 }} />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Skeleton height={34} width={110} style={{ borderRadius: 14 }} />
          </div>
        </Card>
      ))}
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 },
};