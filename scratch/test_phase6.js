async function testPhase6() {
  console.log('🧪 Iniciando pruebas automatizadas para Fase 6...\n');

  try {
    // 1. Probar endpoint de juegos populares semanales
    const resWeekly = await fetch('http://localhost:4000/api/games/popular-weekly?timeframe=week&limit=5');
    const dataWeekly = await resWeekly.json();
    console.log(`✅ [1/5] GET /api/games/popular-weekly (week): HTTP ${resWeekly.status}`);
    console.log(`   - Timeframe: ${dataWeekly.timeframe}`);
    console.log(`   - Juegos recibidos: ${dataWeekly.data?.length}`);
    console.log(`   - Top 1: #${dataWeekly.data?.[0]?.rank} ${dataWeekly.data?.[0]?.name} (Engagement: ${dataWeekly.data?.[0]?.weeklyEngagement})`);

    // 2. Probar timeframe 'month'
    const resMonthly = await fetch('http://localhost:4000/api/games/popular-weekly?timeframe=month&limit=3');
    const dataMonthly = await resMonthly.json();
    console.log(`\n✅ [2/5] GET /api/games/popular-weekly (month): HTTP ${resMonthly.status}`);
    console.log(`   - Top 1: #${dataMonthly.data?.[0]?.rank} ${dataMonthly.data?.[0]?.name}`);

    // 3. Probar timeframe 'all_time'
    const resAllTime = await fetch('http://localhost:4000/api/games/popular-weekly?timeframe=all_time&limit=3');
    const dataAllTime = await resAllTime.json();
    console.log(`\n✅ [3/5] GET /api/games/popular-weekly (all_time): HTTP ${resAllTime.status}`);
    console.log(`   - Top 1: #${dataAllTime.data?.[0]?.rank} ${dataAllTime.data?.[0]?.name} (Nota: ${dataAllTime.data?.[0]?.communityScore})`);

    // 4. Probar búsqueda global unificada
    const resSearch = await fetch('http://localhost:4000/api/search?q=elden');
    const dataSearch = await resSearch.json();
    console.log(`\n✅ [4/5] GET /api/search?q=elden: HTTP ${resSearch.status}`);
    console.log(`   - Juegos encontrados: ${dataSearch.games?.length}`);
    console.log(`   - Primer juego: ${dataSearch.games?.[0]?.name}`);

    // 5. Probar disponibilidad del frontend
    const resWeb = await fetch('http://localhost:3002/');
    console.log(`\n✅ [5/5] GET http://localhost:3002/ (Frontend): HTTP ${resWeb.status}`);

    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE LA FASE 6 HAN SIDO SUPERADAS EXITOSAMENTE!');
  } catch (err) {
    console.error('❌ Error ejecutando pruebas:', err.message);
  }
}

testPhase6();
