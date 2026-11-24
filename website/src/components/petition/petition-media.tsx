import { Play } from "lucide-react";
import { useState } from "react";
import { CONTAINER, MUTED_TITLE, TITLE } from "@/components/pricing/tokens";
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
    <section
      id="petition-video"
      aria-labelledby="petition-video-heading"
      className="pb-16 md:pb-24"
    >
      <div className={CONTAINER}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="petition-video-heading" className={TITLE}>
            {heading.split(" in ")[0]}{" "}
            <span className={MUTED_TITLE}>in {heading.split(" in ")[1]}</span>
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-[1040px] overflow-hidden rounded-[22px] bg-black shadow-[0_10px_36px_rgba(20,20,40,0.12)]">
          <div className="relative aspect-video w-full">
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
                  className="group absolute inset-0 flex items-center justify-center bg-black/20 t-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span className="flex size-20 items-center justify-center rounded-full bg-white text-[#1b1b1b] shadow-[0_10px_36px_rgba(20,20,40,0.25)] t-colors group-hover:scale-105 sm:size-24">
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
      </div>
    </section>
  );
}
