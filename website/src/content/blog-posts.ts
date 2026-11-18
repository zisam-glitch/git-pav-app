// The blog posts on the live site, newest first, ported word for word from the live
// pages (seo/live-content/blog--*.json). `excerpt` is the text the live blog page
// shows on each card. The cover images are the live site's, hosted on Contentful.
// Edit the text here from now on.
import type { ContentBlock } from "@/components/content/content-blocks";

export interface BlogPost {
  slug: string;
  title: string;
  /** Publication date as YYYY-MM-DD. */
  date: string;
  /** The date as the live site shows it. */
  dateLabel: string;
  author: string;
  /** The cover image on the blog page's cards. */
  image: { src: string; alt: string };
  excerpt: string;
  blocks: ContentBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    "slug": "can-a-dentist-assess-a-dental-problem-through-a-video-call-what-can-and-cant-be-checked",
    "title": "Can a Dentist Assess a Dental Problem Through a Video Call? What Can and Can't Be Checked",
    "date": "2026-11-12",
    "dateLabel": "November 12, 2026",
    "author": "Dr Bhojani",
    "image": {
      "src": "https://images.ctfassets.net/kygl0mrej7ni/fUQmcRs38d6XwriAdpbl8/fda491791450a09e9a938d2df556e54f/Tele-Dentistry_Consultation_at_Home.png",
      "alt": "//images.ctfassets.net/kygl0mrej7ni/fUQmcRs38d6XwriAdpbl8/fda491791450a09e9a938d2df556e54f/Tele-Dentistry_Consultation_at_Home.png"
    },
    "excerpt": "Having a toothache, sore gum or broken tooth can leave you wondering if you should visit the dental ...",
    "blocks": [
      {
        "kind": "paragraph",
        "text": "Having a toothache, sore gum or broken tooth can leave you wondering if you should visit the dental clinic. In some cases, it can be useful to have a video call with a dentist. This lets you describe your symptoms and show them the area which is causing you problems."
      },
      {
        "kind": "paragraph",
        "text": "Dentists can definitely help you with some dental issues during a video call. They will ask questions to determine what you should do next. However, a smartphone camera isn't the same as a physical examination so they may not be able to help with all dental issues."
      },
      {
        "kind": "heading",
        "text": "Can a Dentist Check Your Teeth Through a Video Call?"
      },
      {
        "kind": "paragraph",
        "text": "Yes, they can examine any visible issues on camera. They may want you to open your mouth wide, move the phone closer or show the area from different angles."
      },
      {
        "kind": "paragraph",
        "text": "They will also ask questions about your symptoms, such as when the pain started, if it is getting worse and if there is any swelling or sensitivity."
      },
      {
        "kind": "paragraph",
        "text": "This will allow them to give you an initial assessment and determine if you require any advice, an in person appointment or urgent treatment. However this may not be a definitive diagnosis, particularly if the issue is within the tooth or under the gum."
      },
      {
        "kind": "heading",
        "text": "What Dental Problems Can Be Assessed Online?"
      },
      {
        "kind": "paragraph",
        "text": "A video consultation can be useful if you are experiencing any of the following issues, especially if there are visible symptoms of your issue."
      },
      {
        "kind": "heading",
        "text": "1. Toothache and Sensitivity",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Your dentist may want to know where your toothache is. They may also ask what makes it worse. For example, do you have any pain when eating, drinking cold things or biting?"
      },
      {
        "kind": "paragraph",
        "text": "This gives your dentist an idea of what could be causing the issue. However, they will not be able to confirm what the problem may be until they have looked at your teeth properly."
      },
      {
        "kind": "heading",
        "text": "2. Swollen or Bleeding Gums",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "You can point out the areas that are red, swollen or sore. The dentist might also ask if your gums bleed when you brush them or if you have noticed any changes to your gums around a specific tooth."
      },
      {
        "kind": "paragraph",
        "text": "This could indicate gum inflammation or infection and an examination is usually required to assess the gums further."
      },
      {
        "kind": "heading",
        "text": "3. Chipped or Broken Teeth",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Visible chips/ cracks may easily be seen on camera. The dentist will then examine the affected area and ask questions about how the damage happened."
      },
      {
        "kind": "paragraph",
        "text": "Questions may also be asked about if it causes any pain/sensitivity to the tooth. If it's a severe injury then you will likely be assessed by a dentist to see how much of the tooth has been affected."
      },
      {
        "kind": "heading",
        "text": "4. Swelling Around the Mouth or Jaw",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "If you have any puffiness around your jaw, cheek or mouth, they may be able to see this on the phone. They can ask when it started and if it is getting worse."
      },
      {
        "kind": "paragraph",
        "text": "This helps them decide if you need to come in for an examination. If there is severe or worsening swelling, especially if you are having trouble breathing or swallowing, then this should be seen by a medical professional immediately."
      },
      {
        "kind": "heading",
        "text": "What Can't a Dentist Check Through a Video Call?"
      },
      {
        "kind": "paragraph",
        "text": "There are some limitations to this. You will only ever be able to see the visible areas of your mouth as the camera does not give you the same information as having instruments or x-rays."
      },
      {
        "kind": "heading",
        "text": "1. Hidden Tooth Decay",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Hidden damage between teeth or under the surface would not show up on camera. If you have symptoms which suggest a cavity, your dentist will not be able to see how large or deep it is on a video call."
      },
      {
        "kind": "heading",
        "text": "2. Problems Below the Gum Line",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Gum disease affects the supporting tissues and bone around your teeth. The dentist will not be able to accurately measure gum pockets or assess how well your teeth are supported by looking at them on a screen."
      },
      {
        "kind": "paragraph",
        "text": "A physical examination is required."
      },
      {
        "kind": "heading",
        "text": "3. Problems Inside the Tooth",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Some dental issues will affect the nerve of the tooth or area around the roots. This may mean you'll need x-rays or other tests."
      },
      {
        "kind": "paragraph",
        "text": "You can't see what is going on inside your tooth or underneath the jaw on a video call."
      },
      {
        "kind": "heading",
        "text": "4. Loose Teeth and Bite Problems",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "A dentist might be able to spot a displaced looking tooth but will not be able to properly assess how loose it is or how your upper and lower teeth fit together when you chew."
      },
      {
        "kind": "paragraph",
        "text": "These tests need to be done in-person."
      },
      {
        "kind": "heading",
        "text": "When Are Virtual Dental Solutions Helpful?"
      },
      {
        "kind": "paragraph",
        "text": "Virtual dental solutions can help provide general guidance. You can talk to a dentist, describe your symptoms and see if you need to come into the clinic."
      },
      {
        "kind": "paragraph",
        "text": "This can be useful if you have minor tooth pain, a chipped tooth, sore gums or have any queries after a recent dental treatment. The dentist can advise on the next steps via a video consultation."
      },
      {
        "kind": "paragraph",
        "text": "This can also be a good way to discuss treatments or ask further questions. Find out more about our virtual dental solutions and how video consultations can help you with your dental care.",
        "links": [
          {
            "text": "virtual dental solutions",
            "href": "/services/virtual-dentistry"
          }
        ]
      },
      {
        "kind": "heading",
        "text": "How to Prepare for a Video Dental Appointment"
      },
      {
        "kind": "paragraph",
        "text": "To make the consultation as smooth as possible, you could do some basic preparation beforehand. Find a quiet well lit place to have your call and ensure your camera and microphone are working."
      },
      {
        "kind": "paragraph",
        "text": "It also helps:"
      },
      {
        "kind": "paragraph",
        "text": "Be prepared by noting when the issue started and if there have been any changes."
      },
      {
        "kind": "paragraph",
        "text": "Note any pain, soreness, swelling or bleeding."
      },
      {
        "kind": "paragraph",
        "text": "Keep details of any recent dental treatments and medications."
      },
      {
        "kind": "paragraph",
        "text": "Have a small mirror to hand."
      },
      {
        "kind": "paragraph",
        "text": "Try to keep your phone still whilst showing your teeth. If the dentist is unable to get a clear view they may ask you to adjust the camera angle or send secure photos."
      },
      {
        "kind": "heading",
        "text": "When Should You Visit a Dentist in Person?"
      },
      {
        "kind": "paragraph",
        "text": "Video appointments are not appropriate for all dental issues. If you are experiencing any persistent pain, suspected infection, a loose tooth or damage then you should book an in-person appointment."
      },
      {
        "kind": "paragraph",
        "text": "Treatment such as fillings, root canal, tooth extraction and repair of broken teeth will need an in person appointment."
      },
      {
        "kind": "paragraph",
        "text": "If you have severe swelling, trouble breathing or swallowing or heavy bleeding then you should NOT wait for a video appointment as this requires urgent medical attention."
      },
      {
        "kind": "heading",
        "text": "Final Thoughts"
      },
      {
        "kind": "paragraph",
        "text": "You may find it helpful to have a video call with your dentist. They can help provide clarity on any dental issues you are experiencing by looking at them on screen. This is helpful if your issue is something you can clearly describe."
      },
      {
        "kind": "paragraph",
        "text": "However, they still won’t be able to physically examine you with equipment and x-rays. Your dentist will advise you to come in-person to see them if they need to take a closer look."
      },
      {
        "kind": "heading",
        "text": "FAQs"
      },
      {
        "kind": "heading",
        "text": "Can dentists help me with my toothache via video call?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "The dentist will be able to ask you questions and look at the area; however, an in-person examination may be necessary."
      },
      {
        "kind": "heading",
        "text": "Can dentists see cavities on video call?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "You may be able to see some cavities but any hidden decay between your teeth would need an in person assessment."
      },
      {
        "kind": "heading",
        "text": "Can I show my swollen gums to my dentist?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Yes you can show your dentist the area and they can give you some initial advice. However you may need to be assessed closer."
      },
      {
        "kind": "heading",
        "text": "Can I have my teeth checked via video call?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "No, regular check ups are needed so they can assess your teeth and gums properly and spot any problems."
      },
      {
        "kind": "heading",
        "text": "Are video consultations useful for dental emergencies?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "They can help you with initial advice but if there is severe swelling, trouble breathing or swallowing, or heavy bleeding then you should seek immediate medical attention."
      }
    ]
  },
  {
    "slug": "tooth-extraction-in-bradford-when-is-removing-a-tooth-the-best-option",
    "title": "Tooth Extraction in Bradford: When Is Removing a Tooth the Best Option?",
    "date": "2026-10-29",
    "dateLabel": "October 29, 2026",
    "author": "Dr Bhojani",
    "image": {
      "src": "https://images.ctfassets.net/kygl0mrej7ni/4yR8WtVFUkZn6K0912Kg2z/7619a3cd98a6edabceb66cf225f7c79d/Dental_Extraction_Forceps_Holding_Molar.png",
      "alt": "//images.ctfassets.net/kygl0mrej7ni/4yR8WtVFUkZn6K0912Kg2z/7619a3cd98a6edabceb66cf225f7c79d/Dental_Extraction_Forceps_Holding_Molar.png"
    },
    "excerpt": "A toothache is not always a sign that a person needs to have a tooth extracted. In many cases, a den...",
    "blocks": [
      {
        "kind": "paragraph",
        "text": "A toothache is not always a sign that a person needs to have a tooth extracted. In many cases, a dentist can treat the problem and save the natural tooth. But when the damage is too severe, tooth extraction is ideally the best option."
      },
      {
        "kind": "paragraph",
        "text": "Tooth extraction simply refers to removing a tooth from its socket. It is required because of multiple reasons for instance, severe decay, infection, gum disease or a tooth that is causing other problems."
      },
      {
        "kind": "paragraph",
        "text": "For anyone who is looking for tooth extraction in Bradford, having an idea about the reasons for the procedure is essential. A dentist, during the initial examination, will inform the patient whether the affected tooth can be saved or needs to be extracted.",
        "links": [
          {
            "text": "tooth extraction in Bradford",
            "href": "/services/tooth-extraction"
          }
        ]
      },
      {
        "kind": "heading",
        "text": "When Does a Tooth Need to Be Removed?"
      },
      {
        "kind": "paragraph",
        "text": "A dentist may recommend extraction when a tooth is too damaged to be repaired. This can happen because of deep decay, a serious infection or a broken tooth that cannot be restored."
      },
      {
        "kind": "paragraph",
        "text": "Other reasons include:"
      },
      {
        "kind": "list",
        "items": [
          "Severe gum disease that has made the tooth loose.",
          "Repeated infections around the same tooth.",
          "A wisdom tooth causing pain or swelling.",
          "A tooth that is badly damaged below the gum line.",
          "Crowding where removal is needed as part of orthodontic treatment."
        ]
      },
      {
        "kind": "paragraph",
        "text": "Extraction is not usually the first choice if the tooth can be saved. The dentist will assess the condition of the tooth and discuss suitable options before recommending removal."
      },
      {
        "kind": "heading",
        "text": "Can a Tooth Be Saved Instead?"
      },
      {
        "kind": "paragraph",
        "text": "Yes, some teeth can be saved even when they are painful or damaged. The right treatment depends on how much of the tooth remains healthy and whether the surrounding tissues are affected."
      },
      {
        "kind": "table",
        "header": true,
        "rows": [
          [
            "Dental problem",
            "Possible treatment"
          ],
          [
            "Small or moderate cavity",
            "Filling"
          ],
          [
            "Severe decay affecting the nerve",
            "Root canal treatment and possibly a crown"
          ],
          [
            "Damaged tooth that can still be restored",
            "Crown or other repair"
          ],
          [
            "Tooth that cannot be repaired",
            "Extraction may be needed"
          ]
        ]
      },
      {
        "kind": "paragraph",
        "text": "These are general examples, not a diagnosis. A dentist may need to take an X-ray before deciding which option is suitable."
      },
      {
        "kind": "paragraph",
        "text": "Saving a natural tooth can be helpful, but it is not always possible. The dentist should explain the benefits, costs and limitations of each suitable option."
      },
      {
        "kind": "heading",
        "text": "Is Tooth Extraction Painful?"
      },
      {
        "kind": "paragraph",
        "text": "The idea of having a tooth removed can make some people nervous. The good news is that a dentist normally uses local anesthetic to numb the area before starting the procedure."
      },
      {
        "kind": "paragraph",
        "text": "The patient may feel pressure or movement while the tooth is being removed, but should not feel sharp pain. If they do feel pain, they should tell the dentist."
      },
      {
        "kind": "paragraph",
        "text": "Some extractions are straightforward, while others need a small surgical procedure, especially if the tooth is broken or has not fully come through the gum."
      },
      {
        "kind": "paragraph",
        "text": "The dentist should explain what will happen before starting and give advice about recovery. Anyone who feels anxious can mention this during the consultation."
      },
      {
        "kind": "heading",
        "text": "What Happens During a Tooth Extraction?"
      },
      {
        "kind": "paragraph",
        "text": "The dentist first examines the tooth and may take an X-ray to check its position and roots. They will explain the procedure and discuss any risks before beginning."
      },
      {
        "kind": "paragraph",
        "text": "Local anesthetic is usually given to numb the area. The dentist then loosens the tooth and removes it. If it is difficult to reach, a small cut in the gum may be needed."
      },
      {
        "kind": "paragraph",
        "text": "After removal, the dentist checks the area and may place gauze over the socket to help control bleeding. Stitches may be needed for some surgical extractions."
      },
      {
        "kind": "paragraph",
        "text": "The length of the appointment depends on the tooth and how difficult it is to remove. The dentist will provide aftercare instructions before the patient leaves."
      },
      {
        "kind": "heading",
        "text": "How Long Does It Take to Recover?"
      },
      {
        "kind": "paragraph",
        "text": "Recovery depends on which tooth was removed and how difficult the procedure was. After a simple extraction, many people feel better within a few days, although the socket takes longer to heal fully."
      },
      {
        "kind": "paragraph",
        "text": "Some pain, mild swelling and a little blood in the saliva can be normal at first. These symptoms should gradually improve."
      },
      {
        "kind": "paragraph",
        "text": "During recovery, it is best to eat soft foods, avoid smoking and follow the dentist's instructions. Avoid rinsing your mouth during the first 24 hours, as this can disturb the blood clot."
      },
      {
        "kind": "paragraph",
        "text": "If pain or swelling gets worse instead of improving, contact your dentist for advice."
      },
      {
        "kind": "heading",
        "text": "What Are the Possible Risks?"
      },
      {
        "kind": "paragraph",
        "text": "Tooth extraction is a common procedure, but problems can sometimes happen. These may include bleeding, infection or dry socket, which occurs when the blood clot does not form properly or comes away too early."
      },
      {
        "kind": "paragraph",
        "text": "Dry socket can cause increasing pain a few days after the extraction. A bad taste or smell may also develop."
      },
      {
        "kind": "paragraph",
        "text": "Following the aftercare instructions can help reduce the risk of problems. Contact your dentist if you have severe or worsening pain, increasing swelling, a fever or bleeding that will not stop."
      },
      {
        "kind": "paragraph",
        "text": "If you have difficulty breathing or swallowing, seek emergency medical help."
      },
      {
        "kind": "heading",
        "text": "What Should You Look for in a Bradford Dental Clinic?"
      },
      {
        "kind": "paragraph",
        "text": "Before booking a tooth extraction, check that the clinic explains the procedure, costs and possible risks clearly. It should also tell you what aftercare is included and who to contact if a problem develops."
      },
      {
        "kind": "paragraph",
        "text": "The price may depend on how difficult the extraction is. A simple extraction can cost less than one that needs surgical treatment, so ask for a clear estimate before agreeing."
      },
      {
        "kind": "heading",
        "text": "Final Thoughts"
      },
      {
        "kind": "paragraph",
        "text": "Tooth extraction may be the best option when a tooth is badly damaged, infected or cannot be repaired. But removing a tooth is not always necessary, so it is worth discussing possible alternatives with a dentist first."
      },
      {
        "kind": "paragraph",
        "text": "Anyone considering tooth extraction in Bradford should understand the reason for removal, the expected cost and the recovery process before making a decision. A clear consultation can help them know what to expect and how to care for the area afterwards."
      },
      {
        "kind": "heading",
        "text": "Quick FAQs"
      },
      {
        "kind": "heading",
        "text": "Can a badly decayed tooth be saved?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Majority of time a big yes. A filling, root canal treatment or crown may help, depending on the damage. The dentist will assess whether the tooth can be restored."
      },
      {
        "kind": "heading",
        "text": "How long does a tooth extraction take?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "A straightforward extraction may be quick, while a more difficult or surgical extraction can take longer. The time depends on the tooth and its position."
      },
      {
        "kind": "heading",
        "text": "Can someone eat after a tooth extraction?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Yes, but soft foods are usually more comfortable at first. Avoid very hot foods and drinks while the mouth is numb, and follow the dentist's advice."
      },
      {
        "kind": "heading",
        "text": "When should someone contact a dentist after extraction?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Contact the dentist if pain or swelling gets worse, a fever develops or bleeding does not stop. Difficulty breathing or swallowing needs emergency medical help."
      }
    ]
  },
  {
    "slug": "24-hour-emergency-dentist-bradford-when-to-call-why-it-matters-and-how-to-get-seen",
    "title": "24 Hour Emergency Dentist Bradford: When to Call, Why It Matters, and How to Get Seen",
    "date": "2026-10-14",
    "dateLabel": "October 14, 2026",
    "author": "Dr Bhojani",
    "image": {
      "src": "https://images.ctfassets.net/kygl0mrej7ni/389ErfiV07WpYO3O0BkXGU/4b8de2ebc797657c6dd0035bc08e9f49/24_hour_emergency_dentist.png",
      "alt": "//images.ctfassets.net/kygl0mrej7ni/389ErfiV07WpYO3O0BkXGU/4b8de2ebc797657c6dd0035bc08e9f49/24_hour_emergency_dentist.png"
    },
    "excerpt": "Dental problems can happen at any time and they are not always easy to manage at home. A tooth may s...",
    "blocks": [
      {
        "kind": "paragraph",
        "text": "Dental problems can happen at any time and they are not always easy to manage at home. A tooth may start hurting at night, a filling may come out, or a tooth may break while eating."
      },
      {
        "kind": "paragraph",
        "text": "In these situations, knowing when to get urgent dental help can save time. It can also stop a small dental problem from becoming worse."
      },
      {
        "kind": "paragraph",
        "text": "This guide explains when to call a 24 hour emergency dentist in Bradford, what can count as a dental emergency, and what to do before seeing a dentist.",
        "links": [
          {
            "text": "24 hour emergency dentist in Bradford",
            "href": "/services/emergency-dental"
          }
        ]
      },
      {
        "kind": "heading",
        "text": "When Is a Dental Problem an Emergency?"
      },
      {
        "kind": "paragraph",
        "text": "Not every dental problem needs emergency treatment. Some problems can wait for a normal appointment, while others need to be checked quickly."
      },
      {
        "kind": "paragraph",
        "text": "A dental emergency can include:"
      },
      {
        "kind": "list",
        "items": [
          "Strong tooth pain that does not settle",
          "A broken or badly damaged tooth",
          "A tooth that has been knocked out",
          "Swelling around the tooth, gum or face",
          "Heavy bleeding from the mouth",
          "A dental abscess",
          "A lost crown that leaves the tooth exposed",
          "Pain that makes eating or sleeping difficult"
        ]
      },
      {
        "kind": "paragraph",
        "text": "The main thing is to look at how serious the problem is. If the pain is getting worse or there is swelling, it is better to speak to a dentist instead of waiting for several days."
      },
      {
        "kind": "paragraph",
        "text": "Emergency dental services can be useful when the problem starts during the evening, night, weekend or bank holiday."
      },
      {
        "kind": "heading",
        "text": "Why Should Emergency Dental Care Be Taken Seriously?"
      },
      {
        "kind": "paragraph",
        "text": "Tooth pain can sometimes feel like a small problem, especially if it gets better for a few hours. But this does not always mean the problem has gone away."
      },
      {
        "kind": "paragraph",
        "text": "For example, an infection can continue inside the tooth even when the pain becomes less. A damaged tooth can also become more painful later if it is not checked."
      },
      {
        "kind": "paragraph",
        "text": "Getting dental care early can help the dentist find the cause of the problem. The treatment will depend on what has happened."
      },
      {
        "kind": "table",
        "header": true,
        "rows": [
          [
            "Dental problem",
            "What may happen"
          ],
          [
            "Severe toothache",
            "Dentist checks the tooth and finds the cause"
          ],
          [
            "Broken tooth",
            "Damaged part may need repair"
          ],
          [
            "Dental abscess",
            "Infection needs to be assessed"
          ],
          [
            "Lost filling",
            "Tooth may need a new filling"
          ],
          [
            "Knocked-out tooth",
            "Urgent assessment is needed"
          ]
        ]
      },
      {
        "kind": "paragraph",
        "text": "Swelling should also not be ignored. Swelling around the face or mouth can sometimes be linked with an infection and needs proper dental advice."
      },
      {
        "kind": "heading",
        "text": "When Should Someone Call an Emergency Dentist?"
      },
      {
        "kind": "paragraph",
        "text": "A person should consider calling a 24 hour emergency dentist in Bradford when the pain is severe, there is noticeable swelling, or a tooth has been badly damaged."
      },
      {
        "kind": "paragraph",
        "text": "It is also useful when the problem starts outside normal opening hours. Waiting until the next working day may not always be suitable, especially when the pain is strong."
      },
      {
        "kind": "paragraph",
        "text": "A simple way to look at it is:"
      },
      {
        "kind": "list",
        "items": [
          "Mild pain that can be managed can usually wait for a normal dental visit.",
          "Strong or increasing pain should be discussed with a dentist.",
          "Swelling, bleeding or serious damage needs quicker attention.",
          "A knocked-out tooth should be treated as urgent."
        ]
      },
      {
        "kind": "paragraph",
        "text": "A normal dental clinic appointment may be suitable for a small filling issue, mild tooth sensitivity or a routine check-up."
      },
      {
        "kind": "paragraph",
        "text": "If someone is not sure whether the problem is an emergency, they can call the dental service and explain the symptoms. The dental team can advise what to do next."
      },
      {
        "kind": "paragraph",
        "text": "If there is difficulty breathing or swallowing because of swelling, urgent medical help may be needed."
      },
      {
        "kind": "heading",
        "text": "What Can You Do Before Seeing the Dentist?"
      },
      {
        "kind": "paragraph",
        "text": "While waiting for an appointment, a few basic steps can help keep the problem under control."
      },
      {
        "kind": "paragraph",
        "text": "Try to keep the mouth clean and avoid putting pressure on a painful tooth. If there is swelling, a cold pack on the outside of the cheek may help for a short time."
      },
      {
        "kind": "paragraph",
        "text": "Do not put aspirin directly on the gum or tooth because it can irritate the tissue."
      },
      {
        "kind": "paragraph",
        "text": "If a tooth has been knocked out, do not scrub it. Handle it carefully and get urgent dental advice."
      },
      {
        "kind": "paragraph",
        "text": "It is also useful to tell the dentist what happened, when the pain started and whether there is swelling. This gives the dentist more information when checking the problem."
      },
      {
        "kind": "heading",
        "text": "Getting an Emergency Dental Appointment"
      },
      {
        "kind": "paragraph",
        "text": "When calling an emergency dentist, explain the problem clearly. The receptionist may ask about the pain, swelling, bleeding or damage to the tooth."
      },
      {
        "kind": "paragraph",
        "text": "The person may also be asked if they have had any recent dental treatment."
      },
      {
        "kind": "paragraph",
        "text": "If the problem is outside normal working hours, ask what time the dentist can see the patient and what the consultation cost will be. This is useful because emergency treatment can have different charges."
      },
      {
        "kind": "paragraph",
        "text": "If the pain is strong or the tooth has been badly damaged, explain that it is an emergency when making the booking. The dental team can then decide how quickly the person needs to be seen."
      },
      {
        "kind": "heading",
        "text": "What Happens During an Emergency Dental Visit?"
      },
      {
        "kind": "paragraph",
        "text": "The first step is usually a check of the tooth and the area around it. The dentist will ask what happened and how long the problem has been there."
      },
      {
        "kind": "paragraph",
        "text": "They may also ask about the level of pain and whether there has been any swelling or bleeding."
      },
      {
        "kind": "paragraph",
        "text": "In some cases, an X-ray may be needed to see what is happening inside the tooth. This can help the dentist decide what treatment is needed."
      },
      {
        "kind": "paragraph",
        "text": "The treatment depends on the problem. It can include a temporary filling, treatment for an infection, repair of a damaged tooth or another type of dental treatment."
      },
      {
        "kind": "paragraph",
        "text": "The main aim is to deal with the urgent problem and reduce pain where possible. Further treatment may still be needed at another appointment."
      },
      {
        "kind": "heading",
        "text": "Conclusion"
      },
      {
        "kind": "paragraph",
        "text": "Dental emergencies can happen at any time and they can be difficult to manage without proper treatment. Strong pain, swelling, bleeding and serious tooth damage should not be ignored."
      },
      {
        "kind": "paragraph",
        "text": "A 24 hour emergency dentist in Bradford can help assess the problem when urgent dental care is needed outside normal appointment times."
      },
      {
        "kind": "paragraph",
        "text": "The first step is to explain the symptoms and find out how quickly the person needs to be seen. This can help avoid unnecessary waiting and help the dentist deal with the problem properly."
      },
      {
        "kind": "heading",
        "text": "Quick FAQs"
      },
      {
        "kind": "heading",
        "text": "What counts as a dental emergency?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Severe tooth pain, facial swelling, heavy bleeding, a knocked-out tooth and serious tooth damage can be dental emergencies. If the symptoms are strong or getting worse, it is better to speak to a dentist quickly."
      },
      {
        "kind": "heading",
        "text": "Can a broken tooth be treated as an emergency?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Yes, it can be an emergency if the broken tooth is causing strong pain, bleeding or damage to the mouth. The dentist can check the tooth and decide what treatment is needed."
      },
      {
        "kind": "heading",
        "text": "Should a knocked-out tooth be seen quickly?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Yes. A knocked-out adult tooth needs urgent dental attention. Handle the tooth carefully and get dental advice as soon as possible."
      },
      {
        "kind": "heading",
        "text": "Can someone get emergency dental help at night?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Some emergency dental services provide help outside normal clinic hours. It is best to call first and explain the problem so the dental team can advise when the patient can be seen."
      },
      {
        "kind": "heading",
        "text": "What should someone do while waiting for an emergency dentist?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Keep the mouth clean and avoid putting pressure on the painful area. A cold pack can be used outside the cheek if there is swelling. The person should also follow the advice given by the dental team."
      }
    ]
  },
  {
    "slug": "botox-vs-dermal-fillers-finding-the-right-facial-aesthetics-treatment-in-bradford",
    "title": "Botox vs. Dermal Fillers: Finding the Right Facial Aesthetics Treatment in Bradford",
    "date": "2026-10-06",
    "dateLabel": "October 6, 2026",
    "author": "Dr Bhojani",
    "image": {
      "src": "https://images.ctfassets.net/kygl0mrej7ni/5ZqePTb6IRNEwuI9LxtYiH/27b946382f3c42031350a7579c2b568d/3.png",
      "alt": "//images.ctfassets.net/kygl0mrej7ni/5ZqePTb6IRNEwuI9LxtYiH/27b946382f3c42031350a7579c2b568d/3.png"
    },
    "excerpt": "Botox and dermal fillers are two common treatments used to improve the appearance of the face. But t...",
    "blocks": [
      {
        "kind": "paragraph",
        "text": "Botox and dermal fillers are two common treatments used to improve the appearance of the face. But they do different jobs, so choosing between them can be confusing, especially for someone having treatment for the first time."
      },
      {
        "kind": "paragraph",
        "text": "Botox mainly works by reducing muscle movement that causes certain lines and wrinkles. Dermal fillers are used to add volume or fullness to areas such as the lips and cheeks."
      },
      {
        "kind": "paragraph",
        "text": "For anyone considering a facial aesthetics treatment in Bradford, understanding this difference can make the consultation easier. It also helps people ask the right questions before deciding on a treatment.",
        "links": [
          {
            "text": "facial aesthetics treatment in Bradford",
            "href": "/services/aesthetics"
          }
        ]
      },
      {
        "kind": "heading",
        "text": "Botox and Dermal Fillers: What Is the Difference?"
      },
      {
        "kind": "paragraph",
        "text": "The main difference is how each treatment works."
      },
      {
        "kind": "table",
        "header": true,
        "rows": [
          [
            "Treatment",
            "Main purpose",
            "Common areas"
          ],
          [
            "Botox",
            "Reduces muscle movement",
            "Forehead and around the eyes"
          ],
          [
            "Dermal fillers",
            "Adds volume and fullness",
            "Lips, cheeks and other facial areas"
          ]
        ]
      },
      {
        "kind": "paragraph",
        "text": "Botox is often used for lines that appear because of repeated facial movements. Fillers are more focused on restoring or adding volume."
      },
      {
        "kind": "paragraph",
        "text": "Neither treatment is automatically right for everyone. The suitable option depends on the area being treated, the expected result and the person's individual needs."
      },
      {
        "kind": "heading",
        "text": "What Does Botox Do?"
      },
      {
        "kind": "paragraph",
        "text": "Botox uses botulinum toxin to temporarily reduce the movement of specific muscles. This can make some lines and wrinkles look less noticeable."
      },
      {
        "kind": "paragraph",
        "text": "It is commonly used around areas such as the forehead and the sides of the eyes. The treatment does not add volume to the face."
      },
      {
        "kind": "paragraph",
        "text": "Botulinum toxin is a prescription-only medicine in the UK. A proper consultation is needed before treatment, and the person giving the injections should be suitably trained."
      },
      {
        "kind": "paragraph",
        "text": "The results are temporary, so further treatment may be needed when the effect wears off. The practitioner should explain how long results may last and what can be expected after treatment."
      },
      {
        "kind": "heading",
        "text": "What Do Dermal Fillers Do?"
      },
      {
        "kind": "paragraph",
        "text": "Dermal fillers are used to add volume or fullness to certain parts of the face. They are commonly used around the lips and cheeks, depending on the treatment plan."
      },
      {
        "kind": "paragraph",
        "text": "Fillers can be useful when someone wants to restore lost volume or change the shape of a particular area. They work differently from Botox because they do not mainly target muscle movement."
      },
      {
        "kind": "paragraph",
        "text": "There are different types of fillers, so the product being used is important. Before treatment, the practitioner should explain which product will be used and why it is suitable."
      },
      {
        "kind": "paragraph",
        "text": "Dermal fillers can also have risks, so they should not be treated as a simple beauty treatment."
      },
      {
        "kind": "heading",
        "text": "Which Treatment Is Right for You?"
      },
      {
        "kind": "paragraph",
        "text": "There is no single treatment that suits everyone. The choice usually depends on what someone wants to change."
      },
      {
        "kind": "paragraph",
        "text": "For example, someone mainly concerned about movement-related forehead lines may discuss Botox with a qualified practitioner. Someone looking to add volume to the lips or cheeks may instead discuss dermal fillers."
      },
      {
        "kind": "paragraph",
        "text": "Sometimes a practitioner may suggest another treatment altogether. This is why a consultation is useful before making a decision."
      },
      {
        "kind": "paragraph",
        "text": "A good consultation should cover the expected result, possible risks, the product or medicine being used and aftercare. It should also give the person enough time to think before agreeing to treatment."
      },
      {
        "kind": "heading",
        "text": "What Should You Ask Before Treatment?"
      },
      {
        "kind": "paragraph",
        "text": "A consultation should not only be about the price. It is a good time to ask simple questions about the treatment and the person carrying it out."
      },
      {
        "kind": "paragraph",
        "text": "Useful questions include:"
      },
      {
        "kind": "list",
        "items": [
          "What training and experience do you have?",
          "How often do you carry out this treatment?",
          "What product will be used?",
          "What results can realistically be expected?",
          "What are the common risks?",
          "What aftercare will be needed?",
          "What happens if there is a problem?",
          "Are there any extra costs?"
        ]
      },
      {
        "kind": "paragraph",
        "text": "The NHS recommends checking the practitioner's qualifications, experience, insurance and aftercare arrangements before having a cosmetic procedure."
      },
      {
        "kind": "heading",
        "text": "Is There Any Risk With Botox or Fillers?"
      },
      {
        "kind": "paragraph",
        "text": "Yes. Botox and dermal fillers are not completely risk-free."
      },
      {
        "kind": "paragraph",
        "text": "Botox can cause problems if it is not used correctly, and rare complications can be serious. Dermal fillers can also cause complications such as infection, nerve damage and, in rare cases, serious damage involving blood vessels."
      },
      {
        "kind": "paragraph",
        "text": "This is why the person carrying out the treatment matters. The NHS recommends choosing a suitably trained and experienced practitioner and having a consultation before treatment."
      },
      {
        "kind": "paragraph",
        "text": "Anyone considering a facial aesthetics treatment in Bradford should also understand the possible risks rather than deciding only because of a low price or a special offer."
      },
      {
        "kind": "heading",
        "text": "What Should You Look for in a Bradford Clinic?"
      },
      {
        "kind": "paragraph",
        "text": "The clinic should be able to clearly explain who will carry out the treatment and what qualifications and training they have."
      },
      {
        "kind": "paragraph",
        "text": "It is also useful to check what treatment is actually being offered, which products are used and what aftercare is available."
      },
      {
        "kind": "paragraph",
        "text": "A consultation should happen before the treatment rather than simply arriving and having the procedure immediately. The practitioner should explain the process, possible risks and expected results."
      },
      {
        "kind": "paragraph",
        "text": "For people considering treatment locally, PAV Dental lists Botox and dermal fillers among its facial aesthetics services in Bradford. The clinic is located on Leeds Road in Bradford."
      },
      {
        "kind": "heading",
        "text": "What Happens After Botox or Dermal Fillers?"
      },
      {
        "kind": "paragraph",
        "text": "After treatment, the practitioner should explain what is normal and what should be reported."
      },
      {
        "kind": "paragraph",
        "text": "Some people may have temporary effects around the treated area, depending on the procedure. The exact recovery and aftercare instructions can also vary between treatments and products."
      },
      {
        "kind": "paragraph",
        "text": "It is important to follow the advice given by the practitioner rather than copying aftercare instructions from social media or another person's experience."
      },
      {
        "kind": "paragraph",
        "text": "Before treatment, people should ask how long they may need to wait before returning to normal activities and when they should contact the clinic if something does not feel right."
      },
      {
        "kind": "heading",
        "text": "Can Botox and Fillers Be Used Together?"
      },
      {
        "kind": "paragraph",
        "text": "Botox and dermal fillers can sometimes be used as part of the same overall treatment plan because they work in different ways."
      },
      {
        "kind": "paragraph",
        "text": "Botox focuses on reducing muscle movement, while fillers add volume. Because of this, a practitioner may discuss both when different facial areas need different types of treatment."
      },
      {
        "kind": "paragraph",
        "text": "This does not mean both treatments are needed. The decision should depend on the person's goals and the assessment carried out during the consultation."
      },
      {
        "kind": "paragraph",
        "text": "Anyone considering both should ask why each treatment is being suggested, what result it is expected to provide and whether having them together is suitable."
      },
      {
        "kind": "heading",
        "text": "Final Thoughts"
      },
      {
        "kind": "paragraph",
        "text": "Botox and dermal fillers may both be used to improve facial appearance, but they are not the same treatment. Botox mainly affects muscle movement, while fillers add volume."
      },
      {
        "kind": "paragraph",
        "text": "The right option depends on what someone wants to change and what a qualified practitioner considers suitable. A consultation is therefore an important step before treatment."
      },
      {
        "kind": "paragraph",
        "text": "For anyone looking for a facial aesthetics treatment in Bradford, it is worth checking the practitioner's experience, asking about risks and understanding the aftercare before making a decision."
      },
      {
        "kind": "heading",
        "text": "Quick FAQs"
      },
      {
        "kind": "heading",
        "text": "Is Botox the same as dermal filler?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "No, botox reduces muscle movement, while dermal fillers are mainly used to add volume or fullness to areas of the face."
      },
      {
        "kind": "heading",
        "text": "Which lasts longer, Botox or dermal fillers?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Both are temporary, but how long the results last can vary. The product, treatment area and individual person can all make a difference."
      },
      {
        "kind": "heading",
        "text": "Can Botox and fillers be used together?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "They can sometimes be included in the same treatment plan. A qualified practitioner should decide whether this is suitable after a consultation."
      },
      {
        "kind": "heading",
        "text": "Are Botox and dermal fillers safe?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Both treatments have possible risks. Choosing a trained practitioner and understanding the treatment before agreeing to it can help reduce avoidable problems."
      },
      {
        "kind": "heading",
        "text": "What should someone do before having treatment?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Have a consultation, check the practitioner's training and experience, ask about the product and risks, and take time to decide before agreeing."
      }
    ]
  },
  {
    "slug": "can-you-whiten-just-one-tooth-what-causes-single-tooth-discolouration",
    "title": "Can You Whiten Just One Tooth? What Causes Single-Tooth Discolouration?",
    "date": "2026-09-22",
    "dateLabel": "September 22, 2026",
    "author": "Dr Bhojani",
    "image": {
      "src": "https://images.ctfassets.net/kygl0mrej7ni/7B5rNBR6XDl71tlDnZlJdt/a20f380393e402fcbf69b0bef68c2acd/discolour_teeth.png",
      "alt": "//images.ctfassets.net/kygl0mrej7ni/7B5rNBR6XDl71tlDnZlJdt/a20f380393e402fcbf69b0bef68c2acd/discolour_teeth.png"
    },
    "excerpt": "It can be surprising when most of your teeth look fairly white but one tooth looks yellow, grey, or ...",
    "blocks": [
      {
        "kind": "paragraph",
        "text": "It can be surprising when most of your teeth look fairly white but one tooth looks yellow, grey, or darker."
      },
      {
        "kind": "paragraph",
        "text": "This can happen because of multiple reasons, some of which may only require stain removal, but a single darker tooth may also have alternative underlying causes requiring professional intervention."
      },
      {
        "kind": "paragraph",
        "text": "This is important as normal bleaching procedures will not always remove single tooth discolouration."
      },
      {
        "kind": "heading",
        "text": "Can Dentists Whiten Just One Tooth?"
      },
      {
        "kind": "paragraph",
        "text": "Yes, in some cases, a dentist can fix the cosmetic problem of one discolored tooth, but the most appropriate way of treatment depends on the reason for the changes"
      },
      {
        "kind": "paragraph",
        "text": "Therefore, if the colour change occurred on the outside of the tooth, standard teeth whitening can solve the problem. However, in case of internal damage, more complex methods should be used"
      },
      {
        "kind": "paragraph",
        "text": "This is why it is so important to consult with a dentist before deciding to lighten your teeth"
      },
      {
        "kind": "paragraph",
        "text": "In case you are looking for professional teeth whitening in Bradford, you can discuss this issue with your dentist and decide what the best option for single-tooth discoloration would be."
      },
      {
        "kind": "heading",
        "text": "What Causes Single-Tooth Discolouration?"
      },
      {
        "kind": "paragraph",
        "text": "There are a number of factors that could be the cause."
      },
      {
        "kind": "paragraph",
        "text": "Some are linked with lifestyle while others can occur as a result of trauma, decay or internal problems in the tooth."
      },
      {
        "kind": "paragraph",
        "text": "Being able to identify the cause is the first step for finding a suitable treatment."
      },
      {
        "kind": "heading",
        "text": "1. Previous Tooth Injury",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "A tooth can sometimes darken as a result of an injury."
      },
      {
        "kind": "paragraph",
        "text": "For example, you may have hit your tooth at some point, maybe as a child or in a sports accident. Even if it happened years ago, the affected tooth can suddenly start to look darker."
      },
      {
        "kind": "paragraph",
        "text": "There may have been some internal damage to the tooth structure as a result of the trauma. A dentist can assess this and decide whether it might be contributing to the change in colour."
      },
      {
        "kind": "heading",
        "text": "2. A Tooth That Has Undergone a Canal Treatment",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "A tooth that has had root canal treatment can sometimes darken over time."
      },
      {
        "kind": "paragraph",
        "text": "This is a result of the tooth no longer having the same living tissue in it as a healthy tooth"
      },
      {
        "kind": "paragraph",
        "text": "The colour change can make one tooth stand out from the others in your smile."
      },
      {
        "kind": "paragraph",
        "text": "Sometimes it can be possible to internally whiten a tooth that has had root canal treatment, and this is different to the more common external whitening of the teeth."
      },
      {
        "kind": "heading",
        "text": "3. Tooth Decay",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "A dark or discoloured tooth may indicate decay."
      },
      {
        "kind": "paragraph",
        "text": "Decay can often lead to brown; black or grey spots on the tooth and can result in tooth sensitivity and/or pain."
      },
      {
        "kind": "paragraph",
        "text": "Tooth whitening is not recommended as a method to mask decay."
      },
      {
        "kind": "paragraph",
        "text": "Decay needs to be addressed and treated before any cosmetic bleaching should be done to prevent further damage to the teeth."
      },
      {
        "kind": "heading",
        "text": "4. Staining From Food and Drinks",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Sometimes it can be much more simple than you think."
      },
      {
        "kind": "paragraph",
        "text": "Coffee, tea, red wine, curry, etc. are examples of highly pigmented beverages and foods that can cause staining. Usually they appear on several teeth, not just one."
      },
      {
        "kind": "paragraph",
        "text": "But sometimes a tooth can have more intense staining on it compared to others, as it has absorbed more of the pigment."
      },
      {
        "kind": "paragraph",
        "text": "A dentist can usually remove these kinds of staining through a professional cleaning."
      },
      {
        "kind": "heading",
        "text": "5. Dental Fillings or Other Restorations",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "A tooth may appear dark because it has an old filling or another type of restoration."
      },
      {
        "kind": "paragraph",
        "text": "This is an important point to consider since whitening products only whiten natural tooth structure. They will not whiten most existing fillings, crowns, or other types of restoration in the same way."
      },
      {
        "kind": "paragraph",
        "text": "As a result, whitening multiple teeth can sometimes cause an old restoration to stand out."
      },
      {
        "kind": "paragraph",
        "text": "Your dentist can advise you whether replacing or changing the restoration would be more appropriate."
      },
      {
        "kind": "heading",
        "text": "6. Natural Differences Between Teeth",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Not all teeth naturally have the same shade."
      },
      {
        "kind": "paragraph",
        "text": "One may be slightly darker or more yellow due to thinner enamel or the structure of the underlying enamel."
      },
      {
        "kind": "paragraph",
        "text": "This may not be abnormal."
      },
      {
        "kind": "paragraph",
        "text": "If the colour has always been slightly different and the tooth is otherwise healthy, your dentist may be able to talk to you about cosmetic options if you're interested in having them match more closely."
      },
      {
        "kind": "heading",
        "text": "7. Age-Related Changes",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Teeth often tend to darken with age."
      },
      {
        "kind": "paragraph",
        "text": "The enamel becomes thinner, allowing the darker dentine underneath to show through."
      },
      {
        "kind": "paragraph",
        "text": "If you have one tooth that is slightly a different colour to the rest, this can sometimes create a noticeable contrast."
      },
      {
        "kind": "paragraph",
        "text": "Your dentist will be able to advise you on whether normal bleaching is likely to help."
      },
      {
        "kind": "heading",
        "text": "Why Regular Whitening May Not Work On Just One Tooth"
      },
      {
        "kind": "paragraph",
        "text": "This is a very relevant question that is often overlooked."
      },
      {
        "kind": "paragraph",
        "text": "Traditional teeth whitening procedures are designed to brighten natural teeth, but they cannot effectively mask or counteract all forms of internal discoloration"
      },
      {
        "kind": "paragraph",
        "text": "Therefore, if your tooth has darkened due to trauma, root canal therapy, decay, or restoration, chances are you will be disappointed by the results of any standard whitening treatment you attempt to use on it."
      },
      {
        "kind": "paragraph",
        "text": "The treatment must take into account the reason behind the change in color of the affected tooth."
      },
      {
        "kind": "heading",
        "text": "What Can a Dentist Do About One Dark Tooth?"
      },
      {
        "kind": "paragraph",
        "text": "The treatment will depend on the findings of the examination."
      },
      {
        "kind": "paragraph",
        "text": "If there is a surface stain on the tooth then cleaning or normal whitening may help"
      },
      {
        "kind": "paragraph",
        "text": "If it is due to staining of the tooth structure, then your dentist may talk to you about other cosmetic treatments. In some cases, internal whitening may be an option for a tooth which has had root treatment and is suitable."
      },
      {
        "kind": "paragraph",
        "text": "For some teeth, a veneer or crown may be discussed if whitening is unlikely to produce the shade desired."
      },
      {
        "kind": "heading",
        "text": "Choosing the Right Whitening Treatment"
      },
      {
        "kind": "paragraph",
        "text": "There is no universal tooth whitening treatment, suitable for all types of discolouration."
      },
      {
        "kind": "paragraph",
        "text": "Professional teeth whitening in Bradford can be an effective solution where the shade alteration is appropriate for whitening, but a single darker tooth may require a more specific approach."
      },
      {
        "kind": "paragraph",
        "text": "A dental examination can help to identify whether whitening, cleaning, internal treatment or other cosmetic option would be most appropriate."
      },
      {
        "kind": "paragraph",
        "text": "You can find out more about whitening options through Pav Dental's teeth whitening service.",
        "links": [
          {
            "text": "Pav Dental's teeth whitening service",
            "href": "/services/whitening"
          }
        ]
      },
      {
        "kind": "heading",
        "text": "Final Thoughts"
      },
      {
        "kind": "paragraph",
        "text": "A discoloured tooth doesn't mean that you need more whitening."
      },
      {
        "kind": "paragraph",
        "text": "It could be a surface stain or the result of an injury, root canal treatment, a cavity, a filling, or just a genetic trait."
      },
      {
        "kind": "paragraph",
        "text": "Therefore, it's best to get it checked first before trying to change its colour."
      },
      {
        "kind": "paragraph",
        "text": "If you're looking for teeth whitening in Bradford, ask your dentist for his recommendations and what made your smile uneven so he can help you get the results you want."
      },
      {
        "kind": "heading",
        "text": "FAQs"
      },
      {
        "kind": "heading",
        "text": "Can a dentist whiten only one tooth?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Yes, just in case your teeth respond to normal whitening otherwise you may require internal whitening or a different kind of cosmetic treatment."
      },
      {
        "kind": "heading",
        "text": "Why is one tooth darker than the others?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "There could be multiple reasons like old injury, root canal treatment, decay, staining, an old filling, or a structural difference in the tooth."
      },
      {
        "kind": "heading",
        "text": "Will normal whitening work on a dark tooth?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Surfaces that have been stained often respond well to whitening, while teeth that have been damaged from within may need to be treated differently."
      },
      {
        "kind": "heading",
        "text": "Can a root-treated tooth be whitened?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Depending on the condition of the tooth, in some cases a dentist may attempt an internal bleaching to whiten a root-treated tooth."
      },
      {
        "kind": "heading",
        "text": "Should I see a dentist if one tooth suddenly changes colour?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Yes, sometimes the sudden darkening of a tooth means there is something wrong on the inside, even if there is no pain. Having the tooth examined can help find the right reason."
      }
    ]
  },
  {
    "slug": "24-hour-emergency-dentist-in-leeds-how-quickly-can-you-get-seen",
    "title": "24 Hour Emergency Dentist in Leeds: How Quickly Can You Get Seen?",
    "date": "2026-09-10",
    "dateLabel": "September 10, 2026",
    "author": "Dr Bhojani",
    "image": {
      "src": "https://images.ctfassets.net/kygl0mrej7ni/5O9q1iObkIWOW6e2gW2gOe/73bcbc7688328ee63b4fa66973d9cd97/24_hour_emergency.png",
      "alt": "//images.ctfassets.net/kygl0mrej7ni/5O9q1iObkIWOW6e2gW2gOe/73bcbc7688328ee63b4fa66973d9cd97/24_hour_emergency.png"
    },
    "excerpt": "Toothache doesn't wait for office hours. It can show up anytime then no matter if it's 2am, on a Sun...",
    "blocks": [
      {
        "kind": "paragraph",
        "text": "Toothache doesn't wait for office hours. It can show up anytime then no matter if it's 2am, on a Sunday, or right before a holiday. In this, if you're searching for a 24 hour emergency dentist in Leeds, the honest answer is: it depends on what's wrong and where you're calling. This guide breaks down how fast you can actually get seen, what it costs, and what to do while you wait."
      },
      {
        "kind": "heading",
        "text": "What Counts as a Real Emergency"
      },
      {
        "kind": "paragraph",
        "text": "Dentists don't treat every bad toothache the same way. Some things need attention right now. Others can wait until Monday."
      },
      {
        "kind": "paragraph",
        "text": "Go straight to A&E or call 999 if:"
      },
      {
        "kind": "list",
        "items": [
          "Your face or neck is swelling and it's getting hard to breathe or swallow",
          "Bleeding won't stop after 20 minutes of firm pressure",
          "A tooth has been knocked out completely"
        ]
      },
      {
        "kind": "paragraph",
        "text": "Book a same day emergency slot for:"
      },
      {
        "kind": "list",
        "items": [
          "A tooth abscess with visible facial swelling",
          "Pain that ibuprofen and paracetamol aren't touching",
          "A broken tooth with a sharp edge cutting your tongue or cheek",
          "A crown that's fallen off and left a nerve exposed"
        ]
      },
      {
        "kind": "paragraph",
        "text": "Things that can usually wait a day or two:"
      },
      {
        "kind": "list",
        "items": [
          "A lost filling that isn't painful",
          "A chipped tooth that looks bad but doesn't hurt",
          "Mild, manageable toothache"
        ]
      },
      {
        "kind": "paragraph",
        "text": "Knowing which category you're in saves both time and money. A lot of what feels urgent at 11pm on a Saturday is genuinely fine to sort on Monday morning with the right painkillers in the meantime."
      },
      {
        "kind": "heading",
        "text": "How Fast Can You Actually Get Seen in Leeds"
      },
      {
        "kind": "paragraph",
        "text": "Leeds has a decent spread of options, but speed depends heavily on timing and location."
      },
      {
        "kind": "paragraph",
        "text": "During weekday daytime hours, city centre practices often hold back a handful of emergency slots, usually given out first come, first served from around 8am. Get in early and you could be seen within a couple of hours. Wait until the afternoon and those slots are often gone."
      },
      {
        "kind": "paragraph",
        "text": "Evenings and weekends are trickier. Fewer practices run a proper dentist emergency 24 hours service, and NHS 111's dental referral line can end up routing you somewhere outside Leeds entirely if local surgeries are full. That means a longer wait and sometimes a longer drive."
      },
      {
        "kind": "paragraph",
        "text": "Clinics that specifically advertise 24 hour emergency dentist service tend to be the most reliable bet outside normal hours. They're built around walk-ins and same day bookings rather than a pre-filled diary, so your actual wait is often closer to an hour than a full day."
      },
      {
        "kind": "heading",
        "text": "What It's Going to Cost"
      },
      {
        "kind": "paragraph",
        "text": "Prices vary more than people expect. As a rough guide across Leeds:"
      },
      {
        "kind": "list",
        "items": [
          "Weekday emergency consultation: £60 to £120",
          "Weekend or out of hours consultation: £150 to £250, sometimes with an extra out of hours fee on top",
          "X-rays: usually £20 to £50 extra",
          "Simple extraction: £100 to £200",
          "Emergency filling: £80 to £180"
        ]
      },
      {
        "kind": "paragraph",
        "text": "So a fairly ordinary emergency, say an infected tooth needing an X-ray and extraction, can land anywhere between £250 and £500 depending purely on when you turn up. Weekday mornings are almost always the cheapest window."
      },
      {
        "kind": "heading",
        "text": "What to Do Before You're Seen"
      },
      {
        "kind": "paragraph",
        "text": "While you're working out where to go, a few things genuinely help."
      },
      {
        "kind": "paragraph",
        "text": "Taking 400mg of ibuprofen together with 1000mg of paracetamol tends to work better than either on its own, since they act on the pain in different ways. Take them with a bit of food so the ibuprofen doesn't upset your stomach."
      },
      {
        "kind": "paragraph",
        "text": "If there's swelling, a cold compress against the cheek, twenty minutes on and twenty off, helps more than most people expect. Skip the heat. Heat on an infection tends to make it worse, not better."
      },
      {
        "kind": "paragraph",
        "text": "If a tooth has come out whole, don't scrub it. Rinse it gently and try to pop it back in the socket. If that's not possible, drop it in a cup of milk rather than water and get to a dentist within the hour. Time really does matter here."
      },
      {
        "kind": "heading",
        "text": "If You're Checking Options Across West Yorkshire"
      },
      {
        "kind": "paragraph",
        "text": "Leeds isn't the only place people search for out of hours help. Plenty of readers comparing prices and wait times also look at night and day emergency dentist in Bradford options, since the two cities aren't far apart and Bradford clinics sometimes have shorter queues. If you're weighing up urgent dental care in Bradford against staying local, it's worth calling both and comparing whoever can see you soon rather than assuming Leeds will always be faster.",
        "links": [
          {
            "text": "night and day emergency dentist in Bradford",
            "href": "/services/emergency-dental"
          },
          {
            "text": "urgent dental care in Bradford",
            "href": "/services/emergency-dental"
          }
        ]
      },
      {
        "kind": "heading",
        "text": "Getting Seen Without the Guesswork"
      },
      {
        "kind": "paragraph",
        "text": "If you'd rather skip the calling around, Pav Dental runs a professional 24 hour emergency dentist service, which means you're not stuck waiting for a callback or hoping 111 finds you a slot somewhere nearby. Their emergency dental service is built for exactly this situation: pain that can't wait, at whatever hour it happens to strike. Being genuinely dental 24/7, rather than \"emergency line, appointment tomorrow,\" is the bit that actually matters when you're in pain right now.",
        "links": [
          {
            "text": "emergency dental service",
            "href": "/services/emergency-dental"
          }
        ]
      },
      {
        "kind": "paragraph",
        "text": "Before calling anyone, have your medical history ready (any conditions, medications, allergies), a rough idea of when the pain started, and how you're planning to pay, since most emergency appointments are settled on the day."
      },
      {
        "kind": "heading",
        "text": "Final Verdict"
      },
      {
        "kind": "paragraph",
        "text": "If it's affecting your breathing or swallowing, go to A&E, full stop. For everything else, painkillers and a cold compress buy you time to get to whoever can see you fastest, whether that's a Leeds practice with an early morning slot or a dentist emergency 24 hours service that doesn't make you wait until the sun comes up."
      },
      {
        "kind": "heading",
        "text": "FAQs"
      },
      {
        "kind": "heading",
        "text": "How quickly can you get seen?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Often within a couple of hours on a weekday morning. Evenings and weekends usually take longer unless you call a dentist emergency 24 hours service."
      },
      {
        "kind": "heading",
        "text": "Is it more expensive out of hours?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Yes, weekend visits can cost £150 to £250 versus £60 to £120 on a weekday."
      },
      {
        "kind": "heading",
        "text": "What can you do while you wait?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Take 400mg ibuprofen with 1000mg paracetamol, and use a cold compress if there's swelling."
      },
      {
        "kind": "heading",
        "text": "Should you go to A&E instead?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Only for breathing problems, swallowing difficulty, or bleeding that won't stop. Otherwise, see a dentist."
      },
      {
        "kind": "heading",
        "text": "Do all dentists offer 24/7 emergency care?",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "No, most only work normal hours. Genuine dental 24/7 clinics are worth saving in advance."
      }
    ]
  }
];

export function findBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
