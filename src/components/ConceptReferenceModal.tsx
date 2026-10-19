import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { X, BookOpen, Layers, CheckCircle2, ChevronRight, GraduationCap } from 'lucide-react';

interface ConceptReferenceModalProps {
  onClose: () => void;
}

export const ConceptReferenceModal: React.FC<ConceptReferenceModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<'principles' | 'equations' | 'cascades' | 'equipment' | 'advanced_year3'>('principles');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Solid-Liquid Extraction (Leaching) Engineering Reference
              </h2>
              <p className="text-xs text-slate-400">Chemical Engineering Module Cheat Sheet · UPM Edition</p>
            </div>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs overflow-x-auto">
          <button
            onClick={() => { sound.playClick(); setActiveSection('principles'); }}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'principles'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Mass Transfer Steps
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveSection('equations'); }}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'equations'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Governing Equations
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveSection('cascades'); }}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'cascades'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Cascade Modes
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveSection('equipment'); }}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'equipment'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Industrial Equipment
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveSection('advanced_year3'); }}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'advanced_year3'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-amber-400/70 hover:text-amber-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            5. Year 3 Advanced Formulations
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300">
          {activeSection === 'principles' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>The 4 Physical Steps in Solid-Liquid Extraction</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1">Step 1: Solvent Penetration & Wetting</div>
                  <p className="text-slate-400 leading-relaxed">
                    The solvent transfers across the liquid boundary layer, wets the solid exterior, and enters into the internal porous network via capillary suction.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="font-bold text-cyan-400 mb-1">Step 2: Solute Dissolution</div>
                  <p className="text-slate-400 leading-relaxed">
                    Solute dissolves into the intra-pore liquid until reaching saturation concentration (c*) determined by thermodynamic solubility.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1">Step 3: Internal Pore Diffusion</div>
                  <p className="text-slate-400 leading-relaxed">
                    Dissolved solute molecules diffuse through the tortuous pore matrix toward the outer particle surface (often the rate-limiting step).
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="font-bold text-purple-400 mb-1">Step 4: External Boundary Layer Transfer</div>
                  <p className="text-slate-400 leading-relaxed">
                    Solute migrates across the stagnant liquid boundary film (δ) into the bulk solvent stream (accelerated by mechanical agitation).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'equations' && (
            <div className="space-y-3 font-mono">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-amber-400 font-bold mb-1 font-sans">1. Fick's First Law of Diffusion:</div>
                <div className="bg-slate-900 p-2 rounded text-slate-100">J_A = -D_AB · (dc_A / dz)</div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  Diffusive flux is proportional to the concentration gradient.
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-cyan-400 font-bold mb-1 font-sans">2. Mass Transfer Rate across Film:</div>
                <div className="bg-slate-900 p-2 rounded text-slate-100">N_A = k_L · A · (c^* - c)</div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  Where k_L = D_AB / δ. Mechanical agitation thins δ and increases k_L.
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1 font-sans">3. Stokes-Einstein Relation:</div>
                <div className="bg-slate-900 p-2 rounded text-slate-100">D_AB = (k_B · T) / (6 · π · μ · r)</div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  Diffusivity rises with operating temperature (T) and inversely with solvent viscosity (μ).
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-purple-400 font-bold mb-1 font-sans">4. Hunter-Nash Underflow Ratio & Lever Rule:</div>
                <div className="bg-slate-900 p-2 rounded text-slate-100">N = B / (A + S)  ;  M = L₀ + V_{'{N+1}'} = L_N + V₁</div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  Solute-free underflow coordinates plot as horizontal line at N = constant under constant underflow assumption.
                </div>
              </div>
            </div>
          )}

          {activeSection === 'cascades' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white mb-1">Single Stage Extraction</h4>
                <p className="text-slate-400 leading-relaxed">
                  Solids and fresh solvent are mixed and allowed to settle once. Solute recovery is limited by the single equilibrium partition, typically leaving substantial solute in the underflow unless huge solvent volumes are used.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-1">Multistage Cross-Current (Cross-Flow)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Underflow from each stage is treated with fresh solvent in the subsequent stage. Yield is high, but it consumes vast quantities of fresh solvent and produces very dilute combined extract solutions requiring high downstream evaporation energy.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-emerald-400 mb-1">Multistage Counter-Current Cascade (Industry Standard)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Raw solid feed (L₀) enters Stage 1 and meets concentrated solvent, while pure solvent (V_{'{N+1}'}) enters Stage N and meets already-depleted solids. This sustains a maximal concentration driving force throughout the entire battery, maximizing recovery while producing the highest extract concentration with minimum solvent.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'equipment' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-1">Bollman Extractor (Bucket Elevator Percolator)</h4>
                <p className="text-slate-400 leading-relaxed">
                  A vertical loop of perforated baskets. Descending side undergoes co-current percolation with half-miscella; ascending side undergoes counter-current percolation with fresh solvent.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-cyan-400 mb-1">Rotocel Extractor (Rotating Carousel)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Horizontal cylindrical carousel divided into wedge-shaped compartments revolving over a stationary drainage plate with multiple counter-current spray manifolds.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-rose-400 mb-1">Soxhlet Extractor (Laboratory Benchmark)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Periodic siphon device continuously boiling and refluxing fresh condensed solvent vapor over a porous cellulose thimble, enabling exhaustive extraction with minimal solvent volume.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'advanced_year3' && (
            <div className="space-y-4 font-mono">
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
                <div className="text-amber-400 font-bold mb-1 font-sans flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  1. Kremser-Brown Analytical Stage Equation for Leaching:
                </div>
                <div className="bg-slate-900 p-2.5 rounded text-amber-200">
                  N_stages = ln[ ((x0 - y_N+1/m)/(x_N - y_N+1/m))(1 - 1/E) + 1/E ] / ln(E)
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Valid for constant underflow retention where distribution coefficient m = y*/x = 1.0 (complete dissolution) and extraction factor E = m·V / L = V / L &gt; 1.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-cyan-400 font-bold mb-1 font-sans">2. Operating Difference Point (Δ) Coordinates:</div>
                <div className="bg-slate-900 p-2.5 rounded text-cyan-200">
                  x_Δ = (L₀·x_A0 - V₁·y_A1) / (L₀ - V₁)   ;   N_Δ = B / (L₀ - V₁)
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  The net flow vector Δ = L_n - V_&#123;n+1&#125; is invariant across all stages. Rays from Δ through underflow point L_n intersect the overflow line at V_&#123;n+1&#125;.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-purple-400 font-bold mb-1 font-sans">3. Mass Transfer Biot Number (Bi_m) & Sherwood Correlation:</div>
                <div className="bg-slate-900 p-2.5 rounded text-purple-200">
                  Bi_m = (k_L · R_p) / D_eff   ;   Sh = 2.0 + 0.6 · Re_p^(1/2) · Sc^(1/3)
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  If Bi_m &gt;&gt; 1, internal porous matrix diffusion dominates (rate-controlling). If Bi_m &lt;&lt; 1, external liquid film resistance dominates.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1 font-sans">4. Wilke-Chang Diffusivity Estimation:</div>
                <div className="bg-slate-900 p-2.5 rounded text-emerald-200">
                  D_AB° = 7.4 × 10^(-8) · (ϕ · M_B)^(1/2) · T / (μ_B · V_A^0.6)
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Accounts for solvent association factor ϕ (2.6 for water, 1.9 for ethanol, 1.0 for unassociated hexane) and solute molar volume V_A.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 text-right">
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
