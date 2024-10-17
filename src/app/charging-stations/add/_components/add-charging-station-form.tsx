"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ActiveChargingStationContext } from "~/contexts/active-charging-station";
import { ChargingStationBrands } from "~/models/charging-station-brands-enum";
import { api } from "~/trpc/react";

export default function AddChargingStationForm() {
  const router = useRouter();
  const { activeChargingStation, setActiveChargingStation } = useContext(
    ActiveChargingStationContext,
  );

  const formSchema = z.object({
    name: z
      .string()
      .min(2, {
        message: "Charging station name must be at least 2 characters.",
      })
      .max(64, {
        message: "Charging station name must be at max 64  characters.",
      }),
    brand: z.nativeEnum(ChargingStationBrands),
    username: z
      .string()
      .min(2, {
        message: "Username must be at least 2 characters.",
      })
      .max(64, { message: "Username must be at max 64  characters." }),
    password: z
      .string()
      .min(2, {
        message: "Password must be at least 2 characters.",
      })
      .max(64, { message: "Password must be at max 64  characters." }),
    apiClientId: z.string(),
    apiClientSecret: z.string(),
    smappeeSerialIdMobileApp: z.string().max(64),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      apiClientId: "",
      apiClientSecret: "",
      brand: ChargingStationBrands.SMAPPEE,
      name: "",
      password: "",
      smappeeSerialIdMobileApp: "",
    },
  });

  const chargingStations = api.chargingStations.getChargingStations.useQuery();
  const { mutate } = api.chargingStations.addChargingStation.useMutation({
    onSuccess: async () => {
      const stations = await chargingStations.refetch();
      if (!activeChargingStation?.id && stations.data) {
        const newActiveStation = stations.data[0]!;
        newActiveStation && setActiveChargingStation(newActiveStation);
      }
      router.push("/charging-stations");
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutate({ ...values });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4"></div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name of your charging station</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormDescription>
                  This name is used to help you visualize your charging
                  stations.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="smappeeSerialIdMobileApp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Smappee serial id from mobile app</FormLabel>
                <FormControl>
                  <Input placeholder="Enter service location ID" {...field} />
                </FormControl>
                <FormDescription>
                  To retrieve this value, check the mobile application or the
                  dasbhoard.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ChargingStationBrands).map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Select the brand of the charging station.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`Existing username of your charging station portal (e.g. dashboard.smappee.net)`}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormDescription>
                  Your username will be stored locally on your computer in this
                  container.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`Existing password of your charging station portal (e.g. dashboard.smappee.net)`}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Your password will be stored locally on your computer in this
                  container.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apiClientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Client ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter API Client ID" {...field} />
                </FormControl>
                <FormDescription>
                  Used to make API calls to your charging station.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiClientSecret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Client Secret</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter API Client Secret"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Your API secret will be stored locally on your computer in
                  this container.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
