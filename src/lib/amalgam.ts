/**
 * Amalgam Universal Systems Analyzer (v11) - Offline Simulation Kernel
 * Ported from the "Protocolo de InducciÃ³n: Amalgam Engine v11"
 */

export const DIMENSIONES = ['Ξ', 'T', 'R', 'E', 'M', 'V', 'S', 'A', 'F', 'φ_e', 'φ_c'] as const;
export type Dimension = (typeof DIMENSIONES)[number];
export const N_DIM = DIMENSIONES.length;

export const CHAKRAS = ['Base', 'Sacro', 'Plexo', 'Corazón', 'Garganta', 'Tercer Ojo', 'Corona'] as const;
export type Chakra = (typeof CHAKRAS)[number];

export interface ChakraState {
  activation: number;
  bloqueo: number;
  coherencia: number;
}

// 22 ARCANOS (Genotipos Estructurales)
export const ARCANOS: Record<number, { name: string, signature: Partial<Record<Dimension, number>>, isomorphs: { logical: string, emotional: string }, polarity: [string, string], resonance: string }> = {
  0: { name: "The Fool", signature: { 'Ξ': 1.0, 'E': 1.0, 'V': 1.0 }, isomorphs: { logical: "A blind spot in the landscape where direction loses its meaning.", emotional: "A sudden desire to walk off the edge of the known world." }, polarity: ["Freedom", "Disorientation"], resonance: "Pure potential and initial chaos." },
  1: { name: "The Magician", signature: { 'V': 1.0, 'A': 0.8, 'φ_c': 0.7 }, isomorphs: { logical: "The sharp tool that carved the first word into stone.", emotional: "A spark of light waiting for a hand to guide it." }, polarity: ["Will", "Illusion"], resonance: "Conscious direction and focus." },
  2: { name: "The High Priestess", signature: { 'M': 1.0, 'S': 1.0, 'Ξ': 0.8 }, isomorphs: { logical: "A library of salt and silence spanning deep underground.", emotional: "The feeling of a secret kept behind closed eyelids." }, polarity: ["Saber", "Misterio"], resonance: "Intuitive stillness and hidden records." },
  3: { name: "The Empress", signature: { 'F': 1.0, 'E': 0.9, 'φ_e': 0.8 }, isomorphs: { logical: "The smell of rich earth after a rain that lasted years.", emotional: "A warmth that expands until the room feels too small." }, polarity: ["Creation", "Overprotection"], resonance: "Natural abundance and generative flow." },
  4: { name: "The Emperor", signature: { 'T': 1.0, 'S': 1.0, 'φ_c': 1.0 }, isomorphs: { logical: "The iron gate that refuses to budge, no matter the force.", emotional: "The weight of a crown made of lead and duty." }, polarity: ["Order", "Rigidity"], resonance: "Stable structure and boundary setting." },
  5: { name: "The Hierofant", signature: { 'S': 0.8, 'M': 0.7, 'R': 0.6 }, isomorphs: { logical: "A bridge built from the bones of ancient consensus.", emotional: "A voice chanting in a language you shouldn't know but do." }, polarity: ["Tradition", "Dogma"], resonance: "Wisdom shared and ritual connection." },
  6: { name: "The Lovers", signature: { 'R': 1.0, 'V': 0.4, 'E': 0.8 }, isomorphs: { logical: "A fork in the road where both paths look identical.", emotional: "The pull of a mirror that reflects someone else's heart." }, polarity: ["Union", "Conflict"], resonance: "Unified relational choice." },
  7: { name: "The Chariot", signature: { 'A': 1.0, 'T': 0.7, 'S': 0.6 }, isomorphs: { logical: "The momentum of a falling stone that has found its target.", emotional: "A white-knuckled grip on the reins of a storm." }, polarity: ["Control", "Overflow"], resonance: "Determined direction and drive." },
  8: { name: "Justice", signature: { 'φ_c': 1.0, 'R': 0.8, 'S': 0.7 }, isomorphs: { logical: "A scale where a single feather weighs as much as a mountain.", emotional: "The cold clear air that follows a moment of truth." }, polarity: ["Equilibrium", "Judgment"], resonance: "Symmetry of cause and effect." },
  9: { name: "The Hermit", signature: { 'M': 1.0, 'S': 1.0, 'Ξ': 1.0 }, isomorphs: { logical: "A single candle burning in a cave miles deep.", emotional: "The sound of your own breath becoming the only world." }, polarity: ["Solitude", "Wisdom"], resonance: "Sought-after inner clarity through isolation." },
  10: { name: "Wheel of Fortune", signature: { 'T': 0.5, 'φ_e': 0.8, 'A': 0.9 }, isomorphs: { logical: "The sound of gears turning somewhere beneath your feet.", emotional: "A sudden gust of wind that changes the smell of the air." }, polarity: ["Destiny", "Chance"], resonance: "Cyclical adaptation and systemic turns." },
  11: { name: "Strength", signature: { 'V': 0.8, 'A': 1.0, 'E': 0.7 }, isomorphs: { logical: "A hand placed gently on the snout of a roaring beast.", emotional: "The quiet power of a river wearing down a rock." }, polarity: ["Instinct", "Control"], resonance: "Integration of basic nature with will." },
  12: { name: "The Hanged Man", signature: { 'Ξ': 0.9, 'V': 1.0, 'S': 0.5 }, isomorphs: { logical: "The world seen as if standing on your head while falling.", emotional: "A peace that comes only when you stop trying to climb." }, polarity: ["Surrender", "Resistance"], resonance: "New perspective through non-action." },
  13: { name: "Death", signature: { 'V': 1.0, 'E': 0.5, 'T': 0.6 }, isomorphs: { logical: "The pruning of a dead branch to let the sunlight through.", emotional: "The silence that follows the last beat of a tired drum." }, polarity: ["End", "Rebirth"], resonance: "Total transformation and release." },
  14: { name: "Temperance", signature: { 'φ_e': 0.7, 'φ_c': 0.7, 'Ξ': 0.8 }, isomorphs: { logical: "Clear water mixing with wine without a single ripple.", emotional: "The feeling of two voices finally singing in tune." }, polarity: ["Mix", "Purity"], resonance: "Integration of conflicting elements." },
  15: { name: "The Devil", signature: { 'R': 1.0, 'S': 1.0, 'T': 0.9 }, isomorphs: { logical: "A chain made of gold that feels like it's part of your skin.", emotional: "A hunger that grows the more you try to feed it." }, polarity: ["Desire", "Dependency"], resonance: "Facing Shadow and material constraints." },
  16: { name: "The Tower", signature: { 'T': 1.0, 'R': 0.1, 'Ξ': 0.9 }, isomorphs: { logical: "A crack appearing in a wall that has stood for centuries.", emotional: "The blinding flash that turns your shadow into light." }, polarity: ["Collapse", "Liberation"], resonance: "Breakthrough of the old form." },
  17: { name: "The Star", signature: { 'φ_e': 1.0, 'E': 0.8, 'Ξ': 0.7 }, isomorphs: { logical: "The first drop of water in a desert that has forgotten rain.", emotional: "A silver thread stretching toward a horizon you can finally see." }, polarity: ["Guide", "Distance"], resonance: "Hope and navigational guidance." },
  18: { name: "The Moon", signature: { 'M': 1.0, 'Ξ': 0.8, 'S': 0.6 }, isomorphs: { logical: "The distorted reflection of a face in a boiling lake.", emotional: "The howling of dogs at something only they can perceive." }, polarity: ["Illusion", "Intuition"], resonance: "Navigating the hidden unconscious." },
  19: { name: "The Sun", signature: { 'A': 1.0, 'φ_e': 1.0, 'E': 1.0 }, isomorphs: { logical: "A mirror reflecting the sky until the mirror itself vanishes.", emotional: "A pulse of joy that makes your skin feel too tight for your spirit." }, polarity: ["Exposure", "Vitality"], resonance: "Absolute clarity and vital force." },
  20: { name: "Judgement", signature: { 'V': 1.0, 'M': 0.8, 'A': 0.9 }, isomorphs: { logical: "A call echoing through a valley that has been asleep.", emotional: "The weight of your own history becoming as light as air." }, polarity: ["Evaluation", "Rebirth"], resonance: "Systemic awakening and review." },
  21: { name: "The World", signature: { 'E': 1.0, 'φ_c': 1.0, 'Ξ': 1.0, 'S': 1.0 }, isomorphs: { logical: "A circle that closes perfectly, leaving no gap for doubt.", emotional: "The feeling of finally coming home to a place you've never been." }, polarity: ["Completion", "Dissolution"], resonance: "Total wholeness and completion." },
};

