async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch {
      // ignore
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export function getTasks() {
  return request("/tasks");
}

export function getStats() {
  return request("/stats");
}

export function getProgressChart(days = 14) {
  return request(`/charts/progress?days=${encodeURIComponent(days)}`);
}

export function completeTask(taskId) {
  return request("/complete", { method: "POST", body: JSON.stringify({ taskId }) });
}

export function uncompleteTask(taskId) {
  return request("/uncomplete", { method: "POST", body: JSON.stringify({ taskId }) });
}

