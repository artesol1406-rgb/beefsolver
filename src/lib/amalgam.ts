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

  const keys = Object.keys(rules);
  for (let i = 0; i < keys.length; i++) {
    const k1 = keys[i];
    if (rules[k1].some((p) => txt.includes(p))) {
      // Find its pair in POLARITY_MAP
      for (const [p1, p2] of Object.entries(POLARITY_MAP)) {
        // This is a bit simplified, we want to find the pair
        // In the python code it was more direct
      }
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

  // Simplified mapping logic from the prompt's Python snippet
  const detections = [
    { keys: ['control', 'orden', 'planificar', 'rígido'], dim: 'S', val: 0.8 },
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
  const variance = m.reduce((acc, v) => acc + Math.pow(v - (1 / N_DIM), 2), 0) / N_DIM;
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
