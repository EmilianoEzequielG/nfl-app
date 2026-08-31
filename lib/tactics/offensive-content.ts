export interface TacticConcept {
  id: string;
  name: string;
  category: "personnel" | "formations" | "gap-scheme" | "aerial" | "ground" | "protections" | "sistemas" | "penalties";
  categoryLabel: string;
  definition: string;
  punto_fuerte: string[];
  punto_debil: string[];
  idealFor: string;
  diagram?: string;
}

export const offensiveContent: TacticConcept[] = [
  // ─── PERSONAL ──────────────────────────────────────────────────────
  {
    id: "personnel-11",
    name: "11 Personnel (1 RB, 1 TE, 3 WR)",
    category: "personnel",
    categoryLabel: "Personal",
    definition:
      "La alineación base de la NFL moderna. Un RB en el backfield, un TE en la línea como receptor/bloqueador, tres WR distribuidos. Versátil para pase y carrera sin cambios de personal.",
    punto_fuerte: [
      "Universal — no requiere cambios de personal entre pase/carrera",
      "Defensa indecisa — pre-snap no saben intención ofensiva",
      "Spacing profundo — receptores en todas las profundidades (seam, intermediate, deep)",
      "Flexibilidad RB — puede bloquear, recibir, o correr sin predecibilidad",
    ],
    punto_debil: [
      "TE debe ser versátil — si solo bloquea o solo recibe, defensa se adapta",
      "5 bloqueadores — vulnerable a presión defensiva sin protección extra",
    ],
    idealFor:
      "Situaciones todo-propósito. Primera-segunda intentona, drive mixto, tercera larga. Usado en ~55% de snaps en NFL porque no hay 'tell' (indicador) pre-snap.",
    diagram: "personnel-11",
  },

  {
    id: "personnel-12",
    name: "12 Personnel (1 RB, 2 TE, 2 WR)",
    category: "personnel",
    categoryLabel: "Personal",
    definition:
      "Alineación 'pesada' con dos tight ends como bloqueadores. Sacrifica opciones de pase por poder físico en la línea. Usado para imponer voluntad ofensiva en el campo.",
    punto_fuerte: [
      "Poder run game — dos TE crean muro de bloqueo prácticamente impenetrable",
      "Momentum difícil de detener — 7 bloqueadores vs 4 DL = ventaja numérica",
      "Goal line letal — en corta distancia (1-3 yardas), casi garantizado",
      "Play action engaña — defensa respeta amenaza de carrera, safeties bajan",
    ],
    punto_debil: [
      "Altamente predecible — todos esperan carrera (defensa puede stunt/presión)",
      "Solo 2 opciones de pase — DB puede jugar profundo en cobertura",
      "Más lento — requiere tiempo para ejecutar bloques coordinados",
    ],
    idealFor:
      "Carrera de poder específicamente, goal line, situaciones 1-3 yardas, cuando necesitas movimiento garantizado.",
    diagram: "personnel-12",
  },

  {
    id: "personnel-21",
    name: "21 Personnel (2 RB, 1 TE, 2 WR)",
    category: "personnel",
    categoryLabel: "Personal",
    definition:
      "Dos running backs diferenciados (típicamente uno para potencia, otro para pase). Un TE. Balance entre poder y versatilidad sin ser completamente predecible.",
    punto_fuerte: [
      "Decisión RB late — uno bloquea, otro puede recibir (confunde LBs)",
      "Doble amenaza de carrera — defensa nunca sabe si va al RB1 o RB2",
      "Presencia de poder — dos RBs en backfield asusta a defensa",
      "RB receptor — si uno sale, tiene match-up favorable contra LB en pase",
    ],
    punto_debil: [
      "Predecible en contexto — mayoría de jugadas son carreras (defensa prepara run defense)",
      "Solo 2 WR — limita profundidad de árbol de pases, DB puede jugar profundo",
      "Caro en personal — necesita dos RBs activos y de calidad",
    ],
    idealFor:
      "Drive de poder controlado, cuando tienes dos RBs diferenciados, situaciones donde quieres ambigüedad pre-snap.",
    diagram: "personnel-21",
  },

  {
    id: "personnel-10",
    name: "10 Personnel (1 RB, 0 TE, 4 WR) — 'Spread'",
    category: "personnel",
    categoryLabel: "Personal",
    definition:
      "Máximo spread ofensivo. Cero tight ends, un RB, cuatro wide receivers distribuidos. Diseñado para pase explosivo y crear aislamiento de DB 1-v-1.",
    punto_fuerte: [
      "Pase vertical explosivo — safeties no pueden rotar, defensa esparcida",
      "Aislamiento WR — cada receptor tiene match-up individual contra DB",
      "Espaciamiento horizontal — zone coverage se vuelve imposible de ejecutar",
      "Tempo rápido — muchos WR disponibles = múltiples opciones rápidas",
    ],
    punto_debil: [
      "Vulnerable a carrera — sin TE/RB bloqueador, run defense es débil",
      "Presión QB — sin protección adicional, QB bajo presión constante",
      "Predecible intención — todos saben que es pase (defensa prepara pass rush)",
      "RB solo — si defienden bien el RB receptor, opciones limitadas",
    ],
    idealFor:
      "Tercera larga profunda, cuando necesitas conversión de pase, matchup WR vs DB favorable, cuando defensa está en nickel (sin LBs).",
    diagram: "personnel-10",
  },

  {
    id: "personnel-13",
    name: "13 Personnel (1 RB, 3 TE, 1 WR)",
    category: "personnel",
    categoryLabel: "Personal",
    definition:
      "Alineación ultra-pesada con tres tight ends. Máximo bloqueo físico sacrificando completamente versatilidad de pase. Diseñado únicamente para poder de carrera en corta distancia.",
    punto_fuerte: [
      "Bloqueo impenetrable — tres TE + OL crean muro defensivo imposible de penetrar",
      "Goal line dominancia — en 1-3 yardas, defensa no puede evitar ganancia",
      "Poder incuestionable — cuando necesitas movimiento garantizado, 13 lo entrega",
      "Defensa comprometida — solo bloqueo importa, movimiento defensivo limitado",
    ],
    punto_debil: [
      "Altamente predecible — todos saben carrera (99% de snaps es run)",
      "Solo una opción de pase — WR único, DB puede jugar profundo automáticamente",
      "Extremadamente lento — tres bloqueadores requieren coordinación extra",
      "Vulnerable a defensa moderna — esquemas de gap neutralizan poder puro fácilmente",
    ],
    idealFor:
      "Goal line específicamente (1 yarda), poder de carrera incuestionable, cuando necesitas garantía de movimiento sobre gambols ofensivos.",
    diagram: "personnel-13",
  },

  {
    id: "personnel-20",
    name: "20 Personnel (2 RB, 0 TE, 3 WR)",
    category: "personnel",
    categoryLabel: "Personal",
    definition:
      "Dos running backs en backfield, sin tight ends, tres wide receivers. Filosofía híbrida: spread máximo sin comprometer bloqueo de carrera (dos RBs pueden bloquear).",
    punto_fuerte: [
      "Doble amenaza carrera — dos RBs cumplen roles: uno bloqueador, otro receptor/runner",
      "Spread versatilidad — tres WR profundos crean matchups favorables sin sacrificar poder",
      "Flexibilidad pre-snap — defensa no sabe si carrera o pase sin comprometerse",
      "Espaciamiento defensivo — tres WR fuerzan DBs profundos, abre rutas intermedias",
    ],
    punto_debil: [
      "Raro en NFL — pocos equipos lo usan, coordinadores prefieren alternativas más simples",
      "RB bloqueadores limitados — dos RBs como bloqueadores es menos efectivo que TE/FB",
      "No es puro spread — no genera spread ventaja como 10 Personnel",
      "Requiere coordinación especial — uso es situacional, no filosofía base",
    ],
    idealFor:
      "Equipos con dos RBs elite que pueden bloquear/recibir, drive mixto donde versatilidad es ventaja, cuando quieres spread sin sacrificar poder de carrera.",
    diagram: "personnel-20",
  },

  {
    id: "personnel-22",
    name: "22 Personnel (2 RB, 2 TE, 1 WR)",
    category: "personnel",
    categoryLabel: "Personal",
    definition:
      "Dos running backs, dos tight ends, un wide receiver. Formación clásica de poder equilibrada entre carrera y pase. Excelente para establecer juego terrestre físico mientras mantiene versatilidad en pase.",
    punto_fuerte: [
      "Poder balanceado — dos RBs + dos TEs crean bloqueo robusto sin ser ultra-predecible",
      "Versatilidad dual — puede ejecutar carrera pesada O pase de dos TE (defensa indecisa)",
      "Play-action devastador — dos TEs como opción de pase confunden safeties que bajan anticipando carrera",
      "Bloqueo flexible — RB receptor puede liberar, otro puede bloquear (decisión late)",
    ],
    punto_debil: [
      "Solo 1 WR — defensa puede jugar profundo sin preocupación spread",
      "Moderadamente predecible — formación pesada suggests carrera mayoría de tiempo",
      "RB decisión tarda — defensa tiene tiempo de fluir mientras QB espera lectura post-snap",
    ],
    idealFor:
      "Drive de poder controlado, goal line situaciones, cuando necesitas ambigüedad pre-snap entre carrera y pase corto. Equipos con dos RBs y TEs de calidad.",
    diagram: "personnel-22",
  },

  {
    id: "nomenclatura-receptores",
    name: "Nomenclatura de Receptores",
    category: "personnel",
    categoryLabel: "Personal",
    definition:
      "Sistema de nombrado para identificar receptores en alineación ofensiva. WR (Wide Receiver), TE (Tight End), RB (Running Back), FB (Fullback). Cada posición tiene roles específicos de bloqueo, recepción y versatilidad.",
    punto_fuerte: [
      "Claridad comunicacional — todos entienden qué receptor está alineado y su rol esperado",
      "Identificación rápida — coach y QB comunican con nomenclatura universal",
      "Flexibilidad de rol — mismo receptor puede asumir múltiples roles (X, Y, Z, Slot, etc)",
      "Pre-snap lectura — defensa lee nomenclatura para anticipar amenazas",
    ],
    punto_debil: [
      "No es universal — cada ofensiva puede tener variantes en nomenclatura",
      "Confusión potencial — coaching debe ser preciso en asignaciones",
      "Cambios de rol — mismo receptor en posiciones diferentes puede confundir",
    ],
    idealFor:
      "Comunicación interna de equipo. Asignaciones de ruta. Lectura defensiva pre-snap. Fundamental en todos los equipos NFL.",
    diagram: undefined,
  },

  // ─── FORMACIONES ────────────────────────────────
  {
    id: "formation-shotgun",
    name: "Shotgun",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "QB se alinea 5-7 yardas detrás del center. Recibe snap en el aire, no bajo center. Permite lectura completa de la defensa post-snap antes de comprometerse.",
    punto_fuerte: [
      "Lectura post-snap — QB ve todo el field después del snap, mayor información",
      "Tempo rápido para pase — no hay delay de QB bajándose de posición",
      "Antídoto contra blitz — distancia adicional permite identificar presión rápido",
      "Play action más fácil — QB ya está en movimiento",
    ],
    punto_debil: [
      "Carrera más lenta — QB debe iniciar movimiento, toma fracción de segundo más",
      "Snap erróneo — ball en el aire = riesgo de bobble/fumble",
      "Protección vulnerable — OL debe 'reach' más lejos, penetración más fácil",
      "Tiempo de ejecución — desarrolla más lento que formations bajo center",
    ],
    idealFor:
      "Pase primera lectura, tercera larga, situaciones donde timing es crítico. ~70% de snaps en NFL es shotgun porque permite lectura máxima.",
    diagram: "formation-shotgun",
  },

  {
    id: "formation-var-shotgun-empty",
    name: "Shotgun Empty (5 WR, 0 RB)",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "Variante extrema de Shotgun: cinco wide receivers, ningún running back. Máximo spread ofensivo. Pase OBLIGATORIO, defensa en nickel/dime.",
    punto_fuerte: [
      "Pase obligatorio ventaja — defensa espera pase, no puede stack box",
      "Espaciamiento imposible — cinco WR occupy todo ancho, zone coverage imposible",
      "Match-up dominancia — cada WR tiene DB 1-v-1, ventaja recepta",
    ],
    punto_debil: [
      "Carrera imposible — sin RB/bloqueadores, no hay carrera opción",
      "Blitz incontrolable — defensa puede enviar múltiples rusher sin preocupación run",
    ],
    idealFor:
      "Tercera larga profunda, cuando necesitas pase explosivo, vs defensiva en nickel (sin LBs).",
    diagram: "formation-var-shotgun-empty",
  },

  {
    id: "formation-var-shotgun-bunch",
    name: "Shotgun Bunch (WR agrupados)",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "Variante Shotgun donde múltiples WR están agrupados en un lado (bunch). Facilita conceptos de rutas crossing, mesh, pick plays.",
    punto_fuerte: [
      "Crossing facilitado — receivers próximos ejecutan crossing fácilmente",
      "Pick plays naturales — bunch crea contacto legal que ayuda receivers",
      "Lectura defensiva difícil — bunch crea confusión en assignments",
    ],
    punto_debil: [
      "Lado opuesto vulnerable — bunch deja lado opuesto con DBs numerosos",
      "Predecible intención — bunch often = pase esperado",
    ],
    idealFor:
      "Rutas crossing, mesh conceptos, pase primera lectura, vs zone coverage.",
    diagram: "formation-var-shotgun-bunch",
  },

  {
    id: "formation-i",
    name: "I-Form (Pro Set)",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "QB bajo center, running back en línea recta atrás, fullback delante del RB en la misma línea vertical. Formación clásica de poder, énfasis en bloqueo de carrera.",
    punto_fuerte: [
      "Power run game — fullback + OL crean wall físico casi impenetrable",
      "Momentum — peso combinado es difícil de mover",
      "Play action devastador — defensa debe respetar carrera, safeties bajan",
      "Consistencia — bloqueos coordinados generan ganancias predecibles",
    ],
    punto_debil: [
      "Predecible — defensa espera carrera (99% de tiempo en I-form es run)",
      "Lento — toma frames de tiempo para FB + OL ejecutar bloqueos",
      "Gap discipline lo detiene — defensa moderna con gap assignments lo neutraliza",
      "Transición al pase — si pasa (raro), QB necesita tiempo para drop, presión rápida",
    ],
    idealFor:
      "Carreras de poder de 4-5 yardas garantizadas, goal line, situaciones donde necesitas movimiento físico incuestionable.",
    diagram: "formation-i",
  },

  {
    id: "formation-strong-i",
    name: "Strong I (Twin TE I-Form)",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "I-Form con dos tight ends alineados a ambos lados de la línea ofensiva. Variante ultra-pesada de I-Form diseñada para máximo bloqueo físico en carreras de poder.",
    punto_fuerte: [
      "Bloqueo máximo — dos TE + OL + FB crean wall defensivo casi impenetrable",
      "Power incuestionable — cuando necesitas 3-4 yardas garantizadas, Strong I lo entrega",
      "Play action devastador — defensa respeta carrera masivamente, safeties bajan completamente",
      "Consistencia garantizada — bloqueos coordinados generan ganancias predecibles",
    ],
    punto_debil: [
      "Altamente predecible — dos TE en línea = carrera obligatoria (95% de snaps)",
      "Muy lento — dos bloqueadores + coordinación requieren frames adicionales",
      "Pase limitadísimo — si lanza, dos TE no contribuyen y QB vulnerable",
      "Gap penetration la detiene — defensa moderna con gap discipline neutraliza poder",
    ],
    idealFor:
      "Carrera de poder específica (4-5 yardas), goal line, segunda mitad cuando defensa cansada, cuando necesitas movimiento físico garantizado.",
    diagram: "formation-strong-i",
  },

  {
    id: "formation-ace",
    name: "ACE / Singleback",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "QB bajo center, solo un RB en backfield (sin fullback), receptores distribuidos. Flexible y moderno, usado por equipos que priorizan versatilidad sobre poder físico.",
    punto_fuerte: [
      "Máxima flexibilidad — mismos bloqueadores para pase y carrera",
      "Información ofensiva — no hay FB = no hay 'tell' defensivo pre-snap",
      "Spacing profundo — receptores en múltiples niveles crean opciones en todas partes",
      "Moderno — se adapta a defensa cambiante sin reacción lenta",
    ],
    punto_debil: [
      "Poder reducido — sin FB bloqueador, carrera es menos garantizada",
      "Defensa flexible — menos asignaciones predecibles = menos certeza ofensiva",
      "RB vulnerable — bloqueador extra, RB recibe menos protección",
    ],
    idealFor:
      "Ofensivas modernas que priorizan información, teams con QBs que leen bien, pases rápidos y carreras nimble.",
    diagram: "formation-ace",
  },

  {
    id: "formation-var-singlebank-bunch",
    name: "Singlebank Bunch (ACE Bunch)",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "Variante Singlebank con WR/TE agrupados en bunch. Combina versatilidad ACE con facilidad de rutas crossing.",
    punto_fuerte: [
      "Versatilidad + crossing — versatilidad ACE + bunch crossing conceptos",
      "Bloqueo mejorado — bunch permite bloqueo extra si carrera opción",
      "Confusión defensiva — defensa no sabe intención clara (pase/carrera ambiguo)",
    ],
    punto_debil: [
      "Timing crítico — bunched receivers requieren timing preciso",
      "Lado opuesto expuesto — receivers concentrados = espacio lado opuesto",
    ],
    idealFor:
      "Rutas crossing, mesh, pase primera lectura, situaciones todo-propósito.",
    diagram: "formation-var-singlebank-bunch",
  },

  {
    id: "formation-pistol",
    name: "Pistol",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "QB bajo center, pero solo 2-3 yardas atrás (hybrid entre shotgun 5-7 yds y I-form 0 yds). RB en línea recta atrás a misma profundidad que QB. Balance de poder e información.",
    punto_fuerte: [
      "Balance perfecto — mantiene poder de I-form + lectura post-snap de shotgun",
      "Versatilidad — funciona igual para pase que carrera sin telegrafiar",
      "Moderna — adapta sistemas de bloqueo tradicionales a defensa moderna",
      "QB decision making — tiene tiempo de leer sin sacrificar velocidad de ejecución",
    ],
    punto_debil: [
      "Ni lo uno ni lo otro — no tan poderoso como I-form puro, no tan rápido como shotgun puro",
      "QB presión moderada — distancia no es suficiente si defensa vence línea rápido",
    ],
    idealFor:
      "Drive mixto todo-propósito donde necesitas versatilidad sin predecibilidad, equipos modernos que valoran información pre-snap.",
    diagram: "formation-pistol",
  },

  // ─── CONCEPTOS AÉREOS ───────────────────────────// ─── CONCEPTOS AÉREOS ───────────────────────────────────────────────
  {
    id: "aerial-dagger",
    name: "Dagger (Seam Route)",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Receptor corre vertical directamente en el seam (espacio entre dos safeties en cobertura de dos-high). Explota brecha inevitable entre safeties cuando están split.",
    punto_fuerte: [
      "Seam garantizado — siempre existe espacio vertical entre dos safeties split",
      "Ganancia profunda — si completa, típicamente 12+ yardas",
      "Seguridad recepta — si cobertura rotate, receptor deja pasar (no interception)",
      "Simple lectura QB — pre-snap lees si safeties split, post-snap es automático",
    ],
    punto_debil: [
      "Inefectivo vs Cover 1 — safety único lejano puede jugar profundo",
      "Vulnerable a LB blitz — sin tiempo, QB no puede esperar receiver en profundidad",
      "Timing crítico — must time con snap, si slip timing colapsa concepto",
      "Inútil vs Cover 4 — dos deep safeties cada uno en su media cancha, sin seam",
    ],
    idealFor:
      "Vs Cover 2/Cover 3 (split safeties automáticamente crean seam), primera-segunda intentona, cuando OL tiene tiempo para proteger profundidad.",
    diagram: "aerial-dagger",
  },

  {
    id: "aerial-four-verts",
    name: "4 Verts / Verticals",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Cuatro receptores (WR, WR, TE, RB típicamente) corren rutas verticales paralelas a diferentes espacios horizontales. Ataca cobertura profunda forzando múltiples decisiones de seguridad.",
    punto_fuerte: [
      "Cobertura imposible — cuatro receptores verticales = defensa no puede cubrir todos profundo",
      "Garantía uno abierto — matemáticamente siempre hay gap sin coverage",
      "Espaciamiento horizontal — cada receptor en su carril = imposible zone coverage",
      "Explosión vertical — si QB tiene tiempo, ganancia es 15-25 yardas típicamente",
    ],
    punto_debil: [
      "Tiempo requerido — QB necesita mínimo 3 segundos para receptores en profundidad",
      "Blitz asesino — presión rápida = QB no puede esperar, sack automático",
      "Inútil vs Cover 0 — sin safety lejano, corners juegan profundo sin ayuda",
      "Arm talent necesario — distancia es 20+ yardas, requiere QB con brazo",
    ],
    idealFor:
      "Vs Cover 2/Cover 3 (safeties split crean seams profundos), cuando OL puede bloquear 3+ segundos, cuando QB tiene arm fuerte, pase largo necesario.",
    diagram: "aerial-four-verts",
  },

  {
    id: "aerial-mesh",
    name: "Mesh / Crossing Routes",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Dos receptores corren rutas que se cruzan en el field (típicamente deep crossing y intermediate crossing). Crea 'pick' natural donde un receptor obstaculiza defender del otro.",
    punto_fuerte: [
      "Pick defensivo — WR puede crear contacto legal que bloquea a DB",
      "Space creation — defensa mancover lucha contra crossing, zone coverage confundida",
      "QB opciones — siempre hay secondary read si primera opción cubierta",
      "Timing versatilidad — crossing puede ocurrir en múltiples profundidades",
    ],
    punto_debil: [
      "Penalty riesgo — 'pick play' puede ser llamado holding ofensivo si contacto demasiado obvio",
      "Man coverage adaptable — DB individual puede seguir crossing, pick es inútil",
      "Timing crítico — crossing debe ser coordinado, timing falla = confusión ofensiva",
      "Lento desarrollo — crossers típicamente toman 2-3 segundos para separarse",
    ],
    idealFor:
      "Vs Cover 3 (LBs de coverage tienen dilema en crossers), vs zone donde pick es limpio, cuando QB tiene tiempo.",
    diagram: "aerial-mesh",
  },

  {
    id: "aerial-slant",
    name: "Slant Routes",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Receptor corre 45-grados hacia interior del field a 5-7 yards depth. Ruta más rápida en árbol conceptual, ideal para quick game vs presión defensiva.",
    punto_fuerte: [
      "Timing rápido — 1 segundo aire, snap-to-completion es ~2 segundos total",
      "DB aislamiento — WR 1-v-1 vs cornerback de manera clara",
      "YAC potencial — momentum interior + lateral = space after catch en sideline",
      "Presión answer — vs blitz, slant es quick game answer",
    ],
    punto_debil: [
      "Interception riesgo — si timing falls, ball expuesta a CB route",
      "Gap penetration vulnerable — DL que penetra gap opuesto puede intercept",
      "Baja ganancia — típicamente 6-8 yardas, raro 10+",
      "Predictable vs press man — DB en la cara del WR puede presionar ruta",
    ],
    idealFor:
      "Man coverage (slant ama 1-v-1), pase rápido primera lectura, vs presión defensiva, cuando DB está en posición deep.",
    diagram: "aerial-slant",
  },

  {
    id: "aerial-smash",
    name: "Smash (Flood + Corner)",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Dos receptores en mismo nivel (típicamente TE + WR) en mismo zona vertical, uno baja (cornerback route a 10-12 yardas), otro sigue verticalmente. Ambos corren RÁPIDO, crea 'smash' zona donde dos receptores compiten contra uno o dos defenders.",
    punto_fuerte: [
      "Defensivo mismatch — dos receptores compiten contra uno/dos DBs, alguien se abre",
      "Flood concentración — dos receptores en zona estrecha garantizan espacio para uno",
      "QB lectura clara — lectura uno-dos simplísima (arriba o abajo en vertical)",
      "Pase rápido — development es 1-2 segundos, QB puede lanzar rápido",
    ],
    punto_debil: [
      "Vulnerable a blitz — presión rápida no deja tiempo para dos receptores",
      "Interception riesgo — tight window si DB juega profundo",
      "Baja ganancia típicamente — 7-10 yardas es promedio, raro 15+",
    ],
    idealFor:
      "Vs zone coverage (flood es muerte para zone), vs man coverage donde mismatch existe, pase rápido necesario, primera-segunda intentona cuando necesitas seguridad.",
    diagram: "aerial-smash",
  },

  {
    id: "aerial-flood",
    name: "Flood (Trio de Receptores)",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Tres receptores en misma zona vertical/horizontal, típicamente uno profundo (15+ yardas), uno intermedio (10-12 yardas), uno corto (5-7 yardas). Defensa no puede cubrir tres en misma zona — garantiza apertura.",
    punto_fuerte: [
      "Cobertura imposible — tres receptores en zona = defensa no puede cubrir todos",
      "Lectura QB múltiple — uno, dos, tres opciones en misma zona ordenadas por profundidad",
      "QB seguridad — si presión, opción corta siempre abierta",
      "Ataque zona perfecto — zona coverage se desmorona inmediatamente",
    ],
    punto_debil: [
      "Zona predecible — defensa reconoce flood pre-snap, puede preparar response",
      "Blitz letal — presión rápida = todos tres receptores de profundidad",
      "Man coverage adaptable — DB individual puede seguir flooding",
    ],
    idealFor:
      "Vs zone coverage (especialmente Cover 3), cuando necesitas seguridad QB contra presión moderada, cuando tienes tres receptores talentosos en misma zona.",
    diagram: "aerial-flood",
  },

  {
    id: "aerial-stick",
    name: "Stick (Lateral Receivers)",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Dos receptores corren rutas laterales paralelas (ambos abiertos hacia el sideline horizontalmente) a profundidades similares (8-10 yardas). Conceptualmente opuesto a vertical — spread defensivos horizontalmente en lugar de verticalmente.",
    punto_fuerte: [
      "Horizontal spread — fuerza DBs de laterally, zone coverage extendido",
      "YAC potencial — lateral momentum = space after catch fácil en sideline",
      "QB seguridad — dos opciones garantizan una abierta contra zona",
      "Rápido development — 1-2 segundos, timing es crítico pero posible",
    ],
    punto_debil: [
      "Boundary kill — si receptor corre hacia sideline, espacio limitado",
      "Man coverage — DB individual puede seguir lateral fácilmente",
      "Predecible movimiento — lateral flow es obvio defensivamente",
    ],
    idealFor:
      "Vs Cover 3 (LBs de coverage pueden estar confundidos), cuando necesitas sideline movimiento, pase rápido vs presión, vs zone donde horizontal spread ayuda.",
    diagram: "aerial-stick",
  },

  {
    id: "aerial-scissors",
    name: "Scissors (Cross Crossing)",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Dos receptores en misma alineación corren rutas que se cruzan a niveles similares de profundidad. Crean confusion en cobertura man donde DB debe decidir si sigue su receptor o ajusta en el cross.",
    punto_fuerte: [
      "Pick defensivo — receptor A bloquea a DB de receptor B, ambos se abren",
      "Confusión man coverage — man DBs no saben si switch o follow",
      "Espaciamiento garantizado — uno de los dos queda open en el cross",
      "QB lectura simple — dos opciones al mismo nivel, lectura rápida",
    ],
    punto_debil: [
      "Penalty riesgo — contact excessivo puede ser flag ofensivo",
      "Timing crítico — crossing debe coincidir exactamente",
      "Lento desarrollo — requiere 2-3 segundos para separation",
      "Vulnerable a blitz — presión rápida collapsa concepto",
    ],
    idealFor:
      "Vs man coverage, cuando necesitas pick play legal, pase primera/segunda intentona, equipos con receptores versátiles.",
    diagram: "aerial-scissors",
  },

  {
    id: "aerial-yankee",
    name: "Yankee (Deep Crossing)",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Dos receptores en alas corren rutas cruzadas a profundidad profunda (12-15+ yardas). El cruce ocurre profundo, creando confusión entre safeties y DBs sobre coverage.",
    punto_fuerte: [
      "Profundidad ganancia — si completa, 15+ yardas típicamente",
      "Confusión safety — safeties no pueden rotar a tiempo en el cross",
      "Spacing profundo — ambos receptores en zona abierta sin coverage tight",
      "Play-action setup — funciona bien después de establece carrera",
    ],
    punto_debil: [
      "Tiempo requerido — QB necesita 3+ segundos para desarrollo completo",
      "Blitz asesino — presión rápida invalida concepto",
      "Deep ball riesgo — interception posible en long throws",
      "Requiere arm talent — necesita QB con potencia profunda",
    ],
    idealFor:
      "Vs Cover 2 (safeties split crean seams profundos), cuando OL tiene tiempo, cuando quieres ganancia profunda ambiciosa, setup después carrera.",
    diagram: "aerial-yankee",
  },

  {
    id: "aerial-divide",
    name: "Divide (Post + Wheel)",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Dos receptores en misma alineación: uno corre post profundo (20+ yardas), otro corre wheel lateral hacia el borde. Ataca safety lejano y edge defensivo simultáneamente.",
    punto_fuerte: [
      "Dos niveles profundidad — post profundo vs wheel edge, opciones variadas",
      "Safety dilema — safeties no pueden cubrir post + wheel al mismo tiempo",
      "Ganancia explosiva — post genera 20+ yardas, wheel genera RAC",
      "Versatilidad — funciona vs Cover 2 y Cover 4",
    ],
    punto_debil: [
      "Timing preciso — post y wheel deben desarrollarse en sync",
      "Tiempo QB — requiere 3+ segundos para separación completa",
      "Blitz vulnerable — presión rápida invalida tiempo desarrollo",
      "Requiere talento — receptores versátiles + brazo QB",
    ],
    idealFor:
      "Vs Cover 2/Cover 4, cuando OL protege 3+ segundos, buscando ganancia explosiva, cuando quieres explotar safeties deficientes.",
    diagram: "aerial-divide",
  },

  {
    id: "aerial-post-wheel",
    name: "Post Wheel (TE + RB)",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "TE en seam corre post vertical profundo mientras RB en backfield corre wheel lateral. Crea spacing profundo vs profundo donde uno siempre abierto.",
    punto_fuerte: [
      "Mismatch — TE vs safety profundo tiene ventaja recepta",
      "RB escape — wheel lateral da opción segura si post cubierto",
      "Coverage imposible — no hay cobertura que cubra post + wheel con DB",
      "YAC potencial — wheel específicamente crea space después catch",
    ],
    punto_debil: [
      "Development lento — ambos necesitan tiempo separarse",
      "Proteción critica — QB necesita mínimo 2.5 segundos clean pocket",
      "RB assignment — RB debe ejecutar wheel limpio sin hesitación",
      "Timing QB-TE — post requiere timing preciso QB-TE connection",
    ],
    idealFor:
      "Vs Cover 2 (seam abierto), cuando TE elite, cuando RB versátil, segunda/tercera intentona donde necesitas opción de seguridad.",
    diagram: "aerial-post-wheel",
  },

  {
    id: "aerial-slot-fade",
    name: "Slot Fade (TE Vertical)",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Slot receiver o TE alineado en slot corre fade vertical (vertical hacia la esquina profunda). Explota mismatch donde DB de interior no tiene ventaja profunda.",
    punto_fuerte: [
      "Mismatch fade — DB interior vs TE profundo, TE ventaja física/vertical",
      "1-v-1 aislamiento — slot fade crea uno-contra-uno claro",
      "Explosión rápida — fade es ruta rápida, development 2 segundos",
      "Esquina profunda abierta — espacio natural en esquina si coverage rotate",
    ],
    punto_debil: [
      "Depth limitada — fade no es super profunda (típicamente 12-15 yardas)",
      "Press man tricky — DB en la cara del receptor puede molestar fade",
      "One-read only — si DB juega profundo, play mata",
      "Vulnerable blitz — presión rápida invalida tiempo",
    ],
    idealFor:
      "Vs man coverage man con DB interior, cuando TE elite en red zone, buscando ruta rápida con explosión, primera-segunda intentona.",
    diagram: "aerial-slot-fade",
  },

  {
    id: "aerial-mills",
    name: "Mills (Cross + Fade)",
    category: "aerial",
    categoryLabel: "Conceptos Aéreos",
    definition:
      "Dos receptores: uno corre crossing ruta corta (8-10 yardas), otro corre fade profundo (15+ yardas). Crea dos niveles de profundidad en misma zona vertical.",
    punto_fuerte: [
      "Dos niveles opción — cross si DB juega profundo, fade si juega shallow",
      "QB lectura facil — pre-snap lees si DB profundo/shallow, lectura post-snap confirmada",
      "Confusión cobertura — dos profundidades en misma zona overwhelm coverage",
      "Espaciamiento garantizado — uno abierto en cada scenario",
    ],
    punto_debil: [
      "Timing importante — cross + fade deben desarrollarse en sync",
      "Vulnerable blitz — presión rápida mata development",
      "Baja explosión cross — cross típicamente corta, YAC limitado",
      "Requiere precisión QB — timing cross-fade crítico para ejecución",
    ],
    idealFor:
      "Vs Cover 3 (LBs de coverage versus profundidad), cuando necesitas flexibilidad de lectura, primera/segunda intentona, red zone situaciones.",
    diagram: "aerial-mills",
  },

  // ─── CONCEPTOS TERRESTRES ───────────────────────────────────────────
  {
    id: "ground-inside-zone",
    name: "Inside Zone (Zone Run)",
    category: "ground",
    categoryLabel: "Conceptos Terrestres",
    definition:
      "RB corre en zona central de línea ofensiva. OL bloquea en sus gaps individuales (no asignación de defender, sino de ocupar), RB lee bloques y fluye lateralmente buscando espacio más allá de línea de scrimmage.",
    punto_fuerte: [
      "Consistencia — casi garantiza 4-5 yardas sin necesidad de explosión",
      "Flexibilidad de punto de ataque — RB decide izquierda/derecha basado en bloqueo real",
      "Adaptabilidad defensiva — defensa no sabe punto de ataque pre-snap",
      "OL simple — cada lineman: bloquea en dirección del snap, sin decisión pre-snap",
    ],
    punto_debil: [
      "Lentitud de desarrollo — RB debe leer bloques (toma milisegundos cruciales)",
      "DL penetration asesino — si DL ocupa gap en LOS, carrera muere en backfield",
      "Baja explosión — raramente genera 10+ yardas, 5-6 es promedio",
      "Requiere paciencia RB — RB impaciente que corre upfield mata concepto",
    ],
    idealFor:
      "Primera intentona movimiento confiable, drive de campo donde necesitas consistencia, cuando OL tiene ventaja mano-a-mano, setup para carrera edge después.",
    diagram: "ground-inside-zone",
  },

  {
    id: "ground-outside-zone",
    name: "Outside Zone (Stretch)",
    category: "ground",
    categoryLabel: "Conceptos Terrestres",
    definition:
      "RB corre hacia edge (extremo) de línea ofensiva. OL bloquea lateralmente creando 'cut-back lane', RB fluye hacia sideline buscando bloqueador que establece edge.",
    punto_fuerte: [
      "Space creation — RB accede a velocidad en perimeter sin congestión interior",
      "Home run potential — si OL establece edge, espacio es 15-30 yardas potencial",
      "Defensa confundida — exterior flow es difícil de defending gap integrity",
      "WR bloqueo — exterior WRs pueden involucrarse en bloqueo creando ventaja numérica",
    ],
    punto_debil: [
      "Tiempo de desarrollo — requiere RB que espere bloques, defensa tiene tiempo de fluir",
      "Edge rush killer — DE rápido/agresivo puede tackle RB en backfield",
      "OL movilidad requerida — lineman deben ser veloces (no work para lineman lento/grande)",
      "Pérdida potencial — si edge no se establece, RB en backfield (pérdida común)",
    ],
    idealFor:
      "Vs 4-3 defensas que corren upfield (stretch los estira), cuando OL es mobile, cuando RB tiene agilidad + velocidad (no poder puro).",
    diagram: "ground-outside-zone",
  },

  {
    id: "ground-power",
    name: "Power Run / Power O",
    category: "ground",
    categoryLabel: "Conceptos Terrestres",
    definition:
      "OL (especialmente Guard + Fullback) ejecutan 'power point' — bloquean lateral creando punto de ataque definido. Lead blocker (FB/puller) abre hole físicamente, RB sigue directo.",
    punto_fuerte: [
      "Poder imparable — dos bloqueadores en movimiento coordinado = fuerza bruta",
      "Consistencia garantizada — poder generalmente genera 3-4 yardas confiables",
      "Goal line dominancia — cuando defensa necesita penetración, poder la vence",
      "Definido — punto de ataque es conocido, no hay confusión ofensiva",
    ],
    punto_debil: [
      "Predecibilidad — punto de ataque es obvio (defensa puede stack box)",
      "Lentitud — toma tiempo ejecutar bloques coordinados, defensa llega",
      "Gap penetration vulnerable — si LB fluye al hole rápido, muere en LOS",
      "Requiere FB bloqueador — sin FB de calidad, power pierde efectividad",
    ],
    idealFor:
      "Goal line/corta distancia (1-3 yardas donde poder es garantía), cuando necesitas movimiento físico incuestionable, segunda mitad cuando defensa cansada.",
    diagram: "ground-power",
  },

  {
    id: "ground-counter",
    name: "Counter Run / Trap",
    category: "ground",
    categoryLabel: "Conceptos Terrestres",
    definition:
      "Guard o Tackle 'tira' (pull) de su posición original en línea ofensiva, corre lateralmente para bloquear defensivo en el lado opuesto. RB inicialmente fluye en una dirección (fake), luego corre en la dirección opuesta donde tira está ejecutándose. Conceptualmente engaña defensa.",
    punto_fuerte: [
      "Engaño defensivo — defensa fluye hacia fake, guarda bloqueador tira vence en punto real",
      "Explosión potencial — si tira limpio, RB accede a espacio abierto sin congestión",
      "Home run potential — 15-30 yardas posibles si tira ejecuta cleanly",
      "Defensa frustración — counters rompen defensive gap integrity",
    ],
    punto_debil: [
      "Timing crítico — si tira es lento, RB se queda en backfield (pérdida)",
      "Predecible vs discipline — defensa que mantiene gap discipline vs flujo fake es difícil de engañar",
      "Risk de fumble — RB en velocidad con ball es vulnerable a tackles erráticos",
      "OL movilidad requerida — tira debe ser rápido, linemen lento mata play",
    ],
    idealFor:
      "Cuando defensa sobre-fluye hacia punto de ataque fake, vs 4-3 con gap discipline pobre, equipos con OL ágil, play-action pre-set después de varios Inside Zones.",
    diagram: "ground-counter",
  },

  {
    id: "ground-trap",
    name: "Trap Block (Gap Control)",
    category: "ground",
    categoryLabel: "Conceptos Terrestres",
    definition:
      "Guard tira (pull) para bloquear defensivo específico (tipicamente edge rusher o interior DL), en lugar de ejecutar gap normal. Defensivo en gap del tira es dejado abierto ('trapped') — LB o RB puede ser designado para ocupar ese gap.",
    punto_fuerte: [
      "Gap collapse — defensivo específico es 'trapped', gap muere inmediatamente",
      "Numeración ventaja — LB puede ocupar gap abierto después del trap",
      "Definido — punto de ataque es conocido y defensivo específico es target",
      "Consistencia — funciona contra gap integrity fuerte",
    ],
    punto_debil: [
      "Tempo lento — pull requiere frames adicionales, defensa tiene tiempo",
      "Timing exacto — tira debe llegar en fracción de segundo exacta",
      "Predecible vs read defense — defensa que reads blocks puede anticipar trap",
      "RB responsabilidad — RB debe ser patient para que tira llegue",
    ],
    idealFor:
      "Situaciones segunda intentona, cuando defensivo está sobre-extendido, vs edge rushers predecibles, cuando tienes bloqueo de trappee coordinado.",
    diagram: "ground-trap",
  },

  {
    id: "ground-duo",
    name: "Duo (Dual Gap)",
    category: "ground",
    categoryLabel: "Conceptos Terrestres",
    definition:
      "Dos lineman (típicamente Guard + Guard o Guard + Tackle) bloquean coordin adamente DOS gaps diferentes en lugar de uno solo. Crea movimiento dual que abre puntos de ataque múltiples.",
    punto_fuerte: [
      "Dual amenaza — defensa no sabe si carrera va izquierda o derecha (dos gaps)",
      "Poder coordinado — dos bloqueadores juntos crean fuerza coordinada",
      "Adaptabilidad RB — RB puede escoger entre dos gaps abiertos",
      "Confusión defensiva — defensa no sabe qué gap defender antes del snap",
    ],
    punto_debil: [
      "Timing critico — dos bloqueadores deben moverse en perfecto sync",
      "Complejidad OL — más difícil de ejecutar que gap simple",
      "Lentitud desarrollo — coordinación requiere frames adicionales",
      "Requires OL communication — cambios pre-snap complicados si hay ruido",
    ],
    idealFor:
      "Primera intentona versatilidad, cuando OL tiene talento coordinación, vs defensas que se comprometen gaps temprano, situaciones segunda mitad.",
    diagram: "ground-duo",
  },

  {
    id: "ground-iso",
    name: "ISO (Isolation Block)",
    category: "ground",
    categoryLabel: "Conceptos Terrestres",
    definition:
      "Un bloqueador (típicamente TE o RB bloqueador) es designado para aislar un defensivo específico 1-v-1. RB corre hacia gap abierto donde ese defensivo fue aislado. Concepto simple de poder puro.",
    punto_fuerte: [
      "Aislamiento claro — un bloqueador vs un defensivo, 1-v-1 definido",
      "Poder simple — si bloqueo limpio, ganancia garantizada",
      "Gap abierto — defensivo aislado = gap se abre automáticamente",
      "Goal line efectivo — poder puro en corta distancia es efectivo",
    ],
    punto_debil: [
      "Predecible intención — todos saben carrera (defensa puede stack box)",
      "Requiere bloqueador talentoso — bloqueo 1-v-1 sin help es exigente",
      "Vulnerable penetration — si defensivo penetra antes del bloqueo, muere",
      "Baja explosión típicamente — rara generación 10+ yardas, 4-6 promedio",
    ],
    idealFor:
      "Goal line, corta distancia (1-3 yardas), cuando tienes bloqueador TE/RB de calidad, buscando poder incuestionable.",
    diagram: "ground-iso",
  },

  {
    id: "ground-dive",
    name: "Dive (Direct Run)",
    category: "ground",
    categoryLabel: "Conceptos Terrestres",
    definition:
      "RB corre directo (hacia adelante sin lateralidad) sobre gap asignado. QB entrega de manera directa (no pitch). Carrera más rápida en concepto, ideal para corta distancia.",
    punto_fuerte: [
      "Velocidad ejecución — ruta más directa = desarrollo rápido",
      "Simplicidad — no hay lectura RB, gap pre-asignado",
      "Tiempo ganancia rápida — típicamente gana 2-4 yardas rápido",
      "Goal line dominancia — en 1-2 yardas es casi garantizado",
    ],
    punto_debil: [
      "Gap penetration vulnerable — si DL penetra su gap, carrera muere",
      "Baja explosión — 2-4 yardas típicamente, raramente 10+",
      "Predecible intención — todos saben carrera directo",
      "Requiere paciencia OL — no hay espacio para creación post-snap",
    ],
    idealFor:
      "Goal line/corta distancia específicamente (1-2 yardas), situaciones fourth-and-1, cuando necesitas velocidad de ejecución sobre gamble.",
    diagram: "ground-dive",
  },

  {
    id: "ground-pitch",
    name: "Pitch / Toss (Lateral Play)",
    category: "ground",
    categoryLabel: "Conceptos Terrestres",
    definition:
      "QB tira el balón lateralmente (pitch/toss) al RB en el backfield en lugar de entregar hacia adelante. RB recibe en movimiento lateral y fluye hacia edge. Diseñado para crear espacio perimeter.",
    punto_fuerte: [
      "Edge creation — pitch permite RB acceder edge sin congestión interior",
      "Momentum lateral — RB ya en movimiento lateral cuando recibe",
      "Espacio perimeter — menos congestión en edge que interior",
      "WR bloqueo — WRs pueden involucrarse en edge bloqueo",
    ],
    punto_debil: [
      "Timing pitching — QB debe timing pitch perfectamente",
      "Fumble riesgo — lateral = más fumbles potenciales que forward",
      "Desarrollo lento — pitch requiere movimiento adicional",
      "Defensa flow — edge defense puede fluir rápidamente al pitch",
    ],
    idealFor:
      "Cuando RB tiene agilidad/velocidad edge, vs defensas que stack box interior, situaciones perimeter búsqueda espacio, equipos con WR bloqueo versátil.",
    diagram: "ground-pitch",
  },

    {
    id: "nomenclatura-gaps",
    name: "Nomenclatura de GAPs",
    category: "gap-scheme",
    categoryLabel: "Gap Scheme",
    definition:
      "Sistema de identificación de espacios en la línea ofensiva para asignaciones defensivas. GAPs van de adentro hacia afuera: A (entre center y guard), B (entre guard y tackle), C (entre tackle y tight end), D (edge exterior). Cada defensivo se asigna un gap específico en gap-scheme.",
    punto_fuerte: [
      "Claridad defensiva — cada defensivo sabe exactamente qué gap cubrir",
      "Comunicación rápida — nomenclatura universal facilita audibles pre-snap",
      "Assignments simplificadas — no hay ambigüedad en responsabilidades",
      "Control de línea — permite defensa coordinada contra cárreras",
    ],
    punto_debil: [
      "Inflexibilidad — cambios ofensivos pueden romper asignaciones",
      "Requiere disciplina — un defensivo fuera de su gap = brecha completa",
      "Comunicación necesaria — cambios pre-snap complicados si hay ruido",
    ],
    idealFor:
      "Sistemas defensivos que valoran control y disciplina. Gap-scheme plays donde asignaciones claras son críticas. Defensa contra run-heavy ofensivas.",
    diagram: undefined,
  },

// ─── GAP SCHEME ─────────────────────────────────────────────────────
  {
    id: "gap-scheme-intro",
    name: "Gap Scheme — Fundamentos",
    category: "gap-scheme",
    categoryLabel: "Gap Scheme",
    definition:
      "Sistema defensivo-pensado donde cada OL asigna un GAP específico (A, B, C desde adentro hacia afuera). Cada lineman es responsable de ocupar su gap, no de 'reach' lateralmente. Más directo y físico que zone scheme.",
    punto_fuerte: [
      "Definitivo — cada OL sabe exactamente su asignación (gap X = su responsabilidad)",
      "Consistencia — reglas claras generan ejecución predecible",
      "Physicality énfasis — contacto inicial es criterio, no movimiento lateral",
      "Simple lectura RB — gap scheme requiere menos lectura post-snap (gap es predecible)",
    ],
    punto_debil: [
      "Inflexibilidad — si DL se mueve, asignaciones se desmoronan",
      "Lentitud lineal — requiere contacto inicial + mantener, no es rápido",
      "Slant vulnerable — defensa can slant gaps = confusión ofensiva instantánea",
      "No adaptable — cambios defensivos pre-snap requieren audible ofensiva",
    ],
    idealFor:
      "Equipos que valoran poder físico sobre información, offensivas con bloqueadores fuertes, carreras 4-5 yardas consistentes sobre big plays.",
    diagram: "gap-scheme-intro",
  },

  {
    id: "gap-scheme-power",
    name: "Power Run (Gap)",
    category: "gap-scheme",
    categoryLabel: "Gap Scheme",
    definition:
      "Guard + Fullback ejecutan 'seal block' específico en punto de ataque. Guard bloquea defensivo en gap, FB acompaña en movimiento lateral. RB sigue bloqueadores en línea recta predecible.",
    punto_fuerte: [
      "Movimiento coordinado — dos bloqueadores juntos = fuerza combinada imparable",
      "Explosión predecible — RB sabe exactamente dónde ir (no lectura post-snap)",
      "Goal line efectivo — poder es efectivo cuando línea es congestión defensiva",
    ],
    punto_debil: [
      "Lento desarrollo — toma frames para ejecutar dos bloques coordinados",
      "Predecible intención — todos saben dónde va el balón (defensa stack box)",
      "Gap penetration asesino — si DL penetra su gap antes de bloqueo, muere",
    ],
    idealFor:
      "Goal line, situaciones 1-3 yardas necesitadas, cuando necesitas movimiento garantizado sobre gamble.",
    diagram: "gap-scheme-power",
  },

  // ─── PROTECCIONES ───────────────────────────────────────────────────
  {
    id: "protection-man",
    name: "Man Protection",
    category: "protections",
    categoryLabel: "Protecciones",
    definition:
      "Cada OL asignado un defensivo específico 1-v-1. Si defensivo se mueve, OL se mueve con él. RB se queda en backfield como 'hot' (pase rápido) si blitzer no es cubierto.",
    punto_fuerte: [
      "Simplicidad — cada bloqueador: su hombre es su responsabilidad",
      "Versatilidad vs blitz — hot route QB es always available si assignment rompe",
      "Comunicación simple — mínimo audible necesario pre-snap",
      "Defensivo 1-v-1 — si OL gana bloqueo individual, carrera open",
    ],
    punto_debil: [
      "Slant vulnerable — DL slant crea cambios de assignment = confusión",
      "Número blitz — si más blitzers que protectores, alguien queda libre automáticamente",
      "OL technique importante — perder 1-v-1 bloqueo = sack directo (no backup)",
    ],
    idealFor:
      "Vs cobertura predecible donde sabes qué defensivos blitzean, cuando OL tiene ventaja técnica individual.",
    diagram: undefined,
  },

  {
    id: "protection-zone",
    name: "Zone Protection / Slide",
    category: "protections",
    categoryLabel: "Protecciones",
    definition:
      "OL protege zona (izquierda, derecha, medio) no defensivo individual. Si defensivo entra la zona, OL en esa zona lo bloquea. Más flexible que man — adapta a blitz números.",
    punto_fuerte: [
      "Flexibilidad blitz — extra blitzer simplemente entra una zona, OL adapta",
      "Slant tolerante — DL slant está gobernado por zona (no cambia assignment)",
      "Mejor flujo — OL se mueven como unidad cohesiva, no individuals",
      "RB release — si zona roto, RB puede liberar rápido como safety valve",
    ],
    punto_debil: [
      "Asignación vaga — OL puede perder en zona, confusión sobre responsabilidad",
      "Penetración vulnerable — DL rápido penetra, rompe zona antes de adjustment",
      "Lectura post-snap importante — OL debe leer flujo defensivo, toma tiempo",
    ],
    idealFor:
      "Vs blitz sorpresa (zona adapta automáticamente), cuando DL es técnico (slants/stunts), pases que requieren máxima flexibilidad.",
    diagram: undefined,
  },

  // ─── SISTEMAS / FILOSOFÍAS OFENSIVAS ────────────────────────────────

  {
    id: "sistemas-west-coast",
    name: "West Coast Offense",
    category: "sistemas",
    categoryLabel: "Sistemas Ofensivos",
    definition:
      "Filosofía de control ofensivo basada en pases cortos (3-5 pasos) como extensión del juego de carrera. Énfasis en precisión, timing y toma de decisiones rápida del quarterback.",
    punto_fuerte: [
      "Control de posesión — pases cortos mantienen el balón, control de clock",
      "Consistencia — ganancias predecibles de 4-8 yardas por snap",
      "Precisión ganancia — YAC versátil crea ganancias variadas desde pases cortos",
      "Defensa predecible — pases cortos fuerzan defensa pre-snap commitments",
    ],
    punto_debil: [
      "Explosión limitada — pases cortos raramente generan 20+ yardas",
      "Tiempo QB requerido — necesita QBs con precisión excelente",
      "Depende YAC — si receptores no ganan espacio, ganancia es limitada",
    ],
    idealFor:
      "Equipos que valoran control sobre explosión. Primera-segunda intentona. Controladores de clock cuando vas ganando. Requiere precisión QB elite.",
    diagram: undefined,
  },

  {
    id: "sistemas-air-coryell",
    name: "Air Coryell",
    category: "sistemas",
    categoryLabel: "Sistemas Ofensivos",
    definition:
      "Ofensiva que estira el campo VERTICALMENTE mediante rutas intermedias (12-18 yards) dirigidas a Tight Ends y corredores versátiles. Requiere QB con brazo fuerte.",
    punto_fuerte: [
      "Vertical explosión — ganancias intermedias de 12-18 yardas consistentes",
      "TE dominancia — TE como receptor primario, no bloqueador",
      "Mismatch exploitation — runners versátiles crean mismatches contra LBs",
      "Intermediate control — explota seams entre LBs y safeties",
    ],
    punto_debil: [
      "Tiempo de desarrollo — rutas intermedias requieren 2-3 segundos",
      "Brazo QB requerido — necesita QB con potencia profunda",
      "Inefectivo vs Cover 1 — safety único puede jugar profundo",
    ],
    idealFor:
      "Vs Cover 2 (safeties split crean seams). Equipos con TE elite. Buscando ganancias intermedias consistentes.",
    diagram: undefined,
  },

  {
    id: "sistemas-air-raid",
    name: "Air Raid",
    category: "sistemas",
    categoryLabel: "Sistemas Ofensivos",
    definition:
      "Filosofía de máximo spread (4-5 WR) con ritmo de juego acelerado (no-huddle). Simplifica lecturas de QB usando conceptos de rutas repetitivos.",
    punto_fuerte: [
      "Spread dominancia — múltiples WR fuerzan defensa a meter DBs profundos",
      "Tempo rápido — no-huddle evita defensiva de ajustes",
      "Lectura simple QB — rutas repetitivas permiten 1-2 lecturas máximo",
      "Confusión defensiva — ritmo rápido no permite coordinación defensiva",
    ],
    punto_debil: [
      "Vulnerable a carrera — sin RB/bloqueadores, carrera es débil",
      "Presión QB constante — protección limitada sin RB",
      "Predecible intención — everyone sabe pase (defensa en nickel)",
    ],
    idealFor:
      "Tercera larga profunda. QBs jóvenes que necesitan simplificación. Atacar cobertura débil.",
    diagram: undefined,
  },

  {
    id: "sistemas-shanahan",
    name: "Shanahan Scheme (Outside Zone + Play-Action)",
    category: "sistemas",
    categoryLabel: "Sistemas Ofensivos",
    definition:
      "Esquema dominante moderno. Combina carreras de zona lateral (Outside Zone) con play-action pass masivos. Énfasis en movimiento coordinado OL.",
    punto_fuerte: [
      "Flexibilidad total — zona exterior + play-action = defensa no sabe punto de ataque",
      "Consistencia carrera — 4-5 yardas garantidas sin complejidad alta",
      "Play-action engaño — movimiento de carrera confunde safeties (bajan)",
      "Moderno adaptable — funciona contra todos los esquemas defensivos",
    ],
    punto_debil: [
      "Requiere OL movilidad — lineman deben ser ágiles (no lento/grande)",
      "Desarrollo medio — zona exterior requiere lectura post-snap",
      "Timing coordinación — OL debe ejecutar movimiento preciso",
    ],
    idealFor:
      "Todas las situaciones. Estándar moderno. Equipos que valoran flexibilidad.",
    diagram: undefined,
  },

  {
    id: "sistemas-spread",
    name: "Spread Offense",
    category: "sistemas",
    categoryLabel: "Sistemas Ofensivos",
    definition:
      "Filosofía de alinear QB en Shotgun rodeado de múltiples WR (4+) para ocupar todo el ancho del campo. Objetivo: forzar defensa retirar LBs y meter DBs profundos.",
    punto_fuerte: [
      "Espacio creación — alineaciones abiertas reducen defensores en box",
      "1-v-1 DB — crea matchups WR vs DB favorables",
      "Pase rápido versatilidad — pases rápidos y lateral fáciles",
      "Carrera espacio — menos defensores en box = carreras rápidas posibles",
    ],
    punto_debil: [
      "Bloqueo reducido — sin TE/FB, protección limitada",
      "Carrera poder limitado — sin bloqueadores coordinados, poder limitado",
      "Presión QB — sin protección extra, QB bajo presión constante",
    ],
    idealFor:
      "Equipos con WR elite. Tercera larga. Cuando defensa es fuerte frontalmente.",
    diagram: undefined,
  },

  {
    id: "sistemas-rpo",
    name: "RPO (Run-Pass Option)",
    category: "sistemas",
    categoryLabel: "Sistemas Ofensivos",
    definition:
      "En la misma jugada, QB lee un defensor clave en el snap. Si defiende pase, QB entrega al RB. Si ataca carrera, QB lanza pase rápido.",
    punto_fuerte: [
      "Defensa dilema — no puede defender carrera y pase simultáneamente",
      "QB decisión rápida — toma split-second basada en read defensivo",
      "Versatilidad opción — mismo play puede ser carrera o pase post-snap",
      "Integración universal — usado por todas las ofensivas modernas",
    ],
    punto_debil: [
      "Timing crítico — QB debe leer defensivo rápido (mili-segundo)",
      "RB riesgo — si QB se queda, RB en backfield sin carrera option",
      "Entrenamiento requerido — requiere coordinación QB-RB-receivers",
    ],
    idealFor:
      "Todas las situaciones. Herramienta universal en ofensivas modernas.",
    diagram: undefined,
  },

  {
    id: "sistemas-power-run",
    name: "Power Run / Pro-Style",
    category: "sistemas",
    categoryLabel: "Sistemas Ofensivos",
    definition:
      "Filosofía de control de reloj y desgaste defensivo mediante bloqueos de avance rápido (gap schemes). Usa formaciones pesadas con Fullbacks.",
    punto_fuerte: [
      "Consistencia garantizada — 4-5 yardas esperadas por carry",
      "Poder incuestionable — dos bloqueadores coordinados = fuerza bruta",
      "Goal line dominancia — cuando defensa necesita penetración, poder la vence",
      "Clock control — carrera lenta quema tiempo, controla poseción",
    ],
    punto_debil: [
      "Predecibilidad — punto de ataque obvio (defensa puede stack box)",
      "Lentitud desarrollo — coordinar bloques requiere frames adicionales",
      "Gap penetration vulnerable — si LB fluye rápido, muere en LOS",
      "Requiere FB — sin FB bloqueador de calidad, poder pierde efectividad",
    ],
    idealFor:
      "Goal line/corta distancia (1-3 yardas). Equipos con OL/FB elite. Cuando defensa cansada (segunda mitad).",
    diagram: undefined,
  },

  {
    id: "sistemas-option",
    name: "Option Offense (Read Option / Wildcat)",
    category: "sistemas",
    categoryLabel: "Sistemas Ofensivos",
    definition:
      "Filosofía que maximiza QBs atléticos con capacidad de carrera mediante Read Option, Pistol, o Wildcat formations.",
    punto_fuerte: [
      "QB carrera amenaza — defensa debe defender QB como runner adicional",
      "Defensa incertidumbre — ¿quién corre? QB o RB ambiguo",
      "Velocidad borde — QB atlético puede explotar edge defensivo",
      "Opción adicional — herramienta situacional que añade dimensión",
    ],
    punto_debil: [
      "Requiere QB atlético — QB debe ser rápido (no QB puro)",
      "Inefectivo vs gap discipline — defensa moderna neutraliza fácilmente",
      "Incertidumbre bloqueador — RB no sabe si corre o bloquea pre-snap",
      "Uso situacional — no es filosofía base, solo arma sorpresa",
    ],
    idealFor:
      "Equipos con QBs móviles (Lamar, Jalen, etc). Tercera corta. Sorpresa situacional.",
    diagram: undefined,
  },

  // ─── PENALIDADES ───────────────────────────────────────────────────

  {
    id: "penalties-offensive",
    name: "Penalidades Ofensivas",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Infracciones cometidas por el equipo ofensivo que resultan en pérdida de yardas, repetición de downs, o ambos. Las penalidades más comunes en ofensiva incluyen offsides, holding, movimiento ilegal en línea, y bloqueos ilegales.",
    punto_fuerte: [
      "Información defensiva — penalidades pueden indicar debilidad en protección",
      "Oportunidad de ajuste — penalidades ofensivas permiten a defensa notar patrones",
    ],
    punto_debil: [
      "Pérdida de yardas automática — típicamente 5-15 yardas",
      "Repetición de downs — loss of down adicional en algunos casos",
      "Momentum negativo — equipo pierde confianza con penalidades",
      "Oportunidad defensiva — penalidades dan segunda oportunidad a defensa",
    ],
    idealFor:
      "Entendimiento de reglas. Disciplina ofensiva. Evitar penalidades innecesarias en situaciones críticas (goal line, tercera intentona).",
    diagram: undefined,
  },

  {
    id: "penalties-defensive",
    name: "Penalidades Defensivas",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Infracciones cometidas por el equipo defensivo que resultan en avance automático de la ofensiva. Las penalidades más comunes en defensa incluyen holding defensivo, interferencia de pase, offsides, contacto ilegal en cornerback, y roughing the passer.",
    punto_fuerte: [
      "Oportunidad ofensiva — movimiento automático de ofensiva",
      "Drives extendidos — penalidades permiten ofensiva continuar drives",
      "Momentum ofensivo — penalidades defensivas aumentan confianza ofensiva",
    ],
    punto_debil: [
      "Pérdida de ventaja defensiva — penalidades anulan plays defendidas perfectamente",
      "Yardaje automático — típicamente 5-15 yardas dependiendo la penalidad",
      "Campo creciente — penalidades acercan a ofensiva a end zone",
      "Frustraciones defensivas — múltiples penalidades pueden demoralizan defensa",
    ],
    idealFor:
      "Disciplina defensiva. Técnica limpia. Entendimiento de reglas (roughing passer, PI, contacto ilegal). Crítico en tercera intentona donde penalidades extienden drives.",
    diagram: undefined,
  },
];
