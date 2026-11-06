import { httpClient } from './httpClient';

export const assistantApi = {
  chat: (message) =>
    httpClient('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    }),
  getHistory: () => httpClient('/assistant/history')
};
