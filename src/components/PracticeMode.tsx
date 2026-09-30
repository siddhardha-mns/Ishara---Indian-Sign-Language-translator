import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, Sparkles, Trophy, Brain, Target, RefreshCw } from 'lucide-react';
import { ISL_GESTURES } from '../data/islDictionary';
import { ISLGestureDefinition, RecognitionResult } from '../types/isl';
import { speechService } from '../services/speechService';
import { SignVisualCard } from './SignVisualCard';

interface PracticeModeProps {
  currentDetection: RecognitionResult | null;
  onSelectPracticeSign: (gestureId: string) => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  currentDetection,
  onSelectPracticeSign,
}) => {
  const [subMode, setSubMode] = useState<'practice' | 'quiz'>('practice');

  // Practice state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practiceScore, setPracticeScore] = useState(0);
  const [completedSignIds, setCompletedSignIds] = useState<Set<string>>(new Set());
  const [matchHoldTime, setMatchHoldTime] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizOptions, setQuizOptions] = useState<ISLGestureDefinition[]>([]);

  const targetSign: ISLGestureDefinition = ISL_GESTURES[currentIndex];
  const quizSign: ISLGestureDefinition = ISL_GESTURES[quizIndex];

  // Sync simulation sign when practice target changes
  useEffect(() => {
    if (targetSign) {
      onSelectPracticeSign(targetSign.id);
    }
  }, [targetSign, onSelectPracticeSign]);

  // Generate 4 randomized options for the Quiz mode
  useEffect(() => {
    if (!quizSign) return;
    const others = ISL_GESTURES.filter((g) => g.id !== quizSign.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [quizSign, ...shuffledOthers].sort(() => 0.5 - Math.random());
    setQuizOptions(combined);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
  }, [quizIndex, quizSign]);

  // Practice: check live camera match
  useEffect(() => {
    if (subMode !== 'practice' || !targetSign || isSuccess) return;

    if (currentDetection && currentDetection.gestureId === targetSign.id) {
      const timer = setInterval(() => {
        setMatchHoldTime((prev) => {
          const next = prev + 100;
          if (next >= 1000) {
            clearInterval(timer);
            handlePracticeSuccess();
            return 1000;
          }
          return next;
        });
      }, 100);

      return () => clearInterval(timer);
    } else {
      setMatchHoldTime(0);
    }
  }, [currentDetection, targetSign, isSuccess, subMode]);

  const handlePracticeSuccess = () => {
    setIsSuccess(true);
    speechService.playCommitSound();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF4B4B', '#10b981', '#f59e0b', '#38bdf8'],
      });
    } catch {
      // ignore
    }

    setCompletedSignIds((prev) => new Set(prev).add(targetSign.id));
    setPracticeScore((prev) => prev + 10);
  };

  const nextSign = () => {
    setIsSuccess(false);
    setMatchHoldTime(0);
    setCurrentIndex((prev) => (prev + 1) % ISL_GESTURES.length);
  };

  const prevSign = () => {
    setIsSuccess(false);
    setMatchHoldTime(0);
    setCurrentIndex((prev) => (prev - 1 + ISL_GESTURES.length) % ISL_GESTURES.length);
  };

  // Quiz submission
  const handleSelectQuizAnswer = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(optionId);
    setIsAnswerSubmitted(true);

    const isCorrect = optionId === quizSign.id;
    if (isCorrect) {
      setQuizScore((prev) => prev + 10);
      speechService.playCommitSound();
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#FF4B4B', '#10b981', '#ffffff'],
        });
      } catch {
        // ignore
      }
    }
  };

  const nextQuizQuestion = () => {
    setQuizIndex((prev) => (prev + 1) % ISL_GESTURES.length);
  };

  const progressPercent = Math.min(100, Math.round((matchHoldTime / 1000) * 100));

  return (
    <div className="w-full space-y-4">
      {/* Top Segmented Sub-mode selector (Practice vs Quiz) */}
      <div className="flex items-center justify-between bg-[#262730] p-1.5 rounded-xl border border-[#31333f]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSubMode('practice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              subMode === 'practice'
                ? 'bg-[#FF4B4B] text-white shadow-sm'
                : 'text-[#808495] hover:text-[#fafafa]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Camera Practice</span>
          </button>

          <button
            onClick={() => setSubMode('quiz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              subMode === 'quiz'
                ? 'bg-[#FF4B4B] text-white shadow-sm'
                : 'text-[#808495] hover:text-[#fafafa]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Sign Quiz</span>
          </button>
        </div>

        {/* Score pill */}
        <div className="flex items-center gap-2 pr-2 text-xs">
          <Trophy className="w-4 h-4 text-[#FF4B4B]" />
          <span className="font-mono font-bold text-[#fafafa]">
            {subMode === 'practice' ? practiceScore : quizScore} pts
          </span>
        </div>
      </div>

      {/* MODE 1: Camera Practice with Visual Image Card */}
      {subMode === 'practice' && (
        <div className="bg-[#262730] border border-[#31333f] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-[#808495] uppercase">
                Sign {currentIndex + 1} of {ISL_GESTURES.length}
              </span>
              <h3 className="text-xl font-bold text-[#fafafa] flex items-center gap-2 mt-0.5">
                <span>{targetSign.name}</span>
                <span className="text-sm font-semibold text-[#FF4B4B] font-hindi">
                  {targetSign.hindiName}
                </span>
              </h3>
            </div>

            <div className="text-right">
              <span className="text-xs px-2 py-0.5 rounded bg-[#0e1117] border border-[#31333f] text-[#808495]">
                {targetSign.handsRequired === 'two' ? '2 Hands' : '1 Hand'}
              </span>
            </div>
          </div>

          {/* VISUAL IMAGE FOR EVERY SIGN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Visual Guide Card with Image or Anatomical SVG */}
            <div className="w-full">
              <SignVisualCard sign={targetSign} showDetails={false} />
            </div>

            {/* Instruction Checklist */}
            <div className="space-y-3 bg-[#0e1117] p-4 rounded-xl border border-[#31333f]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF4B4B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>How to Form This Sign</span>
              </div>
              <ul className="text-xs text-[#fafafa] space-y-1.5 pl-4 list-disc marker:text-[#FF4B4B]">
                {targetSign.tips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
              {targetSign.culturalNote && (
                <p className="text-[11px] text-[#808495] pt-2 border-t border-[#31333f] leading-relaxed">
                  💡 {targetSign.culturalNote}
                </p>
              )}
            </div>
          </div>

          {/* Live Camera Match Detector Progress */}
          <div className="pt-2 border-t border-[#31333f] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#808495]">Camera Verification:</span>
              <span className="font-semibold text-[#fafafa]">
                {isSuccess ? (
                  <span className="text-[#09ab3b] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified! Perfect Gesture
                  </span>
                ) : currentDetection?.gestureId === targetSign.id ? (
                  <span className="text-[#f59e0b]">Holding gesture... ({progressPercent}%)</span>
                ) : (
                  <span className="text-[#808495]">Show this sign in camera view</span>
                )}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-[#0e1117] rounded-full overflow-hidden border border-[#31333f]">
              <div
                className={`h-full transition-all duration-100 ease-out ${
                  isSuccess
                    ? 'bg-[#09ab3b]'
                    : progressPercent > 0
                    ? 'bg-[#f59e0b]'
                    : 'bg-transparent'
                }`}
                style={{ width: `${isSuccess ? 100 : progressPercent}%` }}
              />
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={prevSign}
              className="h-10 px-4 rounded-md bg-[#0e1117] hover:bg-[#31333f] text-[#fafafa] text-xs font-medium flex items-center gap-1 transition-colors border border-[#31333f]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={nextSign}
              className={`flex-1 h-10 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                isSuccess
                  ? 'bg-[#09ab3b] hover:bg-[#078a30] text-white'
                  : 'bg-[#FF4B4B] hover:bg-[#ff3333] text-white'
              }`}
            >
              <span>{isSuccess ? 'Next Sign 🎉' : 'Skip / Next Sign'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: Sign Quiz with Visual Recognition */}
      {subMode === 'quiz' && (
        <div className="bg-[#262730] border border-[#31333f] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#808495] uppercase">
              Question {quizIndex + 1} of {ISL_GESTURES.length}
            </span>
            <span className="text-xs text-[#808495]">
              Identify the sign from the image
            </span>
          </div>

          {/* Quiz Question: Image of the Sign */}
          <div className="max-w-md mx-auto">
            <SignVisualCard sign={quizSign} showDetails={false} />
          </div>

          <p className="text-center text-sm font-semibold text-[#fafafa] pt-1">
            What sign is shown in the image above?
          </p>

          {/* 4 Multiple Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quizOptions.map((opt) => {
              const isSelected = selectedAnswer === opt.id;
              const isCorrectAnswer = opt.id === quizSign.id;

              let btnStyle = 'bg-[#0e1117] border-[#31333f] hover:border-[#808495] text-[#fafafa]';
              if (isAnswerSubmitted) {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-[#09ab3b]/20 border-[#09ab3b] text-[#09ab3b] font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444] font-bold';
                } else {
                  btnStyle = 'bg-[#0e1117]/60 border-[#31333f] text-[#808495] opacity-50';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectQuizAnswer(opt.id)}
                  disabled={isAnswerSubmitted}
                  className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${btnStyle}`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate">{opt.name}</span>
                    <span className="text-[11px] font-hindi text-[#808495]">{opt.hindiName}</span>
                  </div>
                  {isAnswerSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-[#09ab3b] shrink-0 ml-2" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-4 h-4 text-[#ef4444] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Post-answer feedback & Next Question Button */}
          {isAnswerSubmitted && (
            <div className="pt-2 border-t border-[#31333f] flex items-center justify-between gap-3">
              <div className="text-xs">
                {selectedAnswer === quizSign.id ? (
                  <span className="text-[#09ab3b] font-semibold">
                    ✓ Correct! +10 Points
                  </span>
                ) : (
                  <span className="text-[#ef4444] font-semibold">
                    ✗ Incorrect. The answer is {quizSign.name}.
                  </span>
                )}
              </div>

              <button
                onClick={nextQuizQuestion}
                className="h-10 px-5 rounded-md bg-[#FF4B4B] hover:bg-[#ff3333] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
