import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Skull King Score Tracker",
  description: "Track scores for the Skull King card game",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Analytics />
      {children}
    </>
  );
}
