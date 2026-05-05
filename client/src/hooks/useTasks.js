import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../api/api.js';

export const useTasks = (projectId, filters = {}) => {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery(
    ['tasks', projectId, filters],
    () => taskService.getAll(projectId, filters).then((res) => res.data),
    {
      enabled: !!projectId,
      staleTime: 1000 * 60,
      retry: 1
    }
  );

  const createTask = useMutation((data) => taskService.create(projectId, data), {
    onSuccess: () => queryClient.invalidateQueries(['tasks', projectId])
  });

  const updateTask = useMutation(({ taskId, data }) => taskService.update(projectId, taskId, data), {
    onSuccess: () => queryClient.invalidateQueries(['tasks', projectId])
  });

  const updateTaskStatus = useMutation(({ taskId, status }) => taskService.updateStatus(projectId, taskId, status), {
    onSuccess: () => queryClient.invalidateQueries(['tasks', projectId])
  });

  const deleteTask = useMutation((taskId) => taskService.remove(projectId, taskId), {
    onSuccess: () => queryClient.invalidateQueries(['tasks', projectId])
  });

  return {
    tasksQuery,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  };
};
