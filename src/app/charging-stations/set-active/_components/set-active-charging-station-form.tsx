"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ChargingStation } from "@prisma/client";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "~/components/ui/use-toast";
import { ActiveChargingStationContext } from "~/contexts/active-charging-station";
import { api } from "~/trpc/react";

export const SetActiveChargingStationForm = (props: {
  chargingStations: ChargingStation[];
}) => {
  const router = useRouter();
  const { setActiveChargingStation } = useContext(ActiveChargingStationContext);

  const chargingStations = api.chargingStations.getChargingStations.useQuery();
  const { mutate: updateActiveChargingStationMutation } =
    api.chargingStations.updateActiveChargingStation.useMutation();
  const { toast } = useToast();

  const showToaster = () => {
    toast({
      title: "Updated",
      description: "Active charging stations has been updated succesfully",
    });
  };

  const formSchema = z.object({
    activeChargingStationId: z.string().min(2),
  });

  const sortedChargingStations = () => {
    return props.chargingStations?.sort((a, b) => {
      if (a.isActive === b.isActive) {
        return 0;
      }
      return a.isActive ? -1 : 1; // if a is active, it should come before b; otherwise, it comes after
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateActiveChargingStationMutation(
      { id: values.activeChargingStationId },
      {
        onSuccess: () => {
          void router.refresh();
          showToaster();
          void updateActiveChargingStationInContext();
        },
      },
    );

    const updateActiveChargingStationInContext = async () => {
      const stations = await chargingStations.refetch();
      const newActiveStation = stations?.data?.find((x) => x.isActive);
      if (newActiveStation) {
        setActiveChargingStation(newActiveStation);
      }
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activeChargingStationId: sortedChargingStations()[0]?.id,
    },
  });

  return (
    <>
      {props?.chargingStations?.length > 0 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"></div>

              <FormField
                control={form.control}
                name="activeChargingStationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active charging station</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sortedChargingStations().map((station) => (
                            <SelectItem
                              key={`${station.name}_${station.id}`}
                              value={station.id}
                            >
                              {station.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Select your active charging station.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </Form>
      )}
    </>
  );
};
