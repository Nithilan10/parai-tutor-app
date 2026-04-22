import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { tamilSequenceToEnglishType } from "../lib/tamilBeatNotation.js";
import { CANONICAL_BEATS_BY_NILAI_NAME } from "../lib/repairNilaiBeats.js";

const prisma = new PrismaClient();

async function syncNilaiTamilBeats({ name, order, tutorialId, sequences }) {
  let n = await prisma.nilai.findFirst({ where: { name, tutorialId } });
  if (!n) {
    n = await prisma.nilai.create({
      data: { name, order, tutorialId },
    });
    console.log("Created", name);
  } else if (n.order !== order) {
    n = await prisma.nilai.update({
      where: { id: n.id },
      data: { order },
    });
  }

  await prisma.beat.deleteMany({ where: { nilaiId: n.id } });
  for (let i = 0; i < sequences.length; i++) {
    const tamil = sequences[i];
    await prisma.beat.create({
      data: {
        nilaiId: n.id,
        name: tamil,
        type: tamilSequenceToEnglishType(tamil),
        order: i,
        audioUrl: null,
      },
    });
  }
  console.log("Synced", name, "with", sequences.length, "beats");
}

async function main() {
  let admin = await prisma.user.findFirst({ where: { email: "admin@parai.app" } });
  if (!admin) {
    const hashed = await bcrypt.hash("admin123", 10);
    admin = await prisma.user.create({
      data: { email: "admin@parai.app", name: "Parai Admin", password: hashed },
    });
    console.log("Created admin user:", admin.email);
  }

  let demo = await prisma.user.findFirst({ where: { email: "demo@parai.app" } });
  if (!demo) {
    const hashed = await bcrypt.hash("demo123", 10);
    demo = await prisma.user.create({
      data: { email: "demo@parai.app", name: "Demo Learner", password: hashed },
    });
    console.log("Created demo user:", demo.email);
  }

  let tutorial = await prisma.tutorial.findFirst();
  if (!tutorial) {
    tutorial = await prisma.tutorial.create({
      data: {
        title: "Parai Basics",
        description: "Learn the fundamental beats of Parai drumming.",
        authorId: admin.id,
      },
    });
    console.log("Created tutorial:", tutorial.title);
  }

  await prisma.nilai.deleteMany({
    where: {
      OR: [
        { name: "Nilai 5" },
        { name: "Nilai 6" },
        { name: "Nilai 7: Advanced Cadence" },
      ],
    },
  });

  for (const [name, order] of [
    ["Nilai 1", 1],
    ["Nilai 2", 2],
    ["Nilai 3", 3],
    ["Nilai 4", 4],
  ]) {
    await syncNilaiTamilBeats({
      name,
      order,
      tutorialId: tutorial.id,
      sequences: CANONICAL_BEATS_BY_NILAI_NAME[name],
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
