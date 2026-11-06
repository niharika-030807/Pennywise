import { httpClient } from './httpClient';

export const transactionsApi = {
  getTransactions: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params.type && params.type !== 'All') searchParams.append('type', params.type);
    if (params.search) searchParams.append('search', params.search);
    if (params.start_date) searchParams.append('start_date', params.start_date);
    if (params.end_date) searchParams.append('end_date', params.end_date);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.offset) searchParams.append('offset', params.offset);

    const queryString = searchParams.toString();
    return httpClient(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  createTransaction: (tx) =>
    httpClient('/transactions', {
      method: 'POST',
      body: JSON.stringify(tx)
    }),

  updateTransaction: (id, tx) =>
    httpClient(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tx)
    }),

  deleteTransaction: (id) =>
    httpClient(`/transactions/${id}`, {
      method: 'DELETE'
    }),

  importCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient('/transactions/import-csv', {
      method: 'POST',
      body: formData
    });
  }
};
