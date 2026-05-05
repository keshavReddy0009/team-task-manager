import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../api/api.js';

export const useTasks = (projectId, filters = {}) => {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () => taskService.getAll(projectId, filters).then((res) => res.data.tasks),
    enabled: !!projectId,
    staleTime: 1000 * 60,
    retry: 1
  });

  const createTask = useMutation({
    mutationFn: (data) => taskService.create(projectId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, data }) => taskService.update(projectId, taskId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
  });

  const updateTaskStatus = useMutation({
    mutationFn: ({ taskId, status }) => taskService.updateStatus(projectId, taskId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
  });

  const deleteTask = useMutation({
    mutationFn: (taskId) => taskService.remove(projectId, taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
  });

  return {
    tasksQuery,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  };
};
