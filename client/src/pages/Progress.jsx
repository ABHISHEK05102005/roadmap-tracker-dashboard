import { useMemo } from "react";
import Card from "../components/Card.jsx";
import styles from "./Page.module.css";
import ProgressBar from "../components/ProgressBar.jsx";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function Progress({ tasks, stats, chart, loading, error }) {
  const top = stats || { total: tasks.length, completed: 0, remaining: tasks.length, percentage: 0, streak: 0 };

  const lineData = useMemo(() => {
    const series = chart?.series || [];
    return {
      labels: series.map((p) => p.date.slice(5)),
      datasets: [
        {
          label: "Completion %",
          data: series.map((p) => p.percentage),
          borderColor: "rgba(96,165,250,0.95)",
          backgroundColor: "rgba(96,165,250,0.12)",
          tension: 0.35,
          fill: true,
          pointRadius: 2
        }
      ]
    };
  }, [chart]);

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { intersect: false, mode: "index" }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { color: "rgba(255,255,255,0.55)" },
          grid: { color: "rgba(255,255,255,0.08)" }
        },
        x: {
          ticks: { color: "rgba(255,255,255,0.55)" },
          grid: { color: "rgba(255,255,255,0.06)" }
        }
      }
    }),
    []
  );

  const doughnutData = useMemo(
    () => ({
      labels: ["Completed", "Remaining"],
      datasets: [
        {
          data: [top.completed, top.remaining],
          backgroundColor: ["rgba(52,211,153,0.85)", "rgba(255,255,255,0.10)"],
          borderColor: ["rgba(52,211,153,0.25)", "rgba(255,255,255,0.10)"],
          borderWidth: 1
        }
      ]
    }),
    [top.completed, top.remaining]
  );

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "rgba(255,255,255,0.65)", boxWidth: 12 }
        }
      },
      cutout: "68%"
    }),
    []
  );

  return (
    <div className={styles.grid}>
      {error ? <div className={styles.error}>{error}</div> : null}

      <Card>
        <ProgressBar
          percentage={top.percentage}
          labelLeft={
            <div>
              <div style={{ fontWeight: 680, letterSpacing: "-0.02em" }}>Overall progress</div>
              <div style={{ marginTop: 3, color: "var(--muted)" }}>
                {top.completed} completed · {top.remaining} remaining
              </div>
            </div>
          }
          labelRight={<div style={{ color: "var(--muted)" }}>🔥 {top.streak} day streak</div>}
        />
      </Card>

      <div className={styles.grid2}>
        <Card>
          <div className={styles.hRow}>
            <div>
              <div className={styles.hTitle}>Progress over time</div>
              <div className={styles.hSub}>Rolling completion percentage</div>
            </div>
          </div>
          <div style={{ padding: "0 14px 16px" }}>
            {loading ? <div className={styles.empty}>Loading…</div> : <Line data={lineData} options={lineOptions} />}
          </div>
        </Card>

        <Card>
          <div className={styles.hRow}>
            <div>
              <div className={styles.hTitle}>Completion distribution</div>
              <div className={styles.hSub}>Completed vs remaining</div>
            </div>
          </div>
          <div style={{ padding: "0 14px 18px" }}>
            {loading ? <div className={styles.empty}>Loading…</div> : <Doughnut data={doughnutData} options={doughnutOptions} />}
          </div>
        </Card>
      </div>
    </div>
  );
}

