import { redirect } from "next/navigation";

import { signedInStaff } from "@/lib/auth/staff.server";
import { listShopperAccounts } from "@/lib/users.server";

import { transformDbUsers } from "./_components/data";
import { Users } from "./_components/users";

async function getUsers() {
  try {
    return transformDbUsers(await listShopperAccounts());
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function Page() {
  if (!(await signedInStaff())) redirect("/auth/v1/login");
  const users = await getUsers();
  return <Users users={users} />;
}
