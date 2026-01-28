"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface GenericSelectProps {
  label?: string
  groupLabel?: string
  placeholder?: string
  items: string[] | { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
  className?: string
  hideIcon?: boolean;
}

export function AppSelect({
    label,
    groupLabel,
    placeholder = "Select an option",
    items,
    value,
    onChange,
    className,
    hideIcon = false,
}: GenericSelectProps) {
  return (
        <div className={`flex flex-col gap-1 ${className ?? ""}`}>
            {label && <span className="text-sm font-medium text-gray-700">{label}</span>}

            <Select value={value} onValueChange={onChange}>
                <SelectTrigger 
                    hideIcon={hideIcon}
                    className="w-full border border-gray rounded-md"
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                <SelectGroup>
                    <SelectLabel>{ groupLabel }</SelectLabel>
                    {items.map((item, idx) => {
                        // Handle both string and object items
                        const label = typeof item === "string" ? item : item.label
                        const val = typeof item === "string" ? item : item.value

                        return (
                            <SelectItem key={idx} value={val}>
                                {label}
                            </SelectItem>
                        )
                    })}
                </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
