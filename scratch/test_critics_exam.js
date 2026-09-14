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
  console.log('🧪 TEST COMPLETO DEL SISTEMA DE CRÍTICOS');
  console.log('========================================\n');

  // 1. Iniciar sesión con gamer_pro
  const token = await login('gamer@crithit.gg', 'Password123!');
  console.log('✔ Sesión iniciada con éxito para gamer_pro');

  // 2. Consultar estado de crítico inicial
  const statusRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/critics/status',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('✔ Estado inicial del usuario:', statusRes.body);

  // 3. Iniciar examen
  const startRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/critics/exam/start',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    { examType: 'BASIC_CRITIC' }
  );

  console.log(`✔ Examen iniciado: ${startRes.body.totalQuestions} preguntas recibidas (Límite: ${startRes.body.timeLimitMinutes} min)`);

  const questions = startRes.body.questions;
  if (!questions || questions.length === 0) {
    throw new Error('No se recibieron preguntas al iniciar el examen');
  }

  // Verificar seguridad: que no se filtren respuestas correctas
  const leakedAnswer = questions.find((q) => q.correctOption !== undefined || q.explanation !== undefined);
  if (leakedAnswer) {
    throw new Error('¡FALLO DE SEGURIDAD! El endpoint startExam está filtrando las respuestas correctas.');
  }
  console.log('✔ Verificación de seguridad superada: Ninguna pregunta expone la respuesta correcta.');

  // 4. Enviar respuestas: usaremos la base de datos para responder correctamente el 100%
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const answers = [];
  for (const q of questions) {
    const dbQ = await prisma.examQuestion.findUnique({ where: { id: q.id } });
    answers.push({
      questionId: q.id,
      selectedOption: dbQ ? dbQ.correctOption : 0,
    });
  }
  await prisma.$disconnect();

  const submitRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/critics/exam/submit',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    {
      answers,
      timeSpentSeconds: 340,
    }
  );

  console.log('\n✔ Resultado del examen evaluado:', {
    passed: submitRes.body.passed,
    score: submitRes.body.score,
    correctAnswers: submitRes.body.correctAnswers,
    totalQuestions: submitRes.body.totalQuestions,
    tierAwarded: submitRes.body.tierAwarded,
    badgeAwarded: submitRes.body.badgeAwarded,
  });

  if (!submitRes.body.passed || submitRes.body.score < 90) {
    throw new Error(`El examen no fue calificado con éxito: score=${submitRes.body.score}`);
  }

  // 5. Verificar estado actualizado del usuario
  const updatedStatusRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/critics/status',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('\n✔ Estado actualizado del usuario:', updatedStatusRes.body);

  if (!updatedStatusRes.body.isCritic || updatedStatusRes.body.criticTier !== 'EXPERT') {
    throw new Error('El usuario no fue actualizado con el rango EXPERT');
  }

  // 6. Verificar historial de exámenes
  const historyRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/critics/exam/history',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`✔ Historial de intentos: ${historyRes.body.length} intento(s) registrado(s)`);

  // 7. Verificar leaderboard público
  const leaderboardRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/critics/leaderboard',
    method: 'GET',
  });
  console.log(`✔ Leaderboard público: ${leaderboardRes.body.length} crítico(s) encontrado(s)`);

  console.log('\n========================================');
  console.log('🎉 TODOS LOS TESTS DEL EXAMEN DE CRÍTICOS PASARON AL 100%');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('❌ Error en test de críticos:', err);
  process.exit(1);
});
