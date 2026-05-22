import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../services/api";
import AdminNavbar from "../../components/layout/AdminNavbar";
import ConfirmActionModal from "../../components/ui/ConfirmActionModal";
import Button from "../../components/ui/Button";
import PageState from "../../components/ui/PageState";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [pendingModalAction, setPendingModalAction] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(currentUser?.role);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await API.get("/admin/users");
      setUsers(data.items || []);
    } catch (error) {
      console.error(error);
      setUsers([]);
      setError(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const deleteUser = async (id) => {
    setDeletingId(id);
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const promoteUser = async (id) => {
    setProcessingId(id);
    try {
      await API.put(`/admin/promote/${id}`);
      toast.success("User promoted to admin");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to promote user");
    } finally {
      setProcessingId(null);
    }
  };

  const suspendUser = async (id) => {
    setProcessingId(id);
    try {
      await API.put(`/admin/suspend/${id}`);
      toast.success("User suspended");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to suspend user");
    } finally {
      setProcessingId(null);
    }
  };

  const unsuspendUser = async (id) => {
    setProcessingId(id);
    try {
      await API.put(`/admin/users/${id}/unsuspend`);
      toast.success("User unsuspended");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to unsuspend user");
    } finally {
      setProcessingId(null);
    }
  };

  const openSuspensionModal = (user) => {
    const action = user.isSuspended ? "unsuspend" : "suspend";
    setPendingModalAction({
      type: "suspension",
      userId: user._id,
      name: user.name,
      email: user.email,
      action,
      label: action === "unsuspend" ? "Unsuspend" : "Suspend"
    });
  };

  const openRemoveAdminModal = (user) => {
    setPendingModalAction({
      type: "remove-admin",
      userId: user._id,
      name: user.name,
      email: user.email,
      action: "remove-admin",
      label: "Remove Admin"
    });
  };

  const closeSuspensionModal = () => {
    if (processingId) return;
    setPendingModalAction(null);
  };

  const confirmSuspensionAction = async () => {
    if (!pendingModalAction) return;

    const { userId, action, type } = pendingModalAction;
    setPendingModalAction(null);

    if (action === "remove-admin" || type === "remove-admin") {
      await demoteAdmin(userId);
      return;
    }

    if (action === "unsuspend") {
      await unsuspendUser(userId);
      return;
    }

    await suspendUser(userId);
  };

  const demoteAdmin = async (id) => {
    setProcessingId(id);
    try {
      await API.put(`/admin/demote/${id}`);
      toast.success("Admin role removed");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to remove admin role");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <AdminNavbar />

      <div className="p-6">
        <h2 className="text-xl mb-4">Users</h2>

        <input
          type="text"
          placeholder="Search users by name or email"
          className="input mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <PageState
            variant="loading"
            title="Loading users"
            description="Fetching the current user directory and admin controls."
          />
        ) : error ? (
          <PageState
            variant="error"
            title="Users unavailable"
            description={error}
            actionLabel="Try again"
            onAction={fetchUsers}
          />
        ) : filteredUsers.length === 0 ? (
          <PageState
            variant="empty"
            title={search ? "No matching users" : "No users found"}
            description={search ? "Try a different name or email filter." : "No accounts match the current query."}
          />
        ) : (
          filteredUsers.map((u) => (
            <div key={u._id} className="card mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Role: {u.role} | Suspended: {u.isSuspended ? "Yes" : "No"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                {isAdmin && u.role === "USER" && !u.isSuspended && (
                  <Button onClick={() => promoteUser(u._id)} loading={processingId === u._id}>
                    Make Admin
                  </Button>
                )}

                {isAdmin && u.role !== "SUPER_ADMIN" && (
                  <Button
                    onClick={() => openSuspensionModal(u)}
                    variant={u.isSuspended ? "secondary" : "danger"}
                    loading={processingId === u._id}
                  >
                    {u.isSuspended ? "Unsuspend" : "Suspend"}
                  </Button>
                )}

                {isSuperAdmin && u.role === "ADMIN" && (
                  <Button onClick={() => openRemoveAdminModal(u)} variant="secondary" loading={processingId === u._id}>
                    Remove Admin
                  </Button>
                )}

                {isSuperAdmin && (
                  <Button onClick={() => deleteUser(u._id)} variant="danger" loading={deletingId === u._id} disabled={processingId === u._id}>
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmActionModal
        open={Boolean(pendingModalAction)}
        title={pendingModalAction?.label ? `${pendingModalAction.label} account?` : "Confirm action?"}
        description={
          pendingModalAction?.action === "remove-admin"
            ? `Confirm removal of admin access for ${pendingModalAction.name}${pendingModalAction.email ? ` (${pendingModalAction.email})` : ""}. This will downgrade the account to a regular user.`
            : pendingModalAction?.action
            ? `Confirm ${pendingModalAction.action} for ${pendingModalAction.name}${pendingModalAction.email ? ` (${pendingModalAction.email})` : ""}. This changes the account access state.`
            : "Confirm this account action."
        }
        confirmLabel={
          pendingModalAction?.action === "unsuspend"
            ? "Confirm Unsuspend"
            : pendingModalAction?.action === "remove-admin"
            ? "Confirm Remove Admin"
            : "Confirm Suspend"
        }
        confirmVariant={pendingModalAction?.action === "unsuspend" ? "secondary" : "danger"}
        onConfirm={confirmSuspensionAction}
        onCancel={closeSuspensionModal}
        confirmDisabled={Boolean(processingId)}
        cancelDisabled={Boolean(processingId)}
      />
    </>
  );
}
