const { PrismaClient } = require('@prisma/client');

async function test(url) {
  const p = new PrismaClient({ datasources: { db: { url } } });
  try {
    await p.$connect();
    console.log('SUCCESS:', url.split('@')[1]);
    await p.$disconnect();
    return true;
  } catch (err) {
    console.log('FAIL:', url.split('@')[1], err.message.slice(0, 80));
    await p.$disconnect().catch(() => {});
    return false;
  }
}

async function main() {
  const urls = [
    'postgresql://postgres.cmsaduqpedfbvihvpish:gHAwWpc3TN5Rn7Sx@aws-0-us-east-2.pooler.supabase.com:5432/postgres',
    'postgresql://postgres.cmsaduqpedfbvihvpish:gHAwWpc3TN5Rn7Sx@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
    'postgresql://postgres.cmsaduqpedfbvihvpish:gHAwWpc3TN5Rn7Sx@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
    'postgresql://postgres.cmsaduqpedfbvihvpish:gHAwWpc3TN5Rn7Sx@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    'postgresql://postgres:gHAwWpc3TN5Rn7Sx@db.cmsaduqpedfbvihvpish.supabase.co:5432/postgres',
  ];

  for (const u of urls) {
    await test(u);
  }
}

main();
