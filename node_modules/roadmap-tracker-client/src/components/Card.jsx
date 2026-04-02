import styles from "./Card.module.css";
import { cx } from "../lib/utils";

export default function Card({ className, ...props }) {
  return <div className={cx(styles.card, className)} {...props} />;
}

