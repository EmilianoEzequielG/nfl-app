export interface TacticConcept {
  id: string;
  name: string;
  category: "formations" | "fronts" | "coverage" | "blitz" | "glossary" | "penalties";
  categoryLabel: string;
  definition: string;
  strengths: string[];
  weaknesses: string[];
  idealFor: string;
  diagram?: string;
}

export const defensiveContent: TacticConcept[] = [
  // ─── FORMACIONES DEFENSIVAS ────────────────────────────────────────
  {
    id: "def-form-43",
    name: "4-3 Defense",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "Cuatro linemen defensivos, tres linebackers. Formación defensiva equilibrada diseñada para ser versátil contra carreras y pases.",
    strengths: [
      "Equilibrio run/pass — 4 defensas de línea vs 5 ofensivos crea ventaja numérica en defensas de carrera",
      "Versatilidad LB — tres linebackers pueden jugar tanto defensas de carrera como cobertura de pase",
      "Múltiples opciones de blitz — fácil crear presión defensiva adicional desde los LBs",
      "Ocupación de gaps efectiva — 4 defensas de línea cubren los gaps principales, LBs manejan gaps secundarios",
    ],
    weaknesses: [
      "Vulnerable a spread — contra 4-5 receptores, solo 4 defensas de línea no pueden presionar suficientemente",
      "Mismatch RB en cobertura — linebackers son más lentos que running backs en rutas cortas",
      "Cobertura de pase larga débil — linebackers tienen dificultad en cobertura profunda contra tight ends",
    ],
    idealFor:
      "Situaciones todo-propósito (primera-segunda intentona), cuando necesitas defensa equilibrada.",
    diagram: "def-form-43",
  },

  {
    id: "def-form-34",
    name: "3-4 Defense",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "Tres linemen defensivos, cuatro linebackers. Enfoque defensivo que busca presión agresiva mediante múltiples opciones de blitz desde los linebackers.",
    strengths: [
      "Opciones de blitz versátiles — cuatro linebackers cumplen múltiples funciones de presión",
      "Defensa de carrera fuerte — cuatro linebackers + tres defensas de línea especializados llenan gaps efectivamente",
      "Presión de flancos — linebackers pueden atacar desde los edges para crear presión",
      "Adaptabilidad — linebackers pueden leer y reaccionar a carreras o pases post-snap",
    ],
    weaknesses: [
      "Requiere especialización — defensas de línea deben ser fuertes en gap control",
      "Vulnerable a pases profundos — con solo tres defensas de línea, hay menos cobertura profunda",
      "Dependencia de blitz timing — si el blitz falla o es retrasado, el quarterback tiene tiempo",
      "Necesita talento de linebacker — linebackers deben ser ágiles para cobertura de pase",
    ],
    idealFor:
      "Defensas que buscan presión constante, contra ofensivas predecibles de carrera, con linebackers talentosos.",
    diagram: "def-form-34",
  },

  {
    id: "def-form-nickel",
    name: "Nickel Package (5 DB)",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "Tres defensas de línea, dos linebackers, cinco defensive backs. Paquete defensivo especializado en cobertura de pase, sacrificando defensa de carrera.",
    strengths: [
      "Cobertura profunda mejorada — cinco defensive backs proporcionan help profundo para pases verticales",
      "Flexibilidad de cobertura — permite defensas man-to-man contra todos los receptores",
      "Blitz de cornerback — cornerbacks pueden atacar desde posiciones de profundidad",
      "Ventaja en emparejamientos — cada defensive back tiene especialización contra su receptor",
    ],
    weaknesses: [
      "Defensa de carrera débil — solo cinco defensores contra cinco ofensivos, ventaja ofensiva",
      "Requiere penetración DL — defensas de línea deben penetrar rápidamente o el running back escapa",
      "Altamente predecible — defensa pasa a pase, la ofensiva puede atacar con carreras",
    ],
    idealFor:
      "Tercera larga, situaciones de pase obvio (final de partido, puntaje atrás), contra ofensivas spread.",
    diagram: "def-form-nickel",
  },

  {
    id: "def-form-dime",
    name: "Dime Package (6 DB)",
    category: "formations",
    categoryLabel: "Formaciones",
    definition:
      "Tres defensas de línea, un linebacker, seis defensive backs. Paquete defensivo extremo enfocado únicamente en cobertura de pase profundo.",
    strengths: [
      "Cobertura aérea máxima — seis defensive backs hacen casi imposible encontrar receptores abiertos",
      "Flexibilidad man-to-man — seis defensive backs permiten defensas individuales garantizadas contra todos los receptores",
      "Opciones de presión — cornerbacks y safeties pueden atacar desde posiciones profundas",
    ],
    weaknesses: [
      "Defensa de carrera inexistente — solo tres defensas de línea y un linebacker contra cinco ofensivos",
      "Altamente predecible — la ofensiva sabe que la defensa solo cubrirá pase, puede atacar con carreras",
      "Vulnerable a jugadas cortas — screens y swing passes tienen cobertura ligera",
    ],
    idealFor:
      "Tercera larga extrema (20+ yardas), situaciones de pase obligatorio (Hail Mary), final de partido.",
    diagram: "def-form-dime",
  },

  // ─── FRENTES ───────────────────────────────────────────────────────
  {
    id: "front-under",
    name: "Under Front",
    category: "fronts",
    categoryLabel: "Frentes",
    definition:
      "Alineación defensiva enfocada en el lado débil de la ofensiva. El nose tackle alinea sobre el centro, defensas de línea penetran hacia el lado débil.",
    strengths: [
      "Penetración en lado débil — defensas de línea ocupan gaps rápidamente",
      "Presión de línea concentrada — múltiples defensas en un área crean superioridad numérica",
      "Disrupción de pases — penetración rápida genera presión sobre el quarterback",
    ],
    weaknesses: [
      "Lado fuerte desprotegido — menos defensores disponibles para contener carreras hacia el lado fuerte",
      "Vulnerable a bloqueos de pull — fullback o guard pueden alcanzar linebackers lateralmente",
      "Desequilibrio defensivo — numeración defensiva desventajosa en el lado fuerte",
    ],
    idealFor:
      "Contra quarterbacks móviles, cuando quieres penetración directa en un área específica.",
    diagram: "front-under",
  },

  {
    id: "front-over",
    name: "Over Front",
    category: "fronts",
    categoryLabel: "Frentes",
    definition:
      "Alineación defensiva enfocada en el lado fuerte de la ofensiva. Defensas de línea se alinean sobre la mayoría ofensiva para controlar los gaps principales.",
    strengths: [
      "Superioridad numérica — dos a tres defensas de línea contra dos a tres ofensivos crea control del lado fuerte",
      "Control de gaps efectivo — defensores ocupan los gaps donde típicamente ocurren las carreras",
      "Simplifica leer del linebacker — linebacker central tiene lectura más clara sin complejidad de bloques",
    ],
    weaknesses: [
      "Lado débil expuesto — menos defensores disponibles en el lado débil",
      "Vulnerable a jugadas de counter — ofensiva puede engañar a defensas que fluyen hacia el lado fuerte",
      "Linebacker de lado débil aislado — linebacker puede quedar en mismatch 1v1 contra bloqueador",
    ],
    idealFor:
      "Contra ofensivas que corren predeciblemente hacia el lado fuerte, cuando identificas los puntos de ataque.",
    diagram: "front-over",
  },

  {
    id: "front-even",
    name: "Even Front (Gap Pairs)",
    category: "fronts",
    categoryLabel: "Frentes",
    definition:
      "Alineación defensiva donde DL alinean directamente en los gaps pares (B-gaps y D-gaps). Nose tackle alinea entre guards en uno de los gaps, otros DL llenan gaps alternados. Contrasta con Odd que alinea en gaps impares.",
    strengths: [
      "Control de gaps pares — DL ocupan gaps donde carreras laterales comienzan",
      "Defensa lateral efectiva — carreras hacia los edges son contenidas en gaps pares",
      "Simplicidad alineación — posiciones claras para cada DL",
      "Run defense robusto — pairing de gaps es defensivamente sólido contra carreras predecibles",
    ],
    weaknesses: [
      "Vulnerable a carreras A-gap — si no hay apoyo LB, gaps A están expuestos",
      "Menos penetración central — nose position en B/D no penetra tan profundo como en A",
      "Presión reducida — DL en gaps vs gap pueden ser menos agresivos que reading gaps",
    ],
    idealFor:
      "Contra ofensivas que prefieren carreras de poder en B/D gaps, equipos que valoran run defense lateral sobre presión DL interior.",
    diagram: "front-even",
  },

  {
    id: "front-odd",
    name: "Odd Front (Gap Singles)",
    category: "fronts",
    categoryLabel: "Frentes",
    definition:
      "Alineación defensiva donde DL alinean directamente frente al centro y gaps impares (A-gaps, C-gaps). Nose tackle alinea sobre el centro, otros DL llenan gaps impares alternativamente. Énfasis en penetración central.",
    strengths: [
      "Control A-gap — nose sobre center cierra A-gaps inmediatamente",
      "Penetración central fuerte — DL en gaps impares penetran centro línea rápidamente",
      "Bloqueo de potencia — poder run game requiere ocupación A-gap, Odd lo dificulta",
      "Gap dominance — control de gaps impares es fundamental para run defense moderno",
    ],
    weaknesses: [
      "B/D gap vulnerable — si no hay apoyo LB, D-gaps pueden estar expuestos",
      "Lateral carrera exposure — carreras laterales hacia B/D pueden tener espacio",
      "Presión variable — penetración depende de lectura DL post-snap",
    ],
    idealFor:
      "Contra ofensivas con poder run central (I-form, gap scheme), equipos que priorizan control A-gap sobre defensas laterales.",
    diagram: "front-odd",
  },

  // ─── COBERTURAS ────────────────────────────────────────────────────
  {
    id: "cov-cover-0",
    name: "Cover 0 (Man Free / All Out Blitz)",
    category: "coverage",
    categoryLabel: "Coberturas",
    definition:
      "Todos los defensive backs juegan hombre a hombre sin safety de ayuda. Defensa apuesta que la presión rompe el pase antes de que se complete.",
    strengths: [
      "Presión máxima — seis o más defensores atacan versus cinco bloqueadores ofensivos",
      "Cobertura individual clara — cada defensive back tiene responsabilidad específica",
      "Disrupción ofensiva — la ofensiva no puede ejecutar su esquema de pase diseñado",
    ],
    weaknesses: [
      "Sin ayuda defensiva profunda — si el quarterback tiene tiempo, receptores libres ganarán sus enfrentamientos 1v1",
      "Vulnerable a juegos cortos — screen passes y swing passes tienen solo cobertura DB individual",
      "Extremadamente riesgosa — si la presión falla, touchdown prácticamente garantizado",
    ],
    idealFor:
      "Tercera larga cuando la defensa está adelante en el marcador, situaciones donde necesitas forzar una mala decisión.",
    diagram: "cov-cover-0",
  },

  {
    id: "cov-cover-1",
    name: "Cover 1 (Man Coverage)",
    category: "coverage",
    categoryLabel: "Coberturas",
    definition:
      "Todos los defensive backs juegan hombre a hombre con un safety de ayuda profunda. Balance entre cobertura man y protección profunda.",
    strengths: [
      "Claridad de responsabilidades — cada defensive back tiene receptor específico asignado",
      "Presión flexible — permite blitz de linebackers mientras mantiene cobertura man",
      "Ayuda profunda — safety puede asistir si un receptor gana separación profundamente",
      "Cobertura definitiva — man coverage sin ambigüedad de zones",
    ],
    weaknesses: [
      "Requiere talento DB — defensive backs deben ser ágiles y físicos",
      "Vulnerable a rutas cortas — slant routes pueden escapar de cobertura individual rápidamente",
      "Juegos de pick y contacto — receptores pueden usar contacto legal para librarse de defensores",
    ],
    idealFor:
      "Cuando necesitas presión combinada con cobertura, cuando tienes defensive backs talentosos.",
    diagram: "cov-cover-1",
  },

  {
    id: "cov-cover-2",
    name: "Cover 2 (Two-Deep / Safeties Split)",
    category: "coverage",
    categoryLabel: "Coberturas",
    definition:
      "Dos safeties profundas divididas, cada una cubriendo su mitad del campo. Cornerbacks juegan zona por debajo. Enfoque defensivo conservador en cobertura profunda.",
    strengths: [
      "Cobertura profunda garantizada — dos safeties aseguran protección en profundidad",
      "Seams cerrados — protección entre safeties elimina rutas de seam efectivas",
      "Run support — safeties pueden reaccionar rápidamente a carreras",
      "Ayuda lateral — safeties pueden mover lateralmente para ayudar en el lado del balón",
    ],
    weaknesses: [
      "Vulnerable en zona intermedia — área de 8-12 yardas tiene cobertura débil",
      "Running back receptor — running backs pueden escalar contra cobertura zone de cornerback",
      "Presión limitada — solo cuatro a cinco defensores atacan versus cinco ofensivos",
    ],
    idealFor:
      "Contra pases profundos verticales, cuando necesitas cobertura conservadora con run support.",
    diagram: "cov-cover-2",
  },

  {
    id: "cov-cover-3",
    name: "Cover 3 (Three-Deep / Tampa 2 Variant)",
    category: "coverage",
    categoryLabel: "Coberturas",
    definition:
      "Tres defensores profundos (dos cornerbacks y un safety). Dos linebackers cubriendo zona en nivel medio. Énfasis en cobertura profunda triple.",
    strengths: [
      "Cobertura profunda triple — tres defensores profundos cubren toda la profundidad del campo",
      "Seams protegidos — distribución de tres defensores profundos cierra rutas de seam",
      "Flexibilidad de linebacker — dos linebackers pueden reaccionar a carrera o pase",
      "Defensa versátil — menos común, puede confundir timing ofensivo",
    ],
    weaknesses: [
      "Zona intermedia abierta — área de 6-12 yardas tiene cobertura débil",
      "Vulnerable a rutas laterales — curl routes y flat routes pueden estar abiertas",
      "Presión limitada — solo cuatro a cinco defensores atacan",
    ],
    idealFor:
      "Contra pases profundos verticales, cuando quieres cobertura profunda sin presión agresiva.",
    diagram: "cov-cover-3",
  },

  {
    id: "cov-cover-4",
    name: "Cover 4 (Quarters / Four-Deep)",
    category: "coverage",
    categoryLabel: "Coberturas",
    definition:
      "Cuatro defensores profundos, cada uno responsable de un cuarto del campo. Máxima cobertura profunda con distribución defensiva extendida.",
    strengths: [
      "Cobertura profunda cuádruple — cada defensor profundo cubre su área, protección garantizada",
      "Limita big plays — distancia profunda está completamente controlada",
      "Run support — defensores profundos pueden reaccionar a carreras rápidamente",
    ],
    weaknesses: [
      "Zona intermedia abierta — área de 6-12 yardas tiene cobertura muy débil",
      "Presión mínima — solo tres a cuatro defensores atacan versus cinco ofensivos",
      "Tiempo para el quarterback — sin presión significativa, el quarterback tiene tiempo ilimitado",
    ],
    idealFor:
      "Cuando necesitas evitar big plays profundos (final de partido), en situaciones defensivas conservadoras.",
    diagram: "cov-cover-4",
  },

  {
    id: "cov-cover-5",
    name: "Cover 5 (Five-Deep / Middle 2)",
    category: "coverage",
    categoryLabel: "Coberturas",
    definition:
      "Dos safeties profundas divididas en la zona media. Dos cornerbacks o safeties adicionales en la línea para run support. Balance entre profundidad y ayuda en carrera.",
    strengths: [
      "Run support mejorado — safeties pueden reaccionar rápidamente a carreras",
      "Protección en seams — safeties medios protegen rutas de seam",
      "Flexibilidad defensiva — safeties pueden ajustar alto o bajo según situación",
      "Balance ofensiva/defensiva — defensa no se compromete completamente a un aspecto",
    ],
    weaknesses: [
      "Vulnerable a pases verticales — wide receivers pueden alcanzar profundidad en seams",
      "Zona intermedia débil — cornerbacks en caja defensiva = área de 6-12 yardas expuesta",
      "Requiere reacción rápida — defensa debe leer y reaccionar post-snap",
    ],
    idealFor:
      "Situaciones mixtas (primera-segunda intentona), contra ofensivas que corren frecuentemente.",
    diagram: "cov-cover-5",
  },

  {
    id: "cov-cover-6",
    name: "Cover 6 (Cover 2/Cover 4 Split Field)",
    category: "coverage",
    categoryLabel: "Coberturas",
    definition:
      "Cobertura dividida: una mitad del campo juega Cover 2 (dos safeties profundas), otra mitad juega Cover 4 (quarterback profundo). Adaptación defensiva por lado del campo.",
    strengths: [
      "Flexibilidad por lado — cada mitad tiene cobertura diferente según amenaza ofensiva",
      "Ajuste selectivo — defensa adapta cobertura basada en alineación de receptores",
      "Cobertura profunda adaptable — protección profunda se ajusta dinámicamente",
      "Confunde timing — ofensiva no sabe que cobertura enfrentar pre-snap",
    ],
    weaknesses: [
      "Requiere comunicación — defensive backs deben coordinar y reconocer split rápidamente",
      "Pueden haber inconsistencias — si los defensive backs no coordinan bien, coverage falla",
      "Zona de transición débil — límite entre mitades puede tener agujeros",
    ],
    idealFor:
      "Contra ofensivas que distribuyen receptores por lado del campo, cuando necesitas flexibilidad defensiva.",
    diagram: "cov-cover-6",
  },

  {
    id: "cov-cover-7",
    name: "Cover 7 (Zone + Blitz Híbrida)",
    category: "coverage",
    categoryLabel: "Coberturas",
    definition:
      "Cobertura zone híbrida con tres defensores profundos, dos intermedios, y safeties con capacidad de blitz. Combina zona con presión ofensiva.",
    strengths: [
      "Presión flexible — permite blitz de safeties mientras zone defensiva se mantiene",
      "Cobertura profunda — tres defensores profundos protegen profundidad",
      "Incertidumbre ofensiva — combinación de zona y presión confunde timing",
    ],
    weaknesses: [
      "Extremadamente compleja — requiere coordinación y comunicación perfecta",
      "Timing crítico — si el blitz falla, coverage zona se desmorona rápidamente",
      "Requiere talento — defensive backs deben entender zones y leer receptores post-snap",
    ],
    idealFor:
      "Defensas talentosas, tercera larga cuando necesitas presión combinada con cobertura zone.",
    diagram: "cov-cover-7",
  },

  {
    id: "cov-cover-8",
    name: "Cover 8 (Heavy Blitz + Skeleton Coverage)",
    category: "coverage",
    categoryLabel: "Coberturas",
    definition:
      "Máximo blitz con seis a siete defensores atacando, cobertura mínima con safeties y un linebacker. Defensa apuesta que rompe el pase antes de completación.",
    strengths: [
      "Presión máxima — seis a siete defensores atacan versus cinco bloqueadores",
      "Caos ofensivo — números defensivos abrumadores comprometen ejecución ofensiva",
      "Oportunidades de turnover — presión defensiva genera posibilidad de intercepciones",
    ],
    weaknesses: [
      "Cobertura comprometida — si la presión falla, solo safeties en cobertura = touchdown fácil",
      "Extremadamente riesgosa — un blitz fallido resulta en big play ofensivo",
      "Predecible — ofensiva ve números defensivos y anticipa presión",
    ],
    idealFor:
      "Situaciones de desperation (necesita anotación), cuando equipo está atrás con poco tiempo.",
    diagram: "cov-cover-8",
  },

  {
    id: "cov-cover-9",
    name: "Cover 9 (Double Coverage Selectiva)",
    category: "coverage",
    categoryLabel: "Coberturas",
    definition:
      "Dos defensive backs asignados al mismo receptor (típicamente el wide receiver estrella). Otros receptores en cobertura individual. Estrategia defensiva selectiva.",
    strengths: [
      "Neutraliza amenaza primaria — doble cobertura previene que el receptor estrella sea efectivo",
      "Control del playmaker principal — receptor elite está completamente cubierto",
      "Limita opciones ofensivas — si el receptor primario está cubierto, rutas alternativas deben trabajar",
    ],
    weaknesses: [
      "Otros receptores exponibles — otros wide receivers en cobertura individual 1v1",
      "Mismatch con running back — running back puede explotar linebacker en cobertura individual",
      "Requiere presión — sin presión defensiva, otros receptores se desarrollan",
    ],
    idealFor:
      "Contra ofensivas dependientes de un receptor estrella, cuando necesitas neutralizar la única amenaza ofensiva.",
    diagram: "cov-cover-9",
  },

  // ─── BLITZ/PRESIONES ───────────────────────────────────────────────
  {
    id: "blitz-corner",
    name: "Corner Blitz",
    category: "blitz",
    categoryLabel: "Blitz/Presiones",
    definition:
      "Cornerback ataca hacia el quarterback desde posición profunda de cobertura. Presión defensiva sorpresa, requiere timing preciso.",
    strengths: [
      "Efecto sorpresa — ofensiva no anticipa blitz de cornerback desde profundidad",
      "Presión inesperada — quarterback no ve la amenaza acercarse del secondary",
      "Disrupción de timing — rompe el ritmo ofensivo esperado",
    ],
    weaknesses: [
      "Riesgo de cobertura — si el blitz falla, cornerback fuera de posición = big play profundo",
      "Requiere velocidad de DB — cornerback debe ser rápido para llegar al quarterback",
      "Timing crítico — timing impreciso resulta en menor efectividad del blitz",
    ],
    idealFor:
      "Tercera larga predecible, situaciones sorpresa cuando defensa está adelante.",
    diagram: "blitz-corner",
  },

  {
    id: "blitz-safety",
    name: "Safety Blitz",
    category: "blitz",
    categoryLabel: "Blitz/Presiones",
    definition:
      "Safety profundo ataca hacia el quarterback desde la profundidad defensiva. Presión no asignada que sorprende a la ofensiva.",
    strengths: [
      "Presión inesperada — ofensiva no anticipa blitz de safety desde profundidad",
      "Desbalance numérico — safety no está bloqueado en la línea ofensiva",
      "Disrupción táctica — confunde asignaciones ofensivas de bloqueo",
    ],
    weaknesses: [
      "Riesgo defensivo grave — si el blitz falla, safety fuera de posición = touchdown",
      "Distancia del safety — safety desde profundidad toma tiempo para llegar al quarterback",
      "Ofensiva adaptación — ofensiva puede ajustar si safety blitza frecuentemente",
    ],
    idealFor:
      "Situaciones donde sabes que será pase (tercera larga), cuando necesitas presión desesperada.",
    diagram: "blitz-safety",
  },

  {
    id: "blitz-mike",
    name: "Mike Linebacker Blitz",
    category: "blitz",
    categoryLabel: "Blitz/Presiones",
    definition:
      "Linebacker central (Mike) ataca hacia el quarterback, abandonando responsabilidad de carrera. Blitz defensivo clásico, a menudo anticipado pero timing variable.",
    strengths: [
      "Timing flexible — ofensiva anticipa posibilidad de blitz pero no conoce exactamente cuándo",
      "Opciones de gap — linebacker central puede llenar múltiples gaps antes de blitzar",
      "Playmaker impactante — linebacker central es típicamente tackler dominante si llega",
    ],
    weaknesses: [
      "Bloqueo extra — ofensiva puede asignar running back adicional para bloquear",
      "Gap defensivo — si linebacker abandona su gap, run defense vulnera ese espacio",
      "Lectura fácil — quarterback puede leer blitz y audible rápidamente",
    ],
    idealFor:
      "Situaciones todo-propósito, cuando linebacker central es playcaller defensivo.",
    diagram: "blitz-mike",
  },

  {
    id: "blitz-zone-fire",
    name: "Zone Blitz (Fire Zone)",
    category: "blitz",
    categoryLabel: "Blitz/Presiones",
    definition:
      "Blitz defensivo donde un linebacker ataca (típicamente Mike o Will) mientras un DL retrocede a cobertura de pase (zona). Crea confusión ofensiva: OL espera blitz directo pero DL desaparece a cobertura, LB es libre de atacar sin bloqueo designado.",
    strengths: [
      "Confusión ofensiva máxima — OL asigna a DL que retrocede = blitzer LB no es bloqueado",
      "Presión inesperada — quarterback anticipa presión DL, LB es sorpresa",
      "Flexibilidad coverage — DL en zona mantiene protección profunda mientras LB blitza",
      "Timing variable — ofensiva no puede predecir exactamente dónde es presión",
    ],
    weaknesses: [
      "Ejecución crítica — DL debe reconocer y retroceder, LB debe identificar blitz",
      "Comunicación necesaria — coordinación defensa debe ser perfecta",
      "OL adaptación — ofensiva que identifica zone blitz puede explotar DL retrocedido",
      "Coverage vulnerable — DL en zona puede no estar en posición ideal de cobertura",
    ],
    idealFor:
      "Equipos con comunicación defensiva excelente, cuando quieres presión con flexibilidad de cobertura, tercera larga donde confusión es ventaja.",
    diagram: "blitz-zone-fire",
  },

  // ─── GLOSARIO ──────────────────────────────────────────────────────
  {
    id: "glos-coverage-synonym",
    name: "Cobertura Defensiva (Terminología)",
    category: "glossary",
    categoryLabel: "Glosario",
    definition:
      "Sistema de asignación defensiva de DBs a receptores. Los términos 'coverage' y 'cobertura' son sinónimos. Tipos: man coverage (individual), zone coverage (por área), hybrid (mix de ambos).",
    strengths: [
      "Claridad — saber terminología permite entender estrategia defensiva",
      "Ofensiva read — QB puede leer cobertura pre-snap y audible",
    ],
    weaknesses: [],
    idealFor: "Referencia, entender conversación defensiva.",
    diagram: "glos-coverage-synonym",
  },

  {
    id: "glos-receiver-names",
    name: "Nomenclatura de Receptores (X, Y, Z, H, F)",
    category: "glossary",
    categoryLabel: "Glosario",
    definition:
      "Sistema de etiquetado de receptores sin referencias de nombres. X = WR izquierda, Z = WR derecha, Y = TE, H = TE segundo (halfback/heavy), F = fullback. Permite designación rápida sin conocer número de jugador.",
    strengths: [
      "Comunicación rápida — defensa puede llamar asignación sin jugador nombre",
      "Independencia personal — coverage funciona si personnel cambia",
    ],
    weaknesses: [],
    idealFor: "Referencia para entender playcalls defensivos.",
    diagram: "glos-receiver-names",
  },

  {
    id: "glos-gap-assignments",
    name: "Gap Assignments (A, B, C Gaps)",
    category: "glossary",
    categoryLabel: "Glosario",
    definition:
      "Sistema de numeración de gaps entre ofensivos linemen. Desde center outward: A-gap (entre center-guard), B-gap (entre guard-tackle), C-gap (entre tackle-end). Defensivos usan para coordinación gap-filling.",
    strengths: [
      "Coordinación simple — todos saben qué gap cubrir sin complejidad",
      "Run defense effectiveness — gap-filling correcto previene carreras grandes",
    ],
    weaknesses: [],
    idealFor: "Referencia para entender run defense.",
    diagram: "glos-gap-assignments",
  },

  {
    id: "glos-cornerback-technique",
    name: "Técnica de Cornerback (Press vs Off)",
    category: "glossary",
    categoryLabel: "Glosario",
    definition:
      "Press = CB alineado a 0-1 yards del WR, contacto permitido hasta 5 yards. Off = CB alineado 8-10 yards, sin contacto inicial, juega read/react. Press impide pase rápido, Off permite profundidad de lectura.",
    strengths: [
      "Press — disrupción de timing ofensivo, previene ruta cortas",
      "Off — permite lectura segura, menos penalty risk, mejor profundidad help",
    ],
    weaknesses: [
      "Press — vulnerable a slant/quick release, riesgo de PI (pass interference)",
      "Off — WR puede alcanzar profundidad sin obstáculo inicial",
    ],
    idealFor:
      "Press en tercera corta/man coverage, Off en zone/pase larga cuando quieres help.",
    diagram: "glos-cornerback-technique",
  },

  {
    id: "glos-blitz-package",
    name: "Blitz Package (Presión Coordinada)",
    category: "glossary",
    categoryLabel: "Glosario",
    definition:
      "Combinación de blitz (rusher adicionales) + coverage detrás. Típicamente 6-7 rusher vs 5 OL. Requiere coordinación perfecta o cobertura volcadura.",
    strengths: [
      "Presión numérica — 6 rusher vs 5 OL = QB siempre bajo presión",
      "Ofensiva incertidumbre — múltiples blitz looks confunde protección",
    ],
    weaknesses: [
      "Cobertura volcadura riesgo — si blitz falla, receptores libres",
      "Timing crítico — un milisegundo off = big play ofensiva",
    ],
    idealFor:
      "Tercera larga, situaciones specific (rojo zone, must-have), sorpresa.",
    diagram: "glos-blitz-package",
  },

  // ─── GLOSARIO DE PENALIDADES ───────────────────────────────────────
  {
    id: "pen-false-start",
    name: "False Start",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Ofensiva: Un jugador ofensivo (excepto QB) se mueve antes del snap. Indicador de jugada incompleta. Penalización: 5 yardas, repetición del down.",
    strengths: [
      "Costo mínimo — solo 5 yardas no es castigo devastador",
      "Lectura defensiva — indica nerviosismo o coordinación pobre ofensiva",
    ],
    weaknesses: [
      "Interferencia de juego — ofensiva pierde oportunidad de ejecución",
      "Penalidad evitable — mala disciplina del equipo ofensivo",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-holding-off",
    name: "Holding (Ofensiva)",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Ofensiva: Bloqueador ofensivo sostiene a defensivo agarrando uniforme o cuerpo más allá del punto de contacto. Penalización: 10 yardas, repetición del down.",
    strengths: [
      "Costo significativo — 10 yardas es penalidad grande",
      "Indica cobertura defensiva fuerte — que requiere bloqueo extra",
    ],
    weaknesses: [
      "Pérdida de yardaje — retroceso 10 yardas daña drive ofensivo",
      "Repetición del down — no es automático first down",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-holding-def",
    name: "Holding (Defensiva)",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Defensiva: Defensor sostiene a bloqueador/receptor agarrando uniforme o cuerpo. Penalización: 5 yardas (antes del snap), 10 yardas + automatic first down (después del snap).",
    strengths: [
      "Primer down automático — ofensiva recibe ventaja significativa",
      "Yardaje donado — 10 yardas favor de ofensiva",
    ],
    weaknesses: [
      "Penalidad defensiva — más costosa que holding ofensiva",
      "Indica técnica defensiva pobre — contacto ilegal con bloqueador/receptor",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-offside",
    name: "Offside",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Defensiva: Defensor cruza la línea de scrimmage antes del snap. Penalización: 5 yardas, automatic first down para ofensiva.",
    strengths: [
      "Automatic first down — ofensiva gana línea de ganancia",
      "Penalidad defensiva — defensa penalizada por temprana",
    ],
    weaknesses: [
      "Falta de disciplina defensiva — timing incorrecto del defensor",
      "Yardaje donado — 5 yardas favor de ofensiva",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-pass-int-off",
    name: "Pass Interference (Ofensiva)",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Ofensiva: Receptor impide que defensor interfiera con pase en trayectoria. Contacto ilegal antes de catch. Penalización: 10 yardas.",
    strengths: [
      "Penalidad moderada — 10 yardas castigo",
      "Regla protege cobertura defensiva — impide bloqueo de DBs",
    ],
    weaknesses: [
      "Penalidad ofensiva — reduce ganancia ofensiva",
      "Pérdida de yardaje — retroceso 10 yardas",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-pass-int-def",
    name: "Pass Interference (Defensiva)",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Defensiva: Defensor impide que receptor atrape pase en trayectoria. Contacto antes del catch. Penalización: automatic first down + yardaje completo (down defensivo o receptor) hasta primera mitad del campo.",
    strengths: [
      "Automatic first down — ofensiva gana línea de ganancia",
      "Yardaje completo — si es defensa deep, es castigo severo",
    ],
    weaknesses: [
      "Penalidad muy costosa — defensa penalizada significativamente",
      "Indica técnica defensiva pobre — contact illegal en receptor",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-roughing-passer",
    name: "Roughing the Passer",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Defensiva: Defensor hace contacto innecesario con quarterback después del release de pase. Golpear con casco, caer sobre QB, o contacto fuera del tubería. Penalización: 15 yardas + automatic first down.",
    strengths: [
      "Automatic first down — ofensiva gana línea de ganancia grande",
      "Penalidad severa — 15 yardas es castigo grande",
    ],
    weaknesses: [
      "Penalidad muy costosa — defensa penalizada significativamente",
      "Puede decidir drive — penalidad tardía puede cambiar resultado de drive",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-illegal-formation",
    name: "Illegal Formation",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Ofensiva: Ofensiva no cumple requisitos de formación legal (menos de 7 jugadores en línea, más de 4 en backfield). Penalización: 5 yardas, repetición del down.",
    strengths: [
      "Costo mínimo — solo 5 yardas",
      "Rara en juego profesional — coordinadores aseguran formación legal",
    ],
    weaknesses: [
      "Penalidad ofensiva — pérdida de oportunidad",
      "Indica coordinación pobre — error de esquema",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-delay-game",
    name: "Delay of Game",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Ofensiva: Equipo no snapea dentro de tiempo permitido (40 segundos reloj de juego). Penalización: 5 yardas, repetición del down.",
    strengths: [
      "Costo mínimo — solo 5 yardas",
      "Evitable — reloj es visible para ofensiva",
    ],
    weaknesses: [
      "Penalidad ofensiva — pérdida de down y oportunidad",
      "Indica problemas de comunicación — ofensiva no coordinada",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-unnecessary-roughness",
    name: "Unnecessary Roughness",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Ofensiva/Defensiva: Contacto excesivo o violento más allá de necesario para juego. Golpes con casco, tackles fuera de control. Penalización: 15 yardas + automatic first down (si ofensiva comete) o 15 yardas (si defensiva comete).",
    strengths: [
      "Penalidad severa — 15 yardas es castigo significativo",
      "Protege seguridad — regla impide violencia excesiva",
    ],
    weaknesses: [
      "Penalidad grande — 15 yardas puede decidir drive",
      "Puede ser controversial — definición de 'unnecessary' es subjetiva",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-facemask",
    name: "Facemask",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Ofensiva/Defensiva: Jugador agarra el facemask del casco de oponente. Penalización: 15 yardas (contacto directo/violento) o 5 yardas (accidental/incidental).",
    strengths: [
      "Penalidad severa — 15 yardas para violación clara",
      "Protege seguridad — impide agarre peligroso de casco",
    ],
    weaknesses: [
      "Penalidad grande — 15 yardas puede decidir drive",
      "Puede ser controversial — distingo entre incidental/directo es subjetivo",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },

  {
    id: "pen-illegal-motion",
    name: "Illegal Motion",
    category: "penalties",
    categoryLabel: "Penalidades",
    definition:
      "Ofensiva: Más de un backfield player en movimiento en momento de snap, o motion player cruza línea de scrimmage antes de snap. Penalización: 5 yardas, repetición del down.",
    strengths: [
      "Costo mínimo — solo 5 yardas",
      "Evitable — movimiento es controlado por ofensiva",
    ],
    weaknesses: [
      "Penalidad ofensiva — pérdida de down y oportunidad",
      "Indica coordinación pobre — ofensiva no preparada",
    ],
    idealFor: "Referencia de reglas y penalidades",
    diagram: undefined,
  },
];
