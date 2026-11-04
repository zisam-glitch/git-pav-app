import React from "react";
import { StyleProp, ViewStyle, TextStyle, View } from "react-native";
import type { Icon as IconsaxIcon } from "iconsax-react-native";
import { colors } from "@/theme";

// ─── Semantic icon mapping ────────────────────────────────────────────────────
// Every icon is Iconsax, drawn in the Linear style to match Wise's thin line
// icons. Screens keep using the semantic names; the glyph source lives only
// here. Iconsax has no tooth, pill or plain ✕/✓, so those meanings map to the
// nearest clear glyph (see the comments) and close is "Add" turned 45°.

// One require per glyph: the package index loads all ~1,000 icons, and Metro
// doesn't tree-shake, so importing from it would bundle every one.
/* eslint-disable @typescript-eslint/no-var-requires */
const ICONS = {
  ChemicalGlass: require("iconsax-react-native/dist/cjs/ChemicalGlass.js"),
  Hospital: require("iconsax-react-native/dist/cjs/Hospital.js"),
  Add: require("iconsax-react-native/dist/cjs/Add.js"),
  ArrowDown: require("iconsax-react-native/dist/cjs/ArrowDown.js"),
  ArrowLeft: require("iconsax-react-native/dist/cjs/ArrowLeft.js"),
  ArrowLeft2: require("iconsax-react-native/dist/cjs/ArrowLeft2.js"),
  ArrowRight: require("iconsax-react-native/dist/cjs/ArrowRight.js"),
  ArrowRight2: require("iconsax-react-native/dist/cjs/ArrowRight2.js"),
  ArrowRotateLeft: require("iconsax-react-native/dist/cjs/ArrowRotateLeft.js"),
  TickSquare: require("iconsax-react-native/dist/cjs/TickSquare.js"),
  ArrowUp: require("iconsax-react-native/dist/cjs/ArrowUp.js"),
  Box: require("iconsax-react-native/dist/cjs/Box.js"),
  Brodcast: require("iconsax-react-native/dist/cjs/Brodcast.js"),
  Calendar: require("iconsax-react-native/dist/cjs/Calendar.js"),
  CalendarTick: require("iconsax-react-native/dist/cjs/CalendarTick.js"),
  Call: require("iconsax-react-native/dist/cjs/Call.js"),
  CallCalling: require("iconsax-react-native/dist/cjs/CallCalling.js"),
  CallSlash: require("iconsax-react-native/dist/cjs/CallSlash.js"),
  Camera: require("iconsax-react-native/dist/cjs/Camera.js"),
  Card: require("iconsax-react-native/dist/cjs/Card.js"),
  Category: require("iconsax-react-native/dist/cjs/Category.js"),
  ClipboardText: require("iconsax-react-native/dist/cjs/ClipboardText.js"),
  Clock: require("iconsax-react-native/dist/cjs/Clock.js"),
  CloudCross: require("iconsax-react-native/dist/cjs/CloudCross.js"),
  Copy: require("iconsax-react-native/dist/cjs/Copy.js"),
  Danger: require("iconsax-react-native/dist/cjs/Danger.js"),
  Discover: require("iconsax-react-native/dist/cjs/Discover.js"),
  DocumentDownload: require("iconsax-react-native/dist/cjs/DocumentDownload.js"),
  DocumentText1: require("iconsax-react-native/dist/cjs/DocumentText1.js"),
  Flag2: require("iconsax-react-native/dist/cjs/Flag2.js"),
  DocumentUpload: require("iconsax-react-native/dist/cjs/DocumentUpload.js"),
  Edit2: require("iconsax-react-native/dist/cjs/Edit2.js"),
  EmojiHappy: require("iconsax-react-native/dist/cjs/EmojiHappy.js"),
  ExportSquare: require("iconsax-react-native/dist/cjs/ExportSquare.js"),
  Eye: require("iconsax-react-native/dist/cjs/Eye.js"),
  EyeSlash: require("iconsax-react-native/dist/cjs/EyeSlash.js"),
  Filter: require("iconsax-react-native/dist/cjs/Filter.js"),
  Flash: require("iconsax-react-native/dist/cjs/Flash.js"),
  Folder: require("iconsax-react-native/dist/cjs/Folder.js"),
  Gallery: require("iconsax-react-native/dist/cjs/Gallery.js"),
  Gift: require("iconsax-react-native/dist/cjs/Gift.js"),
  Global: require("iconsax-react-native/dist/cjs/Global.js"),
  Health: require("iconsax-react-native/dist/cjs/Health.js"),
  Heart: require("iconsax-react-native/dist/cjs/Heart.js"),
  Home2: require("iconsax-react-native/dist/cjs/Home2.js"),
  InfoCircle: require("iconsax-react-native/dist/cjs/InfoCircle.js"),
  Key: require("iconsax-react-native/dist/cjs/Key.js"),
  Link: require("iconsax-react-native/dist/cjs/Link.js"),
  Location: require("iconsax-react-native/dist/cjs/Location.js"),
  Lock: require("iconsax-react-native/dist/cjs/Lock.js"),
  Logout: require("iconsax-react-native/dist/cjs/Logout.js"),
  MagicStar: require("iconsax-react-native/dist/cjs/MagicStar.js"),
  Map1: require("iconsax-react-native/dist/cjs/Map1.js"),
  Message: require("iconsax-react-native/dist/cjs/Message.js"),
  MessageQuestion: require("iconsax-react-native/dist/cjs/MessageQuestion.js"),
  Microphone2: require("iconsax-react-native/dist/cjs/Microphone2.js"),
  MicrophoneSlash: require("iconsax-react-native/dist/cjs/MicrophoneSlash.js"),
  Minus: require("iconsax-react-native/dist/cjs/Minus.js"),
  Mobile: require("iconsax-react-native/dist/cjs/Mobile.js"),
  Moon: require("iconsax-react-native/dist/cjs/Moon.js"),
  More: require("iconsax-react-native/dist/cjs/More.js"),
  NoteText: require("iconsax-react-native/dist/cjs/NoteText.js"),
  Notification: require("iconsax-react-native/dist/cjs/Notification.js"),
  Personalcard: require("iconsax-react-native/dist/cjs/Personalcard.js"),
  Profile2User: require("iconsax-react-native/dist/cjs/Profile2User.js"),
  Receipt2: require("iconsax-react-native/dist/cjs/Receipt2.js"),
  Refresh: require("iconsax-react-native/dist/cjs/Refresh.js"),
  RowVertical: require("iconsax-react-native/dist/cjs/RowVertical.js"),
  SearchNormal1: require("iconsax-react-native/dist/cjs/SearchNormal1.js"),
  Setting2: require("iconsax-react-native/dist/cjs/Setting2.js"),
  Shield: require("iconsax-react-native/dist/cjs/Shield.js"),
  ShieldTick: require("iconsax-react-native/dist/cjs/ShieldTick.js"),
  Sms: require("iconsax-react-native/dist/cjs/Sms.js"),
  Star1: require("iconsax-react-native/dist/cjs/Star1.js"),
  Sun1: require("iconsax-react-native/dist/cjs/Sun1.js"),
  Tag: require("iconsax-react-native/dist/cjs/Tag.js"),
  TickCircle: require("iconsax-react-native/dist/cjs/TickCircle.js"),
  Trash: require("iconsax-react-native/dist/cjs/Trash.js"),
  Truck: require("iconsax-react-native/dist/cjs/Truck.js"),
  User: require("iconsax-react-native/dist/cjs/User.js"),
  UserAdd: require("iconsax-react-native/dist/cjs/UserAdd.js"),
  UserTick: require("iconsax-react-native/dist/cjs/UserTick.js"),
  Video: require("iconsax-react-native/dist/cjs/Video.js"),
  VideoSlash: require("iconsax-react-native/dist/cjs/VideoSlash.js"),
  Wifi: require("iconsax-react-native/dist/cjs/Wifi.js"),
} as const satisfies Record<string, IconsaxIcon>;
/* eslint-enable @typescript-eslint/no-var-requires */

