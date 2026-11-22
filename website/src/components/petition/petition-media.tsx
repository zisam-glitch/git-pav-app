import { Play } from "lucide-react";
import { useState } from "react";
import { Section } from "@/components/hims";
import { PETITION } from "@/content/petition";

const { heading, youtubeId } = PETITION.video;

/**
 * The petition video the live page shows: its YouTube thumbnail with a play button, and the
 * player only loads once the visitor presses play. Nothing else sits around it, because the
 * live page has no news report, statistics or captions.
 */
export function PetitionMedia() {
  const [playing, setPlaying] = useState(false);

  return (
    <Section
      id="petition-video"
      theme="cream"
      space="default"
      aria-labelledby="petition-video-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
          {PETITION.eyebrow}
        </span>
        <h2 id="petition-video-heading" className="mt-4 text-h2-md text-fg">
          {heading}
        </h2>
      </div>

      <div className="mx-auto mt-10 max-w-[960px] rounded-xl border border-border bg-white p-3 shadow-soft md:p-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={heading}
              className="size-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                alt={`${heading} video thumbnail`}
                loading="lazy"
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play the video: ${heading}`}
                className="group absolute inset-0 flex items-center justify-center bg-black/25 t-colors hover:bg-black/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span className="flex size-20 items-center justify-center rounded-pill bg-white text-black shadow-card t-colors group-hover:scale-105 group-hover:bg-gold sm:size-24">
                  <Play
                    className="size-8 translate-x-0.5 fill-current sm:size-10"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
