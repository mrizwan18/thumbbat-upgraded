import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(1),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().min(1),
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  DEV_FRONTEND_URL: z.string().url(),
  PROD_FRONTEND_URL: z.string().url(),
  NEXT_PUBLIC_FILTER_USERNAME: z.preprocess(
    (val) => (val === "true" ? true : val === "false" ? false : val),
    z.boolean()
  ),
});

export const env = envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  DEV_FRONTEND_URL: process.env.DEV_FRONTEND_URL,
  PROD_FRONTEND_URL: process.env.PROD_FRONTEND_URL,
  NEXT_PUBLIC_FILTER_USERNAME: process.env.NEXT_PUBLIC_FILTER_USERNAME,
});
