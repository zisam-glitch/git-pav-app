/**
 * The bell opens notifications, (the Messages tab badge already exists) (R6).
 */

import { readFileSync } from "fs";
import { join } from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🔔 BELL AND UNREAD (R6)\n");




const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");
assert(read("app/(patient)/(tabs)/home.tsx").includes('router.push("/(patient)/notifications"'), "The Home bell opens the notifications list");


console.log("\n🎉 ALL BELL AND UNREAD TESTS PASSED!\n");
