/**
 * A message thread can be read (R4).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { threadMessages, unreadThreadCount } from "../features/messages/thread";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n💬 MESSAGE THREAD (R4)\n");

const msgs = threadMessages({
  messages: [
    { id: "2", senderRole: "clinician", senderName: "Dr Example", body: "Hello", sentAtIso: "2026-11-10T10:05:00Z" },
    { id: "1", senderRole: "patient", senderName: "Pat", body: "My tooth hurts", sentAtIso: "2026-11-10T10:00:00Z" },
  ],
});
assert(msgs.length === 2 && msgs[0].id === "1", "Messages are listed oldest first");
assert(msgs[0].mine && msgs[0].sender === "You", "The patient's own messages are theirs");
assert(!msgs[1].mine && msgs[1].sender === "Dr Example", "Replies show who wrote them");
assert(threadMessages(undefined).length === 0 && threadMessages({}).length === 0, "A missing thread has no messages");

const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");
const screen = read("app/(patient)/message-thread.tsx");
const tab = read("app/(patient)/(tabs)/messages.tsx");

assert(screen.includes("multiline"), "The reply box can hold more than one line");
assert(/setToast\(\{[^}]*tone:\s*"error"/.test(screen) && !/setToast\(\{[^}]*tone:\s*"success"/.test(screen), "A failed send is shown as an error, not a success");
assert(screen.includes("markRead.mutate"), "Opening a thread marks it read");
assert(tab.includes("/(patient)/message-thread"), "Tapping a thread opens the conversation");
assert(!tab.includes("Write a reply"), "The tab no longer has its own one-line reply box");

assert(unreadThreadCount([{ isRead: false }, { isRead: true }, { isRead: false }]) === 2, "The unread count counts conversations with something new");
assert(unreadThreadCount(undefined) === 0 && unreadThreadCount([{}]) === 0, "No data means no badge");
assert(read("app/(patient)/(tabs)/_layout.tsx").includes("tabBarBadge"), "The Messages tab shows the unread count");

// Photos in messages (V53)
const withPhotos = threadMessages({ messages: [{ id: "p1", senderRole: "patient", body: "", sentAtIso: "2026-11-10T10:00:00Z", attachments: [{ url: "https://x/y.jpg" }, { nope: 1 }, { url: 5 }] }, { id: "p2", senderRole: "clinician", body: "ok", sentAtIso: "2026-11-10T10:01:00Z" }] });
assert(withPhotos[0].photos.length === 1 && withPhotos[0].photos[0] === "https://x/y.jpg", "A message's photo links are read, and malformed ones are ignored");
assert(withPhotos[1].photos.length === 0, "A message with no photos has none");
assert(screen.includes("uploadMessagePhoto") && screen.includes("Add a photo"), "The patient can add a photo to a reply");
assert(readFileSync(join(__dirname, "../app/(clinician)/inbox.tsx"), "utf8").includes("Photo from the patient"), "The dentist sees the photos a patient sent");

console.log("\n🎉 ALL MESSAGE THREAD TESTS PASSED!\n");
