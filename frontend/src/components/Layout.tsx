import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../context/authStore";
import styles from "./Layout.module.css";

const ROLE_LABELS: Record<string, string> = { ADMIN: "Admin", EDITOR: "Editor", VIEWER: "Visitante" };
const ROLE_CLASS: Record<string, string> = { ADMIN: "tag-admin", EDITOR: "tag-editor", VIEWER: "tag-viewer" };

export default function Layout() {
  const { user, logout, can } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.logo}>
          CifraStudio
        </NavLink>

        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.navActive : styles.navLink}>
            Cifras
          </NavLink>
          {can(["ADMIN"]) && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? styles.navActive : styles.navLink}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className={styles.right}>
          {user && (
            <div className={styles.userBadge}>
              <span className={styles.userName}>{user.name}</span>
              <span className={`tag ${ROLE_CLASS[user.role] || "tag-viewer"}`}>
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
