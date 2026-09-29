"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Save,
  AlertCircle,
  FolderPlus,
  FolderTree,
  Share2,
  MoreVertical,
  Check,
  Copy,
  Smartphone,
  Search,
  X,
  GripVertical,
  Sun,
  Moon,
  Folder,
} from "lucide-react";

interface LinkItem {
  id: string;
  type?: "link" | "header";
  title: string;
  url?: string;
  thumbnail?: string | null;
  isActive: boolean;
  order: number;
  clicks: number;
}

interface ProfileData {
  title: string;
  bio: string;
  avatarUrl: string;
  theme: string;
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Data States
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [profile, setProfile] = useState<ProfileData>({
    title: "SmartLink",
    bio: "Subbidang Pendataan Penilaian PBB dan BPHTB",
    avatarUrl: "/bapenda.png",
    theme: "dark",
  });

  // Modal / Form States (Link)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newThumbnail, setNewThumbnail] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Modal / Form States (Header Kategori)
  const [isAddHeaderModalOpen, setIsAddHeaderModalOpen] = useState(false);
  const [newHeaderTitle, setNewHeaderTitle] = useState("");
  const [newHeaderIsActive, setNewHeaderIsActive] = useState(true);

  // Edit Modal State
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  // Profile Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profTitle, setProfTitle] = useState("");
  const [profBio, setProfBio] = useState("");
  const [profAvatar, setProfAvatar] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");

  // Preview Phone States
  const [previewSearch, setPreviewSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Filter Tab State ("all" | "active" | "inactive")
  const [filterTab, setFilterTab] = useState<"all" | "active" | "inactive">("all");

  // Theme State ("dark" | "light")
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("smartlink_theme", nextTheme);
  };

