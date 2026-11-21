


import React from 'react';



const ScoreCard = ({ scores }) => {

    const averageScore = scores.length > 0 ? scores.reduce((acc, item) => acc + item.score, 0) / scores.length : 0;

  return (

    <div className="bg-secondary p-6 rounded-lg text-text shadow-lg">

      <h2 className="text-xl font-bold text-highlight">Average Quiz Score</h2>

      <p className="text-4xl font-bold">{averageScore.toFixed(2)}%</p>

    </div>

  );

};



export default ScoreCard;
