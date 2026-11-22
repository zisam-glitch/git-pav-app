/**
 * Titles, descriptions and the other head tags search engines read.
 *
 * The live site at www.pavdental.com is the source of truth for these
 * (decisions log, 18 Nov 2026: SEO stays the same or better). Where a live
 * page has a title and description, they are copied here word for word from
 * seo/live-baseline.json, quirks included, and seo.test.ts fails if one
 * drifts: changing one is an SEO decision for the owner, not a copy edit.
 * Pages the live site left without either have new ones, written from the
 * page's own heading and text and marked `written: true`.
 *
 * Plain data and functions with no imports, so the sitemap script and the
 * tests can load this file without a build.
 */

export const SITE_URL = "https://www.pavdental.com";

export interface PageSeo {
  title: string;
  description: string;
  /** New: the live page had no title or description. */
  written?: true;
}

export const PAGES = {
  "/": {
    title: "24-Hour Private Dental Clinic in Bradford | Emergency Dental Care",
    description: "Looking for a 24-hour private dentist in Bradford? Our clinic provides emergency, cosmetic, and general dental treatments with expert care.",
  },
  "/about": {
    title: "24/7 Emergency & Private Dental Clinic in Bradford | Emergency Dentist – Book Appointment Now",
    description: "24/7 emergency and private dental clinic in Bradford offering fast, reliable care. Book your appointment now for immediate dental treatment.",
  },
  "/blog": {
    title: "Read Our Expert Tips, Guides & Dental Blogs",
    description: "Explore expert dental tips, guides, and blogs created to help you maintain a healthy and confident smile. Read our latest articles now.",
  },
  "/blog/24-hour-emergency-dentist-bradford-when-to-call-why-it-matters-and-how-to-get-seen": {
    title: "24 Hour Emergency Dentist Bradford: When to Call, Why It Matters, and How to Get Seen",
    description: "Dental problems can happen at any time and they are not always easy to manage at home. Knowing when to get urgent dental help can save time.",
    written: true,
  },
  "/blog/24-hour-emergency-dentist-in-leeds-how-quickly-can-you-get-seen": {
    title: "24 Hour Emergency Dentist in Leeds: How Quickly Can You Get Seen?",
    description: "Toothache doesn't wait for office hours. If you're searching for a 24 hour emergency dentist in Leeds, this guide explains how quickly you can get seen.",
    written: true,
  },
  "/blog/botox-vs-dermal-fillers-finding-the-right-facial-aesthetics-treatment-in-bradford": {
    title: "Botox vs. Dermal Fillers: Finding the Right Facial Aesthetics Treatment in Bradford",
    description: "Botox and dermal fillers are two common treatments used to improve the appearance of the face. But they do different jobs, so choosing between them can be confusing.",
    written: true,
  },
  "/blog/can-a-dentist-assess-a-dental-problem-through-a-video-call-what-can-and-cant-be-checked": {
    title: "Can a Dentist Assess a Dental Problem Through a Video Call? What Can and Can't Be Checked",
    description: "Having a toothache, sore gum or broken tooth? Dentists can help with some dental issues during a video call, but a smartphone camera isn't the same as a physical examination.",
    written: true,
  },
  "/blog/can-you-whiten-just-one-tooth-what-causes-single-tooth-discolouration": {
    title: "Can You Whiten Just One Tooth? What Causes Single-Tooth Discolouration?",
    description: "It can be surprising when most of your teeth look fairly white but one tooth looks yellow, grey, or darker. What causes it, and can one tooth be whitened?",
    written: true,
  },
  "/blog/tooth-extraction-in-bradford-when-is-removing-a-tooth-the-best-option": {
    title: "Tooth Extraction in Bradford: When Is Removing a Tooth the Best Option?",
    description: "A toothache is not always a sign that a tooth needs to be extracted. When a dentist can save the natural tooth, and when removing it is the best option.",
    written: true,
  },
  "/blog/all": {
    title: "All Articles | Pav Dental Blog",
    description: "Browse every Pav Dental article on emergency dentistry, tooth extraction, whitening, facial aesthetics, dentures and virtual dental consultations in Bradford and Leeds.",
    written: true,
  },
  "/blog/what-nobody-tells-you-about-teeth-sensitivity-after-whitening-in-bradford": {
    title: "What Nobody Tells You About Teeth Sensitivity After Whitening in Bradford",
    description: "Teeth whitening can make your teeth look lighter, but some people notice sensitivity after the treatment. This can feel like a short sharp pain when you...",
    written: true,
  },
  "/blog/not-sure-if-you-need-a-dentist-how-a-virtual-dental-consultation-can-help-you-decide": {
    title: "Not Sure If You Need a Dentist? How a Virtual Dental Consultation Can Help You Decide",
    description: "Sometimes a dental problem starts small and you are not sure what to do. You may have mild tooth pain, some sensitivity, a small chip, or a problem that...",
    written: true,
  },
  "/blog/beat-the-dental-squad-take-on-the-challenge-and-win-a-discount": {
    title: "Beat the Dental Squad! Take on the Challenge and Win a Discount",
    description: "Going to the dentist is not always something people look forward to. Pav Dental has introduced a fun way to make your visit a little more exciting with the...",
    written: true,
  },
  "/blog/can-you-speak-to-a-dentist-24-7-heres-how-virtual-dental-consultations-work": {
    title: "Can You Speak to a Dentist 24/7? Here's How Virtual Dental Consultations Work",
    description: "Many people have dental questions outside normal clinic hours. A tooth may start hurting at night or a filling may come loose during the weekend.",
    written: true,
  },
  "/blog/7-dental-emergencies-that-need-immediate-treatment": {
    title: "7 Dental Emergencies That Need Immediate Treatment",
    description: "Dental problems can happen without warning. Some issues cause only mild discomfort, while others require immediate treatment to protect your teeth and...",
    written: true,
  },
  "/blog/does-teeth-whitening-hurt-or-damage-your-teeth-what-you-need-to-know": {
    title: "Does Teeth Whitening Hurt or Damage Your Teeth? What You Need to Know",
    description: "Almost everyone wants a brighter smile, but for many people, the fear of pain is what stops them from booking treatment. Will whitening gel damage your...",
    written: true,
  },
  "/blog/unexpected-dental-emergency-heres-what-to-do-before-you-can-see-a-dentist": {
    title: "Unexpected Dental Emergency? Here's What to Do Before You Can See a Dentist",
    description: "A dental emergency can happen when you least expect it. You might bite down on something hard and crack a tooth, wake up with severe tooth pain, or lose a...",
    written: true,
  },
  "/blog/why-getting-aesthetics-at-a-dental-clinic-in-bradford-is-actually-smarter": {
    title: "Why Getting Aesthetics at a Dental Clinic in Bradford Is Actually Smarter",
    description: "Thinking about smoothing forehead lines or adding a little volume to your lips? Many people automatically look for a beauty salon or cosmetic studio. It...",
    written: true,
  },
  "/blog/what-are-the-signs-you-need-a-root-canal-treatment-in-bradford": {
    title: "What Are the Signs You Need a Root Canal Treatment in Bradford?",
    description: "A toothache does not always mean you need a root canal. Sometimes the problem is as simple as a cavity or sensitive teeth. Other times, the pain is a sign...",
    written: true,
  },
  "/blog/same-day-emergency-dental-appointments-in-bradford-everything-you-need-to-know": {
    title: "Same-Day Emergency Dental Appointments in Bradford: Everything You Need to Know",
    description: "Dental emergencies never happen at a convenient time. Sometimes, a severe toothache starts in the middle of the night. A filling may fall out just before an...",
    written: true,
  },
  "/blog/what-are-the-warning-signs-of-loose-dentures": {
    title: "What Are the Warning Signs of Loose Dentures?",
    description: "Dentures are designed to fit securely and comfortably. When they fit properly, most people can eat, speak and smile with confidence without constantly...",
    written: true,
  },
  "/blog/when-to-consider-facial-aesthetics-signs-it-might-be-right-for-you": {
    title: "When to Consider Facial Aesthetics: Signs It Might Be Right for You",
    description: "A lot of people think facial aesthetics is only about looking younger. That is part of it sometimes, but not the full story.",
    written: true,
  },
  "/blog/virtual-dental-office-vs-in-clinic-visit-when-to-choose-each-and-why-it-matters": {
    title: "Virtual Dental Office vs In-Clinic Visit: When to Choose Each (And Why It Matters)",
    description: "Dental care is changing now and many people use both online and clinic visits. Some dental problems can be discussed online and some need direct treatment...",
    written: true,
  },
  "/blog/5-signs-you-need-new-dentures-not-just-a-repair": {
    title: "5 Signs You Need New Dentures (Not Just a Repair)",
    description: "Dentures are used when natural teeth are missing and they help in eating and speaking. Many people use them for a long time and they feel okay at the start.",
    written: true,
  },
  "/blog/how-to-choose-a-private-dental-clinic-what-patients-often-overlook": {
    title: "How to Choose a Private Dental Clinic: What Patients Often Overlook",
    description: "A private dental clinic is a place where you pay for dental care directly and it is not run by the government. It usually has more flexible timing and more...",
    written: true,
  },
  "/blog/emergency-tooth-extraction-in-leeds-signs-you-need-urgent-dental-care": {
    title: "Emergency Tooth Extraction in Leeds: Signs You Need Urgent Dental Care",
    description: "Tooth pain is something many people ignore at first. It starts small, then slowly becomes worse. Some people try home remedies, some take painkillers, and...",
    written: true,
  },
  "/blog/thinking-about-facial-aesthetics-in-leeds-find-the-right-treatment-for-you": {
    title: "Thinking About Facial Aesthetics in Leeds? Find the Right Treatment for You",
    description: "Facial treatments are becoming more common now, especially for people who want small improvements without major procedures. In Leeds, many patients are...",
    written: true,
  },
  "/blog/how-much-does-teeth-whitening-cost-in-leeds-a-complete-guide-2026": {
    title: "How Much Does Teeth Whitening Cost in Leeds? A Complete Guide 2026",
    description: "Teeth whitening is now very common for people who want a brighter smile without complex treatment. In Leeds, many patients look for simple and safe ways to...",
    written: true,
  },
  "/blog/emergency-dentist-bradford-west-yorkshire-complete-guide-to-24-7-urgent": {
    title: "Emergency Dentist Bradford West Yorkshire – Complete Guide to 24/7 Urgent Dental Care",
    description: "Dental problems don’t wait for the right time. A sudden tooth pain at night or broken tooth during the weekend can feel stressful for anyone. This is where...",
    written: true,
  },
  "/blog/virtual-dental-consultation-in-bradford-see-a-dentist-from-home": {
    title: "Virtual Dental Consultation in Bradford: See a Dentist from Home",
    description: "Many people in Bradford now prefer simple ways to talk with a dentist without leaving home. A virtual dental consultation is mostly an online talk where...",
    written: true,
  },
  "/blog/aesthetic-treatments-in-bradford-what-they-are-benefits-and-how-to-choose": {
    title: "Aesthetic Treatments in Bradford: What They Are, Benefits & How to Choose the Right Clinic",
    description: "Aesthetic treatments are becoming more common now, not just for celebrities but for normal people too. Many people in Bradford look for ways to improve...",
    written: true,
  },
  "/blog/a-local-guide-to-finding-the-best-cosmetic-dentist-in-bradford-for-natural": {
    title: "A Local Guide to Finding the Best Cosmetic Dentist in Bradford for Natural, Long-Lasting Results",
    description: "Many people think cosmetic dentistry only means making teeth white or straight. But it is more than that. A smile affects how a person speaks, laughs, and...",
    written: true,
  },
  "/blog/is-professional-teeth-whitening-worth-it-a-bradford-dentists-honest-advice": {
    title: "Is Professional Teeth Whitening Worth It? A Bradford Dentist’s Honest Advice",
    description: "Many people in Bradford want whiter teeth. It is one of the most common dental questions. People drink tea, coffee, sometimes smoke, and slowly their teeth...",
    written: true,
  },
  "/blog/24-hour-emergency-dentist-in-bradford-tooth-extraction-options-and-payment": {
    title: "24 Hour Emergency Dentist in Bradford: Tooth Extraction Options & Payment Plans Explained",
    description: "Tooth pain can come suddenly and it can feel really bad, specially at night time. Some people try to wait till morning, but when it gets worse, it becomes...",
    written: true,
  },
  "/blog/how-private-dentistry-works-in-bradford-a-patients-guide": {
    title: "How Private Dentistry Works in Bradford: A Patient’s Guide",
    description: "Plenty of people in Bradford stick with the NHS for their teeth, and that’s fine for basic stuff. But when someone wants more choice, quicker appointments...",
    written: true,
  },
  "/blog/common-dental-emergencies-and-how-a-24-hour-dentist-in-bradford-helps": {
    title: "Common Dental Emergencies and How a 24 Hour Dentist in Bradford Helps",
    description: "Nobody plans for a dental emergency. One minute you're fine, the next you're clutching your jaw at midnight on a bank holiday wondering what to do. That's...",
    written: true,
  },
  "/blog/creating-a-safe-and-healthy-environment-the-benefits-of-installing-an-air": {
    title: "Creating a Safe and Healthy Environment: The Benefits of Installing an Air Purifier in Dental Clinics",
    description: "Maintaining a clean and healthy environment is a top priority for dental clinics. Air quality plays an essential role in ensuring the health and safety of...",
    written: true,
  },
  "/cctv-policy": {
    title: "CCTV Policy – Ensuring Safety, Security & Trust for Every Patient",
    description: "Our CCTV policy ensures 24/7 safety, security, and transparency for every patient and staff member across all clinic areas.",
  },
  "/complaints-policy": {
    title: "Your Feedback Helps Us Improve – Understanding Our Complaints Policy",
    description: "We value your feedback. Our complaints policy ensures every concern is handled fairly, professionally, and with quick resolution.",
  },
  "/contact-us": {
    title: "Book Your Consultation – Contact Dental Experts in Bradford",
    description: "Book your dental consultation or contact Pav Dental in Bradford at 786 Leeds Road, BD3 9TY. Open 24 hours a day, 7 days a week for emergency and private care.",
  },
  "/cookie-policy": {
    title: "Cookie Usage & Privacy Policy – Keeping Your Data Safe",
    description: "Our cookie and privacy policy explains how we collect, use, and protect your data to ensure a safe, transparent, and secure browsing experience.",
  },
  "/faq": {
    title: "Frequently Asked Questions | Pav Dental",
    description: "Answers to common questions from Pav Dental in Bradford: bleeding gums, sensitive teeth, how often to have a check-up, and help if you are nervous about the dentist.",
    written: true,
  },
  "/petition": {
    title: "Demand Better Dental Care – Support the NHS Funding Petition",
    description: "Join the NHS dental funding petition and push for better, affordable dental care across the UK. Every signature brings real change closer.",
  },
  "/practice-policy": {
    title: "Pav Dental Documents – Practice Policies and Guidelines",
    description: "Comprehensive policies and guidelines for excellence in dental practice at Pav Dental, including our CCTV policy, complaints policy and CQC statement of purpose.",
    written: true,
  },
  "/pricing": {
    title: "Pricing Our Treatments – Quality Dental Care That Fits Your Budget",
    description: "Get quality dental treatments at prices that fit your budget. Transparent, affordable and reliable care for every patient.",
  },
  "/privacy-policy": {
    title: "Your Data, Your Trust – Privacy Policy for Dental Services",
    description: "We keep your personal and dental information secure with trusted privacy standards designed to protect your data at every step.",
  },
  "/services": {
    title: "Emergency Private Dental Clinic in Bradford | Book Your Appointment Now",
    description: "Need fast dental treatment in Bradford? Our 24-hour Emergency Private Dental Clinic offers same-day care. Book your appointment now.",
  },
  "/services/aesthetics": {
    title: "Advanced Aesthetic Treatments in Bradford | Book Today",
    description: "Enhance your look with advanced aesthetic treatments in Bradford . Safe, professional and tailored to you. Book your treatment today.",
  },
  "/services/cosmetic": {
    title: "Cosmetic Dentistry in Bradford | Book Your Consultation",
    description: "Looking for cosmetic dentistry in Bradford? Get whitening, veneers, bonding and more. Book your consultation today for a perfect smile.",
  },
  "/services/custom-grillz": {
    title: "Custom Grillz Dentist in Bradford | Book us now!",
    description: "Get custom gold and diamond grillz designed by expert dentists in Bradford . Premium quality, perfect fit—book your unique grillz design today.",
  },
  "/services/dentures": {
    title: "Advanced Denture Solutions in Bradford | Book Your Consultation",
    description: "Get advanced denture solutions in Bradford with natural, comfortable results. Custom-fit dentures designed for your perfect smile. Book now.",
  },
  "/services/emergency-dental": {
    title: "24/7 Emergency Dentist in Bradford | Book Now",
    description: "24/7 emergency dentist in Bradford offering fast pain relief and same-day care. Book your urgent appointment now for immediate dental treatment.",
  },
  "/services/finance": {
    title: "Dental Payment Options & Plans in Bradford | Pav Dental",
    description: "Explore transparent private dental fees, membership plans, and how to discuss treatment payment options with our Bradford clinic team.",
  },
  "/services/general-dentistry": {
    title: "General Dentistry in Bradford | Trusted, Gentle & Affordable Care",
    description: "Need trusted dental care in Bradford? Our general dentistry team provides gentle, affordable treatments for every age. Book now.",
  },
  "/services/mobile-dentistry": {
    title: "Mobile Dental Care in Bradford – Professional At-Home Services",
    description: "Pav Dental's mobile dental care brings professional treatment to your doorstep. Easy booking, gentle care, and trusted at-home service.",
  },
  "/services/mouthguards": {
    title: "Custom Sports Mouthguards in Bradford | Pav Dental",
    description: "Order a high quality custom sports mouthguard at Pav Dental in Bradford, made from a precise digital or physical impression with full control over colour and style.",
    written: true,
  },
  "/services/oral-hygiene": {
    title: "Oral Hygiene Services in Bradford – Pav Dental",
    description: "Boost your oral health with professional oral hygiene care at Pav Dental in Bradford. Book preventive cleaning, gum health support, and expert dental guidance.",
  },
  "/services/regestration": {
    title: "Register Today & Enjoy More Dental Care Benefits",
    description: "Register today to unlock extra dental care benefits, priority services, and personalised treatment options.",
  },
  "/services/root-canal": {
    title: "Root Canal Treatment in Bradford | Pav Dental",
    description: "Transparent root canal prices at Pav Dental in Bradford: basic £195, intermediate £295 and advanced £395, with what you need to make an informed decision.",
    written: true,
  },
  "/services/tooth-extraction": {
    title: "Advanced Tooth Extraction Services in Bradford | Visit now!",
    description: "Looking for expert tooth extraction in Bradford ? Our local specialists offer safe, modern and comfortable dental care.",
  },
  "/services/virtual-dentistry": {
    title: "Virtual Dental Consultation in Bradford – Book Your Dentist Now",
    description: "Pav Dental offers virtual dental consultations in Bradford. Speak to expert dentists online for quick advice, treatment guidance, and stress-free care.",
  },
  "/services/whitening": {
    title: "Professional Teeth Whitening in Bradford, UK | Contact us now!",
    description: "Get professional teeth whitening in Bradford, UK for a brighter, whiter smile. Safe, fast and expert treatment—book your appointment today.",
  },
  "/shop": {
    title: "Dental Care Shop | Pav Dental",
    description: "Dental care products from Pav Dental in Bradford, including toothbrushes, toothpaste, dental floss, mouthwash, teeth whitening and denture care.",
    written: true,
  },
  "/team": {
    title: "Meet Our Expert Dental Team – Your Smile Specialists",
    description: "Meet our skilled dental team—trusted smile specialists offering expert, caring, and professional dental treatment in Bradford.",
  },
  "/team/aboo-bhojani": {
    title: "Aboo Bhojani - Director & Dental Engineer | Pav Dental Team",
    description: "Aboo Bhojani serves as Director and Dental Engineer at Pav Dental, bringing together technical expertise and financial governance. With a professional background as a former Tax Inspector and advanced Avensys certification in dental engineering, Aboo plays a vital role in ensuring Pav Dental operates with precision, transparency, and full compliance — both clinically and financially.",
  },
  "/team/dr-cosimo-meucci": {
    title: "Dr Cosimo Meucci - Implant Dentist | Pav Dental Team",
    description: "Dr Cosimo Meucci is Pav Dental’s visiting implantologist, providing patients with advanced dental implant care and surgical expertise. With extensive experience in implant placement, bone grafting, and full-mouth rehabilitation, Dr Meucci combines surgical precision with a patient-focused approach to achieve long-lasting, natural results.",
  },
  "/team/dr-hassan-bhojani": {
    title: "Dr Hassan Bhojani - Principal Dentist & Registered Manager | Pav Dental Team",
    description: "GDC: 262970 Cancer survivor and highly skilled dentist with advanced training in restorative and aesthetic procedures. Resilient, reliable, and responsible professional with extensive experience in urgent dental care, oral surgery, restorative dentistry, and practice leadership. Committed to delivering outstanding patient care while continuously striving to improve the dental experience for both patients and practitioners.",
  },
  "/team/haris-bhojani": {
    title: "Haris Bhojani - Dental Assistant & Clinical Support | Pav Dental Team",
    description: "Haris plays a key role in supporting the smooth daily operation of Pav Dental’s clinical services. He assists with patient preparation, treatment coordination, and maintains the highest standards of cleanliness and efficiency in every procedure. Haris is known for his friendly manner, professionalism, and commitment to patient comfort.",
  },
  "/team/raheela-shafiq": {
    title: "Raheela Shafiq - Compliance Manager | Pav Dental Team",
    description: "Raheela Shafiq leads compliance and governance at Pav Dental. With a strong focus on regulatory standards, risk management, and patient safety, she ensures that every process—from clinical care to data management—meets legal, ethical, and industry benchmarks.",
  },
  "/team/sayed-shohag-rahman": {
    title: "Sayed Shohag Rahman - Marketing Manager | Pav Dental Team",
    description: "Sayed oversees Pav Dental’s communications, website, seo and community outreach. He makes booking simple, keeps patients informed about offers and late-opening slots, and ensures our messages are clear and accessible",
  },
  "/team/uwais-ullah": {
    title: "Uwais Ullah - Trainee Dental Nurse | Pav Dental Team",
    description: "Uwais is currently training as a dental nurse and is an integral part of the Pav Dental team. His calm and focused approach helps ensure every procedure runs smoothly and safely. Under the supervision of Dr. Hassan Bhojani, Uwais assists in clinical procedures, maintains infection control standards, and supports patients throughout their treatment journey.",
  },
  "/team/waleed-javed": {
    title: "Waleed Javed - Practice Manager | Pav Dental Team",
    description: "Waleed Javed brings a strong blend of technical expertise, healthcare knowledge and leadership experience to his role at Pav Dental. His professional qualifications include a First Class Degree in Software Engineering, CCNA qualification, Level 3 Diploma in Health and Social Care, Level 5 Diploma in Leadership and Management for Adult Care, Level 3 Award in Emergency First Aid at Work, Level 3 Safeguarding Adults, GDPR and Data Protection Certification, and Infection Prevention and Control Certification.",
  },
  "/terms-and-condition": {
    title: "Service Terms & Conditions – PAV Dental Care",
    description: "Read Pav Dental Care’s service terms to understand our policies, patient rights, and trusted approach to safe, quality dental treatment.",
  },
  "/vacancies": {
    title: "Your Next Career Starts Here – Explore Our Open Vacancies",
    description: "Join PAV Dental and discover rewarding career opportunities. Check our open vacancies and become part of a skilled, supportive dental team.",
  },
} satisfies Record<string, PageSeo>;

