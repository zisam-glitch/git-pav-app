import { BookButton, CallButton, FaqPhoto, Section, type FaqItem } from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

const FAQS: FaqItem[] = [
  {
    q: "Who are 24hr Emergency Dentist?",
    a: "We are a professional and experienced dental team that provides Emergency Dental Service covering Bradford area.",
  },
  {
    q: "What can you expect?",
    a: (
      <div className="space-y-3">
        <p>
          Accidents and sudden issues can be dental nightmares. Patients ill be seen on the same day
          and as soon as possible by a Qualified Dentist &amp; Dental nurse.
        </p>
        <p>
          An initial diagnosis will be carried out to determine your dental emergency &amp; we will
          provide you with treatment options.
        </p>
        <p>
          Whether it is a chipped tooth, a loose filling, or bad toothache, we will help so you can
          quickly get back to your normal self again
        </p>
      </div>
    ),
  },
  {
    q: "Where is it?",
    a: "The practice is in Bradford , West Yorkshire. We are situated about 10 minutes from central Bradford, which has access routes to Leeds and surrounding cities. Leeds Road, Bradford. Or we come to you",
  },
  {
    q: "How does it work?",
    a: "Once you’ve called us or booked via our online booking system, we will get a member of our dental team to call you back within the hour. We will then arrange an emergency dental appointment with one of our Dentists.",
  },
  {
    q: "What will happen during this emergency dental appointment?",
    a: "During this dental appointment, the Dentist will do their best to treat the dental issue in one appointment. However, if this isn’t possible you may be advised to have a follow-up appointment. We will advise you on what you should do to ease the pain until you can see your dentist.",
  },
  {
    q: "I have a toothache and I’m in pain?",
    a: "If you’re experiencing pain in your teeth or mouth, please contact us at 24hr Emergency Dentist Leeds today. We offer a same-day, out-of-hours emergency dental appointments, so you should be able to see someone relatively quickly.",
  },
  {
    q: "Nervous or Anxious about seeing the dentist?",
    a: "Dental phobia exists, this can result in anxiety, panic attacks, difficulty breathing, nausea, and fainting. Our dental team have over 20 years of experience dealing with patients concerns. As we understand that avoiding or delaying treatment will have an overall impact on your oral health. Please contact us today to help with your dental emergency.",
  },
  {
    q: "Are you registering new patients?",
    a: (
      <div className="space-y-3">
        <p>
          We only really see dental emergencies, and we always send patients back to their own
          registered dentist. Most dentists would be upset if we were to register the patients we
          have seen out of hours.
        </p>
        <p>
          If you don’t have a dentist and want to be seen the dentist will still be able to treat
          any further issues however we don’t operate as normal dental practices and request you are
          seen every 6 months. Any time you want to book an appointment to see one of the dentists
          you can do so any time. Book online or Call us. The responsibility lies with you as when
          you want to be seen.
        </p>
      </div>
    ),
  },
  {
    q: "Some home methods to treat tooth if you cant access a dentist",
    a: (
      <div className="space-y-3">
        <p>
          Try over the counter painkillers like paracetamol or ibuprofen. Only take the medications
          if you are normally ok taking them. Occasionally it will reduce the pain slightly until
          you can get to the dentist. This is only a temporary measure but sometimes it helps if you
          have no other alternative.
        </p>
        <p>
          Hot salt water mouth washes are very useful if you have a swelling or some sort of
          infection. Salt water is a natural anti septic and can reduce pain.
        </p>
      </div>
    ),
  },
  {
    q: "Why is tooth ache worse at night time?",
    a: (
      <div className="space-y-3">
        <p>
          Many people suffer with dental pain at night time. A lot of the time the pain makes it
          unbearable to sleep. A lot of pain at night time is due to the position of you lying down,
          blood rushing to the head and the pain or swelling inside the tooth increase.
        </p>
        <p>
          Before getting to this level of pain we always advise a visit to the dentist so to avoid
          such dilemmas. The dentist will take x rays and check which tooth is causing the pain. So
          many times the pain spreads top and bottom unable to locate the pain. Thus the x ray is
          one of the best tests to elicit where the pain is coming from.
        </p>
      </div>
    ),
  },
  {
    q: "If I go to A and E with tooth ache will they treat me?",
    a: (
      <div className="space-y-3">
        <p>
          Unfortunately, toothache is not classed as an emergency or an accident and as it is not
          life-threatening, they will not be able to treat you.
        </p>
        <p>
          If you have facial swelling that is affecting your ability to breathe then we advise you
          to go to A and E.
        </p>
      </div>
    ),
  },
  {
    q: "How to get emergency dental treatment on the NHS?",
    a: (
      <div className="space-y-3">
        <p>
          If you are registered with an NHS dentist you may be able to get a dentist appointment at
          your own dentist, however it may not be on the same day. Dental practices generally close
          at 5 pm so to get an NHS emergency dentist appointment may be difficult.
        </p>
        <p>
          Out of hours NHS do provide emergency appointments but have very strict criteria such as
          persistent bleeding and unable to breathe or swallow due to swelling.
        </p>
        <p>
          If this is the case your NHS dentist should have an alternate local number for you to call
          in the case of emergency.
        </p>
        <p>
          Emergency247Dentist provides private treatment and promises to see you on the same day.
          You can contact one of the reception staff members or book online and get an appointment
          immediately.
        </p>
      </div>
    ),
  },
  {
    q: "I am not registered does that matter?",
    a: "No, you don’t have to be registered with anyone to see us.",
  },
  {
    q: "Will the dentist hurt me?",
    a: "No, the dentist and the team aim to make your experience as peaceful and enjoyable as possible. We like to take our time and make sure you are comfortable. Read our reviews no one has once complained of pain!",
  },
  {
    q: "I’m really nervous? What can you do?",
    a: "We are an emergency dental service. So most of the time we see nervous patients. No one likes coming to the dentist. Once you speak to us on the phone we will reassure you and guarantee you won’t have to be nervous about anything. We work very relaxed and all of our patients (well most) really enjoy their time with us.",
  },
];

export function EmergencyFaq() {
  return (
    <Section theme="white" aria-labelledby="emergency-faq-heading">
      <FaqPhoto
        id="emergency-faq-heading"
        title="Frequently Asked Question"
        items={FAQS}
        image="/images/generated/home-emergency-night.jpg"
        alt=""
        actions={
          <>
            <CallButton>Call us Now · {PRACTICE_PHONE}</CallButton>
            <BookButton variant="outline">Book Online</BookButton>
          </>
        }
      />
    </Section>
  );
}
