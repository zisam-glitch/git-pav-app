import { Baby, Dumbbell, Shield, Swords, Trophy, User, Zap } from "lucide-react";
import { BookButton } from "@/components/hims";
import { BenefitCards, type BenefitItem } from "@/components/hims/benefit-cards";

const USER_TYPES: readonly BenefitItem[] = [
  {
    title: "Anyone needing extra protection",
    body: "Ideal for anyone who grinds teeth, plays sports, or needs added oral safety.",
    icon: Shield,
  },
  {
    title: "Adults",
    body: "For everyday protection against grinding, clenching, or accidental impact.",
    icon: User,
  },
  {
    title: "Children",
    body: "Keeps growing teeth safe during play, sports, and daily activities.",
    icon: Baby,
  },
  {
    title: "Athletes",
    body: "Provides strong impact protection during training and competitive sports.",
    icon: Dumbbell,
  },
  {
    title: "Boxers",
    body: "Minimizes jaw impact and prevents oral injuries during intense boxing sessions.",
    icon: Swords,
  },
  {
    title: "Rugby players",
    body: "Shields teeth and gums during high-contact tackles and scrums.",
    icon: Trophy,
  },
  {
    title: "Hockey players",
    body: "Protects against sticks, pucks, and high-speed on-ice collisions.",
    icon: Zap,
  },
];

export function MouthguardsUsers() {
  return (
    <BenefitCards
      theme="white"
      title="Who Can Use"
      accent="Our Mouthguards"
      action={<BookButton>Make an Appointment</BookButton>}
      items={USER_TYPES}
      columns={4}
    />
  );
}
