export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
};

export function getAdminInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
