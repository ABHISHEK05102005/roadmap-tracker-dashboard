import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./App.module.css";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Progress from "./pages/Progress.jsx";
import { getProgressChart, getStats, getTasks } from "./lib/api.js";

export default function App() {
  const [route, setRoute] = useState("dashboard"); // dashboard | tasks | progress
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [t, s, c] = await Promise.all([getTasks(), getStats(), getProgressChart(21)]);
      setTasks(t.tasks || []);
      setProgress(t.progress || {});
      setStats(s);
      setChart(c);
    } catch (e) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const page = useMemo(() => {
    const common = { tasks, progress, stats, chart, refreshAll, loading, error };
    if (route === "tasks") return <Tasks {...common} />;
    if (route === "progress") return <Progress {...common} />;
    return <Dashboard {...common} />;
  }, [chart, error, loading, progress, refreshAll, route, stats, tasks]);

  return (
    <div className={styles.shell}>
      <Sidebar
        route={route}
        onNavigate={(r) => {
          setRoute(r);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={styles.main}>
        <Topbar
          route={route}
          onOpenSidebar={() => setSidebarOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          onRefresh={refreshAll}
          loading={loading}
        />
        <div className={styles.content}>{page}</div>
      </div>
    </div>
  );
}

