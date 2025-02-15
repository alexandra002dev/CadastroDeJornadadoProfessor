import * as z from "zod";

export const jornadaSchema = z.object({
  professor: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  turma: z.string().min(1, "Selecione uma turma"),
  trimestre: z.number().min(1).max(4),
  ano: z.number().min(2024).max(2100),
});

export type JornadaFormData = z.infer<typeof jornadaSchema>;
