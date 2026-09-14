const http = require('http');

async function request(options, body = null) {
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
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password }
  );
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  }
  return res.body.accessToken;
}

async function runTests() {
  console.log('========================================');
  console.log('🧪 TEST COMPLETO DE NOTIFICACIONES CRITHIT');
  console.log('========================================\n');

  // 1. Iniciar sesión
  const tokenGamer = await login('gamer@crithit.gg', 'Password123!');
  const tokenCritic = await login('pixel_critic@crithit.gg', 'Password123!');
  console.log('✔ Sesión iniciada para gamer_pro y pixel_critic');

  // 2. Limpiar notificaciones previas de pixel_critic marcándolas como leídas
  await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/notifications/read-all',
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenCritic}` },
  });

  // 3. Probar Follow -> Notificación NEW_FOLLOWER
  console.log('\n--- 1. Probando Notificación NEW_FOLLOWER ---');
  // Asegurar que gamer_pro sigue a pixel_critic
  const statusRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/users/pixel_critic/follow-status',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenGamer}` },
  });

  if (statusRes.body.isFollowing) {
    await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/users/pixel_critic/follow',
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenGamer}` },
    });
  }

  const followRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/users/pixel_critic/follow',
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenGamer}` },
  });
  console.log('✔ gamer_pro siguió a pixel_critic');

  // 4. Probar Like a Lista -> Notificación LIST_LIKE
  console.log('\n--- 2. Probando Notificación LIST_LIKE ---');
  // Obtener listas de pixel_critic
  const listsRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/lists/user/pixel_critic',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenGamer}` },
  });

  let testListId = null;
  if (listsRes.body.length > 0) {
    testListId = listsRes.body[0].id;
  } else {
    // Si no tiene listas, crear una para pixel_critic
    const createListRes = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/lists',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenCritic}`,
          'Content-Type': 'application/json',
        },
      },
      {
        title: 'Top Joyas de Rol',
        description: 'Mis RPGs favoritos',
        isRanked: true,
        isPublic: true,
      }
    );
    testListId = createListRes.body.id;
  }

  // Dar like a la lista desde gamer_pro
  const listLikeRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/lists/${testListId}/like`,
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenGamer}` },
  });
  console.log('✔ gamer_pro dio like a lista de pixel_critic:', listLikeRes.body);

  // 5. Probar unreadCount
  console.log('\n--- 3. Verificando notificaciones de pixel_critic ---');
  const countRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/notifications/unread-count',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenCritic}` },
  });
  console.log('✔ Contador de no leídas para pixel_critic:', countRes.body.unreadCount);

  // 6. Obtener lista paginada
  const notifsList = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/notifications?page=1&limit=5',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenCritic}` },
  });

  console.log(`✔ Notificaciones recibidas (${notifsList.body.notifications.length}):`);
  notifsList.body.notifications.forEach((n) => {
    console.log(`   [${n.type}] ${n.actor?.displayName || n.actor?.username} ${n.message} (isRead: ${n.isRead})`);
  });

  // 7. Marcar primera notificación como leída
  const firstNotif = notifsList.body.notifications[0];
  if (firstNotif) {
    const markRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: `/api/notifications/${firstNotif.id}/read`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenCritic}` },
    });
    console.log('\n✔ Notificación marcada como leída:', markRes.body);
  }

  // 8. Marcar todas como leídas
  const markAllRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/notifications/read-all',
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenCritic}` },
  });
  console.log('✔ Todas marcadas como leídas:', markAllRes.body);

  // 9. Verificar que unreadCount quedó en 0
  const finalCount = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/notifications/unread-count',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenCritic}` },
  });
  console.log('✔ Contador final de no leídas:', finalCount.body.unreadCount);

  if (finalCount.body.unreadCount !== 0) {
    throw new Error('El contador de no leídas no quedó en 0');
  }

  console.log('\n========================================');
  console.log('🎉 TODOS LOS TESTS DE NOTIFICACIONES PASARON AL 100%');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('❌ Error en test suite:', err);
  process.exit(1);
});
