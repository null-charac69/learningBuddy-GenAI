/** Score a quiz. `answers` maps question index -> chosen option. */
export const scoreQuiz = (questions, answers) => {
  const total = questions.length;
  const correct = questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
  return { correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
};

export const feedbackFor = (percent) => {
  if (percent >= 80) return 'Excellent. You know this well.';
  if (percent >= 50) return 'Good effort. Review the explanations below and try again.';
  return 'This topic needs more work. Ask Study Chat to explain the questions you missed.';
};
