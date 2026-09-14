import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

interface QuestionSeed {
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  category: 'history' | 'mechanics' | 'technical' | 'ethics_methodology';
  difficulty: number;
  examType: ExamType;
}

const questions: QuestionSeed[] = [
  // ══════════════════════════════════════════════════════════
  // CATEGORÍA 1: HISTORIA Y EVOLUCIÓN DE LA INDUSTRIA (10)
  // ══════════════════════════════════════════════════════════
  {
    question: '¿Qué fenómeno provocó el colapso de la industria del videojuego norteamericana en 1983 ("Video Game Crash")?',
    options: [
      'La prohibición legal de los salones recreativos arcade en Estados Unidos',
      'La saturación del mercado con clones de baja calidad, pérdida de confianza del consumidor y falta de control de licencias',
      'La invención del primer microprocesador de 16 bits que dejó obsoletas todas las consolas',
      'La quiebra simultánea de Nintendo y Sega en territorio japonés',
    ],
    correctOption: 1,
    explanation: 'La falta de control de calidad en Atari 2600 y la proliferación de software mediocre causó una contracción del 97% en los ingresos de la industria.',
    category: 'history',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cuál de los siguientes títulos es ampliamente reconocido por establecer las bases del control y movimiento de cámara en entornos tridimensionales en 1996?',
    options: [
      'Tomb Raider',
      'Super Mario 64',
      'Crash Bandicoot',
      'GoldenEye 007',
    ],
    correctOption: 1,
    explanation: 'Super Mario 64 definió el estándar de control analógico de 360 grados y la cámara orbital inteligente en mundos abiertos 3D.',
    category: 'history',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué hito marcó el lanzamiento de "Castlevania: Symphony of the Night" (1997) en relación con el género Metroidvania?',
    options: [
      'Fue el primer juego en implementar gráficos tridimensionales poligonales en PlayStation',
      'Fusionó la exploración no lineal de Super Metroid con sistemas de progresión RPG, equipamiento y estadísticas',
      'Introdujo por primera vez el sistema de guardado en tarjetas de memoria',
      'Fue el primer juego en incluir doblaje completo en formato CD-ROM',
    ],
    correctOption: 1,
    explanation: 'Koji Igarashi introdujo niveles de experiencia, botín y armas a la fórmula no lineal, acuñando el término "Igavania/Metroidvania".',
    category: 'history',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cuál fue la principal razón técnica por la que Sony PlayStation (1994) superó en adopción a Nintendo 64 (1996) entre los desarrolladores de terceros?',
    options: [
      'El uso de CD-ROM de gran capacidad y bajo coste de producción frente a los costosos cartuchos de capacidad limitada',
      'La inclusión de un módem integrado para juego en red',
      'La exclusividad total del motor Unreal Engine en PlayStation',
      'Una arquitectura gráfica de 128 bits frente a los 64 bits de Nintendo',
    ],
    correctOption: 0,
    explanation: 'El CD-ROM (650 MB) permitió cinemáticas pre-renderizadas, bandas sonoras orquestales y costes de manufactura sustancialmente menores que los cartuchos (hasta 64 MB).',
    category: 'history',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué juego de 1993 popularizó masivamente el género FPS en PC a través del modelo de distribución "Shareware"?',
    options: [
      'Half-Life',
      'Wolfenstein 3D',
      'DOOM',
      'Quake',
    ],
    correctOption: 2,
    explanation: 'id Software distribuyó el primer episodio de DOOM gratis por BBS y correo postal, convirtiéndose en un fenómeno cultural y tecnológico global.',
    category: 'history',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué título de 1998 revolucionó la narrativa en los videojuegos al eliminar las cinemáticas pregrabadas y contar la historia en tiempo real sin cortar la perspectiva en primera persona?',
    options: [
      'Deus Ex',
      'System Shock 2',
      'Half-Life',
      'Unreal',
    ],
    correctOption: 2,
    explanation: 'Half-Life integró la narrativa directamente en la jugabilidad a través de eventos programados (scripted events) sin romper la inmersión del jugador.',
    category: 'history',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cuál fue la primera consola doméstica en incorporar de fábrica un disco duro interno y puerto Ethernet para juego online en banda ancha?',
    options: [
      'Sega Dreamcast',
      'Sony PlayStation 2',
      'Microsoft Xbox (2001)',
      'Nintendo GameCube',
    ],
    correctOption: 2,
    explanation: 'La Xbox original incluyó un disco duro de 8 GB y puerto Ethernet que posibilitó el lanzamiento del servicio revolucionario Xbox Live en 2002.',
    category: 'history',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué juego independiente de 2008 demostró la viabilidad comercial y crítica del desarrollo indie moderno en plataformas digitales de consola?',
    options: [
      'Hollow Knight',
      'Braid',
      'Celeste',
      'Shovel Knight',
    ],
    correctOption: 1,
    explanation: 'Braid (desarrollado por Jonathan Blow) junto a Super Meat Boy y Fez inauguraron la era dorada del videojuego independiente a través de Xbox Live Arcade.',
    category: 'history',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué innovación narrativa introdujo "Chrono Trigger" (1995) que marcó un antes y un después en los JRPGs?',
    options: [
      'Múltiples finales basados en las decisiones del jugador y el modo "New Game+"',
      'La inclusión de voces digitalizadas para todos los personajes principales',
      'La eliminación total del combate por turnos en favor del hack and slash',
      'El uso de gráficos prerenderizados en Silicon Graphics',
    ],
    correctOption: 0,
    explanation: 'Chrono Trigger popularizó los finales alternativos derivados de viajes en el tiempo y acuñó formalmente el concepto de "New Game+".',
    category: 'history',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué diseñador japonés es considerado el padre del género "Stealth" (sigilo táctico) gracias a su obra seminal en MSX2 en 1987?',
    options: [
      'Shinji Mikami',
      'Hideo Kojima',
      'Hidetaka Miyazaki',
      'Fumito Ueda',
    ],
    correctOption: 1,
    explanation: 'Hideo Kojima concibió Metal Gear para MSX2 debido a las limitaciones de hardware, transformando el combate directo en evasión estratégica.',
    category: 'history',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },

  // ══════════════════════════════════════════════════════════
  // CATEGORÍA 2: DISEÑO DE VIDEOJUEGOS & MECÁNICAS (10)
  // ══════════════════════════════════════════════════════════
  {
    question: '¿A qué se refiere el término "Game Feel" (o "Juice") en el diseño de interacción de un videojuego?',
    options: [
      'A la cantidad total de polígonos que componen el modelo del protagonista',
      'A la respuesta táctil, auditiva y visual inmediata que hace que controlar al personaje sea satisfactorio (impact freeze, screenshake, partículas)',
      'Al tiempo total en horas necesario para completar la campaña principal',
      'A la complejidad del árbol de habilidades pasivas',
    ],
    correctOption: 1,
    explanation: 'El Game Feel comprende la retroalimentación sensorial microscópica que conecta los comandos del jugador con la reacción inmediata en pantalla.',
    category: 'mechanics',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué es la "Disonancia Ludonarrativa"?',
    options: [
      'Un fallo acústico donde la música ambiental no concuerda con los efectos de sonido',
      'El conflicto o contradicción entre lo que la historia nos cuenta del personaje y lo que las mecánicas del juego le exigen hacer',
      'Una técnica deliberada para generar suspenso psicológico en juegos de terror',
      'La incompatibilidad entre mandos analógicos y teclados en títulos multiplataforma',
    ],
    correctOption: 1,
    explanation: 'Acuñado por Clint Hocking al analizar BioShock, ejemplifica situaciones donde un héroe presentado como compasivo masacra a cientos de enemigos sin consecuencias.',
    category: 'mechanics',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cuál es la función del concepto de "Coyote Time" en los juegos de plataformas de precisión?',
    options: [
      'Un intervalo breve donde el jugador puede saltar justo después de haber caminado fuera de una plataforma sin caerse',
      'La aceleración máxima que alcanza el personaje al correr en línea recta',
      'El tiempo que tarda un enemigo en alertar a los demás patrulleros',
      'Un modificador de daño crítico cuando la salud está por debajo del 10%',
    ],
    correctOption: 0,
    explanation: 'Inspirado en los dibujos animados del Coyote, otorga unos pocos milisegundos de gracia tras dejar un borde para evitar frustración injusta.',
    category: 'mechanics',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué diferencia a un "Hitbox" de un "Hurtbox" en el diseño de combate de juegos de acción y lucha?',
    options: [
      'Hitbox y Hurtbox son sinónimos exactos en el motor gráfico',
      'El Hitbox es el área que inflige daño (ataque); el Hurtbox es el volumen vulnerable del personaje que recibe daño',
      'El Hitbox se aplica a proyectiles y el Hurtbox únicamente a golpes cuerpo a cuerpo',
      'El Hitbox calcula la física de gravedad y el Hurtbox calcula las animaciones de victoria',
    ],
    correctOption: 1,
    explanation: 'El Hitbox define la geometría de colisión ofensiva activa, mientras que el Hurtbox define el área receptora de impactos.',
    category: 'mechanics',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué es el "Input Buffering" (almacenamiento de comandos en búfer)?',
    options: [
      'La compresión de texturas en la memoria VRAM durante las pantallas de carga',
      'Un sistema que registra una pulsación de botón antes de que termine la animación actual para ejecutar la siguiente acción al primer cuadro disponible',
      'El retraso voluntario introducido para sincronizar partidas con lag alto',
      'La asignación de macros complejas a un único botón del mando',
    ],
    correctOption: 1,
    explanation: 'Evita que el jugador deba pulsar botones con precisión de un solo cuadro (frame-perfect), haciendo los controles más fluidos y responsivos.',
    category: 'mechanics',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cómo define la teoría del diseño de niveles la técnica de "Breadcrumbs" (migas de pan)?',
    options: [
      'La inclusión de alimentos coleccionables para restaurar la barra de vitalidad',
      'Pistas visuales sutiles (luces, colores vivos, geometría orientada) que guían intuitivamente la mirada y ruta del jugador sin necesidad de un minimapa',
      'El registro en texto de los logros desbloqueados por el usuario',
      'La eliminación de objetos del escenario para liberar memoria RAM',
    ],
    correctOption: 1,
    explanation: 'Diseñadores de Valve o Naughty Dog utilizan iluminación y contraste cromático como migas de pan para orientar de forma orgánica al jugador.',
    category: 'mechanics',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué caracteriza a la "Jugabilidad Emergente" (Emergent Gameplay)?',
    options: [
      'Situaciones, soluciones o estrategias complejas que surgen de la interacción libre entre sistemas del juego y que los desarrolladores no programaron explícitamente',
      'Cinemáticas interactivas mediante Quick Time Events (QTE)',
      'La aparición repentina de enemigos generados por un script lineal predefinido',
      'El uso de micropagos para acelerar el desbloqueo de niveles',
    ],
    correctOption: 0,
    explanation: 'Ocurre cuando la física, IA y elementos (fuego, agua, viento) interactúan de forma sistémica, como en Deus Ex, Breath of the Wild o Dishonored.',
    category: 'mechanics',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cuál es el propósito del diseño "Risk vs. Reward" (Riesgo vs. Recompensa) en mecánicas de combate como el "Parry" (desvío perfecto)?',
    options: [
      'Incentivar al jugador a evitar el combate en todo momento',
      'Exigir una ventana de tiempo estricta con penalización de daño si se falla, a cambio de una ventaja contundente (aturdimiento, contraataque crítico) si se acierta',
      'Reducir automáticamente la dificultad si el jugador muere tres veces seguidas',
      'Aumentar la probabilidad de obtener objetos legendarios al pagar moneda real',
    ],
    correctOption: 1,
    explanation: 'Un buen sistema de riesgo y recompensa motiva la maestría y el aprendizaje activo del jugador.',
    category: 'mechanics',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué es el "Pacing" (ritmo) en una campaña para un jugador?',
    options: [
      'La velocidad en metros por segundo a la que corre el avatar',
      'La alternancia calculada entre picos de tensión/combate intenso y valles de exploración, calma o narrativa para evitar fatiga',
      'El número de cuadros por segundo al que corre el motor en consolas',
      'El tiempo que transcurre entre parches de actualización del juego',
    ],
    correctOption: 1,
    explanation: 'Un ritmo deficiente produce monotonía o agotamiento sensorial; el buen pacing modula la adrenalina del jugador.',
    category: 'mechanics',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué función cumple la mecánica de "Rubber-Banding" en videojuegos de carreras?',
    options: [
      'La deformación elástica de los neumáticos según el asfalto mojado',
      'Ajustar dinámicamente la velocidad de los competidores controlados por IA para mantenerlos siempre cerca del jugador, sin importar si va muy rápido o muy lento',
      'La física de rebote en las barreras de protección de los circuitos',
      'La aceleración progresiva mediante el uso de turbos de nitro',
    ],
    correctOption: 1,
    explanation: 'El efecto gomilla (rubber banding) busca mantener la emoción de carrera cerrada, aunque si es exagerado puede percibirse como artificial e injusto.',
    category: 'mechanics',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },

  // ══════════════════════════════════════════════════════════
  // CATEGORÍA 3: TÉCNICA, RENDIMIENTO & MOTORES (10)
  // ══════════════════════════════════════════════════════════
  {
    question: '¿Qué diferencia existe entre tener una tasa media de 60 FPS y tener un "Frame Pacing" irregular?',
    options: [
      'No hay diferencia; si el promedio es 60 FPS la experiencia es siempre perfectamente suave',
      'El Frame Pacing mide la uniformidad en milisegundos de cada cuadro (16.6ms a 60fps); si unos cuadros duran 33ms y otros 8ms, se perciben tirones (stutter) a pesar de promediar 60 FPS',
      'El Frame Pacing solo afecta a monitores con tasa de refresco menor a 30Hz',
      'El Frame Pacing se refiere exclusivamente al tiempo de carga del disco duro',
    ],
    correctOption: 1,
    explanation: 'La consistencia en la entrega de cuadros (frametime uniforme a 16.6ms) es tan crucial para la fluidez visual como el contador promedio de FPS.',
    category: 'technical',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué técnica moderna de reconstrucción de imagen utiliza aprendizaje profundo (Deep Learning) y vectores de movimiento para generar cuadros adicionales y aumentar la resolución?',
    options: [
      'FXAA (Fast Approximate Anti-Aliasing)',
      'DLSS (Deep Learning Super Sampling)',
      'MSAA (Multi-Sample Anti-Aliasing)',
      'V-Sync (Sincronización Vertical)',
    ],
    correctOption: 1,
    explanation: 'DLSS (NVIDIA) y tecnologías equivalentes como FSR 3 / XeSS reconstruyen imágenes en alta resolución mediante algoritmos temporales y redes neuronales.',
    category: 'technical',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Por qué el "Shader Compilation Stutter" se convirtió en un problema prominente en lanzamientos modernos de PC en Unreal Engine y DirectX 12?',
    options: [
      'Porque los procesadores modernos no soportan instrucciones de coma flotante',
      'Porque los juegos compilan shaders en tiempo de ejecución (just-in-time) la primera vez que aparece un efecto en pantalla en vez de precompilarlos al inicio, congelando brevemente la CPU',
      'Por falta de espacio en las unidades de estado sólido NVMe',
      'Debido a la ausencia de memoria caché en las tarjetas gráficas dedicadas',
    ],
    correctOption: 1,
    explanation: 'Sin una fase de precompilación en el menú inicial, la compilación sobre la marcha en DX12/Vulkan detiene el hilo principal del juego al detonar efectos nuevos.',
    category: 'technical',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿En qué se diferencia la "Resolución Dinámica" (DRS) del reescalado estático?',
    options: [
      'El DRS reduce o aumenta automáticamente la resolución interna de renderizado en tiempo real para preservar la tasa de cuadros objetivo en escenas de alta carga gráfica',
      'El DRS duplica los píxeles verticalmente únicamente en cinemáticas',
      'El DRS es una tecnología exclusiva de pantallas OLED',
      'El DRS modifica la paleta de colores HDR según la iluminación de la sala',
    ],
    correctOption: 0,
    explanation: 'La resolución dinámica permite a las consolas sostener 60 FPS estables bajando momentáneamente la resolución en explosiones o multitudes.',
    category: 'technical',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué ventaja primordial ofrece el "Rollback Netcode" frente al clásico "Delay-based Netcode" en juegos multijugador competitivos (como los de lucha)?',
    options: [
      'Comprime los paquetes de voz del chat para evitar lag de audio',
      'Predice los comandos locales de inmediato sin añadir retraso al jugador, y rebobina y corrige el estado solo si los datos del oponente divergen',
      'Aumenta los FPS del monitor local independientemente de la conexión',
      'Elimina por completo la necesidad de servidores dedicados',
    ],
    correctOption: 1,
    explanation: 'El rollback simula la partida localmente a latencia cero de entrada y sincroniza silenciosamente las discrepancias temporales.',
    category: 'technical',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué función cumple la "VRAM" (memoria de video) en el hardware gráfico?',
    options: [
      'Almacenar de forma rápida texturas, búferes de cuadro, mapas de sombras y datos geométricos que la GPU necesita procesar al renderizar la escena',
      'Guardar las partidas del usuario cuando la consola entra en modo reposo',
      'Suministrar energía eléctrica estable a los ventiladores de la refrigeración líquida',
      'Gestionar las conexiones Bluetooth de los mandos inalámbricos',
    ],
    correctOption: 0,
    explanation: 'La saturación de la VRAM obliga a transferir datos a través del bus PCIe a la RAM del sistema, provocando caídas masivas de rendimiento.',
    category: 'technical',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cuál es el beneficio de la tecnología "Variable Refresh Rate" (VRR / G-Sync / FreeSync)?',
    options: [
      'Aumenta artificialmente la saturación cromática de las texturas oscuras',
      'Sincroniza dinámicamente la frecuencia de actualización del monitor con los cuadros por segundo generados por la GPU, eliminando el desgarro de pantalla (tearing) sin añadir la latencia del V-Sync',
      'Permite conectar dos teclados simultáneos en el mismo puerto USB',
      'Reduce el tamaño de instalación de los juegos en el disco duro',
    ],
    correctOption: 1,
    explanation: 'El VRR ajusta la pantalla a los FPS exactos de la tarjeta gráfica momento a momento, haciendo las caídas leves de framerate casi imperceptibles.',
    category: 'technical',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué componente del motor de iluminación calcula la luz indirecta que rebota de una superficie a otra aportando color y naturalidad ambiental?',
    options: [
      'Global Illumination (Iluminación Global)',
      'Anisotropic Filtering (Filtrado Anisótropo)',
      'Z-Buffer',
      'Depth of Field (Profundidad de Campo)',
    ],
    correctOption: 0,
    explanation: 'La Iluminación Global simula el comportamiento físico de los rebotes de luz (color bleeding), ya sea en tiempo real (Ray Tracing/Lumen) o precalculada (baked).',
    category: 'technical',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿A qué hace referencia el concepto de "Input Lag" (latencia de entrada)?',
    options: [
      'El retraso de descarga al instalar un videojuego desde la tienda digital',
      'El tiempo que transcurre desde que el usuario pulsa un botón físico hasta que la acción correspondiente se refleja visualmente en la pantalla',
      'La lentitud de lectura del disco óptico de una consola',
      'El tiempo de espera en el matchmaking para encontrar partida online',
    ],
    correctOption: 1,
    explanation: 'La latencia de entrada depende del mando, el motor de juego, la tasa de refresco y el postprocesamiento del televisor (modo juego).',
    category: 'technical',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué tecnología de renderizado geométrico introducida en Unreal Engine 5 permite importar mallas de millones de polígonos sin requerir la creación manual de LODs (niveles de detalle)?',
    options: [
      'Chaos Physics',
      'Nanite',
      'Lumen',
      'Niagara',
    ],
    correctOption: 1,
    explanation: 'Nanite virtualiza la geometría y transmite en tiempo real solo los detalles perceptibles a nivel de píxel.',
    category: 'technical',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },

  // ══════════════════════════════════════════════════════════
  // CATEGORÍA 4: ÉTICA, PERIODISMO & METODOLOGÍA DE CRÍTICA (10)
  // ══════════════════════════════════════════════════════════
  {
    question: 'Al redactar una crítica rigurosa, ¿por qué es fundamental explicitar las condiciones en las que se jugó (plataforma, modo gráfico y versión/parche)?',
    options: [
      'Porque es un requerimiento legal estipulado por los organismos de consumo',
      'Porque la experiencia, rendimiento técnico, estabilidad y presencia de bugs pueden diferir drásticamente entre consolas, PC y versiones pre-lanzamiento vs parche día uno',
      'Para que la distribuidora valide la garantía del juego',
      'Solo es relevante si el juego tiene opciones de personalización cosmética',
    ],
    correctOption: 1,
    explanation: 'La transparencia técnica otorga contexto real al lector, permitiéndole entender si la crítica refleja su plataforma de elección.',
    category: 'ethics_methodology',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cómo debe gestionar un crítico acreditado el tratamiento de los giros argumentales ("spoilers")?',
    options: [
      'Describir el final con detalle para demostrar que se completó el juego al 100%',
      'Evaluar el impacto emocional y la efectividad narrativa de la trama sin revelar giros cruciales o mecánicas sorpresa destinadas a ser descubiertas por el jugador',
      'Omitir por completo cualquier mención a los personajes o al contexto narrativo',
      'Publicar un resumen del desenlace en el primer párrafo del análisis',
    ],
    correctOption: 1,
    explanation: 'Un buen análisis juzga la calidad del guion, interpretaciones y ritmo sin arruinar las sorpresas clave de la experiencia al consumidor.',
    category: 'ethics_methodology',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué principio ético rige la aceptación de copias de prensa ("Review Copies") proporcionadas por editoras?',
    options: [
      'La copia gratuita obliga contractualmente al crítico a otorgar una puntuación mínima de 80/100',
      'La copia debe ser declarada explícitamente y bajo ninguna circunstancia debe condicionar la honestidad, independencia o libertad de juicio del analista',
      'El crítico no puede publicar opiniones negativas de juegos facilitados por distribuidoras',
      'Las copias de prensa solo pueden jugarse durante 2 horas como máximo',
    ],
    correctOption: 1,
    explanation: 'La independencia editorial y la transparencia con la audiencia son los pilares indispensables de la credibilidad crítica.',
    category: 'ethics_methodology',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cuál es la postura metodológica más adecuada al juzgar un videojuego perteneciente a un género que personalmente no es del agrado del crítico?',
    options: [
      'Calificarlo con la nota mínima justificando que el género en sí mismo es aburrido',
      'Evaluar la obra según las convenciones, méritos y aspiraciones del propio género, contrastándola con los referentes de su categoría antes de aplicar gustos personales',
      'Delegar el juego a otra persona y firmar la reseña con el propio nombre',
      'Analizarlo como si fuera un shooter en primera persona independientemente del tipo de juego',
    ],
    correctOption: 1,
    explanation: 'La crítica profesional requiere criterio analítico para discernir entre fallos objetivos de diseño y meras preferencias subjetivas del individuo.',
    category: 'ethics_methodology',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Por qué es problemático publicar una reseña definitiva de un juego como servicio (MMO / GaaS) habiendo jugado únicamente las primeras 3 horas en un servidor de prueba vacío?',
    options: [
      'Porque los juegos como servicio basan su valor central en la economía a largo plazo, el juego final (endgame), la estabilidad de red con miles de usuarios y la progresión comunitaria',
      'Porque la tienda digital no permite reembolsos después de 2 horas',
      'Porque los servidores vacíos tienen mejor tasa de fotogramas',
      'No representa ningún problema si el prólogo es de buena calidad',
    ],
    correctOption: 0,
    explanation: 'Un juego como servicio no puede evaluarse con la misma metodología que una aventura lineal de 8 horas sin probar la infraestructura real y el bucle extendido.',
    category: 'ethics_methodology',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué define a un "Review Event" (evento de prensa de prueba cerrado) y qué cautelas debe mantener el crítico?',
    options: [
      'Una sesión controlada por la editora con hardware optimizado y entorno idealizado; el analista debe ser consciente de que el rendimiento puede diferir de las condiciones domésticas del público general',
      'Una fiesta de lanzamiento sin acceso al videojuego',
      'Una conferencia donde los desarrolladores redactan las conclusiones de los artículos',
      'Un torneo competitivo con premios en metálico',
    ],
    correctOption: 0,
    explanation: 'Los eventos de review aíslan factores como la fatiga, el lag de servidores y la configuración en PCs comerciales promedio.',
    category: 'ethics_methodology',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cómo debe abordar una crítica los sistemas de monetización invasivos, micropagos o pases de batalla dentro de un juego de precio completo (60-70 USD)?',
    options: [
      'Ignorarlos por completo si los micropagos son meramente estéticos',
      'Examinar si la economía del juego fue artificialmente ralentizada para incentivar el gasto real, y evaluar cómo afecta la experiencia del usuario que no desea pagar extra',
      'Recomendar comprar todos los pases para apoyar a la compañía desarrolladora',
      'Calificar la monetización únicamente si el juego es exclusivo de móviles',
    ],
    correctOption: 1,
    explanation: 'La economía de un juego es parte integral de su diseño de progresión y puede devaluar significativamente el valor de compra del consumidor.',
    category: 'ethics_methodology',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: 'En la escala de calificación cuantitativa (ej: 0 a 100 en CritHit), ¿qué error metodológico común se conoce como el "Síndrome de la Escala Escolar"?',
    options: [
      'Asignar notas decimales en lugar de números enteros',
      'Tratar cualquier puntuación inferior a 70 o 75 como un juego "injugable o reprobado", anulando el uso del 50-70 como juegos entretenidos de calidad media o de nicho',
      'Evaluar únicamente juegos basados en franquicias educativas',
      'Otorgar 100/100 únicamente a remasterizaciones de clásicos',
    ],
    correctOption: 1,
    explanation: 'En una escala equilibrada de 0 a 100, un 50-65 representa un juego competente con fallas, no un fracaso absoluto.',
    category: 'ethics_methodology',
    difficulty: 2,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Qué significa el término "Embargo" en la crítica de videojuegos?',
    options: [
      'La prohibición judicial de importar una consola al país',
      'Un acuerdo temporal vinculante entre la editora y el crítico que fija una fecha y hora exacta antes de la cual no se puede hacer pública la reseña o contenido del juego',
      'La retención de pagos a los redactores hasta que el artículo alcance 10.000 visitas',
      'Un bloqueo impuesto por las plataformas de streaming a jugadores profesionales',
    ],
    correctOption: 1,
    explanation: 'Los embargos permiten a los críticos jugar con antelación y tiempo suficiente para analizar la obra sin competir frenéticamente por publicar primero.',
    category: 'ethics_methodology',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
  {
    question: '¿Cuál es el valor fundamental de una crítica en CritHit frente a un simple agregador de opiniones algorítmico?',
    options: [
      'Garantizar que todo el mundo coincida con la misma opinión',
      'Aportar un análisis argumentado, fundamentado en cultura del medio, diseño lúdico y rigor técnico que ayude al lector a formarse su propio criterio',
      'Determinar si un juego se venderá bien en el mercado de valores',
      'Predecir cuántos premios ganará el título a final de año',
    ],
    correctOption: 1,
    explanation: 'La crítica de calidad no busca imponer un gusto, sino iluminar las virtudes y defectos de la obra con lenguaje analítico y fundamentado.',
    category: 'ethics_methodology',
    difficulty: 1,
    examType: 'BASIC_CRITIC',
  },
];

async function main() {
  console.log('--- Sembrando Banco de 40 Preguntas de Acreditación de Críticos ---');

  let createdCount = 0;
  let updatedCount = 0;

  for (const q of questions) {
    const existing = await prisma.examQuestion.findFirst({
      where: { question: q.question },
    });

    if (existing) {
      await prisma.examQuestion.update({
        where: { id: existing.id },
        data: {
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation,
          category: q.category,
          difficulty: q.difficulty,
          examType: q.examType,
          isActive: true,
        },
      });
      updatedCount++;
    } else {
      await prisma.examQuestion.create({
        data: {
          question: q.question,
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation,
          category: q.category,
          difficulty: q.difficulty,
          examType: q.examType,
          isActive: true,
        },
      });
      createdCount++;
    }
  }

  const total = await prisma.examQuestion.count();
  console.log(`✔ Sembrado finalizado: ${createdCount} creadas, ${updatedCount} actualizadas.`);
  console.log(`✔ Total de preguntas en la base de datos: ${total}`);
}

main()
  .catch((e) => {
    console.error('Error al sembrar preguntas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
