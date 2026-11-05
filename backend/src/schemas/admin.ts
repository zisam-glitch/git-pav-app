import { z } from "zod";

const uuid = z.string().guid();
const role = z.enum(["patient", "clinician", "operator", "admin"]);
const appointmentStatus = z.enum(["draft_hold", "confirmed", "in_progress", "completed", "cancelled", "no_show"]);
const channel = z.enum(["clinic", "van", "video"]);

export const adminUsersQuerySchema = z.object({
  role: role.optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const adminAppointmentsQuerySchema = z.object({
  status: appointmentStatus.optional(),
  channel: channel.optional(),
  /** UK calendar days, both included. */
  from: isoDay.optional(),
  to: isoDay.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const adminPrescriptionsQuerySchema = z.object({
  /** UK calendar days, both included, by the day the prescription was issued. */
  from: isoDay.optional(),
  to: isoDay.optional(),
  clinicianId: uuid.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const appointmentIdParamsSchema = z.object({ id: uuid }).strict();

export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatus,
}).strict();

export const adminAuditLogsQuerySchema = z.object({
  /** Matches the start of the action name, e.g. "admin." or "admin.appointment". */
  action: z.string().trim().regex(/^[a-z_.]{1,80}$/).optional(),
  resourceId: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
}).strict();

// ─── Opening hours and rota (CS-30, CS-31) ──────────────────────────────────
// Times are minutes after midnight, UK time; weekday 0 = Sunday.
const minuteOfDay = z.number().int().min(0).max(1440);
const weekday = z.number().int().min(0).max(6);
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Invalid calendar date");

const block = <T extends z.ZodRawShape>(shape: T, start: string, end: string) =>
  z.object(shape).strict().refine((b: Record<string, unknown>) => (b[start] as number) < (b[end] as number), `${start} must be before ${end}`);

export const clinicHoursSchema = z.object({
  hours: z
    .array(block({ weekday, opensMinute: minuteOfDay, closesMinute: minuteOfDay }, "opensMinute", "closesMinute"))
    .max(7)
    .refine((rows) => new Set(rows.map((r) => r.weekday)).size === rows.length, "One row per weekday"),
}).strict();

export const clinicClosureSchema = z.object({
  date: calendarDate,
  reason: z.string().trim().min(1).max(200).optional(),
}).strict();

export const clinicianRotaSchema = z.object({
  blocks: z
    .array(block({ weekday, startMinute: minuteOfDay, endMinute: minuteOfDay, clinicId: uuid.nullable().optional() }, "startMinute", "endMinute"))
    .max(50)
    .refine((blocks) => {
      // Blocks on the same day can't overlap.
      const sorted = [...blocks].sort((a, b) => a.weekday - b.weekday || a.startMinute - b.startMinute);
      return sorted.every((b, i) => i === 0 || sorted[i - 1].weekday !== b.weekday || sorted[i - 1].endMinute <= b.startMinute);
    }, "Blocks on the same day overlap"),
}).strict();

export const rotaOverrideSchema = z.union([
  // Not working that day.
  z.object({ working: z.literal(false), reason: z.string().trim().min(1).max(200).optional() }).strict(),
  block(
    {
      working: z.literal(true),
      startMinute: minuteOfDay,
      endMinute: minuteOfDay,
      clinicId: uuid.nullable().optional(),
      reason: z.string().trim().min(1).max(200).optional(),
    },
    "startMinute",
    "endMinute"
  ),
]);

export const idParamsSchema = z.object({ id: uuid }).strict();
export const idDateParamsSchema = z.object({ id: uuid, date: calendarDate }).strict();
export const dateRangeQuerySchema = z.object({ from: calendarDate.optional(), to: calendarDate.optional() }).strict();

// ─── Back office onboarding & management (CS-31, AD-1) ──────────────────────
export const createClinicianSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128).optional(),
  fullName: z.string().trim().min(2).max(100),
  gdcNumber: z.string().trim().regex(/^\d{6}$/, "GDC number must be exactly 6 digits"),
  roleTitle: z.string().trim().min(2).max(100),
  specialisms: z.array(z.string().trim()).default([]),
  bio: z.string().trim().max(1000).optional(),
  photoUrl: z.string().url().optional(),
  isTelehealthActive: z.boolean().default(true),
}).strict();

// The public profile staff edit for the app and the website's team page.
// Photos are an https link or a small uploaded image (the dashboard sends a
// data URI when no image host is set up).
const profilePhoto = z.union([
  z.string().url().max(2000).refine((u) => u.startsWith("https://"), "Photo link must start with https://"),
  z.string().max(1_500_000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, "Photo must be a PNG, JPEG or WebP image"),
]);

export const clinicianProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  gdcNumber: z.string().trim().regex(/^\d{6}$/, "GDC number must be exactly 6 digits").optional(),
  roleTitle: z.string().trim().min(2).max(100).optional(),
  specialisms: z.array(z.string().trim().min(1).max(60)).max(12).optional(),
  bio: z.string().trim().max(1500).nullable().optional(),
  photoUrl: profilePhoto.nullable().optional(),
  showOnWebsite: z.boolean().optional(),
}).strict();

