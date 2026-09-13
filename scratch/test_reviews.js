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
  console.log('1. Registrando o logueando usuario de prueba...');
  let loginRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'gamer@crithit.gg', password: 'Password123!' });

  if (loginRes.status !== 200) {
    // Registrar si no existe
    loginRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: 'gamer@crithit.gg',
      password: 'Password123!',
      username: 'gamer_pro',
      displayName: 'Gamer Pro',
    });
  }

  const token = loginRes.data.accessToken;
  console.log('Usuario autenticado. Token obtenido:', token ? 'OK' : 'FAIL');

  // Buscar ID de The Witcher 3
  console.log('2. Obteniendo juego The Witcher 3...');
  const gameRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/games/the-witcher-3-wild-hunt',
    method: 'GET',
  });
  const gameId = gameRes.data.id;
  console.log('Game ID:', gameId, 'Score anterior:', gameRes.data.communityScore);

  // Crear reseña con nota 95
  console.log('3. Publicando reseña con nota 95...');
  const reviewRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/reviews',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }, {
    gameId,
    score: 95,
    title: 'Una de las mayores obras maestras del RPG',
    body: 'La historia de Geralt y Ciri, las misiones secundarias como el Barón Sanguinario y las expansiones hacen de este título una experiencia legendaria.',
    platform: 'PC',
    playtimeAtReview: 120,
    containsSpoilers: false,
    recommends: true,
  });

  console.log('Reseña creada:', reviewRes.status, reviewRes.data.title);
  const reviewId = reviewRes.data.id;

  // Toggle like
  console.log('4. Probando toggle like en la reseña...');
  const likeRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/reviews/${reviewId}/like`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  console.log('Like response:', likeRes.status, likeRes.data);

  // Consultar ficha del juego para verificar que la reseña aparece
  console.log('5. Verificando ficha actualizada del juego...');
  const updatedGameRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/games/the-witcher-3-wild-hunt',
    method: 'GET',
  });
  console.log('Nuevo Community Score:', updatedGameRes.data.communityScore);
  console.log('Reseñas en juego:', updatedGameRes.data.reviews.length);
  console.log('Título primera reseña:', updatedGameRes.data.reviews[0]?.title);
}

main().catch(console.error);
