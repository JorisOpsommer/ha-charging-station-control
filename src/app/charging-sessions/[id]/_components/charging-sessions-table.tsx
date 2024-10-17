"use client";

import { type inferProcedureOutput } from "@trpc/server";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type AppRouter } from "~/server/api/root";
import dayjs from "~/utils/dayjs";

export const ChargingSessionsTable = ({
  sessions,
}: {
  sessions: inferProcedureOutput<AppRouter["chargingSessions"]["getSessions"]>;
}) => {
  return (
    <div>
      {sessions && sessions?.length > 0 && (
        <Table>
          <TableCaption>A list of your charging sessions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Session ID</TableHead>
              <TableHead>Station name</TableHead>
              <TableHead>Started at</TableHead>
              <TableHead>Ended at</TableHead>
              <TableHead>Instruction</TableHead>
              <TableHead>Charging state</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions?.map((cs) => {
              return (
                <TableRow key={`${cs.id}`}>
                  <TableCell>{cs.id}</TableCell>
                  <TableCell>{cs.ChargingStation?.name}</TableCell>

                  <TableCell>
                    {dayjs(cs.startedAt)
                      .utc()
                      .local()
                      .format("YYYY-MM-DD HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    {cs.endedAt
                      ? dayjs(cs.endedAt)
                          .utc()
                          .local()
                          .format("YYYY-MM-DD HH:mm:ss")
                      : "-"}
                  </TableCell>
                  <TableCell>{cs.instructionStateChanges[0]?.state}</TableCell>
                  <TableCell>{cs.chargingStateChanges[0]?.state}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
