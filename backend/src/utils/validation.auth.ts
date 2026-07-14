import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(120),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Usuário deve ter pelo menos 3 caracteres")
    .max(40)
    .regex(/^[a-z0-9_.]+$/, "Use apenas letras minúsculas, números, ponto e underline"),
  password: z.string().min(4, "Senha deve ter pelo menos 4 caracteres").max(128),
  // Auto-registro só pode criar viewer ou editor — admin é criado via seed/admin
  role: z.enum(["VIEWER", "EDITOR"]).default("VIEWER"),
});

export const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, "Informe o usuário"),
  password: z.string().min(1, "Informe a senha"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
