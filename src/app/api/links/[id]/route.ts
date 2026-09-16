import { NextResponse } from "next/server";
import { updateLinkAsync, deleteLinkAsync } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login sebagai admin." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, url, thumbnail, isActive } = body;

    let validUrl: string | undefined = undefined;
    if (url !== undefined) {
      validUrl = url.trim();
      if (validUrl && !validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
        validUrl = "https://" + validUrl;
      }
    }

    const updated = await updateLinkAsync(id, {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(validUrl !== undefined ? { url: validUrl } : {}),
      ...(thumbnail !== undefined ? { thumbnail: thumbnail || null } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Link tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Link berhasil diperbarui",
      link: updated,
    });
  } catch (err) {
    console.error("Error updating link:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui link" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login sebagai admin." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deletedLink = await deleteLinkAsync(id);

    if (!deletedLink) {
      return NextResponse.json(
        { error: "Link tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Link berhasil dihapus",
      deletedLink,
    });
  } catch (err) {
    console.error("Error deleting link:", err);
    return NextResponse.json(
      { error: "Gagal menghapus link" },
      { status: 500 }
    );
  }
}
