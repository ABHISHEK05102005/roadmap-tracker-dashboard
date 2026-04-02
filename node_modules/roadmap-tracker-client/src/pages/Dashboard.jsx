import { useMemo } from "react";
import Card from "../components/Card.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import Badge from "../components/Badge.jsx";
import styles from "./Page.module.css";

function todaysTasks(tasks, progress, min = 3, max = 5) {
  const incomplete = tasks
    .filter((t) => progress?.[t.id]?.status !== "done")
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const picked = incomplete.slice(0, max);
  // Ensure at least min if available
  if (picked.length < min) return incomplete.slice(0, min);
  return picked;
}

export default function Dashboard({ tasks, progress, stats, chart, loading, error }) {
  const today = useMemo(() => todaysTasks(tasks, progress), [progress, tasks]);
  const top = stats || { total: tasks.length, completed: 0, remaining: tasks.length, percentage: 0, streak: 0 };

  return (
    <div className={styles.grid}>
      {error ? <div className={styles.error}>{error}</div> : null}

      <Card>
        <ProgressBar
          percentage={top.percentage}
          labelLeft={
            <div>
              <div style={{ fontWeight: 680, letterSpacing: "-0.02em" }}>Progress</div>
              <div style={{ marginTop: 3 }}>
                <span style={{ color: "var(--muted)" }}>
                  {top.completed} completed · {top.remaining} remaining
                </span>
              </div>
            </div>
          }
          labelRight={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge tone="blue">{top.percentage}%</Badge>
              <Badge tone={top.streak > 0 ? "orange" : "neutral"}>
                🔥 {top.streak}
              </Badge>
            </div>
          }
        />
      </Card>

      <div className={styles.grid2}>
        <Card>
          <div className={styles.hRow}>
            <div>
              <div className={styles.hTitle}>Today’s Tasks</div>
              <div className={styles.hSub}>3–5 highest priority unfinished tasks</div>
            </div>
          </div>
          <div style={{ padding: "0 14px 14px" }}>
            {loading ? (
              <div className={styles.empty}>Loading…</div>
            ) : today.length === 0 ? (
              <div className={styles.empty}>You’re done. Add more tasks to keep momentum.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {today.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: "12px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.04)"
                    }}
                  >
                    <div style={{ fontWeight: 650, letterSpacing: "-0.01em" }}>{t.title}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge tone="purple">{t.category}</Badge>
                      <Badge tone="blue">{t.type}</Badge>
                      <Badge tone="neutral">Priority {t.index ?? "-"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className={styles.hRow}>
            <div>
              <div className={styles.hTitle}>Insights</div>
              <div className={styles.hSub}>Your progress trend and distribution</div>
            </div>
          </div>
          <div className={styles.empty}>
            Go to <b>Progress</b> to see charts. (Loaded {chart?.series?.length ?? 0} datapoints.)
          </div>
        </Card>
      </div>
    </div>
  );
}

