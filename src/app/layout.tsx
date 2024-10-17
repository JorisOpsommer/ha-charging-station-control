import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { ThemeProvider } from "~/components/themes/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { ActiveChargingStationHandler } from "~/contexts/active-charging-station";
import { TRPCReactProvider } from "~/trpc/react";
import Navbar from "../components/custom/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Charging station control",
  description: "Control your charging station with homeassistant",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <ActiveChargingStationHandler>
              <Navbar />
              <div className="p-4">{children}</div>
              <Toaster />
            </ActiveChargingStationHandler>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
