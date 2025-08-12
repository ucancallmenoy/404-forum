import { Suspense } from "react";
import PostPage from "@/view/topic";

export default function TopicPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostPage />
    </Suspense>
  );
}