"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import { createAdminUser, deleteAdminUser, fetchAdminUsers } from "@/services/cmsApi";
import { useToast } from "@/components/ui/ToastProvider";

type AdminUserRow = {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export function UsersManagementContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createAdminUser({ name, email, password, role });
      showToast("User created successfully.");
      setName("");
      setEmail("");
      setPassword("");
      setRole("admin");
      if (users.length === 0) {
        router.push("/admin/login");
        return;
      }
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not create user.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (user: AdminUserRow) => {
    if (!confirm(`Delete user ${user.email}?`)) return;
    try {
      await deleteAdminUser(user.id);
      showToast("User deleted.");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-muted">
        <Loader2 className="h-8 w-8 animate-spin text-brand-secondary" />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Create admin users stored in MySQL. Passwords are saved securely in the database."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <AdminCard title="Create user" description="Add a new admin account to the database.">
          <form onSubmit={onCreate} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-text">Full name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-brand-border px-4 py-3 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                placeholder="John Admin"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-text">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-brand-border px-4 py-3 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-text">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-brand-border px-4 py-3 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                placeholder="Minimum 6 characters"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-text">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="btn-gradient inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {saving ? "Creating…" : "Create user"}
            </button>
          </form>
        </AdminCard>

        <AdminCard title="All users" description={`${users.length} account${users.length === 1 ? "" : "s"} in database`}>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-brand-muted">
              <Users className="mb-3 h-10 w-10 text-brand-secondary/60" />
              <p className="text-sm">No users yet. Create your first admin user on the left.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-col gap-3 rounded-xl border border-brand-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-brand-text">{user.name}</p>
                      <AdminBadge variant="purple">{user.role}</AdminBadge>
                      {user.isActive ? <AdminBadge variant="success">Active</AdminBadge> : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-brand-muted">{user.email}</p>
                    <p className="mt-1 text-xs text-brand-muted">Created {user.createdAt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(user)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </>
  );
}
