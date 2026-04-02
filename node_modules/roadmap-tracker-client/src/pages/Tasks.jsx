import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import FiltersBar from "../components/FiltersBar.jsx";
import TaskCard from "../components/TaskCard.jsx";
import styles from "./Page.module.css";
import { completeTask, uncompleteTask } from "../lib/api.js";

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
}

export default function Tasks({ tasks, progress, refreshAll, loading, error }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all"); // all | done | todo
  const [sort, setSort] = useState("priority"); // priority | category | completion

  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");

  const searchRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "/" && !(e.target?.tagName === "INPUT" || e.target?.isContentEditable)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const categories = useMemo(() => uniqSorted(tasks.map((t) => t.category)), [tasks]);
  const types = useMemo(() => uniqSorted(tasks.map((t) => t.type)), [tasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const withStatus = tasks.filter((t) => {
      const p = progress?.[t.id];
      const done = p?.status === "done";
      if (status === "done" && !done) return false;
      if (status === "todo" && done) return false;
      if (category !== "all" && t.category !== category) return false;
      if (type !== "all" && t.type !== type) return false;
      if (q && !String(t.title).toLowerCase().includes(q)) return false;
      return true;
    });

    const sorted = withStatus.slice().sort((a, b) => {
      if (sort === "category") {
        const c = String(a.category).localeCompare(String(b.category));
        if (c !== 0) return c;
        return (a.index ?? 0) - (b.index ?? 0);
      }
      if (sort === "completion") {
        const ad = progress?.[a.id]?.status === "done" ? 1 : 0;
        const bd = progress?.[b.id]?.status === "done" ? 1 : 0;
        if (ad !== bd) return bd - ad; // done first
        return (a.index ?? 0) - (b.index ?? 0);
      }
      return (a.index ?? 0) - (b.index ?? 0);
    });

    return sorted;
  }, [category, progress, search, sort, status, tasks, type]);

  const onToggleDone = useCallback(
    async (taskId, isDone) => {
      setBusyId(taskId);
      setToast("");
      try {
        if (isDone) await uncompleteTask(taskId);
        else await completeTask(taskId);
        await refreshAll();
      } catch (e) {
        setToast(e?.message || "Action failed");
      } finally {
        setBusyId("");
      }
    },
    [refreshAll]
  );

  return (
    <div className={styles.grid}>
      {error ? <div className={styles.error}>{error}</div> : null}
      {toast ? <div className={styles.error}>{toast}</div> : null}

      <Card>
        <div className={styles.hRow}>
          <div>
            <div className={styles.hTitle}>Tasks</div>
            <div className={styles.hSub}>Search, filter, and sort your roadmap</div>
          </div>
        </div>

        <div style={{ padding: "0 14px 0" }}>
          <FiltersBar
            search={search}
            onSearch={setSearch}
            inputRef={searchRef}
            categories={categories}
            types={types}
            status={status}
            onStatus={setStatus}
            category={category}
            onCategory={setCategory}
            type={type}
            onType={setType}
            sort={sort}
            onSort={setSort}
          />
        </div>
      </Card>

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No tasks match your filters.</div>
        ) : (
          filtered.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              progressEntry={progress?.[t.id]}
              onToggleDone={onToggleDone}
              busy={busyId === t.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

