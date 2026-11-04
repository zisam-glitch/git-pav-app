import { Router, Request, Response } from "express";
import { validateBody } from "../middleware/validate";
import { vanCoverageCheckSchema } from "../schemas/van";
import { Point, coordinatesToPostcode, formatUkPostcode, postcodeToCoordinates } from "../lib/geo";
import { findCoveringVans } from "../lib/van-coverage";

const router = Router();

// ─── POST /api/public/van/coverage-check ───────────────────────────────────────
// Public endpoint - no auth required for coverage checking
// Accepts either GPS coordinates (lat/lng) or postcode
router.post("/coverage-check", validateBody(vanCoverageCheckSchema), async (req: Request, res: Response) => {
  const { lat, lng, postcode } = req.body;

  let checkPoint: Point | null = null;
  let inputType: string;
  let processedPostcode: string | null = null;

  // Determine input type and get coordinates
  if (lat !== undefined && lng !== undefined) {
    // GPS coordinates provided (preferred)
    checkPoint = { lat, lng };
    inputType = "gps";
    // The van request needs a real postcode for the address, so find the one
    // nearest the patient (null if the lookup fails; they can type it in).
    processedPostcode = await coordinatesToPostcode(checkPoint);
  } else if (postcode) {
    // Postcode provided (fallback)
    const clean = String(postcode).toUpperCase().replace(/\s/g, "");
    processedPostcode = clean;
    inputType = "postcode";
    
    // PV-1: Convert postcode to coordinates using lib/geo with hard 3s timeout
    checkPoint = await postcodeToCoordinates(clean);
    
    if (!checkPoint) {
      return res.json({
        postcode: clean,
        isCovered: false,
        assignedVan: null,
        vehicleType: null,
        activeSector: null,
        message: "Could not verify postcode coordinates. Please check your postcode or try using GPS location.",
        inputType: "postcode"
      });
    }
  } else {
    return res.status(400).json({
      error: "Either lat/lng coordinates or postcode must be provided"
    });
  }

  // Check coverage using the unified helper (PostGIS-first, JS fallback)
  const coverageResults = await findCoveringVans(checkPoint);

  const bestMatch = coverageResults[0] || null;

  return res.json({
    // Always a real postcode ("SW1A 1AA") or null, never the sector name.
    postcode: processedPostcode ? formatUkPostcode(processedPostcode) : null,
    coordinates: checkPoint,
    isCovered: !!bestMatch,
    assignedVan: bestMatch?.vanName ?? null,
    vehicleType: bestMatch?.vehicleModel ?? null,
    activeSector: bestMatch?.sectorName ?? null,
    matchedSector: bestMatch?.sectorName ?? null, // Legacy field for client compatibility
    distanceKm: bestMatch ? Math.round(bestMatch.distanceKm * 10) / 10 : null,
    message: bestMatch 
      ? `Your location is within our mobile van service area (${bestMatch.distanceKm.toFixed(1)} km from service center)` 
      : "Your location is currently outside our mobile van service area. Please try our clinic services instead.",
    inputType
  });
});

export default router;