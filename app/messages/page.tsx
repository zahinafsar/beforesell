import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import MessagesList from "@/components/messages-list";

function MessagesLoading() {
  return (
    <div className="container py-8 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesList />
    </Suspense>
  );
}