type IconsaxName = keyof typeof ICONS;
type Glyph = { icon: IconsaxName; rotate?: number };

const GLYPHS = {
  // Tab bar and navigation
  home: { icon: "Home2" },
  calendar: { icon: "Calendar" },
  calendarCheck: { icon: "CalendarTick" },
  records: { icon: "Folder" },
  profile: { icon: "User" },
  message: { icon: "Message" },
  settings: { icon: "Setting2" },
  search: { icon: "SearchNormal1" },
  chevronRight: { icon: "ArrowRight2" },
  chevronLeft: { icon: "ArrowLeft2" },
  arrowUp: { icon: "ArrowUp" },
  arrowDown: { icon: "ArrowDown" },
  arrowRight: { icon: "ArrowRight" },
  arrowLeft: { icon: "ArrowLeft" },
  externalLink: { icon: "ExportSquare" },
  more: { icon: "More" },
  // Actions
  close: { icon: "Add", rotate: 45 },
  plus: { icon: "Add" },
  minus: { icon: "Minus" },
  check: { icon: "TickCircle" },
  checkCircle: { icon: "TickCircle" },
  checkbox: { icon: "TickSquare" },
  refresh: { icon: "Refresh" },
  trash: { icon: "Trash" },
  logOut: { icon: "Logout" },
  edit: { icon: "Edit2" },
  copy: { icon: "Copy" },
  download: { icon: "DocumentDownload" },
  upload: { icon: "DocumentUpload" },
  link: { icon: "Link" },
  filter: { icon: "Filter" },
  list: { icon: "RowVertical" },
  grid: { icon: "Category" },
  eye: { icon: "Eye" },
  eyeOff: { icon: "EyeSlash" },
  history: { icon: "ArrowRotateLeft" },
  // Status
  alert: { icon: "Danger" },
  // Iconsax's info glyphs are a "!" (reads as a warning); turned, it is an "i".
  info: { icon: "InfoCircle", rotate: 180 },
  help: { icon: "MessageQuestion" },
  clock: { icon: "Clock" },
  bell: { icon: "Notification" },
  bellOff: { icon: "Notification" },
  wifi: { icon: "Wifi" },
  // Iconsax has no crossed-out Wi-Fi; a crossed cloud is its "no connection".
  wifiOff: { icon: "CloudCross" },
  // Places and travel
  mapPin: { icon: "Location" },
  navigation: { icon: "Map1" },
  Compass: { icon: "Discover" },
  compass: { icon: "Discover" },
  anchor: { icon: "Location" },
  truck: { icon: "Truck" },
  globe: { icon: "Global" },
  // Security and account
  shield: { icon: "Shield" },
  shieldCheck: { icon: "ShieldTick" },
  lock: { icon: "Lock" },
  key: { icon: "Key" },
  smartphone: { icon: "Mobile" },
  users: { icon: "Profile2User" },
  userPlus: { icon: "UserAdd" },
  userCheck: { icon: "UserTick" },
  badge: { icon: "Personalcard" },
  // Money and documents
  creditCard: { icon: "Card" },
  receipt: { icon: "Receipt2" },
  tag: { icon: "Tag" },
  gift: { icon: "Gift" },
  // DocumentText's lines sit low and read as a face at 18–24pt.
  fileText: { icon: "DocumentText1" },
  clipboard: { icon: "ClipboardText" },
  notes: { icon: "NoteText" },
  package: { icon: "Box" },
  mail: { icon: "Sms" },
  campaign: { icon: "Brodcast" },
  flag: { icon: "Flag2" },
  // Calls and media
  phone: { icon: "Call" },
  phoneCall: { icon: "CallCalling" },
  phoneOff: { icon: "CallSlash" },
  video: { icon: "Video" },
  videoOff: { icon: "VideoSlash" },
  mic: { icon: "Microphone2" },
  micOff: { icon: "MicrophoneSlash" },
  camera: { icon: "Camera" },
  image: { icon: "Gallery" },
  sun: { icon: "Sun1" },
  moon: { icon: "Moon" },
  // Care. Iconsax has no tooth or pill. PLACEHOLDERS until the custom tooth
  // and pill icons arrive: replace these two entries (and their requires).
  tooth: { icon: "Hospital" },
  stethoscope: { icon: "Health" },
  syringe: { icon: "Health" },
  activity: { icon: "Health" },
  pill: { icon: "ChemicalGlass" },
  droplet: { icon: "ChemicalGlass" },
  heart: { icon: "Heart" },
  zap: { icon: "Flash" },
  smile: { icon: "EmojiHappy" },
  star: { icon: "Star1" },
  sparkle: { icon: "MagicStar" },
  sparkles: { icon: "MagicStar" },
} as const satisfies Record<string, Glyph>;

export type AppIconName = keyof typeof GLYPHS;
export type AppIconVariant = "Linear" | "Bold";

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  /** Linear everywhere; Bold only for the active tab. */
  variant?: AppIconVariant;
  style?: StyleProp<ViewStyle | TextStyle>;
}

/**
 * AppIcon — semantic icon primitive. Renders the Iconsax glyph for a
 * semantic name; unknown names fall back to the alert glyph.
 */
export function AppIcon({
  name,
  size = 20,
  color = colors.label,
  variant = "Linear",
  style,
}: AppIconProps) {
  const glyph: Glyph = GLYPHS[name] ?? GLYPHS.alert;
  const Icon: IconsaxIcon = ICONS[glyph.icon];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        glyph.rotate ? { transform: [{ rotate: `${glyph.rotate}deg` }] } : null,
        style as StyleProp<ViewStyle>,
      ]}
      // Icons are decorative; the control around them carries the label.
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Icon size={size} color={color} variant={variant} />
    </View>
  );
}
