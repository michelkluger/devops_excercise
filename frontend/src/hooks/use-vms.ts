import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { VMCreate, VMFilters, VMUpdate } from "@/lib/types";

export function useVMs(params: { q?: string; limit?: number; offset?: number } & VMFilters) {
  return useQuery({
    queryKey: ["vms", params],
    queryFn: () => api.listVMs(params),
    refetchInterval: 5000,
    placeholderData: (prev) => prev,
  });
}

export function useAutocomplete(q: string) {
  return useQuery({
    queryKey: ["vms-autocomplete", q],
    queryFn: () => api.autocomplete(q),
    enabled: q.length > 0,
    staleTime: 10_000,
  });
}

export function useVM(id: string | null) {
  return useQuery({
    queryKey: ["vm", id],
    queryFn: () => api.getVM(id!),
    enabled: !!id,
  });
}

export function useCreateVM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VMCreate) => api.createVM(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vms"] }),
  });
}

export function useUpdateVM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VMUpdate }) =>
      api.updateVM(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vms"] });
      qc.invalidateQueries({ queryKey: ["vm"] });
    },
  });
}

export function useDeleteVM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteVM(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vms"] }),
  });
}

function useVMAction(action: (id: string) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vms"] });
      qc.invalidateQueries({ queryKey: ["vm"] });
    },
  });
}

export function useStopVM() {
  return useVMAction(api.stopVM);
}

export function useStartVM() {
  return useVMAction(api.startVM);
}

export function useRebootVM() {
  return useVMAction(api.rebootVM);
}

export function useADUsers() {
  return useQuery({
    queryKey: ["ad-users"],
    queryFn: () => api.listUsers(),
    staleTime: Infinity,
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ["rpm-packages"],
    queryFn: () => api.listPackages(),
    staleTime: Infinity,
  });
}

export function useMe(username: string) {
  return useQuery({
    queryKey: ["auth-me", username],
    queryFn: () => api.getMe(),
  });
}

export function useSystemUsers() {
  return useQuery({
    queryKey: ["auth-users"],
    queryFn: () => api.getSystemUsers(),
    staleTime: Infinity,
  });
}
