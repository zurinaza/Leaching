import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { X, Share2, Copy, Check, ExternalLink, QrCode, Smartphone, Laptop } from 'lucide-react';

interface ShareClassModalProps {
  onClose: () => void;
}

export const ShareClassModal: React.FC<ShareClassModalProps> = ({ onClose }) => {
  // Share URL for students
  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-4j2kr3jzlcbymfdkz3widt-779213669165.asia-southeast1.run.app';

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    sound.playClick(850);
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    shareUrl
  )}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
            <Share2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Share LeachMaster with Students
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Universal browser access · No installation required · Works on Laptops & Smartphones
          </p>
        </div>

        {/* QR Code and Direct Scan */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6">
          <div className="bg-white p-2.5 rounded-xl shadow-md shrink-0">
            <img
              src={qrImageUrl}
              alt="Scan QR code for LeachMaster"
              className="w-36 h-36 rounded-lg"
            />
          </div>

          <div className="text-xs text-slate-300 space-y-2 text-left">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <QrCode className="w-4 h-4" />
              <span>Project on Classroom Screen</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Display this QR code on the lecture projector or slide presentation. Students can scan it directly with their phone cameras to enter the game instantly.
            </p>
            <div className="flex items-center gap-3 pt-1 text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-cyan-400" /> Web / Laptop
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> iOS / Android
              </span>
            </div>
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="mb-6">
          <label className="text-[11px] font-mono text-slate-400 block mb-1.5 font-semibold">
            PUBLIC STUDENT ACCESS LINK (FOR PUTRABLAST / WHATSAPP / TELEGRAM):
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono truncate select-all">
              {shareUrl}
            </div>
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-lg shadow-amber-500/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Classroom Instructions for Lecturer */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-left text-xs text-slate-400 space-y-1 mb-4">
          <div className="font-semibold text-slate-300 mb-0.5">Quick Classroom Instructions:</div>
          <div>1. Post this link on <strong>PutraBLAST</strong>, Microsoft Teams, or WhatsApp class group.</div>
          <div>2. Ask students to enter their <strong>Name & Matric Number</strong> on the title screen.</div>
          <div>3. After completing the simulation or quiz, students click <strong>&quot;Copy Summary for Lecturer Zurina&quot;</strong> to submit their score.</div>
        </div>

        {/* Bottom Button */}
        <div className="text-right">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
