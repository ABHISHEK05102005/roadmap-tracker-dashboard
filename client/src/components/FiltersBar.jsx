import { useMemo } from "react";
import styles from "./FiltersBar.module.css";

export default function FiltersBar({
  search,
  onSearch,
  inputRef,
  categories,
  types,
  status,
  onStatus,
  category,
  onCategory,
  type,
  onType,
  sort,
  onSort
}) {
  const statusOptions = useMemo(
    () => [
      { id: "all", label: "All" },
      { id: "done", label: "Done" },
      { id: "todo", label: "Not done" }
    ],
    []
  );

  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <input
          className={styles.search}
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          ref={inputRef}
        />
        <div className={styles.hint}>Press /</div>
      </div>

      <select className={styles.select} value={category} onChange={(e) => onCategory(e.target.value)}>
        <option value="all">Category</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select className={styles.select} value={type} onChange={(e) => onType(e.target.value)}>
        <option value="all">Type</option>
        {types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select className={styles.select} value={status} onChange={(e) => onStatus(e.target.value)}>
        {statusOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>

      <select className={styles.select} value={sort} onChange={(e) => onSort(e.target.value)}>
        <option value="priority">Sort: Priority</option>
        <option value="category">Sort: Category</option>
        <option value="completion">Sort: Completion</option>
      </select>
    </div>
  );
}

