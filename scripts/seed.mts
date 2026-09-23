// Cria contas e dados de demonstração para testar o sistema rapidamente.
// Uso: npm run seed
import { seedDemo } from "../src/lib/db.ts";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../src/lib/demo-data.ts";

await seedDemo();

console.log("Contas de demonstração prontas:");
for (const acc of DEMO_ACCOUNTS) console.log(`  ${acc.email} (${acc.role})`);
console.log(`Senha de todas: ${DEMO_PASSWORD}`);