  // Notification Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    checkAuth();
    const savedTheme = localStorage.getItem("smartlink_theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      if (data.isAdmin) {
        setIsAdmin(true);
        loadAdminData();
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const linksRes = await fetch("/api/links?all=true");
      if (linksRes.ok) {
        const linksJson = await linksRes.json();
        setLinks(linksJson.links || []);
      }

      const profRes = await fetch("/api/profile");
      if (profRes.ok) {
        const profJson = await profRes.json();
        if (profJson.profile) {
          setProfile(profJson.profile);
          setProfTitle(profJson.profile.title || "");
          setProfBio(profJson.profile.bio || "");
          setProfAvatar(profJson.profile.avatarUrl || "");
        }
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Kata sandi salah. Silakan coba lagi.");
      } else {
        setIsAdmin(true);
        setPassword("");
        loadAdminData();
        showToast("Login admin berhasil!");
      }
    } catch (err) {
      setLoginError("Terjadi gangguan koneksi.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAdmin(false);
      showToast("Berhasil keluar.");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Reorder Handler (Move Up / Move Down)
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const [movedItem] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, movedItem);

    setLinks(newLinks);

    try {
      const linkIds = newLinks.map((l) => l.id);
      const res = await fetch("/api/links/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkIds }),
      });
      if (res.ok) {
        showToast("Urutan item berhasil diperbarui");
      }
    } catch (err) {
      console.error("Reorder failed:", err);
      showToast("Gagal menyimpan urutan");
      loadAdminData();
    }
  };

  // Drag & Drop Reorder Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("text/plain");
    const fromIndex =
      dataStr !== "" && !isNaN(parseInt(dataStr, 10))
        ? parseInt(dataStr, 10)
        : draggedIndex;

    if (fromIndex === null || isNaN(fromIndex) || fromIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const isHeaderFolder = links[fromIndex]?.type === "header";
    let movedTitle = links[fromIndex]?.title;
    let toastDetail = "";

    let newLinks = [...links];

    if (isHeaderFolder) {
      // Hitung semua item yang berada di dalam folder ini (header + link sampai header berikutnya)
      let folderEndIndex = fromIndex + 1;
      while (folderEndIndex < links.length && links[folderEndIndex].type !== "header") {
        folderEndIndex++;
      }
      const folderCount = folderEndIndex - fromIndex;
      const childCount = folderCount - 1;

      // Jika drop ke dalam foldernya sendiri, abaikan
      if (targetIndex >= fromIndex && targetIndex < folderEndIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      const targetItem = links[targetIndex];
      // Angkat seluruh 1 folder
      const folder = newLinks.splice(fromIndex, folderCount);

      // Cari posisi item tujuan di sisa array
      const targetIndexInRemaining = newLinks.findIndex((l) => l.id === targetItem.id);
      if (targetIndexInRemaining === -1) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      const insertAt =
        targetIndex > fromIndex
          ? targetIndexInRemaining + 1
          : targetIndexInRemaining;

      newLinks.splice(insertAt, 0, ...folder);
      toastDetail = `Folder "${movedTitle}" (${childCount} tautan) berhasil dipindahkan bersama`;
    } else {
      const [movedItem] = newLinks.splice(fromIndex, 1);
      newLinks.splice(targetIndex, 0, movedItem);
      toastDetail = `Urutan diperbarui: "${movedItem.title}" ke #${targetIndex + 1}`;
    }

    setLinks(newLinks);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      const linkIds = newLinks.map((l) => l.id);
      const res = await fetch("/api/links/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkIds }),
      });
      if (res.ok) {
        showToast(toastDetail);
      } else {
        showToast("Gagal menyimpan urutan");
        loadAdminData();
      }
    } catch (err) {
      console.error("Reorder failed:", err);
      showToast("Gagal menyimpan urutan");
      loadAdminData();
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (link: LinkItem) => {
    const updatedStatus = !link.isActive;
    const oldLinks = [...links];

    // Optimistic UI update on both manager and preview!
    setLinks(
      links.map((l) =>
        l.id === link.id ? { ...l, isActive: updatedStatus } : l
      )
    );

    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });

      if (!res.ok) {
        setLinks(oldLinks);
        showToast("Gagal mengubah status");
      } else {
        showToast(
          updatedStatus
            ? "Item diaktifkan (tampil di pratinjau & publik)"
            : "Item dinonaktifkan (disembunyikan dari publik)"
        );
      }
    } catch (err) {
      setLinks(oldLinks);
      showToast("Koneksi gagal saat mengubah status");
    }
  };

  // Quick Remove Thumbnail Handler
  const handleQuickRemoveThumbnail = async (link: LinkItem) => {
    if (!confirm(`Hapus icon/thumbnail untuk "${link.title}"?`)) return;

    const oldLinks = [...links];
    setLinks(links.map((l) => (l.id === link.id ? { ...l, thumbnail: null } : l)));

    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thumbnail: null }),
      });

      if (!res.ok) {
        setLinks(oldLinks);
        showToast("Gagal menghapus thumbnail");
      } else {
        showToast(`Thumbnail "${link.title}" berhasil dihapus`);
      }
    } catch (err) {
      setLinks(oldLinks);
      console.error("Remove thumbnail error:", err);
    }
  };

  // Add Link Handler
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    setFormSubmitting(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "link",
          title: newTitle.trim(),
          url: newUrl.trim(),
          thumbnail: newThumbnail.trim() || null,
          isActive: newIsActive,
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewUrl("");
        setNewThumbnail("");
        setNewIsActive(true);
        setIsAddModalOpen(false);
        loadAdminData();
        showToast("Tautan baru berhasil ditambahkan!");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menambahkan link");
      }
    } catch (err) {
      console.error("Add link error:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Add Header Kategori Handler
  const handleAddHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeaderTitle.trim()) return;

    setFormSubmitting(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "header",
          title: newHeaderTitle.trim(),
          isActive: newHeaderIsActive,
        }),
      });

      if (res.ok) {
        setNewHeaderTitle("");
        setNewHeaderIsActive(true);
        setIsAddHeaderModalOpen(false);
        loadAdminData();
        showToast("Header kategori berhasil ditambahkan!");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menambahkan header");
      }
    } catch (err) {
      console.error("Add header error:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Edit Link / Header Handler
  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    setFormSubmitting(true);
    try {
      const res = await fetch(`/api/links/${editingLink.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingLink.title.trim(),
          url: editingLink.url?.trim(),
          thumbnail: editingLink.thumbnail || null,
          isActive: editingLink.isActive,
        }),
      });

      if (res.ok) {
        setEditingLink(null);
        loadAdminData();
        showToast("Perubahan berhasil disimpan!");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal memperbarui item");
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Link / Header Handler
  const handleDeleteLink = async (id: string, title: string) => {
    if (!confirm(`Hapus "${title}" secara permanen?`)) return;

    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLinks(links.filter((l) => l.id !== id));
        showToast("Item berhasil dihapus");
      } else {
        alert("Gagal menghapus item");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Update Profile & Password Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg("");

    try {
      const payload: any = {
        title: profTitle.trim(),
        bio: profBio.trim(),
        avatarUrl: profAvatar.trim(),
      };

      if (newAdminPassword.trim()) {
        payload.newPassword = newAdminPassword.trim();
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setNewAdminPassword("");
        showToast("Pengaturan profil berhasil disimpan!");
        setIsSettingsOpen(false);
      } else {
        setSettingsMsg(data.error || "Gagal memperbarui pengaturan");
      }
    } catch (err) {
      setSettingsMsg("Gagal menyimpan ke server");
    }
  };

  const copyLiveUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1320] flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ea580c]"></div>
      </div>
    );
  }

  // JIKA BELUM LOGIN
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#14233c] via-[#0f1929] to-[#0a111c] text-white flex flex-col justify-center items-center p-4">
        {toastMessage && (
          <div className="fixed top-5 z-50 bg-[#16253d] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold border border-[#ea580c]/40 animate-bounce">
            {toastMessage}
          </div>
        )}

        <div className="w-full max-w-md bg-[#132035] border border-[#213554] rounded-3xl p-8 shadow-2xl relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#f97316] mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Publik
          </Link>

          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-20 h-20 rounded-full bg-white p-2 border-2 border-[#ea580c] shadow-[0_0_20px_rgba(234,88,12,0.3)] flex items-center justify-center mb-3">
              <img
                src="/bapenda.png"
                alt="Bapenda Purwakarta"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              SmartLink
            </h1>
            <p className="text-amber-100/80 text-xs mt-1 font-medium">
              Bapenda Kabupaten Purwakarta
            </p>
            <p className="text-[10px] text-slate-400 font-normal mt-1.5 flex items-center gap-1.5 select-none">
              <span className="text-[#ea580c] font-semibold">&copy; 2026</span>
              <span className="text-slate-300 font-medium">Muhammad Syafiq Nadhirrachman</span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Kata Sandi Admin
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin..."
                  autoFocus
                  required
                  className="w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white font-bold py-3 px-4 rounded-xl shadow-[0_2px_12px_rgba(234,88,12,0.35)] transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {loginLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // TAMPILAN DASHBOARD DENGAN LIVE PHONE PREVIEW SEBELAH KANAN
  const activeCount = links.filter((l) => l.isActive && l.type !== "header").length;
  const headerCount = links.filter((l) => l.type === "header").length;
  const inactiveCount = links.filter((l) => !l.isActive).length;

  // Filter links for live preview (only active items appear on public phone preview)
  const previewLinks = links.filter(
    (l) =>
      l.isActive &&
      l.title.toLowerCase().includes(previewSearch.toLowerCase())
  );

  const isLight = theme === "light";

  const getFolderChildCount = (headerIndex: number) => {
    let count = 0;
    for (let i = headerIndex + 1; i < links.length; i++) {
      if (links[i].type === "header") break;
      count++;
    }
    return count;
  };

  const displayedLinks = links.filter((link) => {
    if (filterTab === "active") return link.isActive;
    if (filterTab === "inactive") return !link.isActive;
    return true;
  });

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 antialiased selection:bg-[#ea580c] selection:text-white transition-colors duration-200 ${
        isLight ? "bg-slate-100 text-slate-800" : "bg-[#0a111c] text-slate-100"
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16253d] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 border border-[#ea580c]/50">
          <CheckCircle className="w-4 h-4 text-[#ea580c]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navbar */}
        <header
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b ${
            isLight ? "border-slate-200" : "border-[#1f314f]"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl p-1.5 border-2 border-[#ea580c] shadow-[0_0_15px_rgba(234,88,12,0.25)] flex items-center justify-center shrink-0 ${
                isLight ? "bg-white" : "bg-[#101c2e]"
              }`}
            >
              <img
                src="/bapenda.png"
                alt="Bapenda"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1
                className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                <span>Dashboard SmartLink</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#ea580c]/20 text-[#f97316] text-[10px] font-extrabold uppercase border border-[#ea580c]/30">
                  Live Mode
                </span>
              </h1>
              <p className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-amber-100/70"}`}>
                Bapenda Purwakarta • Edit & Atur Urutan Tautan Secara Live
              </p>
              <p
                className={`text-[10px] font-normal leading-tight mt-1 flex items-center gap-1.5 select-none ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <span className="text-[#ea580c] font-semibold">&copy; 2026</span>
                <span className={isLight ? "text-slate-800 font-medium" : "text-slate-300 font-medium"}>
                  Muhammad Syafiq Nadhirrachman
                </span>
                <span className={isLight ? "text-slate-400" : "text-slate-500"}>
                  &bull; All Rights Reserved
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isLight ? "Ganti ke Mode Gelap" : "Ganti ke Mode Terang"}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition shadow-sm cursor-pointer ${
                isLight
                  ? "bg-white border-slate-300 text-amber-600 hover:bg-slate-50"
                  : "bg-[#132035] hover:bg-[#1a2b47] border-[#233859] text-amber-400"
              }`}
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{isLight ? "Mode Gelap" : "Mode Terang"}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition ${
                isLight
                  ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  : "bg-[#132035] hover:bg-[#1a2b47] text-slate-200 border-[#233859]"
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Tab Publik
            </Link>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition cursor-pointer ${
                isLight
                  ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  : "bg-[#132035] hover:bg-[#1a2b47] text-slate-200 border-[#233859]"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Pengaturan
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold px-3 py-2 rounded-xl border border-rose-500/20 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </header>

        {/* 2-COLUMN LAYOUT: LEFT = MANAGER, RIGHT = LIVE PHONE PREVIEW */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ================= LEFT COLUMN: MANAGING LINKS & HEADERS ================= */}
          <div className="flex-1 w-full space-y-6">
            {/* Stats Bar (Clickable to Filter) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`text-left border rounded-2xl p-3.5 flex items-center justify-between shadow-sm transition cursor-pointer ${
                  filterTab === "all" ? "ring-2 ring-[#ea580c] border-[#ea580c]" : ""
                } ${
                  isLight
                    ? "bg-white border-slate-200 hover:border-slate-300"
                    : "bg-[#111d2e] border-[#1e304d] hover:border-[#2e476d]"
                }`}
              >
                <div>
                  <p className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Total Item
                  </p>
                  <p className={`text-xl font-bold mt-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                    {links.length}
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    isLight ? "bg-slate-100 text-slate-700" : "bg-[#18263e] text-slate-300"
                  }`}
                >
                  #
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("active")}
                className={`text-left border rounded-2xl p-3.5 flex items-center justify-between shadow-sm transition cursor-pointer ${
                  filterTab === "active" ? "ring-2 ring-emerald-500 border-emerald-500" : ""
                } ${
                  isLight
                    ? "bg-white border-slate-200 hover:border-emerald-300"
                    : "bg-[#111d2e] border-[#1e304d] hover:border-emerald-500/40"
                }`}
              >
                <div>
                  <p className="text-[11px] text-emerald-500 font-medium">Tautan Aktif</p>
                  <p className={`text-xl font-bold mt-0.5 ${isLight ? "text-emerald-700" : "text-emerald-300"}`}>
                    {activeCount}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </button>

              <div
                className={`border rounded-2xl p-3.5 flex items-center justify-between shadow-sm ${
                  isLight ? "bg-white border-[#ea580c]/30" : "bg-[#111d2e] border-[#ea580c]/30"
                }`}
              >
                <div>
                  <p className="text-[11px] text-[#ea580c] font-medium">Header Kategori</p>
                  <p className="text-xl font-bold text-[#ea580c] mt-0.5">{headerCount}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#ea580c]/10 flex items-center justify-center text-[#ea580c]">
                  <FolderTree className="w-4 h-4" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFilterTab("inactive")}
                className={`text-left border rounded-2xl p-3.5 flex items-center justify-between shadow-sm transition cursor-pointer ${
                  filterTab === "inactive" ? "ring-2 ring-amber-500 border-amber-500" : ""
                } ${
                  isLight
                    ? "bg-white border-slate-200 hover:border-amber-300"
                    : "bg-[#111d2e] border-[#1e304d] hover:border-amber-500/40"
                }`}
              >
                <div>
                  <p className="text-[11px] text-amber-500 font-medium">Nonaktif (Sembunyi)</p>
                  <p className={`text-xl font-bold mt-0.5 ${isLight ? "text-amber-700" : "text-amber-300"}`}>
                    {inactiveCount}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <XCircle className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Filter Tabs and Action Buttons */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-1">
              <div
                className={`flex items-center gap-1.5 p-1 rounded-xl border ${
                  isLight ? "bg-slate-200/80 border-slate-300" : "bg-[#0e1726] border-[#1e304d]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filterTab === "all"
                      ? "bg-[#ea580c] text-white shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Semua ({links.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("active")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    filterTab === "active"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-emerald-600"
                      : "text-slate-400 hover:text-emerald-400"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Aktif Saja ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("inactive")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    filterTab === "inactive"
                      ? "bg-amber-600 text-white shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-amber-600"
                      : "text-slate-400 hover:text-amber-400"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Nonaktif ({inactiveCount})
                </button>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={() => setIsAddHeaderModalOpen(true)}
                  className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-sm transition active:scale-[0.98] ${
                    isLight
                      ? "bg-orange-50 hover:bg-orange-100 text-[#ea580c] border border-orange-200"
                      : "bg-[#18273f] hover:bg-[#203454] text-[#ff8c38] border border-[#ea580c]/40"
                  }`}
                >
                  <FolderPlus className="w-4 h-4 text-[#ea580c]" />
                  Tambah Header
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(234,88,12,0.3)] transition active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Tautan
                </button>
              </div>
            </div>

            {/* Item List Manager */}
            <div className="space-y-2.5">
              {displayedLinks.length === 0 ? (
                <div
                  className={`text-center py-16 border rounded-2xl p-8 ${
                    isLight ? "bg-white border-slate-200" : "bg-[#111d2e] border-[#1e304d]"
                  }`}
                >
                  <p className="text-slate-400 text-sm">
                    {filterTab === "active"
                      ? "Tidak ada item aktif."
                      : filterTab === "inactive"
                      ? "Tidak ada item nonaktif."
                      : "Belum ada item yang dibuat."}
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-1.5 text-[#f97316] text-xs font-semibold hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Tambah item pertama Anda
                  </button>
                </div>
              ) : (
                displayedLinks.map((link) => {
                  const originalIndex = links.findIndex((l) => l.id === link.id);
                  const index = originalIndex !== -1 ? originalIndex : 0;
                  return link.type === "header" ? (
                    /* HEADER ROW (Draggable) */
                    <div
                      key={link.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`bg-gradient-to-r from-[#18273f] via-[#15233a] to-[#101b2d] border-2 rounded-2xl p-3.5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        draggedIndex === index
                          ? "opacity-30 border-dashed border-[#ea580c] scale-[0.98] ring-2 ring-[#ea580c]/50 bg-[#14233a]"
                          : dragOverIndex === index
                          ? "border-[#ea580c] ring-2 ring-[#ea580c] bg-[#1d3152] shadow-[0_0_20px_rgba(234,88,12,0.3)] transform -translate-y-0.5"
                          : link.isActive
                          ? "border-[#ea580c]/70 shadow-[0_0_16px_rgba(234,88,12,0.12)]"
                          : "border-dashed border-amber-500/30 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Drag & Drop Grip Handle */}
                          <div
                            className="p-1 text-slate-500 hover:text-[#ea580c] cursor-grab active:cursor-grabbing hover:bg-[#1a2b47] rounded-lg transition-colors"
                            title="Tahan & geser untuk mengubah urutan (Drag & Drop)"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Quick Arrow Up/Down */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              draggable={false}
                              onDragStart={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMove(index, "up");
                              }}
                              disabled={index === 0}
                              title="Pindahkan ke atas"
                              className="p-1.5 rounded-lg bg-[#0e1726] hover:bg-[#1a2b47] text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed transition"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              draggable={false}
                              onDragStart={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMove(index, "down");
                              }}
                              disabled={index === links.length - 1}
                              title="Pindahkan ke bawah"
                              className="p-1.5 rounded-lg bg-[#0e1726] hover:bg-[#1a2b47] text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed transition"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <span className="w-6 h-6 rounded-md bg-[#0e1726] text-[#f97316] text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-[#ea580c]/30">
                          {index + 1}
                        </span>

                        <div className="p-1.5 rounded-lg bg-[#ea580c]/20 text-[#ff8c38] border border-[#ea580c]/40 shrink-0">
                          <FolderTree className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#ea580c] text-white">
                              HEADER
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#ea580c]/20 text-[#ff8c38] border border-[#ea580c]/30">
                              <Folder className="w-3 h-3" />
                              Folder: {getFolderChildCount(index)} item (geser 1 folder)
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {link.isActive ? "Tampil di Pratinjau" : "Disembunyikan"}
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-white uppercase tracking-wide mt-0.5 truncate">
                            {link.title}
                          </h3>
                        </div>
                      </div>

                      {/* Right Controls: iOS Style Switch Toggle & Actions */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        {/* Smooth Toggle Switch like Image 2 */}
                        <button
                          type="button"
                          draggable={false}
                          onDragStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(link);
                          }}
                          title={link.isActive ? "Nonaktifkan" : "Aktifkan"}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                            link.isActive ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"
                          }`}
                        >
                          <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                        </button>

                        <button
                          type="button"
                          draggable={false}
                          onDragStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLink(link);
                          }}
                          title="Edit nama header"
                          className="p-2 rounded-xl bg-[#0e1726] hover:bg-[#1a2b47] text-slate-300 border border-[#233859] transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          draggable={false}
                          onDragStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLink(link.id, link.title);
                          }}
                          title="Hapus header"
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* LINK ROW (Draggable card) */
                    <div
                      key={link.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`bg-[#111d2e] border rounded-2xl p-3.5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        draggedIndex === index
                          ? "opacity-30 border-dashed border-[#ea580c] scale-[0.98] ring-2 ring-[#ea580c]/50 bg-[#14233a]"
                          : dragOverIndex === index
                          ? "border-[#ea580c] ring-2 ring-[#ea580c] bg-[#1a2d4b] shadow-[0_0_20px_rgba(234,88,12,0.3)] transform -translate-y-0.5"
                          : link.isActive
                          ? "border-[#1e304d] hover:border-[#ea580c]/50"
                          : "border-dashed border-amber-500/30 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Drag & Drop Grip Handle */}
                          <div
                            className="p-1 text-slate-500 hover:text-[#ea580c] cursor-grab active:cursor-grabbing hover:bg-[#1a2b47] rounded-lg transition-colors"
                            title="Tahan & geser untuk mengubah urutan (Drag & Drop)"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Quick Arrow Up/Down */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              draggable={false}
                              onDragStart={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMove(index, "up");
                              }}
                              disabled={index === 0}
                              title="Pindahkan ke atas"
                              className="p-1.5 rounded-lg bg-[#0e1726] hover:bg-[#1a2b47] text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed transition"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              draggable={false}
                              onDragStart={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMove(index, "down");
                              }}
                              disabled={index === links.length - 1}
                              title="Pindahkan ke bawah"
                              className="p-1.5 rounded-lg bg-[#0e1726] hover:bg-[#1a2b47] text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed transition"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <span className="w-6 h-6 rounded-md bg-[#0e1726] text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-[#1e304d]">
                          {index + 1}
                        </span>

                        {link.thumbnail ? (
                          <div className="relative group/thumb shrink-0" title="Klik tombol X untuk menghapus ikon">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-[#ea580c]/30 p-0.5 shadow-sm">
                              <img
                                src={link.thumbnail}
                                alt=""
                                draggable={false}
                                className="w-full h-full object-cover rounded-[5px]"
                              />
                            </div>
                            <button
                              type="button"
                              draggable={false}
                              onDragStart={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickRemoveThumbnail(link);
                              }}
                              title={`Hapus thumbnail "${link.title}"`}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#0e1726] border border-[#1e304d] shrink-0 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                            Link
                          </div>
                        )}

                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white truncate">
                              {link.title}
                            </h3>
                            {!link.isActive && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Nonaktif
                              </span>
                            )}
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            draggable={false}
                            onDragStart={(e) => e.stopPropagation()}
                            className="text-xs text-slate-400 hover:text-[#f97316] truncate block mt-0.5 max-w-[280px] sm:max-w-sm transition"
                          >
                            {link.url}
                          </a>
                        </div>
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        {/* iOS Style Switch Toggle */}
                        <button
                          type="button"
                          draggable={false}
                          onDragStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(link);
                          }}
                          title={link.isActive ? "Nonaktifkan" : "Aktifkan"}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                            link.isActive ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"
                          }`}
                        >
                          <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                        </button>

                        <button
                          type="button"
                          draggable={false}
                          onDragStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLink(link);
                          }}
                          title="Edit tautan"
                          className="p-2 rounded-xl bg-[#0e1726] hover:bg-[#1a2b47] text-slate-300 border border-[#233859] transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          draggable={false}
                          onDragStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLink(link.id, link.title);
                          }}
                          title="Hapus tautan"
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PHONE PREVIEW (LIKE IMAGE 2) ================= */}
          <div className="w-full lg:w-[370px] shrink-0 sticky top-6 self-start flex flex-col items-center order-first lg:order-last mb-6 lg:mb-0">
            {/* Top URL Pill (Like Image 2: linktr.ee/pendanilp2) */}
            <div
              className={`w-full border rounded-2xl px-3.5 py-2.5 mb-3 flex items-center justify-between text-xs shadow-md ${
                isLight
                  ? "bg-white border-slate-200 text-slate-700"
                  : "bg-[#132035] border-[#213554] text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className={`font-mono text-[11px] truncate ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                  localhost:3006
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={copyLiveUrl}
                  title="Salin URL publik"
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  {copiedUrl ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <Link
                  href="/"
                  target="_blank"
                  title="Buka tab baru"
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Smartphone Mockup Body (Like Image 2) */}
            <div className="w-[325px] h-[640px] max-h-[82vh] bg-[#070d17] rounded-[44px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[5px] border-[#1e2f47] relative ring-1 ring-white/10 flex flex-col">
              {/* Speaker & Camera Notch */}
              <div className="w-28 h-4 bg-[#070d17] rounded-full mx-auto absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#03060a] mr-2" />
                <div className="w-8 h-1 rounded-full bg-[#152338]" />
              </div>

              {/* Inner Screen Display (Live rendered view - Scrollbar Hidden!) */}
              <div className="w-full h-full rounded-[34px] overflow-y-auto overflow-x-hidden bg-gradient-to-b from-[#14233c] via-[#0f1929] to-[#0a111c] text-white p-3.5 pt-8 flex flex-col items-center select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {/* Mini Top Bar inside preview */}
                <div className="w-full flex items-center justify-end mb-3 px-1">
                  <div className="w-6 h-6 rounded-xl bg-black/30 flex items-center justify-center border border-white/10 text-slate-400">
                    <Share2 className="w-3 h-3" />
                  </div>
                </div>

                {/* Profile Header */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[#101c2e] p-1.5 shadow-[0_0_15px_rgba(234,88,12,0.35)] border-2 border-[#ea580c] ring-2 ring-[#ea580c]/20 flex items-center justify-center mb-2">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-base font-bold text-[#14233c]">
                        S
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-tight drop-shadow-sm">
                    {profile.title || "SmartLink"}
                  </h3>
                  {profile.bio && (
                    <p className="text-[11px] font-medium text-amber-100/80 max-w-[240px] leading-snug mt-0.5">
                      {profile.bio}
                    </p>
                  )}
                  {/* Watermark in mockup */}
                  <div className="mt-1.5 flex items-center gap-1 text-[8.5px] text-slate-400 font-normal select-none">
                    <span className="text-[#ea580c] font-semibold">&copy; 2026</span>
                    <span className="text-slate-200 font-medium">Muhammad Syafiq Nadhirrachman</span>
                  </div>
                </div>

                {/* Mini Search input */}
                {previewLinks.length > 5 && (
                  <div className="w-full mb-3 px-0.5">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                      <input
                        type="text"
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        placeholder="Cari..."
                        className="w-full bg-[#18263e]/80 border border-[#273a5a] text-white placeholder-slate-500 text-[11px] rounded-lg pl-7 pr-2 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Mini Link & Header Stack */}
                <div className="w-full flex flex-col gap-2 pb-6">
                  {previewLinks.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      Tidak ada link aktif untuk ditampilkan.
                    </div>
                  ) : (
                    previewLinks.map((link) =>
                      link.type === "header" ? (
                        /* Header inside phone mockup */
                        <div key={link.id} className="w-full pt-3 pb-0.5 first:pt-0">
                          <div className="flex items-center gap-1.5">
                            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ea580c]/50 to-[#ea580c] flex-1" />
                            <div className="px-2 py-0.5 rounded-full bg-[#ea580c]/20 border border-[#ea580c]/40 text-[#ff8c38] text-[9px] font-extrabold uppercase tracking-wider">
                              {link.title}
                            </div>
                            <div className="h-[1px] bg-gradient-to-r from-[#ea580c] via-[#ea580c]/50 to-transparent flex-1" />
                          </div>
                        </div>
                      ) : (
                        /* Link card inside phone mockup */
                        <div
                          key={link.id}
                          className="w-full rounded-lg bg-white hover:bg-[#fffbf8] p-2 flex items-center min-h-[46px] shadow-[0_1px_5px_rgba(0,0,0,0.2)] border border-transparent hover:border-[#ea580c] relative transition-all"
                        >
                          {link.thumbnail && (
                            <div className="w-7 h-7 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200 mr-2 p-0.5">
                              <img
                                src={link.thumbnail}
                                alt=""
                                className="w-full h-full object-cover rounded-[3px]"
                              />
                            </div>
                          )}
                          <span className="text-[11px] font-bold text-[#14233c] truncate text-center flex-1 pr-4">
                            {link.title}
                          </span>
                          <span className="absolute right-2 text-slate-400">
                            <MoreVertical className="w-3 h-3" />
                          </span>
                        </div>
                      )
                    )
                  )}
                </div>

                {/* Footer note in preview */}
                <div className="mt-auto pt-3 pb-1 text-[8.5px] text-slate-400 font-normal text-center select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[#ea580c] font-semibold">&copy; 2026</span>
                    <span className="text-slate-300 font-medium">Muhammad Syafiq Nadhirrachman</span>
                  </div>
                  <div className="text-[8px] text-slate-500 mt-0.5">
                    SmartLink Subbidang Pendataan Penilaian PBB dan BPHTB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH HEADER BARU */}
      {isAddHeaderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#132035] border border-[#213554] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-[#ea580c]/15 text-[#f97316] border border-[#ea580c]/30">
                <FolderPlus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Tambah Header Kategori</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Header berfungsi sebagai pemisah judul untuk mengelompokkan beberapa tautan di bawahnya.
            </p>

            <form onSubmit={handleAddHeader} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nama Header / Kategori
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Misal: BERITA ACARA (BA)"
                  value={newHeaderTitle}
                  onChange={(e) => setNewHeaderTitle(e.target.value)}
                  className="w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#0b1320] border border-[#213554] rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-white">Status Publik</p>
                  <p className="text-[11px] text-slate-400">
                    {newHeaderIsActive
                      ? "Tampilkan pemisah ini di pratinjau & publik"
                      : "Sembunyikan dari publik"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewHeaderIsActive(!newHeaderIsActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    newHeaderIsActive ? "bg-[#ea580c] justify-end" : "bg-slate-700 justify-start"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#213554]">
                <button
                  type="button"
                  onClick={() => setIsAddHeaderModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {formSubmitting ? "Menyimpan..." : "Simpan Header"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH LINK BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#132035] border border-[#213554] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Tambah Tautan Baru</h3>
            <p className="text-xs text-slate-400 mb-6">
              Masukkan nama dan alamat URL tujuan yang ingin ditampilkan.
            </p>

            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Judul Tautan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Portal Pelaporan Internal"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Alamat URL Tujuan
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://contoh.internal.go.id"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    URL Thumbnail / Ikon (Opsional)
                  </label>
                  {newThumbnail && (
                    <button
                      type="button"
                      onClick={() => setNewThumbnail("")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer transition"
                      title="Hapus gambar / ikon ini"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Ikon</span>
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="/thumbnails/thumb_1.png atau URL gambar"
                    value={newThumbnail}
                    onChange={(e) => setNewThumbnail(e.target.value)}
                    className={`w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50 transition ${
                      newThumbnail ? "pr-10" : ""
                    }`}
                  />
                  {newThumbnail && (
                    <button
                      type="button"
                      onClick={() => setNewThumbnail("")}
                      title="Hapus ikon / thumbnail langsung"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {newThumbnail && (
                  <div className="mt-2.5 flex items-center justify-between p-2.5 bg-[#0b1320] border border-[#213554] rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 border border-[#ea580c]/40 shrink-0 flex items-center justify-center">
                        <img
                          src={newThumbnail}
                          alt="Thumbnail Preview"
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-200 truncate">
                          Thumbnail Terpasang
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {newThumbnail}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewThumbnail("")}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Ikon</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#0b1320] border border-[#213554] rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-white">Status Publik</p>
                  <p className="text-[11px] text-slate-400">
                    {newIsActive
                      ? "Tampilkan langsung ke pratinjau & publik"
                      : "Sembunyikan (hanya admin yang dapat melihat)"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewIsActive(!newIsActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    newIsActive ? "bg-[#ea580c] justify-end" : "bg-slate-700 justify-start"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#213554]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {formSubmitting ? "Menyimpan..." : "Simpan Tautan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ITEM (LINK ATAU HEADER) */}
      {editingLink && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#132035] border border-[#213554] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingLink.type === "header" ? "Edit Header Kategori" : "Edit Tautan"}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Perbarui judul, URL, atau status tampilan item ini.
            </p>

            <form onSubmit={handleUpdateLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  {editingLink.type === "header" ? "Nama Header" : "Judul Tautan"}
                </label>
                <input
                  type="text"
                  required
                  value={editingLink.title}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, title: e.target.value })
                  }
                  className="w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50"
                />
              </div>

              {editingLink.type !== "header" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Alamat URL Tujuan
                    </label>
                    <input
                      type="text"
                      required
                      value={editingLink.url || ""}
                      onChange={(e) =>
                        setEditingLink({ ...editingLink, url: e.target.value })
                      }
                      className="w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        URL Thumbnail / Ikon (Opsional)
                      </label>
                      {editingLink.thumbnail && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingLink({ ...editingLink, thumbnail: "" })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer transition"
                          title="Hapus gambar / ikon ini"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus Ikon</span>
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="/thumbnails/thumb_1.png atau URL gambar"
                        value={editingLink.thumbnail || ""}
                        onChange={(e) =>
                          setEditingLink({ ...editingLink, thumbnail: e.target.value })
                        }
                        className={`w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50 transition ${
                          editingLink.thumbnail ? "pr-10" : ""
                        }`}
                      />
                      {editingLink.thumbnail && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingLink({ ...editingLink, thumbnail: "" })
                          }
                          title="Hapus ikon / thumbnail langsung"
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Visual Preview Chip with Direct Remove Button */}
                    {editingLink.thumbnail && (
                      <div className="mt-2.5 flex items-center justify-between p-2.5 bg-[#0b1320] border border-[#213554] rounded-xl">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 border border-[#ea580c]/40 shrink-0 flex items-center justify-center">
                            <img
                              src={editingLink.thumbnail}
                              alt="Thumbnail Preview"
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-slate-200 truncate">
                              Thumbnail Terpasang
                            </p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                              {editingLink.thumbnail}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingLink({ ...editingLink, thumbnail: "" })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Ikon</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center justify-between p-3.5 bg-[#0b1320] border border-[#213554] rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-white">Status Publik</p>
                  <p className="text-[11px] text-slate-400">
                    {editingLink.isActive
                      ? "Tampil di halaman pratinjau & publik"
                      : "Nonaktif / Disembunyikan dari publik"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingLink({
                      ...editingLink,
                      isActive: !editingLink.isActive,
                    })
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    editingLink.isActive ? "bg-[#ea580c] justify-end" : "bg-slate-700 justify-start"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#213554]">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {formSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PENGATURAN PROFIL & PASSWORD */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#132035] border border-[#213554] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">Pengaturan Profil & Keamanan</h3>
            <p className="text-xs text-slate-400 mb-6">
              Ubah judul profil, deskripsi/bio, foto avatar, atau ganti kata sandi admin.
            </p>

            {settingsMsg && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{settingsMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nama Profil / Judul
                </label>
                <input
                  type="text"
                  value={profTitle}
                  onChange={(e) => setProfTitle(e.target.value)}
                  placeholder="SmartLink"
                  className="w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Deskripsi / Bio
                </label>
                <textarea
                  rows={2}
                  value={profBio}
                  onChange={(e) => setProfBio(e.target.value)}
                  placeholder="Subbidang Pendataan Penilaian PBB dan BPHTB"
                  className="w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  URL Foto Profil / Logo
                </label>
                <input
                  type="text"
                  value={profAvatar}
                  onChange={(e) => setProfAvatar(e.target.value)}
                  placeholder="/bapenda.png"
                  className="w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50"
                />
              </div>

              <div className="pt-3 border-t border-[#213554]">
                <label className="block text-xs font-semibold text-[#f97316] uppercase tracking-wider mb-2">
                  Ganti Kata Sandi Admin (Opsional)
                </label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru (kosongkan jika tidak diubah)"
                  className="w-full bg-[#0b1320] border border-[#213554] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#213554]">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  <Save className="w-4 h-4" />
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
