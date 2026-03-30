"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/src/features/dashboard/components/DashboardShell";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { useAuth } from "@/src/features/shared/hooks/useAuth";
import { useUsers } from "@/src/features/users/hooks/useUsers";
import { UserList } from "@/src/features/users/components/UserList";
import { CreateUserScreen } from "@/src/features/users/components/CreateUserScreen";

type Props = { firstName: string };

type Screen = "list" | "create";

export function UsersTab({ firstName }: Props) {
  void firstName;
  const router = useRouter();
  const { accessToken, fetchWithAuth, profilePic, userRole } = useAuth();
  const users = useUsers({ accessToken, fetchWithAuth });
  const [screen, setScreen] = useState<Screen>("list");
  const [showFabOptions, setShowFabOptions] = useState(false);
  const [feedback, setFeedbackRaw] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const setFeedback = (value: { type: "success" | "error"; message: string } | null) => {
    setFeedbackRaw(value);
    if (value) setTimeout(() => setFeedbackRaw(null), 4000);
  };

  const roleLabelMap = useMemo(
    () =>
      users.roleOptions.reduce<Record<string, string>>((acc, option) => {
        acc[option.value] = option.label;
        return acc;
      }, {}),
    [users.roleOptions],
  );
  const content =
    screen === "create" ? (
      <CreateUserScreen
        accessToken={accessToken}
        fetchWithAuth={fetchWithAuth}
        roleOptions={users.roleOptions}
        roleOptionsError={users.roleOptionsError}
        onCancel={() => setScreen("list")}
        onSuccess={() => {
          users.refreshUsers();
          setScreen("list");
          setFeedback({ type: "success", message: "Usuário criado com sucesso." });
        }}
        onError={(message) => setFeedback({ type: "error", message })}
      />
    ) : (
      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Painel</p>
            <p className="text-2xl font-semibold">Usuários</p>
          </div>
        </header>

        {feedback ? <FeedbackBanner message={feedback.message} type={feedback.type} /> : null}

        <UserList
          usersList={users.usersList}
          totalUsers={users.totalUsers}
          usersLoading={users.usersLoading}
          usersError={users.usersError}
          hasNext={users.hasNext}
          hasPrevious={users.hasPrevious}
          pageSize={users.pageSize}
          pageSizeOptions={users.PAGE_SIZE_OPTIONS}
          searchInput={users.searchInput}
          searchTerm={users.searchTerm}
          roleFilter={users.roleFilter}
          roleOptions={users.roleOptions}
          roleOptionsError={users.roleOptionsError}
          roleLabelMap={roleLabelMap}
          showFabOptions={showFabOptions}
          onSearchInputChange={users.setSearchInput}
          onSearchSubmit={users.handleSearchSubmit}
          onClearSearch={users.handleClearSearch}
          onRoleSelect={users.handleRoleSelect}
          onPageSizeChange={users.handlePageSizeChange}
          onPagination={users.handlePagination}
          onUserClick={(id) => router.push(`/dashboard/usuarios/${id}`)}
          onStartCreate={() => {
            setShowFabOptions(false);
            setScreen("create");
          }}
          onToggleFab={() => setShowFabOptions((prev) => !prev)}
        />
      </div>
    );

  return <DashboardShell activeTab="users" profilePic={profilePic} userRole={userRole}>{content}</DashboardShell>;
}
