import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiBookOpen, FiCheck, FiX } from 'react-icons/fi';
import { errorMessage, generateQuiz, submitQuizScore } from '../services/api';
import { Alert, PageHeader, Spinner } from '../components/common/ui';
import { feedbackFor, scoreQuiz } from '../utils/quiz';

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [useDocuments, setUseDocuments] = useState(true);

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const t = searchParams.get('topic');
    if (t) setTopic(t);
  }, [searchParams]);

  const start = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setQuiz(null);
    setAnswers({});
    setResult(null);
    try {
      const { data } = await generateQuiz({ topic: topic.trim(), numQuestions, difficulty, useDocuments });
      setQuiz(data);
    } catch (err) {
      setError(errorMessage(err, 'Could not generate a quiz'));
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    const r = scoreQuiz(quiz.questions, answers);
    setResult(r);
    setSaveError(null);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
    try {
      await submitQuizScore(quiz.topic, r.percent, r.correct, r.total);
    } catch (err) {
      setSaveError(errorMessage(err, 'Score could not be saved'));
    }
  };

  const optionClass = (q, i, opt) => {
    const base = 'w-full text-left py-2.5 px-4 rounded-lg border transition-colors flex items-center gap-2 ';
    if (!result) {
      return base + (answers[i] === opt ? 'border-highlight bg-highlight/20' : 'border-accent hover:border-highlight');
    }
    if (opt === q.answer) return base + 'border-success bg-success/15 text-green-200';
    if (answers[i] === opt) return base + 'border-danger bg-danger/15 text-red-200';
    return base + 'border-accent text-text-secondary';
  };

  const answeredAll = quiz && Object.keys(answers).length === quiz.questions.length;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Quiz" subtitle="Test yourself on a topic. Questions come from your library when it covers the topic." />

      {!quiz && (
        <form onSubmit={start} className="card p-6 space-y-4">
          <div>
            <label htmlFor="topic" className="label">Topic</label>
            <input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="input"
              placeholder="e.g. Cellular respiration, World War I causes, Big-O notation" disabled={loading} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="num" className="label">Questions</label>
              <select id="num" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="input" disabled={loading}>
                {[3, 5, 10].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="difficulty" className="label">Difficulty</label>
              <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input" disabled={loading}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <label className="flex items-center gap-2 sm:mt-7 cursor-pointer">
              <input type="checkbox" checked={useDocuments} onChange={(e) => setUseDocuments(e.target.checked)} className="h-4 w-4 accent-highlight" disabled={loading} />
              <span className="text-sm">Use my library</span>
            </label>
          </div>
          {error && <Alert>{error}</Alert>}
          <button type="submit" disabled={loading || !topic.trim()} className="btn-primary">
            {loading ? 'Generating…' : 'Generate quiz'}
          </button>
          {loading && <Spinner label="Writing questions. This takes a few seconds." />}
        </form>
      )}

      {quiz && (
        <>
          <div className="card p-5 mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{quiz.topic}</p>
              <p className="text-sm text-text-secondary flex items-center gap-1.5">
                {quiz.grounded ? (
                  <><FiBookOpen /> Based on {quiz.sources.map((s) => s.filename).join(', ')}</>
                ) : (
                  'General knowledge (no matching material in your library)'
                )}
              </p>
            </div>
            <button onClick={() => setQuiz(null)} className="btn-ghost text-sm py-1.5">New topic</button>
          </div>

          {result && (
            <div className="card p-6 mb-4 text-center">
              <p className="text-4xl font-bold text-highlight">{result.percent}%</p>
              <p className="text-text-secondary mt-1">{result.correct} of {result.total} correct</p>
              <p className="mt-2">{feedbackFor(result.percent)}</p>
              {saveError ? <p className="text-sm text-red-300 mt-2">{saveError}</p> : <p className="text-xs text-text-secondary mt-2">Saved to your progress.</p>}
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <button onClick={start} className="btn-primary">Retry with new questions</button>
                <Link to="/chat" className="btn-ghost">Ask Study Chat</Link>
                <Link to="/dashboard" className="btn-ghost">View progress</Link>
              </div>
            </div>
          )}

          <ol className="space-y-4">
            {quiz.questions.map((q, i) => (
              <li key={i} className="card p-5">
                <p className="font-medium mb-3">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <button key={opt} disabled={!!result} onClick={() => setAnswers({ ...answers, [i]: opt })} className={optionClass(q, i, opt)}>
                      {result && opt === q.answer && <FiCheck className="shrink-0" />}
                      {result && answers[i] === opt && opt !== q.answer && <FiX className="shrink-0" />}
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
                {result && q.explanation && <p className="mt-3 text-sm text-text-secondary">{q.explanation}</p>}
              </li>
            ))}
          </ol>

          {!result && (
            <div className="mt-4 flex items-center gap-4">
              <button onClick={submit} disabled={!answeredAll} className="btn-primary">Submit answers</button>
              <span className="text-sm text-text-secondary">{Object.keys(answers).length}/{quiz.questions.length} answered</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuizPage;
