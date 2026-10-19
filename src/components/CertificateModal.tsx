import React, { useState } from 'react';
import { StudentProfile } from '../types/extraction';
import { sound } from '../utils/audio';
import { X, Award, Copy, Check, Printer, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  student: StudentProfile;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  student,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Grade classification
  let grade = 'Pass';
  let title = 'Process Cadet';
  if (student.totalScore >= 700) {
    grade = 'Distinction (A+)';
    title = 'Master Chemical Engineer';
  } else if (student.totalScore >= 450) {
    grade = 'Honors (A)';
    title = 'Mass Transfer Specialist';
  } else if (student.totalScore >= 250) {
    grade = 'Credit (B)';
    title = 'Leaching Plant Operator';
  }

  const handleCopySummary = () => {
    sound.playClick(850);
    const summaryText = `--- LEACHMASTER ASSESSMENT REPORT ---
Student Name: ${student.name || 'Anonymous Student'}
Matric ID: ${student.matricNumber || 'N/A'}
Date: ${new Date().toLocaleDateString()}
Total Score: ${student.totalScore} pts
Grade: ${grade} (${title})
Breakdown:
• Plant Simulator Stars: ${student.simStars}
• Flowsheet & Cascade: ${student.flowsheetScore} pts
• Quick-Fire Quiz: ${student.quizScore} pts
• Stage Solver: ${student.solverScore} pts
Badges Earned: ${student.badges.join(', ') || 'Participant'}
Module: Solid-Liquid Extraction (Leaching)
Faculty of Engineering, Universiti Putra Malaysia`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    sound.playClick(700);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100">
        {/* Subtle decorative gold border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
            <Award className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-bold tracking-widest uppercase block mb-1">
            Certificate of Completion & Mastery
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Solid-Liquid Extraction (Leaching)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Universiti Putra Malaysia · Department of Chemical & Environmental Engineering
          </p>
        </div>

        {/* Student Data Badge */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Awarded To</div>
          <div className="text-lg font-bold text-white mb-1">
            {student.name || 'Student Engineer'}
          </div>
          <div className="text-xs font-mono text-amber-400">
            Matric No: {student.matricNumber || 'Pending Entry'}
          </div>
        </div>

        {/* Performance Tallies */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Total Score</div>
            <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              {student.totalScore} pts
            </div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Grade Standing</div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {grade}
            </div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Plant Stars</div>
            <div className="text-lg font-bold font-mono text-amber-300 tabular-nums">
              {student.simStars} ★
            </div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Title</div>
            <div className="text-xs font-bold text-purple-300 truncate">
              {title}
            </div>
          </div>
        </div>

        {/* Badges Earned */}
        {student.badges.length > 0 && (
          <div className="mb-6">
            <span className="text-[11px] font-mono text-slate-400 block mb-2">BADGES UNLOCKED:</span>
            <div className="flex flex-wrap gap-2">
              {student.badges.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs bg-slate-950 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handleCopySummary}
            className="w-full sm:flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Summary Copied to Clipboard!' : 'Copy Summary for Lecturer Zurina'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
