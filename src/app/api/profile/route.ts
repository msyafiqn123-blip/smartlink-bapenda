import { NextResponse } from "next/server";
import { getProfileAsync, updateProfileAsync } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const profile = await getProfileAsync();
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return NextResponse.json(
      { error: "Gagal mengambil profil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login sebagai admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, bio, avatarUrl, theme, newPassword } = body;

    if (newPassword && typeof newPassword === "string" && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 4) {
        return NextResponse.json(
          { error: "Kata sandi baru minimal 4 karakter" },
          { status: 400 }
        );
      }
    }

    const updatedProfile = await updateProfileAsync(
      {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(bio !== undefined ? { bio: bio.trim() } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl.trim() } : {}),
        ...(theme !== undefined ? { theme } : {}),
      },
      newPassword
    );

    return NextResponse.json({
      success: true,
      message: "Pengaturan berhasil diperbarui",
      profile: updatedProfile,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
