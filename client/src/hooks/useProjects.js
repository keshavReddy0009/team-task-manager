import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../api/api.js';

export const useProjects = () => {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery(['projects'], () => projectService.getAll().then((res) => res.data), {
    staleTime: 1000 * 60,
    retry: 1
  });

  const createProject = useMutation((data) => projectService.create(data), {
    onSuccess: () => queryClient.invalidateQueries(['projects'])
  });

  const updateProject = useMutation(({ id, data }) => projectService.update(id, data), {
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(['projects']);
      if (variables?.id) {
        queryClient.invalidateQueries(['projects', variables.id]);
      }
    }
  });

  const deleteProject = useMutation((id) => projectService.remove(id), {
    onSuccess: () => queryClient.invalidateQueries(['projects'])
  });

  const addMember = useMutation(({ projectId, data }) => projectService.addMember(projectId, data), {
    onSuccess: (_data, variables) => {
      if (variables?.projectId) {
        queryClient.invalidateQueries(['projects', variables.projectId]);
      }
    }
  });

  const removeMember = useMutation(({ projectId, userId }) => projectService.removeMember(projectId, userId), {
    onSuccess: (_data, variables) => {
      if (variables?.projectId) {
        queryClient.invalidateQueries(['projects', variables.projectId]);
      }
    }
  });

  return {
    projectsQuery,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember
  };
};

export const useProject = (id) =>
  useQuery(['projects', id], () => projectService.getById(id).then((res) => res.data.project), {
    enabled: !!id,
    staleTime: 1000 * 60,
    retry: 1
  });
