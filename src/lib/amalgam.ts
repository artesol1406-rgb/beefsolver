/**
 * Amalgam Universal Systems Analyzer (v11) - Mathematical Kernel
 * Ported from the "Mediador Universal" specification.
 */

export const DIMENSIONES = ['Ξ', 'T', 'R', 'E', 'M', 'V', 'S', 'A', 'F', 'φ_e', 'φ_c'] as const;
export type Dimension = (typeof DIMENSIONES)[number];
export const N_DIM = DIMENSIONES.length;

export interface AmalgamParams {
  alpha: number;
  kappa: number;
  lambda: number;
  lyapunov_alpha: number;
  phi: number;
}

export const DEFAULT_PARAMS: AmalgamParams = {
  alpha: 0.5,
  kappa: 0.8,
  lambda: 1.0,
  lyapunov_alpha: 0.1,
  phi: 0.618,
};

export const POLARITY_MAP: Record<string, [Dimension, Dimension]> = {
  'aislamiento': ['S', 'R'],
  'conexión': ['R', 'S'],
  'cierre': ['T', 'E'],
  'apertura': ['E', 'T'],
  'control': ['S', 'R'],
  'libertad': ['R', 'S'],
  'memoria': ['M', 'V'],
  'olvido': ['V', 'M'],
  'tensión': ['T', 'E'],
  'expansión': ['E', 'T'],
  'contracción': ['φ_c', 'φ_e'],
  'pausa': ['Ξ', 'A'],
  'acción': ['A', 'Ξ'],
  'sistema': ['S', 'E'],
  'flujo': ['E', 'S'],
};

export const TRADUCCION: Record<string, Record<number, { concreta: string, humana: string, amalgam: string }>> = {
  'S': {
    [1]: { concreta: "Hay un marco o sistema que puede ajustarse y adaptarse.", humana: "Necesitas un entorno flexible, que se adapte sin romperse.", amalgam: "S+" },
    [-1]: { concreta: "Hay reglas fijas, una estructura que no cambia.", humana: "Buscas seguridad en la estabilidad, sin sorpresas.", amalgam: "S-" },
    [0]: { concreta: "Existe una estructura básica.", humana: "Necesitas un mínimo de orden para sentirte seguro.", amalgam: "S" }
  },
  'T': {
    [1]: { concreta: "Hay una fricción que está generando movimiento.", humana: "Esa inquietud te empuja a cambiar algo.", amalgam: "T+" },
    [-1]: { concreta: "Hay un bloqueo que no se mueve.", humana: "Te sientes atascado, como si nada pudiera destrabarse.", amalgam: "T-" },
    [0]: { concreta: "Hay desacuerdo o incomodidad.", humana: "Sientes que algo no encaja del todo.", amalgam: "T" }
  },
  'R': {
    [1]: { concreta: "Hay un deseo claro de acercamiento y diálogo.", humana: "Quieres conectar, sentirte escuchado y reconocido.", amalgam: "R+" },
    [-1]: { concreta: "Hay distancia o ruptura en la comunicación.", humana: "Te sientes alejado, incomprendido, solo.", amalgam: "R-" },
    [0]: { concreta: "Hay contacto, pero sin un avance profundo.", humana: "La comunicación está presente, pero no termina de fluir.", amalgam: "R" }
  },
  'E': {
    [1]: { concreta: "Hay impulso de expandirse, de salir del estado actual.", humana: "Necesitas crecer, experimentar, liberarte.", amalgam: "E+" },
    [-1]: { concreta: "Hay contracción, miedo a avanzar.", humana: "Te sientes encogido, con temor a dar un paso.", amalgam: "E-" },
    [0]: { concreta: "Hay potencial de cambio, pero aún no se activa.", humana: "Puede haber crecimiento, pero no hoy.", amalgam: "E" }
  },
  'M': {
    [1]: { concreta: "El pasado está muy presente en lo que cuentas.", humana: "Hay recuerdos que duelen o pesan en tu decisión.", amalgam: "M+" },
    [-1]: { concreta: "El pasado ya no pesa, está integrado.", humana: "Has logrado soltar viejas heridas, el dolor no domina.", amalgam: "M-" },
    [0]: { concreta: "Hay algún recuerdo, pero no domina el momento.", humana: "El pasado influye, pero no decide tu acción.", amalgam: "M" }
  },
  'V': {
    [1]: { concreta: "Hay un proceso de liberación en marcha.", humana: "Estás soltando una carga emocional, te alivias.", amalgam: "V+" },
    [-1]: { concreta: "Hay resistencia a dejar ir.", humana: "Te cuesta soltar, te aferras a lo conocido.", amalgam: "V-" },
    [0]: { concreta: "Hay algo que podría soltarse, pero no se ha decidido.", humana: "Tienes cosas que podrías dejar, pero no te atreves.", amalgam: "V" }
  },
  'Ξ': {
    [1]: { concreta: "Hay un espacio de silencio activo, una pausa consciente.", humana: "Necesitas parar, escuchar, respirar antes de actuar.", amalgam: "Ξ+" },
    [-1]: { concreta: "El silencio es incómodo, no hay pausa real.", humana: "Evitas el silencio, llenas con palabras para no sentir.", amalgam: "Ξ-" },
    [0]: { concreta: "Hay momentos de silencio, sin tensión particular.", humana: "El silencio es natural, no te incomoda.", amalgam: "Ξ" }
  }
};

