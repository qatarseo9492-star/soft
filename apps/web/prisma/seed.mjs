// prisma/seed.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = "filespay-desktop";
  const name = "FilesPay Desktop";
  const shortDesc = "Secure file downloads with signed links and stats.";
  const longDesc =
    "FilesPay Desktop provides a streamlined experience for secure file downloads, analytics, and admin tooling.";

  // 1) Software
  const software = await prisma.software.upsert({
    where: { slug },
    update: { name, shortDesc, longDesc, published: true },
    create: {
      slug,
      name,
      shortDesc,
      longDesc,
      category: "Utilities",
      website: "https://filespay.org",
      license: "Proprietary",
      published: true
    }
  });
  console.log("✔ Software:", software.slug);

  // 2) Version 1.0.0 (with a Windows build)
  const v100 = await prisma.version.upsert({
    where: { softwareId_version: { softwareId: software.id, version: "1.0.0" } },
    update: {},
    create: {
      softwareId: software.id,
      version: "1.0.0",
      channel: "STABLE",
      published: true,
      notes: "Initial stable release.",
      builds: {
        create: [
          {
            os: "WINDOWS",
            arch: "X64",
            kind: "EXE",
            filename: "filespay-setup-1.0.0.exe",
            sizeBytes: BigInt(24_576_000),
            sha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            portable: false,
            silentFlags: "/S"
          }
        ]
      }
    }
  });
  console.log("✔ Version:", v100.version);

  // 3) Version 1.1.0 derived from 1.0.0 (with Win + Mac builds)
  const v110 = await prisma.version.upsert({
    where: { softwareId_version: { softwareId: software.id, version: "1.1.0" } },
    update: {},
    create: {
      softwareId: software.id,
      version: "1.1.0",
      channel: "STABLE",
      published: true,
      notes: "Performance improvements and minor fixes.",
      derivedFromVersionId: v100.id,
      builds: {
        create: [
          {
            os: "WINDOWS",
            arch: "X64",
            kind: "EXE",
            filename: "filespay-setup-1.1.0.exe",
            sizeBytes: BigInt(25_165_824),
            sha256: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            portable: false,
            silentFlags: "/S"
          },
          {
            os: "MACOS",
            arch: "ARM64",
            kind: "DMG",
            filename: "filespay-1.1.0.dmg",
            sizeBytes: BigInt(22_020_096),
            sha256: "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
            portable: false
          }
        ]
      }
    }
  });
  console.log("✔ Version:", v110.version);

  // 4) FAQ
  await prisma.faq.upsert({
    where: { id: `${software.id}-faq-1` }, // fabricate stable key or just create many
    update: {},
    create: {
      id: `${software.id}-faq-1`,
      softwareId: software.id,
      question: "Is FilesPay Desktop free?",
      answer:
        "Yes, the desktop app is free to download. Some advanced features may require a subscription."
    }
  });

  // 5) Requirement example attached to software + specific version
  await prisma.requirement.create({
    data: {
      softwareId: software.id,
      versionId: v110.id,
      scope: "system",
      text: "Windows 10 (21H2) or macOS 12+, 4GB RAM, 200MB free disk"
    }
  });

  // 6) Optional: SEO meta (auto-generated example)
  await prisma.seoMeta.upsert({
    where: { softwareId: software.id },
    update: {
      title: `${name} — Secure downloads`,
      description: shortDesc,
      canonical: `https://filespay.org/software/${slug}`,
      generated: true,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name,
        applicationCategory: "Utilities",
        operatingSystem: "Windows, macOS",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      }
    },
    create: {
      softwareId: software.id,
      title: `${name} — Secure downloads`,
      description: shortDesc,
      canonical: `https://filespay.org/software/${slug}`,
      generated: true,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name,
        applicationCategory: "Utilities",
        operatingSystem: "Windows, macOS",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      }
    }
  });

  console.log("✔ Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
