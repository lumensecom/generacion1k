// Módulo de mentalidad ganadora.
//
// Va aparte del resto del contenido porque no se consume igual: los otros
// módulos se leen una vez y se ejecutan; este se vuelve a abrir el día que
// algo sale mal. Por eso se organiza en pestañas —principios, videos, libros
// y actividades— en vez de en una secuencia con test al final.

export interface Principio {
  n: number;
  titulo: string;
  frase: string;
  cuerpo: string;
  enLaPractica: string;
}

export const PRINCIPIOS: Principio[] = [
  {
    n: 1,
    titulo: 'El valle no es una señal de que te equivocaste',
    frase: 'Todo el que llegó, pasó por aquí.',
    cuerpo:
      'Hay un punto, casi siempre entre la semana tres y la seis, donde ya gastaste dinero, ya trabajaste y todavía no hay resultados. Ahí es donde abandona la mayoría, y no porque el negocio no funcione: porque interpretan el valle como un veredicto en vez de como una etapa.',
    enLaPractica:
      'Escribe hoy, antes de estar ahí, qué vas a hacer cuando llegue. La decisión tomada en frío vale mucho más que la que vas a tomar desanimado.',
  },
  {
    n: 2,
    titulo: 'Decisiones, no resultados',
    frase: 'Se juzga el proceso, no el marcador.',
    cuerpo:
      'Una buena decisión puede salir mal y una mala puede salir bien: en pauta eso pasa todas las semanas. Si juzgas tus decisiones por cómo salieron, vas a aprender lecciones falsas — abandonar cosas que funcionaban y repetir cosas que solo tuvieron suerte.',
    enLaPractica:
      'Antes de cambiar algo, escribe por qué lo cambias y qué esperas que pase. Cuando sepas el resultado, vuelve a leerlo. Ahí es donde se aprende de verdad.',
  },
  {
    n: 3,
    titulo: 'Velocidad de ejecución sobre perfección',
    frase: 'Publicado mediocre le gana a perfecto sin publicar.',
    cuerpo:
      'La tienda perfecta que sale en dos meses pierde contra la tienda decente que sale en cinco días, porque la segunda lleva siete semanas recibiendo datos reales. El mercado responde preguntas que tú no puedes contestar pensando.',
    enLaPractica:
      'Ponle fecha límite a cada tarea antes de empezarla. Si algo lleva más del doble de lo previsto, publícalo como esté y arréglalo con datos.',
  },
  {
    n: 4,
    titulo: 'El dinero de pauta es información, no apuesta',
    frase: 'No perdiste $200. Compraste una respuesta.',
    cuerpo:
      'Cuando una campaña no vende, la lectura cómoda es "perdí la plata". La lectura útil es que pagaste por saber que ese ángulo, ese creativo o ese público no funcionan. El que trata la pauta como apuesta se paraliza; el que la trata como investigación sigue avanzando.',
    enLaPractica:
      'Después de cada campaña que apagues, escribe en una línea qué compraste con ese dinero. Si no puedes contestarlo, el problema no fue el gasto: fue que no mediste.',
  },
  {
    n: 5,
    titulo: 'Tu entorno pesa más que tu disciplina',
    frase: 'La fuerza de voluntad se acaba; el entorno no.',
    cuerpo:
      'Nadie sostiene meses de trabajo a base de motivación. Lo que sostiene es que sea más fácil hacerlo que no hacerlo: una hora bloqueada en el calendario, el teléfono en otra habitación, gente alrededor que está en lo mismo.',
    enLaPractica:
      'Cambia una sola cosa de tu entorno esta semana. Una. Y que sea de las que quitan fricción, no de las que exigen voluntad.',
  },
  {
    n: 6,
    titulo: 'Compara contra tu semana pasada',
    frase: 'El único marcador que significa algo.',
    cuerpo:
      'Vas a ver gente facturando miles en su primer mes. Unos mienten, otros llevaban años en esto y otros tuvieron suerte. Compararte con eso solo te da ansiedad y decisiones apuradas — subir presupuesto antes de tiempo, cambiar de producto sin datos.',
    enLaPractica:
      'Cada domingo, dos líneas: qué sabías hacer el domingo pasado y qué sabes hacer hoy. Ese es tu marcador.',
  },
];

export interface Libro {
  titulo: string;
  autor: string;
  porQue: string;
  paraCuando: string;
}

