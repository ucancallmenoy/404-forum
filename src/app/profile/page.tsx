import { Suspense } from "react";
import ProfilePage from "@/view/profile";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePage />
    </Suspense>
  );
}