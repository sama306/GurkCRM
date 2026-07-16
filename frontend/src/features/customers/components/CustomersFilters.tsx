import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import { useUsers } from "@/hooks/useUsers";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "LEAD", label: "Lead" },
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
] as const;

interface CustomersFiltersProps {
  search: string;
  status: string;
  companyId: string;
  ownerId: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
}

export function CustomersFilters({
  search,
  status,
  companyId,
  ownerId,
  onSearchChange,
  onStatusChange,
  onCompanyChange,
  onOwnerChange,
}: CustomersFiltersProps) {
  const { data: companiesData } = useCompanies({ limit: 200, sortBy: "name", order: "asc" });
  const { data: usersData } = useUsers();

  const companies = companiesData?.data ?? [];
  const users = usersData ?? [];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={companyId} onValueChange={onCompanyChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas las empresas</SelectItem>
          {companies.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={ownerId} onValueChange={onOwnerChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Responsable" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos los responsables</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
