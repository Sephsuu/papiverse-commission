import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function AppAvatar({ src, alt, className, fallback, fallbackClassName }: {
    src?: string;
    alt?: string;
    className?: string;
    fallback?: string;
    fallbackClassName?: string;
}) {
    return (
        <Avatar className={`${className}`}>
            <AvatarImage
                src={ src }
                alt={ alt }
            />
            <AvatarFallback className={`${fallbackClassName ?? "bg-darkbrown text-slate-50"}`}>{ fallback ?? 'KP' }</AvatarFallback>
        </Avatar>
    )
} 