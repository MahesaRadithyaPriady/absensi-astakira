import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const pengurusPassword = await bcrypt.hash("pengurus123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      name: "Administrator",
      role: "ADMIN",
    },
  });

  const pengurus = await prisma.user.upsert({
    where: { username: "pengurus" },
    update: {},
    create: {
      username: "pengurus",
      password: pengurusPassword,
      name: "Kepengurusan Astakira",
      role: "KEPENGURUSAN",
    },
  });

  // Seed Karyawan
  const karyawan1 = await prisma.karyawan.upsert({
    where: { nik: "K001" },
    update: {},
    create: {
      nik: "K001",
      nama: "Budi Santoso",
      jabatan: "Staff Marketing",
      departemen: "Marketing",
      noHp: "081234567890",
      email: "budi@astakira.com",
      alamat: "Jl. Mawar No. 1, Jakarta",
      qrCode: "AST-K001-ABC12345",
      kartuFisik: "KARTU-K001-1234567890",
    },
  });

  const karyawan2 = await prisma.karyawan.upsert({
    where: { nik: "K002" },
    update: {},
    create: {
      nik: "K002",
      nama: "Siti Aminah",
      jabatan: "Staff HR",
      departemen: "HRD",
      noHp: "081234567891",
      email: "siti@astakira.com",
      alamat: "Jl. Melati No. 2, Jakarta",
      qrCode: "AST-K002-DEF67890",
    },
  });

  const karyawan3 = await prisma.karyawan.upsert({
    where: { nik: "K003" },
    update: {},
    create: {
      nik: "K003",
      nama: "Ahmad Hidayat",
      jabatan: "Manager IT",
      departemen: "IT",
      noHp: "081234567892",
      email: "ahmad@astakira.com",
      alamat: "Jl. Kenanga No. 3, Jakarta",
      qrCode: "AST-K003-GHI11223",
    },
  });

  console.log("Seed data created:");
  console.log({ admin, pengurus, karyawan1, karyawan2, karyawan3 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
