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
  groupedItems?: { groupLabel: string; items: { label: string; value: string }[] }[]
  value: string
  onChange: (value: string) => void
  className?: string
  hideIcon?: boolean;
  triggerClassName?: string;
  labelClassName?: string;
}

export function AppSelect({
    label,
    groupLabel,
    placeholder = "Select an option",
    items,
    groupedItems,
    value,
    onChange,
    className,
    hideIcon = false,
    triggerClassName,
    labelClassName,
}: GenericSelectProps) {
  const hasGroupedItems = Array.isArray(groupedItems) && groupedItems.length > 0
  return (
        <div className={`flex flex-col gap-1 ${className ?? ""}`}>
            {label && <span className={`text-sm font-medium text-gray-700 ${labelClassName}`}>{label}</span>}

            <Select value={value} onValueChange={onChange}>
                <SelectTrigger 
                    hideIcon={hideIcon}
                    className={`w-full border border-gray rounded-md ${triggerClassName}`}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                    {hasGroupedItems ? (
                        groupedItems.map((group, groupIndex) => (
                            <SelectGroup key={`${group.groupLabel}-${groupIndex}`}>
                                <SelectLabel>{group.groupLabel}</SelectLabel>
                                {group.items.map((item, itemIndex) => (
                                    <SelectItem key={`${group.groupLabel}-${item.value}-${itemIndex}`} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        ))
                    ) : (
                        <SelectGroup>
                            <SelectLabel>{ groupLabel }</SelectLabel>
                            {items.map((item, idx) => {
                                const label = typeof item === "string" ? item : item.label
                                const val = typeof item === "string" ? item : item.value

                                return (
                                    <SelectItem key={idx} value={val}>
                                        {label}
                                    </SelectItem>
                                )
                            })}
                        </SelectGroup>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}
