import { type ReactNode } from "react";

export default function ModesLayout({ children }: { children: ReactNode }) {
  return <div className="p-4">{children}</div>;
}
