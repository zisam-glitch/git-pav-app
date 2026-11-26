import { Play, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "./heading";
import { Section, type SectionTheme } from "./section";

/**
 * A practice YouTube video, as the live site shows it: a picture with a play
 * button, and the player only loads once it is pressed (so no request goes to
 * YouTube until the visitor asks for the video). `id` and `query` are the live
 * site's own embed address, e.g. id "zHXljj727OE" and query "?si=Uz7mq8eE5tSAvpgy",
 * which `src/content/videos.test.ts` checks against the recorded list.
 */
export function YouTubeVideo({
  id,
  query = "",
  title,
  label,
  className,
}: {
  id: string;
  query?: string;
  /** What the video is, for the player's title and the play button's name. */
  title: string;
  /** Optional words on the picture. */
  label?: ReactNode;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-[24px] bg-black", className)}>
      {playing ? (
        <>
          <iframe
            src={`https://www.youtube.com/embed/${id}${query}`}
            title={title}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <button
            type="button"
            onClick={() => setPlaying(false)}
            aria-label={`Close ${title}`}
            className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-white text-black"
          >
            <X aria-hidden className="size-4" />
          </button>
        </>
      ) : (
        <>
          <img
            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            width={480}
            height={360}
            className="absolute inset-0 size-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-black/30" />
          {label ? <p className="absolute bottom-5 left-5 max-w-[70%] text-label text-white">{label}</p> : null}
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            className="absolute inset-0 grid place-items-center t-colors hover:bg-black/10"
          >
            <span className="grid size-20 place-items-center rounded-full bg-white text-black shadow-card sm:size-24">
              <Play aria-hidden className="size-8 translate-x-0.5 fill-current" />
            </span>
          </button>
        </>
      )}
    </div>
  );
}

export type VideoFile = {
  /** The file's address, exactly as the live site has it. */
  src: string;
  /** The caption the live page shows for it; also read out by screen readers. */
  label: string;
  /** A line under the caption. */
  detail?: string;
};

/**
 * The live site's row of practice videos: ordinary players with their own
 * controls, which fetch only the first frame until played, each with its caption.
 */
export function VideoRow({
  videos,
  tone = "light",
  className,
}: {
  videos: readonly VideoFile[];
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <ul className={cn("grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {videos.map((video) => (
        <li
          key={video.src}
          className={cn("overflow-hidden rounded-[24px]", tone === "dark" ? "border border-white/15 bg-white/7" : "bg-[#f6f6f4]")}
        >
          <video
            src={video.src}
            controls
            preload="metadata"
            playsInline
            aria-label={video.label}
            className="aspect-video w-full bg-black object-cover"
          />
          <div className="px-5 py-4">
            <p className={cn("text-label", tone === "dark" ? "text-white" : "text-fg")}>{video.label}</p>
            {video.detail ? (
              <p className={cn("mt-1 text-small", tone === "dark" ? "text-white/70" : "text-muted")}>{video.detail}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A page section that holds videos under a heading, like the live pages' "Procedures". */
export function VideoSection({
  title,
  accent,
  theme = "white",
  id,
  children,
}: {
  title?: ReactNode;
  accent?: ReactNode;
  theme?: SectionTheme;
  id?: string;
  children: ReactNode;
}) {
  return (
    <Section id={id} theme={theme} space="sm">
      {title ? (
        <Heading as="h2" size="h2-md" accent={accent} tone="terracotta" inline className="mb-8">
          {title}
        </Heading>
      ) : null}
      {children}
    </Section>
  );
}
