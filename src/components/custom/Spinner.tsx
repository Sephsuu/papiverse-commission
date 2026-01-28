import { LoaderCircle } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle className={`h-8 w-8 animate-spin ${className}`} />
  );
}
