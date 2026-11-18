import { useEffect, useRef } from "react";
import type { TeamMember } from "@/content/team-members";

/** Shown when a team photo has not loaded, or has not been added yet. */
export const PHOTO_PENDING = "/media/team-photo-pending.svg";

/**
 * A team member's photo. If the file is missing it falls back to the
 * placeholder instead of a broken image. An image in the server's HTML can fail
 * before the page is interactive, when `onError` is not attached yet, so the
 * effect checks for that case on mount.
 */
export function TeamPhoto({
  member,
  className,
  priority = false,
}: {
  member: TeamMember;
  className?: string;
  priority?: boolean;
}) {
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = image.current;
    if (element && element.complete && element.naturalWidth === 0 && !element.src.endsWith(PHOTO_PENDING)) {
      element.src = PHOTO_PENDING;
    }
  }, []);

  return (
    <img
      ref={image}
      src={member.photo.src}
      alt={member.photo.alt}
      width={640}
      height={800}
      loading={priority ? "eager" : "lazy"}
      className={className}
      onError={(event) => {
        // Clear the handler first: if the placeholder is missing too, don't loop.
        event.currentTarget.onerror = null;
        event.currentTarget.src = PHOTO_PENDING;
      }}
    />
  );
}
