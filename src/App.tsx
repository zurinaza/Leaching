/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameMode, StudentProfile, LeaderboardRecord } from './types/extraction';
import { TitleScreen } from './components/TitleScreen';
import { PlantSimulatorGame } from './components/PlantSimulatorGame';
import { FlowsheetBuilderGame } from './components/FlowsheetBuilderGame';
import { ClassQuizGame } from './components/ClassQuizGame';
import { StageSolverGame } from './components/StageSolverGame';
import { CertificateModal } from './components/CertificateModal';
import { ConceptReferenceModal } from './components/ConceptReferenceModal';
import { ClassroomLeaderboardModal } from './components/ClassroomLeaderboardModal';
import { ShareClassModal } from './components/ShareClassModal';
import { sound } from './utils/audio';

const LEADERBOARD_KEY = 'leachmaster_classroom_leaderboard';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('TITLE');
  const [showReference, setShowReference] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  // Student Profile State with LocalStorage persistence
  const [student, setStudent] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('leachmaster_student_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {
      name: '',
      matricNumber: '',
      groupName: '',
      totalScore: 0,
      simStars: 0,
      flowsheetScore: 0,
      quizScore: 0,
      solverScore: 0,
      badges: ['Extraction Cadet'],
    };
  });

  // Save profile updates to student profile & sync to leaderboard
  useEffect(() => {
    try {
      localStorage.setItem('leachmaster_student_profile', JSON.stringify(student));

      // Sync active student into leaderboard table in localStorage
      const rawLb = localStorage.getItem(LEADERBOARD_KEY);
      let list: LeaderboardRecord[] = rawLb ? JSON.parse(rawLb) : [];

      const currentName = student.name.trim() || 'You';
      const currentMatric = student.matricNumber.trim() || 'Active Session';

      const matchIdx = list.findIndex(
        (r) =>
          (student.matricNumber && r.matricNumber.toLowerCase() === currentMatric.toLowerCase()) ||
          (student.name && r.name.toLowerCase() === currentName.toLowerCase()) ||
          r.id === 'current-user-record'
      );

      const record: LeaderboardRecord = {
        id: matchIdx >= 0 ? list[matchIdx].id : 'current-user-record',
        name: student.name.trim() || 'You (Active Session)',
        matricNumber: student.matricNumber.trim() || 'In Progress',
        groupName: student.groupName.trim() || 'Classroom',
        totalScore: student.totalScore,
        simStars: student.simStars,
        flowsheetScore: student.flowsheetScore,
        quizScore: student.quizScore,
        solverScore: student.solverScore,
        badges: student.badges,
        updatedAt: new Date().toISOString(),
      };

      if (matchIdx >= 0) {
        list[matchIdx] = record;
      } else {
        list.push(record);
      }

      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
    } catch {
      // Ignore
    }
  }, [student]);

  // Global ESC key to return to menu or close modals
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showShare) {
          setShowShare(false);
          sound.playClick(400);
        } else if (showLeaderboard) {
          setShowLeaderboard(false);
          sound.playClick(400);
        } else if (showReference) {
          setShowReference(false);
          sound.playClick(400);
        } else if (showCertificate) {
          setShowCertificate(false);
          sound.playClick(400);
        } else if (gameMode !== 'TITLE') {
          setGameMode('TITLE');
          sound.playClick(500);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameMode, showReference, showCertificate, showLeaderboard, showShare]);

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Active Screen */}
      {gameMode === 'TITLE' && (
        <TitleScreen
          onStartGame={(mode) => setGameMode(mode)}
          onOpenReference={() => setShowReference(true)}
          onOpenCertificate={() => setShowCertificate(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenShare={() => setShowShare(true)}
          student={student}
          setStudent={setStudent}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {gameMode === 'PLANT_SIM' && (
        <PlantSimulatorGame
          onBackToMenu={() => setGameMode('TITLE')}
          student={student}
          setStudent={setStudent}
        />
      )}

      {gameMode === 'FLOWSHEET_BUILDER' && (
        <FlowsheetBuilderGame
          onBackToMenu={() => setGameMode('TITLE')}
          student={student}
          setStudent={setStudent}
        />
      )}

      {gameMode === 'CLASS_QUIZ' && (
        <ClassQuizGame
          onBackToMenu={() => setGameMode('TITLE')}
          student={student}
          setStudent={setStudent}
        />
      )}

      {gameMode === 'STAGE_SOLVER' && (
        <StageSolverGame
          onBackToMenu={() => setGameMode('TITLE')}
          student={student}
          setStudent={setStudent}
        />
      )}

      {/* Modals */}
      {showShare && (
        <ShareClassModal onClose={() => setShowShare(false)} />
      )}

      {showLeaderboard && (
        <ClassroomLeaderboardModal
          currentStudent={student}
          onClose={() => setShowLeaderboard(false)}
          onSwitchStudent={(newStudent) => setStudent(newStudent)}
        />
      )}

      {showReference && (
        <ConceptReferenceModal onClose={() => setShowReference(false)} />
      )}

      {showCertificate && (
        <CertificateModal
          student={student}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}
