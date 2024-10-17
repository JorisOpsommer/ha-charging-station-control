import { type ReactNode } from "react";

export default function ChargingSessionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="m-4">
      <main>{children}</main>
    </div>
  );
}
