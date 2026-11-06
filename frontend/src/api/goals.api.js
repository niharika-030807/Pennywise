import { httpClient } from './httpClient';

export const goalsApi = {
  getGoals: () => httpClient('/goals'),
  createGoal: (payload) =>
    httpClient('/goals', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  deposit: (goalId, amount) =>
    httpClient(`/goals/${goalId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),
  deleteGoal: (goalId) =>
    httpClient(`/goals/${goalId}`, {
      method: 'DELETE'
    })
};
