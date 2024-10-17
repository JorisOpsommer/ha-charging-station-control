"use client";

import {
  DashboardIcon,
  LightningBoltIcon,
  ListBulletIcon,
  MixerVerticalIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "~/components/ui/menubar";
import { ActiveChargingStationContext } from "~/contexts/active-charging-station";
import { THEME } from "~/models/theme-enum";
import { routePaths } from "~/utils/route-paths";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isLoadingTheme, setIsLoadingTheme] = useState<boolean>(true);
  const { activeChargingStation } = useContext(ActiveChargingStationContext);

  useEffect(() => {
    if (theme) {
      setIsLoadingTheme(false);
    }
  }, [theme]);

  return (
    <div className="flex items-center justify-between rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <LightningBoltIcon
            strokeWidth={0.15}
            stroke="black"
            color="yellow"
            width={40}
            height={40}
          />
          <Label
            htmlFor="app title"
            className="hidden cursor-pointer font-bold lg:block"
          >
            Charging-station-control
          </Label>
        </Link>

        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Modes</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Link
                  href={routePaths.chargingModes}
                  className="flex items-center gap-1"
                >
                  <MenubarShortcut>
                    <DashboardIcon />
                  </MenubarShortcut>
                  Configure charging modes
                </Link>
              </MenubarItem>
              <MenubarItem>
                <Link
                  href={routePaths.chargingSpeeds}
                  className="flex items-center gap-1"
                >
                  <MenubarShortcut>
                    <MixerVerticalIcon />
                  </MenubarShortcut>
                  Configure charging speeds
                </Link>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Sessions</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Link
                  href={routePaths.chargingSessions.replace(
                    "{id}",
                    activeChargingStation?.id ?? "/not-found",
                  )}
                  className="flex items-center gap-1"
                >
                  <MenubarShortcut>
                    <ListBulletIcon />
                  </MenubarShortcut>
                  List charging sessions
                </Link>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Stations</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Link
                  href={routePaths.chargingStationsList}
                  className="flex items-center gap-1"
                >
                  <MenubarShortcut>
                    <ListBulletIcon />
                  </MenubarShortcut>
                  List charging stations
                </Link>
              </MenubarItem>
              <MenubarItem>
                <Link
                  href={routePaths.addChargingStation}
                  className="flex items-center gap-1"
                >
                  <MenubarShortcut>
                    <PlusIcon />
                  </MenubarShortcut>
                  Add charging station
                </Link>
              </MenubarItem>
              <MenubarItem>
                <Link
                  href={routePaths.setActiveChargingStation}
                  className="flex items-center gap-1"
                >
                  <MenubarShortcut>
                    <UpdateIcon className="mt-1" />
                  </MenubarShortcut>
                  Change active charging station
                </Link>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <div className="g-1 hidden items-center md:flex">
        <Button variant="outline" asChild>
          <Link href="/settings">Settings</Link>
        </Button>
        {isLoadingTheme ? (
          <Button variant="ghost">
            <MoonIcon width={20} height={20} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() =>
              setTheme(theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT)
            }
          >
            {theme === THEME.LIGHT ? (
              <MoonIcon width={20} height={20} />
            ) : (
              <SunIcon width={20} height={20} />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
