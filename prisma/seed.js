const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  let admin = await prisma.user.findFirst({ where: { email: "admin@parai.app" } });
  if (!admin) {
    const hashed = await bcrypt.hash("admin123", 10);
    admin = await prisma.user.create({
      data: { email: "admin@parai.app", name: "Parai Admin", password: hashed },
    });
    console.log("Created admin user:", admin.email);
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

  let nilai1 = await prisma.nilai.findFirst({ where: { name: "Nilai 1" } });
  if (!nilai1) {
    nilai1 = await prisma.nilai.create({
      data: {
        name: "Nilai 1",
        order: 1,
        tutorialId: tutorial.id,
        beats: {
          create: [
            { name: "Thi", type: "Big Stick", order: 0, audioUrl: "/audio/thi.wav" },
            { name: "Tha", type: "Small Stick", order: 1, audioUrl: "/audio/tha.wav" },
            { name: "Theem", type: "Both Sticks", order: 2, audioUrl: "/audio/theem.wav" },
          ],
        },
      },
    });
    console.log("Created Nilai 1 with 3 beats");
  }

  let nilai2 = await prisma.nilai.findFirst({ where: { name: "Nilai 2" } });
  if (!nilai2) {
    nilai2 = await prisma.nilai.create({
      data: {
        name: "Nilai 2",
        order: 2,
        tutorialId: tutorial.id,
        beats: {
          create: [
            { name: "Ku", type: "Big Stick", order: 0, audioUrl: "/audio/ku.wav" },
            { name: "Ka", type: "Big Stick", order: 1, audioUrl: "/audio/ka.wav" },
          ],
        },
      },
    });
    console.log("Created Nilai 2 with 2 beats");
  }

  let nilai3 = await prisma.nilai.findFirst({ where: { name: "Nilai 3" } });
  if (!nilai3) {
    nilai3 = await prisma.nilai.create({
      data: {
        name: "Nilai 3",
        order: 3,
        tutorialId: tutorial.id,
        beats: {
          create: [
            { name: "Thi", type: "Big Stick", order: 0, audioUrl: "/audio/thi.wav" },
            { name: "Tha", type: "Small Stick", order: 1, audioUrl: "/audio/tha.wav" },
            { name: "Theem", type: "Both Sticks", order: 2, audioUrl: "/audio/theem.wav" },
            { name: "Ku", type: "Big Stick", order: 3, audioUrl: "/audio/ku.wav" },
          ],
        },
      },
    });
    console.log("Created Nilai 3 with 4 beats");
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
