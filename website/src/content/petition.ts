/**
 * The words on the live petition page (`/petition`), as the live site has them (the odd
 * space before the colon in `lead` included). `petition.test.ts` checks each string against
 * the recorded live page in `seo/live-text/petition.txt`.
 *
 * Do not add figures, targets, counts, quotes or news mentions here unless the live page
 * shows them. The live page also lists the people who have signed (name and date). That
 * list is not shown on this site yet: the names are personal data and the dashboard has no
 * public list of signers (an owner decision, see docs/completion/17).
 */
export const PETITION = {
  eyebrow: "Community Action",
  title: "NHS Dental Funding Petition",
  lead: "Help Us Bring NHS Dental Care Back to Bradford :",
  paragraphs: [
    "Bradford urgently needs better NHS dental access. Pav Dental is fully equipped to treat NHS patients, but current national rules only allow funding through buying an existing practice. We are asking the UK Government to change these rules so new practices can receive NHS contracts and help underserved communities.",
    "Together, we can improve access to urgent dental care.",
  ],
  bookLabel: "Make an Appointment",
  contactLabel: "Contact us",
  cards: [
    {
      title: "Sign the Petition",
      text: "Add your name to support better NHS dental access in Bradford. Every signature makes a difference.",
    },
    {
      title: "Share with Others",
      text: "Help spread the word about our campaign. The more people who sign, the stronger our message.",
    },
  ],
  form: {
    heading: "Sign the Petition",
    eligibility: "Only British citizens or UK residents are eligible to sign.",
    submit: "Sign Petition",
    residentLabel: "I am a British citizen or UK resident",
    fieldLabels: { name: "Full Name", email: "Email Address", postcode: "Postcode" },
    thanks: "Thank you for signing the petition!",
    failed: "Failed to submit. Please try again.",
  },
  video: {
    heading: "Petition for NHS Dental Funding in Bradford",
    /** The YouTube video the live page embeds. */
    youtubeId: "fISWYcAMjEw",
  },
  contact: {
    heading: "Get In Touch",
    intro: "Ready to take control of your dental health? Contact us to book your appointment today!",
    fieldLabels: {
      name: "Full Name",
      email: "Email Address",
      subject: "Subject",
      phone: "Phone",
      message: "Your Message",
    },
    submit: "Send Message",
    bookLabel: "Book Appointment",
  },
} as const;
