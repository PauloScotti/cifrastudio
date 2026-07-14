import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9_.]+$/, "Use apenas letras minúsculas, números, ponto e underline"),
  password: z.string().min(4).max(128),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});

export const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});
