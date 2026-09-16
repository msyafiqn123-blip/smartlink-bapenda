import { NextResponse } from "next/server";
import { getLinksAsync, createLinkAsync } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceAll = searchParams.get("all") === "true";
    const isAdmin = await isAdminAuthenticated();

    const onlyActive = !isAdmin && !forceAll;
    const links = await getLinksAsync({ onlyActive });

    return NextResponse.json({
      links,
      isAdmin,
    });
  } catch (err) {
    console.error("Error fetching links:", err);
    return NextResponse.json(
      { error: "Gagal mengambil daftar link" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login sebagai admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, url, thumbnail = null, isActive = true, type = "link" } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Judul wajib diisi" },
        { status: 400 }
      );
    }

    let validUrl: string | undefined = undefined;
    if (type === "link") {
      if (!url || typeof url !== "string" || !url.trim()) {
        return NextResponse.json(
          { error: "Alamat URL wajib diisi untuk tautan" },
          { status: 400 }
        );
      }
      validUrl = url.trim();
      if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
        validUrl = "https://" + validUrl;
      }
    }

    const newLink = await createLinkAsync({
      type: type === "header" ? "header" : "link",
      title: title.trim(),
      ...(validUrl ? { url: validUrl } : {}),
      thumbnail: thumbnail || null,
      isActive: Boolean(isActive),
    });

    return NextResponse.json({ success: true, link: newLink }, { status: 201 });
  } catch (err) {
    console.error("Error creating link:", err);
    return NextResponse.json(
      { error: "Gagal menambahkan link" },
      { status: 500 }
    );
  }
}
