import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiBookOpen } from 'react-icons/fi';
import { errorMessage, getProgress } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressChart from '../components/Dashboard/ProgressChart';
import { Alert, EmptyState, PageHeader, Spinner } from '../components/common/ui';

const StatTile = ({ label, value, hint }) => (
  <div className="card p-5">
    <p className="text-sm text-text-secondary">{label}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
    {hint && <p className="text-xs text-text-secondary mt-1">{hint}</p>}
  </div>
);

const scoreColor = (s) => (s >= 80 ? 'text-green-300' : s >= 50 ? 'text-yellow-300' : 'text-red-300');

const DashboardPage = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProgress()
      .then(({ data }) => setProgress(data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!progress) return <Spinner label="Loading progress" />;

  const weakest = progress.topics.filter((t) => t.average < 80).slice(0, 3);

  return (
    <div className="max-w-6xl">
      <PageHeader title={`Hi, ${user?.username}`} subtitle={user?.learning_goals ? `Goal: ${user.learning_goals}` : 'Here is how your studying is going.'}>
        <Link to="/quiz" className="btn-primary">Start a quiz</Link>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Average score" value={progress.session_count ? `${progress.average_score}%` : '–'} />
        <StatTile label="Quizzes taken" value={progress.session_count} />
        <StatTile label="Topics practiced" value={progress.topics.length} />
        <StatTile label="Documents" value={progress.document_count} hint={<Link to="/library" className="text-highlight hover:underline">Manage library</Link>} />
      </div>

      {progress.session_count === 0 ? (
        <div className="card">
          <EmptyState icon={progress.document_count ? FiBarChart2 : FiBookOpen} title={progress.document_count ? 'No quizzes yet' : 'Start by adding study material'}>
            {progress.document_count ? (
              <>Take your first <Link to="/quiz" className="text-highlight hover:underline">quiz</Link> to start tracking progress.</>
            ) : (
              <>Upload your notes in the <Link to="/library" className="text-highlight hover:underline">Library</Link>, then chat with them or generate a quiz.</>
            )}
          </EmptyState>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2">
            <h2 className="font-semibold mb-4">Scores over time</h2>
            <ProgressChart data={progress.quiz_scores} />
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-1">Review next</h2>
            <p className="text-sm text-text-secondary mb-4">Your lowest-scoring topics.</p>
            {weakest.length === 0 ? (
              <p className="text-sm">Every topic is at 80% or above. Try a harder difficulty.</p>
            ) : (
              <ul className="space-y-3">
                {weakest.map((t) => (
                  <li key={t.topic} className="flex items-center justify-between gap-3">
                    <span className="truncate">{t.topic}</span>
                    <Link to={`/quiz?topic=${encodeURIComponent(t.topic)}`} className="text-sm text-highlight hover:underline shrink-0">Practice</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6 lg:col-span-3 overflow-x-auto">
            <h2 className="font-semibold mb-4">Topics</h2>
            <table className="w-full text-sm">
              <thead className="text-text-secondary text-left">
                <tr>
                  <th className="pb-2 font-normal">Topic</th>
                  <th className="pb-2 font-normal text-right">Attempts</th>
                  <th className="pb-2 font-normal text-right">Average</th>
                  <th className="pb-2 font-normal text-right">Best</th>
                  <th className="pb-2 font-normal text-right">Last</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent">
                {progress.topics.map((t) => (
                  <tr key={t.topic}>
                    <td className="py-2">{t.topic}</td>
                    <td className="py-2 text-right">{t.attempts}</td>
                    <td className={`py-2 text-right ${scoreColor(t.average)}`}>{t.average}%</td>
                    <td className="py-2 text-right">{t.best}%</td>
                    <td className="py-2 text-right">{t.last}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
