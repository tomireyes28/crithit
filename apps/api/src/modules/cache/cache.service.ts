import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface CacheEntry {
  value: any;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis | null = null;
  private isRedisConnected = false;

  // Almacenamiento en memoria ultra-rápido con TTL y límite de claves
  private readonly memoryStore = new Map<string, CacheEntry>();
  private readonly maxMemoryKeys = 1000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Estadísticas operativas
  private hits = 0;
  private misses = 0;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl =
      this.configService.get<string>('REDIS_URL') ||
      process.env.REDIS_URL ||
      'redis://localhost:6379';

    try {
      this.redisClient = new Redis(redisUrl, {
        lazyConnect: true,
        connectTimeout: 1500,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // No reintentar indefinidamente para no bloquear
        enableOfflineQueue: false,
      });

      this.redisClient.on('error', (err) => {
        if (this.isRedisConnected) {
          this.logger.warn(`Desconexión de Redis: ${err.message}. Pasando a caché en memoria.`);
        }
        this.isRedisConnected = false;
      });

      await this.redisClient.connect();
      this.isRedisConnected = true;
      this.logger.log(`✅ Conexión establecida con Redis en ${redisUrl}`);
    } catch {
      this.isRedisConnected = false;
      this.logger.log(
        'ℹ️ Redis externo no detectado. Activando capa de caché en memoria de alta velocidad (LRU & TTL).',
      );
    }

    // Intervalo de recolección de claves expiradas en memoria cada 60 segundos
    this.cleanupInterval = setInterval(() => {
      this.evictExpiredMemoryKeys();
    }, 60000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.redisClient) {
      this.redisClient.quit().catch(() => {});
    }
  }

  /**
   * Obtiene un valor de la caché por clave.
   */
  async get<T = any>(key: string): Promise<T | null> {
    // 1. Intentar Redis si está conectado
    if (this.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw !== null) {
          this.hits++;
          return JSON.parse(raw) as T;
        }
      } catch (err: any) {
        this.logger.debug(`Error al leer de Redis para clave ${key}: ${err.message}`);
      }
    }

    // 2. Fallback a memoria local
    const entry = this.memoryStore.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Guarda un valor en la caché con un tiempo de vida (TTL) en segundos.
   */
  async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    const serialized = JSON.stringify(value);

    // 1. Guardar en Redis si está conectado
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
      } catch (err: any) {
        this.logger.debug(`Error al escribir en Redis para clave ${key}: ${err.message}`);
      }
    }

    // 2. Guardar en memoria local
    if (this.memoryStore.size >= this.maxMemoryKeys) {
      this.evictOldestMemoryKey();
    }

    this.memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Elimina una clave de la caché.
   */
  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err: any) {
        this.logger.debug(`Error al borrar de Redis para clave ${key}: ${err.message}`);
      }
    }
    this.memoryStore.delete(key);
  }

  /**
   * Invalida todas las claves que coincidan con un prefijo o patrón (ej: 'games:trending*').
   */
  async delByPattern(pattern: string): Promise<void> {
    // 1. Redis
    if (this.isRedisConnected && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (err: any) {
        this.logger.debug(`Error al invalidar patrón en Redis (${pattern}): ${err.message}`);
      }
    }

    // 2. Memoria local
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryStore.keys()) {
      if (regexPattern.test(key)) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Envoltorio inteligente: obtiene el valor o lo calcula si no existe en caché.
   */
  async wrap<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = 60,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await factory();
    if (fresh !== undefined && fresh !== null) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  /**
   * Estadísticas de uso y salud de la caché.
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? ((this.hits / totalRequests) * 100).toFixed(1) + '%' : '0%';

    return {
      isRedis: this.isRedisConnected,
      inMemoryKeys: this.memoryStore.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
    };
  }

  private evictExpiredMemoryKeys() {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (now > entry.expiresAt) {
        this.memoryStore.delete(key);
      }
    }
  }

  private evictOldestMemoryKey() {
    // Borrar la primera clave insertada (FIFO / simple LRU)
    const firstKey = this.memoryStore.keys().next().value;
    if (firstKey) {
      this.memoryStore.delete(firstKey);
    }
  }
}