export const websiteOrderSchema = z.object({
  clinicianIds: z.array(uuid).min(1).max(100).refine((ids) => new Set(ids).size === ids.length, "Each clinician once"),
}).strict();

export const createOperatorSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128).optional(),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(5).max(30).optional(),
}).strict();

export const createClinicSchema = z.object({
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(2).max(200),
  postcode: z.string().trim().min(2).max(20),
  city: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(5).max(30),
  operatingHours: z.string().trim().min(2).max(200).default("Mon–Fri 09:00–17:30, Sat 09:00–13:00"),
  isActive: z.boolean().default(true),
}).strict();

export const createVanSchema = z.object({
  name: z.string().trim().min(2).max(100),
  registrationPlate: z.string().trim().min(2).max(20),
  vehicleModel: z.string().trim().min(2).max(100),
  isActive: z.boolean().default(true),
}).strict();

export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).default(""),
  category: z.enum(["checkup", "hygiene", "emergency", "restorative", "cosmetic"]).default("checkup"),
  durationMinutes: z.number().int().min(5).max(480).default(30),
  pricePence: z.number().int().min(0),
  depositPence: z.number().int().min(0).default(0),
  supportedChannels: z.array(z.enum(["clinic", "van", "video"])).default(["clinic", "van", "video"]),
  prepInstructions: z.array(z.string().trim()).default([]),
  requiresPriorConsult: z.boolean().default(false),
  isActive: z.boolean().default(true),
}).strict();

// BE-10: staff fix details or retire a clinic, van or service. Only the
// fields sent change; at least one must be sent. Retiring (isActive false)
// hides it from new bookings and keeps its history.
function partialWithoutDefaults<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  const shape = schema.shape;
  const newShape: Record<string, z.ZodTypeAny> = {};
  for (const [k, v] of Object.entries(shape)) {
    const unwrapped = v instanceof z.ZodDefault ? v.removeDefault() : v;
    newShape[k] = (unwrapped as z.ZodTypeAny).optional();
  }
  return z.object(newShape).strict();
}

const nonEmpty = (value: Record<string, unknown>) => Object.keys(value).length > 0;
const atLeastOneField = { message: "Send at least one field to change" };
export const updateClinicSchema = partialWithoutDefaults(createClinicSchema).refine(nonEmpty, atLeastOneField);
export const updateVanSchema = partialWithoutDefaults(createVanSchema).refine(nonEmpty, atLeastOneField);
export const updateServiceSchema = partialWithoutDefaults(createServiceSchema)
  .extend({ supportedChannels: z.array(z.enum(["clinic", "van", "video"])).min(1).optional() })
  .refine(nonEmpty, atLeastOneField);
/** Service ids are slugs, not uuids (seeded "srv_checkup", or "srv_" plus 8 hex characters). */
export const serviceIdParamsSchema = z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/) }).strict();

// A GeoJSON position is [longitude, latitude].
const position = z
  .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
  .rest(z.number());
// A closed ring: at least four positions, the last the same as the first.
const linearRing = z
  .array(position)
  .min(4)
  .max(5000)
  .refine((ring) => ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1], {
    message: "Each ring must end where it starts",
  });

/**
 * A van's service area: one GeoJSON Polygon (outer ring, then any holes).
 * The database stores it as geometry(Polygon, 4326), so a MultiPolygon is
 * added as separate areas.
 */
export const vanServiceAreaGeoJsonSchema = z
  .object({
    type: z.literal("Polygon"),
    coordinates: z.array(linearRing).min(1).max(50),
  })
  .strict();

export const assignVanPolygonSchema = z.object({
  sectorName: z.string().trim().min(2).max(100),
  // Required: a missing shape used to be filled with a made-up box over
  // central London, which then counted as real coverage.
  polygonGeoJson: vanServiceAreaGeoJsonSchema,
}).strict();

export const vanPolygonParamsSchema = z.object({ id: uuid, polygonId: uuid }).strict();
export const vanAssignmentParamsSchema = z.object({ id: uuid, assignmentId: uuid }).strict();

export const assignVanOperatorSchema = z.object({
  operatorId: uuid,
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
}).strict();
