import type { Metadata } from "next";
import { appConfig } from "@/config";
import AppProviders from "@/core/providers/app-providers";
import { themeInitScript } from "@/core/theme/script";
import "./globals.css";

export const metadata: Metadata = {
  title: appConfig.appName,
  description: appConfig.appDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript(),
          }}
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
