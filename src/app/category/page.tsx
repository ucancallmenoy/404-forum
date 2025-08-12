import { Suspense } from "react";
import CategoryPage from "@/view/category";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryPage />
    </Suspense>
  );
}