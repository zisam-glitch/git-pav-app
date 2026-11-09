import { PRACTICE_CONFIG } from "../../config/practice";

export interface HelpAction {
  id: "call" | "email" | "urgent" | "emergency";
  title: string;
  detail: string;
  url: string;
}

/**
 * Every way to reach the practice, built from the one practice config so the
 * number a patient sees is the number that is dialled.
 */
export function helpActions(hoursText: string): HelpAction[] {
  return [
    {
      id: "call",
      title: `Call the practice: ${PRACTICE_CONFIG.phone}`,
      detail: hoursText,
      url: PRACTICE_CONFIG.telUrl,
    },
    {
      id: "email",
      title: "Email us",
      detail: PRACTICE_CONFIG.email,
      url: `mailto:${PRACTICE_CONFIG.email}`,
    },
    {
      id: "urgent",
      title: "Need urgent advice when we are closed? Call 111",
      detail: "NHS 111 can advise on urgent dental problems.",
      url: PRACTICE_CONFIG.urgentTel,
    },
    {
      id: "emergency",
      title: "Medical emergency? Call 999",
      detail: "Severe bleeding, swelling that affects your breathing or swallowing, or a head injury.",
      url: PRACTICE_CONFIG.emergencyTel,
    },
  ];
}

export const IF_THE_APP_FAILS =
  "If the app is not working, call us. We can book, move or cancel a visit by phone, and your visit goes ahead as planned.";
