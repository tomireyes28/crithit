import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde apps/api/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const RAWG_API_KEY = process.env.RAWG_API_KEY || '79b073d2aef947c79ada67bc4c43f01f';
const BASE_URL = 'https://api.rawg.io/api';

const PAGE_SIZE = 40; // Máximo permitido por RAWG
const DEFAULT_LIMIT = 3000; // 3.000 juegos por defecto
const DELAY_MS = 250; // Pausa preventiva entre páginas para proteger RAWG

// Plataformas principales permitidas (PC, PlayStation, Xbox, Nintendo, SEGA)
const PARENT_PLATFORMS = '1,2,3,7,11';

// Mapeo amigable de abreviaturas de plataformas
const PLATFORM_ABBR_MAP: Record<string, string> = {
  'pc': 'PC',
  'playstation5': 'PS5',
  'ps5': 'PS5',
  'playstation4': 'PS4',
  'ps4': 'PS4',
  'playstation3': 'PS3',
  'ps3': 'PS3',
  'playstation2': 'PS2',
  'playstation1': 'PS1',
  'xbox-series-x': 'XSX',
  'xbox-one': 'XONE',
  'xbox360': 'X360',
  'nintendo-switch': 'NSW',
  'nintendo-3ds': '3DS',
  'nintendo-ds': 'NDS',
  'wii-u': 'WiiU',
  'wii': 'Wii',
  'gamecube': 'NGC',
  'nintendo-64': 'N64',
  'snes': 'SNES',
  'nes': 'NES',
  'game-boy-advance': 'GBA',
  'genesis': 'GEN',
  'dreamcast': 'DC',
};

interface RawgItem {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  background_image: string | null;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  short_screenshots?: Array<{ id: number; image: string }>;
  genres?: Array<{ id: number; name: string; slug: string }>;
  parent_platforms?: Array<{ platform: { id: number; name: string; slug: string } }>;
  platforms?: Array<{ platform: { id: number; name: string; slug: string } }>;
}

