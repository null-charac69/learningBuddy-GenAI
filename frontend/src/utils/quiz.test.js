import { feedbackFor, scoreQuiz } from './quiz';

test('scoreQuiz counts exact-match answers', () => {
  const qs = [{ answer: 'a' }, { answer: 'b' }, { answer: 'c' }];
  expect(scoreQuiz(qs, { 0: 'a', 1: 'x', 2: 'c' })).toEqual({ correct: 2, total: 3, percent: 67 });
  expect(scoreQuiz([], {})).toEqual({ correct: 0, total: 0, percent: 0 });
});

test('feedbackFor tiers', () => {
  expect(feedbackFor(90)).toMatch(/Excellent/);
  expect(feedbackFor(60)).toMatch(/Good/);
  expect(feedbackFor(10)).toMatch(/needs more work/);
});
