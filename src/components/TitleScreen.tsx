import React, { useEffect } from 'react';
import { GameMode, StudentProfile } from '../types/extraction';
import { sound } from '../utils/audio';
import { Play, BookOpen, Award, Volume2, VolumeX, Sparkles, Activity, Layers, Shuffle, HelpCircle, Trophy, Share2 } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: (mode: GameMode) => void;
  onOpenReference: () => void;
  onOpenCertificate: () => void;
  onOpenLeaderboard: () => void;
  onOpenShare: () => void;
  student: StudentProfile;
  setStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenReference,
  onOpenCertificate,
  onOpenLeaderboard,
  onOpenShare,
  student,
  setStudent,
  isMuted,
  onToggleMute,
}) => {
  // Listen for Space / Enter to start standard campaign
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in the input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        sound.playClick(900);
        onStartGame('PLANT_SIM');
      } else if (e.key.toLowerCase() === 'm') {
        onToggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame, onToggleMute]);

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Background visual artwork with subtle gradient scrim */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <img
          src="/src/assets/images/hero_leaching_plant_1792397217085.jpg"
          alt="Industrial Leaching Plant"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
      </div>

      {/* Floating interactive particles / background grid lines */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Header bar: Clean 3-zone Top Bar Contract */}
      <header className="relative z-10 flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            LeachMaster <span className="text-amber-400 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 ml-1">v2.4 CE</span>
          </span>
        </div>

        {/* Zone 2: Navigation / Quick links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => { sound.playClick(); onOpenShare(); }}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-cyan-400 font-semibold"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            Share with Students
          </button>
          <button
            onClick={() => { sound.playClick(); onOpenLeaderboard(); }}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-amber-400"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Classroom Leaderboard
          </button>
          <button
            onClick={() => { sound.playClick(); onOpenReference(); }}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Equations & Cheat Sheet
          </button>
          <button
            onClick={() => { sound.playClick(); onOpenCertificate(); }}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            Score & Report Card
          </button>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            UPM Chemical Engineering Edition
          </span>
        </nav>

        {/* Zone 3: Audio mute & student profile tag */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              onToggleMute();
              sound.playClick(600);
            }}
            title="Toggle Sound FX (Key: M)"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => { sound.playClick(); onOpenLeaderboard(); }}
            className="text-xs bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-lg px-3 py-1.5 text-slate-300 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-semibold text-amber-300 font-mono tabular-nums">{student.totalScore} pts</span>
            <Trophy className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
          </button>
        </div>
      </header>

      {/* Main Hero & Centerpiece Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto px-6 py-8 text-center">
        {/* Inline SVG Title Lockup */}
        <div className="mb-4">
          <svg className="w-full max-w-md mx-auto h-20" viewBox="0 0 500 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="leachGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
            <text x="50%" y="45" textAnchor="middle" fill="url(#leachGrad)" fontFamily="Outfit, system-ui" fontSize="40" fontWeight="800" letterSpacing="1.5">
              LEACHMASTER
            </text>
            <text x="50%" y="68" textAnchor="middle" fill="#94A3B8" fontFamily="JetBrains Mono, monospace" fontSize="11" letterSpacing="4">
              SOLID-LIQUID EXTRACTION CHALLENGE
            </text>
          </svg>
        </div>

        {/* Hero description */}
        <p className="max-w-2xl text-slate-300 text-base md:text-lg mb-8 text-balance">
          Master the mass transfer, equilibrium stages, and industrial cascades of leaching. Test your chemical engineering intuition through interactive simulations and classroom battles.
        </p>

        {/* Student identification badge bar */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-8 text-left shadow-xl backdrop-blur-sm">
          <div className="text-xs font-mono text-slate-400 mb-2 flex items-center justify-between">
            <span>STUDENT PROFILE FOR CLASS SCORING</span>
            <button
              onClick={() => { sound.playClick(); onOpenLeaderboard(); }}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>View Leaderboard</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Your Name / Team</label>
              <input
                type="text"
                value={student.name}
                onChange={(e) => setStudent((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sarah / Team Aliquot"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Matric / Student ID</label>
              <input
                type="text"
                value={student.matricNumber}
                onChange={(e) => setStudent((prev) => ({ ...prev, matricNumber: e.target.value }))}
                placeholder="e.g. 210842"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Primary Start CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <button
            onClick={() => {
              sound.playClick(950);
              onStartGame('PLANT_SIM');
            }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Launch Leaching Simulation</span>
          </button>

          <button
            onClick={() => {
              sound.playClick(850);
              onStartGame('CLASS_QUIZ');
            }}
            className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-white font-semibold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Start Quick-Fire Quiz (15 Qs)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick(800);
              onOpenLeaderboard();
            }}
            className="px-5 py-3.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-semibold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Class Leaderboard</span>
          </button>
        </div>

        {/* Flat control-hint line as required by guidelines */}
        <div className="text-xs font-mono text-slate-400/90 tracking-wide mb-8">
          Enter / Space to Start · Click to Configure · M Mute Sound · Esc Pause / Menu
        </div>

        {/* 4 Interactive Game Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          {/* Card 1 */}
          <div
            onClick={() => { sound.playClick(); onStartGame('PLANT_SIM'); }}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">Mode 01</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
              Plant Operator Simulation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tweak particle milling, solvent polarity, temperature, and 3-stage cascades with live percolation visuals.
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => { sound.playClick(); onStartGame('FLOWSHEET_BUILDER'); }}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Shuffle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">Mode 02</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
              Flowsheet & Equipment Builder
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect counter-current streams (L₀, V₁, VN+1, LN) and match Bollman, Rotocel, Kennedy & Soxhlet extractors.
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => { sound.playClick(); onStartGame('CLASS_QUIZ'); }}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">Mode 03</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors mb-1">
              Quick-Fire Class Battle
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              15 chemical engineering quiz questions with timers, combo streaks, and detailed formula explanations.
            </p>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => { sound.playClick(); onStartGame('STAGE_SOLVER'); }}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">Mode 04</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors mb-1">
              Equilibrium & Stage Solver
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hunter-Nash ternary mixing point calculation and theoretical equilibrium stage stepping mini-game.
            </p>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="relative z-10 px-6 py-4 border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          Designed for Solid-Liquid Extraction (Leaching) Classroom Modules · Universiti Putra Malaysia
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { sound.playClick(); onOpenShare(); }}
            className="hover:text-cyan-300 transition-colors underline cursor-pointer text-cyan-400 font-semibold"
          >
            Share Link & QR Code
          </button>
          <span>·</span>
          <button
            onClick={() => { sound.playClick(); onOpenLeaderboard(); }}
            className="hover:text-slate-200 transition-colors underline cursor-pointer"
          >
            Global Classroom Leaderboard
          </button>
          <span>·</span>
          <button
            onClick={() => { sound.playClick(); onOpenReference(); }}
            className="hover:text-slate-200 transition-colors underline cursor-pointer"
          >
            Extraction Principles Reference
          </button>
          <span>·</span>
          <button
            onClick={() => { sound.playClick(); onOpenCertificate(); }}
            className="hover:text-slate-200 transition-colors underline cursor-pointer"
          >
            View Student Report
          </button>
        </div>
      </footer>
    </div>
  );
};
