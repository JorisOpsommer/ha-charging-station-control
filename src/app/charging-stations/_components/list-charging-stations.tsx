"use client";

import { type ChargingStation } from "@prisma/client";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
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
import FormattedTimestamp from "../../../components/custom/formatted-timestamp";

export const ListChargingStations = ({
  chargingStations,
}: {
  chargingStations: inferProcedureOutput<
    AppRouter["chargingStations"]["getChargingStations"]
  >;
}) => {
  return (
    <div>
      {chargingStations && chargingStations?.length > 0 && (
        <Table>
          <TableCaption>A list of your charging stations.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Is active</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Created at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chargingStations?.map((cs: ChargingStation) => {
              return (
                <TableRow key={`${cs.name}_${cs.id}`}>
                  <TableCell>{cs.id}</TableCell>
                  <TableCell>{cs.name}</TableCell>
                  <TableCell>
                    {cs.isActive ? (
                      <CheckCircledIcon color="green" />
                    ) : (
                      <CrossCircledIcon color="red" />
                    )}
                  </TableCell>
                  <TableCell>{cs.brand}</TableCell>
                  <TableCell>
                    <FormattedTimestamp timestamp={cs.createdAt} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
