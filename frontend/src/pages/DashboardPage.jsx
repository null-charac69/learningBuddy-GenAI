


import React, { useState, useEffect } from 'react';

import { getProgress } from '../services/api';

import ProgressChart from '../components/Dashboard/ProgressChart';

import ScoreCard from '../components/Dashboard/ScoreCard';



const DashboardPage = () => {

  const [progress, setProgress] = useState(null);



  useEffect(() => {

    const fetchProgress = async () => {

      const { data } = await getProgress();

      setProgress(data);

    };

    fetchProgress();

  }, []);



  if (!progress) return <div className="text-text">Loading...</div>;



  return (

    <div className="text-text">

      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="bg-secondary p-6 rounded-lg shadow-lg">

            <h2 className="text-xl font-bold mb-4 text-highlight">Quiz Scores</h2>

            <ProgressChart data={progress.quiz_scores} />

        </div>

        <div className="bg-secondary p-6 rounded-lg shadow-lg">

            <h2 className="text-xl font-bold mb-4 text-highlight">Average Score</h2>

            <ScoreCard scores={progress.quiz_scores} />

        </div>

        <div className="bg-secondary p-6 rounded-lg shadow-lg">

            <h2 className="text-xl font-bold mb-4 text-highlight">Topics Covered</h2>

            <ul>

                {progress.topics_covered.map(topic => <li key={topic} className="mb-2 text-text-secondary">{topic}</li>)}

            </ul>

        </div>

        <div className="bg-secondary p-6 rounded-lg shadow-lg">

            <h2 className="text-xl font-bold mb-4 text-highlight">Session Count</h2>

            <p className="text-4xl font-bold">{progress.session_count}</p>

        </div>

      </div>

    </div>

  );

};



export default DashboardPage;
