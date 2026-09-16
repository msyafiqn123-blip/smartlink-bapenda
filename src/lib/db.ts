import fs from "fs";
import path from "path";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface LinkItem {
  id: string;
  type?: "link" | "header";
  title: string;
  url?: string;
  thumbnail?: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  clicks: number;
}

export interface ProfileSettings {
  title: string;
  bio: string;
  avatarUrl: string;
  theme: "dark" | "blue" | "emerald" | "purple" | "neutral";
}

export interface AppData {
  admin: {
    passwordHash: string;
    salt: string;
  };
  profile: ProfileSettings;
  links: LinkItem[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export function hashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function getDefaultData(): AppData {
  const defaultSalt = crypto.randomBytes(16).toString("hex");
  const defaultPasswordHash = hashPassword("admin123", defaultSalt);

  return {
    admin: {
      passwordHash: defaultPasswordHash,
      salt: defaultSalt,
    },
    profile: {
      title: "SmartLink",
      bio: "Subbidang Pendataan Penilaian PBB dan BPHTB",
      avatarUrl: "/bapenda.png",
      theme: "dark",
    },
    links: [],
  };
}

export function readDb(): AppData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData = getDefaultData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as AppData;
  } catch (err) {
    console.error("Error reading database:", err);
    return getDefaultData();
  }
}

export function writeDb(data: AppData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database:", err);
    // Don't throw on read-only serverless filesystems (e.g. Vercel) if Supabase is active
    if (!isSupabaseConfigured()) {
      throw new Error("Gagal menyimpan data ke file sistem.");
    }
  }
}

// ==========================================
// ASYNC DATA ACCESS LAYER (SUPABASE / LOCAL)
// ==========================================

export async function getProfileAsync(): Promise<ProfileSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", 1)
        .single();
      if (!error && data) {
        return {
          title: data.title,
          bio: data.bio,
          avatarUrl: data.avatar_url,
          theme: data.theme || "dark",
        };
      }
    } catch (err) {
      console.error("Error reading profile from Supabase:", err);
    }
  }
  return readDb().profile;
}

export async function updateProfileAsync(
  updates: Partial<ProfileSettings>,
  newPassword?: string
): Promise<ProfileSettings> {
  let updatedProfile: ProfileSettings;

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
      if (updates.theme !== undefined) payload.theme = updates.theme;

      const { data, error } = await supabase
        .from("profile")
        .update(payload)
        .eq("id", 1)
        .select()
        .single();

      if (!error && data) {
        updatedProfile = {
          title: data.title,
          bio: data.bio,
          avatarUrl: data.avatar_url,
          theme: data.theme || "dark",
        };
      } else {
        throw error;
      }

      if (newPassword && newPassword.trim().length >= 4) {
        const salt = crypto.randomBytes(16).toString("hex");
        const passwordHash = hashPassword(newPassword.trim(), salt);
        await supabase
          .from("admin_auth")
          .update({
            password_hash: passwordHash,
            salt: salt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", 1);
      }
    } catch (err) {
      console.error("Error updating profile in Supabase:", err);
      // Fallback to local
      const db = readDb();
      if (updates.title !== undefined) db.profile.title = updates.title;
      if (updates.bio !== undefined) db.profile.bio = updates.bio;
      if (updates.avatarUrl !== undefined) db.profile.avatarUrl = updates.avatarUrl;
      if (updates.theme !== undefined) db.profile.theme = updates.theme;
      if (newPassword && newPassword.trim().length >= 4) {
        db.admin.passwordHash = hashPassword(newPassword.trim(), db.admin.salt);
      }
      writeDb(db);
      updatedProfile = db.profile;
    }
  } else {
    const db = readDb();
    if (updates.title !== undefined) db.profile.title = updates.title;
    if (updates.bio !== undefined) db.profile.bio = updates.bio;
    if (updates.avatarUrl !== undefined) db.profile.avatarUrl = updates.avatarUrl;
    if (updates.theme !== undefined) db.profile.theme = updates.theme;
    if (newPassword && newPassword.trim().length >= 4) {
      db.admin.passwordHash = hashPassword(newPassword.trim(), db.admin.salt);
    }
    writeDb(db);
    updatedProfile = db.profile;
  }

  return updatedProfile;
}

export async function getLinksAsync(options?: { onlyActive?: boolean }): Promise<LinkItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from("links")
        .select("*")
        .order("display_order", { ascending: true });

      if (options?.onlyActive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          id: row.id,
          type: row.type as "link" | "header",
          title: row.title,
          url: row.url || undefined,
          thumbnail: row.thumbnail || null,
          isActive: row.is_active,
          order: row.display_order,
          clicks: row.clicks || 0,
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.error("Error reading links from Supabase:", err);
    }
  }

  const db = readDb();
  let links = [...db.links].sort((a, b) => a.order - b.order);
  if (options?.onlyActive) {
    links = links.filter((l) => l.isActive);
  }
  return links;
}

