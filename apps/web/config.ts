import z from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url(),
});

const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

export const appConfig = {
  appName: "Finalist",
  appDescription: "Competitive gaming platform.",
  appUrl: env.NEXT_PUBLIC_APP_URL,
  apiBaseUrl: env.NEXT_PUBLIC_API_URL,
};
