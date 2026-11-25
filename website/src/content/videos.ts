/**
 * Every video on the live site (www.pavdental.com), recorded on 25 Nov 2026 by
 * opening each page and pressing each play button. The addresses are the live
 * site's own, character for character; `videos.test.ts` fails if one changes.
 *
 * YouTube videos open in a player on the page (`YouTubeVideo`). The `/video/`
 * files live on the live server and are copied to `public/video/` at the same
 * paths; the Cloudinary ones are the practice's own account, as on the live site.
 */

export interface LiveYouTube {
  id: string;
  query: string;
}

export const YOUTUBE = {
  /** Home: "What causes cavities?" */
  home: { id: "zHXljj727OE", query: "?si=Uz7mq8eE5tSAvpgy" },
  /** /petition */
  petition: { id: "fISWYcAMjEw", query: "" },
  /** /services/whitening, under "Informed Consent for Tooth Whitening" */
  whitening: { id: "k0VqOxTlDvA", query: "?si=-kv6-K41QTPH0sIf" },
  /** /services/cosmetic, at the top */
  cosmetic: { id: "hRfw79jW-to", query: "" },
  /** /services/oral-hygiene, under the FAQ */
  oralHygiene: { id: "UOr3HN41R3o", query: "" },
  /** /services/general-dentistry, "How Do Dental Cavities Form?" */
  generalCavities: { id: "SiV4IhqWM3Q", query: "?si=dz9Kh7A0R3Lxnr4Z" },
  /** /services/general-dentistry, "Informed Consent for Root Canal Treatment" */
  generalRootCanal: { id: "Bqczi3V3D3U", query: "?si=65sEV9Y9W0-ripsM" },
  /** /services/general-dentistry and /services/tooth-extraction, "Informed Consent for Tooth Extraction" */
  extraction: { id: "-HR0hgWCNmU", query: "?si=bbRTLEVdcX9f7QuQ" },
  /** /services/custom-grillz, shown twice */
  grillz: { id: "_oIlv59bTL4", query: "" },
} as const satisfies Record<string, LiveYouTube>;

const CLOUDINARY = "https://res.cloudinary.com";

const EXTRACTION_GUIDE = `${CLOUDINARY}/db1i46uiv/video/upload/v1717826205/utomp3.com_-_Mastering_Tooth_Extraction_Your_Ultimate_Guide_to_Painless_Dental_Care_Pav_Dental_360p_spk4qm.mp4`;
const BRIDGES = `${CLOUDINARY}/db1i46uiv/video/upload/v1717826056/Bridging_Gaps__Understanding_3_Unit_Dental_Bridges_Procedure_with_Pav_Dental_gmwsvq.mp4`;
const VENEERS = `${CLOUDINARY}/db1i46uiv/video/upload/v1717826104/utomp3.com_-_Transform_Your_Smile_Everything_You_Need_to_Know_About_Teeth_Veneers_Pav_Dental_360p_ebhj0b.mp4`;
const ROOT_CANAL = `${CLOUDINARY}/db1i46uiv/video/upload/v1717826175/utomp3.com_-_Mastering_Root_Canal_Your_Complete_Guide_to_PainFree_Dental_Care_Pav_Dental_360p_f2rugb.mp4`;
const COSMETIC_CLIP = `${CLOUDINARY}/dyc90cwdt/video/upload/v1778146751/Video_Conversion_Landscape_A_person_with_dark_hair_and_a_light_complexion_is_3rvLD1V3_poo6os.mp4`;

/** /services/cosmetic, "Procedures": the live players and captions, in the live order. */
export const COSMETIC_PROCEDURE_VIDEOS = [
  { src: EXTRACTION_GUIDE, label: "Painless Dental Care | Pav Dental" },
  { src: COSMETIC_CLIP, label: "Visual or a crown vs a veneer" },
  { src: BRIDGES, label: "Bridges Procedure with Pav Dental" },
  { src: VENEERS, label: "Teeth Veneers | Pav Dental" },
  { src: ROOT_CANAL, label: "Pain-Free Dental Care | Pav Dental" },
] as const;

/** /services/general-dentistry, "Procedures": the live players and captions, in the live order. */
export const GENERAL_PROCEDURE_VIDEOS = [
  { src: EXTRACTION_GUIDE, label: "Tooth Extraction | Pav Dental" },
  { src: "/video/gen.mp4", label: "Tooth Cleaning with Pav Dental" },
  { src: BRIDGES, label: "Dental Bridges Procedure with Pav Dental" },
  { src: VENEERS, label: "Teeth Veneers | Pav Dental" },
  { src: ROOT_CANAL, label: "Root Canal Treatment | Pav Dental" },
] as const;

/** /services/dentures, "Dentures": the two live players, in the live order. */
export const DENTURE_VIDEOS = [
  {
    src: "/video/dent2.mp4",
    label: "Intermediate - acrylic with clasps",
    detail: "Secure retention with discreet clasp support for everyday comfort.",
  },
  {
    src: "/video/dent.mp4",
    label: "Premium - Flexible denture",
    detail: "Lightweight, gum-coloured flexible Valplast design with a natural fit.",
  },
] as const;

/** The embed address a `YouTubeVideo` loads. */
export const embedUrl = (video: LiveYouTube) => `https://www.youtube.com/embed/${video.id}${video.query}`;