export async function createLinkAsync(item: {
  title: string;
  url?: string;
  thumbnail?: string | null;
  isActive?: boolean;
  type?: "link" | "header";
}): Promise<LinkItem> {
  const newId =
    (item.type === "header" ? "hdr-" : "link-") +
    crypto.randomBytes(6).toString("hex");

  const newLink: LinkItem = {
    id: newId,
    type: item.type === "header" ? "header" : "link",
    title: item.title.trim(),
    ...(item.url ? { url: item.url.trim() } : {}),
    thumbnail: item.thumbnail || null,
    isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
    order: 1,
    createdAt: new Date().toISOString(),
    clicks: 0,
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Ambil semua link saat ini dan geser order + 1
      const { data: existing } = await supabase
        .from("links")
        .select("id, display_order")
        .order("display_order", { ascending: true });

      if (existing && existing.length > 0) {
        await Promise.all(
          existing.map((row) =>
            supabase!
              .from("links")
              .update({ display_order: row.display_order + 1 })
              .eq("id", row.id)
          )
        );
      }

      // 2. Insert item baru di display_order = 1
      await supabase.from("links").insert({
        id: newLink.id,
        type: newLink.type,
        title: newLink.title,
        url: newLink.url || null,
        thumbnail: newLink.thumbnail,
        is_active: newLink.isActive,
        display_order: 1,
        clicks: 0,
        created_at: newLink.createdAt,
      });

      return newLink;
    } catch (err) {
      console.error("Error creating link in Supabase:", err);
    }
  }

  // Local fallback
  const db = readDb();
  db.links.forEach((l) => {
    l.order += 1;
  });
  db.links.unshift(newLink);
  writeDb(db);
  return newLink;
}

export async function updateLinkAsync(
  id: string,
  updates: Partial<LinkItem>
): Promise<LinkItem | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title.trim();
      if (updates.url !== undefined) payload.url = updates.url ? updates.url.trim() : null;
      if (updates.thumbnail !== undefined) payload.thumbnail = updates.thumbnail;
      if (updates.isActive !== undefined) payload.is_active = Boolean(updates.isActive);
      if (updates.order !== undefined) payload.display_order = updates.order;

      const { data, error } = await supabase
        .from("links")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          type: data.type as "link" | "header",
          title: data.title,
          url: data.url || undefined,
          thumbnail: data.thumbnail || null,
          isActive: data.is_active,
          order: data.display_order,
          clicks: data.clicks || 0,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.error("Error updating link in Supabase:", err);
    }
  }

  const db = readDb();
  const linkIndex = db.links.findIndex((l) => l.id === id);
  if (linkIndex === -1) return null;

  if (updates.title !== undefined) db.links[linkIndex].title = updates.title.trim();
  if (updates.url !== undefined) db.links[linkIndex].url = updates.url ? updates.url.trim() : undefined;
  if (updates.thumbnail !== undefined) db.links[linkIndex].thumbnail = updates.thumbnail;
  if (updates.isActive !== undefined) db.links[linkIndex].isActive = Boolean(updates.isActive);
  if (updates.order !== undefined) db.links[linkIndex].order = updates.order;

  writeDb(db);
  return db.links[linkIndex];
}

export async function deleteLinkAsync(id: string): Promise<LinkItem | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Ambil data sebelum dihapus
      const { data: linkToDelete } = await supabase
        .from("links")
        .select("*")
        .eq("id", id)
        .single();

      // 2. Hapus
      await supabase.from("links").delete().eq("id", id);

      // 3. Re-index display_order tersisa
      const { data: remaining } = await supabase
        .from("links")
        .select("id")
        .order("display_order", { ascending: true });

      if (remaining && remaining.length > 0) {
        await Promise.all(
          remaining.map((row, idx) =>
            supabase!
              .from("links")
              .update({ display_order: idx + 1 })
              .eq("id", row.id)
          )
        );
      }

      if (linkToDelete) {
        return {
          id: linkToDelete.id,
          type: linkToDelete.type as "link" | "header",
          title: linkToDelete.title,
          url: linkToDelete.url || undefined,
          thumbnail: linkToDelete.thumbnail || null,
          isActive: linkToDelete.is_active,
          order: linkToDelete.display_order,
          clicks: linkToDelete.clicks || 0,
          createdAt: linkToDelete.created_at,
        };
      }
    } catch (err) {
      console.error("Error deleting link in Supabase:", err);
    }
  }

  const db = readDb();
  const linkIndex = db.links.findIndex((l) => l.id === id);
  if (linkIndex === -1) return null;

  const deleted = db.links.splice(linkIndex, 1)[0];
  db.links.sort((a, b) => a.order - b.order).forEach((l, idx) => {
    l.order = idx + 1;
  });
  writeDb(db);
  return deleted;
}

export async function reorderLinksAsync(linkIds: string[]): Promise<LinkItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await Promise.all(
        linkIds.map((id, index) =>
          supabase!
            .from("links")
            .update({ display_order: index + 1 })
            .eq("id", id)
        )
      );
      return await getLinksAsync();
    } catch (err) {
      console.error("Error reordering in Supabase:", err);
    }
  }

  const db = readDb();
  const linkMap = new Map(db.links.map((l) => [l.id, l]));
  linkIds.forEach((id: string, index: number) => {
    const link = linkMap.get(id);
    if (link) {
      link.order = index + 1;
    }
  });
  writeDb(db);
  return [...db.links].sort((a, b) => a.order - b.order);
}

export async function getAdminAuthAsync(): Promise<{ passwordHash: string; salt: string }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("admin_auth")
        .select("*")
        .eq("id", 1)
        .single();
      if (!error && data) {
        return {
          passwordHash: data.password_hash,
          salt: data.salt,
        };
      }
    } catch (err) {
      console.error("Error reading admin_auth from Supabase:", err);
    }
  }
  return readDb().admin;
}
