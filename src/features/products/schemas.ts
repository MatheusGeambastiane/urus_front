import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Informe o nome do produto."),
  pricePaid: z.string().min(1, "Informe o preço de custo."),
  priceToSell: z.string().optional(),
  commission: z
    .string()
    .optional()
    .refine((value) => {
      if (value === undefined || value === "") {
        return true;
      }
      const numeric = Number(value);
      return !Number.isNaN(numeric) && numeric >= 0 && numeric <= 100;
    }, "Informe uma comissão entre 0 e 100."),
  quantity: z
    .string()
    .min(1, "Informe a quantidade.")
    .refine((value) => !Number.isNaN(Number(value)), "Informe um número válido."),
  useType: z.string().min(1, "Selecione o tipo de uso."),
  type: z.string().min(1, "Selecione o tipo."),
  alarmQuantity: z
    .string()
    .min(1, "Informe o limite de estoque.")
    .refine((value) => !Number.isNaN(Number(value)), "Informe um número válido."),
  picture: z
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
}).superRefine((data, ctx) => {
  if (data.useType !== "interno") {
    if (!data.priceToSell || data.priceToSell.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o preço de venda.",
        path: ["priceToSell"],
      });
    }
    if (!data.commission || data.commission.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe a comissão.",
        path: ["commission"],
      });
    }
  }
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
