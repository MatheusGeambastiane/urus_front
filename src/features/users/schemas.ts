import { z } from "zod";

const meetsAllPasswordRequirements = (password: string) =>
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export const createUserSchema = z
  .object({
    firstName: z.string().min(1, "Informe o primeiro nome."),
    lastName: z.string().optional(),
    email: z.string().email("Informe um e-mail válido."),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    role: z.string().min(1, "Selecione uma função."),
    dateOfBirth: z.string().optional(),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .refine(
        (value) => /[A-Z]/.test(value),
        "Inclua pelo menos uma letra maiúscula.",
      )
      .refine(
        (value) => /[a-z]/.test(value),
        "Inclua pelo menos uma letra minúscula.",
      )
      .refine((value) => /\d/.test(value), "Inclua pelo menos um número.")
      .refine(
        (value) => /[^A-Za-z0-9]/.test(value),
        "Inclua pelo menos um caractere especial.",
      ),
    confirmPassword: z.string().min(1, "Confirme a senha."),
  })
  .superRefine((data, ctx) => {
    const isClient = data.role === "client";
    if (!isClient && !data.lastName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastName"],
        message: "Informe o sobrenome.",
      });
    }
    if (!isClient) {
      if (!data.dateOfBirth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateOfBirth"],
          message: "Use o formato dd/mm/aaaa.",
        });
      } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data.dateOfBirth)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateOfBirth"],
          message: "Use o formato dd/mm/aaaa.",
        });
      }
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "As senhas não conferem.",
      });
    }
    if (!meetsAllPasswordRequirements(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message:
          "A senha deve ter ao menos 8 caracteres, letras maiúsculas, minúsculas, números e caracteres especiais.",
      });
    }
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  firstName: z.string().min(1, "Informe o primeiro nome."),
  lastName: z.string().min(1, "Informe o sobrenome."),
  email: z.string().email("Informe um e-mail válido."),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  role: z.string().min(1, "Selecione uma função."),
  dateOfBirth: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato dd/mm/aaaa."),
  isActive: z.boolean().default(true),
  profilePic: z
    .any()
    .optional()
    .refine(
      (value) =>
        !value ||
        (typeof FileList !== "undefined" &&
          value instanceof FileList &&
          value.length <= 1),
      "Envie apenas um arquivo.",
    ),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

export const professionalProfileSchema = z.object({
  professionalType: z.string().min(1, "Selecione o tipo."),
  cnpj: z.string().min(1, "Informe o CNPJ."),
  commission: z
    .string()
    .min(1, "Informe a comissão.")
    .refine((value) => !Number.isNaN(Number(value)), "Informe um número válido."),
  bio: z.string().optional(),
  services: z.array(z.number()),
});

export type ProfessionalProfileFormValues = z.infer<typeof professionalProfileSchema>;
