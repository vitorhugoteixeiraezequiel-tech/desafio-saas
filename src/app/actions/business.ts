"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { saveBusiness } from "@/lib/db";
import { businessSchema, fieldErrors, type FormState } from "@/lib/validation";

export async function updateBusiness(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = businessSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  await saveBusiness({ user_id: user.id, ...parsed.data });
  revalidatePath("/", "layout");
  return { success: "Informações do negócio salvas. A IA já vai usar os novos dados." };
}