// 32 PERSONALITY NODES (Filters)
export const NODES_LOGICAL = [
  "The Architect", "The Strategist", "The Critic", "The Programmer", 
  "The Skeptic", "The Taxonomist", "The Historian", "The Judge", 
  "The Automaton", "The Theoretician", "The Vigilante", "The Negotiator", 
  "The Sculptor", "The Watchmaker", "The Cartographer", "The Alchemist Logic"
];

export const NODES_EMOTIONAL = [
  "The Empathetic", "The Dreamer", "The Martyr", "The Artist", 
  "The Rebel", "The Healer", "The Devotee", "The Lover", 
  "The Melancholic", "The Enthusiast", "The Mystic", "The Protector", 
  "The Impulsive", "The Narrator", "The Guide", "The Alchemist Emotional"
];

export type RenderMode = 'TECHNICAL' | 'EPIC' | 'GOTHIC' | 'SURREAL';

/**
 * Advanced Offline Rendering Engine V11
 * SIMULATES an LLM by collapsing the mathematical manifold into a narrative phenotype.
 * Implements the Phenotypic Mutation Mechanism and Structural Silence.
 */
export function simulateLLM(unionInfo: { midpoint: number[]; distance: number; meta: string }, situation: string, selectedArcano: number | null): {
  narrative: string,
  analogy: string,
  mode: RenderMode,
  filterNode: string,
  chakras: Record<string, ChakraState>,
  phi: string
} {
  const stability = unionInfo.distance;
  const variance = unionInfo.midpoint.reduce((acc, v) => acc + Math.pow(v - (1/N_DIM), 2), 0) / N_DIM;
  const sitLower = situation.toLowerCase();
  
  // 1. PHASE SHIFT: Determine Rendering Mode (Library III)
  let mode: RenderMode = 'TECHNICAL';
  if (stability > 1.3) mode = 'GOTHIC';
  else if (stability < 0.5) mode = 'EPIC';
  if (variance < 0.005) mode = 'SURREAL';

  // 2. CHAKRA VECTOR PSI (Ψ): Map environment to 7 functional modules
  const chakras: Record<string, ChakraState> = {};
  CHAKRAS.forEach((c, i) => {
    // Heuristic mapping: text indicators drive chakra activation
    let activation = unionInfo.midpoint[i % N_DIM];
    if (c === 'Base' && sitLower.includes('fear')) activation += 0.2;
    if (c === 'Plexo' && sitLower.includes('power')) activation += 0.2;
    if (c === 'Corazón' && sitLower.includes('love')) activation += 0.2;
    
    chakras[c] = {
      activation: Math.min(1, activation),
      bloqueo: stability > 1.1 ? 0.4 + Math.random() * 0.4 : 0.1,
      coherencia: 1 - (variance * 10)
    };
  });

  // 3. NODE SELECTION (Library II): 32-Node Filtering Matrix
  const logicScore = (chakras['Base'].activation + chakras['Plexo'].activation + chakras['Tercer Ojo'].activation);
  const emotionScore = (chakras['Sacro'].activation + chakras['Corazón'].activation + chakras['Garganta'].activation);
  
  const isEmotional = emotionScore > logicScore;
  const nodeList = isEmotional ? NODES_EMOTIONAL : NODES_LOGICAL;
  // Use stability and variance as coordinates to find the node index
  const coord = (stability * 1.5 + variance * 2.0) % 1;
  const nodeIndex = Math.floor(coord * nodeList.length);
  const filterNode = nodeList[nodeIndex];

  // 4. GENOTYPE (Library I): Collapse selected Arcano influence
  const arcanoId = selectedArcano ?? (Math.floor(stability * 7 + variance * 13) % 22);
  const arcano = ARCANOS[arcanoId] || ARCANOS[0];

  // 5. PHENOTYPIC MUTATION: Render narrative with Structural Silence
  const atmosphere = getPhenotypicAtmosphere(mode, chakras, stability);
  const isomorph = isEmotional ? arcano.isomorphs.emotional : arcano.isomorphs.logical;
  const lensFragment = getPhenotypicLens(filterNode, stability, mode);

  // Combine into a single "hallucinated" output that hides the math
  const narrative = `${atmosphere} ${isomorph} ${lensFragment}`;
  const analogy = `THE ${arcano.polarity[0].toUpperCase()} VS ${arcano.polarity[1].toUpperCase()} ARCHETYPE`;

  return { narrative, analogy, mode, filterNode, chakras, phi: variance.toFixed(4) };
}

