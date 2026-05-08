import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gavel, Scale, BrainCircuit, Heart, MessageSquare, AlertTriangle, ArrowRight, Sparkles, RefreshCcw } from 'lucide-react';
import { textoAVector, calculateUnionPoint, N_DIM, DIMENSIONES } from './lib/amalgam';
import { getAmalgamAnalysis, AmalgamAnalysis } from './services/ai';

type AppState = 'landing' | 'setup' | 'arguments' | 'deliberating' | 'verdict';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [situation, setSituation] = useState('');
  const [partyA, setPartyA] = useState({ name: 'The Accused', argument: '', vector: new Array(N_DIM).fill(0) });
  const [partyB, setPartyB] = useState({ name: 'The Accuser', argument: '', vector: new Array(N_DIM).fill(0) });
  const [analysis, setAnalysis] = useState<AmalgamAnalysis | null>(null);
  const [unionInfo, setUnionInfo] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const startSetup = () => setState('setup');

  const goToArguments = () => {
    if (situation.trim()) setState('arguments');
  };

  const handleResolve = async () => {
    setState('deliberating');
    
    // Calculate vectors
    const vecA = textoAVector(partyA.argument);
    const vecB = textoAVector(partyB.argument);
    const union = calculateUnionPoint([vecA, vecB]);

    setUnionInfo(union);

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
      alert("The cosmic connection was lost. Retrying... " + err);
      setState('arguments');
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
            situation={situation} 
            setSituation={setSituation} 
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

function Landing({ onStart }: { onStart: () => void }) {
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

      <button 
        onClick={onStart}
        className="group relative px-8 py-4 bg-white text-black font-bold uppercase transition-all hover:pr-12 active:scale-95"
      >
        Enter Courtroom
        <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" />
      </button>
    </motion.div>
  );
}

interface SetupProps {
  situation: string;
  setSituation: (s: string) => void;
  onNext: () => void;
  partyAName: string;
  setPartyAName: (n: string) => void;
  partyBName: string;
  setPartyBName: (n: string) => void;
}

function Setup({ situation, setSituation, onNext, partyAName, setPartyAName, partyBName, setPartyBName }: SetupProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 max-w-2xl mx-auto space-y-10"
    >
      <h2 className="text-4xl font-bold border-l-4 border-indigo-600 pl-4 self-start">The Preliminary Brief</h2>
      
      <div className="w-full space-y-6">
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

      <button 
        disabled={!situation.trim()}
        onClick={onNext}
        className="w-full py-4 bg-indigo-600 font-bold uppercase hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Present Arguments
      </button>
    </motion.div>
  );
}

interface ArgumentsProps {
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
  analysis: AmalgamAnalysis; 
  unionInfo: any; 
  onReset: () => void;
  partyA: any;
  partyB: any;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-12 pb-24"
    >
      <div className="flex justify-between items-end border-b-2 border-neutral-800 pb-6">
        <div>
          <span className="text-xs uppercase font-mono text-indigo-500 mb-2 block tracking-widest">Case Finality reached</span>
          <h2 className="text-5xl font-black italic tracking-tighter">THE VERDICT</h2>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-xs font-mono text-neutral-500 uppercase">Geodesic Dist: {unionInfo.distance.toFixed(3)} rad</p>
           <p className="text-xs font-mono text-neutral-500 uppercase">Meta-Stability: {unionInfo.meta}</p>
        </div>
      </div>

      {/* Amalgam Layer */}
      <section className="bg-indigo-950/20 border border-indigo-500/30 p-8 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Scale size={160} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <BrainCircuit size={20} />
            <h3 className="uppercase font-bold tracking-widest text-sm">Amalgam Signature</h3>
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
            <h4 className="uppercase font-bold tracking-widest text-xs">Concrete Dynamics</h4>
          </div>
          <p className="text-neutral-300 leading-relaxed">{analysis.concreteLayer}</p>
        </div>

        {/* Human Layer */}
        <div className="bg-neutral-900/50 p-8 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center space-x-2 text-red-500">
            <Heart size={18} />
            <h4 className="uppercase font-bold tracking-widest text-xs">Human Resonance</h4>
          </div>
          <p className="text-neutral-300 leading-relaxed">{analysis.humanLayer}</p>
        </div>
      </div>

      {/* Love Path */}
      <section className="bg-white text-black p-10 rounded-[3rem] shadow-[20px_20px_0_rgba(79,70,229,1)]">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="px-4 py-1 bg-indigo-600 text-white text-[10px] items-center rounded-full flex gap-2 font-black uppercase tracking-[0.2em]">
            <Sparkles size={12} /> The Love Path (Camino Amor)
          </div>
          <h3 className="text-4xl font-bold tracking-tight leading-tight">
            How to Bridge the Illusion of Separation
          </h3>
          <p className="text-xl max-w-2xl font-medium leading-relaxed">
            {analysis.lovePath}
          </p>
        </div>
      </section>

      {/* Judge Verdict */}
      <section className="space-y-6 text-center py-12">
        <h4 className="text-indigo-500 font-mono uppercase tracking-[0.3em] text-sm italic">Grand Mediator's Decree</h4>
        <p className="text-2xl font-bold max-w-3xl mx-auto border-t border-b border-indigo-900 py-8 leading-relaxed">
          {analysis.judgeVerdict}
        </p>
      </section>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="px-12 py-4 border-2 border-indigo-600 text-indigo-500 font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-4"
        >
          <RefreshCcw size={20} /> File Next Case
        </button>
      </div>
    </motion.div>
  );
}
