"use client";

import { Filter, Loader2, Plus } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { FabMenu } from "@/components/ui/FabMenu";
import type { RoleOption, UserItem } from "@/src/features/users/types";
import { UserCard } from "./UserCard";

type UserListProps = {
  usersList: UserItem[];
  totalUsers: number;
  usersLoading: boolean;
  usersError: string | null;
  hasNext: boolean;
  hasPrevious: boolean;
  pageSize: number;
  pageSizeOptions: readonly number[];
  searchInput: string;
  searchTerm: string;
  roleFilter: string | null;
  roleOptions: RoleOption[];
  roleOptionsError: string | null;
  roleLabelMap: Record<string, string>;
  showFabOptions: boolean;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onRoleSelect: (role: string | null) => void;
  onPageSizeChange: (size: number) => void;
  onPagination: (direction: "next" | "previous") => void;
  onUserClick: (id: number) => void;
  onStartCreate: () => void;
  onToggleFab: () => void;
};

export function UserList({
  usersList,
  totalUsers,
  usersLoading,
  usersError,
  hasNext,
  hasPrevious,
  pageSize,
  pageSizeOptions,
  searchInput,
  searchTerm,
  roleFilter,
  roleOptions,
  roleOptionsError,
  roleLabelMap,
  showFabOptions,
  onSearchInputChange,
  onSearchSubmit,
  onClearSearch,
  onRoleSelect,
  onPageSizeChange,
  onPagination,
  onUserClick,
  onStartCreate,
  onToggleFab,
}: UserListProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
          <p className="text-sm text-white/60">Total de usuários</p>
          <p className="mt-2 text-3xl font-semibold">{totalUsers}</p>
        </div>

        <SearchBar
          value={searchInput}
          onChange={onSearchInputChange}
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          onClear={onClearSearch}
          placeholder="Pesquisar usuários"
        />

        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          <button
            type="button"
            onClick={() => onRoleSelect(null)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              roleFilter === null ? "bg-white text-black" : "bg-white/10 text-white/70"
            }`}
          >
            <Filter className="h-4 w-4" />
            Todos
          </button>
          {roleOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => onRoleSelect(option.value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                roleFilter === option.value ? "bg-white text-black" : "bg-white/10 text-white/70"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {roleOptionsError ? <p className="text-xs text-red-300">{roleOptionsError}</p> : null}
        {searchTerm ? <p className="text-xs text-white/50">Busca atual: {searchTerm}</p> : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Lista de usuários</p>
          <span className="text-xs text-white/60">{totalUsers} itens</span>
        </div>

        {usersError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {usersError}
          </div>
        ) : null}

        {usersLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
          </div>
        ) : null}

        {!usersLoading && usersList.length === 0 ? (
          <p className="rounded-2xl border border-white/10 px-4 py-6 text-center text-sm text-white/60">
            Nenhum usuário encontrado.
          </p>
        ) : null}

        <div className="space-y-3">
          {usersList.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              roleLabel={roleLabelMap[user.role] ?? user.role}
              onClick={onUserClick}
            />
          ))}
        </div>
      </section>

      <div className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-4 shadow-card">
        <Pagination
          currentCount={usersList.length}
          totalCount={totalUsers}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onNext={() => onPagination("next")}
          onPrevious={() => onPagination("previous")}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
          itemLabel={totalUsers === 1 ? "usuário" : "usuários"}
        />
      </div>

      <FabMenu
        open={showFabOptions}
        onToggle={onToggleFab}
        options={[
          {
            label: "Novo usuário",
            icon: Plus,
            onClick: onStartCreate,
          },
        ]}
      />
    </div>
  );
}
