import { z } from "zod";

export const createItemDtoSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다."),
});

export const updateItemDtoSchema = z.object({
  name: z.string().min(1).optional(),
  memo: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  isCompleted: z.boolean().optional(),
});

export const itemSchema = z.object({
  id: z.number(),
  tenantId: z.string(),
  name: z.string(),
  memo: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isCompleted: z.boolean().default(false),
});

export type CreateItemDto = z.infer<typeof createItemDtoSchema>;
export type UpdateItemDto = z.infer<typeof updateItemDtoSchema>;
export type Item = z.infer<typeof itemSchema>;