interface RawgResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgItem[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Caché en memoria para evitar cientos de consultas repetidas a Supabase
const genreCache = new Map<string, string>(); // slug -> id
const platformCache = new Map<string, string>(); // slug -> id

async function initCache() {
  const genres = await prisma.genre.findMany();
  for (const g of genres) genreCache.set(g.slug, g.id);

  const platforms = await prisma.platform.findMany();
  for (const p of platforms) platformCache.set(p.slug, p.id);

  console.log(`📦 Caché en memoria inicializada: ${genreCache.size} géneros, ${platformCache.size} plataformas.`);
}

async function ensureGenresInCache(items: RawgItem[]) {
  const missing: Array<{ name: string; slug: string }> = [];
  for (const item of items) {
    for (const g of item.genres || []) {
      if (!genreCache.has(g.slug) && !missing.some((m) => m.slug === g.slug)) {
        missing.push({ name: g.name, slug: g.slug });
      }
    }
  }

  for (const m of missing) {
    const record = await prisma.genre.upsert({
      where: { slug: m.slug },
      update: { name: m.name },
      create: { name: m.name, slug: m.slug },
    });
    genreCache.set(m.slug, record.id);
  }
}

async function ensurePlatformsInCache(items: RawgItem[]) {
  const missing: Array<{ name: string; slug: string; abbr: string }> = [];
  for (const item of items) {
    for (const p of item.platforms || []) {
      const pSlug = p.platform.slug.toLowerCase();
      if (!platformCache.has(pSlug) && !missing.some((m) => m.slug === pSlug)) {
        const abbr = PLATFORM_ABBR_MAP[pSlug] || p.platform.name.slice(0, 4).toUpperCase();
        missing.push({ name: p.platform.name, slug: pSlug, abbr });
      }
    }
  }

  for (const m of missing) {
    const record = await prisma.platform.upsert({
      where: { slug: m.slug },
      update: { name: m.name, abbreviation: m.abbr },
      create: { name: m.name, slug: m.slug, abbreviation: m.abbr },
    });
    platformCache.set(m.slug, record.id);
  }
}

async function fetchWithRetry(url: string, retries = 3, backoff = 2000): Promise<RawgResponse | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return (await response.json()) as RawgResponse;
      }
      if (response.status === 429) {
        console.warn(`⚠️ [Rate Limit 429] Pausa preventiva de ${backoff}ms... (Intento ${attempt}/${retries})`);
        await sleep(backoff);
        backoff *= 2;
        continue;
      }
      console.error(`❌ Error HTTP ${response.status} en ${url}`);
      return null;
    } catch (err: any) {
      console.error(`❌ Error de red en intento ${attempt}/${retries}:`, err.message);
      if (attempt < retries) {
        await sleep(backoff);
        backoff *= 2;
      }
    }
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  let totalTarget = DEFAULT_LIMIT;

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      totalTarget = parseInt(arg.split('=')[1], 10);
    } else if (!isNaN(parseInt(arg, 10))) {
      totalTarget = parseInt(arg, 10);
    }
  }

  const totalPages = Math.ceil(totalTarget / PAGE_SIZE);

  console.log('================================================================');
  console.log('🎮 CRITHIT — Ingesta Masiva del Catálogo desde RAWG API');
  console.log('================================================================');
  console.log(`🎯 Meta total: ${totalTarget} videojuegos`);
  console.log(`📄 Páginas a procesar: ${totalPages} (${PAGE_SIZE} juegos por página)`);
  console.log(`⚡ Modo: Bulk Insert / createMany (Ultra rápido)`);
  console.log(`⏱️ Pausa preventiva entre peticiones: ${DELAY_MS} ms`);
  console.log(`🛡️ Filtro de plataformas: PC + Consolas (Excluye móviles y web exclusivos)`);
  console.log(`🚫 Exclusión de DLCs y expansiones: ACTIVA`);
  console.log('----------------------------------------------------------------\n');

  await initCache();

  const startTime = Date.now();
  let totalSaved = 0;
  let totalSkipped = 0;

  for (let page = 1; page <= totalPages; page++) {
    const pageUrl = new URL(`${BASE_URL}/games`);
    pageUrl.searchParams.set('key', RAWG_API_KEY);
    pageUrl.searchParams.set('page_size', String(PAGE_SIZE));
    pageUrl.searchParams.set('page', String(page));
    pageUrl.searchParams.set('ordering', '-added');
    pageUrl.searchParams.set('parent_platforms', PARENT_PLATFORMS);
    pageUrl.searchParams.set('exclude_additions', 'true');

    const data = await fetchWithRetry(pageUrl.toString());

    if (!data || !data.results || data.results.length === 0) {
      console.log(`⚠️ No se obtuvieron más resultados en la página ${page}. Finalizando.`);
      break;
    }

    // Filtrar candidatos válidos (excluir móviles y web exclusivos)
    const validItems = data.results.filter((item) => {
      const parentIds = item.parent_platforms?.map((p) => p.platform.id) || [];
      const isPurelyMobile = parentIds.length > 0 && parentIds.every((id) => id === 4 || id === 8 || id === 14);
      if (isPurelyMobile) {
        totalSkipped++;
        return false;
      }
      return true;
    });

    if (validItems.length === 0) {
      await sleep(DELAY_MS);
      continue;
    }

    // Asegurar géneros y plataformas en caché
    await ensureGenresInCache(validItems);
    await ensurePlatformsInCache(validItems);

    // Preparar inserción en lote de juegos
    const gamesToCreate = validItems.map((item) => {
      const releaseDate = item.released ? new Date(item.released) : null;
      const coverUrl = item.background_image || null;
      const communityScore = item.rating > 0 ? Math.round(item.rating * 20) : null;
      const communityCount = item.ratings_count || 0;
      const screenshots = (item.short_screenshots || []).map((s) => s.image).filter(Boolean);

      return {
        rawgId: item.id,
        name: item.name,
        slug: item.slug,
        coverUrl,
        backdropUrl: coverUrl,
        metacriticScore: item.metacritic ?? null,
        communityScore,
        communityCount,
        firstReleaseDate: releaseDate,
        screenshotIds: screenshots,
      };
    });

    // Inserción en bloque con skipDuplicates (1 sola consulta SQL)
    await prisma.game.createMany({
      data: gamesToCreate,
      skipDuplicates: true,
    });

    // Obtener los IDs de los juegos de este lote para vincular relaciones
    const dbGames = await prisma.game.findMany({
      where: { rawgId: { in: validItems.map((i) => i.id) } },
      select: { id: true, rawgId: true },
    });
    const gameIdMap = new Map<number, string>();
    for (const g of dbGames) {
      if (g.rawgId) gameIdMap.set(g.rawgId, g.id);
    }

    // Preparar relaciones en lote
    const gameGenresData: Array<{ gameId: string; genreId: string }> = [];
    const gamePlatformsData: Array<{ gameId: string; platformId: string }> = [];

    for (const item of validItems) {
      const gameId = gameIdMap.get(item.id);
      if (!gameId) continue;

      for (const g of item.genres || []) {
        const genreId = genreCache.get(g.slug);
        if (genreId) gameGenresData.push({ gameId, genreId });
      }

      for (const p of item.platforms || []) {
        const platformId = platformCache.get(p.platform.slug.toLowerCase());
        if (platformId) gamePlatformsData.push({ gameId, platformId });
      }
    }

    // Inserción en bloque de relaciones (2 consultas SQL para todo el lote)
    if (gameGenresData.length > 0) {
      await prisma.gameGenre.createMany({
        data: gameGenresData,
        skipDuplicates: true,
      });
    }

    if (gamePlatformsData.length > 0) {
      await prisma.gamePlatform.createMany({
        data: gamePlatformsData,
        skipDuplicates: true,
      });
    }

    totalSaved += validItems.length;

    const percent = Math.round((page / totalPages) * 100);
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    const avgSecPerPage = (elapsedSec / page).toFixed(1);
    const remainingSec = Math.round(Number(avgSecPerPage) * (totalPages - page));

    console.log(
      `[${page}/${totalPages}] (${percent}%) — ${totalSaved} juegos procesados | ${totalSkipped} descartados (móvil) | ${elapsedSec}s transcurridos (~${remainingSec}s restantes)`,
    );

    // Pausa preventiva para proteger RAWG
    await sleep(DELAY_MS);
  }

  const durationMin = ((Date.now() - startTime) / 60000).toFixed(2);
  console.log('\n================================================================');
  console.log(`✅ ¡INGESTA COMPLETADA EN ${durationMin} MINUTOS!`);
  console.log(`🎮 Total de videojuegos procesados y guardados: ${totalSaved}`);
  console.log(`📱 Juegos móviles/web descartados: ${totalSkipped}`);
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal en la ingesta:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
