import { createFileRoute, redirect } from "@tanstack/react-router";
import { BOOKING_URL } from "@/lib/enquiry";

/**
 * Booking happens on the practice's Setmore page, as on the live site, which has no booking
 * page of its own. Old links to /booking still work: they go to Setmore. The redirect is
 * temporary (302), so the booking address can change without browsers remembering the old
 * one. The request form that used to be here is gone.
 */
export const Route = createFileRoute("/booking")({
  beforeLoad: () => {
    throw redirect({ href: BOOKING_URL, statusCode: 302 });
  },
});
