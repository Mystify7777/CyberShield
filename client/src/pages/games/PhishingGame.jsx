import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import PhishingQuestionCard from "../../components/games/PhishingQuestionCard";
import { phishingQuestions } from "../../data/phishingQuestions";
import API from "../../services/api";
import { syncUserCoins } from "../../utils/economySync";

export default function PhishingGame() {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [processing, setProcessing] = useState(false);

  const questions = useMemo(() => phishingQuestions, []);
  const current = questions[index];

  const handleAnswer = async (choice) => {
    if (!current || processing || feedback) return;

    const correct = choice === current.answer;
    setAttempts((prev) => prev + 1);
    setFeedback({
      correct,
      explanation: current.explanation
    });

    if (!correct) return;

    setScore((prev) => prev + 1);

    try {
      setProcessing(true);
      await API.post("/game/reward", { correct: true });
      await syncUserCoins();
      toast.success("Great catch! Rewards added.");
    } catch (error) {
      const message = error?.response?.data?.message || "Reward could not be processed right now";
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleNext = () => {
    if (index >= questions.length - 1) {
      setCompleted(true);
      return;
    }

    setFeedback(null);
    setIndex((prev) => prev + 1);
  };

  const handleReplay = () => {
    setIndex(0);
    setFeedback(null);
    setScore(0);
    setAttempts(0);
    setCompleted(false);
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <p className="text-sm text-gray-500 mb-4">
          Practice spotting scams. Choose SAFE or SCAM and learn from instant feedback.
        </p>

        {completed ? (
          <div className="max-w-2xl mx-auto card text-center">
            <h2 className="text-xl font-bold mb-2">Round Complete</h2>
            <p className="text-sm text-slate-600">You finished all {questions.length} questions.</p>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
              <p className="text-sm"><span className="font-semibold">Final Score:</span> {score} / {questions.length}</p>
              <p className="text-sm mt-1"><span className="font-semibold">Accuracy:</span> {accuracy}%</p>
            </div>

            <button type="button" className="btn btn-primary mt-5" onClick={handleReplay}>
              Replay Round
            </button>
          </div>
        ) : (
          <PhishingQuestionCard
            question={current}
            index={index}
            total={questions.length}
            feedback={feedback}
            onAnswer={handleAnswer}
            onNext={handleNext}
            score={score}
          />
        )}
      </div>
    </>
  );
}
