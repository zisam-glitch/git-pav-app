import { useState } from "react";
import { Play } from "lucide-react";
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
    <section className="bg-white py-16 sm:py-24" aria-labelledby="petition-video-heading">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2
          id="petition-video-heading"
          className="font-display text-3xl font-bold text-[#844d1e] sm:text-4xl lg:text-[2.6rem]"
        >
          {heading}
        </h2>

        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-xl   bg-black shadow-2xl">
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
                  alt={heading}
                  loading="lazy"
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label={`Play the video: ${heading}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span className="flex size-20 items-center justify-center rounded-full bg-[#925a27] text-white shadow-2xl transition-transform duration-300 hover:scale-110 sm:size-24">
                    <Play className="size-8 translate-x-0.5 fill-current sm:size-10" aria-hidden="true" />
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
