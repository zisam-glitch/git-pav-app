import { Play } from "lucide-react";
import { useState } from "react";
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
      className="py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-[1392px] px-4">
        <h2
          id="petition-video-heading"
          className="max-w-[1000px] text-[clamp(32px,4.6vw,72px)] leading-[1] font-medium tracking-[-0.035em]"
        >
          {heading}
        </h2>

        <div className="mt-10 overflow-hidden bg-black">
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
                  <span className="flex size-20 items-center justify-center rounded-full bg-white text-black t-colors group-hover:scale-105 sm:size-24">
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
