import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, Search, X } from "lucide-react";
import { useAutocomplete } from "@/hooks/use-vms";
import type { VMFilters } from "@/lib/types";

const NETWORK_LABELS: Record<string, string> = {
  office: "OFLNET",
  machine: "MNET",
  test: "TNET",
};

const NETWORK_COLORS: Record<string, string> = {
  office: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  machine: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  test: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

const STATUS_COLORS: Record<string, string> = {
  running: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  stopped: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  provisioning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchCommit: (query: string) => void;
  filters: VMFilters;
  onFiltersChange: (filters: VMFilters) => void;
  onCreateClick: () => void;
  canCreate: boolean;
}

const OS_OPTIONS = [
  "RHEL 9",
  "RHEL 8",
  "Ubuntu 24.04",
  "Ubuntu 22.04",
  "Debian 12",
  "Rocky Linux 9",
];

const SORT_OPTIONS = [
  { value: "created_at", label: "Created" },
  { value: "name", label: "Name" },
  { value: "cpu", label: "CPU" },
  { value: "ram", label: "RAM" },
  { value: "disk", label: "Disk" },
];

export function Toolbar({
  search,
  onSearchChange,
  onSearchCommit,
  filters,
  onFiltersChange,
  onCreateClick,
  canCreate,
}: ToolbarProps) {
  const [focused, setFocused] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: suggestions = [] } = useAutocomplete(search);

  const showDropdown = focused && search.length > 0 && suggestions.length > 0;

  const activeFilterCount = [filters.network, filters.status, filters.os].filter(Boolean).length;

  function commitSearch(value: string) {
    onSearchChange(value);
    onSearchCommit(value);
    setFocused(false);
    inputRef.current?.blur();
  }

  function updateFilter(key: keyof VMFilters, value: string) {
    const resolved = value === "all" ? undefined : value;
    onFiltersChange({ ...filters, [key]: resolved });
  }

  function clearFilters() {
    onFiltersChange({ sort_by: "created_at", order: "desc" });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            ref={inputRef}
            placeholder="Search VMs..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitSearch(search);
              }
              if (e.key === "Escape") {
                onSearchChange("");
                onSearchCommit("");
                inputRef.current?.blur();
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            className="pl-9 pr-9"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => commitSearch(search)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md z-50">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commitSearch(item.name);
                  }}
                >
                  <span className="flex-1 font-medium">{item.name}</span>
                  <Badge variant="outline" className={`text-xs px-1.5 py-0 ${NETWORK_COLORS[item.network] ?? ""}`}>
                    {NETWORK_LABELS[item.network] ?? item.network}
                  </Badge>
                  <Badge variant="outline" className={`text-xs px-1.5 py-0 ${STATUS_COLORS[item.status] ?? ""}`}>
                    {item.status}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => commitSearch(search)}
          disabled={search.length === 0}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdvancedOpen(!advancedOpen)}
        >
          {advancedOpen ? (
            <ChevronUp className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <div className="flex-1" />

        {canCreate && (
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Create VM
          </Button>
        )}
      </div>

      {advancedOpen && (
        <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Filter by:
          </span>

          <Select
            value={filters.network ?? "all"}
            onValueChange={(v) => updateFilter("network", v)}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All networks</SelectItem>
              <SelectItem value="office">Office (OFLNET)</SelectItem>
              <SelectItem value="machine">Machine (MNET)</SelectItem>
              <SelectItem value="test">Test (TNET)</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) => updateFilter("status", v)}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
              <SelectItem value="provisioning">Provisioning</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.os ?? "all"}
            onValueChange={(v) => updateFilter("os", v)}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="OS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All OS</SelectItem>
              {OS_OPTIONS.map((os) => (
                <SelectItem key={os} value={os}>
                  {os}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-border" />

          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Sort by:
          </span>

          <Select
            value={filters.sort_by ?? "created_at"}
            onValueChange={(v) => updateFilter("sort_by", v)}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.order ?? "desc"}
            onValueChange={(v) => updateFilter("order", v)}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
