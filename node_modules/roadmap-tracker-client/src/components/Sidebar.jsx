import { useEffect } from "react";
import styles from "./Sidebar.module.css";
import { cx } from "../lib/utils";

const nav = [
  { id: "dashboard", label: "Dashboard" },
  { id: "tasks", label: "Tasks" },
  { id: "progress", label: "Progress" }
];

export default function Sidebar({ route, onNavigate, open, onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  return (
    <>
      <div className={cx(styles.backdrop, open && styles.backdropOpen)} onClick={onClose} />
      <aside className={cx(styles.sidebar, open && styles.open)}>
        <div className={styles.brand}>
          <div className={styles.logo} />
          <div>
            <div className={styles.title}>Roadmap</div>
            <div className={styles.subtitle}>Tracker</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {nav.map((i) => (
            <button
              key={i.id}
              className={cx(styles.navItem, route === i.id && styles.active)}
              onClick={() => onNavigate(i.id)}
            >
              <span className={styles.dot} />
              {i.label}
            </button>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.footerHint}>Tip: Press <span className={styles.kbd}>/</span> to focus search on Tasks.</div>
        </div>
      </aside>
    </>
  );
}

