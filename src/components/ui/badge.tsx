import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

function OrderStatusBadge({ status, padding, className } : { 
  status: string, 
  padding?: string,
  className?: string;
}) {
  return(
    <div className={`text-[9px] h-fit w-fit px-2 py-0.5 rounded-sm font-semibold text-light ${className} ${padding} 
        ${status === "PENDING" && "bg-darkyellow"}
        ${status === "APPROVED" && "bg-darkgreen"}
        ${["TO FOLLOW", "TO_FOLLOW"].includes(status) && "bg-darkorange"}
        ${status === "CANCELLED" && "bg-darkred"}
        ${status === "REJECTED" && "bg-darkred"}
        ${status === "DELIVERED" && "bg-blue"}
    `}>
        { status }
    </div>
  );
}

function OrderStatusLabel({ status, textSize } : { status: string, textSize?: "" }) {
  return(
    <div className={`font-semibold ${textSize}`}>Status: <span 
        className={`
          ${status === "PENDING" && "text-darkyellow"}
          ${status === "APPROVED" && "text-darkgreen"}
          ${status === "TO FOLLOW" && "text-darkorange"}
          ${status === "REJECTED" && "text-darkred"}
          ${status === "CANCELLED" && "text-darkred"}
          ${status === "DELIVERED" && "text-blue"}
    `}>
            { status }
        </span>
    </div>
  );
}

function QuantityBadge({stock, className}: {stock: number, className?: string}) {
  return(
    <Tooltip>
      <TooltipTrigger>
        <Badge 
          className={`text-light ${className} ${stock === 0 ? "bg-darkred" : stock < 15 ? "bg-darkyellow" : "bg-darkgreen"}`}
        >
          { stock }
        </Badge>
      </TooltipTrigger>
      <TooltipContent>Your current stock</TooltipContent>
    </Tooltip>
    
  )
}


export { Badge, badgeVariants, OrderStatusBadge, OrderStatusLabel, QuantityBadge }
