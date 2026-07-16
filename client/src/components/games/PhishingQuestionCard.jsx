export default function PhishingQuestionCard({
  question,
  index,
  total,
  feedback,
  onAnswer,
  onNext,
  score,
  disabled
}) {
  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold">Phishing Detector</h2>
        <p className="text-sm text-gray-500">Question {index + 1} / {total}</p>
      </div>

      <p className="text-sm text-slate-500 mb-2">Score: {score}</p>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mb-5">
        <p className="text-slate-800">{question.prompt}</p>
      </div>

      {!feedback && (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 font-medium shadow-xs transition-all duration-200 hover:border-primary-500 hover:bg-primary-50 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => onAnswer(option.id)}
              disabled={disabled}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {feedback && (
        <div className="mt-5 text-center">
          <p className={feedback.correct ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
            {feedback.correct ? "Correct" : "Wrong"}
          </p>

          {feedback.explanation && (
            <p className="text-sm mt-2 text-slate-600">{feedback.explanation}</p>
          )}

          {feedback.correct && (
            <p className="text-emerald-600 text-xs mt-2">+XP and +Coins rewarded</p>
          )}

          <button type="button" className="btn btn-primary mt-4" onClick={onNext}>
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}