// Solo referencia: título, autor y por qué le sirve a alguien que está
// montando esto. Sin resúmenes que sustituyan la lectura — la idea es que
// lo lea, no que crea que ya lo leyó.
export const LIBROS: Libro[] = [
  {
    titulo: 'Hábitos atómicos',
    autor: 'James Clear',
    porQue:
      'El más práctico de la lista. Trata justo el problema de este negocio: sostener trabajo diario durante meses sin ver resultados inmediatos.',
    paraCuando: 'Empieza por este si solo vas a leer uno.',
  },
  {
    titulo: 'Mindset: la actitud del éxito',
    autor: 'Carol Dweck',
    porQue:
      'Explica con investigación detrás por qué dos personas con el mismo revés reaccionan distinto. Da nombre a lo que vas a sentir cuando una campaña falle.',
    paraCuando: 'Cuando te descubras pensando "esto no es para mí".',
  },
  {
    titulo: 'El obstáculo es el camino',
    autor: 'Ryan Holiday',
    porQue:
      'Estoicismo aplicado a los negocios. Útil para la parte que nadie te cuenta: los proveedores que fallan, las cuentas restringidas, los pedidos devueltos.',
    paraCuando: 'Para las semanas en que todo se cae a la vez.',
  },
  {
    titulo: 'Deep Work',
    autor: 'Cal Newport',
    porQue:
      'Si trabajas o estudias además de esto, tu problema no es falta de tiempo: es falta de tiempo concentrado. Este va de eso.',
    paraCuando: 'Si te sientas dos horas y solo rindes veinte minutos.',
  },
  {
    titulo: '$100M Offers',
    autor: 'Alex Hormozi',
    porQue:
      'Menos mentalidad y más oferta, pero cambia cómo piensas el negocio: deja de ser "qué producto vendo" y pasa a ser "qué oferta hago irrechazable".',
    paraCuando: 'Cuando ya tengas producto y quieras subir el margen.',
  },
  {
    titulo: 'Los 7 hábitos de la gente altamente efectiva',
    autor: 'Stephen Covey',
    porQue:
      'El clásico. Denso y lento comparado con los otros, pero la idea de empezar con el final en mente ordena un negocio que todavía no existe.',
    paraCuando: 'Para leer despacio, un capítulo por semana.',
  },
];

export interface Actividad {
  n: number;
  titulo: string;
  duracion: string;
  cuando: string;
  pasos: string[];
  porQueFunciona: string;
}

export const ACTIVIDADES: Actividad[] = [
  {
    n: 1,
    titulo: 'La carta al que va a querer rendirse',
    duracion: '20 min, una sola vez',
    cuando: 'Hoy, antes de empezar',
    pasos: [
      'Escribe una carta dirigida a ti mismo dentro de seis semanas.',
      'Cuéntale por qué empezaste esto y qué querías cambiar de tu vida.',
      'Dile qué le vas a decir cuando quiera abandonar, con tus palabras.',
      'Guárdala donde puedas encontrarla. Ponle recordatorio para dentro de 6 semanas.',
    ],
    porQueFunciona:
      'Cuando llegue el valle no vas a estar en condiciones de convencerte. El que sí está en condiciones eres tú hoy, con energía y sin haber perdido nada todavía.',
  },
  {
    n: 2,
    titulo: 'Diario de decisiones',
    duracion: '3 min por decisión',
    cuando: 'Cada vez que cambies algo en el negocio',
    pasos: [
      'Antes de cambiar algo, escribe: qué cambio, por qué, y qué espero que pase.',
      'Ponle fecha y no lo toques más.',
      'Cuando sepas el resultado, vuelve y escribe qué pasó de verdad.',
      'Una vez al mes, léelos todos de corrido.',
    ],
    porQueFunciona:
      'Sin esto, la memoria reescribe la historia: recuerdas haber previsto lo que salió bien y olvidas lo que fallaste. El diario es lo único que te dice si estás mejorando al decidir o solo teniendo suerte.',
  },
  {
    n: 3,
    titulo: 'El inventario de excusas',
    duracion: '15 min',
    cuando: 'Semana 1 y semana 6',
    pasos: [
      'Escribe las diez razones por las que esto podría no funcionarte.',
      'Marca cuáles dependen de ti y cuáles no.',
      'De las que dependen de ti, elige UNA y ponle solución esta semana.',
      'En la semana 6, vuelve a la lista y tacha las que ya no aplican.',
    ],
    porQueFunciona:
      'Las excusas pesan mientras están sueltas en la cabeza. Escritas y separadas entre las que controlas y las que no, casi siempre se descubre que la mayoría dependía de uno.',
  },
  {
    n: 4,
    titulo: 'Bloque de noventa minutos',
    duracion: '90 min al día',
    cuando: 'Todos los días laborables',
    pasos: [
      'Elige la franja del día en la que mejor rindes, no la que te sobra.',
      'Bloquéala en el calendario como si fuera una cita con un cliente.',
      'Teléfono en otra habitación. No en la mesa boca abajo: en otra habitación.',
      'Una sola tarea por bloque, decidida la noche anterior.',
    ],
    porQueFunciona:
      'Noventa minutos concentrados rinden más que seis horas interrumpidas, y son sostenibles si además trabajas o estudias. Decidir la tarea la noche anterior evita gastar el mejor momento del día eligiendo qué hacer.',
  },
  {
    n: 5,
    titulo: 'Revisión de domingo',
    duracion: '10 min',
    cuando: 'Cada domingo',
    pasos: [
      'Qué sabía hacer el domingo pasado que no sabía hacer antes.',
      'Qué decisión tomé esta semana de la que estoy orgulloso, salga como salga.',
      'Qué voy a hacer distinto la semana que viene. Una cosa, no cinco.',
    ],
    porQueFunciona:
      'Es el marcador que sí controlas. En un negocio donde las ventas tardan, medir aprendizaje en vez de facturación es lo que sostiene el ritmo las primeras semanas.',
  },
];
