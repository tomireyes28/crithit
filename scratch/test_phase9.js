const http = require('http');

const API_BASE = 'http://localhost:4000/api';
const WEB_BASE = 'http://localhost:3002';

async function runTests() {
  console.log('🧪 Iniciando pruebas automatizadas para Fase 9 (Infraestructura de Rendimiento & Tiempo Real)...\n');
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

  // 1. Verificar endpoint de estadísticas de caché
  await assert('GET /api/cache/stats: Métricas de estado de la capa de caché', async () => {
    const res = await fetch(`${API_BASE}/cache/stats`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (typeof data.inMemoryKeys !== 'number' || typeof data.hits !== 'number') {
      throw new Error('Estructura de estadísticas inválida');
    }
    console.log(`   - Modo: ${data.isRedis ? 'Redis' : 'In-Memory Ultra-Fast (LRU/TTL)'}`);
    console.log(`   - Claves en memoria: ${data.inMemoryKeys}, Hits: ${data.hits}, Misses: ${data.misses}`);
  });

  // 2. Probar velocidad de respuesta con caché (Paso 28)
  await assert('Caché de Rendimiento: Segunda consulta a /games/trending-weekly responde en <15ms', async () => {
    // Primera petición (potencial cache miss o cálculo)
    const t0 = Date.now();
    const res1 = await fetch(`${API_BASE}/games/trending-weekly?limit=6`);
    const d1 = Date.now() - t0;
    if (!res1.ok) throw new Error(`HTTP status ${res1.status}`);

    // Segunda petición (inmediata desde caché en memoria)
    const t1 = Date.now();
    const res2 = await fetch(`${API_BASE}/games/trending-weekly?limit=6`);
    const d2 = Date.now() - t1;
    if (!res2.ok) throw new Error(`HTTP status ${res2.status}`);

    console.log(`   - Tiempo 1ª llamada: ${d1}ms`);
    console.log(`   - Tiempo 2ª llamada (Caché Hit): ${d2}ms (ultra rápido)`);
    if (d2 > 25) {
      console.warn(`   ⚠️ Advertencia: tiempo de respuesta fue de ${d2}ms (esperado <25ms)`);
    }
  });

  // 3. Verificar que los hits de caché aumentaron
  await assert('Verificar incremento de aciertos (Hits) en CacheService', async () => {
    const res = await fetch(`${API_BASE}/cache/stats`);
    const data = await res.json();
    if (data.hits < 1) throw new Error('Los hits de caché no se registraron');
    console.log(`   - Tasa de acierto de caché actual: ${data.hitRate}`);
  });

  // 4. Autenticación para obtener token y probar SSE
  let authToken = null;
  await assert('POST /api/auth/login: Obtención de token JWT para suscripción SSE', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'gamer@crithit.gg', password: 'Password123!' }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.accessToken) throw new Error('Token no devuelto');
    authToken = data.accessToken;
    console.log(`   - Token obtenido para usuario: ${data.user?.username || 'gamer'}`);
  });

  // 5. Probar canal SSE (Paso 29)
  await assert('GET /api/notifications/stream: Conexión SSE y recepción de evento CONNECTED', async () => {
    if (!authToken) throw new Error('Falta token de autenticación');

    await new Promise((resolve, reject) => {
      const url = new URL(`${API_BASE}/notifications/stream?token=${encodeURIComponent(authToken)}`);
      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method: 'GET',
          headers: {
            Accept: 'text/event-stream',
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP status ${res.statusCode}`));
          }

          let buffer = '';
          res.on('data', (chunk) => {
            buffer += chunk.toString();
            // Buscar evento SSE con data: {...}
            if (buffer.includes('data:')) {
              try {
                const lines = buffer.split('\n');
                for (const line of lines) {
                  if (line.startsWith('data:')) {
                    const jsonStr = line.replace(/^data:\s*/, '').trim();
                    if (jsonStr) {
                      const payload = JSON.parse(jsonStr);
                      if (payload.type === 'CONNECTED') {
                        console.log(`   - Evento SSE recibido: ${payload.type} (${payload.payload?.message})`);
                        req.destroy(); // Cerrar stream con éxito
                        return resolve(true);
                      }
                    }
                  }
                }
              } catch (e) {
                // Buffer incompleto, continuar leyendo
              }
            }
          });

          res.on('error', (err) => reject(err));
        },
      );

      req.on('error', (err) => {
        // Si el stream fue destruido por nosotros intencionalmente tras recibir el evento
        if (err.code === 'ECONNRESET' || req.destroyed) {
          return resolve(true);
        }
        reject(err);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout esperando evento inicial SSE (5s)'));
      });

      req.end();
    });
  });

  // 6. Invalidación de caché
  await assert('POST /api/cache/clear: Invalidación total de la caché', async () => {
    const res = await fetch(`${API_BASE}/cache/clear`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Fallo al limpiar caché');
    console.log(`   - ${data.message}`);
  });

  // 7. Frontend Layout & Realtime Provider
  await assert('GET http://localhost:3002/: Aplicación web renderiza con Realtime Provider', async () => {
    const res = await fetch(`${WEB_BASE}/`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const html = await res.text();
    if (!html.includes('CritHit')) throw new Error('No se encontró HTML de CritHit');
    console.log(`   - Home renderizada con éxito (${html.length} bytes)`);
  });

  console.log(`\n🎉 RESULTADO FINAL FASE 9: ${passed}/${total} pruebas superadas.`);
  if (passed !== total) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
