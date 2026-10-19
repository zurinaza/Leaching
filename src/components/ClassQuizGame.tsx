import React, { useState, useEffect, useMemo } from 'react';
import { QUIZ_QUESTIONS } from '../data/extractionData';
import { StudentProfile, QuizQuestion } from '../types/extraction';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Clock, Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, GraduationCap } from 'lucide-react';

interface ClassQuizGameProps {
  onBackToMenu: () => void;
  student: StudentProfile;
  setStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
}

type QuizFilter = 'all' | 'year3_advanced' | 'standard';

export const ClassQuizGame: React.FC<ClassQuizGameProps> = ({
  onBackToMenu,
  student,
  setStudent,
}) => {
  const [filterMode, setFilterMode] = useState<QuizFilter>('year3_advanced'); // Default to Year 3 for university classes!
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30 seconds per question for rigorous analytical calculations
  const [streak, setStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);

  // Filter questions based on selected cohort level
  const activeQuestions: QuizQuestion[] = useMemo(() => {
    if (filterMode === 'year3_advanced') {
      return QUIZ_QUESTIONS.filter((q) => q.difficulty === 'year3_advanced');
    }
    if (filterMode === 'standard') {
      return QUIZ_QUESTIONS.filter((q) => q.difficulty !== 'year3_advanced');
    }
    return QUIZ_QUESTIONS;
  }, [filterMode]);

  const currentQ: QuizQuestion = activeQuestions[currentIndex] || activeQuestions[0];

  // Timer countdown
  useEffect(() => {
    if (isAnswered || isQuizComplete) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, isQuizComplete]);

  const handleTimeOut = () => {
    sound.playError();
    setIsAnswered(true);
    setSelectedOption(-1); // Timed out
    setStreak(0);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    sound.playClick(800);
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;

    if (isCorrect) {
      sound.playSuccess();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);

      // Higher point values for Year 3 advanced analytical questions (150 base vs 100 base)
      const basePoints = currentQ.difficulty === 'year3_advanced' ? 150 : 100;
      const multiplier = newStreak >= 5 ? 3.0 : newStreak >= 3 ? 2.0 : newStreak >= 2 ? 1.5 : 1.0;
      const points = Math.round((basePoints + timeLeft * 5) * multiplier);
      setQuizScore((prev) => prev + points);

      if (newStreak >= 3) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      }
    } else {
      sound.playError();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    sound.playClick(650);
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      // Quiz finished
      sound.playFanfare();
      setIsQuizComplete(true);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });

      // Update student profile
      setStudent((prev) => {
        const newBadges = [...prev.badges];
        if (filterMode === 'year3_advanced' && correctCount >= 7 && !newBadges.includes('Year 3 Separation Guru')) {
          newBadges.push('Year 3 Separation Guru');
        }
        if (correctCount === activeQuestions.length && !newBadges.includes('Perfect Mass Transfer Score')) {
          newBadges.push('Perfect Mass Transfer Score');
        }

        return {
          ...prev,
          totalScore: prev.totalScore + quizScore,
          quizScore: Math.max(prev.quizScore, quizScore),
          badges: newBadges,
        };
      });
    }
  };

  const handleRestartQuiz = (newFilter?: QuizFilter) => {
    sound.playClick(600);
    if (newFilter) {
      setFilterMode(newFilter);
    }
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(30);
    setStreak(0);
    setCorrectCount(0);
    setQuizScore(0);
    setIsQuizComplete(false);
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
              <span>Classroom Quiz Battle</span>
              <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${filterMode === 'year3_advanced' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'}`}>
                {filterMode === 'year3_advanced' ? 'Year 3 Exam Rigor' : 'Mode 03'}
              </span>
            </h1>
          </div>
        </div>

        {/* Filter mode segmented control */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleRestartQuiz('year3_advanced')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'year3_advanced'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Year 3 Advanced (10 Qs)
          </button>
          <button
            onClick={() => handleRestartQuiz('standard')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterMode === 'standard'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fundamentals (15 Qs)
          </button>
          <button
            onClick={() => handleRestartQuiz('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All 25 Qs
          </button>
        </div>

        {/* Live Score & Combo HUD */}
        <div className="flex items-center gap-4">
          {streak >= 2 && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-lg animate-bounce">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>{streak}x Streak!</span>
            </div>
          )}

          <div className="text-xs font-mono text-slate-200 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
            Score: <strong className="text-emerald-400 tabular-nums">{quizScore} pts</strong>
          </div>
        </div>
      </header>

      {/* Main Quiz Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
        {!isQuizComplete ? (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            {/* Top Timer Bar */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 ${timeLeft <= 7 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                <span>Timer: <strong className={timeLeft <= 7 ? 'text-rose-400 font-bold' : 'text-white'}>{timeLeft}s</strong></span>
              </div>
              <div className="flex items-center gap-2">
                {currentQ.difficulty === 'year3_advanced' && (
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                    Year 3 Advanced
                  </span>
                )}
                <span className="text-emerald-400 font-semibold">{currentQ.topic}</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-6 border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 7 ? 'bg-rose-500' : timeLeft <= 15 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>

            {/* Question Counter Indicator */}
            <div className="text-xs font-mono text-slate-400 mb-2">
              Question {currentIndex + 1} of {activeQuestions.length}
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-bold text-white mb-6 leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {currentQ.options.map((option, idx) => {
                const isChosen = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let stateClasses = 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-200';

                if (isAnswered) {
                  if (isCorrect) {
                    stateClasses = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-500/10';
                  } else if (isChosen) {
                    stateClasses = 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-md shadow-rose-500/10';
                  } else {
                    stateClasses = 'bg-slate-950/50 border-slate-900 text-slate-600 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${stateClasses}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs shrink-0 font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-snug">{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {isAnswered && isChosen && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Post-Answer Explanation Box */}
            {isAnswered && (
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 mb-4 text-xs animate-in fade-in duration-200">
                <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chemical Engineering Solution & Proof:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                {currentQ.formulaNote && (
                  <div className="mt-2 text-amber-300 font-mono bg-slate-900 px-2.5 py-1 rounded border border-slate-800 inline-block">
                    Formula: {currentQ.formulaNote}
                  </div>
                )}
              </div>
            )}

            {/* Next Question Button */}
            {isAnswered && (
              <div className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <span>{currentIndex + 1 === activeQuestions.length ? 'View Final Results' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Quiz Complete Victory Modal */
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              {filterMode === 'year3_advanced' ? 'Year 3 Advanced Exam Finished!' : 'Quiz Battle Completed!'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              {filterMode === 'year3_advanced'
                ? 'You tackled rigorous 3rd-year mass transfer, Kremser analytical equations, and Ponchon-Savarit tie-line derivations.'
                : 'You tested your mastery over Solid-Liquid Extraction mass transfer and industrial cascades.'}
            </p>

            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
              <div>
                <div className="text-[11px] text-slate-400">Score Earned</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  {quizScore} pts
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Accuracy</div>
                <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {correctCount} / {activeQuestions.length}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handleRestartQuiz()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Exam
              </button>

              <button
                onClick={() => { sound.playClick(); onBackToMenu(); }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Return to Menu</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-500 text-center">
        Solid-Liquid Extraction (Leaching) Advanced University Exam · Universiti Putra Malaysia
      </footer>
    </div>
  );
};
