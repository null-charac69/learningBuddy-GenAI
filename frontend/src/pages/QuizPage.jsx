
import React, { useState } from 'react';
import { getQuiz, submitQuizScore } from '../services/api';

const QuizPage = () => {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFetchQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    try {
      const { data } = await getQuiz(topic);
      // Support both array of questions and raw string
      if (Array.isArray(data.quiz)) {
        setQuiz(data.quiz);
      } else {
        setQuiz(data.quiz);
      }
    } catch (err) {
      console.error('Failed to fetch quiz', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qIndex, choice) => {
    if (!submitted) setAnswers({ ...answers, [qIndex]: choice });
  };

  const handleSubmit = async () => {
    if (!Array.isArray(quiz)) return;
    // Calculate score
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    const pct = Math.round((correct / quiz.length) * 100);
    setScore(pct);
    setSubmitted(true);

    // Persist to backend
    setSaving(true);
    try {
      await submitQuizScore(topic, pct);
    } catch (e) {
      console.error('Failed to save quiz score', e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTopic('');
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  return (
    <div className="text-text">
      <h1 className="text-3xl font-bold mb-6">Quiz</h1>
      <div className="bg-secondary p-8 rounded-lg shadow-lg">

        {/* Topic input */}
        {!quiz && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchQuiz()}
              placeholder="Enter a topic (e.g. Python, Machine Learning)"
              className="w-full bg-accent text-text rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-highlight"
            />
            <button
              onClick={handleFetchQuiz}
              disabled={loading}
              className="bg-highlight text-white py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Loading...' : 'Get Quiz'}
            </button>
          </div>
        )}

        {/* Structured quiz (array) */}
        {Array.isArray(quiz) && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4 text-highlight">Topic: {topic}</h2>
            {quiz.map((q, i) => (
              <div key={i} className="mb-6 bg-accent p-5 rounded-lg">
                <p className="font-medium mb-3">
                  {i + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options?.map((opt, j) => {
                    let btnClass =
                      'w-full text-left py-2 px-4 rounded-lg border transition-colors ';
                    if (!submitted) {
                      btnClass +=
                        answers[i] === opt
                          ? 'border-highlight bg-highlight/20 text-text'
                          : 'border-gray-600 hover:border-highlight text-gray-300';
                    } else {
                      if (opt === q.answer) {
                        btnClass += 'border-green-500 bg-green-900/30 text-green-300';
                      } else if (answers[i] === opt) {
                        btnClass += 'border-red-500 bg-red-900/30 text-red-300';
                      } else {
                        btnClass += 'border-gray-700 text-gray-500';
                      }
                    }
                    return (
                      <button
                        key={j}
                        onClick={() => handleAnswer(i, opt)}
                        className={btnClass}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="mt-2 text-sm text-gray-400">
                    ✅ Correct answer: <span className="text-green-400">{q.answer}</span>
                  </p>
                )}
              </div>
            ))}

            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < quiz.length}
                className="mt-2 bg-highlight text-white py-3 px-8 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-40"
              >
                Submit Quiz
              </button>
            ) : (
              <div className="mt-4 p-5 bg-accent rounded-lg text-center">
                <p className="text-2xl font-bold text-highlight">{score}%</p>
                <p className="text-gray-300 mt-1">
                  {score >= 80
                    ? '🎉 Excellent work!'
                    : score >= 50
                    ? '👍 Good effort!'
                    : '📚 Keep studying!'}
                </p>
                {saving && <p className="text-xs text-gray-500 mt-2">Saving score...</p>}
                {!saving && (
                  <p className="text-xs text-gray-500 mt-2">Score saved to your profile.</p>
                )}
                <button
                  onClick={handleReset}
                  className="mt-4 bg-secondary text-text border border-gray-600 py-2 px-6 rounded-lg hover:border-highlight transition-colors"
                >
                  Try Another Topic
                </button>
              </div>
            )}
          </div>
        )}

        {/* Raw string quiz (fallback) */}
        {quiz && !Array.isArray(quiz) && (
          <div className="mt-6 bg-accent p-6 rounded-lg">
            <pre className="whitespace-pre-wrap">{quiz}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
