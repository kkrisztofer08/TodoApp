// App.jsx
import "./App.css";
import React from "react";

export default function App() {
  const [rows, setRows] = React.useState([]);
  const [cols, setCols] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // filter state
  const [filter, setFilter] = React.useState("All");

  // modal state
  const [isOpen, setIsOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    deadline: "", // datetime-local string (YYYY-MM-DDTHH:mm)
  });
  const resetForm = () =>
    setForm({ title: "", description: "", deadline: "" });

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8080/todos", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setRows(data);

        // oszlopok összegyűjtése
        let keys = data.length ? Object.keys(data[0]) : [];
        for (const r of data) {
          for (const k of Object.keys(r)) {
            if (!keys.includes(k)) keys.push(k);
          }
        }
        setCols(keys);
      } catch (e) {
        setError(e.message || "Hiba történt");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- COMPLETED UPDATE (optimista frissítés + rollback hibánál) ---
  const updateCompleted = async (id, nextCompleted) => {
    // optimista UI frissítés
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: nextCompleted } : r))
    );

    try {
      const res = await fetch(`http://localhost:8080/todos/${id}/completed`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ completed: nextCompleted }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // ha a backend visszaadja a frissített todo-t, merge-eljük (nem kötelező)
      const saved = await res.json().catch(() => null);
      if (saved && typeof saved === "object") {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...saved } : r)));
      }
    } catch (e) {
      // rollback + hiba kiírása
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completed: !nextCompleted } : r))
      );
      setError(e.message || "Frissítési hiba");
    }
  };

  // cella megjelenítés (általános)
  const renderCell = (key, value) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  // gombok
  const AddTodoBtn = ({ onClick }) => {
    return (
      <button className="addbar-input" onClick={onClick}>
        Add a new to-do
      </button>
    );
  };

  const AddFilterBtns = ({ value, onChange }) => {
    const Tab = ({ label }) => (
      <button
        className={"addbar-input" + (value === label ? " tab active" : " tab")}
        onClick={() => onChange(label)}
      >
        {label}
      </button>
    );

    return (
      <div className="tabs">
        <Tab label="All" />
        <Tab label="To-do" />
        <Tab label="Completed" />
      </div>
    );
  };

  // szűrt sorok
  const filteredRows = rows.filter((row) => {
    if (filter === "All") return true;
    if (filter === "To-do") return !row.completed;
    if (filter === "Completed") return !!row.completed;
    return true;
  });

  // új todo mentése
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        title: form.title?.trim() || "",
        description: form.description?.trim() || "",
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        completed: false,
        new: false,
      };

      const res = await fetch("http://localhost:8080/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();

      // lista frissítése (prepend)
      setRows((prev) => [saved, ...prev]);

      // új kulcsok esetén bővítjük a cols-t
      setCols((prev) => {
        const next = [...prev];
        for (const k of Object.keys(saved)) {
          if (!next.includes(k)) next.push(k);
        }
        return next;
      });

      setIsOpen(false);
      resetForm();
    } catch (e2) {
      setError(e2.message || "Mentési hiba");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap">
      <div className="card">
        <h1 className="title">TODOs</h1>

        <AddTodoBtn onClick={() => setIsOpen(true)} />
        <AddFilterBtns value={filter} onChange={setFilter} />

        {loading && <p>Betöltés…</p>}
        {error && <p style={{ color: "crimson" }}>Hiba: {error}</p>}

        <div className="table-shell">
          <table className="table">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr key={row.id ?? i}>
                  {cols.map((c) => (
                    <td key={c}>
                      {c === "completed" ? (
                        <input
                          type="checkbox"
                          checked={!!row.completed}
                          onChange={(e) =>
                            updateCompleted(row.id, e.target.checked)
                          }
                        />
                      ) : (
                        renderCell(c, row[c])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && !error && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={cols.length || 1} className="empty">
                    Nincs adat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="footer">
          Krisztofer Kőrösi © 2025 all rights reserved
        </footer>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.25)",
            display: "grid",
            placeItems: "center",
            padding: 24,
            zIndex: 50,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="modal"
            style={{
              width: "min(560px, 100%)",
              background: "var(--panel-strong)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow)",
              border: "1px solid #ffffff66",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Add new to-do</h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: 12 }}>
                <label>
                  <span className="visually-hidden">Title</span>
                  <input
                    className="addbar-input"
                    style={{ width: "100%" }}
                    type="text"
                    placeholder="Title"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </label>

                <label>
                  <span className="visually-hidden">Description</span>
                  <input
                    className="addbar-input"
                    style={{ width: "100%" }}
                    type="text"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </label>

                <label>
                  <span className="visually-hidden">Deadline</span>
                  <input
                    className="addbar-input"
                    style={{ width: "100%" }}
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deadline: e.target.value }))
                    }
                  />
                </label>
              </div>

              <div
                className="modal-actions"
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                  marginTop: 18,
                }}
              >
                <button
                  type="button"
                  className="tab"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="tab active">
                  Save to-do
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
