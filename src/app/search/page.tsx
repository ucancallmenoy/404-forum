import { Suspense } from "react";
import SearchPage from "@/view/search";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
}