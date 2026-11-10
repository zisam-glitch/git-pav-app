// A video visit has one conversation, reachable from the waiting room and the appointment screen (V48).
import { readFileSync } from "fs";
import { join } from "path";

const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");
let failed = 0;
const check = (name: string, ok: boolean) => {
  if (ok) console.log(`✓ PASSED: ${name}`);
  else {
    failed++;
    console.error(`✗ FAILED: ${name}`);
  }
};

const screen = read("app/(patient)/video/message.tsx");
check("the message screen looks up the visit's conversation", screen.includes("/api/appointment-messages/"));
check("it opens an existing conversation instead of starting another", screen.includes("openThread(data.threadId)"));
check("a failed send is shown as an error", screen.includes('tone="error"'));
check("the box grows and is limited to 4,000 characters", screen.includes("multiline") && screen.includes("maxLength={4000}"));
check("the screen is registered in the video stack", read("app/(patient)/video/_layout.tsx").includes('name="message"'));
check("the waiting room links to it", read("app/(patient)/video/waiting.tsx").includes("/(patient)/video/message"));
check("the appointment screen links to it", read("app/(patient)/appointments/[id].tsx").includes("/(patient)/video/message"));
check("the pre-call check no longer points at the Messages tab", !read("app/(patient)/video/device-check.tsx").includes("Messages tab"));

if (failed > 0) process.exit(1);
console.log("APPOINTMENT CONVERSATION TESTS PASSED");
