import styles from "./ProgressBar.module.css";
import { clamp } from "../lib/utils";

export default function ProgressBar({ percentage = 0, labelLeft, labelRight }) {
  const p = clamp(Number(percentage) || 0, 0, 100);
  return (
    <div className={styles.wrap}>
      <div className={styles.labels}>
        <div className={styles.left}>{labelLeft}</div>
        <div className={styles.right}>{labelRight}</div>
      </div>
      <div className={styles.track} role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
        <div className={styles.fill} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

