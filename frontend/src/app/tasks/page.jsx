"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken, clearToken } from "@/lib/api";
import ChatBot from "./ChatBot";

export default function TasksPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  // form state (dipakai untuk add/edit)
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Todo",
    deadline: "",
    assignee_id: "",
  });

  const [editingId, setEditingId] = useState(null); // null = mode add

  async function loadAll() {
    setError("");
    setLoading(true);
    try {
      const [tasksData, usersData] = await Promise.all([
        apiFetch("/tasks"),
        apiFetch("/users"),
      ]);
      setTasks(tasksData);
      setUsers(usersData);

      // set default assignee kalau belum ada (biar dropdown tidak kosong)
      if (!form.assignee_id && usersData.length > 0) {
        setForm((prev) => ({ ...prev, assignee_id: String(usersData[0].id) }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    loadAll();
  }, []);

  function logout() {
    clearToken();
    router.push("/login");
  }

  function resetForm() {
    setEditingId(null);
    setForm((prev) => ({
      title: "",
      description: "",
      status: "Todo",
      deadline: "",
      assignee_id: prev.assignee_id || "",
    }));
  }

  function startEdit(task) {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "Todo",
      deadline: (task.deadline || "").slice(0, 10),
      assignee_id: String(task.assignee_id || task.assignee?.id || ""),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitForm(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Title wajib diisi.");
    if (!form.assignee_id) return setError("Assignee wajib dipilih.");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      deadline: form.deadline, // kirim "YYYY-MM-DD"
      assignee_id: Number(form.assignee_id),
    };

    try {
      if (editingId) {
        await apiFetch(`/tasks/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/tasks", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await loadAll();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(id) {
    const ok = confirm(`Hapus task id ${id}?`);
    if (!ok) return;

    setError("");
    try {
      await apiFetch(`/tasks/${id}`, { method: "DELETE" });
      await loadAll();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeStatus(id, newStatus) {
    setError("");
    try {
      const t = tasks.find((x) => x.id === id);
      if (!t) return;

      const payload = {
        title: t.title,
        description: t.description,
        status: newStatus,
        deadline: (t.deadline || "").slice(0, 10),
        assignee_id: Number(t.assignee_id || t.assignee?.id),
      };

      await apiFetch(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function getStatusBadge(status) {
    const styles = {
      "Todo": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
      "Done": "bg-green-100 text-green-800 border-green-200"
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  }

  const filteredTasks = filterStatus === "All" 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">📋 Task Manager</h1>
              <p className="text-indigo-100 text-sm">Kelola semua tugas Anda dengan mudah</p>
            </div>
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 border border-white/30"
            >
            Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {error && (
          <div className="mb-6 text-sm text-red-700 bg-red-50 p-4 rounded-xl border-l-4 border-red-500 shadow-sm flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* FORM ADD / EDIT */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {editingId ? (
                <><span className="text-2xl">✏️</span> Edit Task <span className="text-sm font-normal text-gray-500">(ID: {editingId})</span></>
              ) : (
                <><span className="text-2xl"></span> Tambah Task Baru</>
              )}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm border-2 border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                ❌ Batal
              </button>
            )}
          </div>

          <form onSubmit={submitForm} className="grid gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Judul Task </label>
              <input
                className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-3 transition-all outline-none text-gray-900 bg-white"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Belajar Go Programming"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📄 Deskripsi</label>
              <textarea
                className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-3 transition-all outline-none resize-none text-gray-900 bg-white"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Contoh: Membuat aplikasi CRUD dengan Golang dan PostgreSQL"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🎯 Status</label>
                <select
                  className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-3 transition-all outline-none bg-white text-gray-900"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Deadline</label>
                <input
                  type="date"
                  className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-3 transition-all outline-none text-gray-900 bg-white"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Assignee *</label>
                <select
                  className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-3 transition-all outline-none bg-white text-gray-900"
                  value={form.assignee_id}
                  onChange={(e) =>
                    setForm({ ...form, assignee_id: e.target.value })
                  }
                >
                  {users.length === 0 ? (
                    <option value="">(users kosong)</option>
                  ) : (
                    users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3.5 rounded-lg font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {editingId ? "💾 Update Task" : "✨ Buat Task Baru"}
            </button>
          </form>
        </div>

        {/* LIST TASKS */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📑</span> Daftar Task
              </h2>
              <div className="text-sm text-gray-500 mt-1">
                {loading ? "⏳ Loading..." : `Total: ${filteredTasks.length} dari ${tasks.length} task`}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {["All", "Todo", "In Progress", "Done"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    filterStatus === status
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "All" ? "🔍 Semua" : status}
                </button>
              ))}
              <button
                onClick={loadAll}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">
                {tasks.length === 0 ? "Belum ada task. Yuk buat task pertama!" : `Tidak ada task dengan status "${filterStatus}"`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((t) => (
                <div key={t.id} className="border-2 border-gray-200 hover:border-indigo-300 rounded-xl p-5 transition-all duration-200 hover:shadow-lg bg-gradient-to-r from-white to-gray-50">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-gray-800">{t.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(t.status)}`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{t.description || "Tidak ada deskripsi"}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-lg">📅</span>
                          <span className="font-medium">Deadline:</span>
                          <span className="text-gray-800 font-semibold">{(t.deadline || "").slice(0, 10) || "Tidak ada"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-lg">👤</span>
                          <span className="font-medium">Assignee:</span>
                          <span className="text-gray-800 font-semibold">{t.assignee?.name || "-"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 min-w-[200px] shrink-0">
                      <select
                        className="flex-1 lg:w-full border-2 border-gray-300 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm font-medium transition-all outline-none bg-white text-gray-900"
                        value={t.status}
                        onChange={(e) => changeStatus(t.id, e.target.value)}
                      >
                        <option>Todo</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="flex-1 lg:w-full text-sm border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTask(t.id)}
                        className="flex-1 lg:w-full text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}
