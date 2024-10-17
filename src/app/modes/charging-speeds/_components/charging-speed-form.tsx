"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useToast } from "~/components/ui/use-toast";
import { type HA_CHARGE_INSTRUCTION } from "~/models/ha-charge-instruction-enum";
import { api } from "~/trpc/react";

enum UNIT {
  PERCENTAGE = "PERCENTAGE",
  AMPERE = "AMPERE",
}

export default function ChargingSpeedForm({
  chargeInstruction,
  unit,
  value,
  id,
}: {
  chargeInstruction: HA_CHARGE_INSTRUCTION;
  unit: UNIT;
  value: number | string;
  id: string;
}) {
  const formSchema = z.object({
    unit: z.nativeEnum(UNIT),
    value: z.union([z.string(), z.number().min(6)]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit,
      value,
    },
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate } = api.chargingSpeeds.updateChargingSpeed.useMutation({
    onSuccess: async () => {
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: ["chargingSpeeds.getChargingSpeeds"],
      });
      toast({
        title: "Update",
        description: "Successfully updated charging speeds",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate({ ...values, id });
  }

  const [formInputValue, setFormInputValue] = useState<number | string>(value);
  const [formSelectUnit, setFormSelectUnit] = useState<UNIT>(unit);

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      if (formInputValue !== value || formSelectUnit !== unit) {
        void form.trigger().then((isValid) => {
          if (isValid)
            onSubmit({ unit: formSelectUnit, value: formInputValue });
        });
      }
    }, 500);
    debouncedUpdate();
    return () => {
      debouncedUpdate.cancel();
    };
  }, [formInputValue, formSelectUnit]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4"></div>
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(event: UNIT) => {
                      field.onChange(event);
                      setFormSelectUnit(event);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your charging unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(UNIT).map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Select to charge either in percentage or number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Value of speed to charge your car. e.g. '6'"
                    {...field}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      field.onChange(Number(newValue));
                      setFormInputValue(Number(newValue));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Your charging value, which will be used in combination of the
                  unit. e.g. charge at a speed of 100 percent
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
