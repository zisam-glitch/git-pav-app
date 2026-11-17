// Pages ported word for word from the live site (seo/live-content/*.json),
// apart from the typo fixes listed in the pull request that added them.
// Edit the text here from now on.
import type { ContentBlock } from "@/components/content/content-blocks";

export interface LivePage {
  heading: string;
  eyebrow?: string;
  blocks: ContentBlock[];
}

export const LIVE_PAGES = {
  "/faq": {
    "heading": "Frequently Asked Questions",
    "eyebrow": "FAQ",
    "blocks": [
      {
        "kind": "heading",
        "text": "Why are my gums bleeding?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Gums bleed when they are irritated and inflamed which is not considered normal. This is due to plaque (a soft film of bacteria) being left on the teeth which causes inflammation called gingivitis and if not addressed can develop into gum disease. Over time, if not cleaned off through daily brushing and interdental cleaning, the plaque can turn into a hard deposit called tartar or calculus which will require professional scaling by your dentist or hygienist to remove it. It is important even if your gums bleed they are still brushed to keep the mouth clean otherwise the bacteria build up in the mouth will make gum inflammation worse. After a few days of thorough cleaning, your gums should stop bleeding. If this does not happen you will need to ask the advice of your dental team as you may need professional cleaning. A good oral care regime should be able to prevent your gums from bleeding if done correctly. We would always suggest that you have regular examinations at your dentist. This can help diagnose and treat anything unusual in your mouth so you get the correct care and advice. You may have to use a softer brush whilst the gums are inflamed until they become healthier. It is also important to clean in between teeth daily using interdental brushes or floss. Smoking can cover up a gum problem as it restricts the blood flow to the mouth. If you have recently given up smoking this could allow the gums to get a better circulation and therefore start to bleed."
      },
      {
        "kind": "heading",
        "text": "What can I do if I have sensitive teeth?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "You can try using a toothpaste specifically designed for sensitive teeth. Brush your teeth as normal using de-sensitising and then rub a little toothpaste into the sensitive area when going to bed as it helps protect the surface. Try to avoid strongly acidic foods and drinks and wait at least an hour after eating before brushing as this could cause even more sensitivity. Grinding your teeth can also increase sensitivity and a mouth guard may be necessary. If the pain continues, speak to your dental team and they may be able to offer further care to reduce your symptoms. A number of things can cause sensitivity and your dental team will be able to identify these and advise the correct care."
      },
      {
        "kind": "heading",
        "text": "How often should I have a dental check up?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Dental health varies from person to person; a general rule for adult patients is to visit a dentist once or twice a year, even if your mouth is in excellent condition. This way, you can get your teeth professionally cleaned regularly and maintain excellent oral health."
      },
      {
        "kind": "heading",
        "text": "Nervous about seeing a dentist?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Dental phobia exists, this can result in anxiety, panic attacks, difficulty breathing, nausea, and fainting. Our dental team have years of experience dealing with patients concerns, making them feel calm, safe and welcome- you will NEVER have to undertake any treatment you're not comfortable and we will talk and guide you through the full process. We understand that avoiding or delaying treatment will have an overall impact on your oral health."
      },
      {
        "kind": "heading",
        "text": "Some home methods to treat toothache if you cannot access a dentist.",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Try over the counter painkillers like paracetamol or ibuprofen. Only take the medications if you are normally ok taking them. Occasionally it will reduce the pain slightly until you can get to the dentist. This is only a temporary measure but sometimes it helps if you have no other alternative. Hot salt water mouth washes are very useful if you have a swelling or some sort of infection. Salt water is a natural anti-septic and can reduce pain."
      }
    ]
  },
  "/cctv-policy": {
    "heading": "CCTV Policy",
    "blocks": [
      {
        "kind": "paragraph",
        "text": "We take our patient and our staff safety very seriously, therefore, we use CCTV at our clinics. Please read the points about our CCTV policy below."
      },
      {
        "kind": "list",
        "items": [
          "CCTV is in place in the reception areas and corridors.",
          "CCTV has been installed for the safety and security of our patients and staff.",
          "Images are recorded 24 hours a day, seven days a week and stored on the hard drives of the recording devices. The recording devices are situated in the reception area under password and only the manager and owners of the practice have access to the recordings. The manager regularly checks that the CCTV devices are working as intended.",
          "The CCTV only records images and does not record audio.",
          "Visitors to the practice have the right to request to see images of themselves on CCTV as part of a Data Protection request. Like all Data Protection requests, this request must be made in writing and the same exceptions apply. We charge an administration fee of £10 for this. We will also require information that will allow us to identify the visitor and the date/time of the visit.",
          "Signs informing visitors that CCTV is in place can be found at our clinics.",
          "The recording devices have the capability of transferring data to an external drive for cooperation with the relevant authorities. We only ever do this where there is cause to believe the safety and security of patients/staff has been compromised. We do not ever share images with other third parties.",
          "All CCTV recordings are stored on our recording devices’ hard-drives for 30 days before being wiped.",
          "We have followed the CCTV guidelines produced by the Information Commissioners’ Office – ICO."
        ]
      }
    ]
  },
  "/practice-policy": {
    "heading": "Pav Dental Documents",
    "blocks": [
      {
        "kind": "paragraph",
        "text": "Comprehensive Policies and Guidelines for Excellence in Dental Practice"
      },
      {
        "kind": "heading",
        "text": "Policies"
      },
      {
        "kind": "documents",
        "items": [
          {
            "text": "CCTV Policy",
            "href": "/policies/CCTV%20Policy.pdf"
          },
          {
            "text": "Complaints Policy",
            "href": "/policies/Complaints%20Policy.pdf"
          },
          {
            "text": "CQC Statement of Purpose Policy",
            "href": "/policies/CQC%20Statement%20of%20Purpose%20Policy.pdf"
          },
          {
            "text": "Herpes Simplex Guidance",
            "href": "/policies/Herpes%20Simplex%20Guidance.pdf"
          },
          {
            "text": "Privacy Notice for Patients including Children",
            "href": "/policies/Privacy%20Notice%20for%20Patients%20including%20children.pdf"
          },
          {
            "text": "Quality Assurance Statement",
            "href": "/policies/Quality%20Assurance%20Statement.pdf"
          },
          {
            "text": "Was Not Brought Implementation Guide",
            "href": "/policies/Was%20Not%20Brought%20Implementation%20Guide.pdf"
          },
          {
            "text": "Zero Tolerance Policy",
            "href": "/policies/Zero%20Tolerance%20Policy.pdf"
          }
        ]
      },
      {
        "kind": "heading",
        "text": "Consent Forms"
      },
      {
        "kind": "documents",
        "items": [
          {
            "text": "Consent Form - Bridges",
            "href": "/forms/Consent%20form%20-%20Bridges.docx"
          },
          {
            "text": "Consent Form - Composite Bonding",
            "href": "/forms/Consent%20form%20-%20Composite%20Bonding.docx"
          },
          {
            "text": "Consent Form - Crowns",
            "href": "/forms/Consent%20form%20-%20Crowns.docx"
          },
          {
            "text": "Consent Form - Denture",
            "href": "/forms/Consent%20form%20-%20Denture.docx"
          },
          {
            "text": "Consent Form - Direct Access",
            "href": "/forms/Consent%20form%20-%20Direct%20access.docx"
          },
          {
            "text": "Consent Form - Extraction",
            "href": "/forms/Consent%20form%20-%20Extraction.docx"
          },
          {
            "text": "Consent Form - Filling Restoration",
            "href": "/forms/Consent%20form%20-%20Filling%20Restoration.docx"
          },
          {
            "text": "Consent Form - Implant",
            "href": "/forms/Consent%20form%20-%20Implant.docx"
          },
          {
            "text": "Consent Form - IV Sedation",
            "href": "/forms/Consent%20form%20-%20IV%20Sedation.docx"
          },
          {
            "text": "Consent Form - Nightguards",
            "href": "/forms/Consent%20form%20-%20Nightguards.docx"
          },
          {
            "text": "Consent Form - Periodontal Treatment",
            "href": "/forms/Consent%20form%20-%20Periodontal%20Treatment.docx"
          },
          {
            "text": "Consent Form - Permission to Book Appointment",
            "href": "/forms/Consent%20form%20-%20Permission%20to%20book%20appointment.docx"
          },
          {
            "text": "Consent Form - Photograph Usage for Teaching",
            "href": "/forms/Consent%20form%20-%20Photograph%20usage%20for%20teaching.docx"
          },
          {
            "text": "Consent Form - Photography",
            "href": "/forms/Consent%20form%20-%20Photography.docx"
          },
          {
            "text": "Consent Form - Rad Exposure on Pregnancy",
            "href": "/forms/Consent%20form%20-%20Rad%20exposure%20on%20Pregnancy.docx"
          },
          {
            "text": "Consent Form - Refusal of Consent",
            "href": "/forms/Consent%20form%20-%20Refusal%20of%20Consent%20form.docx"
          },
          {
            "text": "Consent Form - Root Canal Treatment",
            "href": "/forms/Consent%20form%20-%20Root%20Canal%20Treatment.docx"
          },
          {
            "text": "Consent Form - Sharing Records to Secondary Care",
            "href": "/forms/Consent%20form%20-%20Sharing%20Records%20to%20Secondary%20Care.docx"
          },
          {
            "text": "Consent Form - Third Party Request",
            "href": "/forms/Consent%20form%20-%20Third%20Party%20Request.docx"
          },
          {
            "text": "Consent Form - Whitening",
            "href": "/forms/Consent%20form%20-%20Whitening.docx"
          }
        ]
      },
      {
        "kind": "heading",
        "text": "Posters"
      },
      {
        "kind": "documents",
        "items": [
          {
            "text": "COSHH Chemicals Poster",
            "href": "/posters/COSHH%20Chemicals%20Poster.pdf"
          },
          {
            "text": "Domestic Abuse",
            "href": "/posters/Domestic%20Abuse.pdf"
          },
          {
            "text": "Domestic Violence",
            "href": "/posters/Domestic%20Violence.pdf"
          },
          {
            "text": "Free Dental Treatment Poster A3",
            "href": "/posters/Free%20dental%20treatment%20poster%20A3.pdf"
          },
          {
            "text": "GDC Standards",
            "href": "/posters/GDC%20Standards.pdf"
          },
          {
            "text": "Hand Hygiene",
            "href": "/posters/Hand%20Hygiene.png"
          },
          {
            "text": "Safeguarding Flow Chart",
            "href": "/posters/Safeguarding%20flow%20chart.docx"
          },
          {
            "text": "Sepsis Trust Dentist Campaign Poster",
            "href": "/posters/Sepsis%20Trust%20Dentist%20Campaign%20Poster.jpg"
          }
        ]
      }
    ]
  },
  "/services": {
    "heading": "Our Services",
    "blocks": [
      {
        "kind": "cards",
        "items": [
          {
            "title": "Emergency Dental",
            "text": "We offer same day emergency dental care 24-hours a day, seven days a week.",
            "href": "/services/emergency-dental"
          },
          {
            "title": "Tooth Extraction",
            "text": "Pain free tooth removal at pav dental care",
            "href": "/services/tooth-extraction"
          },
          {
            "title": "Root Canal",
            "text": "Root canal treatment at pav dental care",
            "href": "/services/root-canal"
          },
          {
            "title": "Oral Hygiene",
            "text": "Oral hygiene treatment at pav dental care",
            "href": "/services/oral-hygiene"
          },
          {
            "title": "General Dentistry",
            "text": "We offer a large range of treatment options and procedures which are fundam...",
            "href": "/services/general-dentistry"
          },
          {
            "title": "Dentures",
            "text": "Dentures at pav dental care",
            "href": "/services/dentures"
          },
          {
            "title": "Whitening",
            "text": "Try our simple, safe and effective teeth whitening and see a significant impro...",
            "href": "/services/whitening"
          },
          {
            "title": "Cosmetic",
            "text": "Top Cosmetic Dentistry Clinic in Leeds Pav Dental",
            "href": "/services/cosmetic"
          },
          {
            "title": "Aesthetics",
            "text": "Enhance your natural beauty with our personalised facial aesthetic treatments.",
            "href": "/services/aesthetics"
          },
          {
            "title": "Custom Grillz",
            "text": "At Pav Dental, we believe in a personalized approach to dental aesthetics. Our cu...",
            "href": "/services/custom-grillz"
          },
          {
            "title": "Mouthguards",
            "text": "Designed for comfort, accuracy and full protection",
            "href": "/services/mouthguards"
          },
          {
            "title": "Mobile Dentistry",
            "text": "Enabling our patients to access treatment in the comfort of their own home.",
            "href": "/services/mobile-dentistry",
            "badge": "Coming soon"
          },
          {
            "title": "Virtual Dentistry",
            "text": "Virtual dental consultations from the comfort of your home.",
            "href": "/services/virtual-dentistry",
            "badge": "Coming soon"
          },
          {
            "title": "Finance",
            "text": "0% Finance Available On Private Treatments...",
            "href": "/services/finance"
          },
          {
            "title": "Registration",
            "text": "Register with Pav Dental to access our full range of services",
            "href": "/services/regestration"
          }
        ]
      }
    ]
  }
} satisfies Record<string, LivePage>;

export type LivePagePath = keyof typeof LIVE_PAGES;
