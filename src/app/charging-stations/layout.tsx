import React from "react";

export default function ChargingStationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="m-4">
      <main>{children}</main>
    </div>
  );
}
