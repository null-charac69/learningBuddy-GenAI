
import React, { useState } from 'react';
import { getQuiz } from '../services/api';

const QuizPage = () => {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState(null);

  const handleFetchQuiz = async () => {
    if (topic) {
      const { data } = await getQuiz(topic);
      setQuiz(data.quiz);
    }
  };

  return (
    <div className="text-text">
      <h1 className="text-3xl font-bold mb-6">Quiz</h1>
      <div className="bg-secondary p-8 rounded-lg shadow-lg">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic"
            className="w-full bg-accent text-text rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-highlight"
          />
          <button onClick={handleFetchQuiz} className="bg-highlight text-white py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
            Get Quiz
          </button>
        </div>
        {quiz && (
          <div className="mt-6 bg-accent p-6 rounded-lg">
            <pre className="whitespace-pre-wrap">{quiz}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;