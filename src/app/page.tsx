"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lock,
  Search,
  Settings,
  Share2,
  MoreVertical,
  Check,
  Sun,
  Moon,
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

export default function HomePage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [profile, setProfile] = useState<ProfileData>({
    title: "SmartLink",
    bio: "Subbidang Pendataan Penilaian PBB dan BPHTB",
    avatarUrl: "/bapenda.png",
    theme: "dark",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2800);
  };

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("smartlink_theme", nextTheme);
  };

  useEffect(() => {
    fetchData();
    const savedTheme = localStorage.getItem("smartlink_theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profRes = await fetch("/api/profile");
      if (profRes.ok) {
        const profJson = await profRes.json();
        if (profJson.profile) setProfile(profJson.profile);
      }

      const linksRes = await fetch("/api/links");
      if (linksRes.ok) {
        const linksJson = await linksRes.json();
        setLinks(linksJson.links || []);
        setIsAdmin(Boolean(linksJson.isAdmin));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    triggerToast("Tautan berhasil disalin!");
  };

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Tautan halaman profil disalin!");
    }
  };

  const filteredLinks = links.filter((link) =>
    link.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLight = theme === "light";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-between antialiased selection:bg-[#ea580c] selection:text-white transition-colors duration-200 ${
        isLight
          ? "bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 text-slate-800"
          : "bg-gradient-to-b from-[#14233c] via-[#0f1929] to-[#0a111c] text-white"
      }`}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 z-50 bg-[#16253d] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 border border-[#ea580c]/50 animate-bounce">
          <Check className="w-3.5 h-3.5 text-[#f97316]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Center Frame */}
      <div className="w-full max-w-[580px] min-h-screen flex flex-col justify-between px-4 sm:px-6 pt-4 pb-8">
        {/* Top Floating Bar */}
        <div className="w-full flex items-center justify-end py-2 mb-2">
          {/* Top Right: Theme, Share & Admin Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isLight ? "Ganti ke Mode Gelap" : "Ganti ke Mode Terang"}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center border transition cursor-pointer ${
                isLight
                  ? "bg-white/90 border-slate-300 text-amber-500 hover:bg-slate-50 shadow-sm"
                  : "bg-[#18263e]/80 border-white/10 text-amber-400 hover:text-amber-300"
              }`}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {isAdmin ? (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold px-3 py-1.5 rounded-2xl shadow-[0_2px_10px_rgba(234,88,12,0.3)] transition"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                title="Login Admin"
                className={`w-9 h-9 rounded-2xl flex items-center justify-center border transition ${
                  isLight
                    ? "bg-white/90 border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
                    : "bg-[#18263e]/80 border-white/10 text-white/80 hover:text-white"
                }`}
              >
                <Lock className="w-4 h-4" />
              </Link>
            )}

            <button
              onClick={handleShareProfile}
              title="Bagikan Profil"
              className={`w-9 h-9 rounded-2xl flex items-center justify-center border transition cursor-pointer ${
                isLight
                  ? "bg-white/90 border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
                  : "bg-[#18263e]/80 border-white/10 text-white/80 hover:text-white"
              }`}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Header Section */}
        <header className="flex flex-col items-center text-center mt-3 mb-6">
          {/* Avatar: Bapenda Shield */}
          <div className="mb-4 relative group">
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-2 shadow-[0_0_25px_rgba(234,88,12,0.35)] border-2 border-[#ea580c] ring-4 ring-[#ea580c]/20 flex items-center justify-center transition duration-300 group-hover:scale-105 ${
                isLight ? "bg-white shadow-orange-100" : "bg-[#101c2e]"
              }`}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-2xl font-bold text-[#14233c]">
                  {profile.title.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Title & Bio */}
          <h1
            className={`text-2xl sm:text-[26px] font-extrabold tracking-tight drop-shadow-md ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            {profile.title}
          </h1>
          {profile.bio && (
            <p
              className={`text-xs sm:text-sm font-semibold max-w-[440px] mt-1.5 leading-relaxed px-2 tracking-wide ${
                isLight ? "text-slate-600" : "text-amber-100/90"
              }`}
            >
              {profile.bio}
            </p>
          )}

          {/* Watermark Pencipta Sistem */}
          <div
            className={`mt-2.5 flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-normal leading-tight tracking-wide select-none ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}
          >
            <span className="text-[#ea580c] font-semibold">&copy; 2026</span>
            <span className={isLight ? "text-slate-800 font-medium" : "text-slate-200 font-medium"}>
              Muhammad Syafiq Nadhirrachman
            </span>
            <span className={isLight ? "text-slate-400" : "text-slate-500"}>
              &bull; All Rights Reserved
            </span>
          </div>
        </header>

        {/* Search Bar */}
        {links.length > 5 && (
          <div className="w-full mb-4">
            <div className="relative">
              <Search
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isLight ? "text-slate-400" : "text-slate-400"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tautan..."
                className={`w-full text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]/50 transition ${
                  isLight
                    ? "bg-white border border-slate-300 text-slate-800 placeholder-slate-400 shadow-sm"
                    : "bg-[#18263e]/80 border border-[#273a5a] text-white placeholder-slate-400"
                }`}
              />
            </div>
          </div>
        )}

        {/* Links Stack with Bapenda Theme */}
        <main className="w-full flex-1 flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col gap-3 w-full">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="h-14 w-full rounded-xl bg-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-12 bg-[#18263e]/50 border border-[#273a5a] rounded-xl p-6 text-slate-400 text-sm">
              {searchQuery
                ? "Tidak ada tautan yang sesuai kata kunci."
                : "Belum ada tautan aktif yang tersedia."}
            </div>
          ) : (
            filteredLinks.map((link) =>
              link.type === "header" ? (
                /* Header / Kategori Pembatas dengan sentuhan pita oranye Bapenda */
                <div
                  key={link.id}
                  className="w-full pt-5 pb-1 first:pt-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-[1.5px] bg-gradient-to-r from-transparent via-[#ea580c]/50 to-[#ea580c] flex-1" />
                    <div className="px-3.5 py-1 rounded-full bg-[#ea580c]/15 border border-[#ea580c]/40 text-[#ff8c38] shadow-[0_0_12px_rgba(234,88,12,0.15)] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                      <h2 className="text-[11px] sm:text-xs font-extrabold tracking-widest uppercase select-none drop-shadow-sm">
                        {link.title}
                      </h2>
                    </div>
                    <div className="h-[1.5px] bg-gradient-to-r from-[#ea580c] via-[#ea580c]/50 to-transparent flex-1" />
                  </div>
                </div>
              ) : (
                /* Tombol Kartu Link */
                <div
                  key={link.id}
                  className={`group relative w-full rounded-xl active:scale-[0.99] border transition-all duration-150 flex items-center min-h-[58px] sm:min-h-[62px] ${
                    isLight
                      ? "bg-white hover:bg-orange-50/60 border-slate-200/90 hover:border-[#ea580c] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(234,88,12,0.18)]"
                      : "bg-white hover:bg-[#fffbf8] border-transparent hover:border-[#ea580c] shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_16px_rgba(234,88,12,0.22)]"
                  }`}
                >
                  {/* Main Clickable Link */}
                  <a
                    href={link.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center h-full px-14 py-3 min-h-[58px] sm:min-h-[62px] text-center"
                  >
                    {/* Left Thumbnail (if available) */}
                    {link.thumbnail && (
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80 shadow-sm">
                        <img
                          src={link.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Title Label */}
                    <span className="text-[14px] sm:text-[15px] font-bold text-[#14233c] group-hover:text-[#ea580c] leading-snug line-clamp-2 select-none transition-colors">
                      {link.title}
                    </span>
                  </a>

                  {/* Right 3-dots Share / Copy Button */}
                  {link.url && (
                    <button
                      type="button"
                      onClick={() => handleCopyLink(link.url)}
                      title="Salin tautan"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-[#ea580c] hover:bg-[#ea580c]/10 transition cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            )
          )}
        </main>

        {/* Footer */}
        <footer className="w-full pt-10 pb-4 text-center text-xs flex flex-col items-center gap-1.5 select-none">
          <p
            className={`font-medium flex items-center gap-1.5 text-[11px] sm:text-xs ${
              isLight ? "text-slate-600" : "text-slate-300"
            }`}
          >
            <span className="text-[#ea580c] font-semibold">&copy; 2026</span>
            <span className={isLight ? "text-slate-900 font-bold" : "text-white"}>
              Muhammad Syafiq Nadhirrachman
            </span>
            <span className={isLight ? "text-slate-400" : "text-slate-400"}>
              &bull; All Rights Reserved
            </span>
          </p>
          <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>
            SmartLink Subbidang Pendataan Penilaian PBB dan BPHTB &bull; Bapenda Purwakarta
          </p>
          <Link
            href="/admin"
            className={`inline-flex items-center gap-1.5 transition mt-1 py-1 px-3 rounded-full ${
              isLight
                ? "text-slate-600 hover:text-[#ea580c] hover:bg-slate-200/60"
                : "text-slate-400 hover:text-[#f97316] hover:bg-white/5"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isAdmin ? "Buka Mode Admin" : "Akses Admin"}</span>
          </Link>
        </footer>
      </div>
    </div>
  );
}
