import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { planSeed } from "../src/lib/seed-guard";
import { applyDefaultHours } from "../src/lib/default-hours";

// Throws before touching the database unless this is a local environment or
// demo data was explicitly requested (see src/lib/seed-guard.ts).
const seedPlan = planSeed(process.env);

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

async function main() {
  console.log(
    seedPlan.scope === "reference"
      ? "🌱 Seeding Pav Dental reference data (clinics, services, van)..."
      : "🌱 Seeding Pav Dental reference and demo data..."
  );

  // ─── 1. Clinics ────────────────────────────────────────────────────────────
  const clinicHarley = await prisma.clinic.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Pav Dental Central Practice",
      address: "14 Harley Street, Marylebone",
      postcode: "W1G 9PQ",
      city: "London",
      phone: "020 7946 0123",
      operatingHours: "Mon–Fri: 09:00 – 17:30, Sat: 09:00 – 13:00",
    },
  });

  await prisma.clinic.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Pav Dental Canary Wharf",
      address: "25 Bank Street, Level 2",
      postcode: "E14 5JP",
      city: "London",
      phone: "020 7946 0456",
      operatingHours: "Mon–Fri: 09:00 – 17:30, Sat: 09:00 – 13:00",
    },
  });

  // ─── 2. Services ───────────────────────────────────────────────────────────
  const servicesData = [
    {
      id: "srv_checkup",
      name: "Comprehensive Examination & 2 X-Rays",
      category: "checkup" as const,
      description: "Thorough 14-point oral health, gum & cancer screening plus low-radiation digital bitewing radiographs.",
      durationMinutes: 30,
      pricePence: 6500,
      depositPence: 2000,
      supportedChannels: ["clinic", "van"] as any,
      prepInstructions: ["Brush teeth 30 mins before arrival", "Bring current medication list"],
    },
    {
      id: "srv_hygiene",
      name: "AirFlow® Stain Removal & Hygiene",
      category: "hygiene" as const,
      description: "Gentle ultrasonic calculus removal followed by high-pressure warm water & bicarbonate stain polishing.",
      durationMinutes: 45,
      pricePence: 8500,
      depositPence: 2500,
      supportedChannels: ["clinic", "van"] as any,
      prepInstructions: ["Avoid dark liquids 2 hours after treatment"],
    },
    {
      id: "srv_video_triage",
      name: "Emergency Video Triage & E-Prescription",
      category: "emergency" as const,
      description: "Urgent 15-min live consultation for acute toothache, broken crown, or swelling with instant antibiotic/pain relief routing.",
      durationMinutes: 15,
      pricePence: 3500,
      depositPence: 3500,
      supportedChannels: ["video"] as any,
      prepInstructions: ["Ensure well-lit room for video inspection", "Have list of allergies ready"],
    },
    {
      id: "srv_whitening",
      name: "Enlighten® Evolution Teeth Whitening",
      category: "cosmetic" as const,
      description: "Guaranteed B1 shade result with custom-moulded lab trays and 2-week home gel kit + in-clinic booster.",
      durationMinutes: 45,
      pricePence: 49500,
      depositPence: 10000,
      requiresPriorConsult: true,
      supportedChannels: ["clinic"] as any,
      prepInstructions: ["Comprehensive exam must be completed within last 6 months"],
    },
    {
      id: "srv_filling",
      name: "Composite Tooth-Coloured Filling",
      category: "restorative" as const,
      description: "Mercury-free resin restoration matched precisely to your natural tooth enamel shade.",
      durationMinutes: 45,
      pricePence: 12000,
      depositPence: 3000,
      supportedChannels: ["clinic", "van"] as any,
      prepInstructions: ["Eat beforehand if receiving local anaesthetic"],
    },
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  // ─── 3. Van Fleet & PostGIS Service Area ───────────────────────────────────
  const van1 = await prisma.van.upsert({
    where: { registrationPlate: "PV24 DEN" },
    update: {},
    create: {
      name: "Pav Dental Van #1",
      registrationPlate: "PV24 DEN",
      vehicleModel: "Mercedes-Benz Sprinter 519 CDI (7.4m)",
    },
  });

  await prisma.vanServicePolygon.deleteMany({ where: { vanId: van1.id } });
  
  // Create multiple service polygons covering different London areas
  const serviceAreas = [
    {
      sectorName: "SW - South West London",
      polygonGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [-0.25, 51.45],
            [-0.10, 51.45],
            [-0.10, 51.52],
            [-0.25, 51.52],
            [-0.25, 51.45],
          ],
        ],
      },
    },
    {
      sectorName: "W - West London",
      polygonGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [-0.25, 51.48],
            [-0.15, 51.48],
            [-0.15, 51.55],
            [-0.25, 51.55],
            [-0.25, 51.48],
          ],
        ],
      },
    },
    {
      sectorName: "EC - East Central London",
      polygonGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [-0.10, 51.50],
            [-0.05, 51.50],
            [-0.05, 51.52],
            [-0.10, 51.52],
            [-0.10, 51.50],
          ],
        ],
      },
    },
    {
      sectorName: "WC - West Central London",
      polygonGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [-0.15, 51.50],
            [-0.10, 51.50],
            [-0.10, 51.52],
            [-0.15, 51.52],
            [-0.15, 51.50],
          ],
        ],
      },
    },
    {
      sectorName: "SE - South East London",
      polygonGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [-0.10, 51.45],
            [0.05, 51.45],
            [0.05, 51.52],
            [-0.10, 51.52],
            [-0.10, 51.45],
          ],
        ],
      },
    },
    {
      sectorName: "NW - North West London",
      polygonGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [-0.25, 51.52],
            [-0.15, 51.52],
            [-0.15, 51.58],
            [-0.25, 51.58],
            [-0.25, 51.52],
          ],
        ],
      },
    },
    {
      sectorName: "E - East London",
      polygonGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [-0.05, 51.48],
            [0.10, 51.48],
            [0.10, 51.55],
            [-0.05, 51.55],
            [-0.05, 51.48],
          ],
        ],
      },
    },
  ];

  for (const area of serviceAreas) {
    await prisma.vanServicePolygon.create({
      data: {
        vanId: van1.id,
        ...area,
      },
    });
  }

  if (seedPlan.scope === "reference") {
    // Default hours for each clinic; clinicians get a rota when they're added.
    await applyDefaultHours(prisma);
    console.log("✅ Reference data seeded. No accounts, clinical records or bookings were created.");
    return;
  }

  // ─── 4. Known User Accounts (demo password, see seed-guard) ──────────────────
  const defaultPasswordHash = await hashPassword(seedPlan.demoPassword);

  // A. Patient Account: Alexander Wright
  let patientUser = await prisma.user.findUnique({ where: { email: "patient@pavdental.com" } });
  if (!patientUser) {
    patientUser = await prisma.user.create({
      data: {
        email: "patient@pavdental.com",
        phone: "+447700900001",
        passwordHash: defaultPasswordHash,
        role: "patient",
        emailVerified: true,
        phoneVerified: true,
      },
    });
  }

  const patientProfile = await prisma.patientProfile.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      firstName: "Alexander",
      lastName: "Wright",
      dob: new Date("1990-05-14"),
      gender: "male",
      addressLine1: "14 Harley Street",
      city: "London",
      postcode: "W1G 9PQ",
      emergencyContactName: "Eleanor Wright",
      emergencyContactPhone: "+447700900099",
      medicalHistory: {
        allergies: ["Penicillin"],
        medications: ["None"],
        conditions: ["Mild Bruxism"],
      },
      consents: {
        gdpr: true,
        signedAt: new Date().toISOString(),
      },
    },
  });

  // B. Clinician Account: Dr. Tariq Pav
  let docUser = await prisma.user.findUnique({ where: { email: "doctor@pavdental.com" } });
  if (!docUser) {
    docUser = await prisma.user.create({
      data: {
        email: "doctor@pavdental.com",
        phone: "+447700900002",
        passwordHash: defaultPasswordHash,
        role: "clinician",
        emailVerified: true,
      },
    });
  }

  const docProfile = await prisma.clinicianProfile.upsert({
    where: { userId: docUser.id },
    update: {},
    create: {
      userId: docUser.id,
      fullName: "Dr. Tariq Pav",
      // 99999x is far above any GDC number issued so far, so these can't match a
      // real registrant (SD-2) while still passing the 6-digit format check that
      // prescribing enforces. Phone numbers use Ofcom drama ranges.
      gdcNumber: "999991",
      roleTitle: "Clinical Director & Implant Surgeon",
      specialisms: ["Implantology", "Invisalign", "Sedation"],
      bio: "Over 14 years clinical experience across London teaching hospitals and private surgeries.",
      isTelehealthActive: true,
    },
  });

  // C. Van Operator Account
  let vanUser = await prisma.user.findUnique({ where: { email: "van@pavdental.com" } });
  if (!vanUser) {
    vanUser = await prisma.user.create({
      data: {
        email: "van@pavdental.com",
        phone: "+447700900003",
        passwordHash: defaultPasswordHash,
        role: "operator",
        emailVerified: true,
      },
    });
  }

  // C2. Operator Profile & Van Assignment
  let opProfile = await prisma.operatorProfile.findUnique({ where: { userId: vanUser.id } });
  if (!opProfile) {
    opProfile = await prisma.operatorProfile.create({
      data: {
        userId: vanUser.id,
        fullName: "Pav Dental Van Operator",
        phone: "+447700900003",
      },
    });
  }

  const existingAssignment = await prisma.vanOperatorAssignment.findFirst({
    where: { operatorId: opProfile.id, vanId: van1.id },
  });
  if (!existingAssignment) {
    await prisma.vanOperatorAssignment.create({
      data: {
        operatorId: opProfile.id,
        vanId: van1.id,
        startsAt: new Date(Date.now() - 30 * 24 * 3600 * 1000), // 30 days ago
      },
    });
  }

  // D. Administrator Account
  let adminUser = await prisma.user.findUnique({ where: { email: "admin@pavdental.com" } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@pavdental.com",
        phone: "+447700900004",
        passwordHash: defaultPasswordHash,
        role: "admin",
        emailVerified: true,
      },
    });
  }

  // Additional Clinicians
  let sarahUser = await prisma.user.findUnique({ where: { email: "sarah.jenkins@pavdental.com" } });
  if (!sarahUser) {
    sarahUser = await prisma.user.create({
      data: {
        email: "sarah.jenkins@pavdental.com",
        passwordHash: defaultPasswordHash,
        role: "clinician",
      },
    });
    await prisma.clinicianProfile.create({
      data: {
        userId: sarahUser.id,
        fullName: "Dr. Sarah Jenkins",
        gdcNumber: "999992",
        roleTitle: "General Dental Practitioner",
        specialisms: ["Aesthetic Restorations", "Endodontics", "Anxious Patients"],
        bio: "Special interest in minimally invasive dentistry and nervous patient care.",
      },
    });
  }

  // ─── 5. Patient Clinical Baseline (Odontogram, Plans, Documents) ───────────

  // Universal 32-tooth odontogram baseline
  const teethData = [
    { toothNumber: 1, arch: "upper", quadrant: "upper_right", condition: "missing" as const },
    { toothNumber: 2, arch: "upper", quadrant: "upper_right", condition: "healthy" as const },
    { toothNumber: 3, arch: "upper", quadrant: "upper_right", condition: "filled" as const, notes: "Composite MOD" },
    { toothNumber: 4, arch: "upper", quadrant: "upper_right", condition: "healthy" as const },
    { toothNumber: 5, arch: "upper", quadrant: "upper_right", condition: "healthy" as const },
    { toothNumber: 6, arch: "upper", quadrant: "upper_right", condition: "healthy" as const },
    { toothNumber: 7, arch: "upper", quadrant: "upper_right", condition: "healthy" as const },
    { toothNumber: 8, arch: "upper", quadrant: "upper_right", condition: "healthy" as const },
    { toothNumber: 9, arch: "upper", quadrant: "upper_left", condition: "healthy" as const },
    { toothNumber: 10, arch: "upper", quadrant: "upper_left", condition: "healthy" as const },
    { toothNumber: 11, arch: "upper", quadrant: "upper_left", condition: "healthy" as const },
    { toothNumber: 12, arch: "upper", quadrant: "upper_left", condition: "healthy" as const },
    { toothNumber: 13, arch: "upper", quadrant: "upper_left", condition: "healthy" as const },
    { toothNumber: 14, arch: "upper", quadrant: "upper_left", condition: "crown" as const, notes: "Zirconia Porcelain" },
    { toothNumber: 15, arch: "upper", quadrant: "upper_left", condition: "healthy" as const },
    { toothNumber: 16, arch: "upper", quadrant: "upper_left", condition: "missing" as const },
    { toothNumber: 17, arch: "lower", quadrant: "lower_left", condition: "missing" as const },
    { toothNumber: 18, arch: "lower", quadrant: "lower_left", condition: "healthy" as const },
    { toothNumber: 19, arch: "lower", quadrant: "lower_left", condition: "root_canal" as const, notes: "Completed 2024" },
    { toothNumber: 20, arch: "lower", quadrant: "lower_left", condition: "healthy" as const },
    { toothNumber: 21, arch: "lower", quadrant: "lower_left", condition: "healthy" as const },
    { toothNumber: 22, arch: "lower", quadrant: "lower_left", condition: "healthy" as const },
    { toothNumber: 23, arch: "lower", quadrant: "lower_left", condition: "healthy" as const },
    { toothNumber: 24, arch: "lower", quadrant: "lower_left", condition: "healthy" as const },
    { toothNumber: 25, arch: "lower", quadrant: "lower_right", condition: "healthy" as const },
    { toothNumber: 26, arch: "lower", quadrant: "lower_right", condition: "healthy" as const },
    { toothNumber: 27, arch: "lower", quadrant: "lower_right", condition: "healthy" as const },
    { toothNumber: 28, arch: "lower", quadrant: "lower_right", condition: "healthy" as const },
    { toothNumber: 29, arch: "lower", quadrant: "lower_right", condition: "healthy" as const },
    { toothNumber: 30, arch: "lower", quadrant: "lower_right", condition: "filled" as const },
    { toothNumber: 31, arch: "lower", quadrant: "lower_right", condition: "decay" as const, notes: "Needs composite restoration" },
    { toothNumber: 32, arch: "lower", quadrant: "lower_right", condition: "missing" as const },
  ];

  for (const t of teethData) {
    await prisma.toothRecord.upsert({
      where: { patientId_toothNumber: { patientId: patientProfile.id, toothNumber: t.toothNumber } },
      update: t,
      create: { patientId: patientProfile.id, ...t },
    });
  }

  // Treatment plan
  await prisma.treatmentPlan.deleteMany({ where: { patientId: patientProfile.id } });
  await prisma.treatmentPlan.create({
    data: {
      patientId: patientProfile.id,
      clinicianId: docProfile.id,
      title: "Comprehensive Restorative & Gum Health Plan",
      status: "pending_acceptance",
      totalCostPence: 20500,
      items: {
        create: [
          {
            code: "F31",
            description: "Composite White Resin Filling (Tooth LR7 / #31)",
            toothNumber: 31,
            costPence: 12000,
            isAccepted: true,
          },
          {
            code: "HYG",
            description: "AirFlow Periodontal Therapy & Scale",
            costPence: 8500,
            isAccepted: true,
          },
        ],
      },
    },
  });

  // Document Vault
  await prisma.documentVault.deleteMany({ where: { patientId: patientProfile.id } });
  await prisma.documentVault.createMany({
    data: [
      {
        patientId: patientProfile.id,
        docType: "xray",
        title: "Digital Bitewing Radiograph (Right Quadrant)",
        fileKey: "xrays/bw_right.dcm",
        fileSizeBytes: "2.4 MB",
      },
      {
        patientId: patientProfile.id,
        docType: "prescription",
        title: "Electronic Prescription (Amoxicillin 500mg)",
        fileKey: "rx/amox_500.pdf",
        fileSizeBytes: "142 KB",
      },
      {
        patientId: patientProfile.id,
        docType: "invoice",
        title: "VAT Clinical Call-Out Invoice #INV-2026-089",
        fileKey: "invoices/inv_089.pdf",
        fileSizeBytes: "84 KB",
      },
    ],
  });

  // ─── 6. Active Bookings Across All 3 Channels ──────────────────────────────
  // Created once: re-running the seed must not double-book the clinician,
  // which the database refuses (CS-16).
  const createSeedAppointmentOnce = async (args: Parameters<typeof prisma.appointment.create>[0]) => {
    const existing = await prisma.appointment.findFirst({ where: { stripePaymentId: args.data.stripePaymentId as string } });
    if (!existing) await prisma.appointment.create(args);
  };
  const today = new Date();
  today.setHours(10, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Clinic Appointment
  await createSeedAppointmentOnce({
    data: {
      patientId: patientProfile.id,
      clinicianId: docProfile.id,
      serviceId: "srv_checkup",
      channel: "clinic",
      clinicId: clinicHarley.id,
      startTimeUtc: today,
      endTimeUtc: new Date(today.getTime() + 30 * 60000),
      status: "confirmed",
      totalPricePence: 6500,
      depositPaidPence: 2000,
      stripePaymentId: "pi_seed_clinic_01",
    },
  });

  // Van Appointment (for Operator Route)
  const vanApptTime = new Date(today);
  vanApptTime.setHours(12, 0, 0, 0);
  await createSeedAppointmentOnce({
    data: {
      patientId: patientProfile.id,
      clinicianId: docProfile.id,
      vanId: van1.id,
      serviceId: "srv_hygiene",
      channel: "van",
      startTimeUtc: vanApptTime,
      endTimeUtc: new Date(vanApptTime.getTime() + 45 * 60000),
      status: "confirmed",
      totalPricePence: 8500,
      depositPaidPence: 2500,
      accessDetails: {
        address: "14 Harley Street, London, W1G 9PQ",
        parking: "Private Driveway · Gate Code #4812",
      },
      stripePaymentId: "pi_seed_van_01",
    },
  });

  // Video Consultation Appointment (for Clinician Video Consult Room)
  const videoApptTime = new Date(today);
  videoApptTime.setHours(15, 0, 0, 0);
  await createSeedAppointmentOnce({
    data: {
      patientId: patientProfile.id,
      clinicianId: docProfile.id,
      serviceId: "srv_video_triage",
      channel: "video",
      startTimeUtc: videoApptTime,
      endTimeUtc: new Date(videoApptTime.getTime() + 15 * 60000),
      status: "confirmed",
      totalPricePence: 3500,
      depositPaidPence: 3500,
      triageData: {
        complaint: "Severe LR7 throbbing pain upon cold liquids",
        painScore: 7,
      },
      intraoralPhotos: ["https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300"],
      stripePaymentId: "pi_seed_video_01",
    },
  });

  console.log("✅ Database Baseline Seed Completed Successfully!");
  console.log("--------------------------------------------------");
  // ─── Opening hours and rota (decisions log #12) ─────────────────────────────
  // Default hours for every clinic and the same weekly rota for every
  // clinician, so slots exist out of the box.
  await applyDefaultHours(prisma);

  console.log(
    seedPlan.printPassword
      ? `Ready-to-test credentials (Password: ${seedPlan.demoPassword}):`
      : "Ready-to-test credentials (password: the SEED_DEMO_PASSWORD you supplied):"
  );
  console.log("  Patient:   patient@pavdental.com");
  console.log("  Clinician: doctor@pavdental.com");
  console.log("  Operator:  van@pavdental.com");
  console.log("  Admin:     admin@pavdental.com");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
