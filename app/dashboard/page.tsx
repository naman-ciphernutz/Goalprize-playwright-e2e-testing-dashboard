import { redirect } from "next/navigation";

/** Legacy path — send users to the main console. */
export default function DashboardRedirect() {
  redirect("/");
}
