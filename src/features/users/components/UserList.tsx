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
      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card lg:relative lg:overflow-hidden lg:rounded-[20px] lg:border-[#c6a56b]/15 lg:bg-[radial-gradient(circle_at_top_left,rgba(198,165,107,0.07),transparent_30%),linear-gradient(145deg,#11100e,#090909_72%)] lg:p-6 lg:shadow-[0_24px_60px_rgba(0,0,0,0.26)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#c6a56b]/12 bg-[#c6a56b]/[0.045] px-3.5 py-2">
            <p className="text-xs text-white/50">Total de usuários</p>
            <p className="home-display text-xl font-semibold leading-none text-white/85">{totalUsers}</p>
          </div>

          <div className="no-scrollbar order-3 -mx-1 flex w-[calc(100%+0.5rem)] gap-2 overflow-x-auto px-1 lg:order-none lg:mx-0 lg:w-auto lg:min-w-0 lg:flex-1 lg:justify-end lg:px-0">
              <button
                type="button"
                onClick={() => onRoleSelect(null)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6a56b]/55 ${
                  roleFilter === null
                    ? "border-[#c6a56b]/45 bg-[#c6a56b] text-[#090806] shadow-[0_8px_22px_rgba(198,165,107,0.14)]"
                    : "border-white/[0.07] bg-white/[0.035] text-white/55 hover:border-[#c6a56b]/20 hover:text-white/85"
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
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6a56b]/55 ${
                    roleFilter === option.value
                      ? "border-[#c6a56b]/45 bg-[#c6a56b] text-[#090806] shadow-[0_8px_22px_rgba(198,165,107,0.14)]"
                      : "border-white/[0.07] bg-white/[0.035] text-white/55 hover:border-[#c6a56b]/20 hover:text-white/85"
                  }`}
                >
                  {option.label}
                </button>
              ))}
          </div>

          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="ml-auto min-h-10 shrink-0 rounded-full border border-white/10 bg-[#0a0a09] px-4 text-sm text-white/65 outline-none transition focus:border-[#c6a56b]/45 focus:ring-2 focus:ring-[#c6a56b]/10 lg:ml-0 lg:border-[#c6a56b]/15 lg:bg-black/30"
            aria-label="Quantidade por página"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size} className="bg-[#0a0a09]">
                {size} por página
              </option>
            ))}
          </select>
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
          variant="luxury"
        />

        {roleOptionsError ? <p className="text-xs text-red-300">{roleOptionsError}</p> : null}
        {searchTerm ? <p className="text-xs text-white/50">Busca atual: {searchTerm}</p> : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-[#0b0b0b] p-5 shadow-card lg:rounded-[20px] lg:border-white/[0.07] lg:bg-[#0c0c0b] lg:p-6">
        <div className="flex items-center justify-between">
          <p className="home-display text-lg font-semibold lg:text-2xl">Lista de usuários</p>
          <span className="rounded-full border border-[#c6a56b]/12 bg-[#c6a56b]/[0.045] px-3 py-1.5 text-xs text-white/55">{totalUsers} itens</span>
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

        <div className="space-y-2.5">
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

      <div className="rounded-3xl border border-white/5 bg-[#0b0b0b] p-4 shadow-card lg:rounded-[20px] lg:border-white/[0.07] lg:bg-[#0c0c0b] lg:px-5">
        <Pagination
          currentCount={usersList.length}
          totalCount={totalUsers}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onNext={() => onPagination("next")}
          onPrevious={() => onPagination("previous")}
          pageSize={pageSize}
          itemLabel={totalUsers === 1 ? "usuário" : "usuários"}
        />
      </div>

      <FabMenu
        open={showFabOptions}
        onToggle={onToggleFab}
        variant="luxury"
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
