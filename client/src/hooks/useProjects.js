import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../api/api.js';

export const useProjects = () => {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await projectService.getAll();
      return res.data.projects;
    },
    staleTime: 1000 * 60,
    retry: 1
  });

  const createProject = useMutation({
    mutationFn: (data) => projectService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  });

  const updateProject = useMutation({
    mutationFn: ({ id, data }) => projectService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
      }
    }
  });

  const deleteProject = useMutation({
    mutationFn: (id) => projectService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  });

  const addMember = useMutation({
    mutationFn: ({ projectId, data }) => projectService.addMember(projectId, data),
    onSuccess: (_data, variables) => {
      if (variables?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      }
    }
  });

  const removeMember = useMutation({
    mutationFn: ({ projectId, userId }) => projectService.removeMember(projectId, userId),
    onSuccess: (_data, variables) => {
      if (variables?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
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
  useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectService.getById(id).then((res) => res.data.project),
    enabled: !!id,
    staleTime: 1000 * 60,
    retry: 1
  });
