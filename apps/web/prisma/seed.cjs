/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const slug = "sample-app";

  // upsert software
  const sw = await prisma.software.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name: "Sample App",
      shortDesc: "A sample application entry.",
      longDesc: "This is a longer description for Sample App used for testing.",
      category: "Utilities",
      website: "https://example.com",
      license: "Freeware",
      published: true,
    },
    select: { id: true, slug: true, name: true },
  });

  const v = await prisma.version.upsert({
    where: { softwareId_version: { softwareId: sw.id, version: "1.0.0" } },
    update: {},
    create: {
      softwareId: sw.id,
      version: "1.0.0",
      channel: "STABLE",
      notes: "Initial release",
      published: true,
    },
    select: { id: true, version: true },
  });

  await prisma.build.create({
    data: {
      versionId: v.id,
      os: "WINDOWS",
      arch: "X64",
      kind: "EXE",
      filename: "sample-app-1.0.0-x64.exe",
      sizeBytes: BigInt(12_345_678),
      sha256: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      portable: false,
      silentFlags: "/S",
    },
  });

  await prisma.faq.create({
    data: {
      softwareId: sw.id,
      question: "Is Sample App free?",
      answer: "Yes, it's freeware for testing.",
    },
  });

  await prisma.requirement.create({
    data: {
      softwareId: sw.id,
      versionId: v.id,
      scope: "Windows",
      text: "Windows 10 or later, 100MB free disk space.",
    },
  });

  console.log("Seeded:", sw.slug, v.version);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
