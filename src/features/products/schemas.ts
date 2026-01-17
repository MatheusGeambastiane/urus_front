import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Informe o nome do produto."),
  pricePaid: z.string().min(1, "Informe o preço de custo."),
  priceToSell: z.string().min(1, "Informe o preço de venda."),
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
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