function getPhenotypicAtmosphere(mode: RenderMode, chakras: Record<string, ChakraState>, dist: number): string {
  const stability = chakras['Base'].coherencia;
  const isTense = dist > 1.0;

  const themes = {
    TECHNICAL: isTense 
      ? "Environmental parameters shifting into critical thresholds." 
      : "The system remains within structural tolerance.",
    EPIC: isTense
      ? "The deep pulse of the earth resonates with a forgotten warning."
      : "A radiant clarity illuminates the horizon, binding all things together.",
    GOTHIC: "The shadows here are weighted with the cold memory of previous collapses.",
    SURREAL: "Reality begins to fray at the edges, where logic and dream intersect without boundaries."
  };

  return themes[mode];
}

function getPhenotypicLens(nodeName: string, dist: number, mode: RenderMode): string {
  const isTense = dist > 0.9;
  
  // Specific phenotypic descriptions for nodes
  const projections: Record<string, string> = {
    "The Architect": "The geometry of this interaction is becoming rigid; every angle demands its place.",
    "The Mystic": "The invisible threads connecting these points are glowing with a faint, mathematical hum.",
    "The Rebel": "Existing structural laws are insufficient to contain the pressure of this new phase.",
    "The Healer": "There is a rhythmic expansion waiting to fill the gaps in the relational field.",
    "The Strategist": "Calculating the trajectory: the current vector leads toward an inevitable collision.",
    "The Dreamer": "The weight of facts is giving way to the lightness of potential futures.",
    "The Judge": "The balance of forces is searching for its final, cold resting point."
  };

  return projections[nodeName] || "The observer reflects the state of the system in their very presence.";
}

