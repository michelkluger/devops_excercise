export interface VMUser {
  username: string;
  full_name: string;
  is_sudoer: boolean;
}

export interface VMPackage {
  name: string;
  version: string;
}

export interface VM {
  id: string;
  name: string;
  cpu: number;
  ram: number;
  disk: number;
  os: string;
  network: string;
  status: string;
  users: VMUser[];
  packages: VMPackage[];
  created_at: string;
  updated_at: string;
}

export interface VMCreate {
  name: string;
  cpu: number;
  ram: number;
  disk: number;
  os: string;
  network: string;
  status?: string;
  users: VMUser[];
  packages: VMPackage[];
}

export type VMUpdate = Partial<VMCreate>;

export interface VMListResponse {
  items: VM[];
  total: number;
}

export interface SearchResponse {
  items: VM[];
  total: number;
  query: string;
  processing_time_ms: number;
}

export interface AutocompleteItem {
  id: string;
  name: string;
  network: string;
  status: string;
}

export interface ADUser {
  username: string;
  full_name: string;
  email: string;
  department: string;
}

export interface RPMPackage {
  name: string;
  version: string;
  description: string;
}

export interface SystemUser {
  username: string;
  full_name: string;
  role: string;
  department: string;
}

export interface UserProfile {
  username: string;
  full_name: string;
  role: string;
  department: string;
  permissions: string[];
}

export type NetworkType = "office" | "machine" | "test";
export type VMStatus = "provisioning" | "running" | "stopped" | "failed";

export interface VMFilters {
  network?: string;
  status?: string;
  os?: string;
  sort_by?: string;
  order?: string;
}
