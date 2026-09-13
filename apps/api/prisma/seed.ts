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

  // 3. Seed Placeholder Critic Exam Questions
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