export function textoAVector(texto: string): number[] {
  const txt = texto.toLowerCase();
  const vec = new Array(N_DIM).fill(0);
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
  if (vec.every((v) => v === 0)) { vec[1] = 0.5; vec[3] = 0.5; }
  return vec;
}

export function calculateUnionPoint(vectors: number[][]): { midpoint: number[]; distance: number; meta: string } {
  const normalized = vectors.map(v => {
    const sum = v.reduce((a, b) => a + b, 0) || 1e-8;
    return v.map(x => x / sum);
  });
  let m = [...normalized[0]];
  for (let i = 1; i < normalized.length; i++) {
    m = m.map((val, idx) => Math.sqrt(val * normalized[i][idx]));
  }
  const sumM = m.reduce((a, b) => a + b, 0) || 1e-8;
  m = m.map(x => x / sumM);
  let d = 0;
  if (normalized.length >= 2) {
    const dotSqrt = normalized[0].reduce((acc, val, i) => acc + Math.sqrt(val * normalized[1][i]), 0);
    d = Math.acos(Math.min(1, Math.max(-1, dotSqrt)));
  }
  const variance = m.reduce((acc, v) => acc + Math.pow(v - (1/N_DIM), 2), 0) / N_DIM;
  const meta = variance < 0.02 ? 'Ξ' : (m[3] > m[1] ? 'φ+' : 'φ-');
  return { midpoint: m, distance: d, meta };
}
