import { NextResponse } from "next/server";
import { reorderLinksAsync } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

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
    const { linkIds } = body;

    if (!Array.isArray(linkIds)) {
      return NextResponse.json(
        { error: "Format linkIds tidak valid" },
        { status: 400 }
      );
    }

    const reordered = await reorderLinksAsync(linkIds);

    return NextResponse.json({
      success: true,
      message: "Urutan link berhasil diperbarui",
      links: reordered,
    });
  } catch (err) {
    console.error("Error reordering links:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui urutan link" },
      { status: 500 }
    );
  }
}
