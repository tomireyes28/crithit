const Redis = require('ioredis');

async function testRedis() {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
    connectTimeout: 1000,
    maxRetriesPerRequest: 1,
  });

  try {
    await redis.connect();
    console.log('✅ Redis está conectado y funcionando en localhost:6379');
    await redis.set('test_key', 'hello_redis', 'EX', 10);
    const val = await redis.get('test_key');
    console.log('Valor leído de Redis:', val);
    await redis.quit();
    return true;
  } catch (err) {
    console.log('ℹ️ Redis no está activo localmente:', err.message);
    redis.disconnect();
    return false;
  }
}

testRedis();
