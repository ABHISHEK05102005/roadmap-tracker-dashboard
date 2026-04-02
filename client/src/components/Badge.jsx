import styles from "./Badge.module.css";
import { cx } from "../lib/utils";

export default function Badge({ tone = "neutral", children, className }) {
  return <span className={cx(styles.badge, styles[tone], className)}>{children}</span>;
}

