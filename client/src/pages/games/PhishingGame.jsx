import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import PhishingQuestionCard from "../../components/games/PhishingQuestionCard";
import API from "../../services/api";
import { syncUserCoins } from "../../utils/economySync";

export default function PhishingGame() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Fetch questions from server on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await API.get("/game/questions");
        setQuestions(response.data.questions || []);
        setError(null);
      } catch (err) {
        setError("Failed to load questions. Please try again.");
        toast.error("Could not load phishing questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const current = questions[index];

  const handleAnswer = async (choice) => {
    if (!current || processing || feedback) return;

    // Client-side check: compare user's choice to the submitted answer
    // But the actual validation happens server-side!
    setAttempts((prev) => prev + 1);
    setFeedback({
      correct: false, // Will be updated after server validation
      explanation: current.explanation
    });

    try {
      setProcessing(true);
      // Send questionId and the user's choice (answerId) to server
      // Server validates against authoritative answers
      const response = await API.post("/game/reward", {
        questionId: current.id,
        answerId: choice
      });

      // Check if server validated the answer as correct
      if (response.data.rewarded) {
        setScore((prev) => prev + 1);
        setFeedback({
          correct: true,
          explanation: current.explanation
        });
        await syncUserCoins();
        toast.success("Great catch! Rewards added.");
      } else {
        // Answer was incorrect (server-validated)
        setFeedback({
          correct: false,
          explanation: current.explanation
        });
      }
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="text-center text-gray-500">Loading questions...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </>
    );
  }

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