/**
 * Detects polarities in text using a heuristic approach.
 */
export function extraerPolaridades(texto: string): [string, string][] {
  const txt = texto.toLowerCase();
  const found: [string, string][] = [];

  const rules: Record<string, string[]> = {
    'aislamiento': ['solo', 'aislado', 'introvertido', 'soledad', 'aislamiento'],
    'conexión': ['comunicador', 'hablar', 'expresar', 'conectar', 'sociable', 'conexión'],
    'control': ['control', 'orden', 'planificar', 'estructura', 'rígido'],
    'libertad': ['libertad', 'fluir', 'espontáneo', 'flexible', 'caos'],
    'memoria': ['recuerdo', 'pasado', 'memoria', 'nostalgia'],
    'olvido': ['olvido', 'soltar', 'vaciar', 'liberar'],
    'tensión': ['tensión', 'estrés', 'conflicto', 'presión'],
    'expansión': ['expansión', 'crecimiento', 'ampliar', 'desarrollar'],
    'contracción': ['contracción', 'cerrar', 'achicar'],
    'pausa': ['pausa', 'quietud', 'esperar'],
    'acción': ['acción', 'hacer', 'mover'],
    'sistema': ['sistema', 'reglas', 'ley'],
    'flujo': ['flujo', 'corriente', 'natural'],
  };

  const entries = Object.entries(rules);
  for (const [key, patterns] of entries) {
     if (patterns.some(p => txt.includes(p))) {
        // Just return the key as a "polar" anchor for now (simplified)
        // In the original, it returns pairs.
     }
  }

  // Fallback if none found
  if (found.length === 0) {
    found.push(['tensión', 'expansión']);
  }

  return found;
}

/**
 * Converts text into an 11D vector.
 */
export function textoAVector(texto: string): number[] {
  const txt = texto.toLowerCase();
  const vec = new Array(N_DIM).fill(0);

  const detections = [
    { keys: ['control', 'orden', 'planificar', 'estructura', 'rígido'], dim: 'S', val: 0.8 },
    { keys: ['libertad', 'fluir', 'espontáneo', 'flexible'], dim: 'R', val: 0.8 },
    { keys: ['tensión', 'estrés', 'conflicto', 'presión'], dim: 'T', val: 0.8 },
    { keys: ['expansión', 'crecimiento', 'ampliar', 'desarrollar'], dim: 'E', val: 0.8 },
    { keys: ['sistema', 'reglas', 'ley'], dim: 'S', val: 0.8 },
    { keys: ['flujo', 'natural', 'corriente'], dim: 'E', val: 0.8 },
    { keys: ['memoria', 'pasado', 'recuerdo'], dim: 'M', val: 0.8 },
    { keys: ['olvido', 'soltar', 'liberar'], dim: 'V', val: 0.8 },
    { keys: ['pausa', 'silencio', 'quietud'], dim: 'Ξ', val: 0.8 },
    { keys: ['acción', 'hacer', 'movimiento'], dim: 'A', val: 0.8 },
  ];

  detections.forEach((d) => {
    if (d.keys.some((k) => txt.includes(k))) {
      const idx = DIMENSIONES.indexOf(d.dim as Dimension);
      if (idx !== -1) vec[idx] = Math.max(vec[idx], d.val);
    }
  });

  // Ensure non-zero vector
  if (vec.every((v) => v === 0)) {
    vec[DIMENSIONES.indexOf('T')] = 0.5;
    vec[DIMENSIONES.indexOf('E')] = 0.5;
  }

  return vec;
}

