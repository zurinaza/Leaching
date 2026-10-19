import React, { useState, useEffect, useMemo } from 'react';
import { LeaderboardRecord, StudentProfile } from '../types/extraction';
import { sound } from '../utils/audio';
import {
  X,
  Trophy,
  Medal,
  Star,
  Zap,
  Layers,
  Search,
  Download,
  Copy,
  Check,
  RotateCcw,
  UserPlus,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface ClassroomLeaderboardModalProps {
  currentStudent: StudentProfile;
  onClose: () => void;
  onSwitchStudent?: (student: StudentProfile) => void;
}

const STORAGE_KEY = 'leachmaster_classroom_leaderboard';

// Default classroom peer seeds to ensure an active, competitive atmosphere on first launch
const INITIAL_CLASSROOM_SEEDS: LeaderboardRecord[] = [
  {
    id: 'seed-1',
    name: 'Tan Wei Ling',
    matricNumber: '210455',
    groupName: 'Group Alpha',
    totalScore: 920,
    simStars: 10,
    flowsheetScore: 200,
    quizScore: 270,
    solverScore: 250,
    badges: ['Plant Master', 'Cascade Architect', 'Extraction Quiz Champion', 'Equilibrium Stage Master'],
    updatedAt: '2026-10-19T08:15:00Z',
  },
  {
    id: 'seed-2',
    name: 'Ahmad Farhan',
    matricNumber: '209812',
    groupName: 'Process Team 3',
    totalScore: 840,
    simStars: 8,
    flowsheetScore: 200,
    quizScore: 240,
    solverScore: 250,
    badges: ['Plant Master', 'Cascade Architect', 'Equilibrium Stage Master'],
    updatedAt: '2026-10-19T08:22:00Z',
  },
  {
    id: 'seed-3',
    name: 'Siti Nurhaliza binti Roslan',
    matricNumber: '208761',
    groupName: 'Group Alpha',
    totalScore: 780,
    simStars: 7,
    flowsheetScore: 200,
    quizScore: 230,
    solverScore: 200,
    badges: ['Cascade Architect', 'Equipment Specialist'],
    updatedAt: '2026-10-19T08:30:00Z',
  },
  {
    id: 'seed-4',
    name: 'Muhammad Danial',
    matricNumber: '211029',
    groupName: 'Team Soxhlet',
    totalScore: 690,
    simStars: 6,
    flowsheetScore: 200,
    quizScore: 190,
    solverScore: 150,
    badges: ['Cascade Architect'],
    updatedAt: '2026-10-19T08:45:00Z',
  },
  {
    id: 'seed-5',
    name: 'Pravin Kumar',
    matricNumber: '209934',
    groupName: 'Process Team 3',
    totalScore: 610,
    simStars: 5,
    flowsheetScore: 200,
    quizScore: 160,
    solverScore: 100,
    badges: ['Equipment Specialist'],
    updatedAt: '2026-10-19T08:50:00Z',
  },
  {
    id: 'seed-6',
    name: 'Nurul Izzah',
    matricNumber: '210118',
    groupName: 'Team Rotocel',
    totalScore: 540,
    simStars: 4,
    flowsheetScore: 200,
    quizScore: 140,
    solverScore: 100,
    badges: ['Extraction Cadet'],
    updatedAt: '2026-10-19T09:02:00Z',
  },
];

type SortCategory = 'totalScore' | 'simStars' | 'quizScore' | 'solverScore';

export const ClassroomLeaderboardModal: React.FC<ClassroomLeaderboardModalProps> = ({
  currentStudent,
  onClose,
  onSwitchStudent,
}) => {
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [activeCategory, setActiveCategory] = useState<SortCategory>('totalScore');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New Student Manual Entry Form
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentMatric, setNewStudentMatric] = useState<string>('');
  const [newStudentGroup, setNewStudentGroup] = useState<string>('');

  // Load and sync records from localStorage
  useEffect(() => {
    let storedList: LeaderboardRecord[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        storedList = JSON.parse(raw);
      }
    } catch {
      // Ignore
    }

    if (!storedList || storedList.length === 0) {
      storedList = [...INITIAL_CLASSROOM_SEEDS];
    }

    // Merge or update the current active student in the leaderboard
    const currentName = currentStudent.name.trim() || 'You';
    const currentMatric = currentStudent.matricNumber.trim() || 'Active Session';

    const existingIdx = storedList.findIndex(
      (r) =>
        (r.matricNumber && r.matricNumber.toLowerCase() === currentMatric.toLowerCase()) ||
        (r.name && r.name.toLowerCase() === currentName.toLowerCase() && currentName !== 'You')
    );

    const currentRecord: LeaderboardRecord = {
      id: existingIdx >= 0 ? storedList[existingIdx].id : 'current-user-record',
      name: currentStudent.name.trim() || 'You (Active Session)',
      matricNumber: currentStudent.matricNumber.trim() || 'In Progress',
      groupName: currentStudent.groupName.trim() || 'Classroom',
      totalScore: currentStudent.totalScore,
      simStars: currentStudent.simStars,
      flowsheetScore: currentStudent.flowsheetScore,
      quizScore: currentStudent.quizScore,
      solverScore: currentStudent.solverScore,
      badges: currentStudent.badges,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      storedList[existingIdx] = currentRecord;
    } else {
      storedList.push(currentRecord);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedList));
    } catch {
      // Ignore
    }

    setRecords(storedList);
  }, [currentStudent]);

  // Sort and filter records
  const sortedRecords = useMemo(() => {
    return [...records]
      .filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.matricNumber.toLowerCase().includes(q) ||
          (r.groupName && r.groupName.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        return b[activeCategory] - a[activeCategory];
      });
  }, [records, activeCategory, searchQuery]);

  // Find active student rank
  const activeStudentRank = useMemo(() => {
    const idx = sortedRecords.findIndex(
      (r) =>
        r.id === 'current-user-record' ||
        (currentStudent.matricNumber &&
          r.matricNumber.toLowerCase() === currentStudent.matricNumber.toLowerCase()) ||
        (currentStudent.name && r.name.toLowerCase() === currentStudent.name.toLowerCase())
    );
    return idx >= 0 ? idx + 1 : null;
  }, [sortedRecords, currentStudent]);

  // Copy Leaderboard Summary for Lecturer
  const handleCopySummary = () => {
    sound.playClick(850);
    const top5 = sortedRecords.slice(0, 10);
    const lines = top5.map((s, idx) => {
      return `${idx + 1}. ${s.name} (${s.matricNumber || 'N/A'}) - ${s.totalScore} pts [Stars: ${s.simStars} ★, Quiz: ${s.quizScore} pts, Solver: ${s.solverScore} pts]`;
    });

    const summaryText = `--- GLOBAL CLASSROOM LEADERBOARD ---
Course: Solid-Liquid Extraction (Leaching)
Instructor: Lecturer Zurina
Date: ${new Date().toLocaleDateString()}
Total Registered Participants: ${records.length}

TOP STANDINGS:
${lines.join('\n')}

Generated via LeachMaster Chemical Engineering Platform`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Export as CSV for Lecturer Zurina
  const handleExportCSV = () => {
    sound.playClick(750);
    const headers = 'Rank,Name,Matric ID,Group,Total Score,Simulator Stars,Flowsheet Score,Quiz Score,Solver Score,Badges,Last Updated\n';
    const rows = sortedRecords
      .map((r, idx) => {
        return `"${idx + 1}","${r.name.replace(/"/g, '""')}","${r.matricNumber}","${r.groupName}","${r.totalScore}","${r.simStars}","${r.flowsheetScore}","${r.quizScore}","${r.solverScore}","${r.badges.join('; ')}","${r.updatedAt}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LeachMaster_Leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset to initial class seeds
  const handleResetLeaderboard = () => {
    if (window.confirm('Reset the classroom leaderboard to initial class roster? Your current progress will remain saved for this session.')) {
      sound.playClick(500);
      localStorage.removeItem(STORAGE_KEY);
      setRecords([...INITIAL_CLASSROOM_SEEDS]);
    }
  };

  // Add new student profile
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    sound.playSuccess();
    const newRecord: LeaderboardRecord = {
      id: `student-${Date.now()}`,
      name: newStudentName.trim(),
      matricNumber: newStudentMatric.trim() || 'N/A',
      groupName: newStudentGroup.trim() || 'Group 1',
      totalScore: 0,
      simStars: 0,
      flowsheetScore: 0,
      quizScore: 0,
      solverScore: 0,
      badges: ['Extraction Cadet'],
      updatedAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }

    if (onSwitchStudent) {
      onSwitchStudent({
        name: newRecord.name,
        matricNumber: newRecord.matricNumber,
        groupName: newRecord.groupName,
        totalScore: 0,
        simStars: 0,
        flowsheetScore: 0,
        quizScore: 0,
        solverScore: 0,
        badges: ['Extraction Cadet'],
      });
    }

    setNewStudentName('');
    setNewStudentMatric('');
    setNewStudentGroup('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Global Classroom Leaderboard
                </h2>
                <span className="text-[11px] font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  Live Rankings
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated student profiles & performance metrics across solid-liquid extraction modules
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Student Standing Banner */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Active Student:</span>
            <span className="font-bold text-white">{currentStudent.name || 'Anonymous Student'}</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-400">
              Matric: {currentStudent.matricNumber || 'Unregistered'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-amber-400 font-bold tabular-nums">
              {currentStudent.totalScore} pts
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Your Current Rank:</span>
            <span className="font-mono font-bold text-base text-amber-300 tabular-nums">
              {activeStudentRank ? `#${activeStudentRank}` : 'Unranked'}
            </span>
            <span className="text-slate-500 text-[11px]">of {sortedRecords.length}</span>
          </div>
        </div>

        {/* Category Filter & Controls Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs (Functional buttons as per frontend design constitution) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('totalScore');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeCategory === 'totalScore'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overall Score
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('simStars');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeCategory === 'simStars'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Plant Stars
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('quizScore');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeCategory === 'quizScore'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Quiz Mastery
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('solverScore');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeCategory === 'solverScore'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stage Solver
            </button>
          </div>

          {/* Search Input & Add New Student Button */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student / ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setShowAddForm(!showAddForm);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'Register Student'}</span>
            </button>
          </div>
        </div>

        {/* Manual Student Registration Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleAddStudent}
            className="px-6 py-3 bg-slate-950/80 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in slide-in-from-top-2 duration-200"
          >
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Student / Team Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Hakim Rahman"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Matric ID</label>
              <input
                type="text"
                placeholder="e.g. 210988"
                value={newStudentMatric}
                onChange={(e) => setNewStudentMatric(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Lab Group / Section</label>
              <input
                type="text"
                placeholder="e.g. Group B"
                value={newStudentGroup}
                onChange={(e) => setNewStudentGroup(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Save & Switch Student
              </button>
            </div>
          </form>
        )}

        {/* Scrollable Leaderboard Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 w-16 text-center">Rank</th>
                <th className="py-2.5 px-3">Student & Matric</th>
                <th className="py-2.5 px-3 text-center">Stars ★</th>
                <th className="py-2.5 px-3 text-right">Quiz</th>
                <th className="py-2.5 px-3 text-right">Solver</th>
                <th className="py-2.5 px-3 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {sortedRecords.length > 0 ? (
                sortedRecords.map((record, index) => {
                  const rank = index + 1;
                  const isCurrent =
                    record.id === 'current-user-record' ||
                    (currentStudent.matricNumber &&
                      record.matricNumber.toLowerCase() ===
                        currentStudent.matricNumber.toLowerCase());

                  return (
                    <tr
                      key={record.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-amber-500/10 hover:bg-amber-500/15 font-medium'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums">
                        {rank === 1 ? (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40">
                            1
                          </div>
                        ) : rank === 2 ? (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-400/20 text-slate-300 font-bold border border-slate-400/40">
                            2
                          </div>
                        ) : rank === 3 ? (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-700/20 text-amber-500 font-bold border border-amber-700/40">
                            3
                          </div>
                        ) : (
                          <span className="text-slate-400">#{rank}</span>
                        )}
                      </td>

                      {/* Name & Matric */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                            {record.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase px-1.5 py-0.2 rounded bg-amber-400/20 border border-amber-400/30">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>{record.matricNumber || 'Unassigned'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{record.groupName || 'UPM CheE'}</span>
                        </div>
                      </td>

                      {/* Simulator Stars */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-amber-400 font-semibold">
                        {record.simStars} ★
                      </td>

                      {/* Quiz Score */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                        {record.quizScore} pts
                      </td>

                      {/* Solver Score */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                        {record.solverScore} pts
                      </td>

                      {/* Total Score */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-sm text-emerald-400">
                        {record.totalScore}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No student records match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer Toolbar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Stored in LocalStorage</span>
            <span aria-hidden="true">·</span>
            <span>{records.length} Student Profiles Active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetLeaderboard}
              title="Reset classroom leaderboard"
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Leaderboard Copied!' : 'Copy Summary for Lecturer Zurina'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
