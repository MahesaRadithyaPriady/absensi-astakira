import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";

export async function savePhoto(file: File, nik: string): Promise<string> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${nik}_${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return relative path for database storage
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("[UPLOAD] Error saving photo:", error);
    throw new Error("Failed to save photo");
  }
}

export async function deletePhoto(photoPath: string): Promise<void> {
  try {
    const filepath = join(process.cwd(), "public", photoPath);
    await writeFile(filepath, Buffer.from("")); // Simple delete approach
  } catch (error) {
    console.error("[UPLOAD] Error deleting photo:", error);
    // Don't throw error for delete failures
  }
}

export function validatePhoto(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
}
