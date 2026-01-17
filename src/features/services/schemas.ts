import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(1, "Informe o nome do serviço."),
  price: z.string().min(1, "Informe o preço."),
  category: z.string().min(1, "Selecione a categoria."),
  duration: z.string().min(1, "Informe a duração."),
  isActive: z.boolean().default(true),
  productUsage: z
    .array(
      z.object({
        product: z.number().min(1, "Selecione um produto."),
        quantity_used: z.number().min(1, "Quantidade deve ser positiva."),
        product_name: z.string().optional(),
      }),
    )
    .optional(),
});

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>;
