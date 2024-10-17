"use client";

import { useEffect, useState } from "react";
import dayjs from "~/utils/dayjs";

export default function FormattedTimestamp({
  timestamp,
  showMinutesAndSeconds,
}: {
  timestamp: Date | string | null;
  showMinutesAndSeconds?: boolean;
}) {
  const [formattedTimestamp, setFormattedTimestamp] = useState<string>("");

  useEffect(() => {
    let formatString = "YYYY-MM-DD";
    if (showMinutesAndSeconds) {
      formatString += " HH:mm:ss";
    }

    const dayjsTimestamp = timestamp
      ? dayjs.utc(timestamp).local().format(formatString)
      : "-";

    setFormattedTimestamp(dayjsTimestamp);
  }, [timestamp, showMinutesAndSeconds]);

  return <>{formattedTimestamp}</>;
}
