const API_BASE = 'http://localhost:4000/api';
const WEB_BASE = 'http://localhost:3002';

async function runTests() {
  console.log('🧪 Iniciando pruebas automatizadas para Fase 8 (Herramientas del Gamer & Viralidad Anual)...\n');
  let passed = 0;
  let total = 0;

  async function assert(desc, fn) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`✅ [${passed}/${total}] ${desc}`);
    } catch (err) {
      console.error(`❌ [${passed}/${total}] Falló: ${desc}`);
      console.error(`   Detalle: ${err.message}`);
    }
  }

  // 1. Wrapped API Endpoint
  await assert('GET /api/users/:username/wrapped: HTTP 200 con métricas anuales completas', async () => {
    const res = await fetch(`${API_BASE}/users/tomireyes/wrapped?year=2024`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.year || data.year !== 2024) throw new Error('Año inválido en respuesta');
    if (typeof data.totalGamesPlayed !== 'number' || typeof data.totalHoursPlayed !== 'number') {
      throw new Error('Faltan contadores de juegos u horas');
    }
    if (!data.goty || !data.goty.name) throw new Error('Falta GOTY del usuario');
    if (!Array.isArray(data.topGenres) || data.topGenres.length === 0) throw new Error('Faltan top géneros');
    if (!Array.isArray(data.monthlyActivity) || data.monthlyActivity.length === 0) throw new Error('Falta actividad mensual');
    if (!data.gamerPersona || !data.gamerPersona.title) throw new Error('Falta arquetipo de jugador');
    console.log(`   - Usuario: @${data.username} (${data.displayName})`);
    console.log(`   - Horas jugadas: ${data.totalHoursPlayed}h en ${data.totalGamesPlayed} juegos`);
    console.log(`   - GOTY Personal: ${data.goty.name} (Puntaje: ${data.goty.score}/100)`);
    console.log(`   - Arquetipo: ${data.gamerPersona.title} (${data.gamerPersona.badgeEmoji})`);
  });

  // 2. Auth Login para probar endpoints protegidos de importación
  let authToken = null;
  await assert('POST /api/auth/login: Autenticación para pruebas de importación', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'gamer@crithit.gg', password: 'Password123!' }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.accessToken) throw new Error('No se recibió token de acceso');
    authToken = data.accessToken;
    console.log(`   - Token obtenido para usuario: ${data.user?.username || 'gamer'}`);
  });

  // 3. Steam Sync Endpoint
  await assert('POST /api/users/import/steam: Sincronización exitosa con biblioteca Steam', async () => {
    if (!authToken) throw new Error('Falta token de autenticación');
    const res = await fetch(`${API_BASE}/users/import/steam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        steamId: '76561198031234567',
      }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.success || data.importedCount <= 0) throw new Error('Importación de Steam falló');
    console.log(`   - Juegos sincronizados: ${data.importedCount}`);
    console.log(`   - Horas totales registradas: ${data.totalPlaytimeHours}h`);
  });

  // 4. CSV Import Endpoint (con mapeo de notas 0-100)
  await assert('POST /api/users/import/csv: Importación de CSV y mapeo de estrellas a 0-100', async () => {
    if (!authToken) throw new Error('Falta token de autenticación');
    const sampleRows = [
      { title: 'The Legend of Zelda: Tears of the Kingdom', rating: '4.5', hours: 75, status: 'COMPLETED' },
      { title: 'Metroid Prime Remastered', rating: '5.0', hours: 18, status: 'COMPLETED' },
      { title: 'Cyberpunk 2077: Phantom Liberty', rating: '4.0', hours: 35, status: 'COMPLETED' },
      { title: 'Super Mario Bros. Wonder', rating: '3.5', hours: 12, status: 'COMPLETED' },
    ];

    const res = await fetch(`${API_BASE}/users/import/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        format: 'backloggd',
        rows: sampleRows,
      }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.success || data.importedCount !== sampleRows.length) throw new Error('Conteo de importación incorrecto');
    // Verificar que 4.5 se convirtió a 90 y 5.0 a 100
    if (data.preview[0].score !== 90) throw new Error(`4.5★ debió convertirse en 90 pts, recibido: ${data.preview[0].score}`);
    if (data.preview[1].score !== 100) throw new Error(`5.0★ debió convertirse en 100 pts, recibido: ${data.preview[1].score}`);
    console.log(`   - Registros importados: ${data.importedCount}`);
    console.log(`   - Mapeo 4.5★ -> ${data.preview[0].score} pts, 5.0★ -> ${data.preview[1].score} pts`);
  });

  // 5. Frontend - CritHit Wrapped (/profile/:username/wrapped)
  await assert('GET http://localhost:3002/profile/tomireyes/wrapped: Experiencia interactiva de Historias Wrapped', async () => {
    const res = await fetch(`${WEB_BASE}/profile/tomireyes/wrapped`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const html = await res.text();
    if (!html.includes('Wrapped') && !html.includes('wrapped')) throw new Error('No se encontró contenido Wrapped en la página');
    console.log(`   - Página renderizada correctamente (${html.length} bytes)`);
  });

  // 6. Frontend - Tier List Maker (/tier-list/create)
  await assert('GET http://localhost:3002/tier-list/create: Creador interactivo de Tier Lists', async () => {
    const res = await fetch(`${WEB_BASE}/tier-list/create`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const html = await res.text();
    if (!html.includes('Tier') && !html.includes('tier')) throw new Error('No se encontró contenido de Tier List');
    console.log(`   - Página renderizada correctamente (${html.length} bytes)`);
  });

  // 7. Frontend - Import Settings (/settings/import)
  await assert('GET http://localhost:3002/settings/import: Centro de importación de Steam y CSV', async () => {
    const res = await fetch(`${WEB_BASE}/settings/import`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const html = await res.text();
    if (!html.includes('Importar') && !html.includes('Steam')) throw new Error('No se encontró contenido de Importación');
    console.log(`   - Página renderizada correctamente (${html.length} bytes)`);
  });

  console.log(`\n🎉 RESULTADO FINAL FASE 8: ${passed}/${total} pruebas superadas.`);
  if (passed !== total) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
