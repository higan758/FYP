import React, { useEffect, useState, useCallback } from "react";
import { http } from "../../../api/http";
import { endpoints } from "../../../api/endpoints";
import styles from "../../../styles/adminUsers.module.css";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await http.get(endpoints.adminUsers);
      setUsers(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function activate(id) {
    try {
      await http.put(endpoints.adminUserActivate(id), {});
      await load();
    } catch (err) {
      alert(err.message || "Failed to activate");
    }
  }

  async function deactivate(id) {
    try {
      await http.put(endpoints.adminUserDeactivate(id), {});
      await load();
    } catch (err) {
      alert(err.message || "Failed to deactivate");
    }
  }

  async function promoteToAdmin(id) {
    try {
      const res = await http.put(`/api/admin/users/${id}`, { role: "Admin" });
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, role: res.role || "Admin" } : u)));
    } catch (err) {
      alert(err.message || "Failed to promote to Admin");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await http.delete(endpoints.adminUserDelete(deleteId));
      setDeleteId(null);
      await load();
    } catch (err) {
      alert(err.message || "Failed to delete");
    }
  }

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (u.userName || u.fullName || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className={styles.pageWrap}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>👥 Manage Users</h1>
        <span className={styles.countBadge}>{users.length} total</span>
        <span className={styles.countBadgeActive}>{activeCount} active</span>
      </div>

      {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

      {/* Search */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Loading users...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <p className={styles.emptyText}>
            {search ? "No users match your search." : "No users found."}
          </p>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filtered.map((u) => {
            const uid = u.id ?? u.Id;
            const name = u.userName || u.fullName || u.email;
            const role = u.role || u.Role || "Student";
            const isAdmin = role.toLowerCase() === "admin";
            return (
              <div key={uid} className={styles.userCard}>
                {/* Avatar + Info */}
                <div className={styles.userTop}>
                  <div className={styles.avatar}>
                    {(name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{name}</div>
                    <div className={styles.userEmail}>{u.email}</div>
                  </div>
                </div>

                {/* Badges */}
                <div className={styles.badgeRow}>
                  <span className={`badge ${isAdmin ? "badge-warning" : ""}`}>{role}</span>
                  <span className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <button
                    className={`btn btn-small ${u.isActive ? "btn-secondary" : "btn-success"}`}
                    onClick={() => (u.isActive ? deactivate(uid) : activate(uid))}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                  {!isAdmin && (
                    <button className="btn btn-small btn-outline" onClick={() => promoteToAdmin(uid)}>
                      ⬆️ Promote
                    </button>
                  )}
                  <button className="btn btn-small btn-danger" onClick={() => setDeleteId(uid)}>
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className={styles.modalWrap} onClick={() => setDeleteId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>🗑️ Delete User</h3>
              <button className={styles.modalClose} onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <p className={styles.modalBody}>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
