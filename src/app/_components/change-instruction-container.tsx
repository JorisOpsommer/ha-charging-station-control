"use client";

import { type inferProcedureOutput } from "@trpc/server";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useToast } from "~/components/ui/use-toast";
import { HA_CHARGE_INSTRUCTION } from "~/models/ha-charge-instruction-enum";
import { type AppRouter } from "~/server/api/root";
import { api } from "~/trpc/react";

export const ChangeInstructionContainer = ({
  session,
}: {
  session?: inferProcedureOutput<
    AppRouter["chargingSessions"]["getLatestSessionFromActiveChargingStation"]
  >;
}) => {
  HA_CHARGE_INSTRUCTION.PAUSED;
  const [currentInstruction, setCurrentInstruction] =
    useState<HA_CHARGE_INSTRUCTION>(
      session?.instructionStateChanges[0]?.state as HA_CHARGE_INSTRUCTION,
    );
  const { toast } = useToast();
  const router = useRouter();
  const { mutate } = api.chargingSessions.addInstructionState.useMutation({
    onSuccess: () => {
      toast({
        title: "Update",
        description: "Update instruction successfully.",
      });
    },
  });

  const updateChargingState = (state: HA_CHARGE_INSTRUCTION) => {
    if (session?.id) {
      setCurrentInstruction(state);
      mutate({ sessionId: session.id, state });
      router.refresh();
    }
  };
  return (
    <Card className="xl:max-w-2xl">
      <CardHeader>
        <CardTitle>Charging instruction</CardTitle>
        <CardDescription>
          Change your instruction by selecting any of the buttons below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <MultipleButton
            buttonInstruction={HA_CHARGE_INSTRUCTION.PAUSED}
            title="PAUSED"
            currentInstruction={currentInstruction}
            onChange={updateChargingState}
          />
          <MultipleButton
            buttonInstruction={HA_CHARGE_INSTRUCTION.SUN}
            title="SUN"
            currentInstruction={currentInstruction}
            onChange={updateChargingState}
          />
          <MultipleButton
            buttonInstruction={HA_CHARGE_INSTRUCTION.SLOW}
            title="SLOW"
            currentInstruction={currentInstruction}
            onChange={updateChargingState}
          />
          <MultipleButton
            buttonInstruction={HA_CHARGE_INSTRUCTION.TURBO}
            title="TURBO"
            currentInstruction={currentInstruction}
            onChange={updateChargingState}
          />
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm italic">
          Changing your charging mode will take up to 1 minute to have effect.
        </p>
      </CardFooter>
    </Card>
  );
};

const MultipleButton = ({
  currentInstruction,
  buttonInstruction,
  title,
  onChange,
}: {
  currentInstruction: HA_CHARGE_INSTRUCTION;
  buttonInstruction: HA_CHARGE_INSTRUCTION;
  title: string;
  onChange: (instruction: HA_CHARGE_INSTRUCTION) => void;
}) => {
  return (
    <Button
      variant="outline"
      className={`${currentInstruction === buttonInstruction && "bg-primary"}`}
      onClick={() => onChange(buttonInstruction)}
    >
      {title}
    </Button>
  );
};
