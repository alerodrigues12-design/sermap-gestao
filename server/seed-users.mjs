import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';
import { createHash } from 'crypto';

const db = drizzle(process.env.DATABASE_URL);

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

async function seedUsers() {
  console.log('Criando usuários com login/senha...');
  
  // Create admin user (Sheila/Ale)
  const adminHash = hashPassword('sermap2026');
  await db.execute(sql`INSERT INTO users (openId, name, username, password, role, loginMethod) 
    VALUES ('local-admin', 'Administrador', 'admin', ${adminHash}, 'admin', 'local')
    ON DUPLICATE KEY UPDATE password = ${adminHash}, username = 'admin'`);
  console.log('  ✓ Admin criado (user: admin / senha: sermap2026)');

  // Create conselheiro user
  const conselheiroHash = hashPassword('sermap90');
  await db.execute(sql`INSERT INTO users (openId, name, username, password, role, loginMethod)
    VALUES ('local-conselheiro', 'Conselheiro', 'conselheiro', ${conselheiroHash}, 'user', 'local')
    ON DUPLICATE KEY UPDATE password = ${conselheiroHash}, username = 'conselheiro'`);
  console.log('  ✓ Conselheiro criado (user: conselheiro / senha: sermap90)');

  // Set documents password
  const docHash = hashPassword('docs2026');
  await db.execute(sql`INSERT INTO systemConfig (chave, valor)
    VALUES ('senha_documentos', ${docHash})
    ON DUPLICATE KEY UPDATE valor = ${docHash}`);
  console.log('  ✓ Senha dos documentos configurada (senha: docs2026)');

  console.log('\n✅ Seed concluído!');
  console.log('  Admin: admin / sermap2026');
  console.log('  Conselheiro: conselheiro / sermap90');
  console.log('  Documentos: docs2026');
  process.exit(0);
}

seedUsers().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
