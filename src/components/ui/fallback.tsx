import { Inbox } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Inbox className="w-10 h-10 mb-2" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}