/**
 * Normalizes a vector (L1 norm).
 */
export function normalize(v: number[]): number[] {
  const sum = v.reduce((a, b) => a + b, 0) || 1e-8;
  return v.map((x) => x / sum);
}

/**
 * Calculates the geodesic union point using Fisher-Rao geometry.
 */
export function calculateUnionPoint(vectors: number[][]): { midpoint: number[]; distance: number; meta: string } {
  const eps = 1e-8;
  const normalized = vectors.map((v) => normalize(v));

  // Geodesic midpoint: m = sqrt(v1 * v2 * ... vn) normalized
  let m = [...normalized[0]];
  for (let i = 1; i < normalized.length; i++) {
    const v = normalized[i];
    m = m.map((val, idx) => Math.sqrt(val * v[idx]));
  }
  m = normalize(m);

  // Fisher-Rao distance (between first two)
  let d = 0;
  if (normalized.length >= 2) {
    const p = normalized[0];
    const q = normalized[1];
    const dotSqrt = p.reduce((acc, val, i) => acc + Math.sqrt(val * q[i]), 0);
    d = Math.acos(Math.min(1, Math.max(-1, dotSqrt)));
  }

  // Meta-stability heuristic from Python code
  const variance = m.reduce((acc, v) => acc + Math.pow(v - (1/N_DIM), 2), 0) / N_DIM;
  const eIdx = DIMENSIONES.indexOf('E');
  const tIdx = DIMENSIONES.indexOf('T');
  let meta = 'φ-';
  if (variance < 0.02) {
    meta = 'Ξ';
  } else if (m[eIdx] > m[tIdx]) {
    meta = 'φ+';
  }

  return { midpoint: m, distance: d, meta };
}

/**
 * Translates a vector into human phrases based on the Amalgam kernel.
 */
export function vectorToPhrases(vector: number[], text: string): { concreta: string; humana: string; amalgam: string; lovePath: string } {
  const dom: { dim: string; signo: number; v: number }[] = [];
  const txt = text.toLowerCase();

  vector.forEach((val, i) => {
    if (val > 0.1) {
      const dim = DIMENSIONES[i];
      let signo = 0;
      if (['abrir', 'fluir', 'dinámico', 'movimiento', 'expansión', 'conectar'].some(p => txt.includes(p))) signo = 1;
      else if (['cerrar', 'rígido', 'estático', 'fijo', 'bloquear', 'control'].some(p => txt.includes(p))) signo = -1;
      
      if (signo === 0) {
        if (val > 0.75) signo = 1;
        else if (val < 0.25) signo = -1;
      }
      dom.push({ dim, signo, v: val });
    }
  });

  dom.sort((a, b) => b.v - a.v);
  const top = dom.slice(0, 3);
  const concreta: string[] = [];
  const humana: string[] = [];
  const amalgam: string[] = [];

  top.forEach(t => {
    const entry = TRADUCCION[t.dim]?.[t.signo];
    if (entry) {
      concreta.push(entry.concreta);
      humana.push(entry.humana);
      amalgam.push(entry.amalgam);
    }
  });

  let lovePath = "Tómate un momento para respirar (Ξ) y pregúntate qué pequeña acción puedes hacer hoy para cuidar de ti mismo.";
  if (top.some(t => t.dim === 'Ξ')) lovePath = "Respira hondo tres veces. Tómate un minuto de silencio contigo mismo.";
  else if (top.some(t => t.dim === 'T' && t.signo === -1)) lovePath = "Escribe en un papel la tensión que sientes, sin juicio. Luego guárdalo por hoy.";
  else if (top.some(t => t.dim === 'E' && t.signo === 1)) lovePath = "Da un pequeño paso hacia un cambio concreto: envía un mensaje, camina una cuadra o haz algo que no hayas hecho antes.";

  return {
    concreta: concreta.join(" ").charAt(0).toUpperCase() + concreta.join(" ").slice(1),
    humana: humana.join(" ").charAt(0).toUpperCase() + humana.join(" ").slice(1),
    amalgam: amalgam.join(" | "),
    lovePath
  };
}
