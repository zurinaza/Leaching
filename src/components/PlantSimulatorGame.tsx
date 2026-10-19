import React, { useState, useEffect, useRef } from 'react';
import { PLANT_CONTRACTS } from '../data/extractionData';
import { SimulationParams, SimulationResults, StudentProfile } from '../types/extraction';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Play, RotateCcw, AlertTriangle, CheckCircle2, Flame, Droplet, Gauge, Star, Award, Layers } from 'lucide-react';

interface PlantSimulatorGameProps {
  onBackToMenu: () => void;
  student: StudentProfile;
  setStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
}

export const PlantSimulatorGame: React.FC<PlantSimulatorGameProps> = ({
  onBackToMenu,
  student,
  setStudent,
}) => {
  const [selectedContractIndex, setSelectedContractIndex] = useState<number>(0);
  const contract = PLANT_CONTRACTS[selectedContractIndex];

  // Simulation parameters
  const [params, setParams] = useState<SimulationParams>({
    particleSizeMm: 0.5,
    selectedSolventId: contract.solventsAvailable[0].id,
    temperatureC: 55,
    agitationRpm: 250,
    solventToFeedRatio: 1.5,
    configuration: 'counter_3',
  });

  // Keep solvent valid when changing contract
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      selectedSolventId: contract.solventsAvailable[0].id,
      temperatureC: Math.round((contract.optimalTempRange[0] + contract.optimalTempRange[1]) / 2),
      particleSizeMm: Number(((contract.optimalParticleMm[0] + contract.optimalParticleMm[1]) / 2).toFixed(1)),
      solventToFeedRatio: Number(((contract.optimalRatioSF[0] + contract.optimalRatioSF[1]) / 2).toFixed(1)),
    }));
    setResults(null);
    setIsRunning(false);
  }, [selectedContractIndex]);

  // Simulation execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0); // 0 to 100%
  const [results, setResults] = useState<SimulationResults | null>(null);

  // Canvas ref for 60fps particle simulation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Particles for canvas
  const particlesRef = useRef<
    {
      x: number;
      y: number;
      radius: number;
      soluteRemaining: number; // 1.0 = rich, 0.0 = leached
      swirlAngle: number;
      speed: number;
    }[]
  >([]);

  // Liquid solvent drops
  const dropletsRef = useRef<
    {
      x: number;
      y: number;
      speedY: number;
      soluteConc: number;
      size: number;
    }[]
  >([]);

  // Initialize particles in bed
  useEffect(() => {
    const numParticles = 45;
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: 40 + Math.random() * 220,
        y: 80 + Math.random() * 260,
        radius: Math.max(5, Math.min(18, params.particleSizeMm * 10)),
        soluteRemaining: 1.0,
        swirlAngle: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      });
    }
    particlesRef.current = particles;

    const droplets = [];
    for (let i = 0; i < 30; i++) {
      droplets.push({
        x: 40 + Math.random() * 220,
        y: Math.random() * 380,
        speedY: 2 + Math.random() * 2.5,
        soluteConc: 0,
        size: 2 + Math.random() * 2,
      });
    }
    dropletsRef.current = droplets;
  }, [params.particleSizeMm]);

  // 60fps Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05); // clamped dt
      lastTime = now;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw Extractor vessel column background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(30, 40, 240, 320);

      // Glass shine & wall outline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 40, 240, 320);

      // Perforated support grid at bottom
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(32, 335);
      ctx.lineTo(268, 335);
      ctx.stroke();

      // Inflow spray nozzles at top
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(135, 20, 30, 20);
      ctx.beginPath();
      ctx.arc(150, 40, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      // Overflow / Extract collection chamber (top right or bottom)
      ctx.fillStyle = isRunning && simProgress > 10 ? '#f59e0b' : '#1e293b';
      ctx.fillRect(268, 60, 24, 16);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('EXTRACT', 230, 52);

      // Underflow / Raffinate collector at bottom
      ctx.fillStyle = '#334155';
      ctx.fillRect(135, 360, 30, 20);
      ctx.fillText('RAFFINATE (L)', 110, 395);

      // Draw liquid solvent level
      const liquidLevelHeight = 280;
      const solventColor = isRunning
        ? `rgba(245, 158, 11, ${0.1 + (simProgress / 100) * 0.55})`
        : 'rgba(56, 189, 248, 0.15)';
      ctx.fillStyle = solventColor;
      ctx.fillRect(32, 360 - liquidLevelHeight, 236, liquidLevelHeight);

      // Draw droplets percolating down
      ctx.fillStyle = isRunning && simProgress > 30 ? '#fbbf24' : '#38bdf8';
      dropletsRef.current.forEach((d) => {
        if (isRunning) {
          d.y += d.speedY * (1 + params.agitationRpm / 300);
          if (d.y > 330) {
            d.y = 45;
            d.x = 45 + Math.random() * 210;
          }
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw particles & solute diffusion plumes
      const agitationFactor = (params.agitationRpm / 600) * 1.5;
      particlesRef.current.forEach((p) => {
        if (isRunning) {
          // Solute depletes during run
          const leachRate = (0.008 * (params.temperatureC / 40) * (1 / Math.max(0.2, params.particleSizeMm))) * dt;
          p.soluteRemaining = Math.max(0, p.soluteRemaining - leachRate);

          // Gentle agitation movement
          p.swirlAngle += agitationFactor * dt * 3;
          p.x += Math.cos(p.swirlAngle) * 0.4;
          p.y += Math.sin(p.swirlAngle) * 0.4;

          // Keep in bounds
          if (p.x < 45) p.x = 45;
          if (p.x > 255) p.x = 255;
          if (p.y < 70) p.y = 70;
          if (p.y > 325) p.y = 325;
        }

        // Draw diffusing solute plume halo around particle
        if (p.soluteRemaining > 0.05 && isRunning) {
          const plumeGrad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.8, p.x, p.y, p.radius * 2.2);
          plumeGrad.addColorStop(0, `rgba(245, 158, 11, ${p.soluteRemaining * 0.5})`);
          plumeGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = plumeGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Solid particle core
        // Color shifts from rich gold/amber to exhausted beige/gray
        const r = Math.round(180 * p.soluteRemaining + 100 * (1 - p.soluteRemaining));
        const g = Math.round(110 * p.soluteRemaining + 116 * (1 - p.soluteRemaining));
        const b = Math.round(20 * p.soluteRemaining + 139 * (1 - p.soluteRemaining));
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Impeller in center if agitation > 0
      ctx.save();
      ctx.translate(150, 200);
      const angle = isRunning ? (now / 1000) * (params.agitationRpm / 60) * Math.PI * 2 : 0;
      ctx.rotate(angle);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-35, 0);
      ctx.lineTo(35, 0);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-35, -5, 10, 10);
      ctx.fillRect(25, -5, 10, 10);
      ctx.restore();

      // Fluid flow arrows
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('Solvent In', 95, 25);

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, simProgress, params]);

  // Handle simulation run
  const handleRunSimulation = () => {
    sound.playClick(750);
    sound.playBubble();
    setIsRunning(true);
    setSimProgress(0);
    setResults(null);

    // Reset particles solute
    particlesRef.current.forEach((p) => {
      p.soluteRemaining = 1.0;
    });

    let current = 0;
    const interval = setInterval(() => {
      current += 4;
      setSimProgress(current);
      if (current % 20 === 0) {
        sound.playBubble();
      }

      if (current >= 100) {
        clearInterval(interval);
        setIsRunning(false);

        // Calculate realistic chemical engineering results
        calculateResults();
      }
    }, 100);
  };

  const calculateResults = () => {
    const selectedSolvent = contract.solventsAvailable.find((s) => s.id === params.selectedSolventId);
    const selectivity = selectedSolvent ? selectedSolvent.selectivityScore : 5;

    // Mass transfer factors
    // Smaller dp = larger specific area, but dp < 0.25 causes severe channeling/compaction
    let particleScore = 1.0;
    const isCompacted = params.particleSizeMm < 0.25;
    if (isCompacted) {
      particleScore = 0.55; // Channeling and high pressure drop
    } else if (params.particleSizeMm >= contract.optimalParticleMm[0] && params.particleSizeMm <= contract.optimalParticleMm[1]) {
      particleScore = 1.0;
    } else if (params.particleSizeMm > contract.optimalParticleMm[1]) {
      // Internal diffusion limitation
      particleScore = Math.max(0.5, 1.0 - (params.particleSizeMm - contract.optimalParticleMm[1]) * 0.2);
    }

    // Temperature factor:
    let tempScore = 1.0;
    const isOverheated = selectedSolvent && params.temperatureC >= selectedSolvent.boilingPointC - 2;
    const isThermalDegraded = (contract.id === 'anthocyanin-pigment' && params.temperatureC > 55) ||
      (contract.id === 'palm-oil-carotenoid' && params.temperatureC > 58);
    if (isOverheated) {
      tempScore = 0.4;
    } else if (isThermalDegraded) {
      tempScore = 0.35; // Anthocyanin or Carotenoid destroyed
    } else if (params.temperatureC >= contract.optimalTempRange[0] && params.temperatureC <= contract.optimalTempRange[1]) {
      tempScore = 1.0;
    } else if (params.temperatureC < contract.optimalTempRange[0]) {
      tempScore = 0.65;
    }

    // Cascade configuration bonus:
    // Single Stage: max 70-75% recovery for typical S/F
    // Cross-Current (3): 85-92%
    // Counter-Current (3): 95-99%
    let cascadeMultiplier = 1.0;
    if (params.configuration === 'counter_3') {
      cascadeMultiplier = 1.25;
    } else if (params.configuration === 'cross_3') {
      cascadeMultiplier = 1.05;
    } else {
      cascadeMultiplier = 0.8;
    }

    // S/F ratio effect
    const sfFactor = Math.min(1.15, params.solventToFeedRatio / 1.5);

    // Calculate Recovery %
    const baseRecovery = (selectivity / 10) * 80;
    const calculatedRecovery = Math.min(99.4, Math.max(12, baseRecovery * particleScore * tempScore * cascadeMultiplier * sfFactor));

    // Extract concentration %
    // In counter-current, extract is concentrated. In cross-current, high solvent volume dilutes it.
    let extractConc = 18;
    if (params.configuration === 'counter_3') {
      extractConc = Math.min(32, 22 * (1 / (params.solventToFeedRatio * 0.6)));
    } else if (params.configuration === 'cross_3') {
      extractConc = Math.min(14, 15 * (1 / (params.solventToFeedRatio * 1.4)));
    } else {
      extractConc = Math.min(20, 16 * (1 / params.solventToFeedRatio));
    }

    // Solvent loss & energy
    const solventLoss = Number((params.solventToFeedRatio * 0.08 * (params.temperatureC > 65 ? 1.4 : 1.0)).toFixed(2));
    const energy = Math.round(100 - (params.temperatureC - 20) * 0.4 - params.agitationRpm * 0.04 - (params.configuration === 'cross_3' ? 25 : 0));

    // Overall Yield Score (0-100)
    let score = Math.round(calculatedRecovery * 0.7 + (extractConc / 30) * 20 + (energy / 100) * 10);
    score = Math.min(100, Math.max(10, score));

    // Warnings and feedback
    const warnings: string[] = [];
    const notes: string[] = [];

    if (isCompacted) {
      warnings.push('Bed Compaction Alert: Particle diameter < 0.25 mm caused high pressure drop, slow percolation, and channeling.');
    }
    if (isOverheated) {
      warnings.push(`Vaporization Warning: Operating temperature (${params.temperatureC}°C) is near/above ${selectedSolvent?.name} boiling point (${selectedSolvent?.boilingPointC}°C)! Risk of flashing.`);
    }
    if (isThermalDegraded) {
      warnings.push(
        contract.id === 'palm-oil-carotenoid'
          ? 'Thermal Carotenoid Bleaching: Trans-beta-carotene isomerized and degraded rapidly above 58°C!'
          : 'Thermal Degradation: Anthocyanins degraded rapidly above 55°C! Yield dropped significantly.'
      );
    }
    if (params.configuration === 'cross_3') {
      warnings.push('High Solvent Volume: 3-Stage cross-current consumed 3× fresh solvent, resulting in a very dilute extract requiring heavy distillation.');
    }

    if (calculatedRecovery >= contract.minRecoveryTarget) {
      notes.push(`Target Met: Recovery of ${calculatedRecovery.toFixed(1)}% exceeds the ${contract.minRecoveryTarget}% production contract requirement!`);
    } else {
      notes.push(`Under Target: Recovery of ${calculatedRecovery.toFixed(1)}% is below the required ${contract.minRecoveryTarget}%. Try counter-current mode or optimize solvent & temperature.`);
    }

    if (params.configuration === 'counter_3') {
      notes.push('Counter-Current Excellence: Fresh solvent meets depleted raffinate while rich miscella leaves Stage 1, providing optimal driving force.');
    }

    const calculatedResults: SimulationResults = {
      recoveryPct: Number(calculatedRecovery.toFixed(1)),
      extractConcentrationPct: Number(extractConc.toFixed(1)),
      underflowResidualPct: Number((100 - calculatedRecovery).toFixed(1)),
      extractionTimeMin: Number((18 + (params.particleSizeMm * 12) / (params.agitationRpm / 150)).toFixed(1)),
      solventLossKg: solventLoss,
      energyScore: Math.max(10, energy),
      overallYieldScore: score,
      warnings,
      feedbackNotes: notes,
    };

    setResults(calculatedResults);

    // Award stars and update student total score
    if (calculatedRecovery >= contract.minRecoveryTarget && !isCompacted && !isThermalDegraded) {
      sound.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      setStudent((prev) => ({
        ...prev,
        totalScore: prev.totalScore + 150,
        simStars: Math.min(12, prev.simStars + 1),
        badges: prev.badges.includes('Plant Master') ? prev.badges : [...prev.badges, 'Plant Master'],
      }));
    } else {
      sound.playError();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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
              <span>Leaching Plant Operator</span>
              <span className="text-[11px] font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                Mode 01
              </span>
            </h1>
          </div>
        </div>

        {/* Contract Selector Tabs */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {PLANT_CONTRACTS.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                sound.playClick();
                setSelectedContractIndex(idx);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                selectedContractIndex === idx
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{c.material.split(' ')[0]}</span>
              {c.difficulty === 'year3_advanced' && (
                <span className="text-[9px] px-1 rounded bg-amber-400/20 text-amber-300 font-mono">Y3</span>
              )}
              <span className="opacity-75">({idx + 1}/{PLANT_CONTRACTS.length})</span>
            </button>
          ))}
        </div>

        {/* Student score info */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{student.simStars} Stars</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-300 font-bold tabular-nums">{student.totalScore} pts</span>
          </div>
        </div>
      </header>

      {/* Main Simulation Viewport: Two-Zone Sandbox */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Left: 60fps Interactive Extractor Stage (Column View) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-mono text-amber-400 font-semibold block">LIVE EXTRACTOR COLUMN</span>
              <span className="text-sm font-bold text-white">{contract.material}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded text-[11px] ${isRunning ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                {isRunning ? `PERCOLATING (${simProgress}%)` : 'STANDBY'}
              </span>
            </div>
          </div>

          {/* Canvas container */}
          <div className="relative flex-1 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 overflow-hidden py-2 min-h-[380px]">
            <canvas
              ref={canvasRef}
              width={300}
              height={410}
              className="max-h-full drop-shadow-lg"
            />

            {/* Visual indicators overlay */}
            <div className="absolute top-3 left-3 text-[11px] font-mono text-slate-400 space-y-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60 pointer-events-none">
              <div>Target: <span className="text-amber-300">{contract.targetSolute.split(' ')[0]}</span></div>
              <div>Matrix: <span className="text-slate-300">{contract.inertMatrix.split(' ')[0]}</span></div>
              <div>Config: <span className="text-cyan-300 uppercase">{params.configuration.replace('_', ' ')}</span></div>
            </div>

            {/* Compaction / flooding warning badge */}
            {params.particleSizeMm < 0.25 && (
              <div className="absolute bottom-4 left-4 right-4 bg-rose-950/90 border border-rose-500 text-rose-200 text-xs p-2 rounded-lg flex items-center gap-2 pointer-events-none">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Bed Compaction Warning: Fines create severe flow resistance!</span>
              </div>
            )}
          </div>

          {/* Quick Contract Brief */}
          <div className="mt-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400">
            <span className="text-amber-400 font-semibold block mb-0.5">Plant Objective:</span>
            {contract.description}
          </div>
        </div>

        {/* Right: Parameter Control Deck & Analytical Results */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Controls Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Chemical Engineering Operating Controls
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Min. Recovery Target: <strong className="text-amber-300">{contract.minRecoveryTarget}%</strong>
              </span>
            </div>

            {/* Control Sliders & Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. Solvent Selection */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                  <span>1. Leaching Solvent (Selectivity)</span>
                  <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                </label>
                <select
                  value={params.selectedSolventId}
                  onChange={(e) => {
                    sound.playClick(600);
                    setParams({ ...params, selectedSolventId: e.target.value });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {contract.solventsAvailable.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Selectivity: {s.selectivityScore}/10, BP: {s.boilingPointC}°C)
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-[11px] text-slate-400">
                  Ideal: {contract.recommendedSolvent}
                </div>
              </div>

              {/* 2. Cascade Configuration */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                  <span>2. Cascade Configuration</span>
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => { sound.playClick(); setParams({ ...params, configuration: 'single' }); }}
                    className={`py-1.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                      params.configuration === 'single'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    1-Stage
                  </button>
                  <button
                    type="button"
                    onClick={() => { sound.playClick(); setParams({ ...params, configuration: 'cross_3' }); }}
                    className={`py-1.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                      params.configuration === 'cross_3'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    3-Cross
                  </button>
                  <button
                    type="button"
                    onClick={() => { sound.playClick(); setParams({ ...params, configuration: 'counter_3' }); }}
                    className={`py-1.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                      params.configuration === 'counter_3'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    3-Counter
                  </button>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {params.configuration === 'counter_3' ? 'Counter-Current: High recovery & high extract conc.' : params.configuration === 'cross_3' ? 'Cross-Current: Consumes 3x solvent' : 'Single stage equilibrium'}
                </div>
              </div>

              {/* 3. Particle Size dp */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-300">3. Particle Size (dp)</span>
                  <span className="font-mono text-amber-400 tabular-nums">{params.particleSizeMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.1"
                  value={params.particleSizeMm}
                  onChange={(e) => setParams({ ...params, particleSizeMm: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span className="text-rose-400 font-mono">0.1 mm (Compaction)</span>
                  <span>Optimal: {contract.optimalParticleMm[0]}-{contract.optimalParticleMm[1]} mm</span>
                  <span className="font-mono">4.0 mm (Slow Diff.)</span>
                </div>
              </div>

              {/* 4. Operating Temperature */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    4. Temperature (T)
                  </span>
                  <span className="font-mono text-rose-400 tabular-nums">{params.temperatureC} °C</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  step="1"
                  value={params.temperatureC}
                  onChange={(e) => setParams({ ...params, temperatureC: parseInt(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>20 °C</span>
                  <span>Optimal: {contract.optimalTempRange[0]}-{contract.optimalTempRange[1]} °C</span>
                  <span>95 °C</span>
                </div>
              </div>

              {/* 5. Solvent-to-Feed Ratio S/F */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-300">5. Solvent-to-Feed (S/F Ratio)</span>
                  <span className="font-mono text-cyan-400 tabular-nums">{params.solventToFeedRatio} kg/kg</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="5.0"
                  step="0.1"
                  value={params.solventToFeedRatio}
                  onChange={(e) => setParams({ ...params, solventToFeedRatio: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0.8 (Lean)</span>
                  <span>Target: {contract.optimalRatioSF[0]}-{contract.optimalRatioSF[1]}</span>
                  <span>5.0 (Excessive)</span>
                </div>
              </div>

              {/* 6. Agitation Speed RPM */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-300">6. Agitation / Impeller Speed</span>
                  <span className="font-mono text-emerald-400 tabular-nums">{params.agitationRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="600"
                  step="25"
                  value={params.agitationRpm}
                  onChange={(e) => setParams({ ...params, agitationRpm: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>50 (Thick film)</span>
                  <span>Thins boundary layer (kL)</span>
                  <span>600 RPM</span>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setParams({
                    particleSizeMm: 0.5,
                    selectedSolventId: contract.solventsAvailable[0].id,
                    temperatureC: 50,
                    agitationRpm: 250,
                    solventToFeedRatio: 1.5,
                    configuration: 'counter_3',
                  });
                }}
                className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>

              <button
                type="button"
                disabled={isRunning}
                onClick={handleRunSimulation}
                className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isRunning
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-98'
                }`}
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{isRunning ? 'Running Mass Transfer...' : 'Execute Leaching Run'}</span>
              </button>
            </div>
          </div>

          {/* Results Analytics Panel */}
          {results && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Plant Performance Report & Material Balance
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Score:</span>
                  <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
                    {results.overallYieldScore} / 100
                  </span>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Solute Recovery</div>
                  <div className={`text-xl font-bold font-mono tabular-nums ${results.recoveryPct >= contract.minRecoveryTarget ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {results.recoveryPct}%
                  </div>
                  <div className="text-[10px] text-slate-400">Target: {contract.minRecoveryTarget}%</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Extract (V₁) Conc.</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
                    {results.extractConcentrationPct}%
                  </div>
                  <div className="text-[10px] text-slate-400">Miscella richness</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Spent Marc Loss</div>
                  <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
                    {results.underflowResidualPct}%
                  </div>
                  <div className="text-[10px] text-slate-400">Unextracted in LN</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Energy & Recovery</div>
                  <div className="text-xl font-bold font-mono text-purple-400 tabular-nums">
                    {results.energyScore}/100
                  </div>
                  <div className="text-[10px] text-slate-400">Solvent duty</div>
                </div>
              </div>

              {/* Warnings & Notes */}
              {results.warnings.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {results.warnings.map((w, idx) => (
                    <div key={idx} className="bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs p-2.5 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                {results.feedbackNotes.map((note, idx) => (
                  <div key={idx} className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs p-2.5 rounded-lg flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
