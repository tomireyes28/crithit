const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('1. Autenticando usuario...');
  let loginRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'gamer@crithit.gg', password: 'Password123!' });

  const token = loginRes.data.accessToken;
  console.log('Token obtenido:', token ? 'OK' : 'FAIL');

  console.log('2. Obteniendo juego The Witcher 3...');
  const gameRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/games/the-witcher-3-wild-hunt',
    method: 'GET',
  });
  const gameId = gameRes.data.id;

  console.log('3. Registrando partida como PLAYING (15h)...');
  const logRes1 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/play-logs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }, {
    gameId,
    status: 'PLAYING',
    platform: 'PC',
    hoursPlayed: 15,
    notes: 'Iniciando aventura en Huerto Blanco.',
  });
  console.log('Log 1 creado:', logRes1.status, logRes1.data.status, logRes1.data.hoursPlayed + 'h');

  console.log('4. Verificando estado activo para el juego...');
  const statusRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/play-logs/game/${gameId}/status`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  console.log('Estado activo actual:', statusRes.data.status);

  console.log('5. Registrando partida como MASTERED (120h)...');
  const logRes2 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/play-logs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }, {
    gameId,
    status: 'MASTERED',
    platform: 'PC',
    hoursPlayed: 120,
    isReplay: false,
    notes: '¡100% completado! Todos los contratos de brujo y logros desbloqueados.',
  });
  console.log('Log 2 creado:', logRes2.status, logRes2.data.status, logRes2.data.hoursPlayed + 'h');

  console.log('6. Consultando diario personal (/play-logs/me)...');
  const myDiaryRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/play-logs/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  console.log('Total de entradas:', myDiaryRes.data.data.length);
  console.log('Estadísticas totales:');
  console.log(' - Horas totales:', myDiaryRes.data.stats.totalHours);
  console.log(' - Completados:', myDiaryRes.data.stats.completedCount);
  console.log(' - 100% Mastered:', myDiaryRes.data.stats.statusCounts.MASTERED);
}

main().catch(console.error);
