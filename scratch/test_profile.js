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
  const loginRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'gamer@crithit.gg', password: 'Password123!' });

  const token = loginRes.data.accessToken;
  console.log('Token obtenido:', token ? 'OK' : 'FAIL');

  console.log('2. Obteniendo juegos para los favoritos...');
  const gamesRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/games?limit=4',
    method: 'GET',
  });
  const games = gamesRes.data.data;
  console.log('Juegos obtenidos:', games.map(g => g.name));

  console.log('3. Configurando Favorite Four (posiciones 1 a 4)...');
  const favPayload = games.slice(0, 4).map((g, idx) => ({
    gameId: g.id,
    position: idx + 1,
  }));

  const favRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/users/favorites',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }, { favorites: favPayload });

  console.log('Favoritos guardados:', favRes.status, favRes.data.length, 'juegos');

  console.log('4. Actualizando biografía del perfil...');
  const profileRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/users/profile',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }, {
    displayName: 'Gamer Pro',
    bio: 'Fanático de los RPGs de mundo abierto y las aventuras de acción en PC y PS5.',
    location: 'Buenos Aires, Argentina',
    website: 'https://crithit.gg',
  });
  console.log('Perfil actualizado:', profileRes.status, profileRes.data.bio);

  console.log('5. Consultando perfil público completo (/api/users/gamer_pro)...');
  const publicProfile = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/users/gamer_pro',
    method: 'GET',
  });

  console.log('Usuario:', publicProfile.data.user.displayName, `@${publicProfile.data.user.username}`);
  console.log('Favorite Four:', publicProfile.data.favoriteGames.map(f => `#${f.position} ${f.game.name}`));
  console.log('Métricas:');
  console.log(' - Reseñas:', publicProfile.data.stats.totalReviews);
  console.log(' - Nota media:', publicProfile.data.stats.averageScore);
  console.log(' - Horas totales:', publicProfile.data.stats.totalHoursPlayed);
  console.log(' - Bucket 91-100:', publicProfile.data.stats.scoreDistribution.find(b => b.range === '91-100')?.count);
}

main().catch(console.error);
