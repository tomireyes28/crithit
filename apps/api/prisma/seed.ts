import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Common Platforms
  const platforms = [
    { igdbId: 6, name: 'PC (Microsoft Windows)', slug: 'pc', abbreviation: 'PC' },
    { igdbId: 167, name: 'PlayStation 5', slug: 'ps5', abbreviation: 'PS5' },
    { igdbId: 48, name: 'PlayStation 4', slug: 'ps4', abbreviation: 'PS4' },
    { igdbId: 169, name: 'Xbox Series X|S', slug: 'xbox-series-x', abbreviation: 'XSX' },
    { igdbId: 49, name: 'Xbox One', slug: 'xbox-one', abbreviation: 'XONE' },
    { igdbId: 130, name: 'Nintendo Switch', slug: 'nintendo-switch', abbreviation: 'NSW' },
  ];

  for (const plat of platforms) {
    await prisma.platform.upsert({
      where: { igdbId: plat.igdbId },
      update: {},
      create: plat,
    });
  }
  console.log('✅ Platforms seeded');

  // 2. Seed Common Genres
  const genres = [
    { igdbId: 12, name: 'Role-playing (RPG)', slug: 'rpg' },
    { igdbId: 5, name: 'Shooter', slug: 'shooter' },
    { igdbId: 31, name: 'Adventure', slug: 'adventure' },
    { igdbId: 25, name: 'Hack and slash/Beat \'em up', slug: 'hack-and-slash' },
    { igdbId: 15, name: 'Strategy', slug: 'strategy' },
    { igdbId: 8, name: 'Platform', slug: 'platform' },
    { igdbId: 9, name: 'Puzzle', slug: 'puzzle' },
    { igdbId: 10, name: 'Racing', slug: 'racing' },
    { igdbId: 14, name: 'Sport', slug: 'sport' },
    { igdbId: 4, name: 'Fighting', slug: 'fighting' },
  ];

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { igdbId: genre.igdbId },
      update: {},
      create: genre,
    });
  }
  console.log('✅ Genres seeded');

  // 3. Seed Curated Popular Games with real IGDB Cover IDs
  const popularGames = [
    {
      igdbId: 119133,
      slug: 'elden-ring',
      name: 'Elden Ring',
      summary: 'Levántate, Tiznado, y déjate guiar por la gracia para esgrimir el poder del Anillo de Elden y convertirte en el Señor del Círculo en las Tierras Intermedias.',
      coverImageId: 'co4jni',
      backdropImageId: 'co4jni',
      firstReleaseDate: new Date('2022-02-25'),
      communityScore: 95,
      communityCount: 4120,
      criticScore: 96,
      criticCount: 88,
      totalReviews: 4208,
      hypeCount: 980,
      genreSlug: 'rpg',
      platformSlugs: ['pc', 'ps5', 'xbox-series-x'],
    },
    {
      igdbId: 1942,
      slug: 'the-witcher-3-wild-hunt',
      name: 'The Witcher 3: Wild Hunt',
      summary: 'Te conviertes en Geralt de Rivia, cazador de monstruos a sueldo. Ante ti se extiende un continente azotado por la guerra e infestado de criaturas.',
      coverImageId: 'co1wyy',
      backdropImageId: 'co1wyy',
      firstReleaseDate: new Date('2015-05-19'),
      communityScore: 94,
      communityCount: 5200,
      criticScore: 92,
      criticCount: 95,
      totalReviews: 5295,
      hypeCount: 650,
      genreSlug: 'rpg',
      platformSlugs: ['pc', 'ps5', 'ps4', 'nintendo-switch'],
    },
    {
      igdbId: 119171,
      slug: 'baldurs-gate-3',
      name: "Baldur's Gate 3",
      summary: 'Reúne a tu grupo y regresa a los Reinos Olvidados en una historia de compañerismo y traición, sacrificio y supervivencia, y la atracción del poder absoluto.',
      coverImageId: 'co670h',
      backdropImageId: 'co670h',
      firstReleaseDate: new Date('2023-08-03'),
      communityScore: 96,
      communityCount: 3800,
      criticScore: 97,
      criticCount: 110,
      totalReviews: 3910,
      hypeCount: 1200,
      genreSlug: 'rpg',
      platformSlugs: ['pc', 'ps5', 'xbox-series-x'],
    },
    {
      igdbId: 1877,
      slug: 'cyberpunk-2077',
      name: 'Cyberpunk 2077',
      summary: 'Un RPG de acción y aventura en mundo abierto ambientado en Night City, una megalópolis obsesionada con el poder, el glamur y la modificación corporal.',
      coverImageId: 'co732e',
      backdropImageId: 'co732e',
      firstReleaseDate: new Date('2020-12-10'),
      communityScore: 86,
      communityCount: 3100,
      criticScore: 89,
      criticCount: 75,
      totalReviews: 3175,
      hypeCount: 840,
      genreSlug: 'rpg',
      platformSlugs: ['pc', 'ps5', 'xbox-series-x'],
    },
    {
      igdbId: 1067,
      slug: 'the-legend-of-zelda-tears-of-the-kingdom',
      name: 'The Legend of Zelda: Tears of the Kingdom',
      summary: 'Una aventura sin fin te espera en la secuela de Breath of the Wild mientras exploras los cielos y el vasto territorio de Hyrule.',
      coverImageId: 'co5vmg',
      backdropImageId: 'co5vmg',
      firstReleaseDate: new Date('2023-05-12'),
      communityScore: 93,
      communityCount: 2900,
      criticScore: 95,
      criticCount: 92,
      totalReviews: 2992,
      hypeCount: 790,
      genreSlug: 'adventure',
      platformSlugs: ['nintendo-switch'],
    },
    {
      igdbId: 25076,
      slug: 'red-dead-redemption-2',
      name: 'Red Dead Redemption 2',
      summary: 'América, 1899. Arthur Morgan y la banda de Van der Linde se ven forzados a huir tras un atraco que sale mal en la ciudad de Blackwater.',
      coverImageId: 'co1q1f',
      backdropImageId: 'co1q1f',
      firstReleaseDate: new Date('2018-10-26'),
      communityScore: 96,
      communityCount: 6100,
      criticScore: 97,
      criticCount: 105,
      totalReviews: 6205,
      hypeCount: 1100,
      genreSlug: 'adventure',
      platformSlugs: ['pc', 'ps4', 'xbox-one'],
    },
    {
      igdbId: 112875,
      slug: 'god-of-war-ragnarok',
      name: 'God of War Ragnarök',
      summary: 'Kratos y Atreus deben viajar a cada uno de los Nueve Reinos en busca de respuestas mientras las fuerzas de Asgard se preparan para la batalla profetizada.',
      coverImageId: 'co5s5v',
      backdropImageId: 'co5s5v',
      firstReleaseDate: new Date('2022-11-09'),
      communityScore: 93,
      communityCount: 3400,
      criticScore: 94,
      criticCount: 84,
      totalReviews: 3484,
      hypeCount: 720,
      genreSlug: 'adventure',
      platformSlugs: ['ps5', 'ps4', 'pc'],
    },
    {
      igdbId: 227845,
      slug: 'hades-ii',
      name: 'Hades II',
      summary: 'Lucha más allá del Inframundo utilizando hechicería oscura para enfrentarte al Titán del Tiempo en esta fascinante secuela del galardonado roguelike.',
      coverImageId: 'co5zpp',
      backdropImageId: 'co5zpp',
      firstReleaseDate: new Date('2024-05-06'),
      communityScore: 92,
      communityCount: 1800,
      criticScore: 91,
      criticCount: 42,
      totalReviews: 1842,
      hypeCount: 890,
      genreSlug: 'hack-and-slash',
      platformSlugs: ['pc'],
    },
  ];

  for (const g of popularGames) {
    const { genreSlug, platformSlugs, ...gameData } = g;

    const game = await prisma.game.upsert({
      where: { igdbId: gameData.igdbId },
      update: gameData,
      create: {
        ...gameData,
        screenshotIds: [],
        trailerUrls: [],
      },
    });

    // Vincular género
    const genre = await prisma.genre.findUnique({ where: { slug: genreSlug } });
    if (genre) {
      await prisma.gameGenre.upsert({
        where: {
          gameId_genreId: { gameId: game.id, genreId: genre.id },
        },
        update: {},
        create: { gameId: game.id, genreId: genre.id },
      });
    }

    // Vincular plataformas
    for (const platSlug of platformSlugs) {
      const plat = await prisma.platform.findUnique({ where: { slug: platSlug } });
      if (plat) {
        await prisma.gamePlatform.upsert({
          where: {
            gameId_platformId: { gameId: game.id, platformId: plat.id },
          },
          update: {},
          create: { gameId: game.id, platformId: plat.id },
        });
      }
    }
  }
  console.log('✅ Curated popular games seeded');

  // 4. Seed Placeholder Critic Exam Questions
  const placeholderQuestions = [
    {
      examType: 'BASIC_CRITIC' as const,
      question: '¿Qué elemento define primordialmente el bucle de jugabilidad (core gameplay loop) de un RPG de acción?',
      options: [
        'La duración de las cinemáticas',
        'El ciclo continuo de combate, obtención de recompensas/experiencia y progresión del personaje',
        'El número total de actores de doblaje involucrados',
        'El motor gráfico en el que fue desarrollado',
      ],
      correctOption: 1,
      category: 'mechanics',
      explanation: 'El bucle central en los ARPGs se basa en la retroalimentación inmediata del combate combinada con la progresión de estadísticas y equipo.',
      difficulty: 1,
    },
    {
      examType: 'BASIC_CRITIC' as const,
      question: 'Al evaluar el rendimiento técnico de un videojuego, ¿qué término describe las caídas inconsistentes en el tiempo de entrega de cuadros?',
      options: ['Frame pacing irregular o stuttering', 'Anti-aliasing MSAA', 'Tessellation', 'Ray Tracing'],
      correctOption: 0,
      category: 'technical',
      explanation: 'El stuttering o mal frame pacing ocurre cuando los cuadros no se presentan a intervalos uniformes, generando saltos visuales.',
      difficulty: 1,
    },
    {
      examType: 'BASIC_CRITIC' as const,
      question: '¿Cuál de los siguientes hitos históricos popularizó el diseño de niveles no lineal "Metroidvania" en 2D?',
      options: [
        'Super Mario 64 y Crash Bandicoot',
        'Castlevania: Symphony of the Night y Super Metroid',
        'Final Fantasy VII y Chrono Trigger',
        'Doom y Wolfenstein 3D',
      ],
      correctOption: 1,
      category: 'history',
      explanation: 'Super Metroid (1994) y Castlevania: SOTN (1997) acuñaron y consolidaron la fórmula del subgénero.',
      difficulty: 1,
    },
    {
      examType: 'BASIC_CRITIC' as const,
      question: 'En la crítica de videojuegos moderna, ¿por qué es importante indicar la plataforma y el parche/versión en que se jugó?',
      options: [
        'Porque los juegos modernos pueden variar drásticamente en rendimiento técnico y contenido tras actualizaciones',
        'Solo es necesario para juegos de consola portátil',
        'Es un requisito legal de las distribuidoras',
        'No tiene relevancia práctica',
      ],
      correctOption: 0,
      category: 'ethics_methodology',
      explanation: 'La disparidad de rendimiento entre plataformas y las mejoras por parches son cruciales para la validez de la crítica.',
      difficulty: 1,
    },
  ];

  for (const q of placeholderQuestions) {
    const existing = await prisma.examQuestion.findFirst({
      where: { question: q.question },
    });
    if (!existing) {
      await prisma.examQuestion.create({
        data: q,
      });
    }
  }
  console.log('✅ Placeholder Critic Exam questions seeded');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
