import { useEffect } from "react";
import styles from "./Topbar.module.css";
import Button from "./Button.jsx";

const titles = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  progress: "Progress"
};

export default function Topbar({ route, onOpenSidebar, theme, onToggleTheme, onRefresh, loading }) {
  useEffect(() => {
    function onKeyDown(e) {
      // Simple keyboard shortcut: r to refresh (when not typing)
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.isContentEditable))
        return;
      if (e.key.toLowerCase() === "r") onRefresh();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onRefresh]);

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.burger} onClick={onOpenSidebar} aria-label="Open sidebar">
          <span />
          <span />
          <span />
        </button>
        <div>
          <div className={styles.title}>{titles[route] || "Roadmap Tracker"}</div>
          <div className={styles.subtitle}>A lightweight, daily-use roadmap dashboard</div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onToggleTheme} title="Toggle theme">
          {theme === "dark" ? "Light" : "Dark"}
        </Button>
        <Button onClick={onRefresh} disabled={loading} title="Refresh (R)">
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>
    </header>
  );
}

