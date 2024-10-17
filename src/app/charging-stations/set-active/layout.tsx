import React from "react";
import { Toaster } from "~/components/ui/toaster";

export default function SetActiveChargingStationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="m-4">
      <main>{children}</main>
      <Toaster />
    </div>
  );
}
