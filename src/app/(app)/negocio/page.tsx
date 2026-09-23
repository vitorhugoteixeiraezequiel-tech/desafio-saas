import { BusinessForm } from "@/components/business-form";
import { requireUser } from "@/lib/dal";
import { getBusiness } from "@/lib/db";

export const metadata = { title: "Meu negócio — Respondi" };

export default async function BusinessPage() {
  const user = await requireUser();
  const business = getBusiness(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu negócio</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tudo o que a IA sabe sobre a sua empresa vem daqui. Quanto mais completo, melhores as respostas.
        </p>
      </div>
      <BusinessForm
        initial={
          business && {
            name: business.name,
            segment: business.segment,
            tone: business.tone,
            info: business.info,
          }
        }
      />
    </div>
  );
}
