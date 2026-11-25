/**
 * The patient comments shown under "What people say?" on the live site, word for word
 * (spelling and punctuation included). The live site's own carousel repeats each one;
 * they are listed once here. `testimonials.test.ts` checks them against the recorded
 * live pages in `seo/live-text/`.
 *
 * Only comments the practice has published on the live site may go in this file. Do not
 * write, shorten or "improve" any of them.
 */
export type Testimonial = { title: string; text: string };

export const TESTIMONIALS_HEADING = "What people say?";

export const TESTIMONIALS_INTRO =
  "At our dental practice, we prioritize your comfort and care. Here's what our patients have to say about their experiences with us";

/** Home page, `/`. */
export const HOME_TESTIMONIALS: readonly Testimonial[] = [
  {
    title: "Professional & Compassionate",
    text: "Had a lot done in one session today took nearly an hour was a male dentist don't know his name but was the best dentist I ever had.",
  },
  {
    title: "Best Dentist I've Ever Been to",
    text: "Best dentist I've ever been too, very welcoming and friendly staff, I've always had a fear of dentists but these guys were absolute brilliant made me feel very comfortable and explained what they were going to do before so I had no worries",
  },
  {
    title: "Excellent Practice & Great Staff",
    text: "This was my first visit at this practice, the reception staff were friendly and polite. The dentist I saw was patient with me and gave excellent aftercare advice. This made me feel reassured and relaxed. Excellent practice and great staff.",
  },
  {
    title: "Explained Everything Before Any Work Started.",
    text: "I would rate this as the best dentist I have ever been to. Hassan, my dentist, made me feel really relaxed through my procedures and explained everything before any work started, so thank you.",
  },
];

/** Aesthetics page, `/services/aesthetics`. */
/**
 * Emergency dental page, `/services/emergency-dental`. The live page shows the home page's four
 * comments, except that the fourth names a different dentist than the home page's does.
 */
export const EMERGENCY_TESTIMONIALS: readonly Testimonial[] = HOME_TESTIMONIALS.map((item) =>
  item.title === "Explained Everything Before Any Work Started."
    ? {
        title: item.title,
        text: "I would rate this as the best dentist I have ever been to. Sonia, my dentist, made me feel really relaxed through my procedures and explained everything before any work started, so thank you.",
      }
    : item,
);

export const AESTHETICS_TESTIMONIALS: readonly Testimonial[] = [
  {
    title: "Boosted Confidence",
    text: "Choosing Pav Dental for my Aesthetics treatment was undeniably the best decision I've made for myself. The moment I entered their clinic, I was greeted by a warm and welcoming atmosphere that instantly put me at ease. The team's professionalism, personalised approach, and commitment to excellence were evident throughout my entire journey. Pav Dental truly exceeded my expectations, leaving me with a refreshed and youthful appearance that has positively impacted my life.",
  },
  {
    title: "Artistry and Expertise",
    text: "I am forever grateful to Pav Dental for their incredible artistry and expertise in Aesthetics. Their talented team possesses an eye for detail and an exceptional understanding of Aesthetics. Through their skilled hands, I witnessed the transformation of my features into a harmonious and natural-looking appearance. I highly recommend Pav Dental for their unparalleled craftsmanship and dedication to delivering outstanding results.",
  },
  {
    title: "Best Decision Ever",
    text: "Pav Dental has given me a new lease on life with their exceptional Aesthetics services. From the moment I stepped into their clinic, I felt welcomed and supported. The team's professionalism and attention to detail in understanding my unique needs truly boosted my confidence.I can now confidently face the world with a renewed sense of self- assurance, thanks to Pav Dental",
  },
];
