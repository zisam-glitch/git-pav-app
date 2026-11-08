import { memo, useMemo } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { illustrationColors } from "@/theme";

// ─── Spot illustrations ───────────────────────────────────────────────────────
// Streamline "New York" art from the Pav Dental Figma file, recoloured to the
// app palette by scripts/build-illustrations.mjs, plus two drawn to match
// (conversation, video-call). Screens pick one by meaning, never by file.
//
// One require per piece, read only when first drawn: Metro doesn't tree-shake,
// and each piece is 25–70 KB of path data.
/* eslint-disable @typescript-eslint/no-var-requires */
const ART = {
  bookingConfirmed: () => require("./art/being-creative").default,
  accountCreated: () => require("./art/business-card").default,
  appointments: () => require("./art/business-trip").default,
  messages: () => require("./art/conversation").default,
  video: () => require("./art/video-call").default,
  documents: () => require("./art/data-cloud").default,
  writing: () => require("./art/code-learning").default,
  plans: () => require("./art/solutions").default,
  payments: () => require("./art/ab-testing").default,
  family: () => require("./art/beta-testing").default,
  schedule: () => require("./art/designing-website").default,
  notFound: () => require("./art/asking").default,
  error: () => require("./art/bugs").default,
  offline: () => require("./art/designer-desk").default,
} satisfies Record<string, () => string>;
/* eslint-enable @typescript-eslint/no-var-requires */

export type IllustrationName = keyof typeof ART;

const cache = new Map<IllustrationName, string>();

/** The art with palette tokens filled in. Exported for tests. */
export function illustrationXml(name: IllustrationName): string {
  const cached = cache.get(name);
  if (cached) return cached;
  const raw: string = ART[name]();
  const xml = raw.replace(/\{(\w+)\}/g, (token: string, key: string) => {
    const colour: string | undefined = illustrationColors[key as keyof typeof illustrationColors];
    if (!colour) throw new Error(`Illustration "${name}" uses unknown colour token ${token}`);
    return colour;
  });
  cache.set(name, xml);
  return xml;
}

export const ILLUSTRATION_NAMES = Object.keys(ART) as IllustrationName[];

interface IllustrationProps {
  name: IllustrationName;
  /** Width and height in points. Default 180. */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Decorative: hidden from screen readers, so the heading beside it carries the meaning. */
export const Illustration = memo(function Illustration({ name, size = 180, style }: IllustrationProps) {
  const xml = useMemo(() => illustrationXml(name), [name]);
  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
});
