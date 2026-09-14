const http = require('http');

async function request(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('========================================');
  console.log('🧪 TEST DE NOTICIAS Y CALENDARIO CRITHIT');
  console.log('========================================\n');

  // 1. Listado general de noticias
  const newsRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/news?page=1&limit=5',
    method: 'GET',
  });
  console.log(`✔ Noticias obtenidas (${newsRes.body.total} artículos totales):`);
  newsRes.body.articles.forEach((a) => {
    console.log(`   [${a.category}] ${a.title.slice(0, 60)}... (${a.games?.length || 0} juegos vinculados)`);
  });

  if (!newsRes.body.articles || newsRes.body.articles.length === 0) {
    throw new Error('No se recuperaron artículos de noticias');
  }

  // 2. Noticia destacada
  const featuredRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/news/featured',
    method: 'GET',
  });
  console.log('\n✔ Noticia destacada:', {
    id: featuredRes.body.id,
    title: featuredRes.body.title,
    category: featuredRes.body.category,
    source: featuredRes.body.sourceName,
    juegos: featuredRes.body.games?.map((g) => g.name),
  });

  // 3. Calendario Septiembre 2024
  const calSep2024 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/games/calendar?year=2024&month=9',
    method: 'GET',
  });
  console.log(`\n✔ Calendario Septiembre 2024: ${calSep2024.body.length} juegos encontrados`);
  calSep2024.body.slice(0, 3).forEach((g) => {
    console.log(`   - ${g.name} (${new Date(g.firstReleaseDate).toLocaleDateString('es-ES')})`);
  });

  // 4. Calendario Noviembre 2026 (GTA VI)
  const calNov2026 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/games/calendar?year=2026&month=11',
    method: 'GET',
  });
  console.log(`\n✔ Calendario Noviembre 2026: ${calNov2026.body.length} juego(s) encontrado(s)`);
  calNov2026.body.forEach((g) => {
    console.log(`   - ${g.name} (${new Date(g.firstReleaseDate).toLocaleDateString('es-ES')})`);
  });

  const hasGta = calNov2026.body.some((g) => g.name.includes('Grand Theft Auto VI'));
  if (!hasGta) {
    throw new Error('Grand Theft Auto VI no apareció en Noviembre 2026');
  }
  console.log('✔ Grand Theft Auto VI encontrado exitosamente en el calendario.');

  console.log('\n========================================');
  console.log('🎉 TODOS LOS TESTS DE NOTICIAS Y CALENDARIO PASARON AL 100%');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('❌ Error en test de noticias y calendario:', err);
  process.exit(1);
});
