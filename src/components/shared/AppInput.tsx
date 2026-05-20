"use client"

import { ComponentProps } from "react"
import { Input } from "../ui/input"

interface AppInputProps extends ComponentProps<"input"> {
    label?: string
    className?: string
    inputClassName?: string
    labelClassName?: string
    labelCharacter?: string
    labelCharacterClassName?: string
}

export function AppInput({
    label,
    className,
    inputClassName,
    labelClassName,
    labelCharacter,
    labelCharacterClassName,
    onChange,
    ...props
}: AppInputProps) {
    return (
        <div className={`flex flex-col gap-1 ${className ?? ""}`}>
            {label && (
                <span className={`text-sm font-medium text-gray-700 ${labelClassName ?? ""}`}>
                    {label}
                </span>
            )}

            <div className="relative">
                {labelCharacter ? (
                    <span
                        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray ${labelCharacterClassName ?? ""}`}
                    >
                        {labelCharacter}
                    </span>
                ) : null}

                <Input
                    className={`w-full border border-gray rounded-md px-3 py-2 text-sm ${labelCharacter ? "pl-8" : ""} ${inputClassName ?? ""}`}
                    onChange={onChange}
                    {...props}
                />
            </div>
        </div>
    )
}
