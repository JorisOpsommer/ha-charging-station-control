import { type ReactNode } from "react";

export default function Paper(props: {
  children: ReactNode;
  title: string | ReactNode;
  styles?: string;
}) {
  return (
    <div className={`rounded-lg bg-card p-6 shadow-lg ${props.styles}`}>
      <h1 className="mb-2 text-xl font-bold">{props.title}</h1>
      {props.children}
    </div>
  );
}
