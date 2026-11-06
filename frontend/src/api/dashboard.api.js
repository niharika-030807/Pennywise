import { httpClient } from './httpClient';

export const dashboardApi = {
  getOverview: () => httpClient('/dashboard/overview')
};
