import { useMemo } from "react";
import styles from "./TaskCard.module.css";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";

export default function TaskCard({ task, progressEntry, onToggleDone, busy }) {
  const done = progressEntry?.status === "done";
  const statusTone = done ? "green" : "neutral";
  const statusLabel = done ? "Done" : "Not done";

  const statusDotStyle = useMemo(
    () => ({
      background: done ? "rgba(52, 211, 153, 0.95)" : "rgba(255, 255, 255, 0.25)"
    }),
    [done]
  );

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.title}>{task.title}</div>
          <div className={styles.meta}>
            <span className={styles.dot} style={statusDotStyle} />
            <span className={styles.metaText}>{statusLabel}</span>
          </div>
        </div>

        <div className={styles.badges}>
          <Badge tone="purple">{task.category}</Badge>
          <Badge tone="blue">{task.type}</Badge>
          <Badge tone={statusTone}>{statusLabel}</Badge>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.priority}>Priority: {task.index ?? "-"}</div>
        <Button
          size="sm"
          variant={done ? "ghost" : "primary"}
          onClick={() => onToggleDone(task.id, done)}
          disabled={busy}
          title={done ? "Undo (U on selected)" : "Mark done (D on selected)"}
        >
          {done ? "Undo" : "Mark done"}
        </Button>
      </div>
    </div>
  );
}

