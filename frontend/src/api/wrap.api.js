import { httpClient } from './httpClient';

export const wrapApi = {
  getSummary: (month = null, year = null) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const qs = params.toString();
    return httpClient(`/wrap/summary${qs ? `?${qs}` : ''}`);
  }
};
