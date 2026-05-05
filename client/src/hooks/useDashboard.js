import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../api/api.js';

export const useDashboard = () => {
  return useQuery(['dashboard'], () => dashboardService.get().then((res) => res.data), {
    staleTime: 1000 * 60,
    retry: 1
  });
};
