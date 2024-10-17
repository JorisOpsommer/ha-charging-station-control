"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
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
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/trpc/react";

export const SystemSettingForm = ({
  systemSetting,
}: {
  systemSetting: {
    id: string;
    key: string;
    numberValue?: number | null;
    stringValue?: string | null;
    description: string | null;
    subDescription?: string | null;
  };
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate } = api.systemSettings.updateSystemSettingByKey.useMutation({
    onSuccess: () => {
      toast({
        title: "Update",
        description: "Successfully changed the system setting.",
      });
    },
  });

  const formSchema = z.object({
    numberValue: z.number(),
    stringValue: z.string().min(2).max(512),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberValue: systemSetting.numberValue ?? 0,
      stringValue: systemSetting.stringValue ?? "",
    },
  });

  const onSubmit = (values: { numberValue?: number; stringValue?: string }) => {
    mutate({
      key: systemSetting.key,
      numberValue: values.numberValue,
      stringValue: values.stringValue,
    });
    router.refresh();
  };

  const [inputValue, setInputValue] = useState<number | string>(
    systemSetting.stringValue ?? systemSetting.numberValue ?? 0,
  );

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      void form.trigger("numberValue").then((isValid) => {
        if (
          isValid &&
          systemSetting.numberValue !== null &&
          systemSetting.numberValue !== inputValue
        ) {
          onSubmit({ numberValue: inputValue as number });
        }
      });

      void form.trigger("stringValue").then((isValid) => {
        if (
          isValid &&
          systemSetting.stringValue !== null &&
          systemSetting.stringValue !== inputValue
        ) {
          onSubmit({ stringValue: inputValue as string });
        }
      });
    }, 500);

    debouncedUpdate();
    return () => {
      debouncedUpdate.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 py-4">
          {systemSetting.numberValue !== null && (
            <FormField
              control={form.control}
              name="numberValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{systemSetting.description}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        setInputValue(newValue);
                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {systemSetting.subDescription}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {systemSetting.stringValue !== null && (
            <FormField
              control={form.control}
              name="stringValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{systemSetting.description}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setInputValue(newValue);
                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {systemSetting.subDescription}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </form>
    </Form>
  );
};
