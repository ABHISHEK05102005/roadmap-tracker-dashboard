import styles from "./Button.module.css";
import { cx } from "../lib/utils";

export default function Button({ variant = "primary", size = "md", className, ...props }) {
  return <button className={cx(styles.btn, styles[variant], styles[size], className)} {...props} />;
}

