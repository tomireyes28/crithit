const API_BASE = 'http://localhost:4000/api';
const WEB_BASE = 'http://localhost:3002';

async function runTests() {
  console.log('🧪 Iniciando pruebas automatizadas para Fase 7...\n');
  let passed = 0;
  let total = 0;

  async function assert(desc, fn) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`✅ [${passed}/${total}] ${desc}`);
    } catch (err) {
      console.error(`❌ [${passed}/${total}] Falla en: ${desc}`);
      console.error(`   Detalle: ${err.message}`);
    }
  }

  // 1. Polarizing Games - All
  await assert('GET /api/games/polarizing (todos los debates): HTTP 200', async () => {
    const res = await fetch(`${API_BASE}/games/polarizing?limit=5`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Respuesta inválida');
    if (!data[0].gap || data[0].direction === undefined) throw new Error('Faltan campos de brecha');
    console.log(`   - Top Polarizante: ${data[0].name} (Δ ${data[0].gap} pts, ${data[0].direction})`);
  });

  // 2. Polarizing Games - Critics Favor
  await assert('GET /api/games/polarizing?category=critics_favor: HTTP 200', async () => {
    const res = await fetch(`${API_BASE}/games/polarizing?category=critics_favor&limit=3`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Respuesta inválida');
    const allCriticsFavor = data.every((g) => g.direction === 'CRITICS_FAVOR');
    if (!allCriticsFavor) throw new Error('Filtrado por critics_favor falló');
    console.log(`   - Favorito de Críticos: ${data[0].name} (Crítica: ${data[0].criticScore}, Fans: ${data[0].communityScore})`);
  });

  // 3. Polarizing Games - Community Favor
  await assert('GET /api/games/polarizing?category=community_favor: HTTP 200', async () => {
    const res = await fetch(`${API_BASE}/games/polarizing?category=community_favor&limit=3`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Respuesta inválida');
    const allCommunityFavor = data.every((g) => g.direction === 'COMMUNITY_FAVOR');
    if (!allCommunityFavor) throw new Error('Filtrado por community_favor falló');
    console.log(`   - Favorito de Fans: ${data[0].name} (Fans: ${data[0].communityScore}, Crítica: ${data[0].criticScore})`);
  });

  // 4. Review Comments - List
  await assert('GET /api/reviews/test-rev-id/comments (árbol de hilos): HTTP 200', async () => {
    const res = await fetch(`${API_BASE}/reviews/test-rev-id/comments`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Respuesta no es un arreglo');
    console.log(`   - Comentarios encontrados: ${data.length}`);
    if (data[0]?.replies) {
      console.log(`   - Respuestas anidadas en comentario 1: ${data[0].replies.length}`);
    }
  });

  // 5. Frontend Pages - /games y /reviews
  await assert('GET http://localhost:3002/games (Catálogo con Medidor de Polarización): HTTP 200', async () => {
    const res = await fetch(`${WEB_BASE}/games`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
  });

  await assert('GET http://localhost:3002/reviews (Feed con Hilos de Comentarios): HTTP 200', async () => {
    const res = await fetch(`${WEB_BASE}/reviews`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
  });

  console.log(`\n🎉 RESULTADO FINAL: ${passed}/${total} pruebas superadas.`);
  if (passed !== total) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