export type SeoPath = keyof typeof PAGES;

const pagesByPath: Record<string, PageSeo | undefined> = PAGES;

export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * Head tags for a page search engines should index: its title and
 * description, a canonical URL on www (the live site had none, and served
 * "/about" and "/about/" as two pages), and the same text for link previews.
 */
export function pageHead(path: string, page: PageSeo) {
  const url = canonicalUrl(path);
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:url", content: url },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** Head tags for a page listed in PAGES. */
export function seoHead(path: SeoPath) {
  return pageHead(path, PAGES[path]);
}

/** Head tags for pages kept out of search results: the cart, checkout and similar. */
export function noindexHead(title: string) {
  return { meta: [{ title }, { name: "robots", content: "noindex" }] };
}

/** "electric-toothbrushes" becomes "Electric Toothbrushes". */
export function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * A blog post's head: the live post's title and description, written from its
 * text because the live page had neither, and a canonical URL. A post that is
 * not one of the live posts gets a page kept out of search.
 */
export function blogPostHead(slug: string) {
  const path = `/blog/${slug}`;
  const known = pagesByPath[path];
  return known ? pageHead(path, known) : noindexHead("Page not found | Pav Dental");
}

/**
 * Structured data for a blog post (the live site has none): its headline,
 * date, author and cover image, and the practice as publisher. Rendered in the
 * post page's body, like the team and product structured data.
 */
export function blogPostingJsonLd(post: { slug: string; title: string; date: string; author: string; image: string }) {
  const path = `/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: pagesByPath[path]?.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@id": PRACTICE_JSON_LD["@id"] },
    image: post.image.startsWith("/") ? `${SITE_URL}${post.image}` : post.image,
    mainEntityOfPage: canonicalUrl(path),
  };
}

/**
 * A team profile's head: the live title and description and a canonical URL.
 * A slug that is not a live profile gets a page kept out of search.
 */
export function teamProfileHead(slug: string) {
  const path = `/team/${slug}`;
  const page = pagesByPath[path];
  return page ? pageHead(path, page) : noindexHead("Page not found | Pav Dental");
}

/**
 * Structured data naming a team member and where they work (the live site has
 * none for people). Rendered in the profile page's body, like the product and
 * blog structured data.
 */
export function teamPersonJsonLd(slug: string, person: { name: string; role: string; photo: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.role,
    image: `${SITE_URL}${person.photo}`,
    url: canonicalUrl(`/team/${slug}`),
    worksFor: { "@id": PRACTICE_JSON_LD["@id"] },
  };
}

/** A shop category's head, named from its URL until the shop loads categories on the server. */
export function shopCategoryHead(slug: string) {
  const name = titleFromSlug(slug);
  return pageHead(`/category/${slug}`, {
    title: `${name} | Pav Dental Shop`,
    description: `Shop ${name.toLowerCase()} from Pav Dental in Bradford.`,
  });
}

/** A product's head, named from its URL until the shop loads products on the server. */
export function productHead(slug: string) {
  const name = titleFromSlug(slug);
  return pageHead(`/shop/${slug}`, {
    title: `${name} | Pav Dental Shop`,
    description: `${name} from the Pav Dental shop in Bradford.`,
  });
}

/**
 * Live pages intentionally held back (return 404 until approved). Currently empty:
 * both /services/finance (FCA-compliant payment options) and /services/regestration
 * (privacy-safe patient registration) are built and live.
 */
export const UNBUILT_PATHS: ReadonlySet<SeoPath> = new Set();

/** The sitemap: every built page in PAGES. scripts/write-sitemap.mjs writes it to public/sitemap.xml. */
export function sitemapXml(): string {
  const urls = Object.keys(PAGES)
    .filter((path) => !UNBUILT_PATHS.has(path as SeoPath))
    .map((path) => `  <url><loc>${canonicalUrl(path)}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

/**
 * Paths that moved to the live site's URLs but are still linked from
 * somewhere: the mobile app opens these four legal pages
 * (pavdental/src/config/legal.ts).
 */
export const MOVED_PATHS: Record<string, string> = {
  "/privacy": "/privacy-policy",
  "/terms": "/terms-and-condition",
  "/cookies": "/cookie-policy",
  "/complaints": "/complaints-policy",
  // The live /gdpr page is another practice's template ("Parish Dental",
  // another jurisdiction's data protection law), so it is not ported; its
  // visitors go to the practice's reviewed privacy notice instead.
  "/gdpr": "/privacy-policy",
};

/**
 * Where a request for `pathname` should be sent with a permanent redirect, or
 * null to serve it as is. A trailing slash is dropped, so each page has one
 * URL, and moved paths go to their new home.
 */
export function redirectTarget(pathname: string): string | null {
  const trimmed = pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : pathname;
  const target = MOVED_PATHS[trimmed] ?? trimmed;
  return target === pathname ? null : target;
}

/**
 * The practice as search engines see it. Every live page carries this
 * structured data; it is copied from the live site with the street address
 * split out of the full address, the empty "@id" filled in, and tracking
 * parameters removed from the profile links.
 */
export const PRACTICE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  "@id": `${SITE_URL}/#practice`,
  name: "Pav Dental",
  image: `${SITE_URL}/images/pav-logo.png`,
  url: `${SITE_URL}/`,
  telephone: "+44 800 193 8786",
  address: {
    "@type": "PostalAddress",
    streetAddress: "786 Leeds Road",
    addressLocality: "Bradford",
    postalCode: "BD3 9TY",
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 53.792207,
    longitude: -1.730703,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: [
    "https://www.facebook.com/pavdental",
    "https://www.instagram.com/pavdentalofficial",
    "https://www.youtube.com/@PavDental",
  ],
};
