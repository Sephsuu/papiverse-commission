import { Ham, PackageX, Snowflake } from "lucide-react";

export function getCategoryIcon(category: string) {
    if (category === "MEAT") return <Ham className="w-4 h-4 text-darkbrown" />;
    if (category === "SNOWFROST") return <Snowflake className="w-4 h-4 text-blue" />;
    return <PackageX className="w-4 h-4 text-slate-400" />;
}