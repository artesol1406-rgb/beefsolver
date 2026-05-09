import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gavel, Scale, BrainCircuit, Heart, MessageSquare, AlertTriangle, ArrowRight, Sparkles, RefreshCcw } from 'lucide-react';
import { textoAVector, calculateUnionPoint, N_DIM, DIMENSIONES } from './lib/amalgam';
import { getAmalgamAnalysis, AmalgamAnalysis } from './services/ai';

type AppState = 'landing' | 'setup' | 'arguments' | 'deliberating' | 'verdict';
type ResolutionMode = 'ai' | 'offline';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [mode, setMode] = useState<ResolutionMode>('ai');
  const [situation, setSituation] = useState('');
  const [selectedArcano, setSelectedArcano] = useState<number | null>(null);
  const [partyA, setPartyA] = useState({ name: 'The Accused', argument: '', vector: new Array(N_DIM).fill(0) });
  const [partyB, setPartyB] = useState({ name: 'The Accuser', argument: '', vector: new Array(N_DIM).fill(0) });
  const [analysis, setAnalysis] = useState<AmalgamAnalysis | null>(null);
  const [unionInfo, setUnionInfo] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const startSetup = (m: ResolutionMode) => {
    setMode(m);
    setState('setup');
  };

  const goToArguments = () => {
    if (situation.trim()) setState('arguments');
  };

  const handleResolve = async () => {
    setState('deliberating');
    
    // Calculate vectors
    const vecA = textoAVector(partyA.argument);
    const vecB = textoAVector(partyB.argument);
    let union = calculateUnionPoint([vecA, vecB]);

    // Apply Arcano signature if selected
    if (selectedArcano !== null) {
      const { ARCANOS } = await import('./lib/amalgam');
      const arcano = ARCANOS[selectedArcano];
      if (arcano) {
        // Merge arcano signature into midpoint
        const arcanoVec = new Array(N_DIM).fill(0);
        Object.entries(arcano.signature).forEach(([dim, val]) => {
          const idx = DIMENSIONES.indexOf(dim as any);
          if (idx !== -1) arcanoVec[idx] = val;
        });
        
        // Weight: 70% original union, 30% arcano influence
        union.midpoint = union.midpoint.map((v, i) => v * 0.7 + arcanoVec[i] * 0.3);
      }
    }

    setUnionInfo(union);

    if (mode === 'offline') {
      // AMALGAM V11 SIMULATOR (OFFLINE)
      const { simulateLLM } = await import('./lib/amalgam');
      const sim = simulateLLM(union, situation, selectedArcano);
      
      setAnalysis({
        concreteLayer: sim.narrative,
        humanLayer: `OBSERVATION LENS: [${sim.filterNode.toUpperCase()}] Observation collapsed via ${sim.mode} rendering mode.`,
        analogy: sim.analogy,
        lovePath: "Simulation indicates the required action is a phase shift in structural awareness.",
        judgeVerdict: `OFFLINE DECREE: Manifold stabilized at ${union.distance.toFixed(3)} rad. Structural silence maintained.`,
        meta: sim // Storing the full simulation data in a non-analyzed field for UI
      });
      // Simulate small delay for effect
      setTimeout(() => setState('verdict'), 2000);
      return;
    }

    try {
      const result = await getAmalgamAnalysis(
        situation,
        { ...partyA, vector: vecA },
        { ...partyB, vector: vecB },
        union
      );
      setAnalysis(result);
      setState('verdict');
    } catch (err) {
      alert("The cosmic connection was lost. Switching to offline wisdom...");
      // Self-correction: if AI fails, fallback to simulation
      const { simulateLLM } = await import('./lib/amalgam');
      const sim = simulateLLM(union, situation, selectedArcano);
      setAnalysis({
        concreteLayer: sim.narrative,
        humanLayer: `EMERGENCY FILTER: [${sim.filterNode.toUpperCase()}] Observation collapsed via ${sim.mode} rendering mode.`,
        analogy: sim.analogy,
        lovePath: "The action is to remain centered in the void of the error.",
        judgeVerdict: `VERDICT: Cosmic wisdom was interrupted, but the internal kernel remains firm. Manifold: ${union.distance.toFixed(3)} rad.`
      });
      setState('verdict');
    }
  };

  const reset = () => {
    setState('landing');
    setSituation('');
    setPartyA({ name: 'The Accused', argument: '', vector: new Array(N_DIM).fill(0) });
    setPartyB({ name: 'The Accuser', argument: '', vector: new Array(N_DIM).fill(0) });
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500 selection:text-white">
      <AnimatePresence mode="wait">
        {state === 'landing' && <Landing key="landing" onStart={startSetup} />}
        {state === 'setup' && (
          <Setup 
            key="setup" 
            mode={mode}
            situation={situation} 
            setSituation={setSituation} 
            selectedArcano={selectedArcano}
            setSelectedArcano={setSelectedArcano}
            onNext={goToArguments} 
            partyAName={partyA.name}
            setPartyAName={(n) => setPartyA({...partyA, name: n})}
            partyBName={partyB.name}
            setPartyBName={(n) => setPartyB({...partyB, name: n})}
          />
        )}
        {state === 'arguments' && (
          <Arguments 
            key="arguments" 
            partyA={partyA} 
            setPartyAArg={(a) => setPartyA({...partyA, argument: a})}
            partyB={partyB}
            setPartyBArg={(a) => setPartyB({...partyB, argument: a})}
            onResolve={handleResolve}
          />
        )}
        {state === 'deliberating' && <Deliberating key="deliberating" />}
        {state === 'verdict' && analysis && (
          <Verdict 
            key="verdict" 
            analysis={analysis} 
            unionInfo={unionInfo} 
            onReset={reset} 
            partyA={partyA}
            partyB={partyB}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Landing({ onStart }: { key?: string; onStart: (m: ResolutionMode) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-screen space-y-8 p-6 text-center"
    >
      <div className="relative">
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="bg-indigo-600 p-6 rounded-full shadow-[0_0_50px_rgba(79,70,229,0.5)]"
        >
          <Gavel size={64} className="text-white" />
        </motion.div>
        <Sparkles className="absolute -top-4 -right-4 text-yellow-400" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-6xl font-black tracking-tighter uppercase italic">BeefSolver</h1>
        <p className="text-indigo-400 font-mono text-sm tracking-widest">AMALGAM UNIVERSAL SYSTEMS ANALYZER V11</p>
      </div>

      <p className="max-w-md text-neutral-400 text-lg">
        Map your dilemmas into 11D state space and find the geodesic union point of resolution. 
        The Grand Mediator awaits your case.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          onClick={() => onStart('ai')}
          className="flex-1 group relative px-6 py-4 bg-white text-black font-bold uppercase transition-all hover:bg-neutral-200 active:scale-95"
        >
          AI Courtroom
          <div className="text-[8px] opacity-50 mt-1 font-mono tracking-widest">powered by gemini-3</div>
        </button>
        
        <button 
          onClick={() => onStart('offline')}
          className="flex-1 group relative px-6 py-4 border-2 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-500 font-bold uppercase transition-all active:scale-95"
        >
          Offline Mode
          <div className="text-[8px] opacity-50 mt-1 font-mono tracking-widest">v11 classic kernel</div>
        </button>
      </div>
    </motion.div>
  );
}

interface SetupProps {
  key?: string;
  mode: ResolutionMode;
  situation: string;
  setSituation: (s: string) => void;
  selectedArcano: number | null;
  setSelectedArcano: (id: number | null) => void;
  onNext: () => void;
  partyAName: string;
  setPartyAName: (n: string) => void;
  partyBName: string;
  setPartyBName: (n: string) => void;
}

function Setup({ mode, situation, setSituation, selectedArcano, setSelectedArcano, onNext, partyAName, setPartyAName, partyBName, setPartyBName }: SetupProps) {
  const [arcanoList, setArcanoList] = useState<any[]>([]);

  useEffect(() => {
    import('./lib/amalgam').then((mod) => {
      setArcanoList(Object.entries(mod.ARCANOS).map(([id, data]) => ({ id: parseInt(id), ...data })));
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center justify-start min-h-screen p-6 max-w-4xl mx-auto space-y-10 py-12"
    >
      <div className="w-full flex justify-between items-center">
        <h2 className="text-4xl font-bold border-l-4 border-indigo-600 pl-4">The Preliminary Brief</h2>
        <div className="text-[10px] uppercase font-mono px-3 py-1 bg-neutral-900 rounded-full text-indigo-400 border border-indigo-900/50">
          Mode: {mode.toUpperCase()}
        </div>
      </div>
      
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase font-mono text-neutral-500">The Situation / Dispute</label>
            <textarea 
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="What is the conflict about? Describe the core dilemma..."
              className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors h-32 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-mono text-neutral-500">Party Alpha</label>
              <input 
                value={partyAName}
                onChange={(e) => setPartyAName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-mono text-neutral-500">Party Beta</label>
              <input 
                value={partyBName}
                onChange={(e) => setPartyBName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <label className="text-xs uppercase font-mono text-neutral-500 block">Structural Arcano (Observer Destiny)</label>
           <div className="grid grid-cols-3 gap-2 h-72 overflow-y-auto pr-2 custom-scrollbar bg-neutral-900/30 p-2 rounded-xl border border-neutral-800">
              {arcanoList.map((arcano) => (
                <button
                  key={arcano.id}
                  onClick={() => setSelectedArcano(selectedArcano === arcano.id ? null : arcano.id)}
                  className={`p-3 rounded-lg border text-left transition-all group ${
                    selectedArcano === arcano.id 
                    ? 'bg-indigo-600 border-indigo-400 text-white' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-600'
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-50 mb-1">#{arcano.id}</div>
                  <div className="text-xs font-bold leading-tight uppercase tracking-tighter">{arcano.name}</div>
                </button>
              ))}
           </div>
           {selectedArcano !== null && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl">
                <div className="text-[10px] font-mono text-indigo-400 uppercase mb-1">Signature Resonance</div>
                <div className="text-sm italic">"{arcanoList.find(a => a.id === selectedArcano)?.resonance}"</div>
             </motion.div>
           )}
        </div>
      </div>

      <button 
        disabled={!situation.trim()}
        onClick={onNext}
        className="w-full py-4 bg-indigo-600 font-bold uppercase hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
      >
        Present Arguments
      </button>
    </motion.div>
  );
}

interface ArgumentsProps {
  key?: string;
  partyA: { name: string; argument: string };
  setPartyAArg: (a: string) => void;
  partyB: { name: string; argument: string };
  setPartyBArg: (a: string) => void;
  onResolve: () => void;
}

function Arguments({ partyA, setPartyAArg, partyB, setPartyBArg, onResolve }: ArgumentsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 h-screen bg-neutral-950 overflow-hidden"
    >
      <div className="relative p-8 flex flex-col justify-center space-y-6 bg-neutral-900/50 border-r border-neutral-800">
        <div className="flex items-center space-y-1">
           <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
              <span className="font-bold text-xl">A</span>
           </div>
           <h3 className="text-2xl font-bold">{partyA.name}'s Defense</h3>
        </div>
        <textarea 
          value={partyA.argument}
          onChange={(e) => setPartyAArg(e.target.value)}
          placeholder="State your argument... Why are you right?"
          className="flex-grow bg-neutral-900 border border-neutral-800 p-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-inner text-lg italic"
        />
      </div>

      <div className="relative p-8 flex flex-col justify-center space-y-6">
        <div className="flex items-center space-y-1">
           <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
              <span className="font-bold text-xl">B</span>
           </div>
           <h3 className="text-2xl font-bold">{partyB.name}'s Case</h3>
        </div>
        <textarea 
          value={partyB.argument}
          onChange={(e) => setPartyBArg(e.target.value)}
          placeholder="State your argument... What is the counterpoint?"
          className="flex-grow bg-neutral-900 border border-neutral-800 p-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none shadow-inner text-lg italic"
        />
        
        <button 
          onClick={onResolve}
          disabled={!partyA.argument.trim() || !partyB.argument.trim()}
          className="absolute bottom-12 right-12 px-12 py-6 bg-white text-black font-black uppercase text-xl shadow-[20px_20px_0_rgba(79,70,229,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[10px_10px_0_rgba(79,70,229,1)] transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
        >
          OBJECTION! (Solve Beef)
        </button>
      </div>
    </motion.div>
  );
}

function Deliberating() {
  const steps = ["Vectorizing Reality...", "Analyzing Lyapunov Gradients...", "Mapping Fisher-Rao Geometry...", "Awaiting Cosmic Wisdom..."];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((s) => (s + 1) % steps.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent animate-pulse" />
      
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="relative z-10"
      >
        <RefreshCcw size={80} className="text-indigo-500" />
      </motion.div>
      
      <div className="mt-12 text-center z-10 space-y-4">
        <h2 className="text-3xl font-black italic tracking-widest text-white uppercase italic">Silence in the Court!</h2>
        <p className="text-indigo-400 font-mono animate-pulse">{steps[currentStep]}</p>
      </div>
    </div>
  );
}

function Verdict({ analysis, unionInfo, onReset, partyA, partyB }: { 
  key?: string;
  analysis: AmalgamAnalysis; 
  unionInfo: any; 
  onReset: () => void;
  partyA: any;
  partyB: any;
}) {
  const sim = (analysis as any).meta;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto space-y-12 pb-24"
    >
      <div className="flex justify-between items-end border-b-2 border-neutral-800 pb-6">
        <div className="space-y-2">
          <span className="text-xs uppercase font-mono text-indigo-500 block tracking-widest">Manifold successfully collapsed</span>
          <h2 className="text-5xl font-black italic tracking-tighter">THE VERDICT</h2>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-xs font-mono text-neutral-500 uppercase">Geodesic Dist: {unionInfo.distance.toFixed(4)} rad</p>
           <p className="text-xs font-mono text-neutral-500 uppercase">Resonance Mode: {sim?.mode || 'STABLE'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Amalgam Layer */}
          <section className="bg-indigo-950/20 border border-indigo-500/30 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Scale size={160} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400">
                <BrainCircuit size={20} />
                <h3 className="uppercase font-bold tracking-widest text-sm">Phenotypic Projection</h3>
              </div>
              <p className="text-3xl font-serif italic text-white leading-relaxed">
                "{analysis.analogy}"
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Concrete Layer */}
            <div className="bg-neutral-900/50 p-8 rounded-3xl border border-neutral-800 space-y-4">
              <div className="flex items-center space-x-2 text-neutral-500">
                <AlertTriangle size={18} />
                <h4 className="uppercase font-bold tracking-widest text-xs">Structural Manifestation (Concreta)</h4>
              </div>
              <p className="text-neutral-300 leading-relaxed italic">"{analysis.concreteLayer}"</p>
            </div>

            {/* Human Layer */}
            <div className="bg-neutral-900/50 p-8 rounded-3xl border border-neutral-800 space-y-4">
              <div className="flex items-center space-x-2 text-red-500">
                <Heart size={18} />
                <h4 className="uppercase font-bold tracking-widest text-xs">Perceptual Reflection (Humana)</h4>
              </div>
              <p className="text-neutral-300 leading-relaxed italic">"{analysis.humanLayer}"</p>
            </div>
          </div>

          <section className="bg-white text-black p-10 rounded-[3rem] shadow-[20px_20px_0_rgba(79,70,229,1)]">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="px-4 py-1 bg-indigo-600 text-white text-[10px] items-center rounded-full flex gap-2 font-black uppercase tracking-[0.2em]">
                <Sparkles size={12} /> The Love Path (Camino Amor)
              </div>
              <p className="text-xl max-w-2xl font-medium leading-relaxed">
                {analysis.lovePath}
              </p>
            </div>
          </section>

          <section className="space-y-4 text-center py-6">
            <p className="text-2xl font-bold max-w-3xl mx-auto border-t border-b border-indigo-900 py-8 leading-relaxed">
              {analysis.judgeVerdict}
            </p>
          </section>
        </div>

        {/* System Internal Dashboard */}
        <div className="space-y-6">
           {sim && sim.chakras && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.5 }}
               className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl"
             >
               <h3 className="text-xs uppercase font-mono text-neutral-500 mb-6 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                 Psi State Vector (Chakras)
               </h3>
               <div className="space-y-5">
                 {Object.entries(sim.chakras).map(([name, state]: [string, any], idx) => (
                   <div key={name} className="space-y-1.5">
                     <div className="flex justify-between text-[10px] font-mono uppercase">
                        <span className="text-neutral-400">{name}</span>
                        <span className={state.bloqueo > 0.3 ? "text-red-500" : "text-emerald-500"}>
                          {state.bloqueo > 0.3 ? "Locked" : "Optimal"}
                        </span>
                     </div>
                     <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${state.activation * 100}%` }}
                         className={`h-full ${idx === 3 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : (state.bloqueo > 0.3 ? 'bg-red-500' : 'bg-indigo-500')}`}
                       />
                     </div>
                   </div>
                 ))}
               </div>
               <div className="mt-8 pt-6 border-t border-neutral-800">
                  <div className="text-[10px] uppercase font-mono text-neutral-500 mb-2">Active Filter Lens</div>
                  <div className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em]">{sim.filterNode}</div>
               </div>
             </motion.div>
           )}

           <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase font-mono text-neutral-500">
                <RefreshCcw size={14} /> Structural Metrics
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                  <div className="text-[10px] text-neutral-600 uppercase font-mono mb-1">Stability Var (φ)</div>
                  <div className="text-xl font-mono text-white">{sim?.phi || '0.9234'}</div>
                </div>
                <div className="p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                  <div className="text-[10px] text-neutral-600 uppercase font-mono mb-1">Geodesic Hub</div>
                  <div className="text-xl font-mono text-white uppercase italic">{unionInfo.meta === 'Ξ' ? 'Null Point' : (unionInfo.meta === 'φ+' ? 'Positive Phase' : 'Negative Phase')}</div>
                </div>
              </div>
           </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="px-12 py-4 border-2 border-indigo-600 text-indigo-500 font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-4 group"
        >
          <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> 
          File Next Declaration
        </button>
      </div>
    </motion.div>
  );
}
