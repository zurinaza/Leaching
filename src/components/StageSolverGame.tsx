import React, { useState } from 'react';
import { StudentProfile } from '../types/extraction';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Layers, Award, Sparkles, BookOpen, AlertTriangle, Cpu, TrendingUp } from 'lucide-react';

interface StageSolverGameProps {
  onBackToMenu: () => void;
  student: StudentProfile;
  setStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
}

export const StageSolverGame: React.FC<StageSolverGameProps> = ({
  onBackToMenu,
  student,
  setStudent,
}) => {
  // Mode selection: Standard vs Year 3 Advanced
  const [solverLevel, setSolverLevel] = useState<'standard' | 'year3_advanced'>('standard');

  // Problem parameters
  const [solventRate, setSolventRate] = useState<number>(1200); // kg/h
  const feedSolidsB = 750; // kg/h inert solid
  const feedSoluteA = 250; // kg/h solute in feed
  const underflowN_const = 1.5; // kg solid per kg solution (constant underflow)

  // Underflow model toggle in Year 3 mode
  const [underflowModel, setUnderflowModel] = useState<'constant' | 'variable'>('constant');

  // Calculations
  // Total solution in feed L0 = 250 kg solute + 0 solvent = 250 kg
  // xA0 = 250 / 250 = 1.0 (solute fraction in solution)
  // N0 = 750 / 250 = 3.0
  // Fresh solvent VN+1 = solventRate kg/h, yA = 0, N = 0
  const totalM = 250 + solventRate; // total solution in mixture (A + S)
  const xM = Number((feedSoluteA / totalM).toFixed(3));
  const NM = Number((feedSolidsB / totalM).toFixed(3));

  // Minimum solvent rate to avoid pinch (approx 720 kg/h for this feed)
  const minSolventRate = 720;
  const isPinchCondition = solventRate < minSolventRate;

  // Theoretical stages estimation
  let calculatedStages = 3;
  if (isPinchCondition) {
    calculatedStages = 999; // Infinite stages needed at pinch!
  } else if (underflowModel === 'variable') {
    // Variable underflow carries more solute back, requiring ~1 more stage
    if (solventRate < 850) calculatedStages = 6;
    else if (solventRate < 1150) calculatedStages = 5;
    else if (solventRate < 1600) calculatedStages = 4;
    else calculatedStages = 3;
  } else {
    // Constant underflow
    if (solventRate < 800) calculatedStages = 5;
    else if (solventRate < 1100) calculatedStages = 4;
    else if (solventRate < 1600) calculatedStages = 3;
    else calculatedStages = 2;
  }

  // Operating Difference Point Delta (L0 - V1 = LN - VN+1 = Delta)
  // Approximate V1 ~ solventRate * 0.95 kg/h, yA1 ~ 0.22
  const v1Rate = Math.round(solventRate * 0.92);
  const yA1 = Number((feedSoluteA * 0.94 / v1Rate).toFixed(3));
  const deltaSoln = 250 - v1Rate; // L0 - V1
  const xDelta = Number(((250 * 1.0 - v1Rate * yA1) / deltaSoln).toFixed(3));
  const nDelta = Number((feedSolidsB / deltaSoln).toFixed(3));

  // Extraction Factor E for Kremser calculation: E = m * V / L (m = 1.0)
  const avgL = 750 / underflowN_const; // 500 kg/h solution in underflow
  const extractionFactorE = Number((solventRate / avgL).toFixed(2));
  // Kremser stages:
  let kremserStages = 0;
  try {
    if (extractionFactorE > 1.01) {
      const term = (1.0 / 0.05) * (1 - 1 / extractionFactorE) + 1 / extractionFactorE;
      kremserStages = Number((Math.log(term) / Math.log(extractionFactorE)).toFixed(2));
    } else {
      kremserStages = 4.5;
    }
  } catch {
    kremserStages = 3.5;
  }

  // Student answers for Standard Challenges
  const [userXM, setUserXM] = useState<string>('');
  const [challenge1Checked, setChallenge1Checked] = useState<boolean>(false);
  const [challenge1Correct, setChallenge1Correct] = useState<boolean>(false);

  const [userStages, setUserStages] = useState<number | null>(null);
  const [challenge2Checked, setChallenge2Checked] = useState<boolean>(false);

  // Student answers for Year 3 Advanced Challenges
  const [userDeltaX, setUserDeltaX] = useState<string>('');
  const [advancedChecked, setAdvancedChecked] = useState<boolean>(false);
  const [advancedCorrect, setAdvancedCorrect] = useState<boolean>(false);

  const handleVerifyXM = () => {
    sound.playClick(700);
    const parsed = parseFloat(userXM);
    const isClose = Math.abs(parsed - xM) < 0.02;

    setChallenge1Checked(true);
    setChallenge1Correct(isClose);

    if (isClose) {
      sound.playSuccess();
      confetti({ particleCount: 30, spread: 50 });
      setStudent((prev) => ({
        ...prev,
        totalScore: prev.totalScore + 100,
        solverScore: prev.solverScore + 100,
      }));
    } else {
      sound.playError();
    }
  };

  const handleVerifyStages = () => {
    sound.playClick(700);
    const isCorrect = userStages === calculatedStages;
    setChallenge2Checked(true);

    if (isCorrect) {
      sound.playSuccess();
      confetti({ particleCount: 50, spread: 70 });
      setStudent((prev) => ({
        ...prev,
        totalScore: prev.totalScore + 150,
        solverScore: prev.solverScore + 150,
        badges: prev.badges.includes('Equilibrium Stage Master')
          ? prev.badges
          : [...prev.badges, 'Equilibrium Stage Master'],
      }));
    } else {
      sound.playError();
    }
  };

  const handleVerifyAdvanced = () => {
    sound.playClick(750);
    const parsed = parseFloat(userDeltaX);
    // xDelta is typically negative on Ponchon-Savarit coordinate axis (e.g. -0.05 to -0.3)
    const isClose = Math.abs(parsed - xDelta) < 0.1 || (parsed < 0 && Math.abs(parsed) < 0.5);

    setAdvancedChecked(true);
    setAdvancedCorrect(isClose);

    if (isClose) {
      sound.playSuccess();
      confetti({ particleCount: 60, spread: 75 });
      setStudent((prev) => ({
        ...prev,
        totalScore: prev.totalScore + 250,
        solverScore: prev.solverScore + 250,
        badges: prev.badges.includes('Ponchon-Savarit Virtuoso')
          ? prev.badges
          : [...prev.badges, 'Ponchon-Savarit Virtuoso'],
      }));
    } else {
      sound.playError();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top HUD Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { sound.playClick(); onBackToMenu(); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Menu
          </button>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Hunter-Nash & Ponchon-Savarit Stage Solver</span>
              <span className="text-[11px] font-mono text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-400/10 border border-purple-400/20">
                Mode 04
              </span>
            </h1>
          </div>
        </div>

        {/* Level Switcher: Standard vs Year 3 Advanced */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => { sound.playClick(); setSolverLevel('standard'); }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              solverLevel === 'standard'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Standard Level (Constant N)
          </button>
          <button
            onClick={() => { sound.playClick(); setSolverLevel('year3_advanced'); }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              solverLevel === 'year3_advanced'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Year 3 Advanced (Variable N & Δ Point)
          </button>
        </div>

        <div className="text-xs font-mono text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-400" />
          <span>Solver Score: <strong className="text-purple-300 tabular-nums">{student.solverScore} pts</strong></span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Hunter-Nash Coordinate Diagram (SVG Canvas) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-purple-400 font-semibold">
              HUNTER-NASH EQUILIBRIUM DIAGRAM & Δ OPERATING RAYS
            </span>
            <div className="flex items-center gap-2">
              {solverLevel === 'year3_advanced' && (
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
                  <button
                    onClick={() => { sound.playClick(); setUnderflowModel('constant'); }}
                    className={`px-2 py-0.5 rounded cursor-pointer ${underflowModel === 'constant' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Constant N
                  </button>
                  <button
                    onClick={() => { sound.playClick(); setUnderflowModel('variable'); }}
                    className={`px-2 py-0.5 rounded cursor-pointer ${underflowModel === 'variable' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    Variable N(x)
                  </button>
                </div>
              )}
              <span className="text-xs text-slate-400 font-mono">
                {underflowModel === 'variable' ? 'N(x) = 1.1 + 0.8·x' : `Constant N = ${underflowN_const}`}
              </span>
            </div>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 flex items-center justify-center relative min-h-[380px]">
            <svg viewBox="0 0 520 380" className="w-full h-full max-h-[440px]">
              {/* Coordinate Grid Lines */}
              <line x1="70" y1="310" x2="480" y2="310" stroke="#334155" strokeWidth="2" />
              <line x1="70" y1="310" x2="70" y2="30" stroke="#334155" strokeWidth="2" />

              {/* Axis Labels */}
              <text x="270" y="345" fill="#94A3B8" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle">
                Solute Fraction in Solution: x_A or y_A (0.0 to 1.0)
              </text>
              <text x="25" y="170" fill="#94A3B8" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle" transform="rotate(-90 25 170)">
                N = B / (A + S) [kg Inert / kg Solution]
              </text>

              {/* Ticks on X-axis */}
              <line x1="70" y1="310" x2="70" y2="316" stroke="#64748B" />
              <text x="70" y="330" fill="#64748B" fontSize="10" textAnchor="middle">0.0 (Pure S)</text>
              <line x1="275" y1="310" x2="275" y2="316" stroke="#64748B" />
              <text x="275" y="330" fill="#64748B" fontSize="10" textAnchor="middle">0.5</text>
              <line x1="480" y1="310" x2="480" y2="316" stroke="#64748B" />
              <text x="480" y="330" fill="#64748B" fontSize="10" textAnchor="middle">1.0 (Pure A)</text>

              {/* Ticks on Y-axis */}
              <line x1="64" y1="310" x2="70" y2="310" stroke="#64748B" />
              <text x="55" y="314" fill="#64748B" fontSize="10" textAnchor="end">0.0</text>
              <line x1="64" y1="185" x2="70" y2="185" stroke="#64748B" />
              <text x="55" y="189" fill="#64748B" fontSize="10" textAnchor="end">1.5</text>
              <line x1="64" y1="60" x2="70" y2="60" stroke="#64748B" />
              <text x="55" y="64" fill="#64748B" fontSize="10" textAnchor="end">3.0</text>

              {/* Overflow Line (N = 0) on x-axis */}
              <line x1="70" y1="310" x2="480" y2="310" stroke="#38BDF8" strokeWidth="3" />
              <text x="340" y="300" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono">
                Extract (Overflow) N = 0
              </text>

              {/* Underflow Line: Constant vs Variable Curved Line */}
              {underflowModel === 'constant' ? (
                <g>
                  <line x1="70" y1="185" x2="480" y2="185" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 4" />
                  <text x="340" y="175" fill="#F59E0B" fontSize="11" fontFamily="JetBrains Mono">
                    Underflow Line N = 1.5
                  </text>
                </g>
              ) : (
                /* Variable Underflow Curve: N(x) = 1.1 + 0.8x -> at x=0 N=1.1 (y=218), at x=1 N=1.9 (y=152) */
                <g>
                  <path d="M 70 218 Q 275 185 480 152" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="3 3" />
                  <text x="310" y="145" fill="#F59E0B" fontSize="11" fontFamily="JetBrains Mono">
                    Variable Underflow N(x) = 1.1 + 0.8·x
                  </text>
                </g>
              )}

              {/* Point VN+1 (Fresh Solvent: x=0, N=0) */}
              <circle cx="70" cy="310" r="6" fill="#38BDF8" />
              <text x="85" y="300" fill="#38BDF8" fontSize="12" fontWeight="bold">V_{'{N+1}'}</text>

              {/* Point L0 (Feed: x=1.0, N=3.0) */}
              <circle cx="480" cy="60" r="6" fill="#F59E0B" />
              <text x="440" y="50" fill="#F59E0B" fontSize="12" fontWeight="bold">L₀ (Feed)</text>

              {/* Mixing Line between L0 and VN+1 */}
              <line x1="70" y1="310" x2="480" y2="60" stroke="#A855F7" strokeWidth="2" />

              {/* Mixture Point M */}
              {(() => {
                const mx = 70 + xM * 410;
                const my = 310 - (NM / 3.0) * 250;
                return (
                  <g>
                    <circle cx={mx} cy={my} r="7" fill="#A855F7" stroke="#FFFFFF" strokeWidth="2" />
                    <text x={mx + 8} y={my - 8} fill="#C084FC" fontSize="11" fontWeight="bold">
                      M ({xM}, {NM})
                    </text>
                  </g>
                );
              })()}

              {/* In Year 3 Advanced Mode: Display the Operating Difference Point Δ */}
              {solverLevel === 'year3_advanced' && (
                <g>
                  {/* Delta point situated to the left or below: xDelta ~ -0.1 to -0.3 */}
                  <circle cx="35" cy="350" r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="15" y="370" fill="#F87171" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono">
                    Δ Point ({xDelta}, {nDelta})
                  </text>
                  {/* Delta Operating Ray passing through L0 and V1 */}
                  <line x1="35" y1="350" x2="480" y2="60" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="35" y1="350" x2="220" y2="310" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                </g>
              )}

              {/* Stepping rays */}
              <line x1="170" y1="310" x2="230" y2="185" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="2 2" />
              <text x="185" y="245" fill="#94A3B8" fontSize="10">Stage 1</text>

              <line x1="110" y1="310" x2="135" y2="185" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="2 2" />
              <text x="105" y="245" fill="#94A3B8" fontSize="10">Stage 2</text>
            </svg>

            {/* Pinch Point Alert if Solvent is below V_min */}
            {isPinchCondition && (
              <div className="absolute top-4 left-4 right-4 bg-rose-950/90 border border-rose-500 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2 shadow-2xl">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <strong>Tie-Line Pinch Condition Alert (V &lt; V_{'{min}'} = {minSolventRate} kg/h):</strong>
                  <div className="text-[11px] text-rose-300 mt-0.5">
                    Driving force vanishes at stage boundary. An infinite number of theoretical stages (N → ∞) is required!
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <span>
              {solverLevel === 'year3_advanced'
                ? `Net Difference Invariant: Δ = L_n - V_{n+1} = (${xDelta}, ${nDelta})`
                : 'Lever Rule: L₀ / V_{N+1} = dist(M, V_{N+1}) / dist(L₀, M)'}
            </span>
            <span className="font-mono text-amber-400 font-bold">
              Stages: {isPinchCondition ? '∞ (PINCH)' : calculatedStages}
            </span>
          </div>
        </div>

        {/* Right: Challenge Problems & Classroom Calculations */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Problem Statement Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>{solverLevel === 'year3_advanced' ? 'Year 3 Advanced Design Problem' : 'Classroom Problem Specification'}</span>
            </h2>
            <div className="text-xs text-slate-300 space-y-1.5 mb-4 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>• Solid Feed <strong className="text-amber-400">L₀ = 1000 kg/h</strong> (25% Solute A = 250 kg/h, 75% Inert B = 750 kg/h).</div>
              <div>• Pure Solvent <strong className="text-cyan-400">V_{'{N+1}'}</strong> at rate {solventRate} kg/h.</div>
              <div>• Retention Model: <strong className="text-emerald-400">{underflowModel === 'variable' ? 'Variable N(x) = 1.1 + 0.8·x (viscosity dependent)' : 'Constant N = 1.5 kg solid/kg solution'}</strong></div>
              <div>• Minimum Solvent Pinch: <strong className="text-rose-400">V_{'{min}'} = {minSolventRate} kg/h</strong></div>
            </div>

            {/* Interactive Solvent Flow Slider */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-semibold">Solvent Flow Rate (V_{'{N+1}'}):</span>
                <span className={`font-mono font-bold tabular-nums ${isPinchCondition ? 'text-rose-400' : 'text-cyan-400'}`}>
                  {solventRate} kg/h {isPinchCondition && '(PINCH ZONE!)'}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="2400"
                step="50"
                value={solventRate}
                onChange={(e) => setSolventRate(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span className="text-rose-400 font-mono">500 (Pinch &lt; {minSolventRate})</span>
                <span>2400 kg/h (High Solvent)</span>
              </div>
            </div>

            {/* Standard Challenges */}
            {solverLevel === 'standard' ? (
              <div className="space-y-4">
                {/* Challenge 1: Calculate xM */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Challenge 1: Find Mixture Solute Fraction (x_M)</span>
                    <span className="text-[10px] font-mono text-purple-400">+100 pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`Theoretical: ~${xM}`}
                      value={userXM}
                      onChange={(e) => setUserXM(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                    />
                    <button
                      onClick={handleVerifyXM}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Verify
                    </button>
                  </div>
                  {challenge1Checked && (
                    <div className={`mt-2 text-xs font-semibold ${challenge1Correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {challenge1Correct
                        ? `✓ Correct! x_M = ${xM}. Point M is positioned on the tie line.`
                        : `✗ Incorrect. Try: 250 / (250 + ${solventRate}) = ${xM}`}
                    </div>
                  )}
                </div>

                {/* Challenge 2: Stage Stepping */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Challenge 2: Stepping Equilibrium Stages</span>
                    <span className="text-[10px] font-mono text-purple-400">+150 pts</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => { sound.playClick(600); setUserStages(n); }}
                        className={`py-2 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                          userStages === n
                            ? 'bg-purple-500 text-slate-950 border-purple-400 scale-102'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {n} Stages
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={userStages === null}
                    onClick={handleVerifyStages}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Check Stage Answer
                  </button>
                  {challenge2Checked && (
                    <div className={`mt-2 text-xs font-semibold ${userStages === calculatedStages ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {userStages === calculatedStages
                        ? `✓ Exactly correct! With ${solventRate} kg/h solvent, the system steps off ${calculatedStages} ideal equilibrium stages.`
                        : `✗ Not quite. At ${solventRate} kg/h, ${calculatedStages} ideal equilibrium stages are required.`}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* YEAR 3 ADVANCED CHEMICAL ENGINEERING SUITE */
              <div className="space-y-4">
                {/* Advanced Kremser-Brown Analytical Engine */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Analytical Kremser Equation Solver
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">Extraction Factor E = {extractionFactorE}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1 mb-2 font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div>E = m · V / L = 1.0 · ({solventRate} / {avgL}) = <strong className="text-cyan-400">{extractionFactorE}</strong></div>
                    <div>N_{'{Kremser}'} = ln[ (x₀/x_N)(1 - 1/E) + 1/E ] / ln(E)</div>
                    <div>Analytical Stages Needed: <strong className="text-amber-300">{kremserStages} theoretical stages</strong></div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Notice how as E approaches 1.0, stage requirements diverge rapidly toward infinity (Pinch condition).
                  </p>
                </div>

                {/* Challenge 3: Operating Difference Point Delta Calculation */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Year 3 Problem: Coordinate of Operating Point Δ</span>
                    <span className="text-[10px] font-mono text-amber-400">+250 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Formula: <span className="font-mono text-slate-300">x_Δ = (L₀·x_A0 - V₁·y_A1) / (L₀ - V₁)</span>. Calculate x_Δ (Note: typically negative in Ponchon-Savarit coordinates):
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`e.g. ${xDelta}`}
                      value={userDeltaX}
                      onChange={(e) => setUserDeltaX(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <button
                      onClick={handleVerifyAdvanced}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Verify Δ
                    </button>
                  </div>
                  {advancedChecked && (
                    <div className={`mt-2 text-xs font-semibold ${advancedCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {advancedCorrect
                        ? `✓ Excellent! x_Δ = ${xDelta}. The operating difference rays pivot about this point through each equilibrium stage.`
                        : `✗ Not quite. With L₀=250 kg/h and V₁=${v1Rate} kg/h, x_Δ = ${xDelta}.`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
