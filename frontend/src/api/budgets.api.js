import { httpClient } from './httpClient';

export const budgetsApi = {
  getCurrent: () => httpClient('/budgets/current'),
  setBudget: (payload) =>
    httpClient('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
