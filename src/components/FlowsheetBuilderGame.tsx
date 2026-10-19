import React, { useState } from 'react';
import { EQUIPMENT_LIST } from '../data/extractionData';
import { StudentProfile } from '../types/extraction';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, HelpCircle, RefreshCw, Award, Info, Layers, RotateCw, ChevronsRight, FlaskConical, Workflow } from 'lucide-react';

interface FlowsheetBuilderGameProps {
  onBackToMenu: () => void;
  student: StudentProfile;
  setStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
}

interface StreamSlot {
  id: string;
  label: string;
  expectedToken: string;
  placedToken: string | null;
  description: string;
  stagePosition: string;
}

export const FlowsheetBuilderGame: React.FC<FlowsheetBuilderGameProps> = ({
  onBackToMenu,
  student,
  setStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'flowsheet' | 'equipment'>('flowsheet');

  // Stream Tokens available to place
  const streamTokens = [
    { id: 'L0', name: 'L₀ (Raw Solid Feed)', role: 'Solids In' },
    { id: 'VN+1', name: 'V_{N+1} (Fresh Solvent)', role: 'Solvent In' },
    { id: 'V1', name: 'V₁ (Final Concentrated Extract)', role: 'Extract Out' },
    { id: 'LN', name: 'L_N (Exhausted Spent Raffinate)', role: 'Spent Solids Out' },
    { id: 'V2', name: 'V₂ (Stage 2 Overflow)', role: 'Intermediate Overflow' },
    { id: 'L1', name: 'L₁ (Stage 1 Underflow)', role: 'Intermediate Underflow' },
  ];

  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  // Slots in 3-stage counter-current cascade
  const [slots, setSlots] = useState<StreamSlot[]>([
    {
      id: 'slot-l0',
      label: 'Stage 1 Solid Inlet',
      expectedToken: 'L0',
      placedToken: null,
      description: 'Raw solid feed entering the first extraction stage.',
      stagePosition: 'Left-top of Stage 1',
    },
    {
      id: 'slot-v1',
      label: 'Stage 1 Liquid Outlet',
      expectedToken: 'V1',
      placedToken: null,
      description: 'Rich concentrated miscella leaving Stage 1.',
      stagePosition: 'Left-bottom of Stage 1',
    },
    {
      id: 'slot-l1',
      label: 'Stage 1 Underflow Out',
      expectedToken: 'L1',
      placedToken: null,
      description: 'Underflow slurry transferring from Stage 1 to Stage 2.',
      stagePosition: 'Between Stage 1 & 2 (Lower stream)',
    },
    {
      id: 'slot-v2',
      label: 'Stage 2 Overflow Out',
      expectedToken: 'V2',
      placedToken: null,
      description: 'Intermediate miscella washing Stage 1 counter-currently.',
      stagePosition: 'Between Stage 2 & 1 (Upper stream)',
    },
    {
      id: 'slot-vnplus1',
      label: 'Stage 3 Solvent Inlet',
      expectedToken: 'VN+1',
      placedToken: null,
      description: 'Pure fresh solvent entering the final depleted stage.',
      stagePosition: 'Right-top of Stage 3',
    },
    {
      id: 'slot-ln',
      label: 'Stage 3 Raffinate Outlet',
      expectedToken: 'LN',
      placedToken: null,
      description: 'Final depleted marc / washed solids leaving system.',
      stagePosition: 'Right-bottom of Stage 3',
    },
  ]);

  const [cascadeChecked, setCascadeChecked] = useState<boolean>(false);
  const [cascadeScore, setCascadeScore] = useState<number>(0);

  // Equipment Matching State
  const [matchedEquipment, setMatchedEquipment] = useState<{ [key: string]: string }>({});
  const [selectedEquipId, setSelectedEquipId] = useState<string | null>(null);
  const [equipmentChecked, setEquipmentChecked] = useState<boolean>(false);

  // Handle Token placement
  const handlePlaceToken = (slotId: string) => {
    if (!selectedToken) return;
    sound.playClick(700);

    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          return { ...s, placedToken: selectedToken };
        }
        // Remove token from other slot if already placed
        if (s.placedToken === selectedToken) {
          return { ...s, placedToken: null };
        }
        return s;
      })
    );
    setSelectedToken(null);
    setCascadeChecked(false);
  };

  const handleVerifyCascade = () => {
    let correct = 0;
    slots.forEach((s) => {
      if (s.placedToken === s.expectedToken) correct++;
    });

    setCascadeChecked(true);
    setCascadeScore(correct);

    if (correct === slots.length) {
      sound.playSuccess();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setStudent((prev) => ({
        ...prev,
        totalScore: prev.totalScore + 200,
        flowsheetScore: 200,
        badges: prev.badges.includes('Cascade Architect') ? prev.badges : [...prev.badges, 'Cascade Architect'],
      }));
    } else {
      sound.playError();
    }
  };

  const handleResetCascade = () => {
    sound.playClick(500);
    setSlots((prev) => prev.map((s) => ({ ...s, placedToken: null })));
    setCascadeChecked(false);
    setSelectedToken(null);
  };

  // Equipment match handler
  const handleMatchFeature = (equipId: string, featureText: string) => {
    sound.playClick(650);
    setMatchedEquipment((prev) => ({
      ...prev,
      [equipId]: featureText,
    }));
  };

  const handleVerifyEquipment = () => {
    let correctCount = 0;
    EQUIPMENT_LIST.forEach((e) => {
      if (matchedEquipment[e.id] === e.keyFeature) {
        correctCount++;
      }
    });

    setEquipmentChecked(true);
    if (correctCount === EQUIPMENT_LIST.length) {
      sound.playSuccess();
      confetti({ particleCount: 60, spread: 70 });
      setStudent((prev) => ({
        ...prev,
        totalScore: prev.totalScore + 150,
        badges: prev.badges.includes('Equipment Specialist') ? prev.badges : [...prev.badges, 'Equipment Specialist'],
      }));
    } else {
      sound.playError();
    }
  };

  const getEquipmentIcon = (name: string) => {
    switch (name) {
      case 'Layers': return <Layers className="w-5 h-5 text-amber-400" />;
      case 'RotateCw': return <RotateCw className="w-5 h-5 text-cyan-400" />;
      case 'ChevronsRight': return <ChevronsRight className="w-5 h-5 text-emerald-400" />;
      case 'FlaskConical': return <FlaskConical className="w-5 h-5 text-rose-400" />;
      default: return <Workflow className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* HUD Header */}
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
              <span>Flowsheet & Equipment Builder</span>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20">
                Mode 02
              </span>
            </h1>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => { sound.playClick(); setActiveTab('flowsheet'); }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'flowsheet'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Counter-Current Cascade Flowsheet
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('equipment'); }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'equipment'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Match Industrial Leaching Equipment
          </button>
        </div>

        {/* Score indicator */}
        <div className="text-xs font-mono text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Flowsheet: <strong className="text-amber-300 tabular-nums">{student.flowsheetScore} pts</strong></span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {activeTab === 'flowsheet' ? (
          <div className="space-y-6">
            {/* Instruction banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Task: Assemble the 3-Stage Counter-Current Cascade</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select a stream token below, then click the matching port on the cascade flowsheet. Remember: In counter-current extraction, fresh solvent enters at the depleted end!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleResetCascade}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  onClick={handleVerifyCascade}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Verify Stream Connections
                </button>
              </div>
            </div>

            {/* Stream Token Palette */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-mono text-slate-400 block mb-2 font-semibold">
                AVAILABLE STREAM TOKENS (CLICK TO SELECT, THEN CLICK FLOWSHEET SLOT):
              </span>
              <div className="flex flex-wrap gap-2.5">
                {streamTokens.map((t) => {
                  const isSelected = selectedToken === t.id;
                  const isPlaced = slots.some((s) => s.placedToken === t.id);

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        sound.playClick(600);
                        setSelectedToken(isSelected ? null : t.id);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold scale-105 shadow-md shadow-amber-400/20 ring-2 ring-amber-300'
                          : isPlaced
                          ? 'bg-slate-800/40 text-slate-500 border border-slate-800'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <span className="font-bold">{t.name}</span>
                      <span className="text-[10px] opacity-75 font-sans">({t.role})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual 3-Stage Cascade Flowsheet Diagram */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-x-auto shadow-xl">
              <div className="min-w-[760px] flex items-center justify-between gap-4 py-8 relative">
                {/* Stage 1 Column */}
                <div className="flex-1 bg-slate-950 border-2 border-slate-700 rounded-xl p-4 flex flex-col items-center justify-between min-h-[260px] relative shadow-inner">
                  <div className="w-full text-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono font-bold text-amber-400">STAGE 1 (FEED END)</span>
                    <span className="text-[10px] text-slate-400 block">Raw Solids + Rich Extract</span>
                  </div>

                  {/* Stage 1 Top Port (Feed In L0) */}
                  <div
                    onClick={() => handlePlaceToken('slot-l0')}
                    className={`w-full p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      slots[0].placedToken
                        ? cascadeChecked
                          ? slots[0].placedToken === slots[0].expectedToken
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-rose-950/80 border-rose-500 text-rose-300'
                          : 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : selectedToken
                        ? 'border-dashed border-amber-400/80 bg-amber-400/5 hover:bg-amber-400/15'
                        : 'border-dashed border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">Solid Feed Inlet ⬇</div>
                    <div className="font-mono text-xs font-bold">
                      {slots[0].placedToken || '[Click to assign Stream]'}
                    </div>
                  </div>

                  {/* Stage 1 Bottom Port (Extract Out V1) */}
                  <div
                    onClick={() => handlePlaceToken('slot-v1')}
                    className={`w-full p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      slots[1].placedToken
                        ? cascadeChecked
                          ? slots[1].placedToken === slots[1].expectedToken
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-rose-950/80 border-rose-500 text-rose-300'
                          : 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : selectedToken
                        ? 'border-dashed border-cyan-400/80 bg-cyan-400/5 hover:bg-cyan-400/15'
                        : 'border-dashed border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">Liquid Extract Outlet ⬅</div>
                    <div className="font-mono text-xs font-bold">
                      {slots[1].placedToken || '[Click to assign Stream]'}
                    </div>
                  </div>
                </div>

                {/* Connecting Inter-stage Flow Lines 1 -> 2 */}
                <div className="w-24 flex flex-col justify-around h-[200px] text-center font-mono text-[10px]">
                  {/* Upper Stream: V2 flows Left from Stage 2 to 1 */}
                  <div
                    onClick={() => handlePlaceToken('slot-v2')}
                    className={`p-1.5 rounded border transition-all cursor-pointer ${
                      slots[3].placedToken
                        ? cascadeChecked
                          ? slots[3].placedToken === slots[3].expectedToken
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-rose-950/80 border-rose-500 text-rose-300'
                          : 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'border-dashed border-slate-700 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <span>⬅ Overflow V₂</span>
                    <div className="font-bold">{slots[3].placedToken || 'Select'}</div>
                  </div>

                  {/* Lower Stream: L1 flows Right from Stage 1 to 2 */}
                  <div
                    onClick={() => handlePlaceToken('slot-l1')}
                    className={`p-1.5 rounded border transition-all cursor-pointer ${
                      slots[2].placedToken
                        ? cascadeChecked
                          ? slots[2].placedToken === slots[2].expectedToken
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-rose-950/80 border-rose-500 text-rose-300'
                          : 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'border-dashed border-slate-700 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <span>➡ Underflow L₁</span>
                    <div className="font-bold">{slots[2].placedToken || 'Select'}</div>
                  </div>
                </div>

                {/* Stage 2 Column */}
                <div className="flex-1 bg-slate-950 border-2 border-slate-700 rounded-xl p-4 flex flex-col items-center justify-between min-h-[260px] relative shadow-inner">
                  <div className="w-full text-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono font-bold text-white">STAGE 2 (INTERMEDIATE)</span>
                    <span className="text-[10px] text-slate-400 block">Intermediate Contact & Washing</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-xs text-slate-500">
                    <Workflow className="w-8 h-8 text-slate-700 mb-2" />
                    <span>Cross-contact zone: L₁ meets V₃, producing V₂ and L₂.</span>
                  </div>
                </div>

                {/* Connecting Inter-stage Flow Lines 2 -> 3 */}
                <div className="w-24 flex flex-col justify-around h-[200px] text-center font-mono text-[10px] text-slate-500">
                  <div className="p-1.5 rounded border border-slate-800 bg-slate-950">
                    <span>⬅ Overflow V₃</span>
                  </div>
                  <div className="p-1.5 rounded border border-slate-800 bg-slate-950">
                    <span>➡ Underflow L₂</span>
                  </div>
                </div>

                {/* Stage 3 Column (Solvent End) */}
                <div className="flex-1 bg-slate-950 border-2 border-slate-700 rounded-xl p-4 flex flex-col items-center justify-between min-h-[260px] relative shadow-inner">
                  <div className="w-full text-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono font-bold text-cyan-400">STAGE 3 (SOLVENT END)</span>
                    <span className="text-[10px] text-slate-400 block">Depleted Marc + Fresh Solvent</span>
                  </div>

                  {/* Stage 3 Top Port (Fresh Solvent In VN+1) */}
                  <div
                    onClick={() => handlePlaceToken('slot-vnplus1')}
                    className={`w-full p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      slots[4].placedToken
                        ? cascadeChecked
                          ? slots[4].placedToken === slots[4].expectedToken
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-rose-950/80 border-rose-500 text-rose-300'
                          : 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : selectedToken
                        ? 'border-dashed border-cyan-400/80 bg-cyan-400/5 hover:bg-cyan-400/15'
                        : 'border-dashed border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">Fresh Solvent Inlet ⬇</div>
                    <div className="font-mono text-xs font-bold">
                      {slots[4].placedToken || '[Click to assign Stream]'}
                    </div>
                  </div>

                  {/* Stage 3 Bottom Port (Raffinate Out LN) */}
                  <div
                    onClick={() => handlePlaceToken('slot-ln')}
                    className={`w-full p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      slots[5].placedToken
                        ? cascadeChecked
                          ? slots[5].placedToken === slots[5].expectedToken
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-rose-950/80 border-rose-500 text-rose-300'
                          : 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : selectedToken
                        ? 'border-dashed border-amber-400/80 bg-amber-400/5 hover:bg-amber-400/15'
                        : 'border-dashed border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">Exhausted Raffinate Outlet ➡</div>
                    <div className="font-mono text-xs font-bold">
                      {slots[5].placedToken || '[Click to assign Stream]'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Alert if checked */}
              {cascadeChecked && (
                <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${cascadeScore === 6 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'bg-amber-950/60 border-amber-500 text-amber-200'}`}>
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 shrink-0" />
                    <span className="text-xs">
                      {cascadeScore === 6
                        ? 'Perfect! You correctly mapped all counter-current streams: Fresh solvent contacts exhausted solid at Stage 3, producing rich extract at Stage 1!'
                        : `You have ${cascadeScore} / 6 correct stream connections. Check the red highlighted slots and try again!`}
                    </span>
                  </div>
                  <span className="text-sm font-bold font-mono">{cascadeScore} / 6 Verified</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Equipment Matching Tab */
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Match Industrial Leaching Equipment with their Characteristic Features
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Chemical engineering plant designers must know when to specify a Bollman, Rotocel, Kennedy, Soxhlet, or Dorr thickener cascade.
                </p>
              </div>
              <button
                onClick={handleVerifyEquipment}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Check className="w-4 h-4" />
                Verify Equipment Matches
              </button>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EQUIPMENT_LIST.map((equip) => {
                const assigned = matchedEquipment[equip.id];
                const isCorrect = equipmentChecked && assigned === equip.keyFeature;

                return (
                  <div
                    key={equip.id}
                    className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                      equipmentChecked
                        ? isCorrect
                          ? 'border-emerald-500/80 bg-emerald-950/20'
                          : 'border-rose-500/80 bg-rose-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                          {getEquipmentIcon(equip.iconName)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{equip.name}</h3>
                          <span className="text-[10px] font-mono text-cyan-400 uppercase">{equip.type}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {equip.mechanism}
                      </p>
                    </div>

                    {/* Feature selection dropdown */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Match Key Engineering Feature:
                      </label>
                      <select
                        value={assigned || ''}
                        onChange={(e) => handleMatchFeature(equip.id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      >
                        <option value="">-- Select Matching Feature --</option>
                        {EQUIPMENT_LIST.map((f) => (
                          <option key={f.id} value={f.keyFeature}>
                            {f.keyFeature}
                          </option>
                        ))}
                      </select>

                      {equipmentChecked && (
                        <div className={`mt-2 text-[11px] font-semibold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isCorrect ? '✓ Correct identification!' : `✗ Incorrect: ${equip.keyFeature}`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
